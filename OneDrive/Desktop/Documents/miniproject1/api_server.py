"""
api_server.py — Unified Ayurveda Flask REST API v3.0
=======================================================
Endpoints:
  GET  /health        — system status
  GET  /dashboard     — module listing
  POST /recommend     — Ayurvedic formulation recommender
  POST /dosha         — Dosha detection (ML + classical scoring)
  POST /diet          — Full personalised diet plan (diet_engine.py)
  GET  /diet/options  — Available options (doshas, goals, lifestyles, seasons)
"""

import os
import json
import random
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from db import get_db_connection
import pdfplumber

from dosha import FEATURE_MAPS, FRONTEND_TO_CSV

DOSHA_PAYLOAD_KEYS = tuple(FRONTEND_TO_CSV.keys())

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as env_file:
            for line in env_file:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip().strip("\"'"))

app = Flask(__name__)
CORS(app)

FORMULATION_CSV = os.environ.get("CSV_PATH",  "herbal_formulation.csv")
DOSHA_CSV       = os.environ.get("DOSHA_CSV", "ayurvedic_dosha_dataset_balanced.csv")

_recommender  = None
_dosha_engine = None


def ensure_user_dosha_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_dosha (
            user_id INT PRIMARY KEY,
            dominant_dosha VARCHAR(20) NOT NULL,
            secondary_dosha VARCHAR(20),
            is_dual_dosha BOOLEAN DEFAULT FALSE,
            dual_combination VARCHAR(40),
            percentages JSON,
            answers JSON,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_user_dosha_user
                FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()


def save_user_dosha(user_id, result, answers):
    ensure_user_dosha_table()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO user_dosha (
            user_id, dominant_dosha, secondary_dosha, is_dual_dosha,
            dual_combination, percentages, answers
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            dominant_dosha = VALUES(dominant_dosha),
            secondary_dosha = VALUES(secondary_dosha),
            is_dual_dosha = VALUES(is_dual_dosha),
            dual_combination = VALUES(dual_combination),
            percentages = VALUES(percentages),
            answers = VALUES(answers),
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            user_id,
            result.get("dominant_dosha"),
            result.get("secondary_dosha"),
            bool(result.get("is_dual_dosha")),
            result.get("dual_combination"),
            json.dumps(result.get("percentages", {})),
            json.dumps(answers),
        ),
    )
    conn.commit()
    cursor.close()
    conn.close()


def get_user_dosha(user_id):
    ensure_user_dosha_table()
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT user_id, dominant_dosha, secondary_dosha, is_dual_dosha,
               dual_combination, percentages, updated_at
        FROM user_dosha
        WHERE user_id = %s
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if row and isinstance(row.get("percentages"), str):
        row["percentages"] = json.loads(row["percentages"])
    return row


def ensure_blood_reports_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blood_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            cholesterol FLOAT,
            triglycerides FLOAT,
            ldl FLOAT,
            hdl FLOAT,
            hemoglobin FLOAT,
            glucose FLOAT,
            hba1c FLOAT,
            vitamin_d FLOAT,
            vitamin_b12 FLOAT,
            uric_acid FLOAT,
            creatinine FLOAT,
            abnormalities TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_blood_reports_user
                FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE SET NULL
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()


