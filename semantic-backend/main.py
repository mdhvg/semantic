import schemas
import asyncio
from fastapi import FastAPI, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from torch import mode

import chromadb
from chromadb.utils import embedding_functions

import time


class SemanticAPI:
    def __init__(self):
        self.app = FastAPI(
            title="semantic",
            description="Semantic API",
        )
        self.SITE_PATH = "../semantic-frontend/dist"
        self.server_host = "localhost"
        self.server_port = 8000
        self.allowed_origins = [
            "http://localhost:3000",
            "http://localhost:5173",
        ]
        self.setup_middleware()
        asyncio.create_task(self.load_collection())
        asyncio.create_task(self.get_ids())

    def setup_middleware(self):
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=self.allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    async def get_ids(self):
        self.ids = set(self.collection.get(include=[])["ids"])

    async def load_collection(self):
        start = time.time()
        self.embedding = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-mpnet-base-v2"
        )

        self.chroma_client = chromadb.HttpClient(
            host=self.server_host, port=self.server_port, ssl=False
        )
        self.collection = self.chroma_client.get_or_create_collection(
            name="semantic", metadata={"data": "documents"}, embedding_function=self.embedding  # type: ignore
        )
        end = time.time()
        print(f"Collection loaded in {end - start} seconds")

    def run(self):
        @self.app.get("/api/search")
        async def search(q: str):
            results = self.collection.query(
                query_texts=[q],
                n_results=5,
                include=["data", "distances", "documents"],
            )
            print(results)
            return results

        @self.app.get("/api/document-count")
        async def documents_count():
            return {"count": self.collection.count()}

        @self.app.get("/api/document-content/{id}")
        async def document(id: str):
            return self.collection.get(ids=[id], include=["documents"])

        @self.app.get("/api/document-fields/{fields}")
        async def documents(fields: str):
            # Fields should be comma separated. Eg: fields="data,documents,title,ids"
            if len(fields) > 0:
                fieldsArray: list[str] = fields.split(",")
                results = self.collection.get(include=fieldsArray)  # type: ignore
                return results
            return {"Error": "Fields header not found"}, 400

        @self.app.post("/api/save-document/{id}")
        async def save_document(id: str, document: schemas.DocumentRecord):
            print(id, document.model_dump())
            if id in self.ids:
                self.collection.update(
                    ids=[id],
                    documents=[document.content],
                    metadatas=[
                        {
                            "title": document.title,
                        }
                    ],
                )
                return {"status": f"{id} updated"}, 200
            self.collection.add(
                ids=[id],
                documents=[document.content],
                metadatas=[
                    {
                        "title": document.title,
                    }
                ],
            )
            self.ids.add(id)
            return {"status": f"{id} Added"}, 200

        # This function has to be defined after all the other routes
        self.app.mount(
            "/", StaticFiles(directory=self.SITE_PATH, html=True), name="frontend"
        )


api = SemanticAPI()
api.run()
