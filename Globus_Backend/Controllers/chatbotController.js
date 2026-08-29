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

    // Fetch all products with pricing and discount information
    const products = await productsCollection
      .find(
        {},
        {
          projection: {
            name: 1,
            description: 1,
            price: 1,
            discountPrice: 1,
            flashSale: 1,
            stock: 1,
            category: 1,
            brand: 1,
          },
        }
      )
      .toArray();

    // Format products to clearly show the current/discounted selling price vs original regular price
    const formattedProducts = products.map((p) => {
      const regularPrice = Number(p.price) || p.price;
      let currentPrice = regularPrice;
      let hasDiscount = false;

      if (p.flashSale && p.flashSale.isActive && p.flashSale.flashPrice) {
        currentPrice = Number(p.flashSale.flashPrice) || p.flashSale.flashPrice;
        hasDiscount = true;
      } else if (
        p.discountPrice &&
        Number(p.discountPrice) > 0 &&
        Number(p.discountPrice) < Number(p.price)
      ) {
        currentPrice = Number(p.discountPrice) || p.discountPrice;
        hasDiscount = true;
      }

      return {
        name: p.name,
        category: p.category,
        brand: p.brand,
        currentPrice: currentPrice, // The actual active selling/discount price
        regularPrice: regularPrice, // The original price before discount
        hasDiscount: hasDiscount,
        stock: p.stock,
      };
    });

    // Initialize Gemini API
    const ai = new GoogleGenAI({}); // Uses process.env.GEMINI_API_KEY

    const systemInstruction = `
You are a helpful and polite customer support chatbot for an e-commerce platform named "GloBus".
Your primary language is Bengali. You must reply to the user in Bengali (using Bengali script).
The user might ask questions in "Banglish" (Bengali language written in English alphabets, e.g., "tomader kache ki laptop ache?"). You must perfectly understand Banglish and still reply in Bengali script.
CRITICAL RULE: Keep your responses extremely short and concise (maximum 1 or 2 sentences). Do not provide unnecessary details.

You will be provided with a list of currently available products in our database. 
- If the user asks about a product's price or availability, check the provided product list. 
- PRICING INSTRUCTION: ALWAYS mention the current selling price ('currentPrice'). If 'hasDiscount' is true, state the discounted price ('currentPrice') as the active price (e.g. "ডিসকাউন্ট মূল্য ৳[currentPrice]" or "ডিসকাউন্টে মূল্য ৳[currentPrice] (আগের মূল্য ৳[regularPrice])"). NEVER tell the customer only the old original regular price when a discount is active!
- If the product is not in the list or stock is 0, briefly inform them that it is out of stock.

Available Products:
${JSON.stringify(formattedProducts)}
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
