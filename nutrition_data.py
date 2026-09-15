"""
Udyam – Nutrition Dataset & Clinical Guidelines Foundation
==========================================================
Modular, extensible dataset containing:
- Supported health/special conditions (with non-diagnostic nutritional guidance)
- Supported regional cuisines (East Indian/Bengali, North Indian, South Indian, etc.)
- Dietary preferences & fitness goals
- Regional food items with macronutrient & micronutrient profiles
- Health condition nutrient priorities, restrictions, and food swap alternatives
"""

# ══════════════════════════════════════════════════════
#  1. Supported Health / Special Conditions
# ══════════════════════════════════════════════════════

HEALTH_CONDITIONS = [
    {
        "id": "none",
        "name": "None / General Wellness",
        "category": "General",
        "guidance": "Balanced macronutrient distribution supporting daily energy, immune function, and lean body mass.",
        "priority_nutrients": [
            {"nutrient": "Dietary Fiber", "target": "28-35g/day", "benefit": "Digestive health and sustained glucose release"},
            {"nutrient": "Quality Protein", "target": "1.6-2.0g/kg", "benefit": "Muscle protein synthesis and tissue repair"},
            {"nutrient": "Hydration", "target": "35-45ml/kg", "benefit": "Cellular hydration and metabolic clearance"}
        ],
        "restrictions": ["Excessive refined sugars", "Ultra-processed trans fats"],
        "recommended_tags": ["balanced", "whole-grain", "lean-protein"]
    },
    {
        "id": "diabetes_type2",
        "name": "Diabetes (Type 2 / Pre-diabetes)",
        "category": "Metabolic",
        "guidance": "Focus on low glycemic index (GI) carbohydrates, high soluble fiber, and balanced protein to stabilize postprandial blood sugar.",
        "priority_nutrients": [
            {"nutrient": "Soluble Fiber", "target": "35-45g/day", "benefit": "Blunts glycemic spikes and improves insulin sensitivity"},
            {"nutrient": "Complex Carbs (Low-GI)", "target": "<45% total calories", "benefit": "Slow glucose absorption from pulses, oats, and millets"},
            {"nutrient": "Magnesium & Chromium", "target": "RDA compliant", "benefit": "Supports cellular glucose transporter regulation"}
        ],
        "restrictions": ["Refined flours (Maida)", "Added sugars & sweet syrups", "High GI fruits on an empty stomach"],
        "recommended_tags": ["low-gi", "high-fiber", "sugar-free", "complex-carb"]
    },
    {
        "id": "hypertension",
        "name": "Hypertension (High Blood Pressure)",
        "category": "Cardiovascular",
        "guidance": "DASH-aligned nutrition emphasizing potassium-rich whole foods, magnesium, and controlled sodium intake.",
        "priority_nutrients": [
            {"nutrient": "Potassium", "target": "3500-4700mg/day", "benefit": "Promotes sodium excretion and vascular vasodilation"},
            {"nutrient": "Dietary Sodium", "target": "< 1500-2000mg/day", "benefit": "Mitigates fluid retention and arterial pressure"},
            {"nutrient": "Magnesium", "target": "400-420mg/day", "benefit": "Supports smooth muscle relaxation in blood vessels"}
        ],
        "restrictions": ["Table salt / high-sodium seasoning", "Processed pickles & papads", "Cured or packaged meats"],
        "recommended_tags": ["low-sodium", "potassium-rich", "heart-healthy"]
    },
    {
        "id": "high_cholesterol",
        "name": "High Cholesterol / Dyslipidemia",
        "category": "Cardiovascular",
        "guidance": "Emphasizes soluble beta-glucan fibers, plant sterols, and omega-3 polyunsaturated fatty acids to optimize lipid profiles.",
        "priority_nutrients": [
            {"nutrient": "Soluble Fiber (Beta-Glucan)", "target": "10-15g/day", "benefit": "Binds intestinal bile acids to lower LDL cholesterol"},
            {"nutrient": "Omega-3 Fatty Acids", "target": "1000-2000mg/day", "benefit": "Lowers serum triglycerides and systemic arterial inflammation"},
            {"nutrient": "Monounsaturated Fats (MUFA)", "target": "15-20% calories", "benefit": "Helps maintain protective HDL levels"}
        ],
        "restrictions": ["Saturated animal fats", "Deep-fried vanaspati/hydrogenated oils", "Processed palm oil foods"],
        "recommended_tags": ["omega-3", "low-saturated-fat", "soluble-fiber", "heart-healthy"]
    },
    {
        "id": "pcos_pcod",
        "name": "PCOS / PCOD",
        "category": "Hormonal & Endocrine",
        "guidance": "Anti-inflammatory and insulin-sensitizing foods with balanced fats, antioxidants, and hormone-supporting micronutrients.",
        "priority_nutrients": [
            {"nutrient": "Inositol & Zinc", "target": "Optimal daily intake", "benefit": "Supports ovarian follicular health and metabolic balance"},
            {"nutrient": "Omega-3 & Anti-inflammatory Fats", "target": "1500mg/day", "benefit": "Reduces chronic low-grade ovarian inflammation"},
            {"nutrient": "Low-GI Fiber", "target": "30-35g/day", "benefit": "Prevents hyperinsulinemia and subsequent androgen surges"}
        ],
        "restrictions": ["High-glycemic processed snacks", "Excessive dairy/refined sugars", "Inflammatory trans-fats"],
        "recommended_tags": ["anti-inflammatory", "low-gi", "zinc-rich", "seed-cycling"]
    },
    {
        "id": "thyroid_hypo",
        "name": "Thyroid (Hypothyroidism)",
        "category": "Hormonal & Endocrine",
        "guidance": "Adequate iodine, selenium, and zinc intake while ensuring goitrogens (like raw cruciferous veggies) are properly cooked.",
        "priority_nutrients": [
            {"nutrient": "Selenium & Zinc", "target": "55mcg / 11mg", "benefit": "Essential cofactors for T4 to active T3 conversion"},
            {"nutrient": "Lean Protein", "target": "1.6-1.8g/kg", "benefit": "Assists basal metabolic rate elevation"},
            {"nutrient": "Tyrosine & Iodine", "target": "RDA compliant", "benefit": "Precursors for endogenous thyroid hormone synthesis"}
        ],
        "restrictions": ["Raw unfermented soy", "Excessive raw cruciferous vegetables (steam before eating)", "Gluten if autoimmune hashimotos"],
        "recommended_tags": ["selenium-rich", "cooked-cruciferous", "mineral-dense"]
    },
    {
        "id": "lactose_intolerance",
        "name": "Lactose Intolerance",
        "category": "Digestive",
        "guidance": "100% lactose-free dietary strategy utilizing plant milk, calcium-rich seeds, and fermented non-dairy alternatives.",
        "priority_nutrients": [
            {"nutrient": "Non-Dairy Calcium", "target": "1000-1200mg/day", "benefit": "Maintains bone density via sesame seeds, tofu, and greens"},
            {"nutrient": "Vitamin D3", "target": "600-800 IU/day", "benefit": "Facilitates intestinal calcium absorption"}
        ],
        "restrictions": ["Cow/Buffalo milk", "Paneer/cheese unless lactose-free", "Whey concentrate powders"],
        "recommended_tags": ["dairy-free", "lactose-free", "plant-calcium"]
    },
    {
        "id": "gluten_sensitivity",
        "name": "Gluten Sensitivity / Celiac",
        "category": "Digestive",
        "guidance": "Elimination of wheat, rye, and barley in favor of naturally gluten-free pseudocereals like rice, millets, quinoa, and buckwheat.",
        "priority_nutrients": [
            {"nutrient": "B-Complex Vitamins", "target": "RDA compliant", "benefit": "Replenishes micronutrients commonly lost when omitting fortified wheat"},
            {"nutrient": "Millet/Rice Fiber", "target": "25-30g/day", "benefit": "Ensures bowel regularity with sorghum (jowar), ragi, and bajra"}
        ],
        "restrictions": ["Wheat (Atta, Maida, Sooji)", "Barley", "Rye", "Common bakery goods"],
        "recommended_tags": ["gluten-free", "millet-based", "digestive-comfort"]
    }
]


