import os
from typing import Optional
import pymupdf
import docx

def extract_text_from_file(file_path: str) -> str:
    """
    Reused from core/resume_parser.py with support for PDF and DOCX.
    Extracts plain text and cleans whitespace.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    
    try:
        if ext == ".pdf":
            with pymupdf.open(file_path) as doc:
                for page in doc:
                    text += page.get_text("text") + "\n"
        elif ext in [".docx", ".doc"]:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
    except Exception as e:
        raise RuntimeError(f"Failed to parse resume document: {e}")
        
    # Clean up excess whitespace
    text = " ".join(text.split())
    return text
