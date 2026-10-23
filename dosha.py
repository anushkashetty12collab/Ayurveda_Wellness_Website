"""
dosha.py — Comprehensive Dosha Detection Engine (26-feature model)
===================================================================

Trained on 26 feature columns; default CSV is class-balanced `ayurvedic_dosha_dataset_balanced.csv`
(built from `ayurvedic_dosha_dataset (1).csv`). Columns include:
  - Body Frame, Hair Type/Color, Skin, Complexion, Body Weight, Nails
  - Teeth, Pace, Mental Activity, Memory, Sleep, Weather, Reaction
  - Mood, Eating Habit, Hunger, Body Temperature, Joints, Nature
  - Body Energy, Voice, Dreams, Social Relations, Body Odor

Scoring layers:
  1. Random Forest ML (60%) — trained on all 26 features
  2. Classical Ayurvedic trait weighting (40%) — extended to 26 traits
  3. Dual-dosha detection + rich result payload
"""

from pathlib import Path
import os

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import math

# Balanced 960×3 labels (undersampled); regenerate with balance_ayurvedic_dosha_csv.py
_DEFAULT_DOSHA_CSV = str(Path(__file__).resolve().parent / "ayurvedic_dosha_dataset_balanced.csv")

# Tunables — Pitta was over-dominant on typical “average” profiles (many traits peaked only on Pitta).
# Set DOSHA_PITTA_OUTPUT_SCALE=1.0 / DOSHA_ML_BLEND_MAX=0.65 to revert toward the old behaviour.
_PITTA_OUTPUT_SCALE = float(os.environ.get("DOSHA_PITTA_OUTPUT_SCALE", "0.55"))
_ML_BLEND_MAX = float(os.environ.get("DOSHA_ML_BLEND_MAX", "0.35"))  # classical gets the rest at 25/25 answers


# ─── Full feature encoding maps (new CSV) ─────────────────────────────────

FEATURE_MAPS = {
    "Body Frame": {
        "Thin and Lean": 0, "Medium": 1, "Well Built": 2,
    },
    "Type of Hair": {
        "Dry": 0, "Normal": 1, "Greasy": 2,
    },
    "Color of Hair": {
        "Grey": 0, "Brown": 1, "Black": 2,
    },
    "Skin": {
        "Dry,Rough": 0, "Soft,Sweating": 1, "Moist,Greasy": 2,
    },
    "Complexion": {
        "Dark": 0, "Pinkish": 1, "Glowing": 2,
    },
    "Body Weight": {
        "Underweight": 0, "Normal": 1, "Overweight": 2,
    },
    "Nails": {
        "Pinkish": 0, "Redish": 1, "Blackish": 2,
    },
    "Size and Color of the Teeth": {
        "Irregular,Blackish": 0, "Medium,Yellowish": 1, "Large,White": 2,
    },
    "Pace of Performing Work": {
        "Fast": 0, "Medium": 1, "Slow": 2,
    },
    "Mental Activity": {
        "Restless": 0, "Aggressive": 1, "Stable": 2,
    },
    "Memory": {
        "Short term": 0, "Good Memory": 1, "Long Term": 2,
    },
    "Sleep Pattern": {
        "Less": 0, "Moderate": 1, "Sleepy": 2,
    },
    "Weather Conditions": {
        "Dislike Cold": 0, "Dislike Heat": 1, "Dislike Moist": 2,
    },
    "Reaction under Adverse Situations": {
        "Anxiety": 0, "Anger": 1, "Calm": 2,
    },
    "Mood": {
        "Changes Quickly": 0, "Constant": 1, "Changes Slowly": 2,
    },
    "Eating Habit": {
        "Irregular Chewing": 0, "Improper Chewing": 1, "Proper Chewing": 2,
    },
    "Hunger": {
        "Skips Meal": 0, "Sudden and Sharp": 1, "Irregular": 2,
    },
    "Body Temperature": {
        "Less than Normal": 0, "Normal": 1, "More than Normal": 2,
    },
    "Joints": {
        "Healthy": 0, "Weak": 1, "Heavy": 2,
    },
    "Nature": {
        "Egoistic,Fearless": 0, "Jealous,Fearful": 1, "Forgiving,Grateful": 2,
    },
    "Body Energy": {
        "Low": 0, "Medium": 1, "High": 2,
    },
    "Quality of Voice": {
        "Fast": 0, "Deep": 1, "Rough": 2,
    },
    "Dreams": {
        "Fire": 0, "Sky": 1, "Water": 2,
    },
    "Social Relations": {
        "Introvert": 0, "Ambivert": 1, "Extrovert": 2,
    },
    "Body Odor": {
        "Strong": 0, "Mild": 1, "Negligible": 2,
    },
}