# ══════════════════════════════════════════════════════
#  2. Supported Regions & Regional Staples
# ══════════════════════════════════════════════════════

REGIONS = [
    {
        "id": "east_indian",
        "name": "East Indian / Bengali",
        "description": "Flavorful cuisine featuring fish (Macher Jhol), seasonal greens (Shaak), pulses (Cholar Dal, Musur Dal), mustard seeds, and rice staples.",
        "staples": ["Brown / Red / Basmati Rice", "Rohu / Katla / Hilsa Fish", "Musur (Red Lentil) & Moong Dal", "Pani/Lau (Bottle Gourd)", "Mustard / Cumin Tempered Dishes"],
        "signature_healthy_dish": "Patla Macher Jhol with Seasonal Vegetables & Steamed Rice"
    },
    {
        "id": "north_indian",
        "name": "North Indian",
        "description": "Wholesome preparations with whole-wheat rotis, dal makhani alternatives, paneer, rajma, chhole, and rich tandoori/roast styles.",
        "staples": ["Whole Wheat Chapati / Phulka", "Paneer & Curd", "Rajma & Chana", "Spinach & Fenugreek (Palak / Methi)", "Tandoori Skewers"],
        "signature_healthy_dish": "Palak Paneer with Multigrain Phulka & Roasted Spiced Curd"
    },
    {
        "id": "south_indian",
        "name": "South Indian",
        "description": "Nutritious fermented breakfast varieties, lentils (Sambar), rasam, steamed coconut chutneys, and millet-enriched grains.",
        "staples": ["Ragi Mudde / Idli / Dosa", "Toor Dal Sambar & Pepper Rasam", "Curd Rice & Buttermilk", "Spiced Sundal (Chickpea/Peanut)", "Moringa & Coconut"],
        "signature_healthy_dish": "Steamed Ragi & Oats Idli with Vegetable Sambar & Flax Chutney"
    },
    {
        "id": "west_indian",
        "name": "West Indian (Maharashtrian / Gujarati)",
        "description": "Balanced sweet-savory notes, jowar and bajra bhakris, sprout usals, theplas, and light roasted pulse dishes.",
        "staples": ["Jowar / Bajra Bhakri", "Matki & Moong Sprout Usal", "Methi Thepla", "Kadhi (Buttermilk Soup)", "Roasted Peanuts & Sesame"],
        "signature_healthy_dish": "Moong Sprout Usal with Jowar Bhakri & Cucumber Koshimbir"
    },
    {
        "id": "continental",
        "name": "Continental / Global",
        "description": "Lean protein grills, quinoa bowls, whole-grain sourdough toasts, Mediterranean olive-oil dressings, and steamed greens.",
        "staples": ["Rolled Oats & Sourdough", "Grilled Chicken / Salmon Fillet", "Greek Yogurt & Cottage Cheese", "Quinoa & Brown Rice", "Avocado & Olive Oil"],
        "signature_healthy_dish": "Grilled Atlantic Salmon / Tofu with Herbed Quinoa & Steamed Broccoli"
    }
]


# ══════════════════════════════════════════════════════
#  3. Dietary Preferences
# ══════════════════════════════════════════════════════

DIETARY_PREFERENCES = [
    {"id": "Standard", "name": "Standard (Omnivore)", "desc": "Includes poultry, fish, eggs, dairy, grains, and vegetables."},
    {"id": "Vegetarian", "name": "Vegetarian (Lacto-Ovo)", "desc": "Plant-based with dairy (milk, paneer, curd) and eggs optional."},
    {"id": "Vegan", "name": "100% Plant-Based (Vegan)", "desc": "Zero animal products; relies on legumes, tofu, soy, seeds, and nuts."},
    {"id": "High Protein", "name": "High Protein Athletic", "desc": "Emphasizes lean proteins (2.2-2.4g/kg) for hypertrophy & recovery."},
    {"id": "Keto", "name": "Ketogenic (Low Carb / High Fat)", "desc": "Severely restricted carbohydrates (<25-30g net) with higher healthy fats."}
]


# ══════════════════════════════════════════════════════
#  4. Fitness Goals & Activity Levels
# ══════════════════════════════════════════════════════

