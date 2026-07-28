from local_ai_chat import generate_local_legal_chat_response


async def chat_with_document(message: str, document_text: str) -> str:
    """Chat with the AI about an uploaded legal document using local AI engine."""
    combined = (
        f"The user uploaded a legal document. Here is the document content:\n\n"
        f"{document_text[:3000]}\n\n"
        f"User question: {message}\n\n"
        f"Answer based on the document and applicable Indian laws."
    )
    return generate_local_legal_chat_response(combined)
