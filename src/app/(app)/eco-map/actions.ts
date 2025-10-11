
'use server';

import { MemorySaver } from '@langchain/langgraph';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { Tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, END } from "@langchain/langgraph";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define state for the form action
type HazardAgentState = {
  result: string | null;
  error: string | null;
};

// 1. Configure AIML client via ChatOpenAI
const AIML_API_KEY = process.env.AIML_API_KEY;
const OWM_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

if (!AIML_API_KEY || !OWM_KEY) {
  console.error("Missing required API keys: AIML_API_KEY or NEXT_PUBLIC_OPENWEATHER_API_KEY");
}

const llm = new ChatOpenAI({
  apiKey: AIML_API_KEY,
  baseURL: "https://api.aimlapi.com/v1",
  model: "mistralai/Mistral-7B-Instruct-v0.2",
  temperature: 0.2,
  maxTokens: 600,
});

// 2. NASA EONET tool
class EonetTool extends Tool {
    name = "eonet_events";
    description = "Get recent natural events from NASA EONET. Input should be a JSON string with 'days' and optional 'category'. Example: {\"days\": 7, \"category\": \"wildfires\"}";
    
    // Zod schema for input validation
    schema = z.object({
        days: z.number().optional().describe("Number of past days to fetch events for."),
        category: z.string().optional().describe("Category of events (e.g., 'wildfires', 'severeStorms').")
    });

    async _call(input: z.infer<this['schema']>) {
        try {
            const url = new URL("https://eonet.gsfc.nasa.gov/api/v3/events");
            if (input.days) url.searchParams.set("days", String(input.days));
            if (input.category) url.searchParams.set("category", input.category);
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
    
    schema = z.object({}); // No input needed

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
            if (isNaN(Number(lat)) || isNaN(Number(lon))) {
                return "Invalid input. Please provide latitude and longitude.";
            }
            const wurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
            const aurl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`;
            const [w, a] = await Promise.all([fetch(wurl).then(r => r.json()), fetch(aurl).then(r => r.json())]);
            return JSON.stringify({ weather: w, air: a });
        } catch (e: any) {
            return `Error in OwmWeatherTool: ${e.message}`;
        }
    }
}

// 5. Create the agent
const agentCheckpointer = new MemorySaver();
const tools: Tool[] = [new EonetTool(), new UsgsQuakesTool(), new OwmWeatherTool()];
const toolExecutor = new ToolExecutor({ tools });

const agentState = {
    messages: {
        value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
        default: () => [],
    },
};

const agentWithTools = llm.bind({
    tools: tools.map(tool => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: zodToJsonSchema(tool.schema),
        },
    })),
});


const agentNode = async (state: { messages: BaseMessage[] }) => {
    const result = await agentWithTools.invoke(state.messages);
    return { messages: [result] };
};

const toolNode = async (state: { messages: BaseMessage[] }) => {
    const result = await toolExecutor.invoke(state.messages[state.messages.length - 1]);
    return {
        messages: [result],
    };
};

function shouldContinue(state: { messages: BaseMessage[] }) {
    const { tool_calls } = state.messages[state.messages.length - 1].additional_kwargs;
    if (tool_calls?.length) {
        return "tools";
    }
    return END;
}

const workflow = new StateGraph({
    channels: agentState,
});

workflow.addNode("agent", agentNode);
workflow.addNode("tools", toolNode);

workflow.setEntryPoint("agent");

workflow.addConditionalEdges("agent", shouldContinue);

workflow.addEdge("tools", "agent");

const agentExecutor = workflow.compile({ checkpointer: agentCheckpointer });

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
        const finalState = await agentExecutor.invoke(
            { messages: [new HumanMessage(query)] },
            { configurable: { thread_id: threadId } }
        );

        // Get the last message from the agent
        const lastMessage = finalState.messages[finalState.messages.length - 1];
        
        let content: string;
        if (typeof lastMessage.content === 'string') {
            content = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
            // If content is an array (potentially with text and other parts), find the text part.
            const textPart = lastMessage.content.find(part => typeof part === 'string' || (typeof part === 'object' && part.type === 'text'));
            content = textPart ? (typeof textPart === 'string' ? textPart : (textPart as any).text) : JSON.stringify(lastMessage.content);
        } else {
            content = JSON.stringify(lastMessage.content);
        }

        return { result: content, error: null };
    } catch (e: any) {
        console.error("Hazard agent invocation error:", e);
        return { result: null, error: e.message || "Failed to get hazard information from the AI agent." };
    }
}