FITNESS_GOALS = [
    {"id": "Weight Loss", "name": "Weight Loss (Caloric Deficit)", "calorie_delta": -450, "macro_ratio": {"protein": 30, "carbs": 40, "fats": 30}},
    {"id": "Muscle Building", "name": "Muscle Building (Hypertrophy Surplus)", "calorie_delta": 350, "macro_ratio": {"protein": 30, "carbs": 45, "fats": 25}},
    {"id": "General Fitness", "name": "General Fitness (Maintenance)", "calorie_delta": 0, "macro_ratio": {"protein": 25, "carbs": 45, "fats": 30}},
    {"id": "Sports Performance", "name": "Sports Performance (Glycogen Boost)", "calorie_delta": 300, "macro_ratio": {"protein": 25, "carbs": 55, "fats": 20}}
]

ACTIVITY_LEVELS = [
    {"id": "sedentary", "name": "Sedentary", "label": "Desk job, little to no structured workout", "multiplier": 1.2},
    {"id": "light", "name": "Lightly Active", "label": "1-3 workout sessions per week", "multiplier": 1.375},
    {"id": "moderate", "name": "Moderately Active", "label": "3-5 structured training days/week", "multiplier": 1.55},
    {"id": "very", "name": "Very Active", "label": "6-7 intense training sessions/week", "multiplier": 1.725}
]


# ══════════════════════════════════════════════════════
#  5. Regional & Condition-Aware Food Items Dataset (MVP)
# ══════════════════════════════════════════════════════

