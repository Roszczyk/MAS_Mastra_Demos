import { createTool } from "@mastra/core/tools";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

async function acquireWeather(city) {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

    const response = await fetch(url);
    const data = await response.json();

    return {
        city: city,
        temperature: Number(data.current_condition[0].temp_C),
        description: data.current_condition[0].weatherDesc[0].value,
    };
}

export const weatherTool = createTool({
    id: "get-weather",
    description: "Gets current weather for a given city",
    inputSchema: z.object({
        city: z.string().describe("City name"),
    }),
    outputSchema: z.object({
        city: z.string(),
        temperature: z.number(),
        description: z.string(),
    }),
    execute: async ({ context }) => {
        const { city } = context;
        console.log("[INFO] Fetching weather for:", city);
        return await acquireWeather(city);
    },
});

const creative = new Agent({
  name: "Creative Agent",
  instructions:
    "Your job is to give a random city in the world. Every time prompted, give only one city name.",
  model: openai("gpt-4o-mini"),
});

const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions:
    "Every time you receive a city name, use the tool to return the current weather.",
  model: openai("gpt-4o-mini"),
  tools: { weatherTool },
});

async function runConversation() {
    let cities = "";
    for (let i = 0; i < 3; i++) {
        const creativeReply = await creative.generate(
        [{ role: "user", content: `Say the name of one random city other than ${cities}` }],
        { mode: "legacy" }
        );

        console.log("CITY:", creativeReply.text);
        cities = `${cities} ${creativeReply.text}`

        const weatherReply = await weatherAgent.generate(
        [{ role: "user", content: creativeReply.text }],
        { mode: "legacy" }
        );

        console.log("WEATHER:", weatherReply.text);
    }
}


runConversation();
