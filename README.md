
# Ayurveda Wellness Platform

A full-stack Ayurveda wellness project that combines classical formulation search, a questionnaire-based dosha assessment, and personalized diet planning. The interface is built with React; the application APIs use Flask and Express; MySQL stores user and assessment data.

## What the project does

- **Ayurveda recommendation:** Search classical formulations by symptom, ingredient, or condition, then filter and sort matching results.
- **Dosha detector:** Answer a 25-question assessment to estimate Vata, Pitta, and Kapha proportions. The Flask service uses the project's dosha data and scoring/model logic, and returns guidance about diet, herbs, lifestyle, and yoga.
- **Diet planner:** Build a plan from dosha, goal, lifestyle, season, and optional blood-report data. The UI supports PDF upload and manual marker entry; the Flask service parses PDFs and can use the Groq API for generated plan content.
- **Accounts:** Sign up and log in through the Express authentication API. Passwords are hashed with bcrypt and login returns a JWT.

This is a learning and wellness information project. Recommendations are informational and are not a substitute for advice from a qualified healthcare professional.

## Project layout

```text
.
├── api_server.py                 # Flask API for recommendations, dosha, and diet
├── ayurved-ai/                   # React frontend (Create React App)
│   └── src/pages/                # Login, signup, dashboard, recommend, dosha, diet
├── backend/                      # Express authentication API
│   ├── server.js
│   └── routes/auth.js             # Signup and login endpoints
├── db.py                         # MySQL connection used by Flask
├── diet_engine.py                # Diet-plan rules and data
├── dosha.py                      # Dosha mapping and scoring/model helpers
├── ayurveda_recommender.py       # Formulation recommendation logic
├── herbal_formulation.csv        # Formulation data
├── ayurvedic_dosha_dataset_balanced.csv
├── table schema.sql              # MySQL schema starter
└── requirements.txt              # Python dependencies
```

## Requirements

- Node.js and npm
- Python 3.10 or newer
- MySQL Server
- A Groq API key for the AI-generated diet-plan path

## Local setup

Run commands from the repository root unless a `cd` is shown.

### 1. Install Python dependencies

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m pip install mysql-connector-python
```

If PowerShell blocks activation, use `\.venv\Scripts\python.exe -m pip install -r requirements.txt` and the same interpreter to launch the API.

### 2. Prepare MySQL

Start your MySQL service (the Windows service is often named `MySQL80`; check with `Get-Service *mysql*`). Then open MySQL Workbench, connect to your local server, and run `table schema.sql`.

The Flask API expects a database named `ayurveda`. Its connection is currently set in `db.py`; update that file to match your local MySQL username, password, and database before running the API. Do not commit real credentials.

The Express authentication API reads its database settings from `backend/.env` and expects a `users` table in the configured database. The checked-in schema creates `ayurveda`, while `backend/env.example` uses `auth_db` as a placeholder. Set `DB_NAME` in `backend/.env` to the database that contains the `users` table (for the provided schema, that is `ayurveda`) and set the other values for your local MySQL instance. Create `backend/.env` from `backend/env.example` if it does not exist. Set a private `JWT_SECRET` there.

The Flask API creates its `user_dosha` table when needed. Other project SQL files, such as `blood_report.sql`, are supplemental schema examples.

### 3. Configure Flask environment

The root `.env` is used for API configuration. Set your own key there:

```dotenv
GROQ_API_KEY=your_groq_api_key
# Optional
GROQ_MODEL=llama-3.3-70b-versatile
PORT=5050
```

Do not publish `.env` files or API keys. Without a Groq key, endpoints that rely on Groq-generated output may return an error; local rule-based functionality may still be available.

### 4. Install frontend dependencies

```powershell
cd ayurved-ai
npm install
```

The frontend's development proxy forwards recommendation, dosha, and diet requests to Flask at `http://127.0.0.1:5050`. The frontend calls authentication at `http://localhost:5000`.

## Run the application

Start each service in its own terminal, from the repository root:

**Terminal 1 — Flask wellness API**

```powershell
python api_server.py
```

**Terminal 2 — Express authentication API**

```powershell
cd backend
npm install
npm start
```

**Terminal 3 — React frontend**

```powershell
cd ayurved-ai
npm start
```

Open [http://localhost:3000](http://localhost:3000). Flask listens on port `5050`; Express listens on port `5000`.

## API routes

### Flask (`http://localhost:5050`)

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API and service status |
| `GET` | `/dashboard` | Dashboard module information |
| `POST` | `/recommend` | Search Ayurvedic formulations |
| `POST` | `/dosha` | Assess dosha from questionnaire answers |
| `GET` | `/user/<user_id>/dosha` | Read the saved dosha result for a user |
| `GET` | `/diet/options` | List diet planner options |
| `POST` | `/diet` | Generate a personalized diet plan |

### Express (`http://localhost:5000`)

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Verify credentials and return a JWT |

## Notes

- `ayurved-ai/package.json` contains the frontend scripts: `npm start`, `npm run build`, and `npm test`.
- The root `package-lock.json` is not the frontend manifest; install frontend packages inside `ayurved-ai/` and backend packages inside `backend/`.
- Several datasets and helper scripts in the root support model training, balancing, and experimentation; they are not separate servers to launch.
- If the frontend cannot reach Flask, confirm Flask is running on port `5050`. If sign-in fails, confirm MySQL is running, the `users` table exists in the database configured by `backend/.env`, and Express is running on port `5000`.

# Ayurveda_Wellness_Website
