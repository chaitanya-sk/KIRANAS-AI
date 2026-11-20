import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log("Generating realistic Indian rural FMCG dataset...");

// 1. STORES (10 Rural Kirana Stores in South & West India)
const stores = [
  {
    storeId: "store_ka_01",
    storeName: "Sharma General & Kirana Store",
    ownerName: "Ramesh Sharma",
    village: "Bilaspur Gram",
    district: "Dharwad",
    state: "Karnataka",
    pincode: "580001",
    phone: "+91 98765 43210",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-01-10",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: true
  },
  {
    storeId: "store_ka_02",
    storeName: "Gowda Provision & FMCG Mandi",
    ownerName: "Manjunath Gowda",
    village: "Maddur Hobli",
    district: "Mandya",
    state: "Karnataka",
    pincode: "571428",
    phone: "+91 98450 12345",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-01-15",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_ka_03",
    storeName: "Basaveshwara Kirana Mart",
    ownerName: "Basavaraj Patil",
    village: "Bailhongal",
    district: "Belagavi",
    state: "Karnataka",
    pincode: "591102",
    phone: "+91 97410 98765",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-02-01",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_ka_04",
    storeName: "Sri Siddheshwara Store",
    ownerName: "Channappa Biradar",
    village: "Channapatna",
    district: "Ramanagara",
    state: "Karnataka",
    pincode: "562160",
    phone: "+91 99001 23456",
    storeCategory: "Village General Store",
    registrationDate: "2024-02-10",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_tn_01",
    storeName: "Murugan Maligai Store",
    ownerName: "K. Murugan",
    village: "Papanasam",
    district: "Thanjavur",
    state: "Tamil Nadu",
    pincode: "614205",
    phone: "+91 94430 87654",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-02-15",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_tn_02",
    storeName: "Sri Lakshmi Provision Stores",
    ownerName: "S. Rajendran",
    village: "Pennagaram",
    district: "Dharmapuri",
    state: "Tamil Nadu",
    pincode: "636810",
    phone: "+91 98421 54321",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-03-01",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_ap_01",
    storeName: "Venkateswara Kirana & Fancy",
    ownerName: "V. Subba Rao",
    village: "Palamaner",
    district: "Chittoor",
    state: "Andhra Pradesh",
    pincode: "517408",
    phone: "+91 94402 34567",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-03-10",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_ap_02",
    storeName: "Rayalaseema Traders",
    ownerName: "K. Ramakrishna",
    village: "Dhone",
    district: "Kurnool",
    state: "Andhra Pradesh",
    pincode: "518222",
    phone: "+91 98480 67890",
    storeCategory: "Village General Store",
    registrationDate: "2024-03-15",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_ts_01",
    storeName: "Kakatiya Kirana Merchants",
    ownerName: "M. Ravinder Reddy",
    village: "Narsapur",
    district: "Medak",
    state: "Telangana",
    pincode: "502313",
    phone: "+91 99490 11223",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-03-20",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  },
  {
    storeId: "store_mh_01",
    storeName: "Shivaji Kirana & Dhanya Bhandar",
    ownerName: "Santosh Patil",
    village: "Shirol",
    district: "Kolhapur",
    state: "Maharashtra",
    pincode: "416103",
    phone: "+91 98220 33445",
    storeCategory: "Rural Kirana",
    registrationDate: "2024-04-01",
    totalProducts: 50,
    storeStatus: "Active",
    isDemoStore: false
  }
];

// 2. CATEGORIES
const categories = [
  { categoryId: "cat_biscuits", name: "Biscuits & Snacks", code: "BISCUITS", description: "High-frequency daily snacks, biscuits, and rusks", icon: "Cookie", subcategories: ["Glucose Biscuits", "Cream Biscuits", "Marie & Health", "Namkeen & Chips"] },
  { categoryId: "cat_instant_food", name: "Instant Food", code: "INSTANT_FOOD", description: "Quick meals, noodles, pasta and packaged soup", icon: "Utensils", subcategories: ["Noodles", "Vermicelli", "Ready Mixes"] },
  { categoryId: "cat_staples", name: "Staples & Grains", code: "STAPLES", description: "Atta, rice, dal, salt, sugar and basic grains", icon: "Wheat", subcategories: ["Atta & Flour", "Edible Salt", "Sugar & Jaggery", "Pulses & Dal"] },
  { categoryId: "cat_oil_ghee", name: "Cooking Oil & Ghee", code: "OIL_GHEE", description: "Vegetable oil, mustard oil, sunflower oil, and pure desi ghee", icon: "Droplet", subcategories: ["Sunflower Oil", "Mustard Oil", "Desi Ghee", "Palm Oil"] },
  { categoryId: "cat_personal_care", name: "Personal Care", code: "PERSONAL_CARE", description: "Soaps, shampoo sachets, toothpaste, and hair oil", icon: "Smile", subcategories: ["Bath Soaps", "Shampoo Sachets", "Dental Care", "Hair Care"] },
  { categoryId: "cat_detergents", name: "Detergents & Cleaning", code: "DETERGENTS", description: "Washing powders, detergent bars, dishwash, and disinfectants", icon: "Sparkles", subcategories: ["Washing Powders", "Detergent Cakes", "Dishwash Bars", "Antiseptics"] },
  { categoryId: "cat_beverages", name: "Beverages & Tea", code: "BEVERAGES", description: "Tea leaves, instant coffee, glucose drinks, and bottled water", icon: "Coffee", subcategories: ["Packaged Tea", "Coffee", "Energy Drinks", "Packaged Water"] },
  { categoryId: "cat_spices", name: "Spices & Condiments", code: "SPICES", description: "Turmeric, chilli powder, mixed masala, and pickles", icon: "Flame", subcategories: ["Powdered Spices", "Whole Spices", "Pickles & Sauces"] }
];

// 3. SUPPLIERS (15 FMCG Distributors)
const suppliers = [
  { supplierId: "sup_parle", name: "Shree Ram Parle Agency", contactPerson: "R. K. Agarwal", phone: "+91 98200 11001", email: "orders@shreeramparle.in", address: "Mandi Gate No. 4, APMC Hub", district: "Dharwad", state: "Karnataka", suppliedBrands: ["Parle"], suppliedCategories: ["Biscuits & Snacks"], avgDeliveryTime: 2, minOrderValue: 2000, rating: 4.8, status: "Preferred" },
  { supplierId: "sup_britannia", name: "Metro Britannia Logistics", contactPerson: "K. Suresh", phone: "+91 98451 22002", email: "distribution@metrobritannia.in", address: "Plot 12, Industrial Area", district: "Mandya", state: "Karnataka", suppliedBrands: ["Britannia"], suppliedCategories: ["Biscuits & Snacks"], avgDeliveryTime: 2, minOrderValue: 2500, rating: 4.7, status: "Active" },
  { supplierId: "sup_nestle", name: "Balaji Food Traders (Nestle)", contactPerson: "G. Venkatesh", phone: "+91 98480 33003", email: "sales@balajinestle.in", address: "Godown Road, Market Yard", district: "Chittoor", state: "Andhra Pradesh", suppliedBrands: ["Nestle"], suppliedCategories: ["Instant Food", "Beverages & Tea"], avgDeliveryTime: 2, minOrderValue: 3000, rating: 4.9, status: "Preferred" },
  { supplierId: "sup_amul", name: "Deccan Dairy Hub (Amul)", contactPerson: "P. R. Shinde", phone: "+91 98221 44004", email: "amuldealer@deccandairy.in", address: "Cold Storage Complex", district: "Kolhapur", state: "Maharashtra", suppliedBrands: ["Amul"], suppliedCategories: ["Cooking Oil & Ghee", "Staples & Grains"], avgDeliveryTime: 1, minOrderValue: 1500, rating: 4.9, status: "Preferred" },
  { supplierId: "sup_hul", name: "Hindustan Consumer Supply", contactPerson: "Anand Verma", phone: "+91 98111 55005", email: "orders@hcsfmcg.in", address: "Sector 5, Transport Nagar", district: "Belagavi", state: "Karnataka", suppliedBrands: ["Hindustan Unilever"], suppliedCategories: ["Personal Care", "Detergents & Cleaning"], avgDeliveryTime: 3, minOrderValue: 4000, rating: 4.6, status: "Active" },
  { supplierId: "sup_itc", name: "Sri Krishna ITC Depot", contactPerson: "M. Natesan", phone: "+91 94432 66006", email: "itc@srikrishnadepot.in", address: "Near Old Bus Stand", district: "Thanjavur", state: "Tamil Nadu", suppliedBrands: ["ITC"], suppliedCategories: ["Staples & Grains", "Biscuits & Snacks"], avgDeliveryTime: 2, minOrderValue: 3500, rating: 4.8, status: "Active" },
  { supplierId: "sup_tata", name: "Tata Consumer Direct Mandi", contactPerson: "P. K. Nair", phone: "+91 98490 77007", email: "mandi@tataconsumer.in", address: "Wholesale Grain Market", district: "Kurnool", state: "Andhra Pradesh", suppliedBrands: ["Tata Consumer"], suppliedCategories: ["Staples & Grains", "Beverages & Tea"], avgDeliveryTime: 2, minOrderValue: 2500, rating: 4.9, status: "Preferred" },
  { supplierId: "sup_adani", name: "Adani Wilmar Fortune Depot", contactPerson: "Harish Jain", phone: "+91 98980 88008", email: "fortune@adaniwilmar.in", address: "Ring Road Godowns", district: "Dharwad", state: "Karnataka", suppliedBrands: ["Fortune"], suppliedCategories: ["Cooking Oil & Ghee"], avgDeliveryTime: 3, minOrderValue: 5000, rating: 4.5, status: "Active" },
  { supplierId: "sup_colgate", name: "South Oral Care Wholesale", contactPerson: "G. Murthy", phone: "+91 94440 99009", email: "colgate@southoralcare.in", address: "Main Road", district: "Dharmapuri", state: "Tamil Nadu", suppliedBrands: ["Colgate-Palmolive"], suppliedCategories: ["Personal Care"], avgDeliveryTime: 3, minOrderValue: 2000, rating: 4.7, status: "Active" },
  { supplierId: "sup_marico", name: "Marico Rural Distribution", contactPerson: "K. R. Pillai", phone: "+91 98330 10101", email: "rural@marico.in", address: "Highway Bypass", district: "Medak", state: "Telangana", suppliedBrands: ["Marico"], suppliedCategories: ["Personal Care", "Cooking Oil & Ghee"], avgDeliveryTime: 2, minOrderValue: 2500, rating: 4.6, status: "Active" },
  { supplierId: "sup_reckitt", name: "Reckitt Benckiser Rural Hub", contactPerson: "Sunil Joshi", phone: "+91 98230 20202", email: "dettol@rbhub.in", address: "APMC Sub-Yard", district: "Kolhapur", state: "Maharashtra", suppliedBrands: ["Reckitt Benckiser"], suppliedCategories: ["Personal Care", "Detergents & Cleaning"], avgDeliveryTime: 3, minOrderValue: 3000, rating: 4.7, status: "Active" },
  { supplierId: "sup_dabur", name: "Dabur Ayurveda & FMCG", contactPerson: "R. S. Tiwari", phone: "+91 98180 30303", email: "dabur@ayurwholesale.in", address: "Station Road", district: "Ramanagara", state: "Karnataka", suppliedBrands: ["Dabur"], suppliedCategories: ["Personal Care", "Beverages & Tea"], avgDeliveryTime: 2, minOrderValue: 2000, rating: 4.5, status: "Active" },
  { supplierId: "sup_everest", name: "Everest & MDH Spices Agency", contactPerson: "Pravin Shah", phone: "+91 98201 40404", email: "spices@everestagency.in", address: "Grain Merchant Street", district: "Belagavi", state: "Karnataka", suppliedBrands: ["Everest", "MDH"], suppliedCategories: ["Spices & Condiments"], avgDeliveryTime: 2, minOrderValue: 1500, rating: 4.8, status: "Active" },
  { supplierId: "sup_bisleri", name: "Bisleri & Beverages Depot", contactPerson: "N. Mohan", phone: "+91 98452 50505", email: "beverages@bisleridepot.in", address: "Mandi Cross", district: "Mandya", state: "Karnataka", suppliedBrands: ["Bisleri"], suppliedCategories: ["Beverages & Tea"], avgDeliveryTime: 1, minOrderValue: 1000, rating: 4.6, status: "Active" },
  { supplierId: "sup_local_mandi", name: "Kisan Wholesale Mandi Consortium", contactPerson: "V. Shankar", phone: "+91 98481 60606", email: "orders@kisanmandi.in", address: "Central APMC Yard", district: "Chittoor", state: "Andhra Pradesh", suppliedBrands: ["Local FMCG", "Kisan Brand"], suppliedCategories: ["Staples & Grains", "Spices & Condiments"], avgDeliveryTime: 1, minOrderValue: 1000, rating: 4.4, status: "Active" }
];

// 4. 50+ REALISTIC FMCG PRODUCTS
const products = [
  // Parle (3)
  { productId: "prod_01", sku: "PARLE-G-100G", name: "Parle-G Gold Biscuits 100g", brand: "Parle", category: "Biscuits & Snacks", subcategory: "Glucose Biscuits", barcode: "8901719101011", mrp: 10, sellingPrice: 10, purchaseCost: 8.5, profitMargin: 15.0, unit: "packet", packageSize: "100g", supplierId: "sup_parle", expiryDate: "2025-06-30", shelfLife: "6 Months", reorderLevel: 25, minStock: 15, maxStock: 100, avgDailyDemand: 14.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_02", sku: "MONACO-75G", name: "Parle Monaco Salted Crackers 75g", brand: "Parle", category: "Biscuits & Snacks", subcategory: "Namkeen & Chips", barcode: "8901719101028", mrp: 10, sellingPrice: 10, purchaseCost: 8.6, profitMargin: 14.0, unit: "packet", packageSize: "75g", supplierId: "sup_parle", expiryDate: "2025-07-15", shelfLife: "6 Months", reorderLevel: 15, minStock: 10, maxStock: 60, avgDailyDemand: 6.8, productStatus: "Active", isDeadStock: false },
  { productId: "prod_03", sku: "KRACKJACK-60G", name: "Parle KrackJack Sweet & Salty 60g", brand: "Parle", category: "Biscuits & Snacks", subcategory: "Glucose Biscuits", barcode: "8901719101035", mrp: 10, sellingPrice: 10, purchaseCost: 8.5, profitMargin: 15.0, unit: "packet", packageSize: "60g", supplierId: "sup_parle", expiryDate: "2025-07-20", shelfLife: "6 Months", reorderLevel: 12, minStock: 8, maxStock: 50, avgDailyDemand: 5.2, productStatus: "Active", isDeadStock: false },

  // Britannia (4)
  { productId: "prod_04", sku: "GOODDAY-BUTTER-75G", name: "Britannia Good Day Butter 75g", brand: "Britannia", category: "Biscuits & Snacks", subcategory: "Cream Biscuits", barcode: "8901063102012", mrp: 15, sellingPrice: 15, purchaseCost: 12.8, profitMargin: 14.7, unit: "packet", packageSize: "75g", supplierId: "sup_britannia", expiryDate: "2025-08-10", shelfLife: "6 Months", reorderLevel: 18, minStock: 10, maxStock: 70, avgDailyDemand: 8.4, productStatus: "Active", isDeadStock: false },
  { productId: "prod_05", sku: "MARIEGOLD-120G", name: "Britannia Marie Gold Tea Biscuits 120g", brand: "Britannia", category: "Biscuits & Snacks", subcategory: "Marie & Health", barcode: "8901063102029", mrp: 20, sellingPrice: 20, purchaseCost: 17.0, profitMargin: 15.0, unit: "packet", packageSize: "120g", supplierId: "sup_britannia", expiryDate: "2025-08-30", shelfLife: "6 Months", reorderLevel: 15, minStock: 10, maxStock: 60, avgDailyDemand: 7.1, productStatus: "Active", isDeadStock: false },
  { productId: "prod_06", sku: "TIGER-GLUCOSE-50G", name: "Britannia Tiger Glucose 50g", brand: "Britannia", category: "Biscuits & Snacks", subcategory: "Glucose Biscuits", barcode: "8901063102036", mrp: 5, sellingPrice: 5, purchaseCost: 4.2, profitMargin: 16.0, unit: "packet", packageSize: "50g", supplierId: "sup_britannia", expiryDate: "2025-06-15", shelfLife: "6 Months", reorderLevel: 25, minStock: 15, maxStock: 120, avgDailyDemand: 11.2, productStatus: "Active", isDeadStock: false },
  { productId: "prod_07", sku: "BRITANNIA-BREAD-400G", name: "Britannia Daily Fresh White Bread 400g", brand: "Britannia", category: "Biscuits & Snacks", subcategory: "Marie & Health", barcode: "8901063102043", mrp: 35, sellingPrice: 35, purchaseCost: 29.5, profitMargin: 15.7, unit: "loaf", packageSize: "400g", supplierId: "sup_britannia", expiryDate: "2024-12-05", shelfLife: "5 Days", reorderLevel: 6, minStock: 3, maxStock: 20, avgDailyDemand: 4.0, productStatus: "Active", isDeadStock: false },

  // Nestle (3)
  { productId: "prod_08", sku: "MAGGI-2MIN-70G", name: "Nestle Maggi 2-Minute Masala Noodles 70g", brand: "Nestle", category: "Instant Food", subcategory: "Noodles", barcode: "8901058852301", mrp: 14, sellingPrice: 14, purchaseCost: 11.8, profitMargin: 15.7, unit: "packet", packageSize: "70g", supplierId: "sup_nestle", expiryDate: "2025-09-15", shelfLife: "9 Months", reorderLevel: 25, minStock: 15, maxStock: 120, avgDailyDemand: 12.0, productStatus: "Active", isDeadStock: false },
  { productId: "prod_09", sku: "NESCAFE-CLASSIC-25G", name: "Nescafe Classic Coffee Jar 25g", brand: "Nestle", category: "Beverages & Tea", subcategory: "Coffee", barcode: "8901058852318", mrp: 95, sellingPrice: 95, purchaseCost: 82.0, profitMargin: 13.7, unit: "jar", packageSize: "25g", supplierId: "sup_nestle", expiryDate: "2025-12-31", shelfLife: "18 Months", reorderLevel: 8, minStock: 4, maxStock: 25, avgDailyDemand: 1.8, productStatus: "Active", isDeadStock: false },
  { productId: "prod_10", sku: "MILKMAID-400G", name: "Nestle Milkmaid Sweetened Condensed Milk 400g", brand: "Nestle", category: "Instant Food", subcategory: "Ready Mixes", barcode: "8901058852325", mrp: 145, sellingPrice: 145, purchaseCost: 125.0, profitMargin: 13.8, unit: "tin", packageSize: "400g", supplierId: "sup_nestle", expiryDate: "2025-11-20", shelfLife: "12 Months", reorderLevel: 5, minStock: 3, maxStock: 15, avgDailyDemand: 0.4, productStatus: "Active", isDeadStock: true },

  // Amul (4)
  { productId: "prod_11", sku: "AMUL-TAAZA-500ML", name: "Amul Taaza Toned Milk Pouch 500ml", brand: "Amul", category: "Staples & Grains", subcategory: "Pulses & Dal", barcode: "8901262010111", mrp: 27, sellingPrice: 27, purchaseCost: 25.2, profitMargin: 6.7, unit: "pouch", packageSize: "500ml", supplierId: "sup_amul", expiryDate: "2024-11-22", shelfLife: "2 Days", reorderLevel: 15, minStock: 8, maxStock: 40, avgDailyDemand: 18.0, productStatus: "Active", isDeadStock: false },
  { productId: "prod_12", sku: "AMUL-BUTTER-100G", name: "Amul Pasteurised Butter 100g", brand: "Amul", category: "Cooking Oil & Ghee", subcategory: "Desi Ghee", barcode: "8901262010128", mrp: 58, sellingPrice: 58, purchaseCost: 51.5, profitMargin: 11.2, unit: "pack", packageSize: "100g", supplierId: "sup_amul", expiryDate: "2025-05-15", shelfLife: "6 Months", reorderLevel: 8, minStock: 5, maxStock: 30, avgDailyDemand: 3.2, productStatus: "Active", isDeadStock: false },
  { productId: "prod_13", sku: "AMUL-MASTI-DAHI-400G", name: "Amul Masti Dahi Curd Tub 400g", brand: "Amul", category: "Staples & Grains", subcategory: "Pulses & Dal", barcode: "8901262010135", mrp: 35, sellingPrice: 35, purchaseCost: 30.8, profitMargin: 12.0, unit: "tub", packageSize: "400g", supplierId: "sup_amul", expiryDate: "2024-11-30", shelfLife: "10 Days", reorderLevel: 6, minStock: 4, maxStock: 25, avgDailyDemand: 4.1, productStatus: "Active", isDeadStock: false },
  { productId: "prod_14", sku: "AMUL-GHEE-500ML", name: "Amul Pure Cow Desi Ghee 500ml Tin", brand: "Amul", category: "Cooking Oil & Ghee", subcategory: "Desi Ghee", barcode: "8901262010142", mrp: 320, sellingPrice: 320, purchaseCost: 285.0, profitMargin: 10.9, unit: "tin", packageSize: "500ml", supplierId: "sup_amul", expiryDate: "2025-10-10", shelfLife: "12 Months", reorderLevel: 6, minStock: 3, maxStock: 20, avgDailyDemand: 1.5, productStatus: "Active", isDeadStock: false },

  // Hindustan Unilever (5)
  { productId: "prod_15", sku: "SURF-EXCEL-500G", name: "Surf Excel Easy Wash Detergent 500g", brand: "Hindustan Unilever", category: "Detergents & Cleaning", subcategory: "Washing Powders", barcode: "8901030383111", mrp: 75, sellingPrice: 75, purchaseCost: 64.0, profitMargin: 14.7, unit: "packet", packageSize: "500g", supplierId: "sup_hul", expiryDate: "2026-06-30", shelfLife: "24 Months", reorderLevel: 12, minStock: 6, maxStock: 40, avgDailyDemand: 3.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_16", sku: "RIN-BAR-250G", name: "Rin Detergent Washing Cake Bar 250g", brand: "Hindustan Unilever", category: "Detergents & Cleaning", subcategory: "Detergent Cakes", barcode: "8901030383128", mrp: 20, sellingPrice: 20, purchaseCost: 17.1, profitMargin: 14.5, unit: "bar", packageSize: "250g", supplierId: "sup_hul", expiryDate: "2026-06-30", shelfLife: "24 Months", reorderLevel: 20, minStock: 10, maxStock: 70, avgDailyDemand: 8.2, productStatus: "Active", isDeadStock: false },
  { productId: "prod_17", sku: "LUX-SOAP-100G", name: "Lux Rose Glowing Soap Bar 100g", brand: "Hindustan Unilever", category: "Personal Care", subcategory: "Bath Soaps", barcode: "8901030383135", mrp: 38, sellingPrice: 38, purchaseCost: 32.5, profitMargin: 14.5, unit: "bar", packageSize: "100g", supplierId: "sup_hul", expiryDate: "2026-04-15", shelfLife: "24 Months", reorderLevel: 15, minStock: 8, maxStock: 50, avgDailyDemand: 4.8, productStatus: "Active", isDeadStock: false },
  { productId: "prod_18", sku: "LIFEBUOY-TOTAL-125G", name: "Lifebuoy Total Germ Protection Soap 125g", brand: "Hindustan Unilever", category: "Personal Care", subcategory: "Bath Soaps", barcode: "8901030383142", mrp: 35, sellingPrice: 35, purchaseCost: 29.8, profitMargin: 14.9, unit: "bar", packageSize: "125g", supplierId: "sup_hul", expiryDate: "2026-05-20", shelfLife: "24 Months", reorderLevel: 15, minStock: 8, maxStock: 60, avgDailyDemand: 6.2, productStatus: "Active", isDeadStock: false },
  { productId: "prod_19", sku: "DOVE-SHAMPOO-180ML", name: "Dove Daily Shine Shampoo 180ml Bottle", brand: "Hindustan Unilever", category: "Personal Care", subcategory: "Hair Care", barcode: "8901030383159", mrp: 185, sellingPrice: 185, purchaseCost: 158.0, profitMargin: 14.6, unit: "bottle", packageSize: "180ml", supplierId: "sup_hul", expiryDate: "2026-03-30", shelfLife: "24 Months", reorderLevel: 5, minStock: 3, maxStock: 18, avgDailyDemand: 0.8, productStatus: "Active", isDeadStock: false },

  // ITC (3)
  { productId: "prod_20", sku: "AASHIRVAAD-ATTA-5KG", name: "Aashirvaad Superior MP Whole Wheat Atta 5kg", brand: "ITC", category: "Staples & Grains", subcategory: "Atta & Flour", barcode: "8901725112018", mrp: 260, sellingPrice: 260, purchaseCost: 232.0, profitMargin: 10.8, unit: "bag", packageSize: "5kg", supplierId: "sup_itc", expiryDate: "2025-04-30", shelfLife: "6 Months", reorderLevel: 10, minStock: 5, maxStock: 35, avgDailyDemand: 3.2, productStatus: "Active", isDeadStock: false },
  { productId: "prod_21", sku: "SUNFEAST-MOM-MAGIC-100G", name: "Sunfeast Mom's Magic Cashew & Almond 100g", brand: "ITC", category: "Biscuits & Snacks", subcategory: "Cream Biscuits", barcode: "8901725112025", mrp: 20, sellingPrice: 20, purchaseCost: 16.9, profitMargin: 15.5, unit: "packet", packageSize: "100g", supplierId: "sup_itc", expiryDate: "2025-07-31", shelfLife: "6 Months", reorderLevel: 12, minStock: 8, maxStock: 50, avgDailyDemand: 4.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_22", sku: "BINGO-MAD-ANGLES-66G", name: "Bingo Mad Angles Achaari Masti 66g", brand: "ITC", category: "Biscuits & Snacks", subcategory: "Namkeen & Chips", barcode: "8901725112032", mrp: 10, sellingPrice: 10, purchaseCost: 8.5, profitMargin: 15.0, unit: "packet", packageSize: "66g", supplierId: "sup_itc", expiryDate: "2025-05-15", shelfLife: "4 Months", reorderLevel: 15, minStock: 10, maxStock: 60, avgDailyDemand: 5.8, productStatus: "Active", isDeadStock: false },

  // Tata (3)
  { productId: "prod_23", sku: "TATA-SALT-1KG", name: "Tata Salt Vacuum Evaporated Iodized 1kg", brand: "Tata Consumer", category: "Staples & Grains", subcategory: "Edible Salt", barcode: "8901042951111", mrp: 28, sellingPrice: 28, purchaseCost: 24.5, profitMargin: 12.5, unit: "packet", packageSize: "1kg", supplierId: "sup_tata", expiryDate: "2026-10-31", shelfLife: "24 Months", reorderLevel: 20, minStock: 10, maxStock: 80, avgDailyDemand: 5.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_24", sku: "TATA-TEA-PREMIUM-250G", name: "Tata Tea Premium Desh Ki Chai 250g", brand: "Tata Consumer", category: "Beverages & Tea", subcategory: "Packaged Tea", barcode: "8901042951128", mrp: 140, sellingPrice: 140, purchaseCost: 121.0, profitMargin: 13.6, unit: "packet", packageSize: "250g", supplierId: "sup_tata", expiryDate: "2026-05-31", shelfLife: "18 Months", reorderLevel: 10, minStock: 5, maxStock: 40, avgDailyDemand: 3.1, productStatus: "Active", isDeadStock: false },
  { productId: "prod_25", sku: "TATA-SAMPANN-TOOR-1KG", name: "Tata Sampann Unpolished Toor Dal 1kg", brand: "Tata Consumer", category: "Staples & Grains", subcategory: "Pulses & Dal", barcode: "8901042951135", mrp: 185, sellingPrice: 185, purchaseCost: 162.0, profitMargin: 12.4, unit: "packet", packageSize: "1kg", supplierId: "sup_tata", expiryDate: "2025-08-31", shelfLife: "12 Months", reorderLevel: 8, minStock: 4, maxStock: 30, avgDailyDemand: 2.2, productStatus: "Active", isDeadStock: false },

  // Fortune & Cooking Oils (3)
  { productId: "prod_26", sku: "FORTUNE-SUNFLOWER-1L", name: "Fortune Sunlite Refined Sunflower Oil 1L Pouch", brand: "Fortune", category: "Cooking Oil & Ghee", subcategory: "Sunflower Oil", barcode: "8906007281014", mrp: 135, sellingPrice: 135, purchaseCost: 121.5, profitMargin: 10.0, unit: "pouch", packageSize: "1 Litre", supplierId: "sup_adani", expiryDate: "2025-08-15", shelfLife: "9 Months", reorderLevel: 15, minStock: 8, maxStock: 60, avgDailyDemand: 4.8, productStatus: "Active", isDeadStock: false },
  { productId: "prod_27", sku: "FORTUNE-MUSTARD-1L", name: "Fortune Kachi Ghani Pure Mustard Oil 1L", brand: "Fortune", category: "Cooking Oil & Ghee", subcategory: "Mustard Oil", barcode: "8906007281021", mrp: 148, sellingPrice: 148, purchaseCost: 133.0, profitMargin: 10.1, unit: "bottle", packageSize: "1 Litre", supplierId: "sup_adani", expiryDate: "2025-09-30", shelfLife: "12 Months", reorderLevel: 10, minStock: 5, maxStock: 40, avgDailyDemand: 2.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_28", sku: "FORTUNE-SOYA-1L", name: "Fortune Soya Health Refined Soyabean Oil 1L", brand: "Fortune", category: "Cooking Oil & Ghee", subcategory: "Sunflower Oil", barcode: "8906007281038", mrp: 120, sellingPrice: 120, purchaseCost: 108.0, profitMargin: 10.0, unit: "pouch", packageSize: "1 Litre", supplierId: "sup_adani", expiryDate: "2025-07-20", shelfLife: "9 Months", reorderLevel: 12, minStock: 6, maxStock: 45, avgDailyDemand: 3.2, productStatus: "Active", isDeadStock: false },

  // Colgate & Personal Care (4)
  { productId: "prod_29", sku: "COLGATE-MAXFRESH-50G", name: "Colgate MaxFresh Spicy Fresh Gel 50g", brand: "Colgate-Palmolive", category: "Personal Care", subcategory: "Dental Care", barcode: "8901314010115", mrp: 45, sellingPrice: 45, purchaseCost: 38.5, profitMargin: 14.4, unit: "tube", packageSize: "50g", supplierId: "sup_colgate", expiryDate: "2026-08-31", shelfLife: "24 Months", reorderLevel: 10, minStock: 5, maxStock: 40, avgDailyDemand: 2.8, productStatus: "Active", isDeadStock: false },
  { productId: "prod_30", sku: "COLGATE-STRONG-100G", name: "Colgate Strong Teeth Dental Paste 100g", brand: "Colgate-Palmolive", category: "Personal Care", subcategory: "Dental Care", barcode: "8901314010122", mrp: 65, sellingPrice: 65, purchaseCost: 55.0, profitMargin: 15.4, unit: "tube", packageSize: "100g", supplierId: "sup_colgate", expiryDate: "2026-07-31", shelfLife: "24 Months", reorderLevel: 12, minStock: 6, maxStock: 45, avgDailyDemand: 3.4, productStatus: "Active", isDeadStock: false },
  { productId: "prod_31", sku: "CLINIC-PLUS-SACHET-6ML", name: "Clinic Plus Strong & Long Shampoo Sachet 6ml (Pack of 16)", brand: "Hindustan Unilever", category: "Personal Care", subcategory: "Shampoo Sachets", barcode: "8901030383166", mrp: 16, sellingPrice: 16, purchaseCost: 13.6, profitMargin: 15.0, unit: "strip", packageSize: "16x6ml", supplierId: "sup_hul", expiryDate: "2026-06-30", shelfLife: "24 Months", reorderLevel: 25, minStock: 15, maxStock: 100, avgDailyDemand: 9.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_32", sku: "PARACHUTE-COCONUT-100ML", name: "Parachute 100% Pure Coconut Hair Oil 100ml", brand: "Marico", category: "Personal Care", subcategory: "Hair Care", barcode: "8901088012019", mrp: 48, sellingPrice: 48, purchaseCost: 41.0, profitMargin: 14.6, unit: "bottle", packageSize: "100ml", supplierId: "sup_marico", expiryDate: "2026-10-31", shelfLife: "24 Months", reorderLevel: 12, minStock: 6, maxStock: 45, avgDailyDemand: 3.8, productStatus: "Active", isDeadStock: false },

  // Dettol & Health (3)
  { productId: "prod_33", sku: "DETTOL-ORIGINAL-SOAP-75G", name: "Dettol Original Germ Protection Soap 75g", brand: "Reckitt Benckiser", category: "Personal Care", subcategory: "Bath Soaps", barcode: "8901396010112", mrp: 40, sellingPrice: 40, purchaseCost: 34.0, profitMargin: 15.0, unit: "bar", packageSize: "75g", supplierId: "sup_reckitt", expiryDate: "2026-09-30", shelfLife: "24 Months", reorderLevel: 12, minStock: 6, maxStock: 50, avgDailyDemand: 3.9, productStatus: "Active", isDeadStock: false },
  { productId: "prod_34", sku: "DETTOL-LIQUID-60ML", name: "Dettol Antiseptic Disinfectant Liquid 60ml", brand: "Reckitt Benckiser", category: "Detergents & Cleaning", subcategory: "Antiseptics", barcode: "8901396010129", mrp: 38, sellingPrice: 38, purchaseCost: 32.5, profitMargin: 14.5, unit: "bottle", packageSize: "60ml", supplierId: "sup_reckitt", expiryDate: "2026-12-31", shelfLife: "36 Months", reorderLevel: 8, minStock: 4, maxStock: 30, avgDailyDemand: 1.6, productStatus: "Active", isDeadStock: false },
  { productId: "prod_35", sku: "HARPIC-POWER-PLUS-200ML", name: "Harpic Power Plus Toilet Cleaner 200ml", brand: "Reckitt Benckiser", category: "Detergents & Cleaning", subcategory: "Antiseptics", barcode: "8901396010136", mrp: 46, sellingPrice: 46, purchaseCost: 39.5, profitMargin: 14.1, unit: "bottle", packageSize: "200ml", supplierId: "sup_reckitt", expiryDate: "2026-08-31", shelfLife: "24 Months", reorderLevel: 6, minStock: 3, maxStock: 25, avgDailyDemand: 1.2, productStatus: "Active", isDeadStock: false },

  // Dabur (2)
  { productId: "prod_36", sku: "DABUR-RED-PASTE-100G", name: "Dabur Red Ayurvedic Toothpaste 100g", brand: "Dabur", category: "Personal Care", subcategory: "Dental Care", barcode: "8901207010118", mrp: 60, sellingPrice: 60, purchaseCost: 51.0, profitMargin: 15.0, unit: "tube", packageSize: "100g", supplierId: "sup_dabur", expiryDate: "2026-06-30", shelfLife: "24 Months", reorderLevel: 10, minStock: 5, maxStock: 40, avgDailyDemand: 2.9, productStatus: "Active", isDeadStock: false },
  { productId: "prod_37", sku: "DABUR-HONEY-100G", name: "Dabur 100% Pure Squeezy Honey 100g", brand: "Dabur", category: "Staples & Grains", subcategory: "Sugar & Jaggery", barcode: "8901207010125", mrp: 75, sellingPrice: 75, purchaseCost: 64.0, profitMargin: 14.7, unit: "bottle", packageSize: "100g", supplierId: "sup_dabur", expiryDate: "2026-05-31", shelfLife: "18 Months", reorderLevel: 6, minStock: 3, maxStock: 25, avgDailyDemand: 1.1, productStatus: "Active", isDeadStock: false },

  // Spices & Condiments (Everest/MDH) (4)
  { productId: "prod_38", sku: "EVEREST-TURMERIC-100G", name: "Everest Pure Turmeric Haldi Powder 100g", brand: "Everest", category: "Spices & Condiments", subcategory: "Powdered Spices", barcode: "8901786010116", mrp: 35, sellingPrice: 35, purchaseCost: 29.8, profitMargin: 14.9, unit: "packet", packageSize: "100g", supplierId: "sup_everest", expiryDate: "2026-03-31", shelfLife: "12 Months", reorderLevel: 12, minStock: 6, maxStock: 50, avgDailyDemand: 3.7, productStatus: "Active", isDeadStock: false },
  { productId: "prod_39", sku: "EVEREST-CHILLI-100G", name: "Everest Tikhalal Hot Chilli Powder 100g", brand: "Everest", category: "Spices & Condiments", subcategory: "Powdered Spices", barcode: "8901786010123", mrp: 48, sellingPrice: 48, purchaseCost: 41.2, profitMargin: 14.2, unit: "packet", packageSize: "100g", supplierId: "sup_everest", expiryDate: "2026-03-31", shelfLife: "12 Months", reorderLevel: 12, minStock: 6, maxStock: 50, avgDailyDemand: 3.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_40", sku: "EVEREST-GARAM-MASALA-50G", name: "Everest Super Garam Masala 50g", brand: "Everest", category: "Spices & Condiments", subcategory: "Whole Spices", barcode: "8901786010130", mrp: 45, sellingPrice: 45, purchaseCost: 38.5, profitMargin: 14.4, unit: "packet", packageSize: "50g", supplierId: "sup_everest", expiryDate: "2026-04-30", shelfLife: "12 Months", reorderLevel: 8, minStock: 4, maxStock: 30, avgDailyDemand: 2.1, productStatus: "Active", isDeadStock: false },
  { productId: "prod_41", sku: "MDH-SAMBHAR-MASALA-100G", name: "MDH South Indian Sambhar Masala 100g", brand: "MDH", category: "Spices & Condiments", subcategory: "Powdered Spices", barcode: "8901234010119", mrp: 82, sellingPrice: 82, purchaseCost: 70.0, profitMargin: 14.6, unit: "box", packageSize: "100g", supplierId: "sup_everest", expiryDate: "2026-02-28", shelfLife: "12 Months", reorderLevel: 8, minStock: 4, maxStock: 35, avgDailyDemand: 2.4, productStatus: "Active", isDeadStock: false },

  // Beverages & Water (3)
  { productId: "prod_42", sku: "BISLERI-WATER-1L", name: "Bisleri Mineral Drinking Water 1L Bottle", brand: "Bisleri", category: "Beverages & Tea", subcategory: "Packaged Water", barcode: "8906001010115", mrp: 20, sellingPrice: 20, purchaseCost: 15.0, profitMargin: 25.0, unit: "bottle", packageSize: "1 Litre", supplierId: "sup_bisleri", expiryDate: "2025-05-31", shelfLife: "6 Months", reorderLevel: 15, minStock: 8, maxStock: 60, avgDailyDemand: 8.5, productStatus: "Active", isDeadStock: false },
  { productId: "prod_43", sku: "GLUCON-D-ORANGE-200G", name: "Glucon-D Instant Energy Orange Refill 200g", brand: "Zydus Wellness", category: "Beverages & Tea", subcategory: "Energy Drinks", barcode: "8901117010113", mrp: 72, sellingPrice: 72, purchaseCost: 61.5, profitMargin: 14.6, unit: "box", packageSize: "200g", supplierId: "sup_bisleri", expiryDate: "2025-08-31", shelfLife: "18 Months", reorderLevel: 8, minStock: 4, maxStock: 35, avgDailyDemand: 2.2, productStatus: "Active", isDeadStock: false },
  { productId: "prod_44", sku: "RED-LABEL-TEA-100G", name: "Brooke Bond Red Label Tea Leaf 100g", brand: "Hindustan Unilever", category: "Beverages & Tea", subcategory: "Packaged Tea", barcode: "8901030383173", mrp: 55, sellingPrice: 55, purchaseCost: 47.0, profitMargin: 14.5, unit: "packet", packageSize: "100g", supplierId: "sup_hul", expiryDate: "2026-04-30", shelfLife: "18 Months", reorderLevel: 10, minStock: 5, maxStock: 40, avgDailyDemand: 3.6, productStatus: "Active", isDeadStock: false },

  // Cleaning & Other Detergents (3)
  { productId: "prod_45", sku: "WHEEL-ACTIVE-2IN1-1KG", name: "Wheel 2in1 Detergent Washing Powder 1kg", brand: "Hindustan Unilever", category: "Detergents & Cleaning", subcategory: "Washing Powders", barcode: "8901030383180", mrp: 64, sellingPrice: 64, purchaseCost: 55.0, profitMargin: 14.1, unit: "packet", packageSize: "1kg", supplierId: "sup_hul", expiryDate: "2026-06-30", shelfLife: "24 Months", reorderLevel: 8, minStock: 4, maxStock: 30, avgDailyDemand: 0.1, productStatus: "Active", isDeadStock: true }, // Intended Dead Stock for Demo
  { productId: "prod_46", sku: "VIM-DISHWASH-BAR-155G", name: "Vim Lemon Dishwash Bar 155g", brand: "Hindustan Unilever", category: "Detergents & Cleaning", subcategory: "Dishwash Bars", barcode: "8901030383197", mrp: 10, sellingPrice: 10, purchaseCost: 8.5, profitMargin: 15.0, unit: "bar", packageSize: "155g", supplierId: "sup_hul", expiryDate: "2026-07-31", shelfLife: "24 Months", reorderLevel: 20, minStock: 10, maxStock: 80, avgDailyDemand: 7.4, productStatus: "Active", isDeadStock: false },
  { productId: "prod_47", sku: "EXO-DISHWASH-ROUND-250G", name: "Exo Anti-Bacterial Dishwash Round Tub 250g", brand: "Jyothy Labs", category: "Detergents & Cleaning", subcategory: "Dishwash Bars", barcode: "8901044010113", mrp: 35, sellingPrice: 35, purchaseCost: 29.5, profitMargin: 15.7, unit: "tub", packageSize: "250g", supplierId: "sup_local_mandi", expiryDate: "2026-05-31", shelfLife: "24 Months", reorderLevel: 8, minStock: 4, maxStock: 30, avgDailyDemand: 1.8, productStatus: "Active", isDeadStock: false },

  // Local Staples & Snacks (3)
  { productId: "prod_48", sku: "LOCAL-KABULI-CHANA-500G", name: "Desi White Kabuli Chana Chickpeas 500g", brand: "Local FMCG", category: "Staples & Grains", subcategory: "Pulses & Dal", barcode: "8908001010118", mrp: 85, sellingPrice: 85, purchaseCost: 73.0, profitMargin: 14.1, unit: "packet", packageSize: "500g", supplierId: "sup_local_mandi", expiryDate: "2025-06-30", shelfLife: "9 Months", reorderLevel: 8, minStock: 4, maxStock: 30, avgDailyDemand: 1.9, productStatus: "Active", isDeadStock: false },
  { productId: "prod_49", sku: "LOCAL-JAGGERY-CUBE-1KG", name: "Organic Kolhapur Gur Jaggery Cubes 1kg", brand: "Local FMCG", category: "Staples & Grains", subcategory: "Sugar & Jaggery", barcode: "8908001010125", mrp: 70, sellingPrice: 70, purchaseCost: 59.0, profitMargin: 15.7, unit: "pack", packageSize: "1kg", supplierId: "sup_local_mandi", expiryDate: "2025-07-31", shelfLife: "12 Months", reorderLevel: 10, minStock: 5, maxStock: 40, avgDailyDemand: 2.8, productStatus: "Active", isDeadStock: false },
  { productId: "prod_50", sku: "LOCAL-MASALA-MURMURA-200G", name: "Karnataka Spicy Masala Puffed Murmura 200g", brand: "Local FMCG", category: "Biscuits & Snacks", subcategory: "Namkeen & Chips", barcode: "8908001010132", mrp: 25, sellingPrice: 25, purchaseCost: 20.0, profitMargin: 20.0, unit: "packet", packageSize: "200g", supplierId: "sup_local_mandi", expiryDate: "2025-03-31", shelfLife: "3 Months", reorderLevel: 12, minStock: 6, maxStock: 50, avgDailyDemand: 4.2, productStatus: "Active", isDeadStock: false }
];

// Helper: Seeded pseudo-random generator for reproducible datasets
let seed = 42;
function pseudoRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// 5. INVENTORY DATASET (for all 10 stores x 50 products = 500 records)
const inventory = [];
const deadStockItems = [];
const stockAlerts = [];

stores.forEach((store) => {
  products.forEach((prod) => {
    let availableQty = 0;
    let stockStatus = "Normal";
    let damagedQty = 0;
    let reservedQty = 0;
    let lastRestockDaysAgo = Math.floor(pseudoRandom() * 14) + 2;

    // Introduce varied conditions:
    // Dead stock items (e.g. prod_45 Wheel, prod_10 Milkmaid)
    if (prod.isDeadStock) {
      availableQty = Math.floor(pseudoRandom() * 30) + 40; // 40-70 units
      stockStatus = "Dead Stock";
      lastRestockDaysAgo = Math.floor(pseudoRandom() * 20) + 35; // 35-55 days ago
    } else if (prod.productId === "prod_01" && store.storeId === "store_ka_01") {
      // Demo store Parle-G: Critical Low Stock
      availableQty = 14;
      stockStatus = "Critical";
    } else if (prod.productId === "prod_08" && store.storeId === "store_ka_01") {
      // Demo store Maggi: Low Stock
      availableQty = 18;
      stockStatus = "Low Stock";
    } else {
      const randType = pseudoRandom();
      if (randType < 0.10) {
        // Low Stock
        availableQty = Math.floor(pseudoRandom() * (prod.reorderLevel - prod.minStock)) + prod.minStock;
        stockStatus = "Low Stock";
      } else if (randType < 0.16) {
        // Critical Stock
        availableQty = Math.floor(pseudoRandom() * prod.minStock);
        stockStatus = availableQty === 0 ? "Stocked Out" : "Critical";
      } else if (randType < 0.24) {
        // Overstock
        availableQty = Math.floor(pseudoRandom() * 20) + prod.maxStock;
        stockStatus = "Overstock";
      } else {
        // Normal Stock
        availableQty = Math.floor(pseudoRandom() * (prod.maxStock - prod.reorderLevel)) + prod.reorderLevel;
        stockStatus = "Normal";
      }
    }

    const restockDate = new Date();
    restockDate.setDate(restockDate.getDate() - lastRestockDaysAgo);

    const invRecord = {
      inventoryId: `inv_${store.storeId}_${prod.productId}`,
      storeId: store.storeId,
      productId: prod.productId,
      sku: prod.sku,
      productName: prod.name,
      availableQuantity: availableQty,
      reservedQuantity: reservedQty,
      damagedQuantity: damagedQty,
      reorderLevel: prod.reorderLevel,
      maxStock: prod.maxStock,
      stockValue: Math.round(availableQty * prod.purchaseCost),
      lastRestockDate: restockDate.toISOString().split("T")[0],
      expiryDate: prod.expiryDate,
      batchNumber: `BATCH_${prod.sku.slice(0, 4)}_${Math.floor(pseudoRandom() * 900 + 100)}`,
      stockStatus
    };
    inventory.push(invRecord);

    // Track Dead Stock for deadStock.json
    if (stockStatus === "Dead Stock" || (lastRestockDaysAgo >= 30 && availableQty > 20)) {
      const blockedCapital = Math.round(availableQty * prod.purchaseCost);
      deadStockItems.push({
        deadStockId: `ds_${store.storeId}_${prod.productId}`,
        storeId: store.storeId,
        productId: prod.productId,
        sku: prod.sku,
        productName: prod.name,
        category: prod.category,
        daysSinceLastSale: lastRestockDaysAgo,
        currentStock: availableQty,
        purchasePrice: prod.purchaseCost,
        avgDailyDemand: 0.1,
        estimatedBlockedCapital: blockedCapital,
        deadStockRisk: lastRestockDaysAgo > 40 ? "Extreme" : "High",
        suggestedDiscount: lastRestockDaysAgo > 40 ? 25 : 15,
        recommendedAction: `Promote clearance bundle with Parle-G at ${lastRestockDaysAgo > 40 ? 25 : 15}% off or request distributor buyback.`,
        bundlePartnerSku: "PARLE-G-100G",
        detectedAt: new Date().toISOString().split("T")[0]
      });

      stockAlerts.push({
        alertId: `alert_ds_${store.storeId}_${prod.productId}`,
        storeId: store.storeId,
        productId: prod.productId,
        sku: prod.sku,
        productName: prod.name,
        alertType: "Dead Stock",
        severity: "High",
        description: `${prod.name} has had zero sales in ${lastRestockDaysAgo} days. ₹${blockedCapital} blocked in dead capital.`,
        currentQuantity: availableQty,
        recommendedAction: "Apply 15-25% bundle promotion with fast-moving Parle-G to liquidate.",
        alertStatus: "Active",
        createdDate: new Date().toISOString().split("T")[0]
      });
    }

    // Generate Stock Alerts for Low / Critical / Overstock
    if (stockStatus === "Critical" || stockStatus === "Stocked Out") {
      stockAlerts.push({
        alertId: `alert_crit_${store.storeId}_${prod.productId}`,
        storeId: store.storeId,
        productId: prod.productId,
        sku: prod.sku,
        productName: prod.name,
        alertType: stockStatus === "Stocked Out" ? "Stockout" : "Critical Stock",
        severity: "Critical",
        description: `${prod.name} is at ${availableQty} units. Risk of customer stockout before next supplier mini-truck.`,
        currentQuantity: availableQty,
        recommendedAction: `Trigger purchase order of +${Math.ceil(prod.avgDailyDemand * 14)} units immediately.`,
        alertStatus: "Active",
        createdDate: new Date().toISOString().split("T")[0]
      });
    } else if (stockStatus === "Low Stock") {
      stockAlerts.push({
        alertId: `alert_low_${store.storeId}_${prod.productId}`,
        storeId: store.storeId,
        productId: prod.productId,
        sku: prod.sku,
        productName: prod.name,
        alertType: "Low Stock",
        severity: "Medium",
        description: `${prod.name} has ${availableQty} units remaining, below reorder point (${prod.reorderLevel}).`,
        currentQuantity: availableQty,
        recommendedAction: `Prepare reorder with ${prod.supplierId} before safety buffer depletes.`,
        alertStatus: "Active",
        createdDate: new Date().toISOString().split("T")[0]
      });
    } else if (stockStatus === "Overstock") {
      stockAlerts.push({
        alertId: `alert_over_${store.storeId}_${prod.productId}`,
        storeId: store.storeId,
        productId: prod.productId,
        sku: prod.sku,
        productName: prod.name,
        alertType: "Overstock",
        severity: "Low",
        description: `${prod.name} current stock (${availableQty}) exceeds maximum recommended holding level (${prod.maxStock}).`,
        currentQuantity: availableQty,
        recommendedAction: "Pause reordering until inventory naturally depletes to healthy levels.",
        alertStatus: "Active",
        createdDate: new Date().toISOString().split("T")[0]
      });
    }
  });
});

// 6. SALES HISTORY (30 Days of sales across 10 stores & 50 products, > 1,500 records)
const sales = [];
const transactions = [];
const paymentMethods = ["Cash", "Cash", "Cash", "UPI", "UPI", "Khata"];
const customerNames = [
  "Shankarappa (Farmer)", "Lakshmi Amma", "Venkatesh (Panchayat Clerk)",
  "Basappa Dairy", "Govindappa", "Savitri Teacher", "Nagaraju Auto",
  "Ramesh Tailor", "Anand Wireman", "Renuka Bai", "Mallikarjun", "Pushpa Aunty"
];

let saleCounter = 1;
let transCounter = 1;

for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - dayOffset);
  const dateStr = dateObj.toISOString().split("T")[0];
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

  stores.forEach((store) => {
    // Each store sells a realistic subset of products on any given day
    products.forEach((prod) => {
      // Dead stock products have 0 sales
      if (prod.isDeadStock) return;

      // Probability of sale on this day
      const dailyBaseProb = Math.min(0.95, prod.avgDailyDemand / 12);
      if (pseudoRandom() > dailyBaseProb) return;

      // Realistic demand volume with weekend bump (20-30% higher)
      const weekendMultiplier = isWeekend ? 1.25 : 1.0;
      const baseUnits = Math.max(1, Math.round(prod.avgDailyDemand * (0.6 + pseudoRandom() * 0.8) * weekendMultiplier));

      const pm = paymentMethods[Math.floor(pseudoRandom() * paymentMethods.length)];
      const cust = customerNames[Math.floor(pseudoRandom() * customerNames.length)];

      const totalRev = baseUnits * prod.sellingPrice;
      const cost = baseUnits * prod.purchaseCost;
      const profit = Math.round((totalRev - cost) * 100) / 100;

      const saleId = `sale_${String(saleCounter++).padStart(6, "0")}`;
      const invNum = `INV-${dateStr.replace(/-/g, "")}-${String(saleCounter).slice(-4)}`;

      sales.push({
        saleId,
        invoiceNumber: invNum,
        storeId: store.storeId,
        productId: prod.productId,
        sku: prod.sku,
        productName: prod.name,
        saleDate: dateStr,
        quantitySold: baseUnits,
        sellingPrice: prod.sellingPrice,
        discount: 0,
        totalRevenue: totalRev,
        costAmount: cost,
        profit,
        paymentMethod: pm,
        customerId: `cust_${(saleCounter % 20) + 1}`,
        customerName: cust
      });

      // Sample ~350 retail billing transactions
      if (pseudoRandom() < 0.25) {
        transactions.push({
          transactionId: `txn_${String(transCounter++).padStart(5, "0")}`,
          storeId: store.storeId,
          customerId: `cust_${(saleCounter % 20) + 1}`,
          customerName: cust,
          invoiceNumber: invNum,
          products: [
            { productId: prod.productId, productName: prod.name, quantity: baseUnits, unitPrice: prod.sellingPrice, total: totalRev }
          ],
          totalBill: totalRev,
          paymentMethod: pm,
          transactionDate: dateStr
        });
      }
    });
  });
}

// 7. PURCHASE ORDERS (35 Purchase Orders with different statuses)
const purchaseOrders = [];
const poStatuses = ["Pending", "Confirmed", "In Transit", "Delivered", "Delivered", "Cancelled"];
const poPaymentStatuses = ["Unpaid", "Paid", "Partially Paid", "Net-15 Credit"];

for (let i = 1; i <= 35; i++) {
  const store = stores[i % stores.length];
  const supplier = suppliers[i % suppliers.length];
  const status = poStatuses[i % poStatuses.length];
  const payStatus = status === "Delivered" ? "Paid" : poPaymentStatuses[i % poPaymentStatuses.length];

  const orderDaysAgo = Math.floor(pseudoRandom() * 25) + 1;
  const oDate = new Date();
  oDate.setDate(oDate.getDate() - orderDaysAgo);
  const orderDateStr = oDate.toISOString().split("T")[0];

  const eDate = new Date(oDate);
  eDate.setDate(eDate.getDate() + (supplier.avgDeliveryTime || 2));
  const expectedDateStr = eDate.toISOString().split("T")[0];

  let actualDateStr = "";
  if (status === "Delivered") {
    const aDate = new Date(eDate);
    if (i % 5 === 0) aDate.setDate(aDate.getDate() + 1); // 1-day delayed delivery
    actualDateStr = aDate.toISOString().split("T")[0];
  }

  // Filter products by supplier
  const supplierProds = products.filter(p => p.supplierId === supplier.supplierId);
  const chosenProds = supplierProds.length > 0 ? supplierProds : [products[i % products.length]];

  const items = chosenProds.map(p => {
    const qty = Math.floor(pseudoRandom() * 40) + 20;
    const cost = p.purchaseCost;
    return {
      productId: p.productId,
      sku: p.sku,
      productName: p.name,
      quantity: qty,
      unitPrice: cost,
      total: Math.round(qty * cost)
    };
  });

  const totalVal = items.reduce((sum, item) => sum + item.total, 0);

  purchaseOrders.push({
    orderId: `po_${String(i).padStart(3, "0")}`,
    poNumber: `PO-KIR-${oDate.getFullYear()}-${String(i).padStart(4, "0")}`,
    storeId: store.storeId,
    supplierId: supplier.supplierId,
    supplierName: supplier.name,
    items,
    totalOrderValue: totalVal,
    orderDate: orderDateStr,
    expectedDeliveryDate: expectedDateStr,
    actualDeliveryDate: actualDateStr,
    orderStatus: status,
    paymentStatus: payStatus,
    notes: status === "Delivered" ? "Restocked on shelves successfully" : "Awaiting mini-truck dispatch from APMC Mandi"
  });
}

// 8. LOGISTICS RECORDS (from Purchase Orders)
const logistics = purchaseOrders.map((po, idx) => {
  const isDelivered = po.orderStatus === "Delivered";
  const isDelayed = idx % 7 === 0;
  const status = isDelivered ? "Delivered" : isDelayed ? "Delayed" : "In Transit";

  return {
    shipmentId: `ship_${String(idx + 1).padStart(4, "0")}`,
    purchaseOrderId: po.orderId,
    supplierId: po.supplierId,
    supplierName: po.supplierName,
    storeId: po.storeId,
    vehicleType: idx % 3 === 0 ? "Tata Ace (Chota Hathi)" : idx % 3 === 1 ? "Mahindra Bolero Maxi Truck" : "Bajaj Maxima Cargo",
    driverReference: `Driver ${["Manjunath", "Raju", "Kishore", "Srinivas", "Ganesh"][idx % 5]} (${["KA-25-A-1234", "TN-45-B-5678", "AP-04-C-9012", "TS-08-D-3456"][idx % 4]})`,
    dispatchDate: po.orderDate,
    expectedArrival: po.expectedDeliveryDate,
    actualArrival: po.actualDeliveryDate || (isDelivered ? po.expectedDeliveryDate : ""),
    deliveryStatus: status,
    transportCost: Math.round(350 + pseudoRandom() * 400),
    distanceKm: Math.round(12 + pseudoRandom() * 35)
  };
});

// 9. AI DEMAND FORECASTS (For every Store x Product)
const forecasts = [];
stores.forEach((store) => {
  products.forEach((prod) => {
    // Filter sales for this store & product
    const storeProdSales = sales.filter(s => s.storeId === store.storeId && s.productId === prod.productId);
    const totalQtySold = storeProdSales.reduce((acc, s) => acc + s.quantitySold, 0);
    const avgDaily = storeProdSales.length > 0 ? totalQtySold / 30 : prod.avgDailyDemand;

    const last7DaysSales = storeProdSales.filter(s => {
      const d = new Date(s.saleDate);
      const diff = (Date.now() - d.getTime()) / (1000 * 3600 * 24);
      return diff <= 7;
    });
    const last7Demand = last7DaysSales.reduce((acc, s) => acc + s.quantitySold, 0);

    const trend = avgDaily > 5 ? "Increasing" : avgDaily < 1 ? "Decreasing" : "Stable";
    const trendFactor = trend === "Increasing" ? 1.1 : trend === "Decreasing" ? 0.9 : 1.0;
    const effectiveDaily = Math.max(0.1, (last7Demand > 0 ? (last7Demand / 7) : avgDaily) * trendFactor);

    const next7 = Math.ceil(effectiveDaily * 7);
    const next14 = Math.ceil(effectiveDaily * 14);
    const next30 = Math.ceil(effectiveDaily * 30);

    const inv = inventory.find(i => i.storeId === store.storeId && i.productId === prod.productId);
    const currentStock = inv ? inv.availableQuantity : 10;
    const reorderPoint = Math.ceil(effectiveDaily * 2 + prod.minStock);

    const suggestedReorder = currentStock <= reorderPoint ? Math.max(10, Math.ceil(effectiveDaily * 14 + prod.minStock - currentStock)) : 0;

    const rDate = new Date();
    rDate.setDate(rDate.getDate() + Math.max(0, Math.floor((currentStock - reorderPoint) / (effectiveDaily || 1))));

    forecasts.push({
      forecastId: `fc_${store.storeId}_${prod.productId}`,
      storeId: store.storeId,
      productId: prod.productId,
      sku: prod.sku,
      productName: prod.name,
      avgDailyDemand: Math.round(avgDaily * 10) / 10,
      last7DayDemand: last7Demand,
      last30DayDemand: totalQtySold,
      predictedNext7Days: next7,
      predictedNext14Days: next14,
      predictedNext30Days: next30,
      demandTrend: trend,
      confidenceScore: Math.round((0.82 + pseudoRandom() * 0.14) * 100) / 100,
      suggestedReorderQty: suggestedReorder,
      recommendedReorderDate: rDate.toISOString().split("T")[0],
      overstockRisk: currentStock > prod.maxStock ? "High" : "Low",
      stockoutRisk: currentStock <= 0 ? "Critical" : currentStock <= (effectiveDaily * 2) ? "High" : "Low",
      modelLabel: "DEMO Baseline Moving Average (Synthetic)"
    });
  });
});

// 10. CUSTOMERS (25 Rural Customers)
const customers = [
  { customerId: "cust_1", storeId: "store_ka_01", name: "Shankarappa Biradar", phone: "+91 94481 10001", village: "Bilaspur Gram", khataBalance: 450, totalVisits: 14, totalSpend: 3200, purchaseHistorySummary: "Daily milk, Parle-G, and weekly Fortune oil", registrationDate: "2024-01-15" },
  { customerId: "cust_2", storeId: "store_ka_01", name: "Lakshmi Bai", phone: "+91 94481 10002", village: "Bilaspur Gram", khataBalance: 0, totalVisits: 22, totalSpend: 4850, purchaseHistorySummary: "Staples, Tata salt, Rin cake, and Maggi", registrationDate: "2024-01-18" },
  { customerId: "cust_3", storeId: "store_ka_01", name: "Venkatesh Rao (Panchayat)", phone: "+91 94481 10003", village: "Bilaspur Gram", khataBalance: 1200, totalVisits: 18, totalSpend: 6200, purchaseHistorySummary: "Bulk tea leaves, sugar, and Aashirvaad atta 5kg", registrationDate: "2024-01-20" },
  { customerId: "cust_4", storeId: "store_ka_01", name: "Basappa Dairy Farmer", phone: "+91 94481 10004", village: "Bilaspur Gram", khataBalance: 320, totalVisits: 12, totalSpend: 2900, purchaseHistorySummary: "Biscuits, washing powder, and Everest spices", registrationDate: "2024-02-01" },
  { customerId: "cust_5", storeId: "store_ka_01", name: "Savitri Teacher", phone: "+91 94481 10005", village: "Bilaspur Gram", khataBalance: 0, totalVisits: 16, totalSpend: 3950, purchaseHistorySummary: "Dove shampoo, Good Day butter, and Amul butter", registrationDate: "2024-02-05" },
  { customerId: "cust_6", storeId: "store_ka_02", name: "Nagaraju Auto", phone: "+91 98450 20006", village: "Maddur Hobli", khataBalance: 150, totalVisits: 9, totalSpend: 1450, purchaseHistorySummary: "Biscuits, cold drinks, and cigarettes", registrationDate: "2024-02-10" },
  { customerId: "cust_7", storeId: "store_ka_02", name: "Ramesh Tailor", phone: "+91 98450 20007", village: "Maddur Hobli", khataBalance: 0, totalVisits: 15, totalSpend: 3100, purchaseHistorySummary: "Tea packets, sugar, and soap bars", registrationDate: "2024-02-12" },
  { customerId: "cust_8", storeId: "store_ka_03", name: "Mallikarjun Patil", phone: "+91 97410 30008", village: "Bailhongal", khataBalance: 850, totalVisits: 11, totalSpend: 4200, purchaseHistorySummary: "Sunflower oil, dal, and spices", registrationDate: "2024-02-15" },
  { customerId: "cust_9", storeId: "store_ka_04", name: "Gowramma", phone: "+91 99001 40009", village: "Channapatna", khataBalance: 0, totalVisits: 20, totalSpend: 5100, purchaseHistorySummary: "Monthly groceries package", registrationDate: "2024-02-20" },
  { customerId: "cust_10", storeId: "store_tn_01", name: "K. Subramanian", phone: "+91 94430 50010", village: "Papanasam", khataBalance: 600, totalVisits: 13, totalSpend: 2800, purchaseHistorySummary: "Coffee powder, milk, and Marie biscuits", registrationDate: "2024-02-25" },
  { customerId: "cust_11", storeId: "store_tn_02", name: "M. Ganesan", phone: "+91 98421 60011", village: "Pennagaram", khataBalance: 0, totalVisits: 17, totalSpend: 3400, purchaseHistorySummary: "Washing powder, salt, and edible oil", registrationDate: "2024-03-01" },
  { customerId: "cust_12", storeId: "store_ap_01", name: "B. Chennakesava", phone: "+91 94402 70012", village: "Palamaner", khataBalance: 400, totalVisits: 8, totalSpend: 1950, purchaseHistorySummary: "Rice, dal, and biscuits", registrationDate: "2024-03-05" },
  { customerId: "cust_13", storeId: "store_ap_02", name: "P. Sreenu", phone: "+91 98480 80013", village: "Dhone", khataBalance: 250, totalVisits: 14, totalSpend: 3100, purchaseHistorySummary: "Cooking oil, spices, and soap", registrationDate: "2024-03-10" },
  { customerId: "cust_14", storeId: "store_ts_01", name: "Yadagiri Goud", phone: "+91 99490 90014", village: "Narsapur", khataBalance: 0, totalVisits: 19, totalSpend: 4600, purchaseHistorySummary: "Atta, pulses, tea, and shampoo sachets", registrationDate: "2024-03-12" },
  { customerId: "cust_15", storeId: "store_mh_01", name: "Baburao Kadam", phone: "+91 98220 10015", village: "Shirol", khataBalance: 550, totalVisits: 10, totalSpend: 2600, purchaseHistorySummary: "Jaggery, tea, Parle-G, and mustard oil", registrationDate: "2024-03-15" }
];

// 11. PROMOTIONS & CAMPAIGNS
const promotions = [
  { promotionId: "promo_01", storeId: "store_ka_01", title: "Mandi Weekend Super Saver", type: "Weekend Offer", discountPercent: 10, applicableProducts: ["prod_01", "prod_08", "prod_23"], startDate: "2024-11-22", endDate: "2024-11-24", seasonalEvent: "Weekend Mandi Market", status: "Active" },
  { promotionId: "promo_02", storeId: "store_ka_01", title: "Dead Stock Clearance: Wheel Detergent 1kg", type: "Dead Stock Clearance", discountPercent: 20, applicableProducts: ["prod_45"], startDate: "2024-11-15", endDate: "2024-11-30", seasonalEvent: "Working Capital Liquidation", status: "Active" },
  { promotionId: "promo_03", storeId: "store_ka_01", title: "Diwali Sweet Delights Bundle", type: "Festival Sale", discountPercent: 15, applicableProducts: ["prod_10", "prod_14", "prod_37"], startDate: "2024-10-28", endDate: "2024-11-04", seasonalEvent: "Deepavali Festival", status: "Expired" },
  { promotionId: "promo_04", storeId: "store_ka_01", title: "Village Harvest Bulk Atta & Oil", type: "Bulk Discount", discountPercent: 8, applicableProducts: ["prod_20", "prod_26"], startDate: "2024-11-01", endDate: "2024-11-30", seasonalEvent: "Harvest Season", status: "Active" },
  { promotionId: "promo_05", storeId: "store_tn_01", title: "Pongal Special Festival Savings", type: "Festival Sale", discountPercent: 12, applicableProducts: ["prod_14", "prod_23", "prod_49"], startDate: "2025-01-12", endDate: "2025-01-18", seasonalEvent: "Pongal Celebration", status: "Scheduled" },
  { promotionId: "promo_06", storeId: "store_ap_01", title: "Sankranti Rural Khata Bonanza", type: "Festival Sale", discountPercent: 10, applicableProducts: ["prod_04", "prod_20", "prod_24"], startDate: "2025-01-10", endDate: "2025-01-16", seasonalEvent: "Makar Sankranti", status: "Scheduled" },
  { promotionId: "promo_07", storeId: "store_ka_02", title: "Ugadi New Year Household Refresh", type: "Festival Sale", discountPercent: 15, applicableProducts: ["prod_15", "prod_17", "prod_38"], startDate: "2025-03-25", endDate: "2025-04-02", seasonalEvent: "Ugadi New Year", status: "Scheduled" },
  { promotionId: "promo_08", storeId: "store_ka_01", title: "Independence Day Grama Offer", type: "Festival Sale", discountPercent: 10, applicableProducts: ["prod_01", "prod_06", "prod_42"], startDate: "2024-08-14", endDate: "2024-08-16", seasonalEvent: "Independence Day", status: "Expired" }
];

// 12. SEASONAL EVENTS
const seasonalEvents = [
  { eventId: "event_diwali", name: "Diwali (Festival of Lights)", period: "October - November", demandImpact: "High demand for Ghee, Sugar, Maida, Cooking Oil, Dry Fruits, and Biscuits", peakCategories: ["Cooking Oil & Ghee", "Staples & Grains", "Biscuits & Snacks"] },
  { eventId: "event_sankranti_pongal", name: "Makar Sankranti / Pongal Harvest", period: "January 13 - 17", demandImpact: "High demand for Jaggery, Rice, Ghee, Spices, and Edible Salt", peakCategories: ["Staples & Grains", "Cooking Oil & Ghee", "Spices & Condiments"] },
  { eventId: "event_ugadi", name: "Ugadi (Deccan New Year)", period: "March - April", demandImpact: "Surge in Jaggery, Tamarind, Neem flowers, Bath Soaps, and Detergents", peakCategories: ["Staples & Grains", "Personal Care", "Detergents & Cleaning"] },
  { eventId: "event_monsoon", name: "Monsoon Sowing Season", period: "June - August", demandImpact: "High daily demand for Hot Tea, Biscuits, Maggi noodles, and Antiseptics", peakCategories: ["Beverages & Tea", "Instant Food", "Personal Care"] },
  { eventId: "event_independence_day", name: "Independence Day / National Holidays", period: "August 15", demandImpact: "Community school sweet distributions, Parle-G, and packaged drinking water", peakCategories: ["Biscuits & Snacks", "Beverages & Tea"] }
];

// 13. DASHBOARD STATS (Aggregated baseline)
const totalRevAll = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
const totalCostAll = sales.reduce((sum, s) => sum + s.costAmount, 0);
const totalProfitAll = Math.round((totalRevAll - totalCostAll) * 100) / 100;
const totalInvVal = inventory.reduce((sum, i) => sum + i.stockValue, 0);
const lowStockCount = inventory.filter(i => ["Low Stock", "Critical", "Stocked Out"].includes(i.stockStatus)).length;
const overstockCount = inventory.filter(i => i.stockStatus === "Overstock").length;
const deadStockVal = deadStockItems.reduce((sum, d) => sum + d.estimatedBlockedCapital, 0);
const pendingPOs = purchaseOrders.filter(p => p.orderStatus === "Pending" || p.orderStatus === "Confirmed").length;

const dashboardStats = {
  totalProducts: products.length,
  totalStores: stores.length,
  totalSalesRecords: sales.length,
  totalRevenue: Math.round(totalRevAll),
  totalProfit: Math.round(totalProfitAll),
  totalInventoryValue: Math.round(totalInvVal),
  lowStockProducts: lowStockCount,
  overstockProducts: overstockCount,
  deadStockValue: Math.round(deadStockVal),
  nearExpiryProducts: 4,
  pendingPurchaseOrders: pendingPOs,
  avgDailySalesRevenue: Math.round(totalRevAll / 30),
  predictedNext7DaysDemandUnits: forecasts.reduce((sum, f) => sum + f.predictedNext7Days, 0),
  generatedAt: new Date().toISOString()
};

// Write all 16 JSON files into backend/data/
const fileMap = {
  "stores.json": stores,
  "categories.json": categories,
  "suppliers.json": suppliers,
  "products.json": products,
  "inventory.json": inventory,
  "sales.json": sales,
  "purchaseOrders.json": purchaseOrders,
  "logistics.json": logistics,
  "forecasts.json": forecasts,
  "stockAlerts.json": stockAlerts,
  "deadStock.json": deadStockItems,
  "customers.json": customers,
  "transactions.json": transactions,
  "promotions.json": promotions,
  "seasonalEvents.json": seasonalEvents,
  "dashboardStats.json": dashboardStats
};

for (const [filename, content] of Object.entries(fileMap)) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
  const count = Array.isArray(content) ? content.length : "Object";
  console.log(`✓ Generated ${filename} (${count} records)`);
}

console.log("\n✅ All 16 dataset JSON files successfully generated!");
