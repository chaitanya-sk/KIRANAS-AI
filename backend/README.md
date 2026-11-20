# KIRANAS Backend — Indian Rural FMCG Dataset & AI Engine

AI-Powered Inventory Optimization, Demand Forecasting, and Rural Mandi Replenishment API.

---

## 📁 Backend Architecture & Folder Structure

```
backend/
├── data/                      # 16 High-Fidelity Synthetic FMCG JSON Datasets
│   ├── stores.json            # 10 Rural Kirana Stores (Karnataka, TN, AP, TS, MH)
│   ├── products.json          # 50 Indian FMCG SKUs (Parle, Britannia, Nestle, Amul, HUL, ITC, Tata, etc.)
│   ├── categories.json        # 8 FMCG Categories & Subcategories
│   ├── inventory.json         # 500 Inventory Records across all stores
│   ├── sales.json             # 5,500+ Realistic 30-Day Sales Records
│   ├── suppliers.json         # 15 FMCG Distributors & Lead Times
│   ├── purchaseOrders.json    # 35 Replenishment Purchase Orders (Lifecycle tracking)
│   ├── forecasts.json         # 500 Mathematical AI Demand Forecasts
│   ├── stockAlerts.json       # 126 Real-Time Stock & Supply Alerts
│   ├── deadStock.json         # 20 Dead Stock Instances & Blocked Capital
│   ├── logistics.json         # 35 Mini-Truck Dispatches & Mileage
│   ├── customers.json         # 15 Rural Khata & Walk-in Customers
│   ├── transactions.json      # 1,300+ Detailed POS Billing Transactions
│   ├── promotions.json        # 8 Weekend, Harvest & Clearance Promotions
│   ├── seasonalEvents.json    # 5 Indian Festivals (Diwali, Pongal, Ugadi, etc.)
│   └── dashboardStats.json    # Precalculated KPI Summary Baselines
│
├── models/                    # Modular Mongoose Schemas (ES Modules)
│   ├── Store.js               # Store entity with rural demographics
│   ├── Product.js             # SKU, MRP, Purchase Cost, Margin, Barcode
│   ├── Category.js            # FMCG Category & Code
│   ├── Inventory.js           # Stock Levels, Status, Batch, Expiry
│   ├── Sale.js                # Counter Ledger with Profit calculation
│   ├── Supplier.js            # Mandi Distributors, Lead Times & Ratings
│   ├── PurchaseOrder.js       # PO Items, Approval, Delivery Tracking
│   ├── Forecast.js            # Moving Average & Horizon Projections
│   ├── StockAlert.js          # Critical, Low, Overstock & Dead Stock
│   ├── DeadStock.js           # Working Capital Lockup & Liquidation
│   ├── Logistics.js           # Transit, Dispatch & Vehicle References
│   ├── Customer.js            # Rural Khata Accounts & Balances
│   ├── Transaction.js         # Retail Counter Bills
│   ├── Promotion.js           # Markdown & Clearance Campaigns
│   ├── User.js                # Authenticated Storekeepers (Local & OAuth)
│   └── index.js               # Central Models Export
│
├── routes/
│   └── datasetRoutes.js       # REST Endpoints for all 15 Dataset Resources
│
├── controllers/
│   └── datasetController.js   # Dual-Mode Query Engine (MongoDB + In-Memory)
│
├── services/
│   ├── demandPrediction.js    # Moving average & 7/14/30-day projection engine
│   ├── inventoryOptimization.js# Safety buffer & Reorder Point (ROP) math
│   ├── deadStockDetection.js  # Blocked capital recovery & bundle discounting
│   └── reorderRecommendation.js# Supplier-grouped replenishment recommendations
│
├── scripts/
│   ├── generateDatasets.js    # Dataset Generation Pipeline
│   ├── validateDataset.js     # Data Integrity Validation Suite
│   ├── seedDatabase.js        # Idempotent MongoDB Seeder
│   └── clearDatabase.js       # Safe Dataset Cleaner (Preserves Users)
│
├── .env.example
├── package.json
└── README.md
```

---

## 🛠️ Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Validate dataset integrity
npm run validate-data

# 3. Seed MongoDB (idempotent, preserves user accounts)
npm run seed

