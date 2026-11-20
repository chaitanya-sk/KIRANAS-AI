import bcrypt from "bcryptjs";

// Realistic 18 Indian FMCG products specifically crafted for rural and semi-urban Kiranas
export const demoProducts = [
  {
    _id: "prod_01",
    name: "Parle-G Gold Biscuits (70g)",
    category: "Biscuits & Snacks",
    brand: "Parle",
    sku: "PRL-G-70G",
    barcode: "8901719101011",
    unit: "packet",
    stock: 14, // critically low
    purchasePrice: 8.5,
    sellingPrice: 10,
    dailySales: 12,
    leadTime: 2,
    safetyStock: 15,
    lastSaleDays: 0,
    supplier: "Shree Ram FMCG Distributors",
    supplierId: "sup_01",
    expiryDate: "2027-04-15",
    minStockLevel: 20
  },
  {
    _id: "prod_02",
    name: "Maggi 2-Minute Masala Noodles (70g)",
    category: "Instant Food",
    brand: "Nestle",
    sku: "MAG-MSL-70",
    barcode: "8901058852331",
    unit: "packet",
    stock: 18, // low stock
    purchasePrice: 11.8,
    sellingPrice: 14,
    dailySales: 9,
    leadTime: 2,
    safetyStock: 12,
    lastSaleDays: 0,
    supplier: "Metro Rural Logistics",
    supplierId: "sup_02",
    expiryDate: "2027-02-28",
    minStockLevel: 25
  },
  {
    _id: "prod_03",
    name: "Britannia Good Day Butter (65g)",
    category: "Biscuits & Snacks",
    brand: "Britannia",
    sku: "BRT-GD-65",
    barcode: "8901063012211",
    unit: "packet",
    stock: 6, // critical
    purchasePrice: 8.2,
    sellingPrice: 10,
    dailySales: 7,
    leadTime: 2,
    safetyStock: 10,
    lastSaleDays: 0,
    supplier: "Shree Ram FMCG Distributors",
    supplierId: "sup_01",
    expiryDate: "2027-03-10",
    minStockLevel: 15
  },
  {
    _id: "prod_04",
    name: "Tata Salt Vacuum Evaporated (1kg)",
    category: "Staples & Grains",
    brand: "Tata",
    sku: "TAT-SLT-1K",
    barcode: "8901262010012",
    unit: "kg",
    stock: 45, // healthy
    purchasePrice: 22,
    sellingPrice: 28,
    dailySales: 4,
    leadTime: 3,
    safetyStock: 10,
    lastSaleDays: 0,
    supplier: "Shree Ram FMCG Distributors",
    supplierId: "sup_01",
    expiryDate: "2027-11-20",
    minStockLevel: 20
  },
  {
    _id: "prod_05",
    name: "Fortune Sunlite Refined Sunflower Oil (1L Pouch)",
    category: "Cooking Oil & Ghee",
    brand: "Fortune",
    sku: "FRT-SUN-1L",
    barcode: "8906007281024",
    unit: "pouch",
    stock: 9, // low stock
    purchasePrice: 112,
    sellingPrice: 135,
    dailySales: 3,
    leadTime: 4,
    safetyStock: 6,
    lastSaleDays: 1,
    supplier: "Metro Rural Logistics",
    supplierId: "sup_02",
    expiryDate: "2027-08-15",
    minStockLevel: 12
  },
  {
    _id: "prod_06",
    name: "Surf Excel Quick Wash Sachet (15g)",
    category: "Detergents & Cleaning",
    brand: "HUL",
    sku: "SRF-EXC-15G",
    barcode: "8901030383013",
    unit: "sachet",
    stock: 160, // healthy
    purchasePrice: 1.6,
    sellingPrice: 2,
    dailySales: 16,
    leadTime: 2,
    safetyStock: 25,
    lastSaleDays: 0,
    supplier: "Hindustan Consumer Supply",
    supplierId: "sup_03",
    expiryDate: "2028-01-01",
    minStockLevel: 50
  },
  {
    _id: "prod_07",
    name: "Colgate Strong Teeth Toothpaste (100g)",
    category: "Personal Care",
    brand: "Colgate",
    sku: "COL-ST-100",
    barcode: "8901314010115",
    unit: "tube",
    stock: 8, // critical
    purchasePrice: 52,
    sellingPrice: 65,
    dailySales: 3,
    leadTime: 3,
    safetyStock: 6,
    lastSaleDays: 0,
    supplier: "Hindustan Consumer Supply",
    supplierId: "sup_03",
    expiryDate: "2027-09-30",
    minStockLevel: 12
  },
  {
    _id: "prod_08",
    name: "Clinic Plus Strong & Long Shampoo Sachet (6ml)",
    category: "Personal Care",
    brand: "HUL",
    sku: "CLN-PLS-6ML",
    barcode: "8901030005113",
    unit: "sachet",
    stock: 22, // critical! High velocity, low stock
    purchasePrice: 0.8,
    sellingPrice: 1,
    dailySales: 18,
    leadTime: 2,
    safetyStock: 30,
    lastSaleDays: 0,
    supplier: "Hindustan Consumer Supply",
    supplierId: "sup_03",
    expiryDate: "2028-06-30",
    minStockLevel: 40
  },
  {
    _id: "prod_09",
    name: "Wheel 2-in-1 Active Detergent Powder (1kg)",
    category: "Detergents & Cleaning",
    brand: "Wheel",
    sku: "WHL-ACT-1KG",
    barcode: "8901030291114",
    unit: "kg",
    stock: 75, // dead stock candidate! Unsold for 26 days
    purchasePrice: 64,
    sellingPrice: 78,
    dailySales: 0.1,
    leadTime: 3,
    safetyStock: 8,
    lastSaleDays: 26,
    supplier: "Hindustan Consumer Supply",
    supplierId: "sup_03",
    expiryDate: "2027-10-15",
    minStockLevel: 15
  },
  {
    _id: "prod_10",
    name: "Brooke Bond Red Label Tea (250g)",
    category: "Beverages & Tea",
    brand: "Red Label",
    sku: "RED-LBL-250",
    barcode: "8901030114222",
    unit: "box",
    stock: 35, // slow moving, 16 days since last sale
    purchasePrice: 110,
    sellingPrice: 130,
    dailySales: 0.5,
    leadTime: 3,
    safetyStock: 6,
    lastSaleDays: 16,
    supplier: "Metro Rural Logistics",
    supplierId: "sup_02",
    expiryDate: "2027-05-15",
    minStockLevel: 10
  },
  {
    _id: "prod_11",
    name: "Parachute 100% Pure Coconut Oil (100ml)",
    category: "Personal Care",
    brand: "Marico",
    sku: "PAR-COC-100",
    barcode: "8901088012111",
    unit: "bottle",
    stock: 28, // healthy
    purchasePrice: 38,
    sellingPrice: 48,
    dailySales: 2,
    leadTime: 3,
    safetyStock: 6,
    lastSaleDays: 1,
    supplier: "Metro Rural Logistics",
    supplierId: "sup_02",
    expiryDate: "2027-12-31",
    minStockLevel: 10
  },
  {
    _id: "prod_12",
    name: "Premium Unpolished Toor Dal (1kg)",
    category: "Staples & Grains",
    brand: "Local Mandi",
    sku: "TOR-DAL-1K",
    barcode: "8904000100012",
    unit: "kg",
    stock: 50, // healthy
    purchasePrice: 135,
    sellingPrice: 160,
    dailySales: 3,
    leadTime: 4,
    safetyStock: 10,
    lastSaleDays: 0,
    supplier: "Shree Ram FMCG Distributors",
    supplierId: "sup_01",
    expiryDate: "2027-06-30",
    minStockLevel: 15
  },
  {
    _id: "prod_13",
    name: "Everest Turmeric / Haldi Powder (100g)",
    category: "Spices & Condiments",
    brand: "Everest",
    sku: "EVR-HLD-100",
    barcode: "8901786101111",
    unit: "box",
    stock: 30, // healthy
    purchasePrice: 28,
    sellingPrice: 36,
    dailySales: 2,
    leadTime: 3,
    safetyStock: 6,
    lastSaleDays: 1,
    supplier: "Balaji Agencies",
    supplierId: "sup_04",
    expiryDate: "2027-09-10",
    minStockLevel: 10
  },
  {
    _id: "prod_14",
    name: "Aashirvaad Shudh Chakki Atta (5kg)",
    category: "Staples & Grains",
    brand: "ITC",
    sku: "ASH-ATT-5KG",
    barcode: "8901030022341",
    unit: "bag",
    stock: 12, // low stock
    purchasePrice: 220,
    sellingPrice: 260,
    dailySales: 3,
    leadTime: 3,
    safetyStock: 6,
    lastSaleDays: 0,
    supplier: "Shree Ram FMCG Distributors",
    supplierId: "sup_01",
    expiryDate: "2027-04-30",
    minStockLevel: 10
  },
  {
    _id: "prod_15",
    name: "Dettol Original Bathing Soap (75g)",
    category: "Personal Care",
    brand: "Reckitt",
    sku: "DTL-SOP-75G",
    barcode: "8901396010012",
    unit: "bar",
    stock: 40, // healthy
    purchasePrice: 32,
    sellingPrice: 40,
    dailySales: 4,
    leadTime: 2,
    safetyStock: 10,
    lastSaleDays: 0,
    supplier: "Hindustan Consumer Supply",
    supplierId: "sup_03",
    expiryDate: "2028-02-15",
    minStockLevel: 15
  },
  {
    _id: "prod_16",
    name: "MDH Deggi Mirch Powder (100g)",
    category: "Spices & Condiments",
    brand: "MDH",
    sku: "MDH-DGM-100",
    barcode: "8901234567890",
    unit: "box",
    stock: 58, // dead stock candidate! Unsold for 29 days
    purchasePrice: 72,
    sellingPrice: 90,
    dailySales: 0.05,
    leadTime: 3,
    safetyStock: 5,
    lastSaleDays: 29,
    supplier: "Balaji Agencies",
    supplierId: "sup_04",
    expiryDate: "2027-08-30",
    minStockLevel: 10
  },
  {
    _id: "prod_17",
    name: "Sunfeast Dark Fantasy Choco Fills (75g)",
    category: "Biscuits & Snacks",
    brand: "ITC",
    sku: "DRK-FNT-75G",
    barcode: "8901030456123",
    unit: "box",
    stock: 42, // slow moving in rural store, 18 days without sale
    purchasePrice: 31,
    sellingPrice: 40,
    dailySales: 0.3,
    leadTime: 2,
    safetyStock: 6,
    lastSaleDays: 18,
    supplier: "Shree Ram FMCG Distributors",
    supplierId: "sup_01",
    expiryDate: "2027-03-25",
    minStockLevel: 10
  },
  {
    _id: "prod_18",
    name: "Tata Tea Premium Leaf (500g Pouch)",
    category: "Beverages & Tea",
    brand: "Tata",
    sku: "TAT-TEA-500",
    barcode: "8901262021111",
    unit: "pouch",
    stock: 25, // healthy
    purchasePrice: 195,
    sellingPrice: 240,
    dailySales: 2,
    leadTime: 3,
    safetyStock: 5,
    lastSaleDays: 1,
    supplier: "Metro Rural Logistics",
    supplierId: "sup_02",
    expiryDate: "2027-10-31",
    minStockLevel: 8
  }
];