DOSHA_MAP    = {"Vata": 0, "Pitta": 1, "Kapha": 2}
REVERSE_MAP  = {0: "Vata", 1: "Pitta", 2: "Kapha"}
FEATURE_COLS = list(FEATURE_MAPS.keys())  # 25 feature columns

# ─── Frontend key → CSV column mapping ────────────────────────────────────
# Maps the short camelCase keys sent from Dosha.js → CSV column names

# One frontend key per FEATURE_COLS column (order matches questionnaire / Dosha.js).
FRONTEND_TO_CSV = {
    "body_type":    "Body Frame",
    "hair_type":    "Type of Hair",
    "hair_color":   "Color of Hair",
    "skin":         "Skin",
    "complexion":   "Complexion",
    "body_weight":  "Body Weight",
    "nails":        "Nails",
    "teeth":        "Size and Color of the Teeth",
    "pace":         "Pace of Performing Work",
    "mind":         "Mental Activity",
    "memory":       "Memory",
    "sleep":        "Sleep Pattern",
    "weather":      "Weather Conditions",
    "emotion":      "Reaction under Adverse Situations",
    "mood":         "Mood",
    "eating_habit": "Eating Habit",
    "hunger":       "Hunger",
    "body_temp":    "Body Temperature",
    "joints":       "Joints",
    "nature":       "Nature",
    "energy":       "Body Energy",
    "voice":        "Quality of Voice",
    "dreams":       "Dreams",
    "social":       "Social Relations",
    "body_odor":    "Body Odor",
}

