import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
from rag import get_rag_chain

load_dotenv()

app = FastAPI(title="Smartflo Documentation Chatbot API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str
    image_base64: Optional[str] = None


class ChatResponse(BaseModel):
    response: str


# Initialize the RAG chain on startup
rag_chain = None


@app.on_event("startup")
async def startup_event():
    global rag_chain
    print("🔄 Initializing RAG pipeline...")
    rag_chain = get_rag_chain()
    print("✅ RAG pipeline ready!")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a user query using the RAG pipeline and return a response."""
    if rag_chain is None:
        return ChatResponse(response="The server is still initializing. Please try again in a moment.")

    if request.image_base64:
        from rag import get_vision_rag_response
        result = get_vision_rag_response(request.query, request.image_base64)
        return ChatResponse(response=result)
    else:
        result = rag_chain.invoke({"input": request.query})
        return ChatResponse(response=result["answer"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "rag_initialized": rag_chain is not None}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
