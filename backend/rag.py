import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "smartflo_docs.txt")
EMBEDDINGS_DIR = os.path.join(os.path.dirname(__file__), "..", "embeddings")

# Prompt template — strictly restricts answers to provided context
PROMPT_TEMPLATE = """You are a helpful assistant that answers questions about Smartflo documentation.
Use ONLY the following context to answer the question. If the answer is not found in the context,
respond with: "This information is not available in the documentation."

Context:
{context}

Question: {question}

Answer:"""


def load_and_split_docs():
    """Load the Smartflo documentation text file and split it into chunks."""
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
    """Build and return the full RAG chain."""
    docs = load_and_split_docs()
    vectorstore = get_or_create_vectorstore(docs)

    prompt = PromptTemplate(
        template=PROMPT_TEMPLATE,
        input_variables=["context", "question"],
    )

    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        return_source_documents=False,
        chain_type_kwargs={"prompt": prompt},
    )

    return chain