# ─── Extended trait weights for ALL 25 features ───────────────────────────
# (vata_score, pitta_score, kapha_score)
TRAIT_WEIGHTS = {
    "Body Frame": {
        "Thin and Lean": (2, 0, 0),
        "Medium":        (1, 1, 1),
        "Well Built":    (0, 0, 2),
    },
    "Type of Hair": {
        "Dry":    (2, 0, 0),
        "Normal": (1, 1, 1),
        "Greasy": (0, 0, 2),
    },
    "Color of Hair": {
        "Grey":  (2, 0, 0),
        "Brown": (1, 1, 1),
        "Black": (0, 0, 2),
    },
    "Skin": {
        "Dry,Rough":     (2, 0, 0),
        "Soft,Sweating": (0, 2, 0),
        "Moist,Greasy":  (0, 0, 2),
    },
    "Complexion": {
        "Dark":    (2, 0, 1),
        "Pinkish": (0, 2, 0),
        "Glowing": (0, 0, 2),
    },
    "Body Weight": {
        "Underweight": (2, 0, 0),
        "Normal":      (1, 1, 1),
        "Overweight":  (0, 0, 2),
    },
    "Nails": {
        "Pinkish":  (1, 1, 1),
        "Redish":   (0, 2, 0),
        "Blackish": (2, 0, 0),
    },
    "Size and Color of the Teeth": {
        "Irregular,Blackish": (2, 0, 0),
        "Medium,Yellowish":   (0, 2, 0),
        "Large,White":        (0, 0, 2),
    },
    "Pace of Performing Work": {
        "Fast":   (2, 0, 0),
        "Medium": (1, 1, 1),
        "Slow":   (0, 0, 2),
    },
    "Mental Activity": {
        "Restless":   (2, 0, 0),
        "Aggressive": (0, 2, 0),
        "Stable":     (0, 0, 2),
    },
    "Memory": {
        "Short term":  (2, 0, 0),
        "Good Memory": (0, 2, 0),
        "Long Term":   (0, 0, 2),
    },
    "Sleep Pattern": {
        "Less":     (2, 0, 0),
        "Moderate": (1, 1, 1),
        "Sleepy":   (0, 0, 2),
    },
    "Weather Conditions": {
        "Dislike Cold":  (2, 0, 0),
        "Dislike Heat":  (0, 2, 0),
        "Dislike Moist": (0, 0, 2),
    },
    "Reaction under Adverse Situations": {
        "Anxiety": (2, 0, 0),
        "Anger":   (0, 2, 0),
        "Calm":    (0, 0, 2),
    },
    "Mood": {
        "Changes Quickly": (2, 0, 0),
        "Constant":        (1, 1, 1),
        "Changes Slowly":  (0, 0, 2),
    },
    "Eating Habit": {
        "Irregular Chewing": (2, 0, 0),
        "Improper Chewing":  (0, 2, 0),
        "Proper Chewing":    (0, 0, 2),
    },
    "Hunger": {
        "Skips Meal":       (2, 0, 0),
        "Sudden and Sharp": (0, 3, 0),
        "Irregular":        (1, 0, 2),
    },
    "Body Temperature": {
        "Less than Normal": (2, 0, 0),
        "Normal":           (1, 1, 1),
        "More than Normal": (0, 3, 0),
    },
    "Joints": {
        "Healthy": (1, 1, 1),
        "Weak":    (2, 0, 0),
        "Heavy":   (0, 0, 2),
    },
    "Nature": {
        "Egoistic,Fearless":  (0, 2, 0),
        "Jealous,Fearful":    (2, 0, 0),
        "Forgiving,Grateful": (0, 0, 2),
    },
    "Body Energy": {
        "Low":    (2, 0, 0),
        "Medium": (1, 1, 1),
        "High":   (0, 2, 0),
    },
    "Quality of Voice": {
        "Fast":  (2, 0, 0),
        "Deep":  (0, 2, 0),
        "Rough": (0, 0, 2),
    },
    "Dreams": {
        "Fire":  (0, 2, 0),
        "Sky":   (2, 0, 0),
        "Water": (0, 0, 2),
    },
    "Social Relations": {
        "Introvert": (2, 0, 0),
        "Ambivert":  (1, 1, 1),
        "Extrovert": (0, 0, 2),
    },
    "Body Odor": {
        "Strong":     (0, 2, 0),
        "Mild":       (1, 1, 1),
        "Negligible": (2, 0, 0),
    },
}

# ─── Rich knowledge base (unchanged) ──────────────────────────────────────

