import re
import codecs

translations = """const MARKET_I18N = {
  en: {
    title: "Farmer Marketplace", browseItems: "Browse Items", sellItem: "Sell Item", dashboard: "Dashboard",
    loginRegister: "Login / Register", loginTitle: "Login to Marketplace", registerTitle: "Create Farmer Account",
    fullName: "Full Name", location: "Village / City Location", mobileNumber: "Mobile Number", password: "Password",
    loginBtn: "Login", signupBtn: "Sign Up", wait: "Please wait...", noAccount: "Don't have an account? Register",
    hasAccount: "Already have an account? Login", searchPlaceholder: "Search tools, seeds, fertilizers...",
    cat_all: "All Categories", cat_tools: "Tools", cat_machines: "Machines", cat_seeds: "Seeds",
    cat_fertilizers: "Fertilizers", cat_pesticides: "Pesticides", newest: "Newest First", priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low", loading: "Loading products...", noProducts: "No products found matching your criteria.",
    welcome: "Welcome", verifiedFarmer: "Verified Farmer \u2713", farmer: "Farmer", yourListings: "Your Listings",
    noListings: "You haven't listed any items yet.", soldMark: "SOLD", markSold: "Mark Sold", markAvailable: "Mark Available",
    listNewItem: "List New Item", productName: "Product Name", categoryLabel: "Category", priceLabel: "Price (\u20B9)",
    descriptionLabel: "Product Description", descriptionPlaceholder: "Detail condition, features, age...",
    sellerLocation: "Seller Location", contactNumber: "Contact Number", uploadImages: "Upload Images (Max 3)",
    uploadClick: "Click to select images", postListing: "Post Listing", posting: "Posting...", backToBrowse: "\u2190 Back to Browse",
    descTitle: "Description", sellerDetails: "Seller Details", verifiedSeller: "Verified Seller", callSeller: "Call Seller",
    whatsapp: "WhatsApp", errDelete: "Error deleting product", errStatus: "Error updating status", errList: "Error listing product",
    confirmDelete: "Delete this listing?", successList: "Product listed successfully!",
    prod_UsedTractor: "Used Tractor (2018)", prod_WheatSeeds: "Premium Wheat Seeds", prod_WaterPump: "Water Pump 2HP",
    loc_Punjab: "Ludhiana, Punjab", loc_Haryana: "Karnal, Haryana"
  },
  hi: {
    title: "\u0915\u093F\u0938\u093E\u0928 \u092C\u093E\u091C\u093C\u093E\u0930", browseItems: "\u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0926\u0947\u0916\u0947\u0902", sellItem: "\u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u092C\u0947\u091A\u0947\u0902", dashboard: "\u0921\u0948\u0936\u092C\u094B\u0930\u094D\u0921",
    loginRegister: "\u0932\u0949\u0917\u093F\u0928 / \u092A\u0902\u091C\u0940\u0915\u0930\u0923", loginTitle: "\u092C\u093E\u091C\u093C\u093E\u0930 \u092E\u0947\u0902 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902", registerTitle: "\u0915\u093F\u0938\u093E\u0928 \u0916\u093E\u0924\u093E \u092C\u0928\u093E\u090F\u0901",
    fullName: "\u092A\u0942\u0930\u093E \u0928\u093E\u092E", location: "\u0917\u093E\u0902\u0935 / \u0936\u0939\u0930 \u0915\u093E \u0938\u094D\u0925\u093E\u0928", mobileNumber: "\u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930", password: "\u092A\u093E\u0938\u0935\u0930\u094D\u0921",
    loginBtn: "\u0932\u0949\u0917\u093F\u0928", signupBtn: "\u092A\u0902\u091C\u0940\u0915\u0930\u0923", wait: "\u0915\u0943\u092A\u092F\u093E \u092A\u094D\u0930\u0924\u0940\u0915\u094D\u0937\u093E \u0915\u0930\u0947\u0902...", noAccount: "\u0916\u093E\u0924\u093E \u0928\u0939\u0940\u0902 \u0939\u0948? \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0915\u0930\u0947\u0902",
    hasAccount: "\u092A\u0939\u0932\u0947 \u0938\u0947 \u0916\u093E\u0924\u093E \u0939\u0948? \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902", searchPlaceholder: "\u0909\u092A\u0915\u0930\u0923, \u092C\u0940\u091C, \u0909\u0930\u094D\u0935\u0930\u0915 \u0916\u094B\u091C\u0947\u0902...",
    cat_all: "\u0938\u092D\u0940 \u0936\u094D\u0930\u0947\u0923\u093F\u092F\u093E\u0902", cat_tools: "\u0909\u092A\u0915\u0930\u0923", cat_machines: "\u092E\u0936\u0940\u0928\u0947\u0902", cat_seeds: "\u092C\u0940\u091C",
    cat_fertilizers: "\u0909\u0930\u094D\u0935\u0930\u0915", cat_pesticides: "\u0915\u0940\u091F\u0928\u093E\u0936\u0915", newest: "\u0938\u092C\u0938\u0947 \u0928\u092F\u093E \u092A\u0939\u0932\u0947", priceAsc: "\u092E\u0942\u0932\u094D\u092F: \u0915\u092E \u0938\u0947 \u0905\u0927\u093F\u0915",
    priceDesc: "\u092E\u0942\u0932\u094D\u092F: \u0905\u0927\u093F\u0915 \u0938\u0947 \u0915\u092E", loading: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u0947 \u0939\u0948\u0902...", noProducts: "\u0906\u092A\u0915\u0947 \u092E\u093E\u092A\u0926\u0902\u0921 \u0938\u0947 \u092E\u0947\u0932 \u0916\u093E\u0928\u0947 \u0935\u093E\u0932\u093E \u0915\u094B\u0908 \u0909\u0924\u094D\u092A\u093E\u0926 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964",
    welcome: "\u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948", verifiedFarmer: "\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0915\u093F\u0938\u093E\u0928 \u2713", farmer: "\u0915\u093F\u0938\u093E\u0928", yourListings: "\u0906\u092A\u0915\u0940 \u0932\u093F\u0938\u094D\u091F\u093F\u0902\u0917",
    noListings: "\u0906\u092A\u0928\u0947 \u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0938\u0942\u091A\u0940\u092C\u0926\u094D\u0927 \u0928\u0939\u0940\u0902 \u0915\u0940 \u0939\u0948\u0964", soldMark: "\u092C\u093F\u0915 \u0917\u092F\u093E", markSold: "\u092C\u093F\u0915 \u0917\u092F\u093E \u091A\u0941\u0928\u0947\u0902", markAvailable: "\u0909\u092A\u0932\u092C\u094D\u0927 \u091A\u0941\u0928\u0947\u0902",
    listNewItem: "\u0928\u0908 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0938\u0942\u091A\u0940\u092C\u0926\u094D\u0927 \u0915\u0930\u0947\u0902", productName: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0915\u093E \u0928\u093E\u092E", categoryLabel: "\u0936\u094D\u0930\u0947\u0923\u0940", priceLabel: "\u092E\u0942\u0932\u094D\u092F (\u20B9)",
    descriptionLabel: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0935\u093F\u0935\u0930\u0923", descriptionPlaceholder: "\u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0938\u094D\u0925\u093F\u0924\u093F, \u0935\u093F\u0936\u0947\u0937\u0924\u093E\u090F\u0902, \u0909\u092E\u094D\u0930...",
    sellerLocation: "\u0935\u093F\u0915\u094D\u0930\u0947\u0924\u093E \u0915\u093E \u0938\u094D\u0925\u093E\u0928", contactNumber: "\u0938\u0902\u092A\u0930\u094D\u0915 \u0928\u0902\u092C\u0930", uploadImages: "\u091A\u093F\u0924\u094D\u0930 \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902 (\u0905\u0927\u093F\u0915\u0924\u092E 3)",
    uploadClick: "\u091A\u093F\u0924\u094D\u0930 \u091A\u0941\u0928\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902", postListing: "\u0932\u093F\u0938\u094D\u091F\u093F\u0902\u0917 \u092A\u094B\u0938\u094D\u091F \u0915\u0930\u0947\u0902", posting: "\u092A\u094B\u0938\u094D\u091F \u0915\u093F\u092F\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948...", backToBrowse: "\u2190 \u092C\u094D\u0930\u093E\u0909\u091C\u093C \u092A\u0930 \u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902",
    descTitle: "\u0935\u093F\u0935\u0930\u0923", sellerDetails: "\u0935\u093F\u0915\u094D\u0930\u0947\u0924\u093E \u0915\u093E \u0935\u093F\u0935\u0930\u0923", verifiedSeller: "\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0935\u093F\u0915\u094D\u0930\u0947\u0924\u093E", callSeller: "\u0935\u093F\u0915\u094D\u0930\u0947\u0924\u093E \u0915\u094B \u0915\u0949\u0932 \u0915\u0930\u0947\u0902",
    whatsapp: "WhatsApp", errDelete: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0939\u091F\u093E\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F", errStatus: "\u0938\u094D\u0925\u093F\u0924\u093F \u0905\u092A\u0921\u0947\u091F \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F", errList: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0938\u0942\u091A\u0940\u092C\u0926\u094D\u0927 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F",
    confirmDelete: "\u0915\u094D\u092F\u093E \u0906\u092A \u0907\u0938 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0915\u094B \u0939\u091F\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?", successList: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0942\u091A\u0940\u092C\u0926\u094D\u0927 \u0915\u093F\u092F\u093E \u0917\u092F\u093E!",
    prod_UsedTractor: "\u092A\u0941\u0930\u093E\u0928\u093E \u091F\u094D\u0930\u0948\u0915\u094D\u091F\u0930 (2018)", prod_WheatSeeds: "\u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u0917\u0947\u0939\u0942\u0902 \u0915\u0947 \u092C\u0940\u091C", prod_WaterPump: "\u0935\u093E\u091F\u0930 \u092A\u0902\u092A 2 \u090F\u091A\u092A\u0940",
    loc_Punjab: "\u0932\u0941\u0927\u093F\u092F\u093E\u0928\u093E, \u092A\u0902\u091C\u093E\u092C", loc_Haryana: "\u0915\u0930\u0928\u093E\u0932, \u0939\u0930\u092F\u093E\u0923\u093E"
  },
  pa: {
    title: "\u0A15\u0A3F\u0A38\u0A3E\u0A28 \u0A2C\u0A3E\u0A1C\u0A3C\u0A3E\u0A30", browseItems: "\u0A38\u0A2E\u0A3E\u0A28 \u0A26\u0A47\u0A16\u0A4B", sellItem: "\u0A38\u0A2E\u0A3E\u0A28 \u0A35\u0A47\u0A1A\u0A4B", dashboard: "\u0A21\u0A48\u0A38\u0A3C\u0A2C\u0A4B\u0A30\u0A21",
    loginRegister: "\u0A32\u0A3E\u0A17\u0A07\u0A28 / \u0A30\u0A1C\u0A3F\u0A38\u0A1F\u0A30", loginTitle: "\u0A2C\u0A3E\u0A1C\u0A3C\u0A3E\u0A30 \u0A35\u0A3F\u0A71\u0A1A \u0A32\u0A3E\u0A17\u0A07\u0A28 \u0A15\u0A30\u0A4B", registerTitle: "\u0A15\u0A3F\u0A38\u0A3E\u0A28 \u0A16\u0A3E\u0A24\u0A3E \u0A2C\u0A23\u0A3E\u0A13",
    fullName: "\u0A2A\u0A42\u0A30\u0A3E \u0A28\u0A3E\u0A02", location: "\u0A2A\u0A3F\u0A70\u0A21 / \u0A38\u0A3C\u0A39\u0A3F\u0A30", mobileNumber: "\u0A2E\u0A4B\u0A2C\u0A3E\u0A07\u0A32 \u0A28\u0A70\u0A2C\u0A30", password: "\u0A2A\u0A3E\u0A38\u0A35\u0A30\u0A21",
    loginBtn: "\u0A32\u0A3E\u0A17\u0A07\u0A28", signupBtn: "\u0A30\u0A1C\u0A3F\u0A38\u0A1F\u0A30", wait: "\u0A15\u0A3F\u0A30\u0A2A\u0A3E \u0A09\u0A21\u0A40\u0A15 \u0A15\u0A30\u0A4B...", noAccount: "\u0A16\u0A3E\u0A24\u0A3E \u0A28\u0A39\u0A40\u0A02? \u0A30\u0A1C\u0A3F\u0A38\u0A1F\u0A30 \u0A15\u0A30\u0A4B",
    hasAccount: "\u0A2A\u0A39\u0A3F\u0A32\u0A3E\u0A02 \u0A39\u0A40 \u0A16\u0A3E\u0A24\u0A3E \u0A39\u0A48? \u0A32\u0A3E\u0A17\u0A07\u0A28 \u0A15\u0A30\u0A4B", searchPlaceholder: "\u0A14\u0A1C\u0A3C\u0A3E\u0A30, \u0A2C\u0A40\u0A1C, \u0A16\u0A3E\u0A26 \u0A32\u0A71\u0A2D\u0A4B...",
    cat_all: "\u0A38\u0A3E\u0A30\u0A40\u0A06\u0A02", cat_tools: "\u0A14\u0A1C\u0A3C\u0A3E\u0A30", cat_machines: "\u0A2E\u0A38\u0A3C\u0A40\u0A28\u0A3E\u0A02", cat_seeds: "\u0A2C\u0A40\u0A1C",
    cat_fertilizers: "\u0A16\u0A3E\u0A26", cat_pesticides: "\u0A15\u0A40\u0A1F\u0A28\u0A3E\u0A38\u0A3C\u0A15", newest: "\u0A38\u0A2D \u0A24\u0A4B\u0A02 \u0A28\u0A35\u0A3E\u0A02", priceAsc: "\u0A2E\u0A41\u0A71\u0A32: \u0A18\u0A71\u0A1F \u0A24\u0A4B\u0A02 \u0A35\u0A71\u0A27",
    priceDesc: "\u0A2E\u0A41\u0A71\u0A32: \u0A35\u0A71\u0A27 \u0A24\u0A4B\u0A02 \u0A18\u0A71\u0A1F", loading: "\u0A09\u0A24\u0A2A\u0A3E\u0A26 \u0A32\u0A4B\u0A21 \u0A39\u0A4B \u0A30\u0A39\u0A47 \u0A39\u0A28...", noProducts: "\u0A15\u0A4B\u0A08 \u0A09\u0A24\u0A2A\u0A3E\u0A26 \u0A28\u0A39\u0A40\u0A02 \u0A2E\u0A3F\u0A32\u0A3F\u0A06.",
    welcome: "\u0A38\u0A41\u0A06\u0A17\u0A24 \u0A39\u0A48", verifiedFarmer: "\u0A38\u0A3C\u0A3E\u0A2E\u0A32 \u0A15\u0A3F\u0A38\u0A3E\u0A28 \u2713", farmer: "\u0A15\u0A3F\u0A38\u0A3E\u0A28", yourListings: "\u0A24\u0A41\u0A39\u0A3E\u0A21\u0A4B \u0A38\u0A2E\u0A3E\u0A28",
    noListings: "\u0A24\u0A41\u0A38\u0A40\u0A02 \u0A39\u0A1C\u0A47 \u0A15\u0A4B\u0A08 \u0A38\u0A2E\u0A3E\u0A28 \u0A28\u0A39\u0A40\u0A02 \u0A35\u0A47\u0A1A\u0A3F\u0A06.", soldMark: "\u0A35\u0A3F\u0A15 \u0A17\u0A3F\u0A06", markSold: "\u0A35\u0A3F\u0A15\u0A3F\u0A06 \u0A1A\u0A41\u0A23\u0A4B", markAvailable: "\u0A09\u0A2A\u0A32\u0A2C\u0A27 \u0A1A\u0A41\u0A23\u0A4B",
    listNewItem: "\u0A28\u0A35\u0A3E\u0A02 \u0A38\u0A2E\u0A3E\u0A28 \u0A35\u0A47\u0A1A\u0A4B", productName: "\u0A09\u0A24\u0A2A\u0A3E\u0A26 \u0A26\u0A3E \u0A28\u0A3E\u0A02", categoryLabel: "\u0A38\u0A3C\u0A4D\u0A30\u0A47\u0A23\u0A40", priceLabel: "\u0A2E\u0A41\u0A71\u0A32 (\u20b9)",
    descriptionLabel: "\u0A35\u0A47\u0A30\u0A35\u0A3E", descriptionPlaceholder: "... \u0A35\u0A3F\u0A38\u0A3C\u0A47\u0A38\u0A3C\u0A24\u0A3E\u0A35\u0A3E\u0A02",
    sellerLocation: "\u0A35\u0A3F\u0A15\u0A4D\u0A30\u0A47\u0A24\u0A3E \u0A26\u0A3E \u0A38\u0A25\u0A3E\u0A28", contactNumber: "\u0A38\u0A70\u0A2A\u0A30\u0A15 \u0A28\u0A70\u0A2C\u0A30", uploadImages: "\u0A24\u0A38\u0A35\u0A40\u0A30\u0A3E\u0A02 \u0A05\u0A2A\u0A32\u0A4B\u0A21 \u0A15\u0A30\u0A4B (3)",
    uploadClick: "\u0A1A\u0A41\u0A23\u0A28 \u0A32\u0A08 \u0A15\u0A32\u0A3F\u0A71\u0A15 \u0A15\u0A30\u0A4B", postListing: "\u0A2A\u0A4B\u0A38\u0A1F \u0A15\u0A30\u0A4B", posting: "\u0A2A\u0A4B\u0A38\u0A1F \u0A39\u0A4B \u0A30\u0A39\u0A3E \u0A39\u0A48...", backToBrowse: "\u2190 \u0A35\u0A3E\u0A2A\u0A38",
    descTitle: "\u0A35\u0A47\u0A30\u0A35\u0A3E", sellerDetails: "\u0A35\u0A3F\u0A15\u0A4D\u0A30\u0A47\u0A24\u0A3E \u0A26\u0A3E \u0A35\u0A47\u0A30\u0A35\u0A3E", verifiedSeller: "\u0A38\u0A3C\u0A3E\u0A2E\u0A32 \u0A35\u0A3F\u0A15\u0A4D\u0A30\u0A47\u0A24\u0A3E", callSeller: "\u0A15\u0A3E\u0A32 \u0A15\u0A30\u0A4B",
    whatsapp: "WhatsApp", errDelete: "\u0A39\u0A1F\u0A3E\u0A0A\u0A23 \u0A35\u0A3F\u0A71\u0A1A \u0A17\u0A32\u0A24\u0A40", errStatus: "\u0A05\u0A71\u0A2A\u0A21\u0A47\u0A1F \u0A35\u0A3F\u0A71\u0A1A \u0A17\u0A32\u0A24\u0A40", errList: "\u0A09\u0A24\u0A2A\u0A3E\u0A26 \u0A35\u0A47\u0A1A\u0A23 \u0A35\u0A3F\u0A71\u0A1A \u0A17\u0A32\u0A24\u0A40",
    confirmDelete: "\u0A15\u0A40 \u0A24\u0A41\u0A38\u0A40\u0A02 \u0A07\u0A38 \u0A28\u0A42\u0A70 \u0A39\u0A1F\u0A3E\u0A0A\u0A23\u0A3E \u0A1A\u0A3E\u0A39\u0A41\u0A70\u0A26\u0A47 \u0A39\u0A4B?", successList: "\u0A09\u0A24\u0A2A\u0A3E\u0A26 \u0A38\u0A2B\u0A32\u0A24\u0A3E\u0A2A\u0A42\u0A30\u0A35\u0A15 \u0A38\u0A42\u0A1A\u0A40\u0A2C\u0A71\u0A27!",
    prod_UsedTractor: "\u0A2A\u0A41\u0A30\u0A3E\u0A23\u0A3E \u0A1F\u0A30\u0A48\u0A15\u0A1F\u0A30 (2018)", prod_WheatSeeds: "\u0A1A\u0A70\u0A17\u0A47 \u0A15\u0A23\u0A15 \u0A26\u0A47 \u0A2C\u0A40\u0A1C", prod_WaterPump: "\u0A35\u0A3E\u0A1F\u0A30 \u0A2A\u0A70\u0A2A 2HP",
    loc_Punjab: "\u0A32\u0A41\u0A27\u0A3F\u0A06\u0A23\u0A3E, \u0A2A\u0A70\u0A1C\u0A3E\u0A2C", loc_Haryana: "\u0A15\u0A30\u0A28\u0A3E\u0A32, \u0A39\u0A30\u0A3F\u0A06\u0A23\u0A3E"
  },
  mr: { title: "शेतकरी बाजार", browseItems: "सामग्री पहा", postListing: "पोस्ट करा", loginBtn: "लॉगिन", signupBtn: "नोंदणी", prod_UsedTractor: "जुने ट्रॅक्टर (२०१८)", prod_WheatSeeds: "प्रिमियम गव्हाचे बियाणे", prod_WaterPump: "पाण्याचा पंप २HP", loc_Punjab: "लुधियाना, पंजाब", loc_Haryana: "कर्नाल, हरियाणा" },
  ta: { title: "விவசாயி சந்தை", browseItems: "பொருட்கள்", postListing: "பதிவேற்று", loginBtn: "உள்நுழை", signupBtn: "பதிவு", prod_UsedTractor: "பழைய டிராக்டர் (2018)", prod_WheatSeeds: "பிரீமியம் கோதுமை விதைகள்", prod_WaterPump: "தண்ணீர் பம்ப் 2HP", loc_Punjab: "லூதியானா, பஞ்சாப்", loc_Haryana: "கர்னால், ஹரியானா" },
  te: { title: "రైతు బజార్", browseItems: "వస్తువులు", postListing: "పోస్ట్", loginBtn: "లాగిన్", signupBtn: "నమోదు", prod_UsedTractor: "పాత ట్రాక్టర్ (2018)", prod_WheatSeeds: "ప్రీమియం గోధుమ విత్తనాలు", prod_WaterPump: "నీటి పంపు 2HP", loc_Punjab: "లూధియానా, పంజాబ్", loc_Haryana: "కర్నాల్, హర్యానా" },
  bn: { title: "কৃষক বাজার", browseItems: "পণ্য", postListing: "পোস্ট করুন", loginBtn: "লগইন", signupBtn: "নিবন্ধন", prod_UsedTractor: "পুরোনো ট্র্যাক্টর (2018)", prod_WheatSeeds: "প্রিমিয়াম গমের বীজ", prod_WaterPump: "জল পাম্প 2HP", loc_Punjab: "লুধিয়ানা, পাঞ্জাব", loc_Haryana: "কার্নাল, হরিয়ানা" }
};
"""

with codecs.open('c:/Users/sanchit mehta/OneDrive/Desktop/KrishiSarthi/frontend/src/Marketplace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'const MARKET_I18N = \{.*?\n};\n', re.DOTALL)
content = pattern.sub(translations + '\n', content)

# Inject dynamic translations into ProductCard and ProductDetail
# Replace {product.name} with {t[`prod_${product.name.replace(' ', '').replace('(', '').replace(')', '')}`] || product.name}
content = content.replace('{product.name}', '{t[`prod_${product.name.replace(/\\s+/g, "").replace(/\\(/g, "").replace(/\\)/g, "")}`] || product.name}')
content = content.replace('{product.location}', '{t[`loc_${product.location.split(", ")[1]}`] || product.location}')


with codecs.open('c:/Users/sanchit mehta/OneDrive/Desktop/KrishiSarthi/frontend/src/Marketplace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected translations successfully")
