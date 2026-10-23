import { useState, useRef, useEffect } from "react";
import { apiUrl } from "../apiBase";

/* ─── Design Tokens ───────────────────────────────────────────────────────── */
const DOSHA = {
  Vata:  { color:"#7C6FCD", bg:"#F0EEFB", text:"#3B2F8F", sym:"🌬️", el:"Air + Ether", agni:"Vishama Agni", gradient:"linear-gradient(135deg,#6B5FC4 0%,#9B8EE4 100%)" },
  Pitta: { color:"#D05A1E", bg:"#FBF0EB", text:"#7A2A05", sym:"🔥", el:"Fire + Water", agni:"Tikshna Agni", gradient:"linear-gradient(135deg,#C84A10 0%,#E88040 100%)" },
  Kapha: { color:"#2E8A52", bg:"#EAF7F0", text:"#145030", sym:"🌍", el:"Earth + Water", agni:"Manda Agni", gradient:"linear-gradient(135deg,#267044 0%,#5AAF80 100%)" },
};

const GOALS     = [
  { id:"Balance",  icon:"⚖️", desc:"Restore doshic harmony" },
  { id:"Detox",    icon:"🫧", desc:"Cleanse Ama (toxins)" },
  { id:"Energy",   icon:"⚡", desc:"Build Ojas & vitality" },
  { id:"Weight",   icon:"🌿", desc:"Healthy weight management" },
  { id:"Immunity", icon:"🛡️", desc:"Strengthen natural defenses" },
];
const LIFESTYLES = [
  { id:"Vegetarian",     icon:"🥗", sub:"Dairy included" },
  { id:"Vegan",          icon:"🌱", sub:"No animal products" },
  { id:"Non-vegetarian", icon:"🍳", sub:"Eggs & light meats" },
];
const SEASONS    = [
  { id:"Spring", icon:"🌸" }, { id:"Summer", icon:"☀️" },
  { id:"Autumn", icon:"🍂" }, { id:"Winter", icon:"❄️" },
];
const MEAL_META  = {
  breakfast:   { icon:"🌅", label:"Breakfast",   time:"7:30 – 8:30 AM" },
  mid_morning: { icon:"🍵", label:"Mid-Morning", time:"10:30 AM" },
  lunch:       { icon:"☀️", label:"Lunch",       time:"12:00 – 1:30 PM" },
  evening:     { icon:"🌤️", label:"Evening",     time:"4:00 – 5:00 PM" },
  dinner:      { icon:"🌙", label:"Dinner",      time:"6:30 – 7:30 PM" },
};
const ENERGY_COLORS = {
  Light:      { bg:"#E8F5E9", text:"#2E7D32", border:"#A5D6A7" },
  Moderate:   { bg:"#FFF8E1", text:"#F57F17", border:"#FFD54F" },
  Heavy:      { bg:"#FDE8E8", text:"#B71C1C", border:"#EF9A9A" },
  Nourishing: { bg:"#E3F2FD", text:"#0D47A1", border:"#90CAF9" },
};
const BLOOD_MARKER_META = {
  cholesterol: { label: "Total Cholesterol", unit: "mg/dL", normal: "< 200", warnAbove: 200 },
  triglycerides: { label: "Triglycerides", unit: "mg/dL", normal: "< 150", warnAbove: 150 },
  ldl: { label: "LDL", unit: "mg/dL", normal: "< 130", warnAbove: 130 },
  hdl: { label: "HDL", unit: "mg/dL", normal: ">= 40", warnBelow: 40 },
  hemoglobin: { label: "Hemoglobin", unit: "g/dL", normal: ">= 12", warnBelow: 12 },
  glucose: { label: "Fasting Glucose", unit: "mg/dL", normal: "70 - 110", warnAbove: 110, warnBelow: 70 },
  hba1c: { label: "HbA1c", unit: "%", normal: "< 5.7", warnAbove: 5.7, dangerAbove: 6.5 },
  vitamin_d: { label: "Vitamin D", unit: "ng/mL", normal: ">= 20", warnBelow: 20 },
  vitamin_b12: { label: "Vitamin B12", unit: "pg/mL", normal: ">= 200", warnBelow: 200 },
  uric_acid: { label: "Uric Acid", unit: "mg/dL", normal: "<= 7", warnAbove: 7 },
  creatinine: { label: "Creatinine", unit: "mg/dL", normal: "<= 1.3", warnAbove: 1.3 },
};
const ABNORMALITY_ADVICE = {
  "High Cholesterol": "Favor fiber-rich meals, reduce fried/oily foods, and choose lighter dinner options.",
  "High Triglycerides": "Cut refined carbs and sugar, use smaller portions, and include more legumes and vegetables.",
  "High LDL": "Prioritize whole grains and soluble fiber, and reduce saturated fat-heavy foods.",
  "Low HDL": "Include healthy fats in moderation and maintain regular physical activity with lighter evening meals.",
  "Low Hemoglobin": "Add iron-supportive foods with vitamin C pairings to improve absorption.",
  "High Blood Sugar": "Prefer low-glycemic meals, avoid sugary snacks, and keep meal timing consistent.",
  "Prediabetes Range HbA1c": "Use balanced plates with controlled carbs and daily movement after meals.",
  "High HbA1c": "Emphasize strict glycemic control with low refined carbs and high-fiber meal patterns.",
  "Low Vitamin D": "Include vitamin D supportive foods and discuss safe sun exposure with your clinician.",
  "Low Vitamin B12": "Add B12-rich options based on your lifestyle and discuss supplementation if needed.",
  "High Uric Acid": "Reduce high-purine foods, hydrate well, and avoid heavy late-night meals.",
  "High Creatinine": "Keep meals kidney-friendly and moderate protein load; follow clinician guidance.",
};
const MANUAL_BLOOD_FIELDS = [
  { key: "glucose", label: "Glucose (mg/dL)" },
  { key: "hba1c", label: "HbA1c (%)" },
  { key: "cholesterol", label: "Total Cholesterol (mg/dL)" },
  { key: "triglycerides", label: "Triglycerides (mg/dL)" },
  { key: "ldl", label: "LDL (mg/dL)" },
  { key: "hdl", label: "HDL (mg/dL)" },
  { key: "hemoglobin", label: "Hemoglobin (g/dL)" },
  { key: "vitamin_d", label: "Vitamin D (ng/mL)" },
  { key: "vitamin_b12", label: "Vitamin B12 (pg/mL)" },
  { key: "uric_acid", label: "Uric Acid (mg/dL)" },
  { key: "creatinine", label: "Creatinine (mg/dL)" },
];
const TABS = [
  { id:"meals",       label:"Meal Plan",    icon:"🍽️" },
  { id:"timing",      label:"Timing",       icon:"⏰" },
  { id:"spices",      label:"Spice Blends", icon:"🌶️" },
  { id:"wisdom",      label:"Eating Rules", icon:"📜" },
  { id:"avoid",       label:"Avoid",        icon:"⚠️" },
  { id:"supplements", label:"Herbs",        icon:"🌱" },
];

const SEASONAL_CONTEXT = {
  Spring: {
    icon: "🌸",
    highlight: "Spring meals should feel light, cleansing, and Kapha-reducing, with bitter greens, sprouts, methi, karela, kanji, and minimal oil.",
    note: "Spring Ritu supports detox through light grains, bitter greens, dry roasting, steaming, and pungent digestive spices.",
  },
  Summer: {
    icon: "☀️",
    highlight: "Summer meals should cool Pitta with lauki, tori, cucumber, pudina, dhaniya, coconut, sattu, rice, moong, chaas, and gentle spicing.",
    note: "Summer Ritu asks for cooling, hydrating foods with minimal heat, salt, frying, and sharp spices.",
  },
  Autumn: {
    icon: "🍂",
    highlight: "Autumn meals should transition from bitter and astringent foods into mild warmth with sesame, ginger, sweet potato, roots, ghee, and gentle spices.",
    note: "Autumn Ritu balances lingering Pitta and rising Vata through cooked foods, moderate warmth, and grounding ingredients.",
  },
  Winter: {
    icon: "❄️",
    highlight: "Winter meals should be warm, nourishing, and Agni-supporting with bajra, makki, sarson, til, gur, ghee, urad dal, methi, mooli, and root vegetables.",
    note: "Winter Ritu supports richer slow-cooked food, warming spices, and deeper nourishment because digestive fire is stronger.",
  },
};

const normalizeMealItems = (items, defaultEnergy = "Moderate") =>
  (items || []).map((item) => {
    if (typeof item === "string") {
      return {
        name: item,
        description: "Ayurvedic meal suggestion matched to your dosha, season, and goal.",
        energy: defaultEnergy,
      };
    }

    return {
      name: item?.name || "Meal",
      description: item?.description || "Ayurvedic meal suggestion matched to your dosha, season, and goal.",
      energy: item?.energy || defaultEnergy,
    };
  });

const normalizeMealPlan = (rawPlan = {}, selectedSeason = "") => {
  const source = rawPlan.meals && !Array.isArray(rawPlan.meals) ? rawPlan.meals : rawPlan;
  const seasonal = SEASONAL_CONTEXT[selectedSeason] || {};

  return {
    breakfast: normalizeMealItems(source.breakfast, "Moderate"),
    mid_morning: normalizeMealItems(source.mid_morning, "Light"),
    lunch: normalizeMealItems(source.lunch, "Nourishing"),
    evening: normalizeMealItems(source.evening, "Light"),
    dinner: normalizeMealItems(source.dinner, "Light"),
    daily_wisdom: source.daily_wisdom || rawPlan.principle || seasonal.note || "",
    agni_tip: source.agni_tip || rawPlan.agni_desc || "",
    seasonal_highlight: source.seasonal_highlight || rawPlan.seasonal_highlight || seasonal.highlight || "",
  };
};

