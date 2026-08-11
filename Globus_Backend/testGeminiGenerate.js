require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function testGenerate() {
  try {
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: "Hello, how are you?",
      config: {
        systemInstruction: "You are a helpful assistant.",
      }
    });
    console.log(response.text);
  } catch (e) {
    console.error("Gemini Error:", e);
  }
}

testGenerate();
