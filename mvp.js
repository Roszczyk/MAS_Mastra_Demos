import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

const myAgent = new Agent({
  name: "My Agent",
  instructions: "You are a helpful assistant",
  model: openai("gpt-4o-mini"),
});

async function run() {
  const response = await myAgent.generate(
    [
      { role: "user", content: "Napisz jedno zdanie o sztucznej inteligencji." }
    ],
    {
      mode: "legacy"
    }
  );

  console.log("Odpowiedź agenta:");
  console.log(response.text);
}

run();
