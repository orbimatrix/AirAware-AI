
'use server';

import { OpenAI } from "openai";
import { z } from "zod";
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define state for the form action
type HazardAgentState = {
  result: string | null;
  error: string | null;
};

// 1. Configure AIML (OpenAI-compatible client with custom baseURL)
const AIML_API_KEY = process.env.AIML_API_KEY;
const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const AIML_BASE_URL = "https://api.aimlapi.com/v1";

if (!AIML_API_KEY || !OWM_KEY) {
  console.error("Missing required API keys: AIML_API_KEY or NEXT_PUBLIC_OPENWEATHER_API_KEY");
}

const aimlClient = new OpenAI({
  apiKey: AIML_API_KEY,
  baseURL: AIML_BASE_URL,
});

// Base Tool class for type consistency
class Tool {
    name: string = '';
    description: string = '';
    schema: z.ZodObject<any> = z.object({});
    async _call(input: any): Promise<string> {
        throw new Error("Not implemented");
    }
}


// 2. NASA EONET tool
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

// 3. USGS Earthquakes tool
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

// 4. OpenWeatherMap tool
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

// Convert Tool instances to OpenAI 'functions' array
function toolsToFunctions(tools: Tool[]) {
  return tools.map(tool => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.schema),
    }
  }));
}

// Helper: call tool by name and JSON-parse the args
async function callToolByName(tools: Tool[], name: string, argsJson: string) {
  const tool = tools.find(t => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  let args;
  try {
    args = JSON.parse(argsJson ?? "{}");
  } catch (e) {
    args = {};
  }
  const result = await tool._call(args);
  return typeof result === "string" ? result : JSON.stringify(result);
}

// Core chat+function loop
async function runAgentWithFunctions(userQuery: string, tools: Tool[]) {
  const functions = toolsToFunctions(tools);

  // 1) Initial call
  const initialResp = await aimlClient.chat.completions.create({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages: [{ role: "user", content: userQuery }],
    tools: functions,
    tool_choice: "auto",
    temperature: 0.2,
    max_tokens: 800,
  });

  const message = initialResp.choices?.[0]?.message;

  // If model asked to call a tool
  if (message?.tool_calls) {
    const toolCall = message.tool_calls[0];
    const fnName = toolCall.function.name;
    const fnArgs = toolCall.function.arguments ?? "{}";

    const toolOutput = await callToolByName(tools, fnName, fnArgs);

    // Send function result back to model
    const followupResp = await aimlClient.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "user", content: userQuery },
        { role: "assistant", tool_calls: message.tool_calls, content: null },
        { role: "tool", tool_call_id: toolCall.id, name: fnName, content: toolOutput },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    return followupResp.choices?.[0]?.message?.content ?? JSON.stringify(followupResp);
  } else {
    // No function call — just return model content
    return message?.content ?? JSON.stringify(initialResp);
  }
}

// Server Action to invoke the agent
export async function getHazardInfo(
  prevState: HazardAgentState,
  formData: FormData
): Promise<HazardAgentState> {
    const query = formData.get('query') as string;
    
    if (!query) {
        return { result: null, error: "Please provide a location or query." };
    }

    if (!AIML_API_KEY) {
       return { result: null, error: "Server is missing required API keys for hazard detection." };
    }

    try {
        const tools: Tool[] = [new EonetTool(), new UsgsQuakesTool(), new OwmWeatherTool()];
        const finalResult = await runAgentWithFunctions(query, tools);

        return { result: finalResult, error: null };
    } catch (e: any) {
        console.error("Hazard agent invocation error:", e);
        return { result: null, error: e.message || "Failed to get hazard information from the AI agent." };
    }
}