export const demoSuppliers = [
  {
    _id: "sup_01",
    name: "Shree Ram FMCG Distributors",
    contactPerson: "Rajesh Agrawal",
    phone: "+91 98260 11223",
    email: "shreeram.distributors@gmail.com",
    address: "Godown 4, APMC Mandi Yard, Dist. Mandi",
    categories: ["Biscuits & Snacks", "Staples & Grains"],
    leadTimeDays: 2,
    minOrderQuantity: 15,
    rating: 4.8,
    active: true
  },
  {
    _id: "sup_02",
    name: "Metro Rural Logistics & Wholesale",
    contactPerson: "Sunil Verma",
    phone: "+91 94120 44556",
    email: "sunil.metrofmcg@outlook.com",
    address: "Plot 18, National Highway Bypass, Sector 4",
    categories: ["Instant Food", "Cooking Oil & Ghee", "Beverages & Tea"],
    leadTimeDays: 3,
    minOrderQuantity: 20,
    rating: 4.6,
    active: true
  },
  {
    _id: "sup_03",
    name: "Hindustan Consumer Supply Co.",
    contactPerson: "Manoj Tiwari",
    phone: "+91 98930 77889",
    email: "tiwari.hulagency@yahoo.com",
    address: "Old Grain Market, Near Railway Goods Shed",
    categories: ["Detergents & Cleaning", "Personal Care"],
    leadTimeDays: 2,
    minOrderQuantity: 30,
    rating: 4.9,
    active: true
  },
  {
    _id: "sup_04",
    name: "Balaji Agencies & Spices Hub",
    contactPerson: "Dinesh Patel",
    phone: "+91 97550 33441",
    email: "balajispices.mandi@gmail.com",
    address: "Shop 12, Spice Market Road, Kotwali Chowk",
    categories: ["Spices & Condiments"],
    leadTimeDays: 3,
    minOrderQuantity: 10,
    rating: 4.4,
    active: true
  }
];