DOSHA_KNOWLEDGE = {
    "Vata": {
        "element": "Air + Ether",
        "symbol": "🌬️",
        "color": "#6B7FD4",
        "gradient": "linear-gradient(135deg, #6B7FD4, #A8B4E8)",
        "qualities": ["Light", "Dry", "Cold", "Subtle", "Mobile"],
        "tagline": "The Force of Movement & Creativity",
        "description": (
            "Vata governs all movement in the body and mind — from breath to thoughts. "
            "You are naturally creative, enthusiastic, and quick-thinking. "
            "When balanced, Vata types are vivacious, artistic, and spiritually inclined. "
            "When out of balance, anxiety, dryness, and irregularity arise."
        ),
        "strengths": [
            "Quick to learn and adapt",
            "Naturally creative and expressive",
            "Enthusiastic and energetic in bursts",
            "Spiritually inclined and intuitive",
        ],
        "imbalance_signs": [
            "Anxiety and worry",
            "Dry skin, hair, and nails",
            "Irregular digestion and bloating",
            "Insomnia and restless sleep",
            "Joint stiffness and crackling",
            "Cold hands and feet",
        ],
        "diet": {
            "favor": [
                "Warm, oily, and nourishing foods",
                "Sweet, sour, and salty tastes",
                "Ghee, sesame oil, olive oil",
                "Root vegetables (sweet potato, beet)",
                "Warm milk with honey and spices",
                "Soaked nuts (almonds, walnuts)",
                "Cooked grains (rice, oats, wheat)",
            ],
            "avoid": [
                "Raw, cold, and dry foods",
                "Bitter, pungent, astringent tastes",
                "Crackers, dry cereals, popcorn",
                "Carbonated drinks and caffeine",
                "Excessive fasting or skipping meals",
            ],
        },
        "herbs": [
            {"name": "Ashwagandha", "benefit": "Grounds Vata, reduces anxiety, builds strength"},
            {"name": "Shatavari",   "benefit": "Nourishes tissues, calms nerves, hydrates"},
            {"name": "Triphala",    "benefit": "Regulates irregular digestion gently"},
            {"name": "Brahmi",      "benefit": "Calms the restless mind, improves focus"},
            {"name": "Bala",        "benefit": "Strengthens muscles and nervous system"},
        ],
        "lifestyle": [
            "Follow a consistent daily routine (Dinacharya)",
            "Abhyanga — daily warm sesame oil self-massage",
            "Sleep before 10 PM; avoid late nights",
            "Stay warm — avoid cold, wind, and drafts",
            "Practice slow, rhythmic breathing (Nadi Shodhana)",
            "Minimize screen time and multitasking",
        ],
        "yoga": [
            "Slow Hatha yoga and Yin yoga",
            "Grounding poses: Tadasana, Balasana, Virasana",
            "Avoid fast-paced or very strenuous practice",
            "Finish with long Savasana (10+ minutes)",
        ],
        "seasonal_tip": "Winter and early spring are Vata seasons — increase warmth, oil, and routine.",
        "mantra": "I am grounded, stable, and at peace.",
    },
    "Pitta": {
        "element": "Fire + Water",
        "symbol": "🔥",
        "color": "#D4541A",
        "gradient": "linear-gradient(135deg, #D4541A, #F0A060)",
        "qualities": ["Hot", "Sharp", "Light", "Liquid", "Oily"],
        "tagline": "The Force of Transformation & Intelligence",
        "description": (
            "Pitta governs digestion, metabolism, and transformation — physical and mental. "
            "You are naturally driven, sharp-minded, and goal-oriented. "
            "When balanced, Pitta types excel as leaders, teachers, and visionaries. "
            "When out of balance, inflammation, irritability, and perfectionism flare up."
        ),
        "strengths": [
            "Sharp intellect and analytical mind",
            "Natural leader and decision-maker",
            "Strong digestion and metabolism",
            "Focused, goal-driven, and courageous",
        ],
        "imbalance_signs": [
            "Anger, irritability, and frustration",
            "Skin inflammation, rashes, acne",
            "Heartburn and acid reflux",
            "Excessive hunger or hypoglycemia",
            "Perfectionism and burnout",
            "Sensitivity to heat",
        ],
        "diet": {
            "favor": [
                "Cool, refreshing, and lightly oily foods",
                "Sweet, bitter, and astringent tastes",
                "Coconut water, cucumber, mint",
                "Leafy greens, broccoli, zucchini",
                "Sweet fruits (grapes, melons, pears)",
                "Basmati rice, barley, quinoa",
                "Ghee (cooling and healing to Pitta)",
            ],
            "avoid": [
                "Hot, spicy, and fermented foods",
                "Sour and salty tastes in excess",
                "Chili, mustard, vinegar, pickles",
                "Alcohol and coffee",
                "Red meat and fried foods",
            ],
        },
        "herbs": [
            {"name": "Amalaki",   "benefit": "Cooling, anti-inflammatory, rich in Vitamin C"},
            {"name": "Shatavari", "benefit": "Cools excess heat, nourishes and calms"},
            {"name": "Brahmi",    "benefit": "Cools the fiery mind, reduces stress"},
            {"name": "Neem",      "benefit": "Purifies blood, clears skin inflammation"},
            {"name": "Rose",      "benefit": "Cools emotions, supports heart health"},
        ],
        "lifestyle": [
            "Avoid excessive competition and overworking",
            "Take moonlit walks and spend time in nature",
            "Practice cooling pranayama (Sheetali, Sheetkari)",
            "Avoid exercising in peak heat (noon sun)",
            "Incorporate rest and play — not just productivity",
            "Cool showers and coconut oil massage",
        ],
        "yoga": [
            "Moderate, cooling yoga flows",
            "Moon salutations over sun salutations",
            "Chest-opening poses: Ustrasana, Matsyasana",
            "Forward folds to cool and calm the nervous system",
        ],
        "seasonal_tip": "Summer is Pitta season — prioritize cooling, rest, and sweet foods.",
        "mantra": "I lead with compassion and let go of control.",
    },
    "Kapha": {
        "element": "Earth + Water",
        "symbol": "🌍",
        "color": "#2E7D52",
        "gradient": "linear-gradient(135deg, #2E7D52, #6ABF8E)",
        "qualities": ["Heavy", "Slow", "Cool", "Oily", "Smooth"],
        "tagline": "The Force of Structure & Endurance",
        "description": (
            "Kapha governs structure, lubrication, and stability in the body and mind. "
            "You are naturally calm, compassionate, and enduring. "
            "When balanced, Kapha types radiate strength, loyalty, and deep love. "
            "When out of balance, heaviness, congestion, and inertia set in."
        ),
        "strengths": [
            "Emotionally stable and deeply compassionate",
            "Excellent endurance and physical strength",
            "Reliable, patient, and loyal",
            "Long-term memory and methodical thinking",
        ],
        "imbalance_signs": [
            "Weight gain and water retention",
            "Congestion, mucus, and sinus issues",
            "Lethargy, oversleeping, and sluggishness",
            "Emotional attachment and possessiveness",
            "Depression and low motivation",
            "Slow digestion and heaviness after meals",
        ],
        "diet": {
            "favor": [
                "Light, dry, warm, and spiced foods",
                "Pungent, bitter, and astringent tastes",
                "Ginger, black pepper, turmeric, cumin",
                "Legumes, leafy greens, and cruciferous vegetables",
                "Light fruits (apples, pears, berries)",
                "Barley, millet, buckwheat",
                "Raw honey (stimulating, not processed)",
            ],
            "avoid": [
                "Heavy, oily, and cold foods",
                "Sweet, sour, and salty tastes in excess",
                "Dairy, cheese, and ice cream",
                "Wheat, white rice, and refined grains",
                "Sweets, pastries, and fried food",
            ],
        },
        "herbs": [
            {"name": "Trikatu",   "benefit": "Kindles digestive fire, clears congestion"},
            {"name": "Guggulu",   "benefit": "Stimulates metabolism, reduces fat tissue"},
            {"name": "Ginger",    "benefit": "Warming, stimulates digestion, clears mucus"},
            {"name": "Punarnava", "benefit": "Reduces water retention, supports kidneys"},
            {"name": "Bibhitaki", "benefit": "Clears respiratory congestion, rejuvenates"},
        ],
        "lifestyle": [
            "Rise early (before 6 AM) — avoid excessive sleep",
            "Daily vigorous exercise — running, hiking, dancing",
            "Dry brushing (Garshana) to stimulate circulation",
            "Keep environment warm, dry, and stimulating",
            "Embrace change and new experiences",
            "Avoid daytime napping",
        ],
        "yoga": [
            "Vigorous, dynamic, and heating yoga",
            "Sun salutations (Surya Namaskar) at a fast pace",
            "Inversions and backbends to energize",
            "Kapalbhati and Bhastrika pranayama",
        ],
        "seasonal_tip": "Spring is Kapha season — move more, eat lighter, and welcome change.",
        "mantra": "I embrace change with joy and vitality.",
    },
}