const getMarkerStatus = (key, value) => {
  if (value == null || Number.isNaN(Number(value))) return "neutral";
  const meta = BLOOD_MARKER_META[key];
  if (!meta) return "neutral";

  if (meta.dangerAbove != null && value >= meta.dangerAbove) return "high";
  if (meta.warnAbove != null && value > meta.warnAbove) return "high";
  if (meta.warnBelow != null && value < meta.warnBelow) return "low";
  return "normal";
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getLatestDosha = () => {
  try {
    return JSON.parse(localStorage.getItem("latestDosha") || "null");
  } catch {
    return null;
  }
};

/* ─── AI System Prompt (Indian dishes, strict JSON) ─────────────────────── */
const SYSTEM_PROMPT = `You are an expert Ayurvedic nutritionist specialising in INDIAN home cooking. Generate a UNIQUE daily meal plan using ONLY traditional Indian dishes.

MANDATORY RULES — NEVER BREAK THESE:

RULE 1 — ONLY INDIAN DISHES:
Every single meal must be a real Indian dish. Use names like: Poha, Upma, Idli, Dosa, Paratha, Khichdi, Dal Tadka, Sabzi, Roti, Chapati, Thepla, Dhokla, Uttapam, Rasam, Sambar, Kadhi, Pulao, Biryani (light), Pongal, Rajma, Chole, Methi Thepla, Lauki Sabzi, Palak Dal, Moong Dal, Masoor Dal, Toor Dal, Rava Upma, Poha, Sabudana Khichdi, Sprout Bhel, Besan Chilla, Sattu Sherbet, Kanji, Lassi, Chaas, Shrikhand. Regional variety is encouraged — South Indian (idli/dosa/rasam/sambar), North Indian (roti/dal/sabzi), Gujarati (thepla/khichdi/kadhi), Bengali (rice/dal/fish curry).

RULE 2 — LIFESTYLE (STRICTLY ENFORCE):
- Vegetarian: Dairy and ghee allowed. NO eggs, fish, meat.
- Vegan: Use coconut oil or mustard oil. NO ghee, dairy, eggs, meat. Use plant milks.
- Non-vegetarian: MUST include egg burji, fish curry, chicken curry, mutton, or similar in 2-3 slots. E.g. Egg Bhurji for breakfast, Rohu Machher Jhol for lunch, Murgh Shorba for dinner.

RULE 3 — DOSHA-ALIGNED SPICING:
- Vata: warm, oily, sweet-sour-salty. Ghee in everything. Jeera, saunf, ajwain, ginger, cinnamon.
- Pitta: cooling, mild. Coriander, saunf, cardamom, coconut, mint. Avoid chili and tamarind.
- Kapha: light, dry, pungent. Trikatu, black pepper, mustard, methi, karela, radish.

RULE 4 — STRUCTURE:
- Breakfast: light/moderate Indian breakfast dish
- Mid-morning: herbal drink (CCF chai, tulsi tea, jeera water, ajwain water) or very light snack
- Lunch: full Indian thali-style meal (dal + sabzi + roti/rice)
- Evening: Indian chai/herbal drink or light Indian snack
- Dinner: light Indian one-pot or soup (khichdi, dal, rasam-rice)

RULE 5 — VARIETY:
Every generation must use DIFFERENT dishes. Rotate between: South Indian, North Indian, Gujarati, Bengali, Maharashtrian styles.

OUTPUT FORMAT — strict JSON only, zero markdown, zero explanation:
{
  "breakfast":   [{"name":"Moong Dal Chilla","description":"...","energy":"Light|Moderate|Heavy"}],
  "mid_morning": [{"name":"Jeera-Ajwain Water","description":"...","energy":"Light"}],
  "lunch":       [{"name":"Dal Tadka + Phulka + Aloo Gobi Sabzi","description":"...","energy":"Nourishing"}],
  "evening":     [{"name":"Tulsi-Adrak Chai","description":"...","energy":"Light"}],
  "dinner":      [{"name":"Moong Dal Khichdi","description":"...","energy":"Light"}],
  "daily_wisdom":"One Ayurvedic insight for today (1 sentence, mention Indian food culture)",
  "agni_tip":"Specific Indian kitchen tip for this dosha's Agni (1 sentence, mention actual spice/ingredient)"
}
2-3 items per section. No dish repeated across sections.`;

/* ─── Local wisdom per dosha ─────────────────────────────────────────────── */
const LOCAL_WISDOM = {
  Vata: {
    meal_timing: {
      "06:30": "Warm water with lemon + sesame oil pulling (til tel gandusha).",
      "07:30": "Nourishing warm breakfast — never skip; regularity is Vata's medicine.",
      "10:30": "CCF chai (jeera-dhaniya-saunf kadha) + 4–6 soaked badam.",
      "12:30": "Main meal — dal-chawal with ghee, or warm kitchari with sabzi.",
      "16:00": "Ashwagandha golden milk (haldi doodh with ashwagandha).",
      "19:00": "Light khichdi or moong soup with roti and ghee.",
      "21:30": "Warm milk with jaiphal (nutmeg) or triphala in water.",
    },
    spice_blends: [
      { name:"Vata Churna",    recipe:"Jeera, dhaniya, saunf, adrak, dalchini, elaichi, hing (1:1:1:½:½:½:pinch)", use:"1 tsp stirred into any sabzi or dal per serving." },
      { name:"CCF Kadha",      recipe:"Equal parts jeera, dhaniya, saunf seeds",                                    use:"Boil 1 tsp in 2 cups water for 5 min. Drink warm between meals." },
      { name:"Trikatu Powder", recipe:"Equal parts sonth (dry ginger), kali mirch, pippali",                        use:"½ tsp with warm water before meals to kindle Vishama Agni." },
    ],
    eating_rules: [
      "Eat at the SAME time every day — niyamit bhojan is the greatest Vata medicine",
      "Always eat garam (warm) food — never eat from the fridge directly",
      "Add ghee to every meal — sneha (oiliness) grounds Vata instantly",
      "Sit in Sukhasana to eat — never eat standing or walking",
      "Eat in a shant (calm) environment — stress completely kills Vata digestion",
      "Chew every bite thoroughly; Vata types rush eating and create gas",
      "Finish eating by 7:30 PM — digestive fire weakens after sunset",
    ],
    avoid: {
      tastes:  ["Tikta (bitter) in excess", "Katu (pungent) in excess", "Kashaya (astringent) in excess"],
      foods:   ["Popcorn / kurmura (dry, rough)", "Raw salads", "Sookhe meva without soaking", "Maida-based snacks"],
      drinks:  ["Thanda paani (cold water)", "Carbonated drinks", "Too much chai/coffee"],
      habits:  ["Bhojan chhodna (skipping meals)", "Eating while anxious", "Eating very late at night"],
    },
    supplements: [
      { name:"Ashwagandha",     dose:"500mg with warm doodh at bedtime",               benefit:"Grounds Vata, builds Ojas and bala (strength)" },
      { name:"Shatavari Churna",dose:"1 tsp with warm doodh twice daily",              benefit:"Nourishes dhatus, calms the nervous system" },
      { name:"Triphala Churna", dose:"½ tsp with warm water before bed",               benefit:"Regulates irregular malavisharga (digestion) overnight" },
    ],
  },
  Pitta: {
    meal_timing: {
      "06:00": "Thanda jal (cool water) + 2 tbsp aloe vera juice or coconut water.",
      "07:30": "Light, sweet cooling breakfast — seasonal phals or barley/oats.",
      "10:00": "Saunf chai or dhaniya-pudina kadha. A handful of angoor (grapes).",
      "12:30": "BIGGEST meal of the day — Pitta Agni peaks at noon. Full thali.",
      "16:30": "Gulkand sharbat or rose water with mishri (rock sugar).",
      "18:30": "Light, early dinner before 7 PM — small portions only.",
      "21:00": "Warm doodh with shatavari or gulkand (rose petal jam).",
    },
    spice_blends: [
      { name:"Pitta Churna",  recipe:"Dhaniya, saunf, elaichi, haldi, pudina, shatavari (2:2:1:1:1:1)", use:"Sprinkle on sabzi and dal; cools Agni without dulling it." },
      { name:"Cooling Kadha", recipe:"Dhaniya seeds, elaichi, saunf, gulab petals (2:1:2:1)",           use:"Steep in hot jal, let cool before drinking." },
      { name:"Gulkand Doodh", recipe:"1 tsp gulkand (rose petal jam) in room-temperature doodh",        use:"Drink in the afternoon to cool Pitta heat." },
    ],
    eating_rules: [
      "Never eat when krodh (angry) or stressed — Pitta Agni will literally burn",
      "Make dopahar ka bhojan (lunch) the BIGGEST meal of the day",
      "Eat in a sheetai (cool), pleasant, and beautiful environment",
      "Add ghee to food — ghee is specifically sheetal (cooling) for Pitta",
      "Khana 7 baje se pehle khaayein — eat dinner before 7 PM",
      "Avoid barf ka paani (iced water) — cool or room-temperature is fine",
      "Do not eat immediately after vyayam (exercise) while still overheated",
    ],
    avoid: {
      tastes:  ["Katu (pungent/spicy) in excess", "Amla (sour) in excess", "Lavana (salty) in excess"],
      foods:   ["Mirch (chili in excess)", "Kachcha lehsun (raw garlic)", "Sirka (vinegar)", "Khatta achaar (sour pickles)"],
      drinks:  ["Sharab (alcohol)", "Coffee", "Khatta nimbu juice in excess"],
      habits:  ["Eating when angry or in a rush", "Eating in direct sun/heat", "Raat ka khana bahut late khaana"],
    },
    supplements: [
      { name:"Amalaki (Amla) Churna", dose:"1 tsp with room-temp jal, morning",   benefit:"Sheetal, anti-inflammatory, richest Vitamin C source" },
      { name:"Shatavari Churna",       dose:"1 tsp in warm doodh at bedtime",      benefit:"Cools Pitta, nourishes shukra and rakta dhatu" },
      { name:"Brahmi Churna",          dose:"300mg or ½ tsp with jal",             benefit:"Cools the fiery mann (mind), reduces perfectionism" },
    ],
  },
  Kapha: {
    meal_timing: {
      "05:30": "Wake before sunrise. Jihva nirlekhana (tongue scraping). Garshana (dry brushing).",
      "06:00": "Vyayam — vigorous exercise for 30–45 min before any food.",
      "07:30": "Agni chai: adrak, lemon, shehad, kali mirch in warm jal.",
      "09:00": "Halka nashta ONLY if truly hungry. Skip if not.",
      "12:30": "Biggest meal: spiced dal + karela/methi sabzi + minimal ghee.",
      "16:30": "Trikatu kadha only. NO solid food until dinner.",
      "18:30": "Very light dinner — thin dal soup or steamed saag with roti.",
    },
    spice_blends: [
      { name:"Kapha Churna",  recipe:"Sonth, kali mirch, trikatu, jeera, haldi, sarson (2:1:1:1:1:½)", use:"Add generously to all cooked sabzi and dal." },
      { name:"Trikatu Honey", recipe:"Equal sonth, kali mirch, pippali mixed with kachcha shehad",      use:"¼ tsp with shehad 15 min before meals to kindle Manda Agni." },
      { name:"Agni Kadha",    recipe:"Adrak, haldi, kali mirch, nimbu, shehad in warm jal",            use:"Drink every morning on empty stomach — Kapha's best medicine." },
    ],
    eating_rules: [
      "Sirf tab khao jab sachchi bhookh ho (eat only when truly hungry)",
      "Never overeat — stop at 50–75% full (ardhapoornam bhojanam)",
      "Make dopahar ka bhojan the biggest; raat ka khana very small",
      "Nashta chhodna theek hai (skip breakfast) — 16-hour fast is beneficial",
      "Khane ke beech mein kuch mat khao — no snacking for 4–5 hours",
      "Hamesha garam masale daalo — warming spices are Kapha's medicine",
      "Minimum tel use karo — no more than 1 tsp oil per meal",
    ],
    avoid: {
      tastes:  ["Madhura (sweet) in excess", "Amla (sour) in excess", "Lavana (salty) in excess"],
      foods:   ["Dairy products", "Maida (refined flour)", "Fried snacks", "Kela (banana)", "Cheeni (sugar)"],
      drinks:  ["Thanda paani (cold water)", "Meethi chai (sweet drinks)", "Alcohol"],
      habits:  ["Din mein sona (daytime sleeping)", "Bina bhookh ke khaana", "Vyayam chhodna (skipping exercise)"],
    },
    supplements: [
      { name:"Trikatu Churna",  dose:"¼ tsp with shehad, 15 min before meals",   benefit:"Kindles Manda Agni, clears Ama and congestion" },
      { name:"Guggulu Tablet",  dose:"1 tablet twice daily with warm jal",         benefit:"Stimulates metabolism, reduces Kapha sanchaya" },
      { name:"Punarnava Churna",dose:"½ tsp powder with warm jal",                 benefit:"Reduces jal sanchaya (water retention), supports kidneys" },
    ],
  },
};

const GOAL_HERBS = {
  Vata: {
    Balance: [
      { name:"Dashamoola", dose:"As directed by practitioner, usually as warm decoction", benefit:"Traditionally used to ground Vata and support comfortable movement" },
      { name:"Bala", dose:"Warm milk or decoction preparation as advised", benefit:"Supports strength, steadiness, and Vata nourishment" },
    ],
    Detox: [
      { name:"Triphala", dose:"½ tsp with warm water before bed", benefit:"Gentle Vata-friendly elimination without harsh cleansing" },
      { name:"Ajwain", dose:"Pinch in warm water after meals", benefit:"Supports gas, bloating, and irregular Vata digestion" },
    ],
    Energy: [
      { name:"Ashwagandha", dose:"500mg with warm milk at bedtime", benefit:"Builds Ojas, stamina, and nervous-system steadiness for Vata" },
      { name:"Shatavari", dose:"1 tsp with warm milk or plant milk", benefit:"Nourishes depleted tissues and supports sustainable energy" },
    ],
    Weight: [
      { name:"Triphala", dose:"½ tsp with warm water before bed", benefit:"Supports regular elimination while keeping Vata from drying out" },
      { name:"Jeera-Ajwain-Saunf", dose:"1 tsp boiled in 2 cups water", benefit:"Kindles digestion gently without overstimulating Vata" },
    ],
    Immunity: [
      { name:"Chyawanprash", dose:"1 tsp in the morning with warm milk", benefit:"Ojas-building rasayana suited to dry, depleted Vata" },
      { name:"Guduchi", dose:"As tea or tablet as advised", benefit:"Supports resilience while staying gentle on Vata" },
    ],
  },
  Pitta: {
    Balance: [
      { name:"Amalaki", dose:"1 tsp with room-temp water in the morning", benefit:"Cooling rasayana for Pitta heat and sharp digestion" },
      { name:"Brahmi", dose:"300mg or ½ tsp with water", benefit:"Cools the mind and supports calm focus for Pitta" },
    ],
    Detox: [
      { name:"Guduchi", dose:"As tea or tablet as advised", benefit:"Traditionally used for gentle Pitta detox and heat balance" },
      { name:"Neem", dose:"Small practitioner-guided dose only", benefit:"Bitter, cooling support when Pitta needs cleansing" },
    ],
    Energy: [
      { name:"Shatavari", dose:"1 tsp in warm milk at bedtime", benefit:"Restores Pitta without adding heat" },
      { name:"Amalaki", dose:"1 tsp with room-temp water", benefit:"Supports vitality with a cooling, antioxidant profile" },
    ],
    Weight: [
      { name:"Triphala", dose:"½ tsp with room-temp or lukewarm water", benefit:"Supports elimination without heating Pitta" },
      { name:"Dhaniya-Saunf Tea", dose:"1 tsp seeds steeped after meals", benefit:"Cools cravings, acidity, and sharp appetite" },
    ],
    Immunity: [
      { name:"Guduchi", dose:"As tea or tablet as advised", benefit:"Cooling immune support for heat-prone Pitta" },
      { name:"Amla", dose:"Fresh amla or 1 tsp churna", benefit:"Builds resilience while pacifying Pitta" },
    ],
  },
  Kapha: {
    Balance: [
      { name:"Trikatu", dose:"¼ tsp with honey before meals", benefit:"Kindles slow Kapha Agni and clears heaviness" },
      { name:"Punarnava", dose:"½ tsp with warm water", benefit:"Supports fluid balance and lightness" },
    ],
    Detox: [
      { name:"Trikatu", dose:"¼ tsp with honey before meals", benefit:"Stimulates Manda Agni and helps clear Ama" },
      { name:"Neem", dose:"Small practitioner-guided dose only", benefit:"Bitter cleansing support for Kapha accumulation" },
    ],
    Energy: [
      { name:"Tulsi", dose:"Tea 1-2 times daily", benefit:"Light, warming support for Kapha energy and clarity" },
      { name:"Pippali", dose:"Small dose with honey as advised", benefit:"Traditionally used to awaken sluggish Kapha metabolism" },
    ],
    Weight: [
      { name:"Guggulu", dose:"1 tablet twice daily with warm water as advised", benefit:"Supports Kapha metabolism and healthy weight management" },
      { name:"Trikatu", dose:"¼ tsp with honey before meals", benefit:"Improves digestive fire and reduces heaviness" },
    ],
    Immunity: [
      { name:"Tulsi", dose:"Warm tea daily", benefit:"Supports respiratory resilience, especially for Kapha congestion" },
      { name:"Guduchi", dose:"As tea or tablet as advised", benefit:"Immune support without heaviness" },
    ],
  },
};

const getHerbalSupport = (dosha, goal) => {
  const base = LOCAL_WISDOM[dosha]?.supplements || [];
  const goalHerbs = GOAL_HERBS[dosha]?.[goal] || GOAL_HERBS[dosha]?.Balance || [];
  const seen = new Set();

  return [...goalHerbs, ...base].filter((herb) => {
    const key = herb.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
};

/* ─── Indian fallback dishes per dosha / lifestyle ──────────────────────── */
const FALLBACK = {
  Vegetarian: {
    Vata: {
      breakfast:   [
        { name:"Moong Dal Chilla with Ghee",          description:"Thin moong dal crepes spiced with jeera, adrak, and green chilli, served hot with a generous ladle of ghee and green chutney", energy:"Moderate" },
        { name:"Rava Upma with Ghee & Cashews",       description:"Semolina tempered with mustard seeds, curry patta, adrak, and green chilli, topped with ghee and roasted kaju — warm and grounding", energy:"Moderate" },
      ],
      mid_morning: [
        { name:"CCF Kadha (Jeera-Dhaniya-Saunf Tea)", description:"Equal parts jeera, dhaniya, saunf boiled in water for 5 min — Vata's best digestive tonic between meals", energy:"Light" },
        { name:"Warm Haldi Doodh with Ashwagandha",   description:"Full-fat doodh simmered with haldi, ashwagandha churna, shehad, and a pinch of jaiphal — builds Ojas", energy:"Light" },
      ],
      lunch:       [
        { name:"Toor Dal Tadka + Phulka + Aloo Sabzi", description:"Toor dal simmered with haldi and tempered with ghee, jeera, and hing, served with soft phulkas smeared with ghee and aloo-jeera sabzi", energy:"Nourishing" },
        { name:"Moong Dal Khichdi with Ghee + Papad",  description:"Moong dal and basmati slow-cooked with haldi, ginger, and ghee — tridoshic, easy-to-digest Vata classic with fried papad", energy:"Nourishing" },
      ],
      evening:     [
        { name:"Adrak-Elaichi Chai with Dates",        description:"Freshly brewed doodh-wali chai with adrak, elaichi, and a pinch of dalchini — served with 2 medjool dates or a small piece of jaggery", energy:"Light" },
      ],
      dinner:      [
        { name:"Lauki Moong Dal Soup with Roti",        description:"Tender lauki cooked in thin moong dal with jeera tadka and fresh coriander — light and easy on Vata digestion, with 1 soft roti", energy:"Light" },
        { name:"Bajra Khichdi with Ghee",               description:"Pearl millet cooked with mung dal, ghee, and warming spices — a classic Rajasthani winter khichdi that deeply grounds Vata", energy:"Moderate" },
      ],
      daily_wisdom:"Niyamit bhojan — eating at the same time every day — is the single most powerful medicine for Vata.",
      agni_tip:"Chew a small piece of fresh adrak with saindhav namak 10 minutes before meals to kindle Vishama Agni.",
    },
    Pitta: {
      breakfast:   [
        { name:"Nariyal Poha with Coriander",           description:"Flattened rice tempered with mustard seeds, curry patta, and coconut, finished with fresh coriander and a squeeze of nimbu — cooling morning dish", energy:"Light" },
        { name:"Rawa Idli with Coconut Chutney",        description:"Fluffy semolina idlis served with a cooling fresh-coconut and dhaniya chutney — South Indian, mild, and Pitta-pacifying", energy:"Moderate" },
      ],
      mid_morning: [
        { name:"Gulkand Chaas (Rose Buttermilk)",       description:"Chilled-to-room-temp chaas blended with gulkand, roasted jeera, and a pinch of elaichi — deeply cooling for Pitta heat", energy:"Light" },
        { name:"Aam Panna (Raw Mango Drink)",            description:"Tangy-sweet raw mango sharbat with jeera, pudina, and black salt — summer Pitta cooler", energy:"Light" },
      ],
      lunch:       [
        { name:"Basmati Chawal + Moong Dal + Kheera Raita", description:"Fluffy basmati with ghee-tempered moong dal, cooling cucumber-dahi raita with roasted jeera, and steamed lauki sabzi", energy:"Nourishing" },
        { name:"Sambar + Steamed Rice + Coconut Chutney",    description:"Mild toor dal sambar with ash gourd, drumstick, and tamatar, served over steamed rice with fresh coconut chutney — South Indian thali", energy:"Nourishing" },
      ],
      evening:     [
        { name:"Dhaniya-Pudina Sharbat",                description:"Fresh coriander and mint leaves blended with mishri, jeera, and kala namak — the most cooling evening drink for Pitta", energy:"Light" },
      ],
      dinner:      [
        { name:"Zucchini Moong Dal Khichdi",            description:"Mild moong dal khichdi with turai or zucchini, seasoned with dhaniya powder and minimal spice — classic Pitta dinner", energy:"Light" },
        { name:"Palak Dal with Roti",                   description:"Masoor dal cooked with palak (spinach), tempered with ghee and hing, served with 1-2 thin phulkas — cooling and iron-rich", energy:"Light" },
      ],
      daily_wisdom:"Dopahar ka bhojan sabse bada hona chahiye — Pitta's Agni is sharpest at noon; give it your biggest meal then.",
      agni_tip:"Sip saunf-dhaniya kadha after meals to cool Tikshna Agni and prevent amlapitta (acid reflux).",
    },
    Kapha: {
      breakfast:   [
        { name:"Methi Thepla (Dry, No Oil)",            description:"Thin fenugreek-flour flatbreads made with methi, haldi, and kali mirch — dry-toasted on tawa, no ghee, typical Gujarati Kapha breakfast", energy:"Light" },
        { name:"Adrak-Kali Mirch Kadha",                description:"Strong ginger-black pepper decoction with shehad and nimbu — Kapha's morning Agni igniter before any food", energy:"Light" },
      ],
      mid_morning: [
        { name:"Trikatu Jal",                           description:"Warm water with ¼ tsp trikatu churna (sonth-mirch-pippali) — stimulates Manda Agni, no solid food", energy:"Light" },
      ],
      lunch:       [
        { name:"Masoor Dal + Bajra Roti + Karela Sabzi",description:"Spiced red lentil dal with trikatu, dry bajra bhakri (no ghee), and bitter gourd sabzi with mustard seeds — classic Kapha thali", energy:"Moderate" },
        { name:"Chola Dal Stir-Fry with Millet",        description:"Dry-sautéed sprouted black-eyed peas with mustard seeds, green chilli, curry patta over jowar — low-fat, high-fibre Kapha lunch", energy:"Moderate" },
      ],
      evening:     [
        { name:"Tulsi-Adrak Kadha",                     description:"Holy basil (tulsi) decoction with fresh adrak and kali mirch — decongestant, immunity-boosting, stimulating for Kapha", energy:"Light" },
      ],
      dinner:      [
        { name:"Thin Lauki-Moong Soup",                 description:"Very thin moong dal soup with lauki, adrak, and haldi — minimal mustard oil, no cream, highly spiced — classic Kapha raat ka khana", energy:"Light" },
        { name:"Steamed Methi + Thin Dal",              description:"Blanched methi bhaji (fenugreek leaves) with a small cup of thin moong soup, nimbu, and kali mirch — lightest possible dinner", energy:"Light" },
      ],
      daily_wisdom:"Kapha ke liye vyayam sabse badi dawai hai — vigorous exercise before breakfast is more powerful than any herb.",
      agni_tip:"Fresh adrak ka tukda with saindhav namak 15 minutes before lunch activates sluggish Manda Agni instantly.",
    },
  },
  Vegan: {
    Vata: {
      breakfast:   [
        { name:"Ragi Porridge with Coconut Milk",        description:"Finger millet (nachni) cooked with warm nariyal doodh, jaggery, elaichi, and coconut oil — no dairy, deeply nourishing for Vata", energy:"Moderate" },
        { name:"Sabudana Khichdi (Light Version)",       description:"Sago pearls tempered with jeera, kali mirch, green chilli, and groundnuts in minimal coconut oil — a grounding Vata breakfast", energy:"Moderate" },
      ],
      mid_morning: [
        { name:"CCF Kadha",                              description:"Jeera-dhaniya-saunf decoction — Vata's herbal digestive tonic, no dairy needed", energy:"Light" },
      ],
      lunch:       [
        { name:"Moong Dal Khichdi with Coconut Oil",     description:"Yellow moong dal and basmati with haldi, adrak, jeera tempered in coconut oil instead of ghee — vegan and tridoshic", energy:"Nourishing" },
        { name:"Aloo Methi Sabzi + Jowar Roti",          description:"Potato and fenugreek dry sabzi with jeera and mustard seeds, served with jowar bhakri — no dairy, warming for Vata", energy:"Nourishing" },
      ],
      evening:     [
        { name:"Adrak Nimbu Sharbat",                    description:"Warm ginger-lemon water with shehad and a pinch of saindhav — Vata's ideal afternoon tonic", energy:"Light" },
      ],
      dinner:      [
        { name:"Lauki Moong Soup",                       description:"Thin bottle gourd and moong dal soup tempered with jeera in coconut oil — light vegan Vata dinner", energy:"Light" },
        { name:"Pumpkin Sabzi + Roti",                   description:"Yellow kaddu sabzi cooked with adrak, jeera, and saunf in minimal coconut oil — warming and sweet for Vata", energy:"Light" },
      ],
      daily_wisdom:"Niyamit bhojan — eating at the same time daily — is the single most powerful medicine for Vata.",
      agni_tip:"Chew fresh adrak with saindhav namak before meals to kindle Vishama Agni.",
    },
    Pitta: {
      breakfast:   [
        { name:"Nariyal Poha",                           description:"Flattened rice tempered with mustard seeds, curry patta, fresh coconut, and dhaniya — no dairy, cooling Pitta breakfast", energy:"Light" },
        { name:"Oats with Coconut Milk",                 description:"Rolled oats simmered in coconut milk with saunf, dates, elaichi — vegan Pitta cooling porridge", energy:"Moderate" },
      ],
      mid_morning: [
        { name:"Nariyal Paani",                          description:"Room-temperature coconut water with fresh pomegranate seeds and pudina — best Pitta mid-morning drink", energy:"Light" },
      ],
      lunch:       [
        { name:"Basmati + Moong Dal + Kheera Salad",     description:"Fluffy basmati with coconut-oil-tempered moong dal, cooling kheera-dhaniya salad — vegan, Pitta-balancing thali", energy:"Nourishing" },
        { name:"Sambar + Steamed Rice",                  description:"Mild toor dal sambar with vegetables, served over steamed rice with coconut chutney — vegan South Indian", energy:"Nourishing" },
      ],
      evening:     [
        { name:"Dhaniya-Pudina Sharbat",                 description:"Fresh coriander-mint drink with mishri and kala namak — best cooling evening drink for Pitta", energy:"Light" },
      ],
      dinner:      [
        { name:"Moong Dal Khichdi",                      description:"Mild moong-basmati khichdi with lauki, dhaniya powder — no dairy, cooling Pitta dinner", energy:"Light" },
      ],
      daily_wisdom:"Dopahar ka bhojan sabse bada hona chahiye — give your biggest meal at noon when Pitta Agni peaks.",
      agni_tip:"Sip saunf-dhaniya kadha after meals to cool Tikshna Agni.",
    },
    Kapha: {
      breakfast:   [
        { name:"Seb (Apple) with Dalchini",              description:"Warm stewed apple with dalchini, kali mirch, and a drizzle of shehad — lightest possible Kapha breakfast", energy:"Light" },
        { name:"Adrak Kadha (No Food)",                  description:"Strong ginger decoction with shehad and nimbu — Kapha's morning Agni igniter before eating anything", energy:"Light" },
      ],
      mid_morning: [
        { name:"Trikatu Jal",                            description:"Warm water with ¼ tsp trikatu — stimulate digestion, no solid food needed", energy:"Light" },
      ],
      lunch:       [
        { name:"Masoor Dal + Bajra Bhakri + Karela Sabzi",description:"Spiced masoor with trikatu, dry bajra roti, and bitter gourd — no dairy/oil, Kapha's best vegan lunch", energy:"Moderate" },
        { name:"Chana Dal Stir-Fry over Jowar",          description:"Dry-sautéed sprouted chickpeas with mustard seeds, curry patta, green chilli over jowar base — high fibre, Kapha-reducing", energy:"Moderate" },
      ],
      evening:     [
        { name:"Tulsi-Adrak Kadha",                      description:"Holy basil and ginger decoction with kali mirch — decongestant and stimulating for Kapha", energy:"Light" },
      ],
      dinner:      [
        { name:"Thin Sabzi Broth",                       description:"Very thin broth of mooli, karela, adrak, and haldi — no oil, minimal salt — Kapha's lightest dinner", energy:"Light" },
      ],
      daily_wisdom:"Kapha ke liye vyayam hi dawai hai — vigorous morning exercise before food.",
      agni_tip:"Adrak with saindhav 15 minutes before lunch activates Manda Agni.",
    },
  },
  "Non-vegetarian": {
    Vata: {
      breakfast:   [
        { name:"Anda Bhurji with Roti",                  description:"2 eggs scrambled with ghee, jeera, adrak, palak, and haldi — served with 1 soft phulka; warm, protein-rich Vata breakfast", energy:"Moderate" },
        { name:"Murgi Ka Shorba",                        description:"Clear chicken bone broth slow-simmered with adrak, kali mirch, dalchini, and fresh dhaniya — deeply grounding for Vata", energy:"Moderate" },
      ],
      mid_morning: [
        { name:"Haldi Doodh with Ashwagandha",           description:"Warm full-fat doodh with haldi, ashwagandha churna, and jaiphal — builds Ojas and grounds Vata", energy:"Light" },
        { name:"Boiled Egg + Soaked Dates",              description:"1 soft-boiled egg with 2 medjool dates and CCF kadha — light Vata mid-morning nourishment", energy:"Light" },
      ],
      lunch:       [
        { name:"Rohu Machher Jhol with Rice",            description:"Classic Bengali rohu fish curry with haldi, adrak, jeera, and tomato — served with steamed basmati; warming fish curry for Vata", energy:"Nourishing" },
        { name:"Murgh Khichdi",                          description:"Shredded poached chicken stirred into moong dal and basmati khichdi with trikatu and ghee — comforting Vata one-pot meal", energy:"Nourishing" },
      ],
      evening:     [
        { name:"Haddee Ka Shorba (Bone Broth)",          description:"Thin chicken or mutton bone broth simmered with adrak, saindhav, and nimbu — warming Vata evening tonic", energy:"Light" },
      ],
      dinner:      [
        { name:"Machhi Ka Halka Shorba",                 description:"Delicate white fish (rohu or basa) simmered in jeera-dhaniya broth with lauki — light, easy-to-digest Vata dinner", energy:"Light" },
        { name:"Anda Dal (Egg Drop Moong)",              description:"Thin moong dal soup with a swirled poached egg, jeera tadka, and coriander — light and nourishing Vata dinner", energy:"Moderate" },
      ],
      daily_wisdom:"Niyamit bhojan — eating at the same time daily — is Vata's greatest medicine.",
      agni_tip:"Chew fresh adrak with saindhav namak before meals to kindle Vishama Agni.",
    },
    Pitta: {
      breakfast:   [
        { name:"Nariyal Anda Omelette",                  description:"2 eggs cooked in coconut oil with lauki, dhaniya patta, and mild spices only — cooling protein breakfast for Pitta", energy:"Moderate" },
        { name:"Poached Egg on Oats Porridge",           description:"Soft poached egg on barley or oats porridge with saunf, nariyal doodh, and fresh herbs — Pitta-cooling morning", energy:"Moderate" },
      ],
      mid_morning: [
        { name:"Nariyal Paani + Anaar",                  description:"Room-temperature coconut water with fresh pomegranate seeds and pudina leaves", energy:"Light" },
      ],
      lunch:       [
        { name:"Steamed Machhi with Basmati + Raita",    description:"Lightly steamed pomfret or tilapia with dhaniya-nimbu marinade, basmati rice, and cooling kheera-dahi raita", energy:"Nourishing" },
        { name:"Murgh Shorba with Basmati",              description:"Mild poached chicken in a cooling dhaniya-saunf broth with basmati and cucumber on the side — Pitta thali", energy:"Nourishing" },
      ],
      evening:     [
        { name:"Saunf-Pudina Kadha",                     description:"Cooling fennel seeds, pudina, and gulab petals steeped in hot water — best Pitta evening pacifier", energy:"Light" },
      ],
      dinner:      [
        { name:"Murgh Ka Halka Shorba",                  description:"Clear chicken broth with asparagus, lauki, and dhaniya — mild, cooling, and light for Pitta dinner", energy:"Light" },
        { name:"Anda Palak Curry",                       description:"Soft-boiled eggs in a mild palak gravy with coconut oil and cooling spices — classic Pitta egg dish", energy:"Light" },
      ],
      daily_wisdom:"Dopahar ka bhojan sabse bada — Pitta's Agni handles protein best at noon.",
      agni_tip:"Sip saunf kadha after meals to cool Tikshna Agni and prevent amlapitta.",
    },
    Kapha: {
      breakfast:   [
        { name:"Anda Bhurji with Karela (Dry)",          description:"3 egg whites scrambled with trikatu spice, mustard seeds, curry patta, and bitter gourd — dry, no butter, high-protein Kapha breakfast", energy:"Light" },
        { name:"Ubal Hua Anda + Agni Kadha",             description:"1 hard-boiled egg with kala namak and jeera alongside strong adrak-kali mirch-haldi kadha — Kapha's best protein start", energy:"Light" },
      ],
      mid_morning: [
        { name:"Trikatu Jal",                            description:"Warm water with ¼ tsp trikatu — stimulate Manda Agni, no solid food", energy:"Light" },
      ],
      lunch:       [
        { name:"Tandoori Murgh + Bajra Roti + Methi Sabzi",description:"Dry-spiced grilled chicken with trikatu marinade, served with bajra bhakri and sautéed methi leaves — ideal Kapha protein lunch", energy:"Moderate" },
        { name:"Masala Machhi + Barley",                 description:"Grilled mackerel or sardine with warming masala, barley grain, and roasted karela on the side — Kapha fat-burning fish meal", energy:"Moderate" },
      ],
      evening:     [
        { name:"Tulsi-Adrak Kadha",                      description:"Holy basil and ginger kadha with kali mirch — decongestant and stimulating for Kapha", energy:"Light" },
      ],
      dinner:      [
        { name:"Murgh Shorba (Clear)",                   description:"Light chicken broth with mooli, karela, adrak, and haldi — minimal oil, highly spiced — Kapha's lightest dinner", energy:"Light" },
        { name:"Anda Sabzi Soup",                        description:"Thin spiced vegetable soup with a swirled egg, mustard seeds, and methi leaves — light Kapha night meal", energy:"Light" },
      ],
      daily_wisdom:"Kapha ke liye vyayam sabse badi dawai hai — vigorous exercise before breakfast is essential.",
      agni_tip:"Fresh adrak with saindhav 15 minutes before lunch activates Manda Agni instantly.",
    },
  },
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function AyurvedicPlanner() {
  const [dosha,      setDosha]      = useState("Vata");
  const [goal,       setGoal]       = useState("Balance");
  const [lifestyle,  setLifestyle]  = useState("Vegetarian");
  const [season,     setSeason]     = useState(() => {
    const m = new Date().getMonth() + 1;
    if (m <= 2 || m === 12) return "Winter";
    if (m <= 5)  return "Spring";
    if (m <= 8)  return "Summer";
    return "Autumn";
  });
  const [plan,       setPlan]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [bloodFile,  setBloodFile]  = useState(null);
  const [manualBloodValues, setManualBloodValues] = useState({});
  const [activeTab,  setActiveTab]  = useState("meals");
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [aiPowered,  setAiPowered]  = useState(false);
  const containerRef = useRef(null);

  const theme = DOSHA[dosha];

  useEffect(() => {
    const user = getCurrentUser();
    const latestDosha = getLatestDosha();

    if (latestDosha?.dominant_dosha && DOSHA[latestDosha.dominant_dosha]) {
      setDosha(latestDosha.dominant_dosha);
    }

    if (!user?.id) return;

    fetch(apiUrl(`/user/${user.id}/dosha`))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.dominant_dosha && DOSHA[data.dominant_dosha]) {
          setDosha(data.dominant_dosha);
          localStorage.setItem("latestDosha", JSON.stringify(data));
        }
      })
      .catch((err) => console.warn("Could not load saved dosha:", err));
  }, []);

  // Clear plan when dosha changes so stale data never shows
  const handleDoshaChange = (d) => { setDosha(d); setPlan(null); setAiPowered(false); };

  /* ── Generate ────────────────────────────────────────────────── */
  /* ── Generate Plan ────────────────────────────────────────────────── */
const generatePlan = async () => {
  setLoading(true);
  setAiPowered(false);

  try {
    const user = getCurrentUser();
    const formData = new FormData();
    if (bloodFile) {
      formData.append("file", bloodFile);
    }
    formData.append("user_id", user?.id || "");
    formData.append("dosha", dosha);
    formData.append("goal", goal);
    formData.append("lifestyle", lifestyle);
    formData.append("season", season);
    const normalizedManualValues = Object.fromEntries(
      Object.entries(manualBloodValues || {})
        .map(([key, value]) => [key, (value ?? "").toString().trim()])
        .filter(([, value]) => value !== "")
    );
    if (Object.keys(normalizedManualValues).length > 0) {
      formData.append("manual_blood_values", JSON.stringify(normalizedManualValues));
    }

    const res = await fetch(apiUrl("/diet"), {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();   // ← Only ONE declaration

    const planDosha = data.dosha || dosha;
    if (planDosha !== dosha && DOSHA[planDosha]) {
      setDosha(planDosha);
    }

    setPlan({
      meals: normalizeMealPlan(data.meals, season),
      dosha: planDosha,
      goal,
      lifestyle,
      season,
      bloodValues: data.blood_values || {},
      abnormalities: data.abnormalities || [],
      ...LOCAL_WISDOM[planDosha],
      supplements: getHerbalSupport(planDosha, goal),
    });

    setAiPowered(data.source === "ai");

  } catch (err) {
    console.warn("AI generation failed, using local fallback:", err);

    // Fallback logic
    const fallbackDosha = (FALLBACK[lifestyle] || FALLBACK.Vegetarian)[dosha];
    const meals = JSON.parse(JSON.stringify(fallbackDosha));

    setPlan({
      meals: normalizeMealPlan(meals, season),
      dosha,
      goal,
      lifestyle,
      season,
      bloodValues: {},
      abnormalities: [],
      ...LOCAL_WISDOM[dosha],
      supplements: getHerbalSupport(dosha, goal),
    });
    setAiPowered(false);
  }

  setLoading(false);
  setActiveTab("meals");
  setActiveMeal("breakfast");
  containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
};

const handleManualBloodChange = (key, value) => {
  setManualBloodValues((prev) => ({
    ...prev,
    [key]: value,
  }));
};
  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .ap-root{min-height:100vh;background:#FDFAF6;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;}

        /* Nav */
        .ap-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:58px;background:rgba(253,250,246,0.96);backdrop-filter:blur(20px);border-bottom:1px solid #EDE0CF;box-shadow:0 1px 12px rgba(44,24,16,0.05);}
        .ap-brand{font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:#2C1608;display:flex;align-items:center;gap:10px;}
        .ap-logo{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;background:linear-gradient(135deg,#5C2E0A,#A0621A);}
        .ap-badge{font-size:10px;font-weight:600;letter-spacing:0.5px;padding:3px 9px;border-radius:99px;background:#E8F4E8;color:#2E7D32;border:1px solid #A5D6A7;}
        .ap-badge.fallback{background:#FFF8E1;color:#F57F17;border-color:#FFD54F;}

        /* Layout */
        .ap-layout{flex:1;display:flex;}

        /* Sidebar */
        .ap-sidebar{width:300px;flex-shrink:0;border-right:1px solid #EDE0CF;padding:1.5rem;overflow-y:auto;background:#FDFAF6;display:flex;flex-direction:column;gap:1.4rem;}
        .sidebar-label{font-size:10px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:#A08060;margin-bottom:0.6rem;display:block;}

        /* Dosha buttons */
        .dosha-grid{display:flex;flex-direction:column;gap:6px;}
        .dosha-btn{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;border:1.5px solid #EDE0CF;cursor:pointer;transition:all 0.18s;background:#FFF;text-align:left;}
        .dosha-btn:hover{transform:translateX(2px);border-color:#C4A882;}
        .dosha-btn.active{border-width:2px;}
        .dosha-sym{font-size:18px;width:28px;text-align:center;}
        .dosha-info{flex:1;}
        .dosha-name{font-size:13px;font-weight:600;color:#2C1608;}
        .dosha-el{font-size:11px;color:#907050;margin-top:1px;}
        .dosha-agni{font-size:10px;font-weight:600;padding:2px 7px;border-radius:99px;white-space:nowrap;}

        /* Pill grid */
        .pill-grid{display:flex;flex-wrap:wrap;gap:6px;}
        .pill-btn{padding:6px 12px;border-radius:99px;border:1.5px solid #EDE0CF;background:#FFF;font-size:12px;font-weight:500;color:#5A3A1A;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:5px;}
        .pill-btn:hover{border-color:#C4A882;background:#FBF5EC;}
        .pill-btn.active{border-width:2px;font-weight:600;}

        /* Generate button */
        .gen-btn{width:100%;padding:13px;border-radius:12px;border:none;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:0.1px;color:#FFF;}
        .gen-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08);}
        .gen-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
        .gen-btn.outline{background:transparent!important;border:1.5px solid;}
        .action-group{display:flex;flex-direction:column;gap:8px;}

        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);border-top-color:#FFF;animation:spin 0.7s linear infinite;flex-shrink:0;}

        /* Main */
        .ap-main{flex:1;overflow:auto;display:flex;flex-direction:column;}
        .ap-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem;color:#B09070;text-align:center;}
        .empty-icon{font-size:48px;margin-bottom:0.5rem;}
        .empty-title{font-family:'Playfair Display',serif;font-size:22px;color:#3D2010;margin-bottom:0.3rem;}
        .empty-sub{font-size:14px;line-height:1.6;max-width:340px;}

        /* Hero */
        .ap-hero{padding:1.8rem 2rem 1.4rem;color:#FFF;position:relative;overflow:hidden;}
        .ap-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 80% 50%,rgba(255,255,255,0.08) 0%,transparent 60%);pointer-events:none;}
        .hero-sym{font-size:36px;margin-bottom:0.4rem;}
        .hero-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;line-height:1.2;margin-bottom:4px;}
        .hero-sub{font-size:13px;opacity:0.75;font-style:italic;}
        .hero-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:1rem;}
        .hero-tag{padding:4px 12px;border-radius:99px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);font-size:11px;font-weight:600;}
        .hero-agni{margin-top:1.1rem;padding:10px 14px;background:rgba(0,0,0,0.18);border-radius:10px;font-size:12px;opacity:0.9;line-height:1.6;}
        .hero-ai-note{margin-top:0.8rem;padding:8px 12px;background:rgba(255,255,255,0.12);border-radius:8px;font-size:11.5px;border:1px solid rgba(255,255,255,0.2);display:flex;gap:6px;align-items:center;}

        /* Info bars */
        .info-bar{margin:0.8rem 2rem 0;padding:10px 14px;border-radius:10px;font-size:12.5px;display:flex;gap:8px;line-height:1.6;}
        .seasonal{background:rgba(212,168,67,0.1);border:1px solid rgba(212,168,67,0.3);color:#7A5A10;}
        .wisdom-bar{border:1px solid;}
        .result-wrap{margin:0.8rem 2rem 0;padding:12px 14px;background:#F7F4EE;border:1px solid #E7DCCB;border-radius:12px;color:#5A3A1A;}
        .result-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#3D2010;margin-bottom:6px;}
        .result-sub{font-size:12px;line-height:1.6;color:#7A5A3A;margin-bottom:8px;}
        .result-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;}
        .result-chip{font-size:11.5px;background:#FFF;border:1px solid #EDE0CF;border-radius:8px;padding:6px 8px;}
        .result-chip.normal{border-color:#A5D6A7;background:#F1FAF3;}
        .result-chip.high,.result-chip.low{border-color:#EF9A9A;background:#FFF3F3;}
        .result-chip.neutral{border-color:#EDE0CF;background:#FFF;}
        .result-chip-range{font-size:10.5px;color:#8A6A4A;margin-top:2px;}
        .result-alerts{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .result-alert{font-size:11px;font-weight:600;padding:4px 9px;border-radius:99px;background:#FDE8E8;color:#B71C1C;border:1px solid #EF9A9A;}
        .result-alert.ok{background:#E8F5E9;color:#2E7D32;border-color:#A5D6A7;}
        .result-advice{margin-top:10px;padding-top:8px;border-top:1px dashed #E2D6C5;display:flex;flex-direction:column;gap:6px;}
        .result-advice-item{font-size:11.5px;color:#5A3A1A;line-height:1.5;background:#FFF;border:1px solid #EDE0CF;border-radius:8px;padding:7px 9px;}

        /* Tabs */
        .ap-tabs{border-bottom:1px solid #EDE0CF;display:flex;overflow-x:auto;scrollbar-width:none;padding:0 1.5rem;gap:2px;flex-shrink:0;margin-top:0.8rem;}
        .ap-tabs::-webkit-scrollbar{display:none;}
        .ap-tab{padding:0.85rem 12px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:600;color:#B09070;cursor:pointer;border-bottom:2.5px solid transparent;white-space:nowrap;transition:color 0.15s,border-bottom-color 0.15s;display:flex;align-items:center;gap:5px;}
        .ap-tab:hover{color:#6B4A2A;}

        /* Tab body */
        .ap-body{padding:1.5rem 2rem 3rem;flex:1;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .tab-anim{animation:fadeUp 0.28s ease;}

        /* Meal sub-tabs */
        .meal-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.3rem;}
        .meal-tab{display:flex;align-items:center;gap:6px;padding:7px 14px;border:1.5px solid #EDE0CF;border-radius:99px;background:#FDFAF6;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#8B6A4A;transition:all 0.15s;}
        .meal-tab:hover{border-color:#C4A882;background:#F5EFE6;}
        .meal-tab.active{border-width:2px;font-weight:700;}
        .meal-time{font-size:11.5px;color:#A08060;margin-bottom:1rem;display:flex;align-items:center;gap:6px;}
        .time-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

        /* Meal cards */
        .meal-cards{display:flex;flex-direction:column;gap:10px;}
        .meal-card{padding:14px 16px;background:#FFF;border:1px solid #EDE0CF;border-radius:14px;transition:all 0.18s;display:flex;gap:12px;align-items:flex-start;}
        .meal-card:hover{border-color:#C4A882;transform:translateX(3px);box-shadow:0 2px 12px rgba(92,46,10,0.07);}
        .meal-card-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;background:#FBF5EC;}
        .meal-card-body{flex:1;}
        .meal-card-name{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:#2C1608;margin-bottom:4px;}
        .meal-card-desc{font-size:12.5px;color:#7A5040;line-height:1.6;}
        .meal-card-energy{padding:3px 10px;border-radius:99px;font-size:10.5px;font-weight:700;letter-spacing:0.3px;margin-top:7px;display:inline-block;}

        /* Section title */
        .sec-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:#2C1608;margin-bottom:1rem;padding-bottom:0.6rem;border-bottom:1px solid #EDE0CF;}

        /* Timing */
        .timing-list{display:flex;flex-direction:column;gap:0;position:relative;}
        .timing-list::before{content:'';position:absolute;left:54px;top:24px;bottom:24px;width:1px;background:linear-gradient(180deg,transparent,#E8D0B8 10%,#E8D0B8 90%,transparent);}
        .timing-row{display:flex;align-items:flex-start;gap:14px;padding:12px 0;position:relative;}
        .timing-t{width:52px;flex-shrink:0;font-size:11px;font-weight:700;color:#A07030;text-align:right;padding-top:3px;font-variant-numeric:tabular-nums;}
        .timing-dot-wrap{width:18px;flex-shrink:0;display:flex;align-items:flex-start;justify-content:center;padding-top:7px;position:relative;z-index:1;}
        .timing-dot{width:8px;height:8px;border-radius:50%;}
        .timing-text{font-size:13px;color:#4A2A10;line-height:1.5;}

        /* Spice, rules, avoid, supplements */
        .spice-grid{display:flex;flex-direction:column;gap:10px;}
        .spice-card{padding:14px 16px;background:#FFF;border:1px solid #EDE0CF;border-radius:14px;border-left:4px solid;}
        .spice-name{font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:#2C1608;margin-bottom:5px;}
        .spice-recipe{font-size:12px;color:#5A3A1A;margin-bottom:5px;line-height:1.55;}
        .spice-use{font-size:11.5px;color:#9A7050;font-style:italic;padding:6px 10px;background:#FBF5EC;border-radius:8px;}

        .rules-list{display:flex;flex-direction:column;gap:8px;}
        .rule-item{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;background:#FFF;border:1px solid #EDE0CF;border-radius:12px;font-size:13px;color:#3D2010;line-height:1.55;}
        .rule-num{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;color:#FFF;margin-top:2px;}

        .avoid-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}
        .avoid-panel{padding:12px 14px;background:#FFF;border:1px solid #EDE0CF;border-radius:12px;}
        .avoid-panel-title{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:#C0392B;margin-bottom:8px;}
        .avoid-item{font-size:12px;color:#4A2A10;padding:3px 0;border-bottom:1px solid #F5EBE0;line-height:1.4;}
        .avoid-item:last-child{border:none;}

        .supp-list{display:flex;flex-direction:column;gap:10px;}
        .supp-card{display:flex;align-items:flex-start;gap:12px;padding:14px 16px;background:#FFF;border:1px solid #EDE0CF;border-radius:14px;border-left:3px solid;}
        .supp-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
        .supp-name{font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:#2C1608;margin-bottom:3px;}
        .supp-dose{font-size:12px;color:#5A3A1A;margin-bottom:3px;}
        .supp-benefit{font-size:12px;color:#9A7050;font-style:italic;}

        /* Loading */
        .ap-loading{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;color:#8B6A4A;}
        .loading-ring{width:48px;height:48px;border-radius:50%;border:3px solid #EDE0CF;animation:spin 0.8s linear infinite;flex-shrink:0;}
        .loading-text{font-family:'Playfair Display',serif;font-size:16px;color:#3D2010;font-style:italic;}
        .loading-sub{font-size:12px;color:#B09070;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .loading-dots span{display:inline-block;animation:pulse 1.4s ease infinite;}
        .loading-dots span:nth-child(2){animation-delay:0.2s;}
        .loading-dots span:nth-child(3){animation-delay:0.4s;}

        @media(max-width:768px){
          .ap-sidebar{width:100%;border-right:none;border-bottom:1px solid #EDE0CF;}
          .ap-layout{flex-direction:column;}
          .avoid-grid{grid-template-columns:1fr 1fr;}
          .ap-body{padding:1.2rem 1rem 2rem;}
        }
      `}</style>

      <div className="ap-root">

        {/* ── Navbar ── */}
        <nav className="ap-nav">
          <div className="ap-brand">
            <div className="ap-logo">🪷</div>
            <span>Āyur Āhāra</span>
            <span style={{fontSize:12,color:"#A08060",fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:400}}>
              — The Art of Mindful Eating
            </span>
          </div>
          {plan && (
            <div className={`ap-badge${aiPowered ? "" : " fallback"}`}>
              {aiPowered ? "✦ AI Generated" : "⚡ Local Plan"}
            </div>
          )}
        </nav>

        <div className="ap-layout">

          {/* ── Sidebar ── */}
          <aside className="ap-sidebar">

            {/* Dosha */}
            <div>
              <span className="sidebar-label">Your Dosha (Prakriti)</span>
              <div className="dosha-grid">
                {Object.entries(DOSHA).map(([d, t]) => (
                  <button key={d}
                    className={`dosha-btn${dosha === d ? " active" : ""}`}
                    style={dosha === d ? { borderColor: t.color, background: t.bg } : {}}
                    onClick={() => handleDoshaChange(d)}
                  >
                    <span className="dosha-sym">{t.sym}</span>
                    <div className="dosha-info">
                      <div className="dosha-name" style={{ color: dosha === d ? t.text : "#2C1608" }}>{d}</div>
                      <div className="dosha-el">{t.el}</div>
                    </div>
                    {dosha === d && (
                      <span className="dosha-agni" style={{ color: t.text, background: `${t.color}22` }}>{t.agni}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <span className="sidebar-label">Goal (Lakshya)</span>
              <div className="pill-grid">
                {GOALS.map(g => (
                  <button key={g.id}
                    className={`pill-btn${goal === g.id ? " active" : ""}`}
                    style={goal === g.id ? { borderColor: theme.color, color: theme.text, background: theme.bg } : {}}
                    onClick={() => setGoal(g.id)} title={g.desc}
                  >
                    <span style={{fontSize:13}}>{g.icon}</span> {g.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <span className="sidebar-label">Lifestyle (Āhāra)</span>
              <div className="pill-grid">
                {LIFESTYLES.map(l => (
                  <button key={l.id}
                    className={`pill-btn${lifestyle === l.id ? " active" : ""}`}
                    style={lifestyle === l.id ? { borderColor: theme.color, color: theme.text, background: theme.bg } : {}}
                    onClick={() => setLifestyle(l.id)} title={l.sub}
                  >
                    <span style={{fontSize:13}}>{l.icon}</span> {l.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div>
              <span className="sidebar-label">Season (Ritu)</span>
              <div className="pill-grid">
                {SEASONS.map(s => (
                  <button key={s.id}
                    className={`pill-btn${season === s.id ? " active" : ""}`}
                    style={season === s.id ? { borderColor: theme.color, color: theme.text, background: theme.bg } : {}}
                    onClick={() => setSeason(s.id)}
                  >
                    <span style={{fontSize:13}}>{s.icon}</span> {s.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="action-group">
              <span className="sidebar-label" style={{ marginBottom: 0 }}>Blood Report Integration (optional)</span>
              <div style={{fontSize:11.5,color:"#8B6A4A",lineHeight:1.5}}>
                Upload PDF or enter key values manually.
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setBloodFile(e.target.files?.[0] || null)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #EDE0CF",
                  background: "#FFF",
                  fontSize: "12px",
                  color: "#5A3A1A",
                }}
              />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                {MANUAL_BLOOD_FIELDS.map((field) => (
                  <input
                    key={field.key}
                    type="number"
                    step="any"
                    placeholder={field.label}
                    value={manualBloodValues[field.key] || ""}
                    onChange={(e) => handleManualBloodChange(field.key, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 9px",
                      borderRadius: "9px",
                      border: "1px solid #EDE0CF",
                      background: "#FFF",
                      fontSize: "11px",
                      color: "#5A3A1A",
                    }}
                  />
                ))}
              </div>
              <button className="gen-btn" style={{ background: theme.gradient }} onClick={generatePlan} disabled={loading}>
                {loading ? <><div className="spinner" /> Crafting…</> : <><span style={{fontSize:16}}>✦</span> Generate My Plan</>}
              </button>
              {plan && !loading && (
                <button className="gen-btn outline" style={{ borderColor: theme.color, color: theme.color }} onClick={generatePlan}>
                  <span style={{fontSize:14}}>⟳</span> New Variation
                </button>
              )}
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="ap-main" ref={containerRef}>

            {loading && (
              <div className="ap-loading">
                <div className="loading-ring" style={{ borderTopColor: theme.color }} />
                <div className="loading-text">Consulting the ancient texts…</div>
                <div className="loading-sub">
                  <span className="loading-dots"><span>•</span><span>•</span><span>•</span></span>
                </div>
              </div>
            )}

            {!loading && !plan && (
              <div className="ap-empty">
                <div className="empty-icon">🪷</div>
                <div className="empty-title">Your Personalised Āhāra Awaits</div>
                <p className="empty-sub">Select your Dosha, goal, lifestyle & season, then let Ayurvedic wisdom craft an authentic Indian meal plan for you.</p>
                <p style={{fontSize:12,color:"#C4A882",marginTop:8,fontStyle:"italic"}}>"Āhāra (food) is the root of all strength, health, and longevity." — Charaka Samhita</p>
              </div>
            )}

            {!loading && plan && (
              <>
                {/* Hero */}
                <div className="ap-hero" style={{ background: theme.gradient }}>
                  <div className="hero-sym">{theme.sym}</div>
                  <div className="hero-title">{plan.dosha} Dosha — Indian Meal Plan</div>
                  <div className="hero-sub">{theme.el} · {theme.agni}</div>
                  <div className="hero-tags">
                    <span className="hero-tag">🎯 {plan.goal}</span>
                    <span className="hero-tag">{LIFESTYLES.find(l => l.id === plan.lifestyle)?.icon} {plan.lifestyle}</span>
                    <span className="hero-tag">{SEASONS.find(s => s.id === plan.season)?.icon} {plan.season}</span>
                    <span className="hero-tag">🇮🇳 Authentic Indian</span>
                  </div>
                  {plan.meals?.agni_tip && (
                    <div className="hero-agni"><strong>Agni Tip:</strong> {plan.meals.agni_tip}</div>
                  )}
                  {aiPowered && (
                    <div className="hero-ai-note"><span>✦</span> Uniquely generated by AI — every plan is different</div>
                  )}
                </div>

                {/* Wisdom bar */}
                {plan.meals?.daily_wisdom && (
                  <div className={`info-bar wisdom-bar`} style={{ background: theme.bg, borderColor: `${theme.color}30` }}>
                    <span style={{fontSize:14,flexShrink:0}}>💡</span>
                    <span style={{fontSize:12.5,color:theme.text,fontStyle:"italic"}}>{plan.meals.daily_wisdom}</span>
                  </div>
                )}

                {plan.meals?.seasonal_highlight && (
                  <div className="info-bar seasonal">
                    <span style={{fontSize:14,flexShrink:0}}>{SEASONAL_CONTEXT[plan.season]?.icon || "🍃"}</span>
                    <span style={{fontSize:12.5}}>
                      <strong>{plan.season} Ritu:</strong> {plan.meals.seasonal_highlight}
                    </span>
                  </div>
                )}

                <div className="result-wrap">
                  <div className="result-title">Result & Diet Logic</div>
                  <div className="result-sub">
                    This plan is personalized using your {plan.dosha} dosha, {plan.goal.toLowerCase()} goal, {plan.lifestyle.toLowerCase()} lifestyle, season, and uploaded blood report values.
                  </div>

                  {Object.keys(plan.bloodValues || {}).length > 0 ? (
                    <>
                      <div className="result-grid">
                        {Object.entries(plan.bloodValues || {}).map(([key, value]) => {
                          const markerMeta = BLOOD_MARKER_META[key] || {
                            label: key.replace(/_/g, " ").toUpperCase(),
                            unit: "",
                            normal: "N/A",
                          };
                          const status = getMarkerStatus(key, value);
                          return (
                          <div key={key} className={`result-chip ${status}`}>
                            <strong>{markerMeta.label}:</strong>{" "}
                            {value != null ? `${value}${markerMeta.unit ? ` ${markerMeta.unit}` : ""}` : "Not found"}
                            <div className="result-chip-range">Normal: {markerMeta.normal}</div>
                          </div>
                          );
                        })}
                      </div>
                      <div className="result-alerts">
                        {(plan.abnormalities || []).length > 0 ? (
                          (plan.abnormalities || []).map((item, idx) => (
                            <span key={idx} className="result-alert">⚠ {item}</span>
                          ))
                        ) : (
                          <span className="result-alert ok">✓ No major abnormality detected in parsed values</span>
                        )}
                      </div>
                      {(plan.abnormalities || []).length > 0 && (
                        <div className="result-advice">
                          {(plan.abnormalities || []).map((item, idx) => (
                            <div key={`${item}-${idx}`} className="result-advice-item">
                              <strong>{item}:</strong>{" "}
                              {ABNORMALITY_ADVICE[item] || "Diet is adjusted to reduce risk while staying aligned with your dosha and goal."}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="result-sub" style={{ marginBottom: 0 }}>
                      No blood report values parsed yet. Upload a PDF to include medical markers in your diet advice.
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="ap-tabs">
                  {TABS.map(t => (
                    <button key={t.id}
                      className="ap-tab"
                      style={activeTab === t.id ? { color: theme.text, borderBottomColor: theme.color } : {}}
                      onClick={() => setActiveTab(t.id)}
                    >
                      <span style={{fontSize:13}}>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>

                <div className="ap-body tab-anim" key={`${activeTab}-${plan.dosha}-${plan.goal}`}>

                  {/* MEALS */}
                  {activeTab === "meals" && (
                    <>
                      <div className="meal-tabs">
                        {Object.entries(MEAL_META).map(([k, m]) => (
                          <button key={k}
                            className={`meal-tab${activeMeal === k ? " active" : ""}`}
                            style={activeMeal === k ? { borderColor: theme.color, color: theme.text, background: theme.bg } : {}}
                            onClick={() => setActiveMeal(k)}
                          >
                            <span style={{fontSize:14}}>{m.icon}</span> {m.label}
                          </button>
                        ))}
                      </div>
                      <div className="meal-time">
                        <div className="time-dot" style={{ background: theme.color }} />
                        <span>{MEAL_META[activeMeal].time}</span>
                      </div>
                      <div className="meal-cards">
                        {(plan.meals?.[activeMeal] || []).length > 0
                          ? (plan.meals[activeMeal] || []).map((item, i) => {
                              const ec = ENERGY_COLORS[item.energy] || ENERGY_COLORS.Moderate;
                              return (
                                <div key={i} className="meal-card">
                                  <div className="meal-card-icon" style={{ background: theme.bg }}>{MEAL_META[activeMeal].icon}</div>
                                  <div className="meal-card-body">
                                    <div className="meal-card-name">{item.name}</div>
                                    <div className="meal-card-desc">{item.description}</div>
                                    <span className="meal-card-energy" style={{ background: ec.bg, color: ec.text, border: `1px solid ${ec.border}` }}>
                                      {item.energy}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          : <div style={{color:"#B09070",fontSize:13,fontStyle:"italic",padding:"1rem 0"}}>No items for this slot — try a different meal tab.</div>
                        }
                      </div>
                    </>
                  )}

                  {/* TIMING */}
                  {activeTab === "timing" && plan.meal_timing && (
                    <>
                      <div className="sec-title">Daily Dinacharya Schedule</div>
                      <div className="timing-list">
                        {Object.entries(plan.meal_timing).map(([time, desc], i) => (
                          <div key={i} className="timing-row">
                            <div className="timing-t">{time}</div>
                            <div className="timing-dot-wrap">
                              <div className="timing-dot" style={{ background: theme.color, boxShadow: `0 0 0 2px ${theme.color}` }} />
                            </div>
                            <div className="timing-text">{desc}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* SPICES */}
                  {activeTab === "spices" && plan.spice_blends && (
                    <>
                      <div className="sec-title">Sacred Spice Blends (Churnas)</div>
                      <div className="spice-grid">
                        {plan.spice_blends.map((s, i) => (
                          <div key={i} className="spice-card" style={{ borderLeftColor: theme.color }}>
                            <div className="spice-name">🌶️ {s.name}</div>
                            <div className="spice-recipe"><strong>Recipe:</strong> {s.recipe}</div>
                            <div className="spice-use">💡 {s.use}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* EATING RULES */}
                  {activeTab === "wisdom" && plan.eating_rules && (
                    <>
                      <div className="sec-title">Āhāra Vidhi — Eating Rules</div>
                      <div className="rules-list">
                        {plan.eating_rules.map((r, i) => (
                          <div key={i} className="rule-item">
                            <div className="rule-num" style={{ background: theme.color }}>{i + 1}</div>
                            {r}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* AVOID */}
                  {activeTab === "avoid" && plan.avoid && (
                    <>
                      <div className="sec-title">Foods to Minimise</div>
                      <div className="avoid-grid">
                        {Object.entries(plan.avoid).filter(([, v]) => Array.isArray(v) && v.length > 0).map(([cat, items]) => (
                          <div key={cat} className="avoid-panel">
                            <div className="avoid-panel-title">{cat.replace(/_/g, " ")}</div>
                            {items.map((it, i) => <div key={i} className="avoid-item">⚠️ {it}</div>)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* HERBS */}
                  {activeTab === "supplements" && plan.supplements && (
                    <>
                      <div className="sec-title">Herbal Support for {plan.dosha} + {plan.goal}</div>
                      <div className="supp-list">
                        {plan.supplements.map((s, i) => (
                          <div key={i} className="supp-card" style={{ borderLeftColor: theme.color }}>
                            <div className="supp-icon" style={{ background: theme.bg }}>🌿</div>
                            <div>
                              <div className="supp-name">{s.name}</div>
                              <div className="supp-dose">📋 {s.dose}</div>
                              <div className="supp-benefit">{s.benefit}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}