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
);

const agent = createReactAgent({
    llm: mistralModel,
    tools: [searchInternetTool],
});

function isCurrentEventsQuery(text = "") {
    const query = text.toLowerCase();
    return [
        "latest",
        "today",
        "current",
        "now",
        "breaking news",
        "headline",
        "headlines",
        "news",
        "live score",
        "stock price",
        "weather",
        "recent",
    ].some((keyword) => query.includes(keyword));
}

export async function generateResponse(messages) {
    const latestUserMessage = [...messages].reverse().find((msg) => msg.role === "user");

    if (latestUserMessage && isCurrentEventsQuery(latestUserMessage.content)) {
        const searchResults = await searchInternet({ query: latestUserMessage.content });
        const groundedResponse = await mistralModel.invoke([
            new SystemMessage(`
                You are a precise assistant answering questions that need fresh, current information.
                Use only the provided internet search results for factual claims.
                If the results are incomplete, say that clearly instead of guessing.
            `),
            new HumanMessage(`
                User question:
                ${latestUserMessage.content}

                Internet search results:
                ${searchResults}
            `)
        ]);

        return groundedResponse.content;
    }

    const response = await agent.invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and precise assistant. Today's date is ${new Date().toDateString()}.

                SEARCH RULES - only use "searchInternet" when truly needed:
                - Search for current weather, live scores, breaking news, headlines, stock prices, recent events after 2024, or when the user explicitly says "latest", "today", "now", or "current".
                - Do not search for general knowledge, coding help, math, history, concepts, or definitions when you can answer confidently without search.
                - If you search, base your answer strictly on the results.
                - If you do not know even after searching, say so instead of guessing.
            `),
            ...messages.map((msg) => {
                if (msg.role === "user") return new HumanMessage(msg.content);
                if (msg.role === "ai") return new AIMessage(msg.content);
                return null;
            }).filter(Boolean)
        ]
    });

    return response.messages[response.messages.length - 1].content;
}

export async function generateChatTitle(message) {
    const response = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words.
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
        `)
    ]);
    return response.content;
}
