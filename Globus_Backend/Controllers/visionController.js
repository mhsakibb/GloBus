const { GoogleGenAI } = require("@google/genai");

const visionSearch = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
       return res.status(500).json({ error: "Gemini API Key is missing. Please configure it in the backend .env file." });
    }

    // Extract mime type and base64 string if it contains data URI scheme
    let mimeType = "image/jpeg";
    let base64Data = imageBase64;
    
    if (imageBase64.startsWith("data:")) {
      const parts = imageBase64.split(";base64,");
      mimeType = parts[0].split(":")[1];
      base64Data = parts[1];
    }

    const ai = new GoogleGenAI({}); // Uses process.env.GEMINI_API_KEY

    // Ask Gemini to describe the primary product in 1 or 2 keywords
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        "What is the primary product in this image? Reply with a comma-separated list of 3 to 5 related keywords, synonyms, or spelling variations of the product name (e.g. 'lichy, litchi, lychee', 'mango, mangoes', 'shoe, sneaker'). Do not include any other text."
      ]
    });

    const searchQuery = response.text.trim();

    // Search the database using this query
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    // Split by commas or spaces, keep words longer than 2 characters
    const keywords = searchQuery.replace(/[^\w\s,]/gi, '').split(/[\s,]+/).filter(w => w.length > 2);
    
    // Create a regex pattern that matches ANY of the keywords
    const regexPattern = keywords.length > 0 ? keywords.join("|") : searchQuery;
    const regex = new RegExp(regexPattern, "i");

    const products = await productsCollection.find({
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        { subCategory: { $regex: regex } },
        { tags: { $regex: regex } },
        { brand: { $regex: regex } }
      ]
    }).toArray();

    res.status(200).json({ 
      query: searchQuery, 
      products: products 
    });

  } catch (err) {
    console.error("Vision Search Error:", err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
};

module.exports = { visionSearch };
