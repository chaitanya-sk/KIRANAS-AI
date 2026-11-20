# KIRANAS — Smart Inventory. Smarter Kiranas.

> **Theme**: Rural FMCG and Logistics  
> **Problem Statement 5.1**: *"Kiranas tie up cash in dead stock while running out of what sells."*  
> **Solution**: An AI-powered inventory management and mathematical demand forecasting platform designed specifically for small rural Kirana stores. It helps shopkeepers eliminate dead stock, prevent stockouts of daily essentials, predict customer demand and optimize rural FMCG replenishment.

---

## 🌟 Executive Summary

Small rural Kirana stores in India operate on thin margins and manual notebooks. Distributors frequently push slow-moving cartons with bulk discounts, locking away precious working capital. Meanwhile, high-velocity daily staples like Parle-G, Maggi, Tata Salt, and shampoo sachets frequently stock out because rural delivery mini-trucks visit villages only once or twice a week.

**KIRANAS** replaces guesswork with a transparent, working mathematical forecasting engine. It calculates daily sales velocity, accounts for distributor transit lead times and safety stock buffers, identifies dead stock holding frozen cash, and generates 1-click consolidated purchase orders.

---

## 🚀 Key Features

### 1. Modern SaaS Landing Page (`/`)
- Emerald green and white modern SaaS aesthetic.
- Hero section with live FMCG shelf telemetry visual.
- In-depth problem statement breakdown (Problem 5.1).
- Platform features & benefits tailored for rural retailers.
- **Interactive Live AI Demand Simulator**: visitors can select Indian FMCG presets (Parle-G, Maggi, Surf Excel), slide daily velocity and lead time, and watch the mathematical replenishment formula calculate reorder quantities in real-time.
- Rural logistics and mandi distribution route lifecycle.

### 2. Retailer Dashboard (`/dashboard`)
- 6 Real-time summary KPI cards:
  - **Total Products** (Catalog items tracked)
  - **Total Inventory Value** (Wholesale investment)
  - **Today's Sales** (Real-time counter POS revenue)
  - **Low Stock Items** (Products below reorder threshold)
  - **Dead Stock Value** (Tied-up cash to liquidate)
  - **Stockout Risk %** (SKUs with imminent stockout before delivery)
- **Recharts Data Visualizations**:
  - Stock Depth vs 7-Day Demand Forecast (Bar Chart)
  - Inventory Value Distribution by Category (Donut Chart)
- Top-selling products table with daily sales velocity.
- Urgent store attention alerts.
- Recent counter sales and recent replenishment orders.

### 3. Inventory Management (`/inventory`)
- Full CRUD: Add, Edit, Delete products with form validation.
- Real-time search by name, brand, or SKU.
- Category filters (Biscuits & Snacks, Instant Food, Staples & Grains, Cooking Oil, Personal Care, Detergents, Beverages & Tea, Spices & Condiments).
- Movement status filters (Healthy, Low Stock, Critical, Dead Stock).
- 18 Authentic Indian FMCG sample products with accurate MRPs, wholesale purchase prices, safety buffers, and distributor lead times.

### 4. AI Demand Prediction Engine (`/predictions`)
- Real working mathematical forecasting algorithm:
  - **Average Daily Sales Velocity ($V_{\text{daily}}$)**
  - **7-Day Demand Forecast ($D_7 = \lceil V_{\text{daily}} \times 7 \rceil$)**
  - **Days of Stock Remaining ($DaysLeft = Stock / V_{\text{daily}}$)**
  - **Expected Stockout Date** (Calibrated calendar date)
  - **Reorder Point ($ROP = V_{\text{daily}} \times LeadTime + SafetyStock$)**
  - **Suggested Reorder Quantity ($ReorderQty = \max(0, \lceil V_{\text{daily}} \times LeadTime + SafetyStock - Stock \rceil)$)**
  - *Never recommends negative reorder quantities.*
- Categorized risk priority pills (Critical, High, Optimal, Overstocked).
- Plain-language FMCG advice explaining why the recommendation was made.

