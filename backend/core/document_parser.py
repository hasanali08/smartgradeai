import pypdf
import re

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from a PDF file."""
    try:
        reader = pypdf.PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Splits text into smaller chunks with overlap for embedding."""
    # Simple whitespace-based tokenization for chunking
    words = text.split()
    chunks = []
    
    if not words:
        return chunks
        
    for i in range(0, len(words), chunk_size - overlap):
        chunk_words = words[i:i + chunk_size]
        chunks.append(" ".join(chunk_words))
        if i + chunk_size >= len(words):
            break
            
    return chunks
