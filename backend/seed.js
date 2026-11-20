import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Product, Sale, Supplier, Order } from "./models.js";
import { demoProducts, demoSuppliers, demoSales, demoOrders, demoUser } from "./demoStore.js";

dotenv.config();

async function seed() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kiranas";
  console.log(`Connecting to MongoDB at: ${mongoUri}`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB for database seeding.");

    // Clear existing collections
    console.log("Clearing existing collections...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await Supplier.deleteMany({});
    await Order.deleteMany({});

    // 1. Seed Users
    console.log("Seeding Demo Users...");
    const hashedPassword = await bcrypt.hash("kirana123", 10);
    const demoHashedPassword = await bcrypt.hash("demo123", 10);

    await User.create([
      {
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
        shopName: demoUser.shopName,
        location: demoUser.location,
        phone: demoUser.phone,
        role: "retailer"
      },
      {
        name: "Demo Retailer",
        email: "demo@kiranas.in",
        password: demoHashedPassword,
        shopName: "KIRANAS Demo Mart",
        location: "Kisan Mandi, Ward 3",
        phone: "+91 98111 22334",
        role: "retailer"
      }
    ]);
    console.log("✓ Seeded 2 users (Logins: shopkeeper@kiranas.in/kirana123 and demo@kiranas.in/demo123)");

    // 2. Seed Suppliers
    console.log("Seeding Suppliers...");
    const seededSuppliers = await Supplier.insertMany(
      demoSuppliers.map(({ _id, ...s }) => s)
    );
    console.log(`✓ Seeded ${seededSuppliers.length} FMCG suppliers`);

    // 3. Seed Products
    console.log("Seeding 18 Indian FMCG Products...");
    const seededProducts = await Product.insertMany(
      demoProducts.map(({ _id, ...p }) => p)
    );
    console.log(`✓ Seeded ${seededProducts.length} FMCG products with realistic Indian prices & stocks`);

    // Map sales to the inserted product IDs where possible
    console.log("Seeding 30-Day Sales History...");
    const salesToInsert = demoSales.map(({ _id, ...s }) => {
      const match = seededProducts.find(p => p.name === s.productName);
      return {
        ...s,
        productId: match ? match._id.toString() : "prod_demo"
      };
    });
    await Sale.insertMany(salesToInsert);
    console.log(`✓ Seeded ${salesToInsert.length} realistic historical sales transactions`);

    // 4. Seed Orders
    console.log("Seeding Purchase Orders...");
    const ordersToInsert = demoOrders.map(({ _id, ...o }) => o);
    await Order.insertMany(ordersToInsert);
    console.log(`✓ Seeded ${ordersToInsert.length} replenishment purchase orders`);

    console.log("\n==========================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("==========================================");
  } catch (err) {
    console.error("Seeding Error:", err.message);
    console.log("\nNote: If MongoDB is not running locally, KIRANAS automatically operates in In-Memory Demo Mode with the exact same pre-loaded seed data!");
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
