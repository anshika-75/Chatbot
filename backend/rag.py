import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "smartflo_docs.txt")
EMBEDDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "embeddings")

# Prompt template — strictly restricts answers to provided context
SYSTEM_PROMPT = (
    "You are a helpful assistant for Smartflo documentation queries. "
    "Use strictly the provided context to answer the question. "
    "If the answer is not found in the context, respond with: "
    "'This information is not available in the documentation.'\n\n"
    "Context:\n{context}"
)


def load_and_split_docs():
    """Load the Smartflo documentation text file and split it into chunks."""
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Documentation file not found at {DATA_PATH}")
        
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw_text = f.read()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    docs = text_splitter.create_documents([raw_text])
    return docs


def get_or_create_vectorstore(docs):
    """Load existing FAISS index or create a new one from documents."""
    embeddings = OpenAIEmbeddings()

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
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain
