import chromadb
from chromadb.utils import embedding_functions
import uuid

from pydantic import UUID5

ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-mpnet-base-v2"
)

chroma_client = chromadb.HttpClient(host="localhost", port=8000, ssl=False)
collection = chroma_client.get_or_create_collection(
    name="findit", embedding_function=ef
)

collection.add(
    ids=["2"],
    metadatas=[
        {
            "title": "title 1",
            "starred": True,
            "color": "red",
        }
    ],
    documents=["Doc 1"],
)
