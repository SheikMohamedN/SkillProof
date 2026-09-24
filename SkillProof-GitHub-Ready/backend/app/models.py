from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    degree = Column(String(120), default="")
    college = Column(String(180), default="")
    email = Column(String(180), default="")
    linkedin = Column(String(300), default="")
    github = Column(String(300), default="")
    about = Column(Text, default="")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    skill = Column(String(80), nullable=False)
    title = Column(String(180), nullable=False)
    difficulty = Column(String(40), default="Beginner")
    estimated_minutes = Column(Integer, default=30)
    description = Column(Text, default="")
    scenario = Column(Text, default="")
    requirements = Column(JSON, default=list)
    resource = Column(String(300), default="")
    starter_code = Column(Text, default="")
    evaluation_criteria = Column(JSON, default=dict)
    published = Column(Integer, default=1)

class WorkSession(Base):
    __tablename__ = "work_sessions"
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    status = Column(String(40), default="active")
    current_code = Column(Text, default="")
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    task = relationship("Task")
    versions = relationship("WorkVersion", cascade="all, delete-orphan")

class WorkVersion(Base):
    __tablename__ = "work_versions"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("work_sessions.id"), nullable=False)
    code = Column(Text, default="")
    note = Column(String(300), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("work_sessions.id"), nullable=False)
    task_title = Column(String(180), nullable=False)
    skill = Column(String(80), nullable=False)
    score = Column(Integer, default=0)
    capabilities = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
