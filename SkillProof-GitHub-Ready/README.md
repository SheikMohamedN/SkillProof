# SkillProof

> **Don't just claim your skills. Prove them through actual work.**

SkillProof is a practical skill-verification platform for students. Students complete real-world tasks inside a controlled Workroom, get hints from an AI mentor, submit their work, complete an understanding check, and build an evidence-based skill profile.

## Stack

- Frontend: React + Vite
- Backend: FastAPI + SQLAlchemy
- Database: SQLite for local/hackathon use
- API: REST
- AI integration: ready as a service boundary; add your preferred LLM provider in `backend/app/services/mentor.py`

## Project structure

```text
SkillProof/
├── frontend/        # React web app
├── backend/         # FastAPI REST API
├── README.md
└── .gitignore
```

## Run locally

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

API docs: `http://127.0.0.1:8000/docs`

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend uses `/api` through Vite's development proxy.

## Demo workflow

1. Open **Tasks**.
2. Pick a task.
3. Click **Start Task**.
4. Work in the 3-column Workroom.
5. Edit the starter code and click **Run** / **Save Version**.
6. Ask SkillGuide for hints.
7. Submit for evaluation.
8. Complete the understanding check.
9. View the resulting evidence in **My Proof**.
10. Use **Edit Profile** to change student details.

## Adding tasks

Tasks are stored in the database, not hardcoded into the React UI.

Use the API:

```http
POST /api/tasks
Content-Type: application/json
```

See `backend/app/routers/tasks.py` and the seeded task examples in `backend/app/seed.py`.

Each task can define:

- skill
- difficulty
- estimated time
- scenario
- requirements
- starter code
- dataset/resources
- evaluation criteria

This means the Task Library can grow without changing frontend code.

## GitHub

```bash
git init
git add .
git commit -m "Build SkillProof full-stack MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/skillproof.git
git push -u origin main
```

Do not commit real API keys or `.env` files.