DUAL_DOSHA_INFO = {
    "Vata-Pitta":  {"description": "A dynamic combination of creativity and drive. Quick, sharp, enthusiastic but prone to burnout.", "key_tip": "Balance movement with cooling rest. Warm nourishment and calming practices are your foundation."},
    "Pitta-Vata":  {"description": "Fire that moves — brilliant and driven with a restless creative streak.", "key_tip": "Prioritize consistent routine, cooling foods, and grounding yoga."},
    "Pitta-Kapha": {"description": "Transformative power meets enduring structure. Strong and determined but prone to congestion and heat.", "key_tip": "Favor light spiced foods. Vigorous morning exercise balances both doshas."},
    "Kapha-Pitta": {"description": "Deep strength with a fiery core. Remarkable endurance and focus but can accumulate heat.", "key_tip": "Keep moving and stay cool. Bitter greens and ginger are your allies."},
    "Vata-Kapha":  {"description": "Airy creativity with an earthy foundation. May experience dryness and heaviness simultaneously.", "key_tip": "Warm, lightly spiced, moderately oily foods. Avoid extremes of cold and wet."},
    "Kapha-Vata":  {"description": "Grounded but prone to stagnation or sudden bursts of scattered energy.", "key_tip": "Consistent warm meals, daily walks, and early rising transform your wellbeing."},
}


