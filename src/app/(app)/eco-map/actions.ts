
"use server";
import { OpenAI } from "openai";

// -------------------- Inline tool implementations --------------------
class EonetTool {
  name = "eonet_events";
  description = "Get recent natural events from NASA EONET. Input: { days?: number, source?: string }";
  async _call(input: any) {
    const days = (input?.days ?? 7);
    const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events");
    url.searchParams.set("days", String(days));
    if (input?.source) url.searchParams.set("source", input.source);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`EONET fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
  }
}

class UsgsQuakesTool {
  name = "usgs_earthquakes";
  description = "Get recent earthquakes from USGS (last hour). No input needed.";
  async _call(_: any) {
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`USGS fetch failed: ${res.status} ${res.statusText}`);
    return await res.json();
  }
}

class OwmWeatherTool {
  name = "openweathermap_weather_and_air_quality";
  description = "Get current weather + air quality for lat/lon. Input: { lat: number, lon: number }";
  OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  async _call(input: any) {
    if (!this.OWM_KEY) throw new Error("OpenWeather API key missing");
    const { lat, lon } = input;
    if (typeof lat !== "number" || typeof lon !== "number") throw new Error("lat and lon numeric required");
    const wurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.OWM_KEY}&units=metric`;
    const aurl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${this.OWM_KEY}`;
    const [wRes, aRes] = await Promise.all([fetch(wurl), fetch(aurl)]);
    if (!wRes.ok) throw new Error(`OWM weather failed: ${wRes.status}`);
    if (!aRes.ok) throw new Error(`OWM air failed: ${aRes.status}`);
    const weather = await wRes.json();
    const air = await aRes.json();
    return { weather, air };
  }
}

// -------------------- Agent runner (robust) --------------------
const AIML_API_KEY = process.env.AIML_API_KEY;
const AIML_BASE_URL = "https://api.aimlapi.com/v1";
if (!AIML_API_KEY) console.warn("AIML_API_KEY not set in env");

const aimlClient = new OpenAI({ apiKey: AIML_API_KEY, baseURL: AIML_BASE_URL });

// Tools instances
const tools = [new EonetTool(), new UsgsQuakesTool(), new OwmWeatherTool()];

// Convert tools to minimal OpenAI functions metadata (no parameters) — avoids schema problems while debugging
function functionsMinimal(toolsList: any[]) {
  return toolsList.map((t) => ({ name: t.name, description: t.description }));
}

// Very defensive extractor for "message" / function call
function extractMessageObjectFromChoice(choice: any) {
  // choice may contain .message or .delta or other shapes
  return choice?.message ?? choice?.delta ?? null;
}

// Try to find a function-call-like object from the message object
function findFunctionCallCandidate(msgObj: any) {
  if (!msgObj || typeof msgObj !== "object") return null;
  const candidates = [
    msgObj.function_call,
    msgObj.function,
    msgObj.fn,
    msgObj.functionCall,
    msgObj.function_call_raw,
    msgObj.call,
  ];
  for (const c of candidates) if (c) return c;
  // fallback: look for any key containing "function" or "fn"
  for (const k of Object.keys(msgObj)) {
    if (/function|fn/i.test(k)) {
      const v = (msgObj as any)[k];
      if (v && typeof v === "object") return v;
    }
  }
  return null;
}

async function callToolByName(name: string, argsRaw: any) {
  const tool = tools.find(t => t.name === name);
  if (!tool) throw new Error(`Unknown tool requested: ${name}`);
  // parse argsRaw: accept object, stringified JSON, or fallback to {}
  let parsedArgs = {};
  if (!argsRaw) parsedArgs = {};
  else if (typeof argsRaw === "object") parsedArgs = argsRaw;
  else if (typeof argsRaw === "string") {
    try { parsedArgs = JSON.parse(argsRaw); } catch { parsedArgs = { raw: argsRaw }; }
  } else parsedArgs = { raw: argsRaw };
  const out = await tool._call(parsedArgs);
  return (typeof out === "string") ? out : JSON.stringify(out);
}

// core run (returns text)
export async function runHazardAgent(userQuery: string) {
  // minimal functions metadata
  const functions = functionsMinimal(tools);

  // initial request
  let initialResp;
  try {
    initialResp = await aimlClient.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: userQuery }],
      functions,
      function_call: "auto",
      temperature: 0.2,
      max_tokens: 700,
    });
  } catch (err: any) {
    // bubble helpful debug
    console.error("Initial AIML request failed:", err?.message ?? err);
    if (err?.response) {
      try { const body = await err.response.text(); console.error("AIML error body:", body); } catch {}
    }
    throw err;
  }

  // Defensive inspection: log minimal truncated shape for debugging
  const safeLog = JSON.stringify(initialResp?.choices?.[0]?.message ?? initialResp?.choices?.[0] ?? initialResp, (_k, v) => v, 2);
  console.debug("MODEL_RAW (truncated):", safeLog.slice(0, 2000));

  const choice = initialResp?.choices?.[0] ?? null;
  if (!choice) return `No choices returned by model. Raw response: ${JSON.stringify(initialResp).slice(0,2000)}`;

  const msgObj = extractMessageObjectFromChoice(choice);
  // model content text variants
  const contentText = msgObj?.content ?? msgObj?.text ?? choice?.text ?? choice?.message?.content ?? null;

  // find function call candidate robustly
  const fnCall = findFunctionCallCandidate(msgObj ?? choice);
  if (!fnCall) {
    // no function call — return the content if present, otherwise the raw choice
    if (contentText) return String(contentText);
    return `Model did not request a function call. Raw choice: ${JSON.stringify(choice).slice(0,1500)}`;
  }

  // extract name and args (robust)
  const fnName = fnCall?.name ?? fnCall?.function_name ?? fnCall?.fnName ?? fnCall?.fn ?? fnCall?.function ?? null;
  const rawArgs = fnCall?.arguments ?? fnCall?.args ?? fnCall?.arguments_json ?? fnCall?.body ?? null;

  if (!fnName) {
    return `Model returned a function-like object but no function name. fnCall: ${JSON.stringify(fnCall).slice(0,800)}`;
  }

  // Call the tool
  let toolOutput: string;
  try {
    toolOutput = await callToolByName(fnName, rawArgs);
  } catch (err: any) {
    console.error("Tool call failed:", err);
    return `Tool ${fnName} failed: ${err?.message ?? String(err)}`;
  }

  // Send tool output back to model to get final answer
  let followup;
  try {
    followup = await aimlClient.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "user", content: userQuery },
        { role: "function", name: fnName, content: toolOutput },
      ],
      temperature: 0.2,
      max_tokens: 700,
    });
  } catch (err: any) {
    console.error("AIML follow-up failed:", err?.message ?? err);
    if (err?.response) {
      try { const body = await err.response.text(); console.error("AIML followup body:", body); } catch {}
    }
    throw err;
  }

  const finalChoice = followup?.choices?.[0] ?? null;
  const finalMsg = finalChoice?.message ?? finalChoice ?? null;
  const finalText = finalMsg?.content ?? finalMsg?.text ?? (finalChoice && typeof finalChoice === "string" ? finalChoice : null);

  return finalText ?? `No textual final message. Raw followup: ${JSON.stringify(followup).slice(0,2000)}`;
}

// -------------------- Exported Server Action equivalent --------------------
export async function getHazardInfo(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  if (!query) return { result: null, error: "Provide a query" };
  try {
    const out = await runHazardAgent(query);
    return { result: out, error: null };
  } catch (err: any) {
    console.error("Final getHazardInfo error:", err?.message ?? err);
    return { result: null, error: err?.message ?? "Unknown error" };
  }
}
