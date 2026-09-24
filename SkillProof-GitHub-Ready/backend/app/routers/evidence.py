from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Evidence

router = APIRouter(prefix="/api/evidence", tags=["evidence"])

@router.get("")
def list_evidence(db: Session = Depends(get_db)):
    rows = db.query(Evidence).order_by(Evidence.created_at.desc()).all()
    return [{
        "id": e.id, "session_id": e.session_id, "task_title": e.task_title,
        "skill": e.skill, "score": e.score, "capabilities": e.capabilities,
        "created_at": e.created_at.isoformat()
    } for e in rows]
