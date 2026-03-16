import "dotenv/config"
import { ChatMistralAI } from "@langchain/mistralai"
import readline from "readline/promises";
import { HumanMessage, tool, createAgent } from "langchain";
import chalk from "chalk";
import * as z from "zod";
import { sendEmail } from "./mail.service.js";
import { tavilySearch } from "./tavily.service.js"
// import { tavily } from "@tavily/core";


const emailTool = tool(
  sendEmail,
  {
    name: "emailTool",
    description: "Use this tool to send an email.",
    schema: z.object({
      to: z.string().describe("The recipient's email address"),
      subject: z.string().describe("The subject of the email"),
      html: z.string().describe("The HTML content of the email"),
    })
  }
)
const tavilyTool = tool(
  tavilySearch, {
  name: "tavilySearch",
  description: "Search the internet for current information and return results",
  schema: z.object({
    question: z.string().describe("The search query to look up on the internet")
  })
}
)

const messages = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const model = new ChatMistralAI({
  model: "mistral-small-latest",
});

const agent = createAgent({
  model,
  tools: [emailTool, tavilyTool],
})

console.log(chalk.cyan.bold("\n  Mistral AI Chat\n"));

while (true) {
  const userInput = await rl.question(chalk.green("You: "));

  if (!userInput.trim()) continue;

  messages.push(new HumanMessage(userInput));
  const response = await agent.invoke({
    messages
  });

  messages.push(response.messages[response.messages.length - 1]);

  console.log(chalk.cyan("Mistral: ") + response.messages[response.messages.length - 1].content + "\n");
}