def extract_blood_markers_from_pdf(upload_file):
    with pdfplumber.open(upload_file) as pdf:
        text = "\n".join((page.extract_text() or "") for page in pdf.pages)

    def extract(pattern):
        match = re.search(pattern, text, re.IGNORECASE)
        if not match:
            return None
        try:
            return float(match.group(1))
        except (TypeError, ValueError):
            return None

    blood_values = {
        "cholesterol": extract(r"(?:total\s+)?cholesterol[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "triglycerides": extract(r"triglycerides?[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "ldl": extract(r"(?:ldl|low\s*density\s*lipoprotein)[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "hdl": extract(r"(?:hdl|high\s*density\s*lipoprotein)[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "hemoglobin": extract(r"(?:haemoglobin|hemoglobin|hb)[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "glucose": extract(r"(?:fasting\s+)?glucose[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "hba1c": extract(r"(?:hba1c|glycated\s*hemoglobin)[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "vitamin_d": extract(r"(?:vitamin\s*d|25[\s-]*oh\s*vitamin\s*d)[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "vitamin_b12": extract(r"(?:vitamin\s*b12|b12)[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "uric_acid": extract(r"uric\s*acid[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
        "creatinine": extract(r"creatinine[^0-9]*([0-9]+(?:\.[0-9]+)?)"),
    }
    return blood_values


def detect_abnormalities(blood_values):
    abnormalities = []

    cholesterol = blood_values.get("cholesterol")
    hemoglobin = blood_values.get("hemoglobin")
    glucose = blood_values.get("glucose")

    if cholesterol is not None and cholesterol > 200:
        abnormalities.append("High Cholesterol")
    if hemoglobin is not None and hemoglobin < 12:
        abnormalities.append("Low Hemoglobin")
    if glucose is not None and glucose > 110:
        abnormalities.append("High Blood Sugar")

    triglycerides = blood_values.get("triglycerides")
    ldl = blood_values.get("ldl")
    hdl = blood_values.get("hdl")
    hba1c = blood_values.get("hba1c")
    vitamin_d = blood_values.get("vitamin_d")
    vitamin_b12 = blood_values.get("vitamin_b12")
    uric_acid = blood_values.get("uric_acid")
    creatinine = blood_values.get("creatinine")

    if triglycerides is not None and triglycerides > 150:
        abnormalities.append("High Triglycerides")

    if ldl is not None and ldl > 130:
        abnormalities.append("High LDL")

    if hdl is not None and hdl < 40:
        abnormalities.append("Low HDL")

    if hba1c is not None and hba1c >= 6.5:
        abnormalities.append("High HbA1c")
    elif hba1c is not None and hba1c >= 5.7:
        abnormalities.append("Prediabetes Range HbA1c")

    if vitamin_d is not None and vitamin_d < 20:
        abnormalities.append("Low Vitamin D")

    if vitamin_b12 is not None and vitamin_b12 < 200:
        abnormalities.append("Low Vitamin B12")

    if uric_acid is not None and uric_acid > 7:
        abnormalities.append("High Uric Acid")

    if creatinine is not None and creatinine > 1.3:
        abnormalities.append("High Creatinine")

    return abnormalities


def build_blood_diet_rules(abnormalities, blood_values):
    if not abnormalities:
        return ["No blood-report-specific restriction. Keep dosha and goal as primary guidance."]

    rules = []
    abnormality_set = set(abnormalities)

    if "High Blood Sugar" in abnormality_set or "Prediabetes Range HbA1c" in abnormality_set or "High HbA1c" in abnormality_set:
        rules.append("Strict low-sugar plan: avoid sugar/jaggery/honey/sweet drinks/desserts; prefer low-GI carbs, high-fiber meals, and protein-balanced plates.")
        rules.append("Choose whole grains (millets, barley, oats, brown rice in moderate portions); avoid refined flour and large white-rice portions.")

    if "High Cholesterol" in abnormality_set or "High LDL" in abnormality_set:
        rules.append("Heart-friendly pattern: reduce deep-fried foods, cream, butter, and excess ghee; prefer steamed/sauteed foods and soluble-fiber-rich ingredients.")
        rules.append("Include oats/barley/legumes/flax/chia/vegetables to support lipid control.")

    if "High Triglycerides" in abnormality_set:
        rules.append("Cut refined carbohydrates and sweets aggressively; keep dinner very light and early.")
        rules.append("Avoid sweet beverages and packaged snacks; emphasize vegetables, legumes, and moderate healthy fats.")

    if "Low HDL" in abnormality_set:
        rules.append("Include moderate healthy fats (nuts/seeds) and avoid trans-fat or repeatedly heated oils.")

    if "Low Hemoglobin" in abnormality_set:
        rules.append("Include iron-focused foods (leafy greens, legumes, sesame, dates in moderation) with vitamin-C pairings (amla/lemon) for absorption.")

    if "Low Vitamin D" in abnormality_set:
        rules.append("Include vitamin-D supportive foods and mention sunlight routine in daily_wisdom where suitable.")

    if "Low Vitamin B12" in abnormality_set:
        rules.append("For vegetarian/vegan plans, include B12-fortified options and suggest clinician-guided supplementation in daily_wisdom.")

    if "High Uric Acid" in abnormality_set:
        rules.append("Keep purine load lower: reduce organ meats/red meat and very heavy protein portions; prioritize hydration-friendly meals.")

    if "High Creatinine" in abnormality_set:
        rules.append("Use kidney-friendly moderation: avoid very high-protein heavy meals and excessive sodium.")

    if blood_values.get("glucose") is not None and blood_values["glucose"] > 140:
        rules.append("Because glucose is markedly elevated, keep all meal descriptions explicitly sugar-free and avoid high-glycemic breakfast choices.")

    return rules


def parse_manual_blood_values(raw_value):
    if not raw_value:
        return {}

    if isinstance(raw_value, dict):
        payload = raw_value
    else:
        try:
            payload = json.loads(raw_value)
        except Exception:
            return {}

    parsed = {}
    for key, value in (payload or {}).items():
        try:
            if value in ("", None):
                continue
            parsed[key] = float(value)
        except (TypeError, ValueError):
            continue
    return parsed


def save_blood_report(user_id, blood_values, abnormalities):
    ensure_blood_reports_table()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO blood_reports (
            user_id, cholesterol, triglycerides, ldl, hdl,
            hemoglobin, glucose, hba1c, vitamin_d, vitamin_b12,
            uric_acid, creatinine, abnormalities
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            user_id if user_id else None,
            blood_values.get("cholesterol"),
            blood_values.get("triglycerides"),
            blood_values.get("ldl"),
            blood_values.get("hdl"),
            blood_values.get("hemoglobin"),
            blood_values.get("glucose"),
            blood_values.get("hba1c"),
            blood_values.get("vitamin_d"),
            blood_values.get("vitamin_b12"),
            blood_values.get("uric_acid"),
            blood_values.get("creatinine"),
            ", ".join(abnormalities),
        ),
    )
    conn.commit()
    cursor.close()
    conn.close()


def get_recommender():
    global _recommender
    if _recommender is None:
        from ayurveda_recommender import load_and_preprocess, AyurvedaRecommender
        print("⚙  Loading formulation recommender…")
        df = load_and_preprocess(FORMULATION_CSV)
        _recommender = AyurvedaRecommender(df)
        print("✓  Formulation recommender ready.")
    return _recommender


def get_dosha_engine():
    global _dosha_engine
    if _dosha_engine is None:
        from dosha import load_dosha_engine
        print("⚙  Loading dosha engine…")
        _dosha_engine = load_dosha_engine(DOSHA_CSV)
        print("✓  Dosha engine ready.")
    return _dosha_engine


# ─────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "version": "3.0",
        "modules": ["recommend", "dosha", "diet"],
    })


@app.route("/dashboard", methods=["GET"])
def dashboard():
    return jsonify({
        "modules": [
            {
                "name": "Ayurveda Recommendation",
                "description": "Get classical formulations based on symptoms",
                "endpoint": "/recommend",
                "method": "POST",
                "body": {"query": "string", "top_n": "int (default 5)"},
            },
            {
                "name": "Dosha Detector",
                "description": "Find your Prakriti — Vata, Pitta, or Kapha",
                "endpoint": "/dosha",
                "method": "POST",
                "body": (
                    f"{len(DOSHA_PAYLOAD_KEYS)} questionnaire fields — "
                    "exact strings must match dosha.FEATURE_MAPS "
                    f"(keys: {', '.join(DOSHA_PAYLOAD_KEYS[:6])}, …)"
                ),
            },
            {
                "name": "Diet Planner",
                "description": "Full personalised Ayurvedic diet plan",
                "endpoint": "/diet",
                "method": "POST",
                "body": {
                    "dosha":           "Vata | Pitta | Kapha  (required)",
                    "secondary_dosha": "Vata | Pitta | Kapha  (optional)",
                    "season":          "Spring | Summer | Autumn | Winter  (optional — auto-detected)",
                    "goal":            "Balance | Detox | Energy | Weight | Immunity  (default: Balance)",
                    "lifestyle":       "Vegetarian | Vegan | Non-vegetarian  (default: Vegetarian)",
                },
            },
        ]
    })


@app.route("/recommend", methods=["POST"])
def recommend():
    """POST /recommend — { query, top_n }"""
    body  = request.get_json(silent=True) or {}
    query = body.get("query", "").strip()
    top_n = int(body.get("top_n", 5))

    if not query:
        return jsonify({"error": "query field is required"}), 400

    try:
        results = get_recommender().recommend_formulations(query, top_n=top_n)
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/dosha", methods=["POST"])
def dosha():
    """POST /dosha — full questionnaire; keys and values must match dosha.FEATURE_MAPS."""
    body = request.get_json(silent=True) or {}

    missing = [k for k in DOSHA_PAYLOAD_KEYS if body.get(k) in (None, "")]
    if missing:
        return jsonify({
            "error": "Missing questionnaire fields",
            "required": list(DOSHA_PAYLOAD_KEYS),
            "missing": missing,
        }), 400

    for key in DOSHA_PAYLOAD_KEYS:
        col = FRONTEND_TO_CSV[key]
        val = body[key]
        allowed = FEATURE_MAPS[col]
        if val not in allowed:
            return jsonify({
                "error": f"Invalid value for '{key}'",
                "valid_choices": list(allowed.keys()),
            }), 400

    try:
        result = get_dosha_engine().predict(body)
        user_id = body.get("user_id")
        result["saved"] = False

        if user_id:
            try:
                save_user_dosha(int(user_id), result, body)
                result["saved"] = True
            except Exception as save_error:
                print("Dosha save failed:", save_error)
                result["save_error"] = str(save_error)

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/user/<int:user_id>/dosha", methods=["GET"])
def user_dosha(user_id):
    """GET /user/<user_id>/dosha - latest saved dosha for a user"""
    try:
        row = get_user_dosha(user_id)
        if not row:
            return jsonify({"error": "No saved dosha found for this user"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/diet/options", methods=["GET"])
def diet_options():
    """GET /diet/options — returns valid parameter choices"""
    return jsonify({
        "doshas":     ["Vata", "Pitta", "Kapha"],
        "goals":      ["Balance", "Detox", "Energy", "Weight", "Immunity"],
        "lifestyles": ["Vegetarian", "Vegan", "Non-vegetarian"],
        "seasons":    ["Spring", "Summer", "Autumn", "Winter"],
    })


groq_client = None


def get_groq_client():
    global groq_client
    if groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set")
        groq_client = Groq(api_key=api_key)
    return groq_client


def normalize_meal_items(items, default_energy="Moderate"):
    normalized = []
    for item in items or []:
        if isinstance(item, dict):
            normalized.append({
                "name": item.get("name", "Meal"),
                "description": item.get("description", ""),
                "energy": item.get("energy", default_energy),
            })
        else:
            normalized.append({
                "name": str(item),
                "description": "Ayurvedic meal suggestion matched to your dosha, season, and goal.",
                "energy": default_energy,
            })
    return normalized


def varied_meal_items(items, default_energy, rng, count=2):
    normalized = normalize_meal_items(items, default_energy)
    if len(normalized) <= count:
        rng.shuffle(normalized)
        return normalized
    return rng.sample(normalized, count)


def normalize_diet_engine_plan(plan, seed=None):
    rng = random.Random(seed)
    raw_meals = plan.get("meals", {})
    return {
        "breakfast": varied_meal_items(raw_meals.get("breakfast"), "Moderate", rng),
        "mid_morning": varied_meal_items(raw_meals.get("mid_morning"), "Light", rng),
        "lunch": varied_meal_items(raw_meals.get("lunch"), "Nourishing", rng),
        "evening": varied_meal_items(raw_meals.get("evening"), "Light", rng),
        "dinner": varied_meal_items(raw_meals.get("dinner"), "Light", rng),
        "daily_wisdom": plan.get("principle", ""),
        "agni_tip": plan.get("agni_desc", ""),
    }


@app.route("/diet", methods=["POST"])
def diet():
    is_form = request.content_type and "multipart/form-data" in request.content_type
    body = request.form if is_form else (request.get_json(silent=True) or {})

    user_id = body.get("user_id")
    dosha = body.get("dosha")
    saved_dosha = None
    blood_values = {}
    abnormalities = []
    report_saved = False
    manual_blood_values = parse_manual_blood_values(body.get("manual_blood_values"))

    if user_id:
        try:
            saved_dosha = get_user_dosha(int(user_id))
            if saved_dosha:
                dosha = saved_dosha["dominant_dosha"]
        except Exception as fetch_error:
            print("Saved dosha lookup failed:", fetch_error)

    upload_file = request.files.get("file") if is_form else None
    if upload_file:
        try:
            blood_values = extract_blood_markers_from_pdf(upload_file)
        except Exception as report_error:
            print("Blood report parse failed:", report_error)

    # Manual values fill missing markers (or work standalone when no PDF is uploaded).
    for key, value in manual_blood_values.items():
        if blood_values.get(key) is None:
            blood_values[key] = value

    if blood_values:
        abnormalities = detect_abnormalities(blood_values)
        try:
            save_blood_report(user_id, blood_values, abnormalities)
            report_saved = True
        except Exception as save_error:
            print("Blood report save failed:", save_error)

    dosha = dosha or "Vata"
    season = body.get("season", "Summer")
    goal = body.get("goal", "Balance")
    lifestyle = body.get("lifestyle", "Vegetarian")
    seed = random.randint(1, 100000)

    try:
        SYSTEM_PROMPT = """You are an expert Ayurvedic nutritionist specialising in INDIAN home cooking. Generate a UNIQUE daily meal plan using ONLY traditional Indian dishes.

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
2-3 items per section. No dish repeated across sections.
"""

        blood_prompt_rules = build_blood_diet_rules(abnormalities, blood_values)
        formatted_blood_rules = "\n".join(f"- {rule}" for rule in blood_prompt_rules)

        user_prompt = f"""
Generate Ayurvedic meal plan:

Dosha: {dosha}
Goal: {goal}
Lifestyle: {lifestyle}
Season: {season}

Rules:
- Vegan → no dairy
- Vegetarian → no eggs/meat
- Non-veg → MUST include eggs/fish/chicken
- Lunch heavy, dinner light
- Blood abnormalities to consider in food choices: {', '.join(abnormalities) if abnormalities else 'None detected'}
- Blood-report-specific diet adjustments:
{formatted_blood_rules}
- Random seed: {seed}
"""

        # ✅ GROQ API CALL
        completion = get_groq_client().chat.completions.create(
            model=os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=1.2
        )

        content = completion.choices[0].message.content

        # 🧹 CLEAN RESPONSE
        content = content.replace("```json", "").replace("```", "").strip()

        try:
            meals = json.loads(content)
        except:
            print("RAW OUTPUT:", content)
            raise Exception("Invalid JSON from AI")

        return jsonify({
            "meals": meals,
            "dosha": dosha,
            "goal": goal,
            "lifestyle": lifestyle,
            "season": season,
            "blood_values": blood_values,
            "abnormalities": abnormalities,
            "report_saved": report_saved,
            "saved_dosha": saved_dosha,
            "source": "ai"
        })

    except Exception as e:
        print("AI failed:", e)

        from diet_engine import generate_diet_plan

        fallback_plan = generate_diet_plan(
            dosha=dosha,
            season=season,
            goal=goal,
            lifestyle=lifestyle
        )
        meals = normalize_diet_engine_plan(fallback_plan, seed)

        return jsonify({
            "meals": meals,
            "dosha": dosha,
            "goal": goal,
            "lifestyle": lifestyle,
            "season": season,
            "blood_values": blood_values,
            "abnormalities": abnormalities,
            "report_saved": report_saved,
            "seed": seed,
            "saved_dosha": saved_dosha,
            "source": "fallback"
        })
# ─────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    host = os.environ.get("FLASK_HOST", "127.0.0.1")
    debug = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    print(f"\n[ayurveda-api] starting http://{host}:{port}/ (debug={debug})\n")
    app.run(host=host, port=port, debug=debug)