### 5. Dead Stock Sentinel (`/dead-stock`)
- Identifies products with zero or negligible sales for $\ge 21$ days.
- Calculates exact working capital blocked in rupees: $\text{Current Stock} \times \text{Purchase Price}$.
- Differentiates dead-stock candidates ($\ge 21$ days) from slow-moving inventory (10–20 days).
- Automated capital recovery recommendations:
  - 15% discount bundle promotions with fast-moving Maggi or Parle-G.
  - Return to distributor requests.
  - Halting future replenishment orders.

### 6. Smart Replenishment & Reordering (`/orders`)
- Automated reorder suggestions calculated from AI forecasting.
- Grouping by distributor (Shree Ram FMCG, Metro Rural Logistics, Hindustan Consumer Supply, Balaji Agencies).
- Purchase order status tracking (Pending, Dispatched, In Transit, Delivered).
- **Auto-Restock Feature**: Marking an order as "Delivered" automatically increases the product stock on shelves!

### 7. FMCG Distributor Directory (`/suppliers`)
- Add, edit and delete distributor profiles.
- Delivery lead times in days, minimum order quantities (MOQ), contact phone, and godown address.
- 1-Click "Create PO" button directly associated with the distributor.

### 8. Counter POS / Sales Register (`/sales`)
- Instant counter billing: select FMCG item, enter quantity sold, pick payment method (Cash, UPI / QR, Khata / Credit).
- Automatically deducts shelf stock and dynamically updates the sales velocity moving average.
- Full chronological transaction ledger.

### 9. Social OAuth & User Authentication
- **4 Real Social OAuth Providers**:
  - Google OAuth 2.0 (`/api/auth/google`)
  - Apple Sign In / iOS (`/api/auth/apple`)
  - Facebook Login (`/api/auth/facebook`)
  - Microsoft Entra ID (`/api/auth/microsoft`)
- **Secure Code Exchange Architecture**: Never exposes JWTs or OAuth access tokens in URL query strings. Uses short-lived (60s) single-use cryptographically signed exchange codes exchanged over secure POST bodies.
- Cryptographic CSRF state validation with nonce verification.
- Account linking support across providers.
- Local email & password authentication with bcrypt hashing.
- **Dual Database Architecture**: Fully functional with MongoDB or zero-config in-memory mock store.

### 10. KIRANAS AI Store Assistant (Interactive Grounded Chatbot)
- **Floating Interactive Widget**: Bottom-right floating assistant with unread indicators, typing animations, message timestamps, and markdown message rendering.
- **Real Database & Telemetry Grounding**: Answers queries using actual live inventory figures, daily sales velocity, dead stock calculations, and distributor lead times.
- **Natural Language Capabilities**:
  - *"Which products should I reorder today?"* — returns prioritized restock list, lead times, quantities, and cost in ₹.
  - *"What is my dead stock status?"* — identifies items untouched for 21+ days and calculates blocked working capital.
  - *"Show top 5 fast-moving FMCG items"* — ranks items by daily sales run rate.
  - *"How much stock do I have of Parle-G or Maggi?"* — SKU-level stock check with days of cover.
- **Dual AI Engine**:
  - **Generative LLM Engine**: Connected to Google Gemini 1.5/2.0 Flash or OpenAI GPT-4o-mini when `GEMINI_API_KEY` or `OPENAI_API_KEY` is provided in `backend/.env`.
  - **Autonomous Mathematical Engine**: Runs locally with zero external API dependencies, performing exact inventory calculations directly on MongoDB / store telemetry.
- **Endpoints**:
  - `POST /api/ai/chat` (Natural language store Q&A with rate limiting)
  - `GET /api/ai/history` (Retrieve session conversation stream)
  - `DELETE /api/ai/history` (Clear conversation history)

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, React Router DOM 6, Axios, Recharts 2, Lucide React |
| **Backend** | Node.js (ES Modules), Express.js 4, MongoDB, Mongoose 8, JWT, bcryptjs, CORS, dotenv |
| **AI / Forecasting** | Working mathematical inventory demand prediction engine (Velocity moving average, Lead-time depletion model, Safety stock buffer calculation) |
| **Database** | Dual Mode: MongoDB replica OR In-Memory Mock Store with 18 FMCG SKUs, 30-day sales history, suppliers & POs |

---

## 📐 Mathematical Forecasting Engine

The platform implements authentic inventory theory adapted for rural retail economics:

