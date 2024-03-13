from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from torch import mode
import uvicorn

import chromadb
from chromadb.utils import embedding_functions

import hashlib

import time

# Embedding = embedding_functions.SentenceTransformerEmbeddingFunction(
#     model_name="all-mpnet-base-v2"
# )

chroma_client = chromadb.HttpClient(host="localhost", port=8000, ssl=False)
# collection = chroma_client.get_or_create_collection(
#     name="findit", metadata={"data": "documents"}, embedding_function=Embedding
# )
collection = chroma_client.get_collection(name="findit")


class NewDocument(BaseModel):
    content: str


app = FastAPI(title="FindIt", description="FindIt API")

SITE_PATH = "../findit-frontend/dist"

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/api/documents/{fields}")
async def documents(fields: str):
    # Fields should be comma separated. Eg: fields="data,documents,title,ids"
    if len(fields) > 0:
        fieldsArray: list[str] = fields.split(",")
        results = collection.get(include=fieldsArray)
        return results
    return {"Error": "Fields header not found"}, 400


@app.post("/api/new-document")
async def new_document(document: NewDocument):
    doc = collection.add(
        ids=[hashlib.sha1(document.content.encode()).hexdigest()],
        documents=[document.content],
    )
    return doc


# This function has to be defined after all the other routes
app.mount("/", StaticFiles(directory=SITE_PATH, html=True), name="frontend")
