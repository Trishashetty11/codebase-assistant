from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
import shutil

from ingestion.cloner import clone_repo
from ingestion.chunker import chunk_repo
from embeddings.embedder import embed_and_store
from rag.pipeline import ask
from voice.speech_to_text import transcribe_audio
from voice.text_to_speech import speak

app = FastAPI(title="Codebase Assistant API")

# Why CORS? So the React frontend (Phase 3) can talk to this API
# without getting blocked by the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request/Response models ---
# Why Pydantic models? They validate incoming data automatically
# and give clear error messages if something is wrong

class IndexRequest(BaseModel):
    repo_url: str

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list[str]

# --- Endpoints ---

@app.get("/")
def root():
    """Health check — visit this to confirm API is running"""
    return {"status": "ok", "message": "Codebase Assistant API is running"}


@app.post("/index_repo")
def index_repo(request: IndexRequest):
    """
    Clone and index a GitHub repo.
    Why POST? We're sending data (the URL) and triggering an action.
    """
    try:
        print(f"Indexing {request.repo_url}...")
        repo_path = clone_repo(request.repo_url)
        chunks = chunk_repo(repo_path)
        embed_and_store(chunks)
        return {
            "status": "success",
            "message": f"Indexed {request.repo_url}",
            "chunks": len(chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest):
    """
    Ask a text question about the indexed codebase.
    This is the main endpoint the UI chat box will call.
    """
    try:
        result = ask(request.question)
        return QueryResponse(
            question=result["question"],
            answer=result["answer"],
            sources=list(set(result["sources"]))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/voice_query")
async def voice_query(audio: UploadFile = File(...)):
    """
    Accept an audio file, transcribe it, run RAG, return answer.
    Why UploadFile? The frontend will send a recorded audio blob.
    """
    try:
        # Save uploaded audio to a temp file
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        with open(tmp.name, "wb") as f:
            shutil.copyfileobj(audio.file, f)

        # Transcribe audio to text
        question = transcribe_audio(tmp.name)

        # Run RAG pipeline
        result = ask(question)

        return {
            "question": question,
            "answer": result["answer"],
            "sources": list(set(result["sources"]))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/speak")
def speak_text(request: QueryRequest):
    """
    Convert text to speech and play it on the server.
    Why? For desktop use — the server speaks the answer aloud.
    """
    try:
        speak(request.question)
        return {"status": "ok", "message": "Speaking..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))