$$
\text{Lead Time Demand} = \lceil V_{\text{daily}} \times \text{Lead Time (Days)} \rceil
$$

$$
\text{Reorder Point (ROP)} = \text{Lead Time Demand} + \text{Safety Stock Buffer}
$$

$$
\text{Suggested Reorder Quantity} = \max\Big(0, \lceil \text{Lead Time Demand} + \text{Safety Stock} - \text{Current Stock} \rceil\Big)
$$

$$
\text{Days of Supply Remaining} = \begin{cases} \dfrac{\text{Current Stock}}{V_{\text{daily}}}, & V_{\text{daily}} > 0 \\ \infty, & V_{\text{daily}} = 0 \end{cases}
$$

$$
\text{Blocked Working Capital} = \text{Dead Stock Units} \times \text{Purchase Price (Cost)}
$$

---

## 📂 Project Structure

```
kiranas/
├── backend/
│   ├── .env                  # Backend environment variables
│   ├── .env.example          # Template environment file
│   ├── demoStore.js          # In-memory store with 18 FMCG items & 30-day sales history
│   ├── models.js             # Mongoose schemas: User, Product, Sale, Supplier, Order
│   ├── package.json          # Express backend dependencies
│   ├── prediction.js         # Mathematical AI demand forecasting engine
│   ├── seed.js               # MongoDB database seeding script
│   ├── server.js             # Express REST API endpoints & middleware
│   └── testSuite.js          # Automated end-to-end API verification suite
│
├── frontend/
│   ├── .env                  # Frontend environment variables
│   ├── .env.example          # Template environment file
│   ├── index.html            # Main HTML document
│   ├── package.json          # React, Vite, Tailwind dependencies
│   ├── patch-rollup.js       # Windows WDAC/AppLocker compatibility helper
│   ├── postcss.config.js     # PostCSS configuration
│   ├── tailwind.config.js    # Custom emerald theme configuration
│   ├── vite.config.js        # Vite build tool and reverse proxy configuration
│   └── src/
│       ├── api.js            # Axios client with JWT request interceptors
│       ├── App.jsx           # Master route configuration
│       ├── main.jsx          # React DOM root entry
│       ├── style.css         # Tailwind directives & modern SaaS styling
│       ├── context/
│       │   └── AuthContext.jsx       # User authentication and demo state management
│       ├── components/
│       │   ├── DashboardLayout.jsx   # Shell layout for retailer dashboard
│       │   ├── Header.jsx            # Top bar with quick sale/order shortcuts
│       │   ├── OrderModal.jsx        # Purchase order creation modal
│       │   ├── ProductModal.jsx      # Add/Edit product modal
│       │   ├── SaleModal.jsx         # Counter POS sale modal
│       │   ├── Sidebar.jsx           # Collapsible dashboard sidebar
│       │   └── SupplierModal.jsx     # Add/Edit distributor modal
│       └── pages/
│           ├── DashboardPage.jsx     # Retailer dashboard overview with charts
│           ├── DeadStockPage.jsx     # Dead stock sentinel & capital recovery
│           ├── InventoryPage.jsx     # Product catalog & stock management
│           ├── LandingPage.jsx       # Modern green-and-white SaaS landing page
│           ├── LoginPage.jsx         # Login page with 1-click demo button
│           ├── OrdersPage.jsx        # Smart reorders & PO tracking
│           ├── PredictionsPage.jsx   # AI demand forecasting engine view
│           ├── RegisterPage.jsx      # Shopkeeper registration form
│           ├── SalesPage.jsx         # POS counter register & sales ledger
│           └── SuppliersPage.jsx     # FMCG distributor directory
│
└── README.md                 # Complete project documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/kiranas
JWT_SECRET=kiranas_super_secret_jwt_key_rural_fmcg_2026
NODE_ENV=development
DEMO_MODE=true
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

> **Security Note**: Never expose MongoDB URIs or JWT secrets in frontend code. Frontend communicates exclusively via `VITE_API_URL`.

---

## 🔑 Demo Credentials

To test the application instantly without manual registration:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Store Owner** | `shopkeeper@kiranas.in` | `kirana123` |
| **Alternate Demo** | `demo@kiranas.in` | `demo123` |

*(You can also click the **"Instant Demo Sign In"** button on `/login` to sign in with one click).*

---

## 🚀 Quickstart Installation Guide

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+
- MongoDB (Optional: required for persistent database mode; if MongoDB is not running, KIRANAS automatically starts in In-Memory Demo Mode).

### 1. Backend Setup
In a terminal, navigate to the `backend` folder:
```bash
cd backend
npm install
node server.js
```
The API server will start at `http://localhost:5000`.