# ─── Main Engine ──────────────────────────────────────────────────────────

class DoshaEngine:
    """
    25-feature Dosha detection engine.
    ML (Random Forest on 25 columns) + classical trait scoring.
    """

    def __init__(self, csv_path: str = _DEFAULT_DOSHA_CSV):
        self.model = self._train(csv_path)

    def _train(self, csv_path: str):
        df = pd.read_csv(csv_path)

        # Encode each feature column
        for col, mapping in FEATURE_MAPS.items():
            if col in df.columns:
                df[col] = df[col].map(mapping)

        df["Dosha"] = df["Dosha"].map(DOSHA_MAP)
        df = df.dropna()

        X = df[FEATURE_COLS].astype(int)
        y = df["Dosha"].astype(int)

        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=None,
            random_state=42,
            n_jobs=-1,
            class_weight="balanced_subsample",
        )
        model.fit(X, y)

        # Down-weight ML logits for over-represented Dosha labels in the CSV (often Pitta-heavy).
        counts = np.bincount(y.to_numpy(), minlength=3).astype(np.float64)
        tot = float(counts.sum())
        inv = tot / (3.0 * np.maximum(counts, 1.0))
        inv = inv / inv.mean()
        self.ml_class_calibration = inv

        # Store per-feature medians so missing values are imputed neutrally (not biased to Pitta=1)
        self.feature_defaults = {col: int(X[col].median()) for col in FEATURE_COLS}
        print(f"[dosha] trained on {len(df)} rows; label counts V/P/K={counts.astype(int).tolist()} calibration={inv.round(3).tolist()}")
        return model

    @staticmethod
    def _answer_for_csv_column(answers: dict, csv_col: str):
        """First matching frontend value for this CSV column (deterministic order)."""
        for fk, col in FRONTEND_TO_CSV.items():
            if col != csv_col:
                continue
            if fk in answers and answers[fk] is not None and answers[fk] != "":
                return answers[fk]
        return None

    def _map_frontend_answers(self, answers: dict) -> dict:
        """
        Convert frontend camelCase keys to CSV column encodings.
        One value per FEATURE_COLS column; missing columns stay out of the dict.
        """
        csv_answers = {}
        for csv_col in FEATURE_COLS:
            val = self._answer_for_csv_column(answers, csv_col)
            if val is None:
                continue
            encoded = FEATURE_MAPS[csv_col].get(val)
            if encoded is not None:
                csv_answers[csv_col] = encoded
        return csv_answers

    def _ml_probabilities(self, csv_answers: dict) -> dict:
        """Run ML model — fill missing features with per-column training median."""
        row_data = {col: csv_answers.get(col, self.feature_defaults.get(col, 1))
                    for col in FEATURE_COLS}
        row_df = pd.DataFrame([row_data])[FEATURE_COLS]
        raw = self.model.predict_proba(row_df)[0]
        classes = self.model.classes_.astype(int)
        cal = np.array([self.ml_class_calibration[c] for c in classes])
        adj = raw * cal
        adj = adj / adj.sum()
        return {REVERSE_MAP[int(c)]: float(p) for c, p in zip(classes, adj)}

   

    def _classical_scores(self, answers: dict) -> dict:
        scores = {"Vata": 0, "Pitta": 0, "Kapha": 0}

        for csv_col in FEATURE_COLS:
            val = self._answer_for_csv_column(answers, csv_col)
            if val is None or val not in TRAIT_WEIGHTS.get(csv_col, {}):
                continue
            v, p, k = TRAIT_WEIGHTS[csv_col][val]
            scores["Vata"] += v
            scores["Pitta"] += p
            scores["Kapha"] += k

        # 🔥 softmax instead of linear normalization
        scale = 0.7  # prevents overconfidence

        exp_v = math.exp(scores["Vata"] * scale)
        exp_p = math.exp(scores["Pitta"] * scale)
        exp_k = math.exp(scores["Kapha"] * scale)

        total = exp_v + exp_p + exp_k

        return {
            "Vata": exp_v / total,
            "Pitta": exp_p / total,
            "Kapha": exp_k / total,
        }
    
    def _blend_scores(self, ml_probs: dict, classical_probs: dict, answered_count: int) -> dict:
        # 🔥 detect dominance gap in classical
        vals = sorted(classical_probs.values(), reverse=True)
        gap = vals[0] - vals[1]

        # If classical is confident → trust it more
        if gap > 0.08:
            ml_weight = 0.25
        else:
            ml_weight = min(_ML_BLEND_MAX, answered_count / len(FEATURE_COLS) * _ML_BLEND_MAX)

        classical_weight = 1 - ml_weight

        final = {}
        for d in ["Vata", "Pitta", "Kapha"]:
            final[d] = (ml_weight * ml_probs[d]) + (classical_weight * classical_probs[d])

        total = sum(final.values()) or 1
        return {k: v / total for k, v in final.items()}
    def predict(self, answers: dict) -> dict:
        csv_answers    = self._map_frontend_answers(answers)
        ml_probs       = self._ml_probabilities(csv_answers)
        classic_probs  = self._classical_scores(answers)

        answered_ratio = len(csv_answers) / len(FEATURE_COLS)

        blended = self._blend_scores(
            ml_probs,
            classic_probs,
            answered_count=len(csv_answers)
        )

        # 🔥 dominance boost
        def _sharpen(dist, power=1.35):
            out = {k: (v ** power) for k, v in dist.items()}
            s = sum(out.values()) or 1
            return {k: v / s for k, v in out.items()}

        if len(csv_answers) == len(FEATURE_COLS):
            blended = _sharpen(blended, power=1.35)

        # Softer peaks when many features are imputed
        prior = {"Vata": 1 / 3, "Pitta": 1 / 3, "Kapha": 1 / 3}
        shrink = ((1 - answered_ratio) ** 2) * 0.65
        if shrink > 0:
            blended = {
                d: (1 - shrink) * blended[d] + shrink * prior[d]
                for d in blended
            }

        # Mild Pitta dampening
        if _PITTA_OUTPUT_SCALE != 1.0:
            blended["Pitta"] *= _PITTA_OUTPUT_SCALE
            tot_adj = sum(blended.values()) or 1
            blended = {d: blended[d] / tot_adj for d in blended}
            
               # add before final percentages
        SMOOTH = 0.15

        blended = {
            d: (1 - SMOOTH) * blended[d] + SMOOTH * (1/3)
            for d in blended
        }
        
        blended = {d: round(blended[d], 4) for d in blended}
        total = sum(blended.values()) or 1
        percentages = {d: round((blended[d] / total) * 100, 1) for d in blended}
        
         

        ranked    = sorted(blended, key=blended.get, reverse=True)
        dominant  = ranked[0]
        secondary = ranked[1]

        is_dual  = percentages[secondary] >= percentages[dominant] - 18
        dual_key = f"{dominant}-{secondary}" if is_dual else None
        dual_info = DUAL_DOSHA_INFO.get(dual_key)

        knowledge = DOSHA_KNOWLEDGE[dominant]

        return {
            "dominant_dosha":    dominant,
            "secondary_dosha":   secondary,
            "is_dual_dosha":     is_dual,
            "dual_combination":  dual_key,
            "percentages":       percentages,
            "element":           knowledge["element"],
            "symbol":            knowledge["symbol"],
            "color":             knowledge["color"],
            "gradient":          knowledge["gradient"],
            "qualities":         knowledge["qualities"],
            "tagline":           knowledge["tagline"],
            "description":       knowledge["description"],
            "strengths":         knowledge["strengths"],
            "imbalance_signs":   knowledge["imbalance_signs"],
            "diet":              knowledge["diet"],
            "herbs":             knowledge["herbs"],
            "lifestyle":         knowledge["lifestyle"],
            "yoga":              knowledge["yoga"],
            "seasonal_tip":      knowledge["seasonal_tip"],
            "mantra":            knowledge["mantra"],
            "dual_info":         dual_info,
            "secondary_color":   DOSHA_KNOWLEDGE[secondary]["color"],
            "secondary_tagline": DOSHA_KNOWLEDGE[secondary]["tagline"],
            "features_used":     len(csv_answers),
            "total_features":    len(FEATURE_COLS),
        }