FOOD_ITEMS = [
    # ── East Indian / Bengali Foods ──
    {
        "id": "east_b1",
        "name": "Dalia Khichdi with Moong Dal & Spinach",
        "regional_name": "Bengali Dalia Palak Khichuri",
        "region": "East Indian / Bengali",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 320,
        "protein_g": 13,
        "carbs_g": 52,
        "fats_g": 6,
        "fiber_g": 8,
        "tags": ["low-gi", "high-fiber", "heart-healthy", "dairy-free"],
        "key_nutrients": ["Iron", "Soluble Fiber", "Magnesium"],
        "healthy_alternative_to": "Deep-fried Luchi with Aloo Dum"
    },
    {
        "id": "east_b2",
        "name": "Dim Shiddho (Boiled Eggs) & Whole Wheat Roti with Spiced Chana",
        "regional_name": "Dim Seddho Roti Chola",
        "region": "East Indian / Bengali",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "High Protein"],
        "calories": 390,
        "protein_g": 24,
        "carbs_g": 42,
        "fats_g": 12,
        "fiber_g": 7,
        "tags": ["high-protein", "low-gi", "dairy-free"],
        "key_nutrients": ["Choline", "B12", "Zinc"],
        "healthy_alternative_to": "Radhaballabhi / Paratha with Sweet Halwa"
    },
    {
        "id": "east_b3",
        "name": "Oats & Green Moong Chilla with Coriander Mint Chutney",
        "regional_name": "Moong Dal Cheela",
        "region": "East Indian / Bengali",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 290,
        "protein_g": 16,
        "carbs_g": 40,
        "fats_g": 5,
        "fiber_g": 8,
        "tags": ["gluten-free", "low-gi", "dairy-free", "sugar-free"],
        "key_nutrients": ["Folate", "Fiber", "Plant Protein"],
        "healthy_alternative_to": "Moglai Paratha"
    },
    {
        "id": "east_l1",
        "name": "Patla Macher Jhol (Rohu/Katla in Light Cumin-Tomato Broth) with Brown Rice",
        "regional_name": "Patla Jeera Macher Jhol & Lal Bhaat",
        "region": "East Indian / Bengali",
        "meal_type": "lunch",
        "diet_types": ["Standard", "High Protein"],
        "calories": 520,
        "protein_g": 36,
        "carbs_g": 62,
        "fats_g": 11,
        "fiber_g": 6,
        "tags": ["omega-3", "heart-healthy", "dairy-free", "low-saturated-fat"],
        "key_nutrients": ["Omega-3 EPA/DHA", "Lean Protein", "Potassium"],
        "healthy_alternative_to": "Kalia (Rich mustard gravy fish) or Fried Chingri Malaikari"
    },
    {
        "id": "east_l2",
        "name": "Cholar Dal with Steamed Lau Shaak (Bottle Gourd Greens) & Red Rice",
        "regional_name": "Tok Dal, Lau Shaak & Bhaat",
        "region": "East Indian / Bengali",
        "meal_type": "lunch",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 460,
        "protein_g": 20,
        "carbs_g": 72,
        "fats_g": 7,
        "fiber_g": 11,
        "tags": ["high-fiber", "low-gi", "anti-inflammatory", "dairy-free"],
        "key_nutrients": ["Folate", "Magnesium", "Potassium"],
        "healthy_alternative_to": "Fried Beguni with Heavy White Rice & Ghee"
    },
    {
        "id": "east_s1",
        "name": "Roasted Spiced Muri (Puffed Rice) with Peanuts, Cucumber & Green Chili",
        "regional_name": "Shoshaa Badam Makha Jhal Muri",
        "region": "East Indian / Bengali",
        "meal_type": "snack",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 180,
        "protein_g": 6,
        "carbs_g": 28,
        "fats_g": 4,
        "fiber_g": 3,
        "tags": ["low-calorie", "dairy-free", "sugar-free"],
        "key_nutrients": ["Niacin", "Iron"],
        "healthy_alternative_to": "Singara (Samosa) or Telebhaja"
    },
    {
        "id": "east_s2",
        "name": "Homemade Chhena (Fresh Cottage Cheese) with Pinch of Elaichi & Crushed Walnuts",
        "regional_name": "Sugar-Free Chena Sandesh Bowl",
        "region": "East Indian / Bengali",
        "meal_type": "snack",
        "diet_types": ["Standard", "Vegetarian", "High Protein"],
        "calories": 210,
        "protein_g": 15,
        "carbs_g": 8,
        "fats_g": 12,
        "fiber_g": 2,
        "tags": ["high-protein", "low-carb", "sugar-free"],
        "key_nutrients": ["Calcium", "B12", "Phosphorus"],
        "healthy_alternative_to": "Rosogolla / Pantua soaked in sugar syrup"
    },
    {
        "id": "east_d1",
        "name": "Steamed Katla Fish / Soy Chunks with Turmeric Papaya Stew & Multigrain Roti",
        "regional_name": "Peypey Diye Maach / Soyabean Tarkari",
        "region": "East Indian / Bengali",
        "meal_type": "dinner",
        "diet_types": ["Standard", "High Protein"],
        "calories": 480,
        "protein_g": 34,
        "carbs_g": 52,
        "fats_g": 10,
        "fiber_g": 9,
        "tags": ["easy-digestion", "heart-healthy", "anti-inflammatory"],
        "key_nutrients": ["Papain enzyme", "Omega-3", "Dietary Fiber"],
        "healthy_alternative_to": "Mutton Kosha with White Parathas"
    },
    {
        "id": "east_d2",
        "name": "Musur Dal (Red Lentil) Soup with Roasted Cauliflower & Jowar Roti",
        "regional_name": "Musur Dal & Phulkopi Tarkari",
        "region": "East Indian / Bengali",
        "meal_type": "dinner",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 410,
        "protein_g": 19,
        "carbs_g": 64,
        "fats_g": 6,
        "fiber_g": 12,
        "tags": ["high-fiber", "low-fat", "gluten-free", "dairy-free"],
        "key_nutrients": ["Molybdenum", "Potassium", "Fiber"],
        "healthy_alternative_to": "Creamy Paneer Butter Masala"
    },

    # ── North Indian Foods ──
    {
        "id": "north_b1",
        "name": "Paneer Bhurji with 2 Whole Wheat Phulkas & Mint Raita",
        "regional_name": "Spiced Paneer Scramble & Phulka",
        "region": "North Indian",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "Vegetarian", "High Protein"],
        "calories": 420,
        "protein_g": 22,
        "carbs_g": 38,
        "fats_g": 18,
        "fiber_g": 6,
        "tags": ["high-protein", "calcium-rich"],
        "key_nutrients": ["Calcium", "Vitamin A", "Protein"],
        "healthy_alternative_to": "Deep-fried Aloo Bhatura"
    },
    {
        "id": "north_l1",
        "name": "Spiced Rajma (Kidney Beans) Curry with Steamed Brown Basmati & Cucumber Salad",
        "regional_name": "Rajma Chawal with Keri Salad",
        "region": "North Indian",
        "meal_type": "lunch",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 510,
        "protein_g": 21,
        "carbs_g": 78,
        "fats_g": 8,
        "fiber_g": 14,
        "tags": ["high-fiber", "low-gi", "heart-healthy"],
        "key_nutrients": ["Folate", "Iron", "Soluble Fiber"],
        "healthy_alternative_to": "Heavy Cream Dal Makhani with Butter Naan"
    },
    {
        "id": "north_b2",
        "name": "High-Protein Egg Bhurji / Soya Scramble with 2 Multigrain Rotis",
        "regional_name": "Anda Bhurji & Multigrain Phulka",
        "region": "North Indian",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "High Protein"],
        "calories": 410,
        "protein_g": 28,
        "carbs_g": 36,
        "fats_g": 16,
        "fiber_g": 6,
        "tags": ["high-protein", "low-gi"],
        "key_nutrients": ["Choline", "B-Vitamins", "Zinc"],
        "healthy_alternative_to": "Aloo Poori / Bhatura"
    },
    {
        "id": "north_l2",
        "name": "Grilled Tandoori Chicken Breast & Jeera Brown Basmati with Cucumber Raita",
        "regional_name": "Tandoori Murgh & Jeera Lal Chawal",
        "region": "North Indian",
        "meal_type": "lunch",
        "diet_types": ["Standard", "High Protein"],
        "calories": 540,
        "protein_g": 48,
        "carbs_g": 50,
        "fats_g": 14,
        "fiber_g": 7,
        "tags": ["high-protein", "heart-healthy", "low-gi"],
        "key_nutrients": ["Lean Protein", "Selenium", "Phosphorus"],
        "healthy_alternative_to": "Butter Chicken with Naan"
    },
    {
        "id": "north_s1",
        "name": "Roasted Spiced Chana & Foxnuts (Makhana) with Green Tea",
        "regional_name": "Bhuna Chana & Makhana Chaat",
        "region": "North Indian",
        "meal_type": "snack",
        "diet_types": ["Standard", "Vegetarian", "Vegan", "High Protein"],
        "calories": 190,
        "protein_g": 10,
        "carbs_g": 27,
        "fats_g": 5,
        "fiber_g": 6,
        "tags": ["low-gi", "high-fiber", "sugar-free", "heart-healthy"],
        "key_nutrients": ["Plant Protein", "Magnesium", "Potassium"],
        "healthy_alternative_to": "Samosa or Pakora"
    },
    {
        "id": "north_s2",
        "name": "Grilled Low-Fat Paneer Tikka Cubes with Mint Coriander Chutney",
        "regional_name": "Tandoori Paneer Tikka Skewer",
        "region": "North Indian",
        "meal_type": "snack",
        "diet_types": ["Standard", "Vegetarian", "High Protein"],
        "calories": 230,
        "protein_g": 18,
        "carbs_g": 8,
        "fats_g": 14,
        "fiber_g": 3,
        "tags": ["high-protein", "low-carb", "calcium-rich"],
        "key_nutrients": ["Calcium", "Casein Protein", "B12"],
        "healthy_alternative_to": "Gulab Jamun / Jalebi"
    },
    {
        "id": "north_d1",
        "name": "Tandoori Spiced Chicken Breast / Grilled Tofu with Palak Gravy & Methi Roti",
        "regional_name": "Tandoori Tikka Palak Bowl",
        "region": "North Indian",
        "meal_type": "dinner",
        "diet_types": ["Standard", "High Protein", "Vegetarian"],
        "calories": 530,
        "protein_g": 44,
        "carbs_g": 40,
        "fats_g": 14,
        "fiber_g": 9,
        "tags": ["high-protein", "iron-rich", "low-carb"],
        "key_nutrients": ["Heme Iron", "Zinc", "Magnesium"],
        "healthy_alternative_to": "Butter Chicken with Garlic Naan"
    },
    {
        "id": "north_d2",
        "name": "Yellow Moong Dal Tadka with Steamed Gobhi Matar & Multigrain Phulka",
        "regional_name": "Moong Dal Tadka & Gobhi Matar",
        "region": "North Indian",
        "meal_type": "dinner",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 430,
        "protein_g": 18,
        "carbs_g": 68,
        "fats_g": 8,
        "fiber_g": 12,
        "tags": ["high-fiber", "low-fat", "dairy-free"],
        "key_nutrients": ["Folate", "Fiber", "Potassium"],
        "healthy_alternative_to": "Dal Makhani with Malai Kofta"
    },

    # ── South Indian Foods ──
    {
        "id": "south_b1",
        "name": "Steamed Ragi & Oats Idli with Mixed Vegetable Sambar & Tomato Chutney",
        "regional_name": "Ragi Thatte Idli & Drumstick Sambar",
        "region": "South Indian",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 340,
        "protein_g": 14,
        "carbs_g": 58,
        "fats_g": 5,
        "fiber_g": 10,
        "tags": ["calcium-rich", "fermented", "low-gi", "dairy-free"],
        "key_nutrients": ["Calcium", "Digestive Probiotics", "Fiber"],
        "healthy_alternative_to": "Fried Medu Vada soaked in oil"
    },
    {
        "id": "south_l1",
        "name": "Moringa Leaf Drumstick Sambar with Spiced Chickpea Sundal & Red Rice",
        "regional_name": "Murungai Sambar, Konda Kadalai Sundal & Matta Rice",
        "region": "South Indian",
        "meal_type": "lunch",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 490,
        "protein_g": 22,
        "carbs_g": 76,
        "fats_g": 9,
        "fiber_g": 13,
        "tags": ["anti-inflammatory", "high-fiber", "iron-rich"],
        "key_nutrients": ["Vitamin C", "Iron", "Potassium"],
        "healthy_alternative_to": "White Ghee Pongal with Fried Bajjis"
    },
    {
        "id": "south_s1",
        "name": "Spiced Chickpea & Peanut Sundal with Curry Leaves & Buttermilk",
        "regional_name": "Kadala Sundal & Moru",
        "region": "South Indian",
        "meal_type": "snack",
        "diet_types": ["Standard", "Vegetarian"],
        "calories": 200,
        "protein_g": 11,
        "carbs_g": 26,
        "fats_g": 5,
        "fiber_g": 7,
        "tags": ["probiotic", "high-fiber", "low-gi"],
        "key_nutrients": ["Digestive Probiotics", "Plant Protein", "Folate"],
        "healthy_alternative_to": "Fried Banana / Onion Bajjis"
    },
    {
        "id": "south_d1",
        "name": "Foxtail Millet Khichdi with Drumstick Greens & Vegetable Poriyal",
        "regional_name": "Thinai Khichdi & Murungai Keerai",
        "region": "South Indian",
        "meal_type": "dinner",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 420,
        "protein_g": 16,
        "carbs_g": 66,
        "fats_g": 8,
        "fiber_g": 11,
        "tags": ["gluten-free", "high-fiber", "calcium-rich"],
        "key_nutrients": ["Iron", "Calcium", "Magnesium"],
        "healthy_alternative_to": "White Rice Ghee Pongal"
    },

    # ── West Indian Foods ──
    {
        "id": "west_b1",
        "name": "Spiced Methi Thepla with Low-Fat Curd & Roasted Flaxseed Podi",
        "regional_name": "Methi Thepla & Dahi",
        "region": "West Indian",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "Vegetarian"],
        "calories": 340,
        "protein_g": 14,
        "carbs_g": 46,
        "fats_g": 10,
        "fiber_g": 7,
        "tags": ["low-gi", "omega-3", "high-fiber"],
        "key_nutrients": ["Fenugreek Trigonelline", "Calcium", "Fiber"],
        "healthy_alternative_to": "Fried Fafda with Jalebi"
    },
    {
        "id": "west_l1",
        "name": "Moong & Matki Sprout Usal with Jowar Bhakri & Cucumber Koshimbir",
        "regional_name": "Matki Usal & Jowar Bhakri",
        "region": "West Indian",
        "meal_type": "lunch",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 480,
        "protein_g": 22,
        "carbs_g": 74,
        "fats_g": 8,
        "fiber_g": 14,
        "tags": ["gluten-free", "high-fiber", "low-gi"],
        "key_nutrients": ["Sprouted Enzymes", "Iron", "Magnesium"],
        "healthy_alternative_to": "Vada Pav / Pav Bhaji with excess butter"
    },
    {
        "id": "west_s1",
        "name": "Roasted Poha Chivda with Roasted Peanuts, Curry Leaves & Green Tea",
        "regional_name": "Poha Chivda Snack Bowl",
        "region": "West Indian",
        "meal_type": "snack",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 190,
        "protein_g": 7,
        "carbs_g": 28,
        "fats_g": 6,
        "fiber_g": 4,
        "tags": ["low-calorie", "dairy-free"],
        "key_nutrients": ["Iron", "Vitamin B1"],
        "healthy_alternative_to": "Fried Kachori / Sev Khamani"
    },
    {
        "id": "west_d1",
        "name": "Gujarati Dal Soup / Steamed Moong Dal Khichdi with Roasted Papad & Curd",
        "regional_name": "Moong Khichdi & Kadhi",
        "region": "West Indian",
        "meal_type": "dinner",
        "diet_types": ["Standard", "Vegetarian"],
        "calories": 410,
        "protein_g": 17,
        "carbs_g": 65,
        "fats_g": 7,
        "fiber_g": 9,
        "tags": ["easy-digestion", "heart-healthy"],
        "key_nutrients": ["Plant Protein", "Folate", "Potassium"],
        "healthy_alternative_to": "Sweet Undhiyu with Puri"
    },

    # ── Continental / Global Foods ──
    {
        "id": "cont_b1",
        "name": "Overnight Rolled Oats with Chia Seeds, Almond Butter & Wild Berries",
        "regional_name": "Berry Chia Oatmeal Bowl",
        "region": "Continental / Global",
        "meal_type": "breakfast",
        "diet_types": ["Standard", "Vegetarian", "Vegan"],
        "calories": 380,
        "protein_g": 16,
        "carbs_g": 48,
        "fats_g": 14,
        "fiber_g": 11,
        "tags": ["beta-glucan", "antioxidant", "heart-healthy"],
        "key_nutrients": ["Beta-Glucan", "Omega-3 ALA", "Magnesium"],
        "healthy_alternative_to": "Sugary processed breakfast cereals"
    },
    {
        "id": "cont_l1",
        "name": "Herb-Grilled Salmon or Lemon Tofu with Roasted Quinoa & Asparagus",
        "regional_name": "Mediterranean Quinoa Protein Bowl",
        "region": "Continental / Global",
        "meal_type": "lunch",
        "diet_types": ["Standard", "High Protein", "Vegetarian"],
        "calories": 540,
        "protein_g": 42,
        "carbs_g": 44,
        "fats_g": 18,
        "fiber_g": 8,
        "tags": ["omega-3", "low-sodium", "high-protein"],
        "key_nutrients": ["DHA/EPA", "Potassium", "Selenium"],
        "healthy_alternative_to": "Fried fish & chips or creamy Alfredo pasta"
    },
    {
        "id": "cont_s1",
        "name": "Low-Fat Greek Yogurt with Crushed Walnuts & Green Apple Slices",
        "regional_name": "Greek Yogurt Walnut Parfait",
        "region": "Continental / Global",
        "meal_type": "snack",
        "diet_types": ["Standard", "Vegetarian", "High Protein"],
        "calories": 220,
        "protein_g": 16,
        "carbs_g": 18,
        "fats_g": 9,
        "fiber_g": 3,
        "tags": ["probiotic", "high-protein", "omega-3"],
        "key_nutrients": ["Calcium", "ALA Omega-3", "Protein"],
        "healthy_alternative_to": "Donuts or processed candy bars"
    },
    {
        "id": "cont_d1",
        "name": "Pan-Seared Lemon Cod / Turkey Breast with Roasted Sweet Potato & Steamed Green Beans",
        "regional_name": "Herb Roasted Poultry / Cod Plate",
        "region": "Continental / Global",
        "meal_type": "dinner",
        "diet_types": ["Standard", "High Protein"],
        "calories": 510,
        "protein_g": 45,
        "carbs_g": 44,
        "fats_g": 14,
        "fiber_g": 8,
        "tags": ["high-protein", "omega-3", "low-sodium"],
        "key_nutrients": ["Lean Protein", "Potassium", "Vitamin A"],
        "healthy_alternative_to": "Fried chicken with French fries"
    }
]