// Helper to generate 30 days of realistic sales transactions
function generatePastSales() {
  const sales = [];
  const now = new Date();
  const paymentMethods = ["Cash", "Cash", "UPI", "Cash", "Khata"];
  const customers = [
    "Ramesh Patel",
    "Suresh Yadav",
    "Pooja Devi",
    "Santosh Verma",
    "Anil Kumar",
    "Sunita Devi",
    "Gopal Singh",
    "Dharmendra",
    "Walk-in Customer",
    "Walk-in Customer"
  ];

  // Fast sellers get sales almost every day
  const dailyPlan = [
    { name: "Parle-G Gold Biscuits (70g)", price: 10, dailyAvg: 12, id: "prod_01" },
    { name: "Clinic Plus Strong & Long Shampoo Sachet (6ml)", price: 1, dailyAvg: 18, id: "prod_08" },
    { name: "Maggi 2-Minute Masala Noodles (70g)", price: 14, dailyAvg: 9, id: "prod_02" },
    { name: "Britannia Good Day Butter (65g)", price: 10, dailyAvg: 7, id: "prod_03" },
    { name: "Surf Excel Quick Wash Sachet (15g)", price: 2, dailyAvg: 16, id: "prod_06" },
    { name: "Tata Salt Vacuum Evaporated (1kg)", price: 28, dailyAvg: 4, id: "prod_04" },
    { name: "Dettol Original Bathing Soap (75g)", price: 40, dailyAvg: 4, id: "prod_15" },
    { name: "Fortune Sunlite Refined Sunflower Oil (1L Pouch)", price: 135, dailyAvg: 3, id: "prod_05" },
    { name: "Colgate Strong Teeth Toothpaste (100g)", price: 65, dailyAvg: 3, id: "prod_07" },
    { name: "Aashirvaad Shudh Chakki Atta (5kg)", price: 260, dailyAvg: 3, id: "prod_14" },
    { name: "Premium Unpolished Toor Dal (1kg)", price: 160, dailyAvg: 3, id: "prod_12" }
  ];

  let invoiceCount = 1001;

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const saleDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);

    for (const item of dailyPlan) {
      // simulate realistic variation around daily average
      const factor = 0.7 + (Math.sin(dayOffset + item.price) * 0.3);
      const qtySold = Math.max(1, Math.round(item.dailyAvg * factor));

      sales.push({
        _id: `sale_${invoiceCount}`,
        invoiceNumber: `INV-${invoiceCount}`,
        productId: item.id,
        productName: item.name,
        quantity: qtySold,
        unitPrice: item.price,
        total: qtySold * item.price,
        paymentMethod: paymentMethods[invoiceCount % paymentMethods.length],
        customerName: customers[invoiceCount % customers.length],
        soldAt: saleDate
      });
      invoiceCount++;
    }
  }

  // Reverse so newest are first
  return sales.reverse();
}

