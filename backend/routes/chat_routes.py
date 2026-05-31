from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from chatbot import chat_with_document
from groq_service import general_legal_chat
from models import User
from schemas import ChatRequest, ChatLegalRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/document", response_model=ChatResponse)
async def chat_document_endpoint(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Chat with the AI assistant about an uploaded document."""
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if not body.document_text or not body.document_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No document text provided. Please upload a document first.",
        )

    reply = await chat_with_document(body.message, body.document_text)
    return ChatResponse(reply=reply)


@router.post("/legal", response_model=ChatResponse)
async def chat_legal_endpoint(
    body: ChatLegalRequest,
    current_user: User = Depends(get_current_user),
):
    """General Indian law Q&A chat — not document specific."""
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    history = None
    if body.conversation_history:
        history = [{"role": m.role, "content": m.content} for m in body.conversation_history]

    reply = await general_legal_chat(body.message, history)
    return ChatResponse(reply=reply)
