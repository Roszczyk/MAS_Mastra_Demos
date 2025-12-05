import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

const pizza_enjoyer = new Agent({
  name: "Pizza Enjoyer",
  instructions: "You want to have pizza for dinner. You need to convince your friend to have pizza, not chicken.",
  model: openai("gpt-4o-mini"),
});

const chicken_enjoyer = new Agent({
  name: "Chicken Enjoyer",
  instructions: "You want to have chicken for dinner. You need to convince your friend to have chicken, not pizza.",
  model: openai("gpt-4o-mini"),
});

const decider = new Agent({
  name: "Decider",
  instructions: "Your friends are choosing between pizza and chicken for dinner. Decide for them.",
  model: openai("gpt-4o-mini"),
});

async function runConversation() {
  let message = "What would you like to have for dinner today?";
  let pizzaReply, chickenReply;

  for (let i = 0; i < 2; i++) {
    console.log(`\n--- ROUND ${i + 1} ---`);

    pizzaReply = await pizza_enjoyer.generate(
        [{ role: "user", content: message }],
        { mode: "legacy" }
        );

    console.log("\n\nPIZZA:\n", pizzaReply.text);

    chickenReply = await chicken_enjoyer.generate(
      [{ role: "user", content: pizzaReply.text }],
      { mode: "legacy" }
    );

    console.log("\n\nCHICKEN:\n", chickenReply.text);

    message = chickenReply.text;
  }

  message = `Pizza enjoyer said "${pizzaReply.text}", Chicken enjoyer said ${chickenReply.text}`

    const deciderReply = await decider.generate(
      [{ role: "user", content: message }],
      { mode: "legacy" }
    );
    console.log("\n\nDECIDER:\n", deciderReply.text);
}

runConversation();
