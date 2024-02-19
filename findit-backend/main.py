from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from torch import mode
import uvicorn

import chromadb
from chromadb.utils import embedding_functions

import hashlib

chroma_client = chromadb.HttpClient(host="localhost", port="8000", ssl=False)
collection = chroma_client.get_or_create_collection(
    name="findit",
    metadata={"data": "documents"},
    embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-mpnet-base-v2"
    ),
)


class NewDocument(BaseModel):
    content: str


app = FastAPI(debug=True, title="FindIt", description="FindIt API")

SITE_PATH = "../findit-frontend/dist"


@app.get("/api/search")
async def search(q: str):
    results = collection.query(
        query_texts=[q],
        n_results=5,
        include=["data", "distances", "documents"],
    )
    print(results)
    return results


@app.get("/api/documents/count")
async def documents_count():
    return {"count": collection.count()}


@app.post("/api/new-document")
async def new_document(document: NewDocument):
    doc = collection.add(
        ids=[hashlib.sha1(document.content.encode()).hexdigest()],
        documents=[document.content],
    )
    return doc


# This function has to be defined after all the other routes
app.mount("/", StaticFiles(directory=SITE_PATH, html=True), name="frontend")

uvicorn.run(app, host="localhost", port=8080)