export const demoSales = generatePastSales();

export const demoOrders = [
  {
    _id: "po_101",
    poNumber: "PO-2026-089",
    supplier: "Shree Ram FMCG Distributors",
    supplierPhone: "+91 98260 11223",
    items: [
      { productId: "prod_01", productName: "Parle-G Gold Biscuits (70g)", quantity: 48, unitPrice: 8.5 },
      { productId: "prod_03", productName: "Britannia Good Day Butter (65g)", quantity: 30, unitPrice: 8.2 }
    ],
    total: 48 * 8.5 + 30 * 8.2, // 654
    status: "In Transit",
    expectedDelivery: "Tomorrow by 2:00 PM",
    notes: "Direct rural mini-truck delivery",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000)
  },
  {
    _id: "po_102",
    poNumber: "PO-2026-088",
    supplier: "Hindustan Consumer Supply Co.",
    supplierPhone: "+91 98930 77889",
    items: [
      { productId: "prod_08", productName: "Clinic Plus Strong & Long Shampoo Sachet (6ml)", quantity: 150, unitPrice: 0.8 },
      { productId: "prod_07", productName: "Colgate Strong Teeth Toothpaste (100g)", quantity: 24, unitPrice: 52 }
    ],
    total: 150 * 0.8 + 24 * 52, // 1368
    status: "Dispatched",
    expectedDelivery: "In 2 days",
    notes: "Weekly replenishment batch",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000)
  },
  {
    _id: "po_103",
    poNumber: "PO-2026-085",
    supplier: "Metro Rural Logistics & Wholesale",
    supplierPhone: "+91 94120 44556",
    items: [
      { productId: "prod_05", productName: "Fortune Sunlite Refined Sunflower Oil (1L Pouch)", quantity: 20, unitPrice: 112 },
      { productId: "prod_02", productName: "Maggi 2-Minute Masala Noodles (70g)", quantity: 60, unitPrice: 11.8 }
    ],
    total: 20 * 112 + 60 * 11.8, // 2948
    status: "Delivered",
    expectedDelivery: "Delivered on 17 Nov",
    notes: "Order delivered & verified into stock",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000)
  }
];

export const demoUser = {
  _id: "user_demo_01",
  name: "Ramesh Sharma",
  email: "shopkeeper@kiranas.in",
  shopName: "Sharma General & Kirana Store",
  location: "Main Mandi Road, Gram Panchayat Bilaspur",
  phone: "+91 98765 43210",
  role: "retailer"
};

// Return a deep clone of the initial memory state
export function createInitialStore() {
  return {
    products: JSON.parse(JSON.stringify(demoProducts)),
    suppliers: JSON.parse(JSON.stringify(demoSuppliers)),
    sales: JSON.parse(JSON.stringify(demoSales)),
    orders: JSON.parse(JSON.stringify(demoOrders)),
    users: [
      {
        ...demoUser,
        passwordHash: bcrypt.hashSync("kirana123", 10)
      },
      {
        _id: "user_demo_02",
        name: "Demo Retailer",
        email: "demo@kiranas.in",
        shopName: "KIRANAS Demo Mart",
        location: "Kisan Mandi, Ward 3",
        phone: "+91 98111 22334",
        role: "retailer",
        passwordHash: bcrypt.hashSync("demo123", 10)
      }
    ]
  };
}
