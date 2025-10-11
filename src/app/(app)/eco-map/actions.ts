
"use server";
import { OpenAI } from "openai";

// --- Add/replace this section in your file (server-side) ---
const TAVILY_KEY = process.env.TAVILY_API_KEY;
const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

/** Helper: detect lat,lon string "lat,lon" */
function parseLatLon(q: string) {
  const m = q.trim().match(/^\s*([+-]?\d+(\.\d+)?)\s*,\s*([+-]?\d+(\.\d+)?)\s*$/);
  if (!m) return null;
  return { lat: Number(m[1]), lon: Number(m[3]) };
}

/** Query Tavily REST search endpoint robustly and try to extract a short answer.
 *  Returns { ok: true, source: 'tavily', text, raw, tempC?: number } or { ok: false, error }
 */
async function queryTavilyRaw(query: string) {
  if (!TAVILY_KEY) return { ok: false, error: "TAVILY_API_KEY not set" };

  const url = "https://api.tavily.com/search";
  const body = {
    query,
    include_answer: true,
    include_raw_content: true,
    max_results: 4,
    search_depth: "basic",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TAVILY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let txt = "";
      try { txt = await res.text(); } catch {}
      return { ok: false, error: `Tavily HTTP ${res.status} ${res.statusText} ${txt ? `| ${txt.slice(0,500)}` : ""}` };
    }

    const j = await res.json();

    // Defensive parsing: check likely answer places
    const possibleAnswers: string[] = [];
    if (j?.answer) possibleAnswers.push(String(j.answer));
    if (j?.data?.answer) possibleAnswers.push(String(j.data.answer));
    if (Array.isArray(j?.results)) {
      for (const r of j.results.slice(0,4)) {
        if (r?.answer) possibleAnswers.push(String(r.answer));
        if (r?.snippet) possibleAnswers.push(String(r.snippet));
        if (r?.text) possibleAnswers.push(String(r.text));
        if (r?.title) possibleAnswers.push(String(r.title));
      }
    }
    if (j?.items && Array.isArray(j.items)) {
      for (const i of j.items.slice(0,4)) {
        if (i?.snippet) possibleAnswers.push(String(i.snippet));
      }
    }

    // pick first non-empty
    const answer = possibleAnswers.find(a => !!a && String(a).trim().length > 0);

    // try to detect a temperature in the answer using regex
    const tempRegex = /(-?\d{1,3}(?:\.\d+)?)\s*°?\s*(C|F|c|f)|(-?\d{1,3}(?:\.\d+)?)\s*(degrees?)(\s*(C|F|c|f))?/i;
    let detectedTempC: number | undefined = undefined;
    if (answer) {
      const m = answer.match(tempRegex);
      if (m) {
        // find number and unit
        const num = Number(m[1] ?? m[3]);
        const unit = (m[2] ?? m[6] ?? "C").toUpperCase();
        if (!Number.isNaN(num)) {
          detectedTempC = unit.startsWith("F") ? Math.round(((num - 32) * 5) / 9 * 10) / 10 : Math.round(num * 10) / 10;
        }
      }
    }

    return { ok: true, source: "tavily", text: answer ?? null, raw: j, tempC: detectedTempC ?? null };
  } catch (err: any) {
    return { ok: false, error: `Tavily fetch error: ${err?.message ?? String(err)}` };
  }
}

/** Query OpenWeatherMap current weather (by q=city or lat/lon). Returns Celsius temp & raw response. */
async function queryOpenWeather(query: string) {
  if (!OWM_KEY) return { ok: false, error: "OpenWeatherMap key missing" };

  try {
    const ll = parseLatLon(query);
    let url;
    if (ll) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${ll.lat}&lon=${ll.lon}&appid=${OWM_KEY}&units=metric`;
    } else {
      // use q=city name (works with "Karachi" or "Karachi,PK")
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&appid=${OWM_KEY}&units=metric`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text().catch(()=>"");
      return { ok: false, error: `OWM ${res.status} ${res.statusText} | ${txt}` };
    }
    const j = await res.json();
    const tempC = j?.main?.temp ?? null;
    const desc = j?.weather?.[0]?.description ?? null;
    return { ok: true, source: "openweathermap", tempC, description: desc, raw: j };
  } catch (err: any) {
    return { ok: false, error: `OWM fetch error: ${err?.message ?? String(err)}` };
  }
}

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

/** Replacement getHazardInfo: pre-query Tavily then fallback to OWM, then to LLM */
export async function getHazardInfo(prevState: any, formData: FormData) {
  const query = (formData.get("query") || "").toString().trim();
  if (!query) return { result: null, error: "Provide a query" };

  // 1) Try Tavily for a direct factual answer
  try {
    const tav = await queryTavilyRaw(query);
    if (tav.ok) {
      // If Tavily gave a temp, return it immediately
      if (tav.tempC !== null && tav.tempC !== undefined) {
        const payload = {
          query,
          timestamp: new Date().toISOString(),
          source: tav.source,
          answer: tav.text,
          tempC: tav.tempC,
          raw: tav.raw,
        };
        return { result: JSON.stringify(payload, null, 2), error: null };
      }

      // If Tavily returned a concise answer that looks like a factual snippet, return it
      if (tav.text && tav.text.length < 800) {
        const payload = { query, timestamp: new Date().toISOString(), source: tav.source, answer: tav.text, raw: tav.raw };
        return { result: JSON.stringify(payload, null, 2), error: null };
      }

      // Otherwise fall through to OWM (we still keep the tavily raw in debug)
    } else {
      // Tavily returned error; log and continue to OWM
      console.warn("Tavily error:", tav.error);
    }
  } catch (err: any) {
    console.warn("Tavily unexpected error:", err?.message ?? err);
  }

  // 2) Try OpenWeatherMap (most reliable numeric temp)
  try {
    const owm = await queryOpenWeather(query);
    if (owm.ok && owm.tempC !== null && owm.tempC !== undefined) {
      const payload = {
        query,
        timestamp: new Date().toISOString(),
        source: owm.source,
        tempC: owm.tempC,
        description: owm.description,
        raw: owm.raw,
      };
      return { result: JSON.stringify(payload, null, 2), error: null };
    } else {
      console.warn("OpenWeatherMap fallback failed:", owm.error);
    }
  } catch (err: any) {
    console.warn("OWM unexpected error:", err?.message ?? err);
  }

  // 3) Last resort: call your LLM runner (broader hazard summary, not guaranteed real-time)
  try {
    const out = await runHazardAgent(query); // reuses your robust agent runner in the same file
    const payload = { query, timestamp: new Date().toISOString(), source: "aiml_agent", answer: out };
    return { result: JSON.stringify(payload, null, 2), error: null };
  } catch (err: any) {
    console.error("Final LLM fallback error:", err?.message ?? err);
    return { result: null, error: err?.message ?? "Unknown error" };
  }
}
