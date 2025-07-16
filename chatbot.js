// utils/geminiChat.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function chatWithGemini(userPrompt, listingInfo = "") {
  const finalPrompt = `
You are an assistant for guests exploring Airbnb listings. Answer based on this listing:

${listingInfo}

User Question: ${userPrompt}
  `;

  try {
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't fetch a response right now.";
  }
}

module.exports = chatWithGemini;
