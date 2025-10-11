
'use server';

import { OpenAI } from "openai";
import { z } from "zod";
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define state for the form action
type HazardAgentState = {
  result: string | null;
  error: string | null;
};

// --- Tool Definitions ---

class Tool {
    name: string = '';
    description: string = '';
    schema: z.ZodObject<any> = z.object({});
    async _call(input: any): Promise<string> {
        throw new Error("Not implemented");
    }
}

class EonetTool extends Tool {
    name = "eonet_events";
    description = "Get recent natural events from NASA EONET, especially for wildfires. Input should be a JSON object with 'days' and 'source' (e.g., 'VIIRS_SNPP_NRT' for wildfires).";
    
    schema = z.object({
        days: z.number().optional().default(7).describe("Number of past days to fetch events for."),
        source: z.string().optional().describe("The source of the events (e.g., 'VIIRS_SNPP_NRT' for wildfires).")
    });

    async _call(input: z.infer<this['schema']>) {
        try {
            const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events");
            url.searchParams.set("days", String(input.days));
            if (input.source) {
                url.searchParams.set("source", input.source);
            }
            
            const res = await fetch(url.toString());
            if (!res.ok) return `Error fetching EONET data: ${res.statusText}`;
            return JSON.stringify(await res.json());
        } catch (e: any) {
            return `Error in EonetTool: ${e.message}`;
        }
    }
}

class UsgsQuakesTool extends Tool {
    name = "usgs_earthquakes";
    description = "Get recent earthquakes from USGS. Fetches all quakes from the last hour by default.";
    
    schema = z.object({});

    async _call() {
        try {
            const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
            const res = await fetch(url);
            if (!res.ok) return `Error fetching USGS data: ${res.statusText}`;
            return JSON.stringify(await res.json());
        } catch (e: any) {
            return `Error in UsgsQuakesTool: ${e.message}`;
        }
    }
}

class OwmWeatherTool extends Tool {
    name = "openweathermap_weather_and_air_quality";
    description = "Get current weather and air quality from OpenWeatherMap for a given latitude and longitude.";
    
    schema = z.object({
        lat: z.number().describe("Latitude"),
        lon: z.number().describe("Longitude"),
    })

    async _call(input: z.infer<this['schema']>) {
         if (!OWM_KEY) throw new Error("OPENWEATHERMAP_API_KEY is not configured.");
        try {
            const { lat, lon } = input;
            const wurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
            const aurl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`;
            const [w, a] = await Promise.all([fetch(wurl).then(r => r.json()), fetch(aurl).then(r => r.json())]);
            return JSON.stringify({ weather: w, air: a });
        } catch (e: any) {
            return `Error in OwmWeatherTool: ${e.message}`;
        }
    }
}


// --- Agent Implementation ---

const AIML_API_KEY = process.env.AIML_API_KEY;
const AIML_BASE_URL = "https://api.aimlapi.com/v1";
const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

if (!AIML_API_KEY) {
  console.error("AIML_API_KEY not set (for AIML provider).");
}
if (!OWM_KEY) {
  console.error("NEXT_PUBLIC_OPENWEATHER_API_KEY not set.");
}

const aimlClient = new OpenAI({
  apiKey: AIML_API_KEY,
  baseURL: AIML_BASE_URL,
});

const tools = [new EonetTool(), new UsgsQuakesTool(), new OwmWeatherTool()];

function toolsToFunctions(toolsList: any[]) {
  return toolsList.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.schema),
    }
  }));
}

async function callToolByName(toolsList: any[], name: string, argsJson: string | undefined) {
  const tool = toolsList.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown tool requested by model: ${name}`);

  let parsedArgs = {};
  if (typeof argsJson === "string") {
    try {
      parsedArgs = JSON.parse(argsJson);
    } catch (e) {
      parsedArgs = { raw: argsJson };
    }
  }
  
  const out = await tool._call(parsedArgs);
  return typeof out === "string" ? out : JSON.stringify(out);
}

async function runAgentWithFunctions(userQuery: string) {
  const functions = toolsToFunctions(tools);

  let initialResp;
  try {
    initialResp = await aimlClient.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: userQuery }],
      tools: functions,
      tool_choice: "auto",
      temperature: 0.2,
      max_tokens: 800,
    });
  } catch (err: any) {
    console.error("AIML initial call failed:", err?.message ?? err);
    if (err?.response) {
      try {
        const body = await err.response.text();
        console.error("AIML error response body:", body);
      } catch {}
    }
    throw err;
  }

  const message = initialResp?.choices?.[0]?.message;

  if (message?.tool_calls) {
    const toolCall = message.tool_calls[0];
    const fnName = toolCall.function.name;
    const fnArgs = toolCall.function.arguments ?? "{}";

    const toolOutput = await callToolByName(tools, fnName, fnArgs);
    
    let followupResp;
    try {
      followupResp = await aimlClient.chat.completions.create({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          { role: "user", content: userQuery },
          { role: "assistant", content: null, tool_calls: message.tool_calls },
          { role: "tool", tool_call_id: toolCall.id, name: fnName, content: toolOutput },
        ],
        temperature: 0.2,
        max_tokens: 800,
      });
    } catch (err: any) {
      console.error("AIML followup call failed:", err?.message ?? err);
      if (err?.response) {
        try {
          const body = await err.response.text();
          console.error("AIML followup error body:", body);
        } catch {}
      }
      throw err;
    }

    return followupResp?.choices?.[0]?.message?.content ?? JSON.stringify(followupResp);
  } else {
    return message?.content ?? JSON.stringify(initialResp);
  }
}

export async function getHazardInfo(prevState: HazardAgentState, formData: FormData): Promise<HazardAgentState> {
  const query = formData.get("query") as string;
  if (!query) return { result: null, error: "Please provide a location or query." };
  if (!AIML_API_KEY || !OWM_KEY) return { result: null, error: "Server is missing required API keys." };

  try {
    const answer = await runAgentWithFunctions(query);
    return { result: answer, error: null };
  } catch (e: any) {
    console.error("Hazard agent invocation error (final):", e?.message ?? e);
    return { result: null, error: e?.message ?? "Failed to get hazard information." };
  }
}
