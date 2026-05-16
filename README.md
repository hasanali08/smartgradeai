# SmartGradeAI

SmartGradeAI is a full-stack educational platform that uses Generative AI to automatically evaluate and grade student PDF solutions against teacher-provided grading rubrics.

## Features
- **Teacher Dashboard**: Create courses, upload PDF exams and grading rubrics, and view AI-graded student scores in a professional data table.
- **Student Dashboard**: Enroll in courses, upload PDF solutions to exams, and instantly view AI-generated scores and detailed feedback.
- **AI Integration**: Automatically extracts text from uploaded PDFs and evaluates them using the Gemini AI API.

## Project Structure
- `backend/`: FastAPI Python backend for managing database operations, PDF processing, and AI integrations.
- `frontend/`: React + Vite frontend styled with Tailwind CSS for a highly responsive, modern user experience.

## Running the Application

### 1. Setup Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   # On Windows
   .\venv\Scripts\activate
   ```
3. Ensure you have your `.env` file set up with your Gemini API key:
   ```
   GEMINI_API_KEY="your_api_key_here"
   ```
4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL provided in the terminal (usually `http://localhost:5173`).

## Important Security Note
**Never commit your `.env` file or API keys to version control!** 
If your API key was leaked, Google will automatically disable it with a `403` error. You must generate a new API key from [Google AI Studio](https://aistudio.google.com/) and update your local `.env` file. A `.gitignore` file has been provided to prevent this from happening in the future.
