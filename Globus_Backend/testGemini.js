require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function testGemini() {
  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.list();
    for await (const model of response) {
      console.log(model.name);
    }
  } catch (e) {
    console.error("Gemini Error:", e);
  }
}

testGemini();
