import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

// DOESN'T WORK!!!!!!!!!!!

const sharedMemory = new Memory({
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
});

const profiler = new Agent({
  name: "Profile Agent",
  instructions: `
You talk with the user and extract personal facts.
If the user mentions:
- their name
- their city
- their favorite hobby

You should remember this information for future conversations.
Confirm briefly what you saved.
`,
  model: openai("gpt-4o-mini"),
  memory: sharedMemory,
});

const greeter = new Agent({
  name: "Greeter Agent",
  instructions: `
You greet the user using any stored personal information.
If you know their name, use it.
If you know their city or hobby, mention it naturally.
If you know nothing yet, ask for their name.
`,
  model: openai("gpt-4o-mini"),
  memory: sharedMemory,
});


async function runConversation() {
  console.log("\n--- SESSION 1: USER INTRODUCES THEMSELVES ---\n");

  await profiler.generate([
    { role: "user", content: "Hi! My name is Alex." },
  ]);

  await profiler.generate([
    { role: "user", content: "I live in Warsaw and I love triathlon." },
  ]);

  console.log("\n--- SESSION 2: GREETING USING MEMORY ---\n");

  const greeting = await greeter.generate([
    { role: "user", content: "Hello again!" },
  ]);

  console.log("GREETER:", greeting.text);
}

runConversation();