# ══════════════════════════════════════════════════════
#  6. Normalization Lookups & Mappings
# ══════════════════════════════════════════════════════

REGION_MAP = {
    "east_indian": "East Indian / Bengali",
    "east indian / bengali": "East Indian / Bengali",
    "bengali": "East Indian / Bengali",
    "north_indian": "North Indian",
    "north indian": "North Indian",
    "south_indian": "South Indian",
    "south indian": "South Indian",
    "west_indian": "West Indian",
    "west indian": "West Indian",
    "continental": "Continental / Global",
    "continental / global": "Continental / Global"
}

CONDITION_MAP = {
    "none": "none",
    "none / general wellness": "none",
    "general": "none",
    "diabetes_type2": "diabetes_type2",
    "diabetes (type 2 / pre-diabetes)": "diabetes_type2",
    "diabetes": "diabetes_type2",
    "hypertension": "hypertension",
    "hypertension (high blood pressure)": "hypertension",
    "high_cholesterol": "high_cholesterol",
    "high cholesterol / dyslipidemia": "high_cholesterol",
    "pcos_pcod": "pcos_pcod",
    "pcos": "pcos_pcod",
    "pcod": "pcos_pcod",
    "thyroid_hypo": "thyroid_hypo",
    "thyroid (hypothyroidism)": "thyroid_hypo",
    "lactose_intolerance": "lactose_intolerance",
    "lactose intolerance": "lactose_intolerance",
    "gluten_sensitivity": "gluten_sensitivity",
    "gluten sensitivity / celiac": "gluten_sensitivity"
}

GOAL_MAP = {
    "weight loss": "Weight Loss",
    "weight loss (caloric deficit)": "Weight Loss",
    "muscle building": "Muscle Building",
    "muscle building (hypertrophy surplus)": "Muscle Building",
    "general fitness": "General Fitness",
    "general fitness (maintenance)": "General Fitness",
    "general udyamness": "General Fitness",
    "sports performance": "Sports Performance",
    "sports performance (glycogen boost)": "Sports Performance"
}


# ══════════════════════════════════════════════════════
#  7. Personalized Nutrition Engine Functions
# ══════════════════════════════════════════════════════

def normalize_condition_id(cond_str):
    if not cond_str:
        return "none"
    clean = str(cond_str).strip().lower()
    return CONDITION_MAP.get(clean, "none")


def normalize_region_name(reg_str):
    if not reg_str:
        return "Continental / Global"
    clean = str(reg_str).strip().lower()
    return REGION_MAP.get(clean, "Continental / Global")


def normalize_goal_name(goal_str):
    if not goal_str:
        return "General Fitness"
    clean = str(goal_str).strip().lower()
    return GOAL_MAP.get(clean, "General Fitness")


def get_important_nutrients(health_condition="none", fitness_goal="General Fitness", activity_level="moderate"):
    """
    Returns prioritized nutrients and non-diagnostic guidelines based on
    health condition, fitness goal, and activity level.
    """
    cond_id = normalize_condition_id(health_condition)
    goal = normalize_goal_name(fitness_goal)

    # 1. Base condition nutrients
    cond_obj = next((c for c in HEALTH_CONDITIONS if c["id"] == cond_id), HEALTH_CONDITIONS[0])
    nutrients = []
    for item in cond_obj.get("priority_nutrients", []):
        nutrients.append({
            "nutrient": item["nutrient"],
            "target": item["target"],
            "guideline": item["target"],
            "reason": item["benefit"],
            "benefit": item["benefit"]
        })

    # 2. Fitness goal nutrients
    if goal == "Weight Loss":
        nutrients.append({
            "nutrient": "Satiety-Enhancing Fiber",
            "target": "32-40g/day",
            "guideline": "32-40g/day",
            "reason": "Promotes gastric distension, reduces ghrelin secretion, and protects against caloric deficit hunger.",
            "benefit": "Promotes gastric distension, reduces ghrelin secretion, and protects against caloric deficit hunger."
        })
    elif goal == "Muscle Building":
        nutrients.append({
            "nutrient": "Leucine & Essential Amino Acids (EAAs)",
            "target": "2.8-3.2g leucine/meal",
            "guideline": "2.8-3.2g leucine/meal",
            "reason": "Activates the muscle protein synthesis (mTORC1) trigger for accelerated muscular hypertrophy.",
            "benefit": "Activates the muscle protein synthesis (mTORC1) trigger for accelerated muscular hypertrophy."
        })
    elif goal == "Sports Performance":
        nutrients.append({
            "nutrient": "Electrolytes & Rapid Glycogen Carbs",
            "target": "5.5-7.0g/kg carbs",
            "guideline": "5.5-7.0g/kg carbs",
            "reason": "Optimizes intramuscular glycogen repletion and prevents cramping during high-volume sports drills.",
            "benefit": "Optimizes intramuscular glycogen repletion and prevents cramping during high-volume sports drills."
        })

    # 3. Activity level adjustment
    act_clean = str(activity_level).strip().lower()
    if act_clean in ("very", "very active"):
        nutrients.append({
            "nutrient": "Intra & Post-Training Fluid & Sodium",
            "target": "+500-750ml during sessions",
            "guideline": "+500-750ml during sessions",
            "reason": "Restores perspiration sodium loss and maintains optimal extracellular fluid balance.",
            "benefit": "Restores perspiration sodium loss and maintains optimal extracellular fluid balance."
        })

    return nutrients


