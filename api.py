from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
import shutil
import traceback

from ingestion.cloner import clone_repo
from ingestion.chunker import chunk_repo
from embeddings.embedder import embed_and_store
from rag.pipeline import ask
from voice.speech_to_text import transcribe_audio
from voice.text_to_speech import speak

app = FastAPI(title="Codebase Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class IndexRequest(BaseModel):
    repo_url: str

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list[str]

@app.get("/")
def root():
    return {"status": "ok", "message": "Codebase Assistant API is running"}

@app.post("/index_repo")
def index_repo(request: IndexRequest):
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
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest):
    try:
        result = ask(request.question)
        return QueryResponse(
            question=result["question"],
            answer=result["answer"],
            sources=list(set(result["sources"]))
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice_query")
async def voice_query(audio: UploadFile = File(...)):
    try:
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        with open(tmp.name, "wb") as f:
            shutil.copyfileobj(audio.file, f)
        question = transcribe_audio(tmp.name)
        result = ask(question)
        return {
            "question": question,
            "answer": result["answer"],
            "sources": list(set(result["sources"]))
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speak")
def speak_text(request: QueryRequest):
    try:
        speak(request.question)
        return {"status": "ok", "message": "Speaking..."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))