import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User, Product, Sale, Supplier, Order } from "./models.js";
import { createInitialStore, demoProducts, demoSales, demoSuppliers, demoOrders, demoUser } from "./demoStore.js";
import { analyzeProduct } from "./prediction.js";
import {
  isProviderConfigured,
  getProvidersStatus,
  generateOAuthState,
  verifyOAuthState,
  createOAuthExchangeCode,
  consumeOAuthExchangeCode,
  getGoogleAuthUrl,
  handleGoogleCallback,
  getAppleAuthUrl,
  handleAppleCallback,
  getFacebookAuthUrl,
  handleFacebookCallback,
  getMicrosoftAuthUrl,
  handleMicrosoftCallback,
  findOrCreateSocialUser
} from "./oauth.js";
import cookieParser from "cookie-parser";
import datasetRoutes from "./routes/datasetRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process safety: Prevent silent exits from uncaught exceptions or unhandled promise rejections
process.on("uncaughtException", (err) => {
  console.error("[KIRANAS CRITICAL] Uncaught Exception trapped:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[KIRANAS CRITICAL] Unhandled Rejection trapped at:", promise, "reason:", reason);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "kiranas_super_secret_jwt_key_rural_fmcg_2026";
const DEMO_MODE = String(process.env.DEMO_MODE).toLowerCase() === "true";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Configure CORS with dynamic origin matching for local development and cloud deployments
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".netlify.app")
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));
app.options("*", cors());

// High-visibility HTTP request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (req.originalUrl !== "/api/health") {
      const duration = Date.now() - start;
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root health aliases
app.get("/health", (req, res) => res.redirect("/api/health"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory fallback store initialized with realistic data
let isDbConnected = false;
let memoryStore = createInitialStore();

// Attach live database and store state to app locals and optional auth
app.use((req, res, next) => {
  req.app.locals.isDbConnected = isDbConnected;
  req.app.locals.memoryStore = memoryStore;

  // Optional token verification for personalized AI context
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {}
  }
  next();
});

// Mount Dataset API Routes (/api/dataset/*)
app.use("/api/dataset", datasetRoutes);

// Mount KIRANAS AI Assistant Routes (/api/ai/*)
app.use("/api/ai", aiRoutes);

// Database Connection with graceful fallback, connection monitoring & auto-reconnect
mongoose.connection.on("connected", () => {
  isDbConnected = true;
  console.log("✓ MongoDB connection successfully established.");
});

mongoose.connection.on("disconnected", () => {
  isDbConnected = false;
  console.warn("⚠ MongoDB disconnected. Operating seamlessly in In-Memory Demo Store.");
});

mongoose.connection.on("reconnected", () => {
  isDbConnected = true;
  console.log("✓ MongoDB successfully reconnected.");
});

mongoose.connection.on("error", (err) => {
  isDbConnected = false;
  console.error("❌ MongoDB connection error:", err.message);
});

async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/kiranas";
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    isDbConnected = true;
    console.log("✓ MongoDB successfully connected to:", mongoUri);
  } catch (err) {
    isDbConnected = false;
    console.warn(`⚠ MongoDB is unavailable (${err.message}). Operating in in-memory fallback store so app remains 100% functional.`);
  }
}
initDatabase();

// --- Auth Middleware (Supports Authorization header and HTTP-only cookie) ---
const authenticateToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied. Authentication token required." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ==========================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================
app.get("/api/health", (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    success: true,
    status: "ok",
    server: "running",
    app: "KIRANAS",
    tagline: "Smart Inventory. Smarter Kiranas.",
    version: "1.0.0",
    port: PORT,
    database: isDbConnected ? "connected" : "in-memory-fallback",
    isDbConnected,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, shopName, location, phone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ message: "This email is already registered. Please sign in." });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        shopName: shopName || "Shree Ram Kirana Store",
        location: location || "Mandi Bazaar",
        phone: phone || "+91 98765 43210"
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, shopName: user.shopName },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, shopName: user.shopName, location: user.location, role: user.role || "retailer" },
        message: "Account created successfully."
      });
    } else {
      // Memory Store
      const existing = memoryStore.users.find(u => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: "This email is already registered. Please sign in." });
      }
      const newUser = {
        _id: `user_${Date.now()}`,
        name,
        email: cleanEmail,
        shopName: shopName || "Shree Ram Kirana Store",
        location: location || "Mandi Bazaar",
        phone: phone || "+91 98765 43210",
        role: "retailer",
        passwordHash: await bcrypt.hash(password, 10)
      };
      memoryStore.users.push(newUser);

      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, name: newUser.name, shopName: newUser.shopName },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, shopName: newUser.shopName, location: newUser.location, role: newUser.role },
        message: "Account created successfully."
      });
    }
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Error registering account. Please try again." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ message: "No account found with this email address. Please register first." });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Incorrect password. Please try again." });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, shopName: user.shopName },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, shopName: user.shopName, location: user.location, role: user.role || "retailer" }
      });
    } else {
      // Memory Store
      const user = memoryStore.users.find(u => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ message: "No account found with this email address. Please register first." });
      }
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ message: "Incorrect password. Please try again." });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name, shopName: user.shopName },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, shopName: user.shopName, location: user.location, role: user.role }
      });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Error logging in. Please try again." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  return res.json({ message: "Logged out successfully." });
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found." });
      return res.json({ user });
    } else {
      const user = memoryStore.users.find(u => u._id === req.user.id || u.email === req.user.email);
      if (!user) return res.status(404).json({ message: "User not found." });
      const { passwordHash, ...safeUser } = user;
      return res.json({ user: safeUser });
    }
  } catch (err) {
    res.status(500).json({ message: "Error retrieving profile." });
  }
});