def generate_personalized_diet_chart(region="Continental / Global", diet_type="Standard",
                                     health_condition="none", fitness_goal="General Fitness",
                                     activity_level="moderate", target_calories=2000, macro_targets=None):
    """
    Generates a deterministic 4-meal diet chart (Breakfast, Lunch, Evening Snack, Dinner)
    filtered by region, diet preference, health-condition restrictions, fitness goal, and activity level.
    """
    cond_id = normalize_condition_id(health_condition)
    reg_name = normalize_region_name(region)
    goal = normalize_goal_name(fitness_goal)
    diet = str(diet_type).strip()

    cond_obj = next((c for c in HEALTH_CONDITIONS if c["id"] == cond_id), HEALTH_CONDITIONS[0])
    recommended_tags = set(cond_obj.get("recommended_tags", []))
    restrictions = cond_obj.get("restrictions", [])

    meal_slots = [
        ("breakfast", "Breakfast", 0.25),
        ("lunch", "Lunch", 0.35),
        ("snack", "Evening Snack", 0.15),
        ("dinner", "Dinner", 0.25)
    ]

    selected_meals = []

    for slot_key, slot_title, slot_ratio in meal_slots:
        slot_target_cal = target_calories * slot_ratio
        candidates = [item for item in FOOD_ITEMS if item["meal_type"] == slot_key]

        # 1. Filter by dietary preference
        def matches_diet(item):
            d_types = item.get("diet_types", [])
            if diet == "Vegetarian":
                return "Vegetarian" in d_types or "Vegan" in d_types
            elif diet == "Vegan":
                return "Vegan" in d_types
            elif diet == "High Protein":
                return "High Protein" in d_types or "Standard" in d_types
            elif diet == "Keto":
                return "Keto" in d_types or item.get("carbs_g", 100) <= 20
            return True

        diet_filtered = [item for item in candidates if matches_diet(item)]
        if not diet_filtered:
            diet_filtered = candidates

        # 2. Filter by health condition restrictions
        def is_restricted(item):
            tags = set(item.get("tags", []))
            if cond_id == "diabetes_type2":
                if "high-gi" in tags or "refined-sugar" in tags:
                    return True
            elif cond_id == "hypertension":
                if "high-sodium" in tags:
                    return True
            elif cond_id == "high_cholesterol":
                if "high-saturated-fat" in tags:
                    return True
            elif cond_id == "lactose_intolerance":
                if "dairy-free" not in tags and "lactose-free" not in tags:
                    # Check if dairy item
                    if "paneer" in item["name"].lower() or "dahi" in item["name"].lower() or "curd" in item["name"].lower() or "yogurt" in item["name"].lower():
                        return True
            elif cond_id == "gluten_sensitivity":
                if "gluten-free" not in tags:
                    if "roti" in item["name"].lower() or "wheat" in item["name"].lower() or "dalia" in item["name"].lower():
                        return True
            return False

        safe_candidates = [item for item in diet_filtered if not is_restricted(item)]
        if not safe_candidates:
            safe_candidates = diet_filtered

        # 3. Deterministic scoring
        def score_candidate(item):
            score = 0
            # Strong preference for target region
            if item.get("region") == reg_name:
                score += 100

            # Alignment with specific diet type
            if diet in item.get("diet_types", []):
                score += 30

            # Condition recommended tags matching
            item_tags = set(item.get("tags", []))
            overlap = item_tags.intersection(recommended_tags)
            score += (len(overlap) * 15)

            # Fitness goal alignment
            if goal == "Muscle Building" or diet == "High Protein":
                score += (item.get("protein_g", 0) * 3)
            elif goal == "Weight Loss":
                score += (item.get("fiber_g", 0) * 4) - (item.get("calories", 0) / 40.0)
            elif goal == "Sports Performance":
                score += (item.get("carbs_g", 0) * 2) + (item.get("protein_g", 0) * 1.5)

            # Proximity to target meal budget
            cal_diff = abs(item.get("calories", 300) - slot_target_cal)
            score -= (cal_diff / 10.0)

            return score

        # Sort deterministically: highest score first, item id as stable secondary key
        sorted_candidates = sorted(safe_candidates, key=lambda it: (-score_candidate(it), it["id"]))
        best_item = sorted_candidates[0]
        selected_meals.append((slot_title, best_item))

    # 4. Calorie portion scaling (keep reasonably close to target without extreme distortions)
    base_total = sum(item["calories"] for _, item in selected_meals)
    scale = 1.0
    if base_total > 0 and target_calories > 0:
        scale = round(target_calories / base_total, 2)
        scale = max(0.85, min(1.28, scale))  # constrain realistic scaling range

    diet_chart = []
    for slot_title, item in selected_meals:
        diet_chart.append({
            "meal": slot_title,
            "food_name": item["name"],
            "regional_name": item.get("regional_name", item["name"]),
            "calories": round(item["calories"] * scale),
            "protein_g": round(item["protein_g"] * scale),
            "carbs_g": round(item["carbs_g"] * scale),
            "fats_g": round(item["fats_g"] * scale),
            "fiber_g": round(item.get("fiber_g", 4) * scale),
            "key_nutrients": item.get("key_nutrients", []),
            "tags": item.get("tags", []),
            "healthy_alternative": item.get("healthy_alternative_to", "Deep-fried / refined alternative")
        })

    # Legacy meal_plan dictionary for backward compatibility with frontend tiles
    meal_plan = {
        "breakfast": f"{diet_chart[0]['food_name']} (~{diet_chart[0]['calories']} kcal · {diet_chart[0]['protein_g']}g Protein)",
        "lunch": f"{diet_chart[1]['food_name']} (~{diet_chart[1]['calories']} kcal · {diet_chart[1]['protein_g']}g Protein)",
        "snack": f"{diet_chart[2]['food_name']} (~{diet_chart[2]['calories']} kcal · {diet_chart[2]['protein_g']}g Protein)",
        "dinner": f"{diet_chart[3]['food_name']} (~{diet_chart[3]['calories']} kcal · {diet_chart[3]['protein_g']}g Protein)"
    }

    return diet_chart, meal_plan


