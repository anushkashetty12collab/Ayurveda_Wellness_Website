/**
 * Mirrors dosha.py DOSHA_KNOWLEDGE fields used by Dosha.js (offline fallback only).
 * Keep in sync when updating backend knowledge strings.
 */
export const KNOWLEDGE_UI = {
  Vata: {
    tagline: "The Force of Movement & Creativity",
    description:
      "Vata governs all movement in the body and mind — from breath to thoughts.\n\n" +
      "You are naturally creative, enthusiastic, and quick-thinking.\n\n" +
      "When balanced, Vata types are vivacious, artistic, and spiritually inclined.\n\n" +
      "When out of balance, anxiety, dryness, and irregularity arise.",
    qualities: ["Light", "Dry", "Cold", "Subtle", "Mobile"],
    strengths: [
      "Quick to learn and adapt",
      "Naturally creative and expressive",
      "Enthusiastic and energetic in bursts",
      "Spiritually inclined and intuitive",
    ],
    imbalance_signs: [
      "Anxiety and worry",
      "Dry skin, hair, and nails",
      "Irregular digestion and bloating",
      "Insomnia and restless sleep",
      "Joint stiffness and crackling",
      "Cold hands and feet",
    ],
    diet: {
      favor: [
        "Warm, oily, and nourishing foods",
        "Sweet, sour, and salty tastes",
        "Ghee, sesame oil, olive oil",
        "Root vegetables (sweet potato, beet)",
        "Warm milk with honey and spices",
        "Soaked nuts (almonds, walnuts)",
        "Cooked grains (rice, oats, wheat)",
      ],
      avoid: [
        "Raw, cold, and dry foods",
        "Bitter, pungent, astringent tastes",
        "Crackers, dry cereals, popcorn",
        "Carbonated drinks and caffeine",
        "Excessive fasting or skipping meals",
      ],
    },
    herbs: [
      { name: "Ashwagandha", benefit: "Grounds Vata, reduces anxiety, builds strength" },
      { name: "Shatavari", benefit: "Nourishes tissues, calms nerves, hydrates" },
      { name: "Triphala", benefit: "Regulates irregular digestion gently" },
      { name: "Brahmi", benefit: "Calms the restless mind, improves focus" },
      { name: "Bala", benefit: "Strengthens muscles and nervous system" },
    ],
    lifestyle: [
      "Follow a consistent daily routine (Dinacharya)",
      "Abhyanga — daily warm sesame oil self-massage",
      "Sleep before 10 PM; avoid late nights",
      "Stay warm — avoid cold, wind, and drafts",
      "Practice slow, rhythmic breathing (Nadi Shodhana)",
      "Minimize screen time and multitasking",
    ],
    yoga: [
      "Slow Hatha yoga and Yin yoga",
      "Grounding poses: Tadasana, Balasana, Virasana",
      "Avoid fast-paced or very strenuous practice",
      "Finish with long Savasana (10+ minutes)",
    ],
    seasonal_tip:
      "Winter and early spring are Vata seasons — increase warmth, oil, and routine.",
    mantra: "I am grounded, stable, and at peace.",
  },
  Pitta: {
    tagline: "The Force of Transformation & Intelligence",
    description:
      "Pitta governs digestion, metabolism, and transformation — physical and mental.\n\n" +
      "You are naturally driven, sharp-minded, and goal-oriented.\n\n" +
      "When balanced, Pitta types excel as leaders, teachers, and visionaries.\n\n" +
      "When out of balance, inflammation, irritability, and perfectionism flare up.",
    qualities: ["Hot", "Sharp", "Light", "Liquid", "Oily"],
    strengths: [
      "Sharp intellect and analytical mind",
      "Natural leader and decision-maker",
      "Strong digestion and metabolism",
      "Focused, goal-driven, and courageous",
    ],
    imbalance_signs: [
      "Anger, irritability, and frustration",
      "Skin inflammation, rashes, acne",
      "Heartburn and acid reflux",
      "Excessive hunger or hypoglycemia",
      "Perfectionism and burnout",
      "Sensitivity to heat",
    ],
    diet: {
      favor: [
        "Cool, refreshing, and lightly oily foods",
        "Sweet, bitter, and astringent tastes",
        "Coconut water, cucumber, mint",
        "Leafy greens, broccoli, zucchini",
        "Sweet fruits (grapes, melons, pears)",
        "Basmati rice, barley, quinoa",
        "Ghee (cooling and healing to Pitta)",
      ],
      avoid: [
        "Hot, spicy, and fermented foods",
        "Sour and salty tastes in excess",
        "Chili, mustard, vinegar, pickles",
        "Alcohol and coffee",
        "Red meat and fried foods",
      ],
    },
    herbs: [
      { name: "Amalaki", benefit: "Cooling, anti-inflammatory, rich in Vitamin C" },
      { name: "Shatavari", benefit: "Cools excess heat, nourishes and calms" },
      { name: "Brahmi", benefit: "Cools the fiery mind, reduces stress" },
      { name: "Neem", benefit: "Purifies blood, clears skin inflammation" },
      { name: "Rose", benefit: "Cools emotions, supports heart health" },
    ],
    lifestyle: [
      "Avoid excessive competition and overworking",
      "Take moonlit walks and spend time in nature",
      "Practice cooling pranayama (Sheetali, Sheetkari)",
      "Avoid exercising in peak heat (noon sun)",
      "Incorporate rest and play — not just productivity",
      "Cool showers and coconut oil massage",
    ],
    yoga: [
      "Moderate, cooling yoga flows",
      "Moon salutations over sun salutations",
      "Chest-opening poses: Ustrasana, Matsyasana",
      "Forward folds to cool and calm the nervous system",
    ],
    seasonal_tip: "Summer is Pitta season — prioritize cooling, rest, and sweet foods.",
    mantra: "I lead with compassion and let go of control.",
  },
  Kapha: {
    tagline: "The Force of Structure & Endurance",
    description:
      "Kapha governs structure, lubrication, and stability in the body and mind.\n\n" +
      "You are naturally calm, compassionate, and enduring.\n\n" +
      "When balanced, Kapha types radiate strength, loyalty, and deep love.\n\n" +
      "When out of balance, heaviness, congestion, and inertia set in.",
    qualities: ["Heavy", "Slow", "Cool", "Oily", "Smooth"],
    strengths: [
      "Emotionally stable and deeply compassionate",
      "Excellent endurance and physical strength",
      "Reliable, patient, and loyal",
      "Long-term memory and methodical thinking",
    ],
    imbalance_signs: [
      "Weight gain and water retention",
      "Congestion, mucus, and sinus issues",
      "Lethargy, oversleeping, and sluggishness",
      "Emotional attachment and possessiveness",
      "Depression and low motivation",
      "Slow digestion and heaviness after meals",
    ],
    diet: {
      favor: [
        "Light, dry, warm, and spiced foods",
        "Pungent, bitter, and astringent tastes",
        "Ginger, black pepper, turmeric, cumin",
        "Legumes, leafy greens, and cruciferous vegetables",
        "Light fruits (apples, pears, berries)",
        "Barley, millet, buckwheat",
        "Raw honey (stimulating, not processed)",
      ],
      avoid: [
        "Heavy, oily, and cold foods",
        "Sweet, sour, and salty tastes in excess",
        "Dairy, cheese, and ice cream",
        "Wheat, white rice, and refined grains",
        "Sweets, pastries, and fried food",
      ],
    },
    herbs: [
      { name: "Trikatu", benefit: "Kindles digestive fire, clears congestion" },
      { name: "Guggulu", benefit: "Stimulates metabolism, reduces fat tissue" },
      { name: "Ginger", benefit: "Warming, stimulates digestion, clears mucus" },
      { name: "Punarnava", benefit: "Reduces water retention, supports kidneys" },
      { name: "Bibhitaki", benefit: "Clears respiratory congestion, rejuvenates" },
    ],
    lifestyle: [
      "Rise early (before 6 AM) — avoid excessive sleep",
      "Daily vigorous exercise — running, hiking, dancing",
      "Dry brushing (Garshana) to stimulate circulation",
      "Keep environment warm, dry, and stimulating",
      "Embrace change and new experiences",
      "Avoid daytime napping",
    ],
    yoga: [
      "Vigorous, dynamic, and heating yoga",
      "Sun salutations (Surya Namaskar) at a fast pace",
      "Inversions and backbends to energize",
      "Kapalbhati and Bhastrika pranayama",
    ],
    seasonal_tip: "Spring is Kapha season — move more, eat lighter, and welcome change.",
    mantra: "I embrace change with joy and vitality.",
  },
};
