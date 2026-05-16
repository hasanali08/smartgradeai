from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import database, schemas, auth
from core import llm_engine, vector_store, document_parser

app = FastAPI(title="SmartGradeAI API v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Recreate tables (Make sure old DB is deleted or use migrations in prod)
database.Base.metadata.create_all(bind=database.engine)

# ── Auth Endpoints ────────────────────────────────────────────────────────────

@app.post("/signup", response_model=schemas.UserOut)
def signup(user: schemas.UserSignup, db: Session = Depends(database.get_db)):
    if db.query(database.User).filter(database.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = database.User(
        full_name=user.full_name,
        email=user.email,
        password_hash=auth.hash_password(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=schemas.Token)
def login(creds: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(database.User).filter(database.User.email == creds.email).first()
    if not user or not auth.verify_password(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = auth.create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/me", response_model=schemas.UserOut)
def get_me(current_user: database.User = Depends(auth.get_current_user)):
    return current_user

# ── Course Endpoints ──────────────────────────────────────────────────────────

@app.post("/courses/", response_model=schemas.CourseOut)
def create_course(
    course: schemas.CourseCreate, 
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_teacher)
):
    db_course = database.Course(
        name=course.name,
        code=course.code,
        description=course.description,
        teacher_id=current_user.id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@app.get("/courses/", response_model=List[schemas.CourseWithTeacher])
def get_courses(
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    if current_user.role == "teacher":
        return db.query(database.Course).filter(database.Course.teacher_id == current_user.id).all()
    else:
        # Students see courses they are enrolled in, plus they might want to see all to enroll.
        # Let's just return all courses for students so they can enroll.
        return db.query(database.Course).all()

@app.get("/my-courses/", response_model=List[schemas.CourseWithTeacher])
def get_my_courses(
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_student)
):
    enrollments = db.query(database.Enrollment).filter(database.Enrollment.student_id == current_user.id).all()
    return [e.course for e in enrollments]

@app.post("/courses/{course_id}/enroll")
def enroll_in_course(
    course_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_student)
):
    course = db.query(database.Course).filter(database.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    existing = db.query(database.Enrollment).filter(
        database.Enrollment.course_id == course_id,
        database.Enrollment.student_id == current_user.id
    ).first()
    
    if existing:
        return {"message": "Already enrolled"}
        
    enrollment = database.Enrollment(student_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    return {"message": "Enrolled successfully"}

@app.delete("/courses/{course_id}/enroll")
def unenroll_from_course(
    course_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_student)
):
    enrollment = db.query(database.Enrollment).filter(
        database.Enrollment.course_id == course_id,
        database.Enrollment.student_id == current_user.id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")
        
    db.delete(enrollment)
    db.commit()
    return {"message": "Unenrolled successfully"}

@app.put("/courses/{course_id}", response_model=schemas.CourseOut)
def update_course(
    course_id: int,
    course_update: schemas.CourseCreate,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_teacher)
):
    course = db.query(database.Course).filter(database.Course.id == course_id, database.Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized or course not found")
        
    course.name = course_update.name
    course.code = course_update.code
    course.description = course_update.description
    db.commit()
    db.refresh(course)
    return course

@app.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_teacher)
):
    course = db.query(database.Course).filter(database.Course.id == course_id, database.Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized or course not found")
        
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}

# ── Exam Endpoints ────────────────────────────────────────────────────────────

import os
from fastapi import File, UploadFile, Form
import shutil

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/courses/{course_id}/exams/upload", response_model=schemas.ExamOut)
async def upload_exam(
    course_id: int,
    title: str = Form(...),
    max_marks: float = Form(...),
    exam_file: UploadFile = File(...),
    rubric_file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_teacher)
):
    course = db.query(database.Course).filter(database.Course.id == course_id, database.Course.teacher_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized to add exams to this course")

    # Save uploaded files temporarily
    exam_path = os.path.join(UPLOAD_DIR, f"{course_id}_{exam_file.filename}")
    rubric_path = os.path.join(UPLOAD_DIR, f"{course_id}_{rubric_file.filename}")
    
    with open(exam_path, "wb") as buffer:
        shutil.copyfileobj(exam_file.file, buffer)
    with open(rubric_path, "wb") as buffer:
        shutil.copyfileobj(rubric_file.file, buffer)
        
    # Extract text
    exam_text = document_parser.extract_text_from_pdf(exam_path)
    rubric_text = document_parser.extract_text_from_pdf(rubric_path)
    
    if not exam_text or not rubric_text:
        raise HTTPException(status_code=400, detail="Failed to extract text from one or both PDF files.")

    # Save to DB
    db_exam = database.Exam(title=title, description="Uploaded via PDF", course_id=course_id)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    
    db_q = database.Question(
        exam_id=db_exam.id,
        question_text=exam_text,
        rubric_text=rubric_text,
        max_marks=max_marks
    )
    db.add(db_q)
    db.commit()
    db.refresh(db_q)
    
    # Generate model solution instantly in background
    solution = llm_engine.generate_model_solution(exam_text, rubric_text)
    db_q.model_solution = solution
    db.commit()
    
    chunks = document_parser.chunk_text(solution)
    if chunks:
        ids = [f"q_{db_q.id}_sol_{i}" for i in range(len(chunks))]
        metadatas = [{"question_id": db_q.id} for _ in chunks]
        vector_store.add_documents_to_collection("solutions", chunks, ids, metadatas)

    db.refresh(db_exam)
    return db_exam

@app.get("/courses/{course_id}/exams/", response_model=List[schemas.ExamOut])
def get_course_exams(
    course_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    return db.query(database.Exam).filter(database.Exam.course_id == course_id).all()

@app.post("/questions/{question_id}/generate-solution")
def generate_solution(
    question_id: int, 
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_teacher)
):
    question = db.query(database.Question).filter(database.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    solution = llm_engine.generate_model_solution(question.question_text, question.rubric_text)
    question.model_solution = solution
    db.commit()
    
    chunks = document_parser.chunk_text(solution)
    if chunks:
        ids = [f"q_{question_id}_sol_{i}" for i in range(len(chunks))]
        metadatas = [{"question_id": question_id} for _ in chunks]
        vector_store.add_documents_to_collection("solutions", chunks, ids, metadatas)
        
    return {"message": "Solution generated and vectorized successfully", "solution": solution}

# ── Answer Endpoints ──────────────────────────────────────────────────────────

@app.post("/answers/submit", response_model=schemas.AnswerOut)
def submit_answer(
    answer: schemas.AnswerSubmit, 
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_student)
):
    question = db.query(database.Question).filter(database.Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    results = vector_store.query_collection(
        collection_name="solutions",
        query_texts=[answer.answer_text],
        n_results=3
    )
    
    contexts = []
    if results and results.get("documents") and len(results["documents"]) > 0:
        contexts = results["documents"][0]
        
    if not contexts and question.model_solution:
        contexts = [question.model_solution]
        
    evaluation = llm_engine.evaluate_student_answer(answer.answer_text, contexts, question.rubric_text)
    
    score = evaluation.get("score", 0)
    try:
        score = float(score)
        if score > question.max_marks:
            score = question.max_marks
    except ValueError:
        score = 0.0
         
    db_answer = database.StudentAnswer(
        exam_id=answer.exam_id,
        student_id=current_user.id,
        question_id=answer.question_id,
        answer_text=answer.answer_text,
        score=score,
        feedback=evaluation.get("feedback", "No feedback provided")
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    return db_answer

@app.get("/exams/{exam_id}/answers", response_model=List[schemas.AnswerWithStudent])
def get_exam_answers(
    exam_id: int, 
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_teacher)
):
    return db.query(database.StudentAnswer).filter(database.StudentAnswer.exam_id == exam_id).all()

@app.post("/answers/submit/upload", response_model=schemas.AnswerOut)
async def submit_answer_upload(
    exam_id: int = Form(...),
    question_id: int = Form(...),
    solution_file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.require_student)
):
    question = db.query(database.Question).filter(database.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    # Save PDF temporarily
    solution_path = os.path.join(UPLOAD_DIR, f"student_{current_user.id}_exam_{exam_id}.pdf")
    with open(solution_path, "wb") as buffer:
        shutil.copyfileobj(solution_file.file, buffer)
        
    # Extract text
    answer_text = document_parser.extract_text_from_pdf(solution_path)
    if not answer_text:
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF")
        
    results = vector_store.query_collection(
        collection_name="solutions",
        query_texts=[answer_text],
        n_results=3
    )
    
    contexts = []
    if results and results.get("documents") and len(results["documents"]) > 0:
        contexts = results["documents"][0]
        
    if not contexts and question.model_solution:
        contexts = [question.model_solution]
        
    evaluation = llm_engine.evaluate_student_answer(answer_text, contexts, question.rubric_text)
    
    score = evaluation.get("score", 0)
    try:
        score = float(score)
        if score > question.max_marks:
            score = question.max_marks
    except ValueError:
        score = 0.0
         
    # Check if existing answer and update or create new
    db_answer = db.query(database.StudentAnswer).filter(
        database.StudentAnswer.student_id == current_user.id,
        database.StudentAnswer.question_id == question_id
    ).first()
    
    if db_answer:
        db_answer.answer_text = answer_text
        db_answer.score = score
        db_answer.feedback = evaluation.get("feedback", "No feedback provided")
    else:
        db_answer = database.StudentAnswer(
            exam_id=exam_id,
            student_id=current_user.id,
            question_id=question_id,
            answer_text=answer_text,
            score=score,
            feedback=evaluation.get("feedback", "No feedback provided")
        )
        db.add(db_answer)
        
    db.commit()
    db.refresh(db_answer)
    
    return db_answer