// ==========================================
// 2B. SOCIAL OAUTH (GOOGLE, APPLE, FACEBOOK, MICROSOFT)
// ==========================================

// Return configuration status for all providers
app.get("/api/auth/providers", (req, res) => {
  res.json(getProvidersStatus());
});

// Helper to redirect with OAuth error
const redirectOAuthError = (res, provider, reason) => {
  const encReason = encodeURIComponent(reason || "Authentication cancelled or failed");
  return res.redirect(`${FRONTEND_URL}/login?error=OAUTH_ERROR&provider=${encodeURIComponent(provider)}&message=${encReason}`);
};

// 1. Google OAuth
app.get("/api/auth/google", (req, res) => {
  if (!isProviderConfigured("google")) {
    return res.redirect(`${FRONTEND_URL}/login?error=MISSING_CREDENTIALS&provider=Google`);
  }
  return res.redirect(getGoogleAuthUrl());
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  if (error) {
    return redirectOAuthError(res, "Google", error_description || error);
  }
  if (!code || !state || !verifyOAuthState(state, "google")) {
    return redirectOAuthError(res, "Google", "Invalid or expired OAuth state token (CSRF check failed)");
  }

  try {
    const profile = await handleGoogleCallback(code);
    const user = await findOrCreateSocialUser(profile, isDbConnected, memoryStore);
    const exchangeCode = createOAuthExchangeCode({
      id: user._id,
      email: user.email,
      name: user.name,
      shopName: user.shopName,
      location: user.location,
      role: user.role,
      profileImage: user.profileImage || ""
    });
    return res.redirect(`${FRONTEND_URL}/auth/callback?code=${exchangeCode}`);
  } catch (err) {
    console.error("Google OAuth Error:", err.message);
    return redirectOAuthError(res, "Google", err.message);
  }
});

// 2. Apple Sign In
app.get("/api/auth/apple", (req, res) => {
  if (!isProviderConfigured("apple")) {
    return res.redirect(`${FRONTEND_URL}/login?error=MISSING_CREDENTIALS&provider=Apple`);
  }
  return res.redirect(getAppleAuthUrl());
});

const handleAppleCallbackRoute = async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const { code, state, error } = payload;
  if (error) {
    return redirectOAuthError(res, "Apple", error);
  }
  if (state && !verifyOAuthState(state, "apple")) {
    return redirectOAuthError(res, "Apple", "Invalid or expired OAuth state token");
  }

  try {
    const profile = await handleAppleCallback(payload);
    const user = await findOrCreateSocialUser(profile, isDbConnected, memoryStore);
    const exchangeCode = createOAuthExchangeCode({
      id: user._id,
      email: user.email,
      name: user.name,
      shopName: user.shopName,
      location: user.location,
      role: user.role,
      profileImage: user.profileImage || ""
    });
    return res.redirect(`${FRONTEND_URL}/auth/callback?code=${exchangeCode}`);
  } catch (err) {
    console.error("Apple OAuth Error:", err.message);
    return redirectOAuthError(res, "Apple", err.message);
  }
};
app.get("/api/auth/apple/callback", handleAppleCallbackRoute);
app.post("/api/auth/apple/callback", handleAppleCallbackRoute);

// 3. Facebook Login
app.get("/api/auth/facebook", (req, res) => {
  if (!isProviderConfigured("facebook")) {
    return res.redirect(`${FRONTEND_URL}/login?error=MISSING_CREDENTIALS&provider=Facebook`);
  }
  return res.redirect(getFacebookAuthUrl());
});

app.get("/api/auth/facebook/callback", async (req, res) => {
  const { code, state, error, error_message } = req.query;
  if (error) {
    return redirectOAuthError(res, "Facebook", error_message || error);
  }
  if (!code || !state || !verifyOAuthState(state, "facebook")) {
    return redirectOAuthError(res, "Facebook", "Invalid or expired OAuth state token");
  }

  try {
    const profile = await handleFacebookCallback(code);
    const user = await findOrCreateSocialUser(profile, isDbConnected, memoryStore);
    const exchangeCode = createOAuthExchangeCode({
      id: user._id,
      email: user.email,
      name: user.name,
      shopName: user.shopName,
      location: user.location,
      role: user.role,
      profileImage: user.profileImage || ""
    });
    return res.redirect(`${FRONTEND_URL}/auth/callback?code=${exchangeCode}`);
  } catch (err) {
    console.error("Facebook OAuth Error:", err.message);
    return redirectOAuthError(res, "Facebook", err.message);
  }
});

// 4. Microsoft Entra Authentication
app.get("/api/auth/microsoft", (req, res) => {
  if (!isProviderConfigured("microsoft")) {
    return res.redirect(`${FRONTEND_URL}/login?error=MISSING_CREDENTIALS&provider=Microsoft`);
  }
  return res.redirect(getMicrosoftAuthUrl());
});

app.get("/api/auth/microsoft/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  if (error) {
    return redirectOAuthError(res, "Microsoft", error_description || error);
  }
  if (!code || !state || !verifyOAuthState(state, "microsoft")) {
    return redirectOAuthError(res, "Microsoft", "Invalid or expired OAuth state token");
  }

  try {
    const profile = await handleMicrosoftCallback(code);
    const user = await findOrCreateSocialUser(profile, isDbConnected, memoryStore);
    const exchangeCode = createOAuthExchangeCode({
      id: user._id,
      email: user.email,
      name: user.name,
      shopName: user.shopName,
      location: user.location,
      role: user.role,
      profileImage: user.profileImage || ""
    });
    return res.redirect(`${FRONTEND_URL}/auth/callback?code=${exchangeCode}`);
  } catch (err) {
    console.error("Microsoft OAuth Error:", err.message);
    return redirectOAuthError(res, "Microsoft", err.message);
  }
});

// 5. One-Time Code Exchange endpoint (Frontend exchanges single-use code for JWT)
// Avoids placing JWT tokens or access tokens in URL query strings!
app.post("/api/auth/oauth/exchange", (req, res) => {
  const { code } = req.body || {};
  if (!code) {
    return res.status(400).json({ message: "Authorization exchange code is required." });
  }

  const userData = consumeOAuthExchangeCode(code);
  if (!userData) {
    return res.status(400).json({ message: "Invalid, expired, or already-consumed authorization code. Please try signing in again." });
  }

  const token = jwt.sign(
    {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      shopName: userData.shopName
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    token,
    user: userData
  });
});

// ==========================================
// 3. PRODUCTS & INVENTORY CRUD
// ==========================================
app.get("/api/products", async (req, res) => {
  try {
    let list;
    if (isDbConnected) {
      list = await Product.find().lean();
    } else {
      list = memoryStore.products;
    }

    const { search, category, status } = req.query;
    let filtered = list.map(analyzeProduct);

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q)));
    }

    if (category && category !== "All") {
      filtered = filtered.filter(p => p.category === category);
    }

    if (status && status !== "All") {
      filtered = filtered.filter(p => p.status === status);
    }

    res.json(filtered);
  } catch (err) {
    console.error("Products GET Error:", err);
    res.status(500).json({ message: "Failed to fetch products." });
  }
});

