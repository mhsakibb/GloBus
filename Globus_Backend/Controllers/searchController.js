const { ObjectId } = require("mongodb");

const getProductById = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const db = client.db("globusDB");
    const productsCollection = db.collection("products");

    const { id } = req.params;
    
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: "Valid Product ID is required" });

    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Always ensure ratings accurately reflect reviews array if present
    if (Array.isArray(product.reviews)) {
      const count = product.reviews.length;
      const average = count > 0 
        ? Number((product.reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count).toFixed(1))
        : 0;

      if (product.ratings?.count !== count || (count > 0 && product.ratings?.average !== average)) {
        product.ratings = { average, count };
        productsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { "ratings.average": average, "ratings.count": count } }
        ).catch((e) => console.error("Ratings sync error:", e));
      } else {
        product.ratings = {
          average: count > 0 ? average : (product.ratings?.average || 0),
          count: count
        };
      }
    }

    res.json(product);
  } catch (err) {
    console.error("Get Product By ID Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getProductById };

