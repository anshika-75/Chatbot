import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "smartflo_docs.txt")
EMBEDDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "embeddings")

# Prompt template — strictly restricts answers to provided context but uses a consultative tone
SYSTEM_PROMPT = (
    "You are an expert, highly conversational, and consultative customer success agent for Smartflo. "
    "Your goal is to guide the user step-by-step like a human expert, using natural language. "
    "Do not just dump a wall of text. Read the provided context, understand their goal, and walk them through it interactively. "
    "Always start by explicitly mentioning any prerequisites needed for their task (for example, if they want to create an IVR, gently remind them they need to upload a system recording first). "
    "Explain concepts simply (e.g. 'an IVR is a system where callers press keypad options...'). "
    "Conclude your answers by inviting them to share their specific business flow so you can guide them exactly on how to build it (e.g. 'Tell me your flow and I will guide you step-by-step, including advanced topics like nested IVRs!'). "
    "Use strictly the provided context to answer the question. If the answer is not found, politely say 'This information is not available in my documentation currently.'\n\n"
    "Context:\n{context}"
)


def load_and_split_docs():
    """Load the Smartflo documentation text file and split it into chunks."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Documentation file not found at {DATA_PATH}")
        
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw_text = f.read()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    docs = text_splitter.create_documents([raw_text])
    return docs


def get_or_create_vectorstore(docs):
    """Load existing FAISS index or create a new one from documents."""
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    if os.path.exists(os.path.join(EMBEDDINGS_DIR, "index.faiss")):
        print("📂 Loading existing FAISS index...")
        vectorstore = FAISS.load_local(EMBEDDINGS_DIR, embeddings, allow_dangerous_deserialization=True)
    else:
        print("🔨 Creating new FAISS index from documents...")
        vectorstore = FAISS.from_documents(docs, embeddings)
        os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
        vectorstore.save_local(EMBEDDINGS_DIR)
        print(f"💾 FAISS index saved to {EMBEDDINGS_DIR}")

    return vectorstore


def get_rag_chain():
    """Build and return the full RAG chain using LCEL (modern way)."""
    docs = load_and_split_docs()
    vectorstore = get_or_create_vectorstore(docs)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

    llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain
