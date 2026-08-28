const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

async function seedOrders() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("globusDB");
    const ordersCollection = db.collection("orders");
    const products = await db.collection("products").find({}).toArray();

    if (products.length === 0) {
      console.log("No products found to create orders.");
      return;
    }

    const customers = [
      { name: "Tanvir Ahmed", email: "tanvir.ahmed@gmail.com", phone: "01711223344", city: "Dhaka", address: "Dhanmondi 27, Road 8/A" },
      { name: "Nusrat Jahan", email: "nusrat.jahan@yahoo.com", phone: "01822334455", city: "Chittagong", address: "GEC Circle, Nasirabad" },
      { name: "Sajidul Islam Samin", email: "sajid365@gmail.com", phone: "01933445566", city: "Dhaka", address: "Mirpur DOHS, Avenue 3" },
      { name: "Afsana Mimi", email: "afsana.mimi@gmail.com", phone: "01644556677", city: "Sylhet", address: "Zindabazar, Amberkhana" },
      { name: "Rahat Mahmud", email: "rahat@gmail.com", phone: "01555667788", city: "Dhaka", address: "Uttara Sector 11" },
      { name: "Mahmudul Hasan", email: "mahmud.hasan@gmail.com", phone: "01766778899", city: "Rajshahi", address: "Shaheb Bazar" },
      { name: "Farzana Akter", email: "farzana.akter@gmail.com", phone: "01877889900", city: "Khulna", address: "Shibbari Mor, Sonadanga" },
      { name: "Arif Chowdhury", email: "arif.chowdhury@gmail.com", phone: "01988990011", city: "Dhaka", address: "Banani Block C, Road 11" },
      { name: "Sadia Rahman", email: "sadia.rahman@outlook.com", phone: "01599001122", city: "Dhaka", address: "Gulshan 2, Road 54" },
      { name: "Zubair Hossain", email: "zubair.hossain@gmail.com", phone: "01710987654", city: "Gazipur", address: "Board Bazar" },
    ];

    const now = Date.now();
    const sampleOrders = [];

    // Generate 20 realistic orders across past months
    for (let i = 0; i < 20; i++) {
      const cust = customers[i % customers.length];
      const daysAgo = Math.floor((i * 7) + (Math.random() * 5)); // Distributed weekly over last ~140 days
      const orderDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const prod = products[(i + j * 2) % products.length];
        const price = Number(prod.discountPrice || prod.price) || 350;
        const qty = Math.floor(Math.random() * 2) + 1;
        subtotal += price * qty;
        orderItems.push({
          productId: prod._id,
          name: prod.name,
          price: price,
          quantity: qty,
          image: prod.images?.[0] || prod.image || "/placeholder.png",
          variant: null,
        });
      }

      const statuses = ["delivered", "delivered", "delivered", "shipped", "processing", "pending"];
      const status = statuses[i % statuses.length];

      const orderDoc = {
        orderNumber: `ORD-${Date.now().toString().slice(-6)}-${1000 + i}`,
        userInfo: {
          email: cust.email,
          userId: null,
          name: cust.name,
        },
        shippingInfo: {
          fullName: cust.name,
          email: cust.email,
          phone: cust.phone,
          address: cust.address,
          city: cust.city,
          state: cust.city,
          zipCode: "1200",
          country: "Bangladesh",
        },
        items: orderItems,
        orderSummary: {
          subtotal: subtotal,
          shipping: subtotal > 1500 ? 0 : 80,
          tax: 0,
          discount: 0,
          totalAmount: subtotal > 1500 ? subtotal : subtotal + 80,
          currency: "BDT",
          itemsCount: orderItems.reduce((acc, it) => acc + it.quantity, 0),
        },
        orderStatus: status,
        paymentStatus: status === "pending" ? "pending" : "paid",
        paymentMethod: i % 2 === 0 ? "SSLCommerz" : "Cash on Delivery",
        source: "checkout",
        createdAt: orderDate,
        updatedAt: orderDate,
        timestamps: {
          created: orderDate,
          updated: orderDate,
        },
      };

      sampleOrders.push(orderDoc);
    }

    const res = await ordersCollection.insertMany(sampleOrders);
    console.log("Successfully inserted orders count:", res.insertedCount);

    const totalCount = await ordersCollection.countDocuments();
    const totalRev = await ordersCollection.aggregate([
      { $match: { orderStatus: { $in: ["delivered", "shipped", "processing"] } } },
      { $group: { _id: null, total: { $sum: "$orderSummary.totalAmount" } } },
    ]).toArray();

    console.log("Updated Stats in DB:", {
      totalOrders: totalCount,
      totalRevenue: totalRev[0]?.total || 0,
    });
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.close();
  }
}

seedOrders();
