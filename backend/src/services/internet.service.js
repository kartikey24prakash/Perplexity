// const { tavily } = require("@tavily/core");
// import { tavily } from "@tavily/core";
import "dotenv/config";

// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
// // const question = "India";
// export async function tavilySearch({question}) {
//     // console.log("Searching:", question);

//     const response = await tvly.search(question);
//     // console.log("Results:", response);
//     return response;
// }
// // const response = await tvly.search("Current conflicts in the world with start date .");
// // const response = await tavilySearch("india")
// // console.log(response)

import { tavily as Tavily } from "@tavily/core"

const tavily = Tavily({
    apiKey: process.env.TAVILY_API_KEY,
})


export const searchInternet = async ({ query }) => {
    const results = await tavily.search(query, {
        maxResults: 5,
    })

    console.log(JSON.stringify(results))

    return JSON.stringify(results)
}