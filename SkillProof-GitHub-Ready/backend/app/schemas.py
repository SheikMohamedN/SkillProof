from typing import Any
from pydantic import BaseModel, ConfigDict

class ProfileIn(BaseModel):
    name: str
    degree: str = ""
    college: str = ""
    email: str = ""
    linkedin: str = ""
    github: str = ""
    about: str = ""

class TaskIn(BaseModel):
    skill: str
    title: str
    difficulty: str = "Beginner"
    estimated_minutes: int = 30
    description: str = ""
    scenario: str = ""
    requirements: list[str] = []
    resource: str = ""
    starter_code: str = ""
    evaluation_criteria: dict[str, str] = {}

class SessionIn(BaseModel):
    task_id: int

class VersionIn(BaseModel):
    code: str
    note: str = ""

class CodeIn(BaseModel):
    code: str

class MentorIn(BaseModel):
    message: str

class CheckIn(BaseModel):
    answers: dict[str, str] = {}