# 4. Start backend on port 5000
npm run dev
```

---

## 📊 Dataset Overview & Statistics

- **Total SKUs**: 50 authentic Indian FMCG products with realistic INR pricing (MRP ₹5 to ₹320).
- **Stores**: 10 rural stores across Karnataka, Tamil Nadu, Andhra Pradesh, Telangana, and Maharashtra. Includes demo store `store_ka_01` (Sharma General & Kirana Store).
- **Inventory Units**: 500 records covering Low Stock, Critical, Dead Stock, Normal, Overstock, and Near-Expiry states.
- **Sales Transactions**: 5,500+ daily sales across 30 days incorporating weekend demand variations, high-velocity daily items (Parle-G, Milk), and periodic items (Detergents, Oil).
- **Suppliers**: 15 Mandi distributors mapped to respective FMCG brands (Parle, Britannia, Nestle, Amul, HUL, ITC, Tata, Adani Fortune, etc.).

---

## 📡 Dataset API Endpoints (`/api/dataset/*`)

All dataset endpoints support **Pagination** (`?page=1&limit=20`), **Search** (`?search=query`), **Store Filtering** (`?storeId=store_ka_01`), and **Sorting**:

| Endpoint | Description |
| :--- | :--- |
| `GET /api/dataset/stores` | List of rural Kirana stores |
| `GET /api/dataset/products` | 50 FMCG products with MRP, cost, and suppliers |
| `GET /api/dataset/categories` | FMCG categories and subcategories |
| `GET /api/dataset/inventory` | Shelf quantities, stock status, and reorder levels |
| `GET /api/dataset/sales` | 30-day sales history with revenue and profit |
| `GET /api/dataset/suppliers` | FMCG distributors with lead times and MOQs |
| `GET /api/dataset/purchase-orders` | Purchase orders with delivery statuses |
| `GET /api/dataset/forecasts` | AI demand predictions (7-day, 14-day, 30-day) |
| `GET /api/dataset/alerts` | Active stock alerts (Critical, Low, Overstock) |
| `GET /api/dataset/dead-stock` | Items with $\ge 21$ days without sale + blocked INR |
| `GET /api/dataset/logistics` | Mini-truck dispatches, vehicles, and distance |
| `GET /api/dataset/customers` | Fictional rural customers and Khata credit balances |
| `GET /api/dataset/transactions` | Retail bills and payment breakdown (Cash, UPI, Khata) |
| `GET /api/dataset/promotions` | Active and upcoming discount promotions |
| `GET /api/dataset/dashboard-stats` | Real-time aggregated KPI summary stats |

---

## 🧠 AI Demand & Mathematical Algorithms

### 1. Daily Sales Velocity
$$\bar{V}_{\text{daily}} = \frac{\sum_{i=1}^{n} Q_i}{n}$$

### 2. Lead-Time Reorder Point (ROP)
$$\text{ROP} = \lceil \bar{V}_{\text{daily}} \times \text{LeadTime}_{\text{days}} + \text{SafetyStock} \rceil$$

### 3. Suggested Reorder Quantity
$$\text{ReorderQty} = \max(0, \lceil \bar{V}_{\text{daily}} \times 14 + \text{SafetyStock} - \text{CurrentStock} \rceil)$$

### 4. Dead Stock Blocked Working Capital
$$\text{BlockedCapital} = \text{CurrentStock} \times \text{PurchaseCost}$$
*Automatically pairs slow-moving stock with fast-moving Parle-G/Maggi for 15%–25% liquidation bundles.*

---

## 🔒 Authentication & Dual-Mode Architecture

- **MongoDB Connected**: Queries Mongoose collections with aggregation pipelines.
- **MongoDB Offline / Demo Mode**: Seamlessly falls back to resilient in-memory JSON datasets, ensuring the app remains 100% interactive for presentations and offline testing.
- **Security**: Preserves existing JWT authentication, HTTP-only cookies, and social OAuth providers (Google, Apple, Facebook, Microsoft).

---

## 🤖 KIRANAS AI Assistant Endpoints (`/api/ai/*`)

The AI assistant provides real-time natural language answers grounded in live store telemetry:

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/ai/chat` | `POST` | Processes natural language questions with live store data grounding |
| `/api/ai/history` | `GET` | Returns active session conversation history stream |
| `/api/ai/history` | `DELETE` | Clears conversation history for the session |

### AI Configuration in `backend/.env`:
- **`GEMINI_API_KEY`**: Set your Google Gemini API key to enable generative reasoning.
- **`OPENAI_API_KEY`**: Alternatively, set your OpenAI API key for GPT-4o-mini.
- **Fallback**: If neither is set, KIRANAS automatically uses its local mathematical engine to parse intents and compute exact formulas with zero hallucination.
