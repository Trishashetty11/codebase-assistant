# AI Codebase Assistant

An end-to-end AI system that lets you query any GitHub repository using natural language — powered by RAG, Voice Interface, and deployed with Docker.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Render](https://img.shields.io/badge/Deployed-Render-purple)

## Live Demo
- **API:** https://codebase-assistant-vvax.onrender.com/docs
- **Frontend:** Coming soon on Vercel

---

## What is this?

Most developers struggle to understand large, unfamiliar codebases quickly. This project solves that by letting you:

- Ask natural language questions about any GitHub repository
- Use your voice to query the codebase
- See exactly which files the answer came from
- Deploy anywhere using Docker

Instead of spending hours reading code, just ask "How does authentication work in this repo?" and get an instant, accurate answer.

---

## System Architecture
```
User Query (Text or Voice)
        |
   React Frontend
        |
   FastAPI Backend
        |
   RAG Pipeline
        |
   1. Embed Query
   2. Vector Search in ChromaDB
   3. Retrieve Top Code Chunks
   4. LLM Generates Answer
        |
   Response with Source Files
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| LangChain | RAG pipeline orchestration |
| ChromaDB | Vector database for code embeddings |
| sentence-transformers | Code embedding model (all-MiniLM-L6-v2) |
| Ollama + TinyLlama | Local LLM inference |
| OpenAI Whisper | Speech to text for voice queries |
| GitPython | GitHub repository cloning |
| MLflow | Experiment tracking and monitoring |

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | Frontend framework |
| Axios | API communication |
| Web Speech API | Browser voice recording |

### DevOps
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Render | Backend cloud deployment |
| Vercel | Frontend deployment |

---

## Features

- RAG Pipeline — Retrieval Augmented Generation for accurate code answers
- Semantic Search — Finds relevant code by meaning, not just keywords
- Voice Interface — Ask questions using your microphone
- Source Citations — Every answer shows which files it came from
- Any GitHub Repo — Index and query any public repository
- REST API — Full FastAPI backend with auto-generated docs
- Docker — Containerized for easy deployment
- Dark Purple UI — Clean, modern React interface
- MLflow Tracking — Monitor query performance and model metrics

---

## Project Structure
```
codebase-assistant/
├── ingestion/
│   ├── cloner.py          # GitHub repo cloning
│   └── chunker.py         # Code file chunking
├── embeddings/
│   └── embedder.py        # Vector embeddings + ChromaDB
├── retrieval/
│   └── retriever.py       # Semantic similarity search
├── rag/
│   └── pipeline.py        # RAG pipeline + MLflow tracking
├── voice/
│   ├── speech_to_text.py  # Whisper STT
│   └── text_to_speech.py  # TTS
├── frontend/
│   └── src/
│       └── App.jsx        # React chat UI
├── api.py                 # FastAPI endpoints
├── main.py                # CLI entry point
├── Dockerfile             # Docker configuration
└── requirements.txt       # Python dependencies
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Ollama installed (https://ollama.com)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Trishashetty11/codebase-assistant.git
cd codebase-assistant
```

### 2. Set up Python environment
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Pull the LLM model
```bash
ollama pull tinyllama
```

### 4. Start the backend
```bash
uvicorn api:app --reload --port 8000
```

### 5. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Open the app
Visit http://localhost:5173 and index any GitHub repository.

---

## Docker Setup
```bash
# Build the image
docker build -t codebase-assistant .

# Run the container
docker run -p 8000:8000 codebase-assistant
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | / | Health check |
| POST | /index_repo | Clone and index a GitHub repo |
| POST | /query | Ask a text question |
| POST | /voice_query | Ask a voice question (audio file) |
| POST | /speak | Convert text to speech |

Full API docs available at /docs when running.

---

## How RAG Works

1. Indexing — The repo is cloned, split into 1500-character chunks, and embedded using all-MiniLM-L6-v2
2. Storage — Embeddings stored in ChromaDB with file metadata
3. Query — User question is embedded with the same model
4. Retrieval — Top 5 most similar chunks found via cosine similarity
5. Generation — Chunks passed as context to TinyLlama which generates the answer

---

## MLflow Tracking

Every query is tracked with response time, chunks retrieved, average similarity score, LLM inference time, and answer length.

Run the MLflow dashboard:
```bash
mlflow ui
```
Then visit http://127.0.0.1:5000

---

## Future Improvements

- Support private GitHub repositories
- Add authentication
- Multi-repo support
- Better chunking using Tree-sitter AST parsing
- GPT-4 / Claude API integration
- Streaming responses
- Answer caching

---

## Built By

Trisha Shetty — AI/ML Engineer

Built with entirely free and open-source tools as a demonstration of end-to-end AI system design including RAG, embeddings, vector databases, voice interfaces, and MLOps practices.

---

## License

MIT License — feel free to use this project for learning and building.