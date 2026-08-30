const { ObjectId } = require("mongodb");
const cacheService = require("../utils/cacheService");

const ALL_PRODUCTS_CACHE_KEY = "globus_all_products";

// Essential catalog card projection for fast public browsing
const CATALOG_PROJECTION = {
  name: 1,
  slug: 1,
  price: 1,
  discountPrice: 1,
  category: 1,
  subCategory: 1,
  brand: 1,
  images: 1,
  stock: 1,
  unit: 1,
  isFeatured: 1,
  ratings: 1,
  flashSale: 1,
  createdAt: 1,
  updatedAt: 1,
};

// Get all products with lean projection for customer store
const browseProduct = async (req, res) => {
  try {
    const isNoCache = req.query.nocache === "true" || req.headers["x-cache-bypass"];

    // Check Cache first if not bypassing
    if (!isNoCache) {
      const cachedData = cacheService.get(ALL_PRODUCTS_CACHE_KEY);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cachedData);
      }
    }

    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const products = await productsCollection
      .find({})
      .project(CATALOG_PROJECTION)
      .sort({ createdAt: -1 })
      .toArray();

    // Cache in memory
    cacheService.set(ALL_PRODUCTS_CACHE_KEY, products, 300);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "no-cache");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products for Admin panel (Full fields, 0 omissions, strictly live from DB)
const getAllProductsAdmin = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const products = await productsCollection
      .find({})
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in getAllProductsAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create product (with cache invalidation)
const createProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const product = req.body;

    product.slug = product.name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    product.createdAt = new Date();
    product.updatedAt = new Date();

    // Ensure price and stock are clean numeric values
    if (product.price) product.price = Number(product.price) || product.price;
    if (product.discountPrice) product.discountPrice = Number(product.discountPrice) || product.discountPrice;
    if (product.stock) product.stock = Number(product.stock) || product.stock;

    const result = await productsCollection.insertOne(product);

    // Invalidate product cache immediately
    cacheService.del(ALL_PRODUCTS_CACHE_KEY);

    res
      .status(201)
      .json({ success: true, message: "Product created successfully", productId: result.insertedId });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update product (with cache invalidation)
const updateProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const id = req.params.id;
    const updateData = { ...req.body };
    delete updateData._id;
    updateData.updatedAt = new Date();

    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    if (updateData.price) updateData.price = Number(updateData.price) || updateData.price;
    if (updateData.discountPrice) updateData.discountPrice = Number(updateData.discountPrice) || updateData.discountPrice;
    if (updateData.stock) updateData.stock = Number(updateData.stock) || updateData.stock;

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Invalidate product cache
    cacheService.del(ALL_PRODUCTS_CACHE_KEY);

    res.status(200).json({ success: true, message: "Product updated successfully", matchedCount: result.matchedCount });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete product (with cache invalidation)
const deleteProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const id = req.params.id;
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

    // Invalidate product cache
    cacheService.del(ALL_PRODUCTS_CACHE_KEY);

    res.status(200).json({ success: true, message: "Product deleted successfully", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add Product Review
const addReview = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const { user, rating, comment } = req.body;
    
    if (!user || !rating) {
      return res.status(400).json({ success: false, message: "User name and rating are required" });
    }

    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const newReview = {
      user,
      rating: Number(rating),
      comment: comment || "",
      date: new Date()
    };

    const currentReviews = product.reviews || [];
    const updatedReviews = [...currentReviews, newReview];
    
    const newCount = updatedReviews.length;
    const newTotal = updatedReviews.reduce((acc, rev) => acc + rev.rating, 0);
    const newAverage = Number((newTotal / newCount).toFixed(1));

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          reviews: updatedReviews,
          "ratings.average": newAverage,
          "ratings.count": newCount
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ success: false, message: "Failed to add review" });
    }

    // Invalidate product cache
    cacheService.del(ALL_PRODUCTS_CACHE_KEY);

    res.json({
      success: true,
      message: "Review added successfully",
      review: newReview,
      ratings: {
        average: newAverage,
        count: newCount
      }
    });

  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ success: false, message: "Failed to add review" });
  }
};

module.exports = {
  browseProduct,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