app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      stock,
      purchasePrice,
      sellingPrice,
      dailySales,
      leadTime,
      safetyStock,
      supplier,
      expiryDate,
      unit,
      sku
    } = req.body;

    if (!name || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ message: "Product name, purchase price and selling price are required." });
    }

    const parsedPurchasePrice = parseFloat(purchasePrice);
    const parsedSellingPrice = parseFloat(sellingPrice);

    if (isNaN(parsedPurchasePrice) || parsedPurchasePrice < 0) {
      return res.status(400).json({ message: "Purchase price must be a valid non-negative number." });
    }
    if (isNaN(parsedSellingPrice) || parsedSellingPrice < 0) {
      return res.status(400).json({ message: "Selling price must be a valid non-negative number." });
    }

    const profitMargin = parsedSellingPrice > 0
      ? parseFloat((((parsedSellingPrice - parsedPurchasePrice) / parsedSellingPrice) * 100).toFixed(2))
      : 0;

    const payload = {
      productId: `prod_${Date.now()}`,
      name: name.trim(),
      category: category || "Staples & Grains",
      brand: brand || "Local FMCG",
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
      unit: unit || "pcs",
      stock: Math.max(0, Number(stock) || 0),
      purchasePrice: parsedPurchasePrice,
      purchaseCost: parsedPurchasePrice,
      sellingPrice: parsedSellingPrice,
      mrp: parsedSellingPrice,
      profitMargin,
      dailySales: Math.max(0, parseFloat(dailySales) || 0),
      leadTime: Math.max(1, Number(leadTime) || 2),
      safetyStock: Math.max(0, Number(safetyStock) || 5),
      minStockLevel: Math.max(0, Number(safetyStock) || 5),
      lastSaleDays: 0,
      supplier: supplier || "Shree Ram FMCG Distributors",
      supplierName: supplier || "Shree Ram FMCG Distributors",
      expiryDate: expiryDate || "2027-12-31"
    };

    if (isDbConnected) {
      const created = await Product.create(payload);
      return res.status(201).json(analyzeProduct(created.toObject()));
    } else {
      const newProd = {
        _id: `prod_${Date.now()}`,
        ...payload
      };
      memoryStore.products.unshift(newProd);
      return res.status(201).json(analyzeProduct(newProd));
    }
  } catch (err) {
    console.error("Product POST Error:", err);
    res.status(400).json({ message: err.message || "Failed to create product." });
  }
});

app.put("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    delete updateData._id;

    if (updateData.purchasePrice !== undefined) {
      const parsedPP = parseFloat(updateData.purchasePrice);
      if (isNaN(parsedPP) || parsedPP < 0) {
        return res.status(400).json({ message: "Purchase price must be a valid non-negative number." });
      }
      updateData.purchasePrice = parsedPP;
      updateData.purchaseCost = parsedPP;
    }

    if (updateData.sellingPrice !== undefined) {
      const parsedSP = parseFloat(updateData.sellingPrice);
      if (isNaN(parsedSP) || parsedSP < 0) {
        return res.status(400).json({ message: "Selling price must be a valid non-negative number." });
      }
      updateData.sellingPrice = parsedSP;
      updateData.mrp = parsedSP;
    }

    if (updateData.stock !== undefined) {
      updateData.stock = Math.max(0, Number(updateData.stock) || 0);
    }

    if (updateData.dailySales !== undefined) {
      updateData.dailySales = Math.max(0, parseFloat(updateData.dailySales) || 0);
    }

    if (isDbConnected) {
      const updated = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
      if (!updated) return res.status(404).json({ message: "Product not found." });
      return res.json(analyzeProduct(updated));
    } else {
      const index = memoryStore.products.findIndex(p => p._id === id);
      if (index === -1) return res.status(404).json({ message: "Product not found." });
      memoryStore.products[index] = { ...memoryStore.products[index], ...updateData };
      return res.json(analyzeProduct(memoryStore.products[index]));
    }
  } catch (err) {
    console.error("Product PUT Error:", err);
    res.status(400).json({ message: err.message || "Failed to update product." });
  }
});

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (isDbConnected) {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Product not found." });
      return res.json({ success: true, message: "Product deleted successfully." });
    } else {
      const initialLen = memoryStore.products.length;
      memoryStore.products = memoryStore.products.filter(p => p._id !== id);
      if (memoryStore.products.length === initialLen) {
        return res.status(404).json({ message: "Product not found." });
      }
      return res.json({ success: true, message: "Product deleted successfully." });
    }
  } catch (err) {
    console.error("Product DELETE Error:", err);
    res.status(500).json({ message: "Failed to delete product." });
  }
});

// ==========================================
// 4. INVENTORY OVERVIEW & SUMMARY
// ==========================================
app.get("/api/inventory", async (req, res) => {
  try {
    const raw = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const analyzed = raw.map(analyzeProduct);
    res.json(analyzed);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch inventory." });
  }
});

