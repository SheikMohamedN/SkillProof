from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .seed import seed
from .routers import profile, tasks, sessions, evidence

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed(db)

app = FastAPI(title="SkillProof API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(tasks.router)
app.include_router(sessions.router)
app.include_router(evidence.router)

@app.get("/")
def root():
    return {"name": "SkillProof API", "status": "running"}

@app.get("/api/health")
def health():
    return {"ok": True}