# ─── Singleton ────────────────────────────────────────────────────────────

_engine = None

def load_dosha_engine(csv_path: str = _DEFAULT_DOSHA_CSV) -> DoshaEngine:
    global _engine
    if _engine is None:
        _engine = DoshaEngine(csv_path)
    return _engine


# ─── Quick test ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    engine = load_dosha_engine()

    tests = [
    # VATA TEST (all 25)
    {
        "body_type": "Thin and Lean",
        "hair_type": "Dry",
        "hair_color": "Grey",
        "skin": "Dry,Rough",
        "complexion": "Dark",
        "body_weight": "Underweight",
        "nails": "Blackish",
        "teeth": "Irregular,Blackish",
        "pace": "Fast",
        "mind": "Restless",
        "memory": "Short term",
        "sleep": "Less",
        "weather": "Dislike Cold",
        "emotion": "Anxiety",
        "mood": "Changes Quickly",
        "eating_habit": "Irregular Chewing",
        "hunger": "Skips Meal",
        "body_temp": "Less than Normal",
        "joints": "Weak",
        "nature": "Jealous,Fearful",
        "energy": "Low",
        "voice": "Fast",
        "dreams": "Sky",
        "social": "Introvert",
        "body_odor": "Negligible",
    },

    # PITTA TEST (all 25)
    {
        "body_type": "Medium",
        "hair_type": "Normal",
        "hair_color": "Brown",
        "skin": "Soft,Sweating",
        "complexion": "Pinkish",
        "body_weight": "Normal",
        "nails": "Redish",
        "teeth": "Medium,Yellowish",
        "pace": "Medium",
        "mind": "Aggressive",
        "memory": "Good Memory",
        "sleep": "Moderate",
        "weather": "Dislike Heat",
        "emotion": "Anger",
        "mood": "Constant",
        "eating_habit": "Improper Chewing",
        "hunger": "Sudden and Sharp",
        "body_temp": "More than Normal",
        "joints": "Healthy",
        "nature": "Egoistic,Fearless",
        "energy": "High",
        "voice": "Deep",
        "dreams": "Fire",
        "social": "Ambivert",
        "body_odor": "Strong",
    },

    # KAPHA TEST (all 25)
    {
        "body_type": "Well Built",
        "hair_type": "Greasy",
        "hair_color": "Black",
        "skin": "Moist,Greasy",
        "complexion": "Glowing",
        "body_weight": "Overweight",
        "nails": "Pinkish",
        "teeth": "Large,White",
        "pace": "Slow",
        "mind": "Stable",
        "memory": "Long Term",
        "sleep": "Sleepy",
        "weather": "Dislike Moist",
        "emotion": "Calm",
        "mood": "Changes Slowly",
        "eating_habit": "Proper Chewing",
        "hunger": "Irregular",
        "body_temp": "Normal",
        "joints": "Heavy",
        "nature": "Forgiving,Grateful",
        "energy": "Medium",
        "voice": "Rough",
        "dreams": "Water",
        "social": "Extrovert",
        "body_odor": "Mild",
    },
]

    for i, tc in enumerate(tests, 1):
        r = engine.predict(tc)
        print(f"\nTest {i}: {r['dominant_dosha']} ({r['percentages'][r['dominant_dosha']]}%) | "
              f"Features used: {r['features_used']}/{r['total_features']}")
        print(f"  V:{r['percentages']['Vata']}%  P:{r['percentages']['Pitta']}%  K:{r['percentages']['Kapha']}%")
