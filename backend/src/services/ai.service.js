import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";

const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
});

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

const agent = createReactAgent({
    llm: mistralModel,
    tools: [searchInternetTool],
})

export async function generateResponse(messages) {
    const response = await agent.invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and precise assistant. Today's date is ${new Date().toDateString()}.
 
                SEARCH RULES — only use "searchInternet" when truly needed:
                - Search for: current weather, live scores, breaking news, stock prices, recent events after 2024, or when user explicitly says "latest" / "today" / "now" / "current".
                - Do NOT search for: general knowledge, coding help, math, history, concepts, definitions, or anything you already know confidently.
                - If you are confident in your answer, reply directly without searching.
                - If you search, base your answer strictly on the results.
                - If you don't know even after searching, say so.
            `),
            ...messages.map(msg => {
                if (msg.role === "user") return new HumanMessage(msg.content)
                if (msg.role === "ai")   return new AIMessage(msg.content)
            })
        ]
    });

    return response.messages[response.messages.length - 1].content;
}

export async function generateChatTitle(message) {
    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging.
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
        `)
    ])
    return response.content
}