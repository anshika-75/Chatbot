# 🤖 Smartflo Documentation AI Chatbot

A **Retrieval-Augmented Generation (RAG)** chatbot that answers questions exclusively from [Smartflo's Getting Started documentation](https://docs.smartflo.tatatelebusiness.com/docs/getting-started). Built with **FastAPI**, **LangChain**, **FAISS**, and a **React + Vite** frontend.

![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-RAG-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)
- [Sample Queries](#sample-queries)
- [How It Works](#how-it-works)
- [Screenshots](#screenshots)
- [License](#license)

---

## 🔭 Overview

This project demonstrates a production-style **RAG (Retrieval-Augmented Generation)** chatbot. Instead of relying on the LLM's general knowledge, it retrieves relevant passages from Smartflo's documentation and uses them as context to generate accurate, grounded answers — eliminating hallucinations.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **RAG Pipeline** | Documents are chunked, embedded via OpenAI, and stored in a FAISS vector index for fast similarity search. |
| 🔒 **No Hallucinations** | The prompt is strictly engineered — if the answer isn't in the docs, it says: *"This information is not available in the documentation."* |
| ⚡ **FastAPI Backend** | Lightweight, async Python API with a `/chat` endpoint and auto-generated Swagger docs at `/docs`. |
| 💬 **Modern Chat UI** | Clean, responsive React interface styled with TailwindCSS — auto-scrolling, loading indicators, keyboard shortcuts. |
| 📦 **Persistent Embeddings** | FAISS index is created once and cached to disk. Subsequent startups skip the embedding step entirely. |
| 🔄 **CORS Enabled** | Frontend and backend can run on separate ports during development without issues. |

---

## 🏗 Architecture

```
┌─────────────────┐     POST /chat      ┌──────────────────────────────────┐
│                 │ ──────────────────▶  │          FastAPI Backend         │
│   React + Vite  │                      │                                  │
│   (Frontend)    │ ◀──────────────────  │  ┌────────┐    ┌─────────────┐  │
│   Port 5173     │     JSON response    │  │  FAISS │◀──▶│  LangChain  │  │
│                 │                      │  │  Index  │    │  RAG Chain  │  │
└─────────────────┘                      │  └────────┘    └──────┬──────┘  │
                                         │                       │         │
                                         │               ┌──────▼──────┐  │
                                         │               │   OpenAI    │  │
                                         │               │   GPT-3.5   │  │
                                         │               └─────────────┘  │
                                         │          Port 8000              │
                                         └──────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.9+** | Core backend language |
| **FastAPI** | REST API framework |
| **LangChain** | RAG orchestration — text splitting, chain building, prompt management |
| **OpenAI API** | Embeddings (`text-embedding-ada-002`) and LLM (`gpt-3.5-turbo`) |
| **FAISS** | Local vector database for fast similarity search |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** | Build tool and dev server |
| **TailwindCSS** | Utility-first CSS framework |
| **Axios** | HTTP client for API calls |
| **Lucide React** | Icon library (Bot, User, Send, Loader icons) |

---

## 📁 Project Structure

```
smartflo-chatbot/
├── README.md                    # Project documentation (this file)
├── .gitignore                   # Git ignore rules
│
├── data/
│   └── smartflo_docs.txt        # Smartflo documentation (source of truth)
│
├── embeddings/                  # Auto-generated FAISS index (gitignored)
│
├── backend/
│   ├── main.py                  # FastAPI app — endpoints & server startup
│   ├── rag.py                   # LangChain RAG pipeline — chunking, embeddings, chain
│   ├── ingest.py                # Standalone script to scrape & embed docs from web
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variable template
│
└── frontend/
    ├── index.html               # HTML entry point
    ├── package.json             # Node.js dependencies
    ├── vite.config.js           # Vite configuration
    ├── tailwind.config.js       # TailwindCSS configuration
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Chat UI component
        └── index.css            # TailwindCSS base styles
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.9+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **OpenAI API Key** — [Get one here](https://platform.openai.com/api-keys)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/anshika-75/Chatbot.git
cd Chatbot
```

### 2️⃣ Setup Backend

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your actual OpenAI API key
```

### 3️⃣ Start the Backend Server

```bash
# From inside backend/ with venv activated
python main.py
```

> The server starts at **http://localhost:8000**. On first run, it processes `data/smartflo_docs.txt`, generates vector embeddings, and caches them in `embeddings/`.

### 4️⃣ Setup & Start Frontend

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

> The frontend runs at **http://localhost:5173**. Open it in your browser and start chatting!

---

## 📡 API Reference

### `POST /chat`

Send a question and receive an AI-generated answer from Smartflo docs.

**Request:**
```json
{
  "query": "How do I log in for the first time?"
}
```

**Response:**
```json
{
  "response": "If you are logging into the Smartflo portal for the first time, please check your email for your login details. Your welcome email includes both your login credentials and the URL to access the Smartflo portal..."
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "rag_initialized": true
}
```

### Interactive API Docs

FastAPI auto-generates Swagger docs at: **http://localhost:8000/docs**

---

## 🧪 Sample Queries

### ✅ Expected Answers (from documentation)

| # | Query | Expected Behavior |
|---|---|---|
| 1 | *"How do I log in for the first time?"* | Returns login steps from the docs |
| 2 | *"What should I do if my account is locked after failed login attempts?"* | Returns password reset instructions |
| 3 | *"What is included in the Smartflo dashboard?"* | Returns dashboard overview details |
| 4 | *"What CRM platforms can Smartflo integrate with?"* | Lists Zoho, Salesforce, Freshdesk, HubSpot, etc. |

### ❌ Expected Fallbacks (outside documentation)

| # | Query | Expected Response |
|---|---|---|
| 5 | *"How do I bake a chocolate cake?"* | *"This information is not available in the documentation."* |
| 6 | *"Can Smartflo install on-premise hardware?"* | *"This information is not available in the documentation."* |

---

## ⚙️ How It Works

1. **Document Loading** — `smartflo_docs.txt` is read from the `data/` directory.
2. **Text Splitting** — `RecursiveCharacterTextSplitter` breaks the text into 500-character chunks with 50-character overlap for context continuity.
3. **Embedding Generation** — Each chunk is converted to a vector using OpenAI's embedding model (`text-embedding-ada-002`).
4. **Vector Storage** — Vectors are stored in a local **FAISS** index and cached to disk for fast subsequent loads.
5. **Query Processing** — When a user sends a question:
   - The query is embedded using the same model.
   - FAISS performs a similarity search to find the top 3 most relevant chunks.
   - The chunks are injected into a prompt template as context.
   - **GPT-3.5-turbo** generates a response strictly from the provided context.
6. **Response** — The answer is sent back to the React frontend and displayed in the chat UI.

```
User Query → Embed → FAISS Search → Top-K Chunks → Prompt + LLM → Answer
```

---

## 📸 Screenshots

> *Run the app locally to see the chat interface in action!*

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/anshika-75">Anshika</a>
</p>
