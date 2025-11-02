require('dotenv').config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



async function generateResponse(chatHistory) {
  try {

    const prompt = Array.isArray(chatHistory)
      ? chatHistory
        .map((e) => {
          if (!e) return "";
          if (typeof e === "string") return e;
          if (Array.isArray(e.parts)) return e.parts.map((p) => p.text || "").join(" ");
          return e.text || JSON.stringify(e);
        })
        .join("\n")
      : String(chatHistory || "");

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ type: "text", text: prompt }],
    });



    if (!res) return "Sorry, no response from AI.";
    if (typeof res === "string") return res;
    if (res.text) return res.text;
    if (res.candidates && res.candidates[0]) {
      const c = res.candidates[0];
      if (Array.isArray(c.content) && c.content[0] && c.content[0].text) return c.content[0].text;
      if (c.text) return c.text;
    }


    return JSON.stringify(res);
  } catch (err) {
    console.error("AI generate error:", err);
    return "Sorry, I had trouble responding.";
  }
}

module.exports = generateResponse;