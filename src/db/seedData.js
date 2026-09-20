/**
 * Default Seed Data extracted directly from WordPress calculated fields JSON:
 * - 9 Bedsheet Calculators (Colors 210, Solid 210, Colors 300, Solid 300, Solid 400, Stripe 400, Other Collections, Satiny 90, Mix & Match)
 * - Dohar Calculator
 * - Comforters Calculator
 * - Flipkart Marketplace Calculator
 * - Default Users & Roles
 */

export const DEFAULT_USERS = [
  {
    id: "admin",
    name: "Operations Admin",
    role: "admin",
    password: "admin", // can be changed by admin
    createdAt: "2026-01-01T00:00:00.000Z",
    status: "active"
  },
  {
    id: "user101",
    name: "Wholesale Partner 101",
    role: "user",
    password: "user123",
    createdAt: "2026-01-15T00:00:00.000Z",
    status: "active"
  },
  {
    id: "9876543210",
    name: "Dealer Phone Login",
    role: "user",
    password: "password",
    createdAt: "2026-02-01T00:00:00.000Z",
    status: "active"
  }
];

export const COST_TIERS = [
  { id: "C2C", label: "C2C", value: 1.0, multiplier: 1.0, description: "Base Direct Cost" },
  { id: "PLR", label: "PLR", value: 0.97, multiplier: 0.97, description: "Platinum Dealer (97%)" },
  { id: "GLR", label: "GLR", value: 0.95, multiplier: 0.95, description: "Gold Tier (95%)" },
  { id: "SLR", label: "SLR", value: 0.93, multiplier: 0.93, description: "Silver Tier (93%)" },
  { id: "BLR", label: "BLR", value: 0.90, multiplier: 0.90, description: "Bronze Tier (90%)" },
  { id: "WLR", label: "WLR", value: 0.85, multiplier: 0.85, description: "Wholesale Distributor (85%)" }
];

export const BED_SIZES_STANDARD = [
  { id: "none", label: "Bedsheet Not Required", meter: 0, stitching: 0 },
  { id: "54x90", label: "54 × 90 (Single)", meter: 1.18, stitching: 12 },
  { id: "54x90_pair", label: "54 × 90 Pair", meter: 2.351, stitching: 24 },
  { id: "90x108", label: "90 × 108 (Queen)", meter: 2.35, stitching: 12 },
  { id: "100x108", label: "100 × 108", meter: 2.61, stitching: 12 },
  { id: "108x108", label: "108 × 108 (King)", meter: 2.82, stitching: 12 },
  { id: "120x108", label: "120 × 108 (Super King)", meter: 3.14, stitching: 12 }
];

export const BED_SIZES_SOLID = [
  { id: "none", label: "Bedsheet Not Required", meter: 0, stitching: 0 },
  { id: "54x90", label: "54 × 90 (Single)", meter: 1.18, stitching: 12 },
  { id: "54x90_pair", label: "54 × 90 Pair", meter: 2.351, stitching: 24 },
  { id: "90x112", label: "90 × 112 (Queen)", meter: 2.35, stitching: 12 },
  { id: "100x112", label: "100 × 112", meter: 2.61, stitching: 12 },
  { id: "108x112", label: "108 × 112 (King)", meter: 2.82, stitching: 12 },
  { id: "120x112", label: "120 × 112 (Super King)", meter: 3.14, stitching: 12 }
];

export const BED_SIZES_SATINY90 = [
  { id: "none", label: "Bedsheet Not Required", meter: 0, stitching: 0 },
  { id: "60x90", label: "60 × 90", meter: 1.57, stitching: 12 },
  { id: "90x100", label: "90 × 100", meter: 2.61, stitching: 12 },
  { id: "90x108", label: "90 × 108", meter: 2.82, stitching: 12 }
];

export const BED_SIZES_MIXMATCH = [
  { id: "none", label: "Bedsheet Not Required", meter: 0, stitching: 0 },
  { id: "90x108", label: "90 × 108", meter: 2.35, stitching: 12 },
  { id: "100x108", label: "100 × 108", meter: 2.61, stitching: 12 },
  { id: "108x108", label: "108 × 108", meter: 2.82, stitching: 12 }
];