app.get("/api/inventory/summary", async (req, res) => {
  try {
    const rawProducts = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const analyzed = rawProducts.map(analyzeProduct);

    // Sales for today
    const rawSales = isDbConnected ? await Sale.find().lean() : memoryStore.sales;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const todaySalesAmount = rawSales
      .filter(s => new Date(s.soldAt).getTime() >= todayStart)
      .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

    const totalInventoryValue = analyzed.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
    const lowStockCount = analyzed.filter(p => p.status === "Critical" || p.status === "Low Stock" || p.status === "Stocked Out").length;
    const deadStockValue = analyzed.filter(p => p.isDeadStock).reduce((sum, p) => sum + p.blockedCapital, 0);
    const deadStockCount = analyzed.filter(p => p.isDeadStock).length;
    const stockoutRiskCount = analyzed.filter(p => p.status === "Critical" || p.status === "Stocked Out").length;

    res.json({
      totalProducts: analyzed.length,
      inventoryValue: Math.round(totalInventoryValue),
      todaySales: Math.round(todaySalesAmount),
      lowStock: lowStockCount,
      deadStockValue: Math.round(deadStockValue),
      deadStockCount,
      stockoutRiskCount,
      stockoutRiskPercent: analyzed.length ? Math.round((stockoutRiskCount / analyzed.length) * 100) : 0,
      products: analyzed
    });
  } catch (err) {
    console.error("Inventory summary error:", err);
    res.status(500).json({ message: "Failed to calculate inventory summary." });
  }
});