*(Optional: To seed sample FMCG data into a live MongoDB instance, run `npm run seed`).*

### 2. Frontend Setup
In a second terminal, navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Testing and Verification

To verify the entire backend API suite, health checks, authentication, product CRUD, sales transactions, reorder calculations, and report generation in one pass, run:

```bash
node backend/testSuite.js
```

All endpoints will execute and log verified status checks with zero errors.

To verify the frontend production build:
```bash
npm run build --prefix frontend
```

---

## 🔑 Social OAuth Setup Guide

KIRANAS implements real OAuth flows for all four major identity providers. If credentials are not configured in `backend/.env`, clicking any social button provides an informative configuration notice rather than failing silently or faking authentication.

To activate each provider, create your API credentials and add them to `backend/.env`:

### 1. Google OAuth 2.0
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **OAuth consent screen** and select **External**.
3. Under **Credentials**, click **Create Credentials** > **OAuth Client ID**.
4. Set Application type to **Web application**.
5. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
6. Copy your **Client ID** and **Client Secret** into `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### 2. Apple Sign In (iOS & Web)
1. Log in to your [Apple Developer Account](https://developer.apple.com/).
2. Go to **Certificates, Identifiers & Profiles** > **Identifiers**.
3. Create a **Services ID** (e.g. `com.kiranas.webapp.auth`).
4. Enable **Sign In with Apple**, click **Configure**, and register:
   - Primary App ID
   - Domains and Subdomains: `localhost`
   - Return URLs: `http://localhost:5000/api/auth/apple/callback`
5. Generate an Apple private key (`.p8`), download it, and obtain your Key ID and Team ID.
6. Populate `backend/.env`:
   ```env
   APPLE_CLIENT_ID=com.kiranas.webapp.auth
   APPLE_TEAM_ID=YOUR_TEAM_ID
   APPLE_KEY_ID=YOUR_KEY_ID
   APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```

