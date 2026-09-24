from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Task, WorkSession, WorkVersion, Evidence
from ..schemas import SessionIn, VersionIn, CodeIn, MentorIn, CheckIn
from ..services.mentor import mentor_reply
from ..services.evaluator import evaluate

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

def serialize(s):
    return {
        "id": s.id, "status": s.status, "current_code": s.current_code,
        "task": {
            "id": s.task.id, "skill": s.task.skill, "title": s.task.title,
            "difficulty": s.task.difficulty, "estimated_minutes": s.task.estimated_minutes,
            "description": s.task.description, "scenario": s.task.scenario,
            "requirements": s.task.requirements or [], "resource": s.task.resource,
            "starter_code": s.task.starter_code
        },
        "versions": [{"id":v.id,"note":v.note,"created_at":v.created_at} for v in s.versions]
    }

@router.post("")
def start_session(data: SessionIn, db: Session = Depends(get_db)):
    task = db.get(Task, data.task_id)
    if not task: raise HTTPException(404, "Task not found")
    s = WorkSession(task_id=task.id, current_code=task.starter_code)
    db.add(s); db.commit(); db.refresh(s)
    return serialize(s)

@router.get("/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    s = db.get(WorkSession, session_id)
    if not s: raise HTTPException(404, "Session not found")
    return serialize(s)

@router.post("/{session_id}/versions")
def save_version(session_id: int, data: VersionIn, db: Session = Depends(get_db)):
    s = db.get(WorkSession, session_id)
    if not s: raise HTTPException(404, "Session not found")
    s.current_code = data.code
    s.versions.append(WorkVersion(code=data.code, note=data.note))
    db.commit(); db.refresh(s)
    return serialize(s)

@router.post("/{session_id}/run")
def run_code(session_id: int, data: CodeIn, db: Session = Depends(get_db)):
    s = db.get(WorkSession, session_id)
    if not s: raise HTTPException(404, "Session not found")
    # Deliberately does not execute arbitrary student code on the server.
    # This is a safe demo output. A production runner should use a sandbox.
    lines = len(data.code.splitlines())
    return {"output": f"SkillProof sandbox demo\\nReceived {lines} lines of work.\\nExecution is disabled in this MVP; connect a sandboxed runner for real execution."}

@router.post("/{session_id}/mentor")
def mentor(session_id: int, data: MentorIn, db: Session = Depends(get_db)):
    s = db.get(WorkSession, session_id)
    if not s: raise HTTPException(404, "Session not found")
    return {"message": mentor_reply(data.message, s.task.title)}

@router.post("/{session_id}/evaluate")
def evaluate_session(session_id: int, db: Session = Depends(get_db)):
    s = db.get(WorkSession, session_id)
    if not s: raise HTTPException(404, "Session not found")
    return evaluate(s.task, s.current_code)

@router.post("/{session_id}/understanding-check")
def understanding_check(session_id: int, data: CheckIn, db: Session = Depends(get_db)):
    s = db.get(WorkSession, session_id)
    if not s: raise HTTPException(404, "Session not found")
    answers = list(data.answers.values())
    passed = len(answers) >= 2 and all(len(a.strip()) >= 12 for a in answers[:2])
    if passed:
        existing = db.query(Evidence).filter(Evidence.session_id == s.id).first()
        if not existing:
            ev = Evidence(session_id=s.id, task_title=s.task.title, skill=s.task.skill,
                          score=82, capabilities=f"Completed practical work for {s.task.title}; explained decisions and investigated the task requirements.")
            db.add(ev)
        s.status = "demonstrated"
        db.commit()
    return {"passed": passed, "message": "Understanding check passed." if passed else "Please explain your reasoning in more detail."}