// ==========================================
// 5. SALES & POS TRANSACTIONS
// ==========================================
app.get("/api/sales", async (req, res) => {
  try {
    if (isDbConnected) {
      const sales = await Sale.find().sort({ soldAt: -1 }).limit(100).lean();
      return res.json(sales);
    } else {
      return res.json(memoryStore.sales.slice(0, 100));
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales." });
  }
});

app.post("/api/sales", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, paymentMethod, customerName } = req.body;
    const qty = Number(quantity);

    if (!productId || !qty || qty <= 0) {
      return res.status(400).json({ message: "Valid productId and positive quantity are required." });
    }

    if (isDbConnected) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found." });
      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock! Only ${product.stock} available in store.` });
      }

      product.stock -= qty;
      product.lastSaleDays = 0; // reset recency
      // gently update daily sales moving average
      product.dailySales = Math.round(((product.dailySales * 6 + qty) / 7) * 10) / 10;
      await product.save();

      const sale = await Sale.create({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        productId,
        productName: product.name,
        quantity: qty,
        unitPrice: product.sellingPrice,
        total: qty * product.sellingPrice,
        paymentMethod: paymentMethod || "Cash",
        customerName: customerName || "Counter Customer",
        soldAt: new Date()
      });

      return res.status(201).json({ sale, updatedProduct: analyzeProduct(product.toObject()) });
    } else {
      // Memory Store
      const p = memoryStore.products.find(x => x._id === productId);
      if (!p) return res.status(404).json({ message: "Product not found." });
      if (p.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock! Only ${p.stock} available in store.` });
      }

      p.stock -= qty;
      p.lastSaleDays = 0;
      p.dailySales = Math.round(((p.dailySales * 6 + qty) / 7) * 10) / 10;

      const newSale = {
        _id: `sale_${Date.now()}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        productId,
        productName: p.name,
        quantity: qty,
        unitPrice: p.sellingPrice,
        total: qty * p.sellingPrice,
        paymentMethod: paymentMethod || "Cash",
        customerName: customerName || "Counter Customer",
        soldAt: new Date()
      };
      memoryStore.sales.unshift(newSale);

      return res.status(201).json({ sale: newSale, updatedProduct: analyzeProduct(p) });
    }
  } catch (err) {
    console.error("Sale POST Error:", err);
    res.status(500).json({ message: "Failed to record sale." });
  }
});

// ==========================================
// 6. AI DEMAND PREDICTION
// ==========================================
app.get("/api/predictions", async (req, res) => {
  try {
    const raw = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const analyzed = raw.map(analyzeProduct);
    // Sort critical and high priority items first
    const priorityOrder = { Critical: 1, "Stocked Out": 2, High: 3, Moderate: 4, Low: 5, Normal: 6, Dead: 7 };
    analyzed.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));
    res.json(analyzed);
  } catch (err) {
    res.status(500).json({ message: "Failed to run demand prediction engine." });
  }
});

// Alias for Step 7: GET /api/forecasts
app.get("/api/forecasts", async (req, res) => {
  try {
    const raw = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const analyzed = raw.map(analyzeProduct);
    const priorityOrder = { Critical: 1, "Stocked Out": 2, High: 3, Moderate: 4, Low: 5, Normal: 6, Dead: 7 };
    analyzed.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));
    res.json(analyzed);
  } catch (err) {
    res.status(500).json({ message: "Failed to run demand prediction engine." });
  }
});

app.get("/api/predictions/:productId", async (req, res) => {
  try {
    const raw = isDbConnected ? await Product.findById(req.params.productId).lean() : memoryStore.products.find(p => p._id === req.params.productId);
    if (!raw) return res.status(404).json({ message: "Product not found for prediction analysis." });
    res.json(analyzeProduct(raw));
  } catch (err) {
    res.status(500).json({ message: "Error calculating product prediction." });
  }
});

// Alias for Step 7: GET /api/alerts
app.get("/api/alerts", async (req, res) => {
  try {
    const raw = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const analyzed = raw.map(analyzeProduct);
    const alerts = [];
    analyzed.forEach(p => {
      if (p.status === "Critical" || p.status === "Stocked Out") {
        alerts.push({
          id: `alert_crit_${p._id}`,
          productId: p._id,
          productName: p.name,
          type: p.status === "Stocked Out" ? "Stockout" : "Critical Stock",
          severity: "Critical",
          message: `${p.name} is running out! Current shelf stock is ${p.stock} units.`,
          recommendedAction: `Reorder +${p.suggestedReorder} units immediately from ${p.supplier}.`
        });
      } else if (p.status === "Low Stock") {
        alerts.push({
          id: `alert_low_${p._id}`,
          productId: p._id,
          productName: p.name,
          type: "Low Stock",
          severity: "High",
          message: `${p.name} stock (${p.stock}) is below reorder threshold (${p.reorderPoint}).`,
          recommendedAction: `Order +${p.suggestedReorder} units before distributor delivery window closes.`
        });
      } else if (p.isDeadStock) {
        alerts.push({
          id: `alert_dead_${p._id}`,
          productId: p._id,
          productName: p.name,
          type: "Dead Stock",
          severity: "Medium",
          message: `${p.name} has had no counter sales in ${p.lastSaleDays} days. ₹${p.blockedCapital} tied up.`,
          recommendedAction: "Apply 15% markdown bundle with fast-moving Parle-G/Maggi."
        });
      }
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stock alerts." });
  }
});

// ==========================================
// 7. DEAD STOCK DETECTION
// ==========================================
app.get("/api/dead-stock", async (req, res) => {
  try {
    const raw = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const analyzed = raw.map(analyzeProduct);

    const deadStockItems = analyzed.filter(p => p.isDeadStock);
    const slowMovingItems = analyzed.filter(p => p.isSlowMoving);

    const totalDeadStockCapital = deadStockItems.reduce((sum, p) => sum + p.blockedCapital, 0);
    const totalSlowMovingCapital = slowMovingItems.reduce((sum, p) => sum + p.slowBlockedCapital, 0);

    res.json({
      summary: {
        totalBlockedCapital: Math.round(totalDeadStockCapital),
        totalSlowCapital: Math.round(totalSlowMovingCapital),
        deadStockCount: deadStockItems.length,
        slowMovingCount: slowMovingItems.length,
        potentialCapitalRecovery: Math.round(totalDeadStockCapital * 0.85) // assuming 15% discount clearance
      },
      deadStock: deadStockItems,
      slowMoving: slowMovingItems
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to detect dead stock." });
  }
});

// ==========================================
// 8. SMART REORDERING & ORDERS
// ==========================================
app.get("/api/orders", async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      res.json(orders);
    } else {
      res.json(memoryStore.orders);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders." });
  }
});

// Alias for Step 7: GET /api/purchase-orders
app.get("/api/purchase-orders", async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      res.json(orders);
    } else {
      res.json(memoryStore.orders);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch purchase orders." });
  }
});

app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { items, supplier, notes, expectedDelivery } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }

    const sanitizedItems = items.map(item => {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPrice = Math.max(0, parseFloat(item.unitPrice) || 0);
      const total = parseFloat((qty * unitPrice).toFixed(2));
      return {
        productId: item.productId,
        productName: item.productName || "Product",
        sku: item.sku || "",
        quantity: qty,
        unitPrice: unitPrice,
        total: total
      };
    });

    const calculatedTotal = parseFloat(
      sanitizedItems.reduce((acc, item) => acc + item.total, 0).toFixed(2)
    );
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const orderPayload = {
      orderId: `po_${Date.now()}`,
      poNumber,
      storeId: "store_01",
      supplierId: "sup_01",
      supplier: supplier || "Shree Ram FMCG Distributors",
      supplierName: supplier || "Shree Ram FMCG Distributors",
      items: sanitizedItems,
      total: calculatedTotal,
      totalOrderValue: calculatedTotal,
      status: "Pending",
      orderStatus: "Pending",
      paymentStatus: "Unpaid",
      expectedDelivery: expectedDelivery || "In 2-3 business days",
      expectedDeliveryDate: expectedDelivery || "In 2-3 business days",
      notes: notes || "Purchase order generated with custom shopkeeper pricing"
    };

    if (isDbConnected) {
      const created = await Order.create(orderPayload);
      return res.status(201).json(created);
    } else {
      const newOrder = {
        _id: `po_${Date.now()}`,
        ...orderPayload,
        createdAt: new Date()
      };
      memoryStore.orders.unshift(newOrder);
      return res.status(201).json(newOrder);
    }
  } catch (err) {
    console.error("Order POST Error:", err);
    res.status(500).json({ message: "Failed to create reorder." });
  }
});

app.put("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (isDbConnected) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: "Order not found." });

      const prevStatus = order.status;
      order.status = status || order.status;
      await order.save();

      // If status changed to Delivered, automatically restock items into product inventory!
      if (prevStatus !== "Delivered" && status === "Delivered") {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: Number(item.quantity) } });
        }
      }

      return res.json(order);
    } else {
      const order = memoryStore.orders.find(o => o._id === id);
      if (!order) return res.status(404).json({ message: "Order not found." });

      const prevStatus = order.status;
      order.status = status || order.status;

      // If status changed to Delivered, restock
      if (prevStatus !== "Delivered" && status === "Delivered") {
        for (const item of order.items) {
          const prod = memoryStore.products.find(p => p._id === item.productId);
          if (prod) {
            prod.stock += Number(item.quantity);
          }
        }
      }

      return res.json(order);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to update order status." });
  }
});

// ==========================================
// 9. SUPPLIER MANAGEMENT
// ==========================================
app.get("/api/suppliers", async (req, res) => {
  try {
    if (isDbConnected) {
      const suppliers = await Supplier.find().lean();
      return res.json(suppliers);
    } else {
      return res.json(memoryStore.suppliers);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch suppliers." });
  }
});

app.post("/api/suppliers", authenticateToken, async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, categories, leadTimeDays, minOrderQuantity } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Supplier name and phone are required." });
    }

    const payload = {
      name: name.trim(),
      contactPerson: contactPerson || "Representative",
      phone: phone.trim(),
      email: email || "",
      address: address || "",
      categories: Array.isArray(categories) ? categories : ["Staples & Grains"],
      leadTimeDays: Number(leadTimeDays) || 2,
      minOrderQuantity: Number(minOrderQuantity) || 10,
      rating: 4.5,
      active: true
    };

    if (isDbConnected) {
      const created = await Supplier.create(payload);
      return res.status(201).json(created);
    } else {
      const newSup = {
        _id: `sup_${Date.now()}`,
        ...payload
      };
      memoryStore.suppliers.push(newSup);
      return res.status(201).json(newSup);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to create supplier." });
  }
});

app.put("/api/suppliers/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    delete updateData._id;

    if (isDbConnected) {
      const updated = await Supplier.findByIdAndUpdate(id, updateData, { new: true });
      if (!updated) return res.status(404).json({ message: "Supplier not found." });
      return res.json(updated);
    } else {
      const index = memoryStore.suppliers.findIndex(s => s._id === id);
      if (index === -1) return res.status(404).json({ message: "Supplier not found." });
      memoryStore.suppliers[index] = { ...memoryStore.suppliers[index], ...updateData };
      return res.json(memoryStore.suppliers[index]);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to update supplier." });
  }
});

app.delete("/api/suppliers/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (isDbConnected) {
      const deleted = await Supplier.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Supplier not found." });
      return res.json({ success: true, message: "Supplier deleted." });
    } else {
      memoryStore.suppliers = memoryStore.suppliers.filter(s => s._id !== id);
      return res.json({ success: true, message: "Supplier deleted." });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to delete supplier." });
  }
});

// ==========================================
// 10. REPORTS & ANALYTICS OVERVIEW
// ==========================================
app.get("/api/reports/overview", async (req, res) => {
  try {
    const rawProds = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const rawSales = isDbConnected ? await Sale.find().lean() : memoryStore.sales;
    const analyzed = rawProds.map(analyzeProduct);

    // Sales metrics
    const totalRevenue = rawSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todaySales = rawSales
      .filter(s => new Date(s.soldAt).getTime() >= todayStart)
      .reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    // 7-day sales
    const sevenDaysAgo = todayStart - 7 * 24 * 3600 * 1000;
    const past7DaysSales = rawSales
      .filter(s => new Date(s.soldAt).getTime() >= sevenDaysAgo)
      .reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    // Category distribution
    const categoryMap = {};
    analyzed.forEach(p => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { category: p.category, count: 0, value: 0 };
      }
      categoryMap[p.category].count += 1;
      categoryMap[p.category].value += p.stock * p.purchasePrice;
    });

    // Top selling products based on daily sales velocity
    const topProducts = [...analyzed]
      .sort((a, b) => b.dailySales - a.dailySales)
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        name: p.name,
        category: p.category,
        dailySales: p.dailySales,
        stock: p.stock,
        forecast7: p.forecast7
      }));

    // Stockout risk count
    const stockoutRisk = analyzed.filter(p => p.status === "Critical" || p.status === "Stocked Out").length;
    const deadStockValue = analyzed.filter(p => p.isDeadStock).reduce((acc, p) => acc + p.blockedCapital, 0);

    res.json({
      todaySales: Math.round(todaySales),
      past7DaysSales: Math.round(past7DaysSales),
      totalRevenue: Math.round(totalRevenue),
      totalSalesTransactions: rawSales.length,
      topProducts,
      categoryDistribution: Object.values(categoryMap),
      lowStockCount: analyzed.filter(p => ["Critical", "Low Stock", "Stocked Out"].includes(p.status)).length,
      stockoutRiskCount: stockoutRisk,
      deadStockValue: Math.round(deadStockValue),
      totalInventoryValue: Math.round(analyzed.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0))
    });
  } catch (err) {
    console.error("Reports Overview Error:", err);
    res.status(500).json({ message: "Failed to generate report overview." });
  }
});

// Alias for Step 7: GET /api/dashboard/stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const rawProds = isDbConnected ? await Product.find().lean() : memoryStore.products;
    const rawSales = isDbConnected ? await Sale.find().lean() : memoryStore.sales;
    const rawOrders = isDbConnected ? await Order.find().lean() : memoryStore.orders;
    const analyzed = rawProds.map(analyzeProduct);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todaySales = rawSales
      .filter(s => new Date(s.soldAt).getTime() >= todayStart)
      .reduce((acc, s) => acc + (Number(s.total) || 0), 0);

    const totalRevenue = rawSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
    const lowStockCount = analyzed.filter(p => ["Critical", "Low Stock", "Stocked Out"].includes(p.status)).length;
    const deadStockValue = analyzed.filter(p => p.isDeadStock).reduce((acc, p) => acc + p.blockedCapital, 0);
    const totalInventoryValue = analyzed.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
    const pendingOrdersCount = rawOrders.filter(o => o.status === "Pending" || o.status === "In Transit").length;

    res.json({
      success: true,
      totalProducts: analyzed.length,
      totalInventoryValue: Math.round(totalInventoryValue),
      todaySales: Math.round(todaySales),
      totalRevenue: Math.round(totalRevenue),
      lowStockProducts: lowStockCount,
      deadStockValue: Math.round(deadStockValue),
      pendingPurchaseOrders: pendingOrdersCount,
      database: isDbConnected ? "connected" : "disconnected",
      status: "ok"
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Failed to generate dashboard statistics." });
  }
});

// Serve production static frontend if built (Single-port monolithic hosting on Render, Railway, etc.)
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) return next();
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal server error.", error: err.message });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`===============================================`);
  console.log(`🚀 KIRANAS API running on http://localhost:${PORT}`);
  console.log(`📦 Database Mode: ${isDbConnected ? "MongoDB" : "In-Memory Demo Mode"}`);
  console.log(`💡 Demo Login: shopkeeper@kiranas.in / kirana123`);
  console.log(`===============================================`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
    console.error(`Please terminate the existing process or choose another port.`);
  } else {
    console.error(`❌ Server startup error:`, err.message);
  }
});

// Graceful process shutdown handling
const handleGracefulShutdown = (signal) => {
  console.log(`\n[KIRANAS] Received ${signal}. Closing HTTP server gracefully...`);
  server.close(async () => {
    console.log("[KIRANAS] HTTP server closed.");
    if (isDbConnected) {
      try {
        await mongoose.connection.close();
        console.log("[KIRANAS] MongoDB connection closed.");
      } catch (err) {
        console.error("[KIRANAS] Error closing MongoDB:", err.message);
      }
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[KIRANAS] Forceful shutdown timeout triggered.");
    process.exit(1);
  }, 5000);
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

export { app, server };