def get_daily_suggestions(health_condition="none", fitness_goal="General Fitness",
                          activity_level="moderate", region="Continental / Global",
                          diet_type="Standard", water_litres=3.0):
    """
    Returns concise daily suggestions including healthy swaps, hydration guidance,
    meal timing, workout nutrition, and foods to limit based on condition restrictions.
    """
    cond_id = normalize_condition_id(health_condition)
    reg_name = normalize_region_name(region)
    goal = normalize_goal_name(fitness_goal)

    cond_obj = next((c for c in HEALTH_CONDITIONS if c["id"] == cond_id), HEALTH_CONDITIONS[0])

    # 1. Healthy Swaps (Region & Condition tailored)
    swaps = []
    if "East Indian" in reg_name or "Bengali" in reg_name:
        swaps.append("Choose light cumin-tomato broth (Patla Jhol) over heavy mustard gravies (Kalia) to maintain vascular health.")
        swaps.append("Replace refined maida Luchi with whole wheat/oats chilla or boiled eggs with whole grain roti.")
        swaps.append("Opt for fresh homemade chhena flavored with cardamom over sugar-syrup soaked sweets.")
    elif "North Indian" in reg_name:
        swaps.append("Swap heavy cream Dal Makhani for iron-rich Rajma or protein-dense yellow Moong Tadka.")
        swaps.append("Choose roasted whole multigrain phulkas instead of refined butter naans.")
        swaps.append("Snack on dry-roasted spiced foxnuts (Makhana) or boiled chana instead of fried samosas.")
    elif "South Indian" in reg_name:
        swaps.append("Choose fermented Ragi and Oats steamed Idlis instead of deep-fried oil-soaked Medu Vada.")
        swaps.append("Incorporate fiber-rich Drumstick Moringa leaf sambar and chickpea sundal for cellular antioxidants.")
    elif "West Indian" in reg_name:
        swaps.append("Enjoy sprouted Moong & Matki Usal with Jowar Bhakri instead of calorie-dense buttery Pav Bhaji.")
        swaps.append("Choose roasted Poha Chivda with peanuts instead of deep-fried farsan.")
    else:
        swaps.append("Swap creamy Alfredo and mayonnaise dressings for cold-pressed extra virgin olive oil and lemon herbs.")
        swaps.append("Select herbed brown rice or quinoa instead of refined white pasta.")

    # 2. Hydration Guidance
    hydration = f"Target approximately {water_litres}L of water daily. Consume 350-500ml upon waking, hydrate consistently between meals, and avoid drinking large volumes of water immediately following heavy meals."

    # 3. Meal Timing
    meal_timing = [
        "Breakfast: Within 60-90 minutes of waking to jumpstart metabolic rate and replenish liver glycogen.",
        "Lunch: 4-5 hours post-breakfast with a robust mix of complex fiber, lean protein, and healthy fats.",
        "Evening Snack: 4:30 PM - 5:30 PM to stabilize blood sugar and avert impulsive dinner bingeing.",
        "Dinner: At least 2.5 hours before sleep to support optimal gastric emptying, sleep architecture, and nocturnal GH release."
    ]

    # 4. Workout Nutrition
    act_clean = str(activity_level).strip().lower()
    if goal == "Muscle Building" or act_clean in ("very", "very active"):
        workout_nutr = "Consume 25-35g of bioavailable protein and 30-40g of complex carbohydrates within 45-60 minutes post-training to maximize muscle protein synthesis and glycogen restoration."
    elif goal == "Weight Loss":
        workout_nutr = "Hydrate with water and pinch of rock salt prior to exercise. Post-workout, prioritize high-fiber vegetables and lean protein to sustain prolonged satiety while maintaining your caloric deficit."
    elif goal == "Sports Performance":
        workout_nutr = "Consume a high-glycogen carb snack (banana with nut butter or oats) 60-90 minutes pre-game, and rehydrate with electrolytes and protein immediately post-match."
    else:
        workout_nutr = "Maintain steady hydration before workouts and consume a balanced meal containing quality protein within 2 hours post-session."

    # 5. Foods to Limit (Driven by clinical nutrition restrictions)
    foods_to_limit = list(cond_obj.get("restrictions", []))
    if goal == "Weight Loss":
        if "Calorically dense sauces and sugary beverages" not in foods_to_limit:
            foods_to_limit.append("Calorically dense sauces and sugary beverages")
    if "Ultra-processed trans-fat fried snacks" not in foods_to_limit:
        foods_to_limit.append("Ultra-processed trans-fat fried snacks")

    return {
        "healthy_swaps": swaps,
        "hydration_guidance": hydration,
        "meal_timing": meal_timing,
        "workout_nutrition": workout_nutr,
        "foods_to_limit": foods_to_limit
    }


def get_supported_options():
    """Return sanitized list of options for API consumers."""
    return {
        "health_conditions": [
            {
                "id": c["id"],
                "name": c["name"],
                "category": c["category"],
                "guidance": c["guidance"],
                "priority_nutrients": c["priority_nutrients"],
                "restrictions": c["restrictions"]
            }
            for c in HEALTH_CONDITIONS
        ],
        "regions": [
            {
                "id": r["id"],
                "name": r["name"],
                "description": r["description"],
                "staples": r["staples"],
                "signature_dish": r["signature_healthy_dish"]
            }
            for r in REGIONS
        ],
        "dietary_preferences": DIETARY_PREFERENCES,
        "fitness_goals": FITNESS_GOALS,
        "activity_levels": ACTIVITY_LEVELS
    }

