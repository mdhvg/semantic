import os
import sys

root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root)
os.chdir(root)

import uvicorn

from chromadb import GetResult
from chromadb.api.types import Include

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import asyncio

from CollectionManager import CollectionLoader
from SemanticMiddleware import SemanticMiddleware
from MyTypes import DocumentRecord


class SemanticAPI:
    def __init__(self):
        self.app = FastAPI(
            title="semantic",
            description="Semantic API",
        )
        self.SITE_PATH = "../dist"
        self.collection_loader = CollectionLoader()
        self.collection_name = self.collection_loader.collection_base_name
        self.collection_status = self.collection_loader.collection_status
        self.setup_middleware()
        self.run()

    @property
    def collection(self):
        return self.collection_loader.collection

    @property
    def ids(self):
        return self.collection_loader.ids

    def setup_middleware(self):
        self.app.add_middleware(
            SemanticMiddleware, collection_map=self.collection_status
        )
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def run(self):
        @self.app.get("/quit")
        def app_shutdown():
            quit()

        @self.app.get("/api/document/search/{q}")
        async def search(q: str):
            results = self.collection.query(  # type: ignore
                query_texts=[q],
                n_results=5,
                include=["data", "distances", "metadatas"],
            )
            print(results)
            return results

        @self.app.get("/api/document/count")
        async def documents_count():
            return {"count": self.collection.count()}  # type: ignore

        @self.app.get("/api/document/content/{id}")
        async def document(id: str):
            return self.collection.get(ids=[id], include=["documents"])  # type: ignore

        @self.app.get("/api/document/fields/{fields}")
        async def documents(fields: str):
            # Fields should be comma separated. Eg: fields="data,documents,title,ids"
            if len(fields) > 0:
                fieldsArray: Include = fields.split(",")  # type: ignore
                results = self.collection.get(include=fieldsArray)  # type: ignore
                return results
            return JSONResponse(
                content={"Error": "No fields specified"}, status_code=400
            )

        @self.app.post("/api/document/save/{id}")
        async def save_document(id: str, document: DocumentRecord):
            metadata = [
                {
                    key: value
                    for key, value in document.model_dump()["meta"].items()
                    if value is not None
                }
            ]
            if id in self.ids["document"]:
                self.collection.update(  # type: ignore
                    ids=[id], documents=[document.plainText], metadatas=metadata
                )
                return JSONResponse(
                    content={"status": f"{id} updated"}, status_code=200
                )
            self.collection.add(  # type: ignore
                ids=[id],
                documents=[document.plainText],
                metadatas=metadata,
            )
            self.ids["document"].add(id)
            return JSONResponse(content={"status": f"{id} added"}, status_code=200)

        @self.app.delete("/api/document/delete/{id}")
        async def delete_document(id: str):
            if id in self.ids["document"]:
                document: GetResult = self.collection.get(ids=[id], include=["metadatas"])  # type: ignore
                document["metadatas"][0]["deleted_status"] = True  # type: ignore
                document["metadatas"][0]["deleted_timeLeft"] = 30  # type: ignore
                self.collection.update(  # type: ignore
                    ids=[id], metadatas=document["metadatas"]
                )
                return JSONResponse(
                    content={"status": f"{id} moved to bin"}, status_code=200
                )
            return JSONResponse(content={"error": f"{id} not found"}, status_code=404)

        # This function has to be defined after all the other routes
        # self.app.mount(
        #     "/", StaticFiles(directory=self.SITE_PATH, html=True), name="frontend"
        # )


api = SemanticAPI()
uvicorn.run(app=api.app, host="localhost", port=8080, log_level="info")
