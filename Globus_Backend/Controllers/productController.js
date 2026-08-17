const { ObjectId } = require("mongodb");
const cacheService = require("../utils/cacheService");

const ALL_PRODUCTS_CACHE_KEY = "globus_all_products";

// Essential catalog card projection (saves ~80% memory & network payload)
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
};

// Get all products with lean projection and multi-tier in-memory caching
const browseProduct = async (req, res) => {
  try {
    // Check Cache first (0 database round-trip!)
    const cachedData = cacheService.get(ALL_PRODUCTS_CACHE_KEY);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Cache-Control", "public, max-age=600, s-maxage=1800");
      return res.status(200).json(cachedData);
    }

    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const products = await productsCollection
      .find({})
      .project(CATALOG_PROJECTION)
      .sort({ createdAt: -1 })
      .toArray();

    // Cache result in memory for 15 minutes (900 seconds)
    cacheService.set(ALL_PRODUCTS_CACHE_KEY, products, 900);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("Cache-Control", "public, max-age=600, s-maxage=1800");
    res.status(200).json(products);
  } catch (err) {
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

    const result = await productsCollection.insertOne(product);

    // Invalidate product cache immediately
    cacheService.del(ALL_PRODUCTS_CACHE_KEY);

    res
      .status(201)
      .json({ message: "Product created", productId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (with cache invalidation)
const updateProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const id = req.params.id;
    const updateData = req.body;
    updateData.updatedAt = new Date();

    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Invalidate product cache
    cacheService.del(ALL_PRODUCTS_CACHE_KEY);

    res.status(200).json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product (with cache invalidation)
const deleteProduct = async (req, res) => {
  try {
    const client = req.app.locals.mongoClient;
    const database = client.db("globusDB");
    const productsCollection = database.collection("products");

    const id = req.params.id;
    await productsCollection.deleteOne({ _id: new ObjectId(id) });

    // Invalidate product cache
    cacheService.del(ALL_PRODUCTS_CACHE_KEY);

    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  browseProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
