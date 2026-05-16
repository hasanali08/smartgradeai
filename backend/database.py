from sqlalchemy import create_engine, Column, Integer, String, Text, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import datetime
import os

DB_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DB_DIR, exist_ok=True)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DB_DIR, 'smartgradeai.db')}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Models ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    full_name     = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role          = Column(Enum("teacher", "student", name="user_role"), nullable=False)
    created_at    = Column(DateTime, default=datetime.datetime.utcnow)

    courses_taught    = relationship("Course", back_populates="teacher")
    enrollments       = relationship("Enrollment", back_populates="student")


class Course(Base):
    __tablename__ = "courses"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    code        = Column(String, nullable=False)  # e.g. CS-301
    description = Column(Text, nullable=True)
    teacher_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    teacher     = relationship("User", back_populates="courses_taught")
    exams       = relationship("Exam", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class Enrollment(Base):
    """Many-to-many between students and courses."""
    __tablename__ = "enrollments"
    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id  = Column(Integer, ForeignKey("courses.id"), nullable=False)
    joined_at  = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="enrollments")
    course  = relationship("Course", back_populates="enrollments")


class Exam(Base):
    __tablename__ = "exams"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    course_id   = Column(Integer, ForeignKey("courses.id"), nullable=False)
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

    course    = relationship("Course", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    answers   = relationship("StudentAnswer", back_populates="exam", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"
    id             = Column(Integer, primary_key=True, index=True)
    exam_id        = Column(Integer, ForeignKey("exams.id"), nullable=False)
    question_text  = Column(Text, nullable=False)
    rubric_text    = Column(Text, nullable=False)
    max_marks      = Column(Float, nullable=False)
    model_solution = Column(Text, nullable=True)

    exam = relationship("Exam", back_populates="questions")


class StudentAnswer(Base):
    __tablename__ = "student_answers"
    id           = Column(Integer, primary_key=True, index=True)
    exam_id      = Column(Integer, ForeignKey("exams.id"), nullable=False)
    student_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id  = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer_text  = Column(Text, nullable=False)
    score        = Column(Float, nullable=True)
    feedback     = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    exam     = relationship("Exam", back_populates="answers")
    student  = relationship("User")
    question = relationship("Question")


# ── DB helpers ─────────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
