'use server';

import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage } from '@langchain/core/messages';
import { Tool } from 'langchain/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { OpenAI } from 'openai';

// Define state for the form action
type HazardAgentState = {
  result: string | null;
  error: string | null;
};

// 1. Configure AIML client
const AIML_API_KEY = process.env.AIML_API_KEY;
const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

if (!AIML_API_KEY || !OWM_KEY) {
  console.error("Missing required API keys: AIML_API_KEY or NEXT_PUBLIC_OPENWEATHER_API_KEY");
}

const aimlClient = new OpenAI({
  apiKey: AIML_API_KEY,
  baseURL: 'https://api.aimlapi.com/v1',
});

// Wrapper LLM for LangChain agent compatibility
class AimlLLM {
  async call(messages: { role: string; content: string }[]) {
    if (!AIML_API_KEY) throw new Error("AIML_API_KEY is not configured.");
    const completion = await aimlClient.chat.completions.create({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: messages.filter(m => m.content), // Filter out empty messages
      temperature: 0.2,
      max_tokens: 600,
    });
    return completion.choices[0].message.content;
  }
}

// 2. NASA EONET tool
class EonetTool extends Tool {
    name = "eonet_events";
    description = "Get recent natural events from NASA EONET. Input should be a JSON string with 'days' and optional 'category' or 'country'. Example: {'days': 7, 'category': 'wildfires'}";

    async _call(input: string) {
        try {
            const params = JSON.parse(input);
            const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events");
            if (params.days) url.searchParams.set("days", String(params.days));
            if (params.category) url.searchParams.set("category", params.category);
            const res = await fetch(url.toString());
            return JSON.stringify(await res.json());
        } catch (e: any) {
            return `Error fetching EONET events: ${e.message}`;
        }
    }
}

// 3. USGS Earthquakes tool
class UsgsQuakesTool extends Tool {
    name = "usgs_earthquakes";
    description = "Get recent earthquakes from USGS. Fetches all quakes from the last hour.";

    async _call() {
        try {
            const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
            const res = await fetch(url);
            return JSON.stringify(await res.json());
        } catch (e: any) {
            return `Error fetching USGS earthquakes: ${e.message}`;
        }
    }
}


// 4. OpenWeatherMap tool
class OwmWeatherTool extends Tool {
    name = "openweathermap_weather_air";
    description = "Get current weather and air quality from OpenWeatherMap for a given latitude and longitude. Input must be a string 'lat,lon'. Example: '24.8607,67.0011'";

    async _call(input: string) {
         if (!OWM_KEY) throw new Error("OPENWEATHERMAP_API_KEY is not configured.");
        try {
            const [lat, lon] = input.split(",").map(Number);
            const wurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
            const aurl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`;
            const [w, a] = await Promise.all([fetch(wurl).then(r => r.json()), fetch(aurl).then(r => r.json())]);
            return JSON.stringify({ weather: w, air: a });
        } catch (e: any) {
            return `Error fetching OpenWeatherMap data: ${e.message}`;
        }
    }
}

// 5. Create the agent
const agentCheckpointer = new MemorySaver();
const aimlLlm = new AimlLLM();

const agent = createReactAgent({
  llm: {
    call: async (input: { messages: { role: string; content: string }[] }) => {
        const content = await aimlLlm.call(input.messages);
        return { text: content ?? "" }; // Ensure content is not null
    },
  } as any,
  tools: [new EonetTool(), new UsgsQuakesTool(), new OwmWeatherTool()],
  checkpointSaver: agentCheckpointer,
});


// Server Action to invoke the agent
export async function getHazardInfo(
  prevState: HazardAgentState,
  formData: FormData
): Promise<HazardAgentState> {
    const query = formData.get('query') as string;
    
    if (!query) {
        return { result: null, error: "Please provide a location or query." };
    }

    if (!AIML_API_KEY || !OWM_KEY) {
       return { result: null, error: "Server is missing required API keys for hazard detection." };
    }

    try {
        const threadId = `hazards-thread-${Date.now()}`;
        const finalState = await agent.invoke(
            { messages: [new HumanMessage(query)] },
            { configurable: { thread_id: threadId } }
        );

        // Get the last message from the agent
        const lastMessage = finalState.messages[finalState.messages.length - 1];
        const content = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);

        return { result: content, error: null };
    } catch (e: any) {
        console.error("Hazard agent invocation error:", e);
        return { result: null, error: e.message || "Failed to get hazard information from the AI agent." };
    }
}
