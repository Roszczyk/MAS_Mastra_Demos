import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

const programmer = new Agent({
  name: "Programmer",
  instructions: "You are a begginer programmer programming in C",
  model: openai("gpt-4o-mini"),
});

const tester = new Agent({
  name: "QA Engineer",
  instructions: "You are a QA Engineer. Spot possible improvements in the given code",
  model: openai("gpt-4o-mini"),
});

async function runConversation() {
  let message = "Write a function in C language";

  for (let i = 0; i < 3; i++) {

    const programmerReply = await programmer.generate(
        [{ role: "user", content: message }],
        { mode: "legacy" }
        );

    console.log("\n\nPROGRAMMER:\n", programmerReply.text);

    const testerReply = await tester.generate(
      [{ role: "user", content: programmerReply.text }],
      { mode: "legacy" }
    );

    console.log("\n\nTESTER:\n", testerReply.text);

    message = testerReply.text;
  }
}

runConversation();
