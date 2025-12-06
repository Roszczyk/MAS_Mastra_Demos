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

export const creativeAgentTool = createTool({
  id: "creative-letters-agent",
  description: "Conversation with the agent creative, generating the word.",
  execute: async ({ context }) => {
    return await creative.generate(
        [{ role: "user", content: "generate the word" }],
        { mode: "legacy" }
        );
  },
});

const counter = new Agent({
  name: "Letters Counter Agent",
  instructions:
    "Every time you get a word from the creative agent, use the tool to return the number of letters.",
  model: openai("gpt-4o-mini"),
  tools: { counterTool }, 
});

export const counterAgentTool = createTool({
  id: "count-letters-agent",
  description: "Conversation with the agent counter.",
  execute: async ({ context }) => {
    const { word } = context;
    return await counter.generate(
        [{ role: "user", content: word }],
        { mode: "legacy" }
        );
  },
});


const supervisor = new Agent({
    name : "supervisor", 
    instructions: "When prompted ask creative agent to generate a word and later take this word \
     and pass to the counter agent. Return the answer containing both - the word and the count. ",
  model: openai("gpt-4o-mini"),
  tools: { counterTool }, 
})

async function runConversation() {
    const supervisorReply = await supervisor.generate(
        [{ role: "user", content: `Do it.` }],
        { mode: "legacy" }
    );
    console.log("SUPERVISOR: ", supervisorReply.text);
}

runConversation();
