import { createTool } from "@mastra/core/tools";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

function countLetters(word) {
  return word.length;
}

export const counterTool = createTool({
  id: "count-letters",
  description: "Counts letters in a given word",
  inputSchema: z.object({
    word: z.string().describe("Given word"),
  }),
  outputSchema: z.number(),
  execute: async ({ context }) => {
    const { word } = context;
    console.log("[INFO] Using the tool to count letters");
    return countLetters(word);
  },
});

const creative = new Agent({
  name: "Creative Agent",
  instructions:
    "Your job is to give a random word in English language. Every time prompted, give only one word.",
  model: openai("gpt-4o-mini"),
});

const counter = new Agent({
  name: "Letters Counter Agent",
  instructions:
    "Every time you get a word from the creative agent, use the tool to return the number of letters.",
  model: openai("gpt-4o-mini"),
  tools: { counterTool }, 
});

async function runConversation() {
    let words = "";
    for (let i = 0; i < 3; i++) {
        const creativeReply = await creative.generate(
        [{ role: "user", content: `Say one word in English language other than ${words}` }],
        { mode: "legacy" }
        );

        console.log("WORD:", creativeReply.text);
        words = `${words} ${creativeReply.text}`

        const counterReply = await counter.generate(
        [{ role: "user", content: creativeReply.text }],
        { mode: "legacy" }
        );

        console.log("COUNTER:", counterReply.text);
    }
}

runConversation();
