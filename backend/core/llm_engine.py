import google.generativeai as genai
import os
import json

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

MODEL_NAME = "gemini-2.5-flash"

def generate_model_solution(question_text: str, rubric_text: str) -> str:
    """Generates a reference model solution based on the question and rubric."""
    prompt = f"""
You are an expert academic evaluator. Please generate a comprehensive and accurate model answer for the following question, keeping in mind the provided grading rubric.

Question:
{question_text}

Grading Rubric:
{rubric_text}

Provide the model solution clearly and concisely.
"""
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating model solution: {e}")
        return ""

def evaluate_student_answer(student_answer: str, reference_contexts: list[str], rubric_text: str) -> dict:
    """Evaluates a student's answer using the reference contexts and rubric."""
    
    contexts_str = "\n---\n".join(reference_contexts)
    
    prompt = f"""
You are an expert AI grader. Your task is to grade a student's answer based on the provided grading rubric and reference materials. 
Compare the student's answer against the reference materials and evaluate if they met the criteria in the rubric.

Reference Materials (Context):
{contexts_str}

Grading Rubric:
{rubric_text}

Student Answer:
{student_answer}

Provide a JSON response with the following keys strictly:
- "score": The numerical score based on the rubric.
- "feedback": A brief explanation of the score.
"""
    try:
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)
    except Exception as e:
        print(f"Error evaluating student answer: {e}")
        return {"score": 0, "feedback": "Evaluation failed due to an internal error."}