### 3. Facebook Login (Meta for Developers)
1. Go to [Meta for Developers](https://developers.facebook.com/) and create a new App (Type: **Consumer** or **Business**).
2. Add the **Facebook Login** product and select **Web**.
3. In Facebook Login Settings, add to **Valid OAuth Redirect URIs**:
   - `http://localhost:5000/api/auth/facebook/callback`
4. Under **App Settings** > **Basic**, copy your **App ID** and **App Secret**.
5. Populate `backend/.env`:
   ```env
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```

### 4. Microsoft Entra ID (Azure Active Directory)
1. Sign in to the [Microsoft Azure Portal](https://portal.azure.com/) and navigate to **Microsoft Entra ID**.
2. Go to **App registrations** > **New registration**.
3. Under **Supported account types**, select *Accounts in any organizational directory and personal Microsoft accounts*.
4. Set the Redirect URI (Web) to:
   - `http://localhost:5000/api/auth/microsoft/callback`
5. Under **Certificates & secrets**, create a new Client Secret.
6. Copy the **Application (client) ID** and the **Client Secret Value** into `backend/.env`:
   ```env
   MICROSOFT_CLIENT_ID=your_microsoft_client_id
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
   MICROSOFT_TENANT_ID=common
   ```

### 5. AI Assistant Configuration (KIRANAS AI Chatbot)

KIRANAS features an intelligent store assistant grounded in real database inventory telemetry. It supports both cloud-hosted generative LLMs and an autonomous local mathematical engine:

1. **Option A: Google Gemini API (Recommended)**
   - Get a free API key at [Google AI Studio](https://aistudio.google.com/).
   - Add to `backend/.env`:
     ```env
     GEMINI_API_KEY=AIzaSy...your_gemini_api_key
     ```
2. **Option B: OpenAI API**
   - Get an API key at [OpenAI Platform](https://platform.openai.com/).
   - Add to `backend/.env`:
     ```env
     OPENAI_API_KEY=sk-...your_openai_api_key
     ```
3. **Option C: Zero-Config Local Mathematical Engine**
   - If no API key is provided, the backend seamlessly runs on the **KIRANAS Local Mathematical Engine**.
   - It directly parses your natural language queries, inspects the MongoDB/store database, and calculates reorder thresholds, dead stock capital, and stockout projections using pure mathematical logic with zero external API calls.

---

## 📡 REST API Reference

### Authentication & Social OAuth
- `POST /api/auth/register` — Create a new shopkeeper account (email & password).
- `POST /api/auth/login` — Sign in with email and password; returns JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `GET /api/auth/providers` — Returns activation status for Google, Apple, Facebook, and Microsoft.
- `GET /api/auth/google` — Initiates Google OAuth consent screen.
- `GET /api/auth/google/callback` — Handles Google code exchange and redirects with single-use exchange token.
- `GET /api/auth/apple` — Initiates Sign in with Apple flow.
- `POST /api/auth/apple/callback` — Handles Apple's HTTP POST callback and id_token verification.
- `GET /api/auth/facebook` — Initiates Facebook OAuth dialog.
- `GET /api/auth/facebook/callback` — Handles Facebook code exchange and Graph API profile lookup.
- `GET /api/auth/microsoft` — Initiates Microsoft Entra ID consent flow.
- `GET /api/auth/microsoft/callback` — Handles Microsoft MSAL authorization code exchange.
- `POST /api/auth/oauth/exchange` — Exchanges short-lived single-use authorization code for JWT token (zero tokens in URL query strings).

### Products & Inventory
- `GET /api/products` — List all products with analytical forecasting fields (supports `?search=`, `?category=`, `?status=`).
- `POST /api/products` — Create a new FMCG product (Requires JWT).
- `PUT /api/products/:id` — Update product details, stock, or pricing (Requires JWT).
- `DELETE /api/products/:id` — Remove a product from inventory (Requires JWT).
- `GET /api/inventory/summary` — High-level KPI summary (inventory value, low stock count, dead stock value).

### AI Demand Predictions
- `GET /api/predictions` — Returns demand forecast, days remaining, reorder point, safety stock, and suggested quantities for all SKUs.
- `GET /api/predictions/:productId` — Detailed single-product forecast.

### Dead Stock
- `GET /api/dead-stock` — Detects dead stock candidates ($\ge 21$ days without sale) and slow-moving items, calculating total blocked capital.

### Sales & POS
- `GET /api/sales` — List recent counter sales transactions.
- `POST /api/sales` — Record a counter sale; decreases shelf stock and dynamically updates daily sales velocity (Requires JWT).

### Smart Reordering & Orders
- `GET /api/orders` — List all replenishment purchase orders.
- `POST /api/orders` — Create a purchase order with distributor (Requires JWT).
- `PUT /api/orders/:id` — Update order status (Marking as "Delivered" auto-restocks products into inventory).

### Distributors
- `GET /api/suppliers` — List all FMCG distributors with lead times and MOQs.
- `POST /api/suppliers` — Add new distributor (Requires JWT).
- `PUT /api/suppliers/:id` — Update distributor details (Requires JWT).
- `DELETE /api/suppliers/:id` — Remove distributor (Requires JWT).

### Reports & Analytics
- `GET /api/reports/overview` — Aggregated revenue, category distributions, and top-selling FMCG SKUs.

### KIRANAS AI Assistant
- `POST /api/ai/chat` — Send a natural language question; returns store-grounded analysis, metrics, and actionable recommendations.
- `GET /api/ai/history` — Retrieve conversation history for current session.
- `DELETE /api/ai/history` — Reset/clear conversation history.

---

## 🛡️ Problem Statement Resolution Summary

| Problem Statement 5.1 | KIRANAS Solution |
| :--- | :--- |
| **"Kiranas tie up cash in dead stock..."** | Dead Stock Sentinel detects SKUs with $\ge 21$ days without sales, reports exact blocked working capital in rupees, and recommends clearance bundle discounts. |
| **"...while running out of what sells."** | Mathematical forecasting engine computes daily sales velocity, projects exact stockout dates, and triggers automated purchase orders before supplier delivery cycles arrive. |

---

## 📄 License
MIT License. Built for rural FMCG hackathon demonstration.
