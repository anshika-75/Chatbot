"""
Standalone ingestion script.
Scrapes Smartflo documentation from the web, creates HuggingFace embeddings,
and saves a FAISS vector index for offline / alternative use.

Usage:
    python ingest.py
"""

from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Load Smartflo docs
loader = WebBaseLoader("https://docs.smartflo.tatatelebusiness.com/docs/getting-started")
documents = loader.load()

# Split text
text_splitter = CharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

docs = text_splitter.split_documents(documents)

# HuggingFace embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Create FAISS DB
db = FAISS.from_documents(docs, embeddings)

# Save
db.save_local("faiss_index")

print("✅ Embeddings created and saved to faiss_index/")
