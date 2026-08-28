const { GoogleGenAI } = require("@google/genai");

const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
       return res.status(500).json({ error: "Gemini API Key is missing. Please configure it in the backend .env file." });
    }

    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    // Fetch all products (you might want to project only necessary fields to save tokens)
    const products = await productsCollection.find({}, { projection: { name: 1, description: 1, price: 1, stock: 1, category: 1 } }).toArray();

    // Initialize Gemini API
    const ai = new GoogleGenAI({}); // Uses process.env.GEMINI_API_KEY

    const systemInstruction = `
You are a helpful and polite customer support chatbot for an e-commerce platform named "GloBus".
Your primary language is Bengali. You must reply to the user in Bengali (using Bengali script).
The user might ask questions in "Banglish" (Bengali language written in English alphabets, e.g., "tomader kache ki laptop ache?"). You must perfectly understand Banglish and still reply in Bengali script.
CRITICAL RULE: Keep your responses extremely short and concise (maximum 1 or 2 sentences). Do not provide unnecessary details.

You will be provided with a list of currently available products in our database. 
If the user asks if a product is available, check the provided product list. 
If it is in the list, briefly tell them it is available and mention its price. 
If it is not in the list, briefly inform them that it is out of stock.

Available Products:
${JSON.stringify(products)}
    `;

    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
    let replyText = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: message,
          config: {
            systemInstruction: systemInstruction,
          }
        });
        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (e) {
        lastError = e;
        console.warn(`Model ${modelName} failed, trying fallback:`, e.message);
      }
    }

    if (!replyText) {
      throw lastError || new Error("Failed to generate response");
    }

    res.status(200).json({ reply: replyText });

  } catch (err) {
    console.error("Chatbot Error:", err);
    res.status(500).json({ error: "দুঃখিত, কোনো সমস্যা হয়েছে। একটু পর আবার চেষ্টা করুন।" });
  }
};

module.exports = { chatWithBot };
