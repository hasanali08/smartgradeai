from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional, List
import datetime

# ── Auth ───────────────────────────────────────────────────────────────────────

class UserSignup(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str  # "teacher" | "student"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("teacher", "student"):
            raise ValueError("role must be 'teacher' or 'student'")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ── Courses ────────────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class CourseOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str]
    teacher_id: int
    created_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class CourseWithTeacher(CourseOut):
    teacher: Optional[UserOut] = None

# ── Exams ──────────────────────────────────────────────────────────────────────

class QuestionCreate(BaseModel):
    question_text: str
    rubric_text: str
    max_marks: float

class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    course_id: int
    questions: List[QuestionCreate]

class QuestionOut(BaseModel):
    id: int
    question_text: str
    rubric_text: str
    max_marks: float
    model_solution: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ExamOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    course_id: int
    created_at: datetime.datetime
    questions: List[QuestionOut] = []
    model_config = ConfigDict(from_attributes=True)

# ── Answers ────────────────────────────────────────────────────────────────────

class AnswerSubmit(BaseModel):
    exam_id: int
    question_id: int
    answer_text: str

class AnswerOut(BaseModel):
    id: int
    exam_id: int
    student_id: int
    question_id: int
    score: Optional[float]
    feedback: Optional[str]
    submitted_at: datetime.datetime
    model_config = ConfigDict(from_attributes=True)

class AnswerWithStudent(AnswerOut):
    student: Optional[UserOut] = None
