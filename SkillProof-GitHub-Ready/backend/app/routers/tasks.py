from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Task
from ..schemas import TaskIn

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

def serialize(t):
    return {
        "id": t.id, "skill": t.skill, "title": t.title, "difficulty": t.difficulty,
        "estimated_minutes": t.estimated_minutes, "description": t.description,
        "scenario": t.scenario, "requirements": t.requirements or [],
        "resource": t.resource, "starter_code": t.starter_code,
        "evaluation_criteria": t.evaluation_criteria or {}
    }

@router.get("")
def list_tasks(db: Session = Depends(get_db)):
    return [serialize(t) for t in db.query(Task).filter(Task.published == 1).order_by(Task.id).all()]

@router.get("/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    t = db.get(Task, task_id)
    if not t: raise HTTPException(404, "Task not found")
    return serialize(t)

@router.post("")
def create_task(data: TaskIn, db: Session = Depends(get_db)):
    t = Task(**data.model_dump())
    db.add(t); db.commit(); db.refresh(t)
    return serialize(t)