export const DEFAULT_CALCULATOR_CONFIGS = {
  // 1. Colors 210 - Stripe
  colors210: {
    id: "colors210",
    name: "Colors 210 TC (Stripe)",
    category: "bedsheet",
    subtitle: "210 Thread Count Yarn Dyed Stripe",
    sizeSet: "standard",
    pillowMeterPerUnit: 0.36,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    colors: [
      { id: "white", label: "White", rate: 139 },
      { id: "light", label: "Light", rate: 149 },
      { id: "medium", label: "Medium", rate: 153 },
      { id: "dark", label: "Dark", rate: 161 }
    ],
    packingTypes: [
      { id: "ld", label: "LD (Low Density)", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "Pillow LD", type: "perPillow", multiplier: 0.46 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "std_1_2", label: "Std. Packing (1+2)", type: "fixed", cost: 38 },
      { id: "std_pillow", label: "Std. Pillow Packing", type: "fixed", cost: 36 },
      { id: "std_1_1", label: "Std. Packing Single (1+1)", type: "fixed", cost: 24 }
    ]
  },

  // 2. Solids 210 - Plain
  solid210: {
    id: "solid210",
    name: "Solids 210 TC (Plain)",
    category: "bedsheet",
    subtitle: "210 Thread Count Pure Cotton Solid",
    sizeSet: "solid",
    pillowMeterPerUnit: 0.36,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    colors: [
      { id: "white", label: "White", rate: 163 },
      { id: "light", label: "Light", rate: 167 },
      { id: "medium", label: "Medium", rate: 171 },
      { id: "dark", label: "Dark", rate: 179 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "Pillow LD", type: "perPillow", multiplier: 0.46 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "std_packing", label: "Std. Packing", type: "fixed", cost: 36 },
      { id: "std_pillow", label: "Std. Pillow Packing", type: "fixed", cost: 36 },
      { id: "std_1_1", label: "Std. Packing Single (1+1)", type: "fixed", cost: 21 }
    ]
  },

  // 3. Colors 300 - Stripe
  colors300: {
    id: "colors300",
    name: "Colors 300 TC (Stripe)",
    category: "bedsheet",
    subtitle: "300 Thread Count Luxury Satin Stripe",
    sizeSet: "standard",
    pillowMeterPerUnit: 0.36,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    colors: [
      { id: "white", label: "White", rate: 191 },
      { id: "light", label: "Light", rate: 201 },
      { id: "medium", label: "Medium", rate: 205 },
      { id: "dark", label: "Dark", rate: 213 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "Pillow LD", type: "perPillow", multiplier: 0.46 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "std_packing", label: "Std. Packing", type: "fixed", cost: 36 },
      { id: "std_pillow", label: "Std. Pillow Packing", type: "fixed", cost: 36 },
      { id: "std_1_1", label: "Std. Packing Single (1+1)", type: "fixed", cost: 21 }
    ]
  },

  // 4. Solid 300 - Plain
  solid300: {
    id: "solid300",
    name: "Solids 300 TC (Plain)",
    category: "bedsheet",
    subtitle: "300 Thread Count Premium Plain Weave",
    sizeSet: "solid",
    pillowMeterPerUnit: 0.36,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    colors: [
      { id: "white", label: "White", rate: 187 },
      { id: "light", label: "Light", rate: 197 },
      { id: "medium", label: "Medium", rate: 201 },
      { id: "dark", label: "Dark", rate: 209 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "Pillow LD", type: "perPillow", multiplier: 0.46 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "std_packing", label: "Std. Packing", type: "fixed", cost: 36 },
      { id: "std_pillow", label: "Std. Pillow Packing", type: "fixed", cost: 36 },
      { id: "std_1_1", label: "Std. Packing Single (1+1)", type: "fixed", cost: 21 }
    ]
  },

  // 5. Solid 400 - Plain
  solid400: {
    id: "solid400",
    name: "Solids Superfinest 400 TC",
    category: "bedsheet",
    subtitle: "400 Thread Count High-Density Satin Solid",
    sizeSet: "standard",
    pillowMeterPerUnit: 0.36,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    colors: [
      { id: "white", label: "White", rate: 231 },
      { id: "light", label: "Light", rate: 241 },
      { id: "dark", label: "Dark", rate: 253 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "Pillow LD", type: "perPillow", multiplier: 0.46 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "std_packing", label: "Std. Packing", type: "fixed", cost: 54 },
      { id: "std_pillow", label: "Std. Pillow Packing", type: "fixed", cost: 36 },
      { id: "std_1_1", label: "Std. Packing Single (1+1)", type: "fixed", cost: 21 }
    ]
  },

  // 6. Stripe 400 - Stripe
  stripe400: {
    id: "stripe400",
    name: "Colors Superfinest 400 TC (Stripe)",
    category: "bedsheet",
    subtitle: "400 Thread Count Dobby Stripe",
    sizeSet: "standard",
    pillowMeterPerUnit: 0.36,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    colors: [
      { id: "white", label: "White Only", rate: 245 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "Pillow LD", type: "perPillow", multiplier: 0.46 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "std_packing", label: "Std. Packing", type: "fixed", cost: 54 },
      { id: "std_pillow", label: "Std. Pillow Packing", type: "fixed", cost: 36 },
      { id: "std_1_1", label: "Std. Packing Single (1+1)", type: "fixed", cost: 21 }
    ]
  },

  // 7. Other Collection
  otherCollection: {
    id: "otherCollection",
    name: "Specialty Collections (108\")",
    category: "bedsheet",
    subtitle: "Curated Designer Sheeting & Sateen",
    sizeSet: "standard",
    pillowMeterPerUnit: 0.36,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    collections: [
      { id: "satiny108", label: "Satiny 108", rate: 173, stdPackingCost: 80 },
      { id: "grandeur108", label: "Grandeur 108", rate: 188, stdPackingCost: 64 },
      { id: "esteem", label: "Esteem", rate: 223, stdPackingCost: 64 },
      { id: "creature", label: "Creature", rate: 238, stdPackingCost: 95 },
      { id: "vbc", label: "Value Boutique Collection", rate: 203, stdPackingCost: 55 },
      { id: "structure", label: "Structure", rate: 223.01, stdPackingCost: 45 },
      { id: "sapphire", label: "Sapphire", rate: 258, stdPackingCost: 64 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "LD Pillow", type: "perPillow", multiplier: 0.46 },
      { id: "ld_photo", label: "LD + Photo", type: "fixed", cost: 10 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "taiwan_photo", label: "Taiwan + Photo", type: "fixed", cost: 20.5 },
      { id: "std_1_2", label: "Standard Packing (1+2)", type: "collectionStdPacking" },
      { id: "std_1_1", label: "Standard Packing Single (1+1)", type: "fixed", cost: 21 },
      { id: "std_pillow", label: "Standard Pillow Packing", type: "fixed", cost: 36 }
    ]
  },

  // 8. Satiny 90"
  satiny90: {
    id: "satiny90",
    name: "Satiny 90\" & Allure",
    category: "bedsheet",
    subtitle: "Compact width sheeting series",
    sizeSet: "satiny90",
    pillowMeterPerUnit: 0.422,
    pillowStitchingPerUnit: 15,
    overheadMultiplier: 1.07,
    collections: [
      { id: "satiny90_fab", label: "Satiny 90\"", rate: 123 },
      { id: "allure", label: "Allure", rate: 97.5 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "LD Pillow", type: "perPillow", multiplier: 0.46 },
      { id: "ld_photo", label: "LD + Photo", type: "fixed", cost: 10 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "taiwan_photo", label: "Taiwan + Photo", type: "fixed", cost: 20.5 },
      { id: "std_1_2", label: "Standard Packing (1+2)", type: "fixed", cost: 58 },
      { id: "std_1_1", label: "Standard Packing Single (1+1)", type: "fixed", cost: 21 },
      { id: "std_pillow", label: "Standard Pillow Packing", type: "fixed", cost: 36 }
    ]
  },

  // 9. Mix & Match
  mixMatch: {
    id: "mixMatch",
    name: "Mix & Match Series",
    category: "bedsheet",
    subtitle: "Coordinated Bed & Pillow sets",
    sizeSet: "mixMatch",
    pillowMeterPerUnit: 0.82,
    pillowStitchingPerUnit: 21.3,
    overheadMultiplier: 1.07,
    collections: [
      { id: "harmony", label: "Harmony", rate: 178, pillowRate: 98, stdPackingCost: 78 },
      { id: "heritage", label: "Heritage", rate: 203, pillowRate: 108, stdPackingCost: 66 },
      { id: "gravitas", label: "Gravitas", rate: 228, pillowRate: 98, stdPackingCost: 64 },
      { id: "gloster", label: "Gloster", rate: 183, pillowRate: 93, stdPackingCost: 45 }
    ],
    packingTypes: [
      { id: "ld", label: "LD", type: "fixed", cost: 5.5 },
      { id: "pillow_ld", label: "LD Pillow", type: "perPillow", multiplier: 0.46 },
      { id: "ld_photo", label: "LD + Photo", type: "fixed", cost: 10 },
      { id: "taiwan", label: "Taiwan", type: "fixed", cost: 16.5 },
      { id: "taiwan_photo", label: "Taiwan + Photo", type: "fixed", cost: 20.5 },
      { id: "std_1_2", label: "Standard Packing (1+2)", type: "collectionStdPacking" },
      { id: "std_1_1", label: "Standard Packing Single (1+1)", type: "fixed", cost: 21 },
      { id: "std_pillow", label: "Standard Pillow Packing", type: "fixed", cost: 36 }
    ]
  },

  // 10. Dohar
  dohar: {
    id: "dohar",
    name: "Dohar Layered Quilt",
    category: "dohar",
    subtitle: "Flannel & Cotton Brushing Dohars",
    overheadMultiplier: 1.07,
    rates: {
      allureMeterRate: 125,
      vbcMeterRate: 218,
      dooriKgRate: 140,
      pipingMeterSolid: 235,
      brushingMeterRate: 56.5
    },
    stitchingBreakdowns: {
      doubleWithBrushing: { quilting: 65, stitching: 50, layer: 50, cutting: 70, oh: 5, total: 240 },
      doubleWithoutBrushing: { quilting: 0, stitching: 60, layer: 70, cutting: 50, oh: 0, total: 180 },
      singleWithBrushing: { quilting: 55, stitching: 40, layer: 50, cutting: 60, oh: 5, total: 210 },
      singleWithoutBrushing: { quilting: 0, stitching: 50, layer: 50, cutting: 60, oh: 0, total: 160 }
    },
    packingRates: {
      stdDoubleWithBrushing: 132,
      stdDoubleWithoutBrushing: 35,
      stdSingleWithBrushing: 115,
      stdSingleWithoutBrushing: 35,
      ldCost: 10
    }
  },

  // 11. Comforters
  comforters: {
    id: "comforters",
    name: "Comforters (Microfiber & Cotton)",
    category: "comforters",
    subtitle: "GSM Microfiber Polyfill Comforters",
    overheadMultiplier: 1.07,
    qualities: [
      { id: "1", label: "Allure", rate: 119, isAllure: true },
      { id: "2", label: "VBC", rate: 218, isAllure: false },
      { id: "3", label: "Solid 210TC - White", rate: 179, isAllure: false },
      { id: "4", label: "Solid 210TC - Dyed", rate: 225, isAllure: false },
      { id: "5", label: "Solid Finest 300TC - White", rate: 233, isAllure: false },
      { id: "6", label: "Solid Finest 300TC - Dyed", rate: 253, isAllure: false },
      { id: "7", label: "Colors 210TC - White", rate: 179, isAllure: false },
      { id: "8", label: "Colors 210TC - Dyed", rate: 199, isAllure: false },
      { id: "9", label: "Colors Finest 300TC - White", rate: 235, isAllure: false },
      { id: "10", label: "Colors Finest 300TC - Dyed", rate: 255, isAllure: false },
      { id: "11", label: "Colors Super Finest 400TC - White", rate: 291, isAllure: false },
      { id: "12", label: "Solid Super Finest 400TC - White", rate: 287, isAllure: false }
    ],
    gsmRates: [
      { gsm: "120", label: "120 GSM", rate: 47 },
      { gsm: "150", label: "150 GSM", rate: 51 },
      { gsm: "200", label: "200 GSM", rate: 75 },
      { gsm: "300", label: "300 GSM", rate: 120 },
      { gsm: "400", label: "400 GSM", rate: 143 }
    ],
    nonWovenRate: 5.25,
    stitchingCost: {
      single: 210, // Q:55 + S:40 + L:50 + M:60 + OH:5
      double: 240  // Q:65 + S:50 + L:50 + M:70 + OH:5
    },
    packingRates: {
      singleStdLowGsm: 72,   // 120, 150, 200 GSM
      singleStdHighGsm: 118, // 300, 400 GSM
      doubleStdLowGsm: 118,  // 120, 150, 200 GSM
      doubleStdHighGsm: 180, // 300, 400 GSM
      ldCost: 10
    }
  },

  // 12. Flipkart Marketplace Calculator
  flipkart: {
    id: "flipkart",
    name: "Flipkart Marketplace",
    category: "marketplace",
    subtitle: "Ecommerce payout & reverse price calculation",
    shippingFlat: 91,
    advertisementPercent: 0.10, // 10% of purchase price
    returnSafetyPercent: 0.07,  // 7% of selling price (incl. GST)
    collectionFeePercent: 0.02, // 2% of selling price (incl. GST)
    commissionPercent: 0.07,    // 7% of selling price (incl. GST)
    constantOffset: 101,
    divisorMultiplier: 0.692,   // ROUND((Purchase + 101 + FixedFee) / 0.692)
    gstRatio: 20 / 21,          // (20 * SellingPriceInclGST) / 21
    fixedFeeBrackets: [
      { maxPrice: 249, fee: 13 },
      { maxPrice: 567, fee: 24 },
      { maxPrice: Infinity, fee: 47 }
    ]
  }
};
