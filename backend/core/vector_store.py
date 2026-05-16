import chromadb
import chromadb.api.types
from sentence_transformers import SentenceTransformer
import os

# Initialize the embedding model locally
model_name = 'all-MiniLM-L6-v2'
try:
    embedding_model = SentenceTransformer(model_name)
except Exception as e:
    print(f"Error loading embedding model: {e}")
    embedding_model = None

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
chroma_client = chromadb.PersistentClient(path=DB_DIR)

class LocalEmbeddingFunction(chromadb.api.types.EmbeddingFunction):
    def __call__(self, input: chromadb.api.types.Documents) -> chromadb.api.types.Embeddings:
        if not embedding_model:
            raise RuntimeError("Embedding model not loaded")
        embeddings = embedding_model.encode(input).tolist()
        return embeddings

local_ef = LocalEmbeddingFunction()

def get_or_create_collection(collection_name: str):
    return chroma_client.get_or_create_collection(
        name=collection_name, 
        embedding_function=local_ef
    )

def add_documents_to_collection(collection_name: str, documents: list[str], ids: list[str], metadatas: list[dict] = None):
    collection = get_or_create_collection(collection_name)
    collection.add(
        documents=documents,
        ids=ids,
        metadatas=metadatas
    )

def query_collection(collection_name: str, query_texts: list[str], n_results: int = 3):
    collection = get_or_create_collection(collection_name)
    results = collection.query(
        query_texts=query_texts,
        n_results=n_results
    )
    return results
