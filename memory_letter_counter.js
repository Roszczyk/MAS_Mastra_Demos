import { createTool } from "@mastra/core/tools";
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

// DOESN'T WORK!!!!!!!!!!!
// https://mastra.ai/reference/storage/libsql

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
    "Your job is to give a random word in English language. Every time prompted, give only one word. \
      Never repeat a word that already appeared in the conversation. If you do, generate a different one. \
      Every time you generate a word, remember it using the memory. Later use the memory to not repeat the words",
  model: openai("gpt-4o-mini"),
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:./mastra.db",
    }),
  }), 
});

const counter = new Agent({
  name: "Letters Counter Agent",
  instructions:
    "Every time you get a word from the creative agent, use the tool to return the number of letters.",
  model: openai("gpt-4o-mini"),
  tools: { counterTool },
});

async function runConversation() {
  let previous = "";
  for (let i = 0; i < 3; i++) {
    const creativeReply = await creative.generate(
      [{ role: "user", content: `Say one word in English language.` }]
    );

    console.log("WORD:", creativeReply.text);
    previous = creativeReply.text;

    const counterReply = await counter.generate(
      [{ role: "user", content: creativeReply.text }]
    );

    console.log("COUNTER:", counterReply.text);
  }
}

runConversation();
