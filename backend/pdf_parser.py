import fitz
from fastapi import HTTPException


def extract_text(file_bytes: bytes) -> str:
    """
    Extract text from a PDF file provided as raw bytes.
    Uses PyMuPDF (fitz) to iterate all pages and join their text.
    Raises HTTPException if the PDF is corrupt or contains no extractable text.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text()
            if page_text:
                text_parts.append(page_text)
        doc.close()
        full_text = "\n".join(text_parts).strip()

        if len(full_text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text. Please upload a text-based PDF, not a scanned image.",
            )

        return full_text

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse PDF: {str(e)}. Please upload a valid PDF file.",
        )
