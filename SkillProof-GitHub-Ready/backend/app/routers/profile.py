from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Profile
from ..schemas import ProfileIn

router = APIRouter(prefix="/api/profile", tags=["profile"])

@router.get("")
def get_profile(db: Session = Depends(get_db)):
    return db.query(Profile).first()

@router.put("")
def update_profile(data: ProfileIn, db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    for k, v in data.model_dump().items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile
