from typing import Optional
from unittest.mock import Base
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

Embedding = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-mpnet-base-v2"
)

chroma_client = chromadb.HttpClient(host="localhost", port=8000, ssl=False)
collection = chroma_client.get_or_create_collection(
    name="semantic", metadata={"data": "documents"}, embedding_function=Embedding
)
# collection = chroma_client.get_collection(name="semantic")


class DocumentRecord(BaseModel):
    title: str
    content: str
    # color: Optional[str] = None
    # starred: Optional[bool] = None


app = FastAPI(title="semantic", description="semantic API")

SITE_PATH = "../semantic-frontend/dist"

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


@app.get("/api/document-count")
async def documents_count():
    return {"count": collection.count()}


@app.get("/api/document-content/{id}")
async def document(id: str):
    return collection.get(ids=[id], include=["documents"])


@app.get("/api/document-fields/{fields}")
async def documents(fields: str):
    # Fields should be comma separated. Eg: fields="data,documents,title,ids"
    if len(fields) > 0:
        fieldsArray: list[str] = fields.split(",")
        results = collection.get(include=fieldsArray)
        return results
    return {"Error": "Fields header not found"}, 400


# TODO: Change the new-document route to save-document route.
# Keep a cache of existing document ids
# If incoming id don't exist, create new. Otherwise, update id


@app.post("/api/new-document/{id}")
async def new_document(id: str, document: DocumentRecord):
    print(id, document.model_dump())
    doc = collection.add(
        ids=[id],
        documents=[document.content],
        metadatas=[
            {
                "title": document.title,
            }
        ],
    )
    return doc


# This function has to be defined after all the other routes
app.mount("/", StaticFiles(directory=SITE_PATH, html=True), name="frontend")
