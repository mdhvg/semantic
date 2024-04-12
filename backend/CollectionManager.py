import time
from chromadb.utils import embedding_functions
from chromadb.api import ClientAPI
from chromadb.api.models import Collection
from chromadb.api.types import GetResult
import chromadb
import threading

# import sentence_transformers


class CollectionLoader:
    def __init__(
        self,
        path: str = "db",
        collection_base_name: str = "semantic",
        # model: str = ""
    ) -> None:
        self.path = path
        self.collection_base_name = collection_base_name

        # self.model = model
        # self.collection_name = self.collection_base_name + self.model

        self.client: ClientAPI = chromadb.PersistentClient(path=path)
        self.collection_status: dict[str, bool] = {self.collection_base_name: False}
        self._collection = None
        self.ids: dict = {
            "document": set(),
            "deleted": set(),
        }

        threading.Thread(target=self.create_collection, daemon=True).start()

    @property
    def collection(self):
        return self._collection

    def create_collection(self) -> None:
        # TODO: When a model is defined, use sentence_transformers to load the specified model as the embedding model
        start = time.time()
        # embedding = embedding_functions.SentenceTransformerEmbeddingFunction(
        #     model_name=self.model,
        # )
        self._collection = self.client.get_or_create_collection(
            name=self.collection_base_name,
            metadata={
                "color": "string",
                "starred": "bool",
                "title": "string",
                "content": "string",
                "deleted_status": "bool",
                "deleted_timeLeft": "int",
            },
            # embedding_function=embedding
        )
        self.collection_status[self.collection_base_name] = True
        end = time.time()
        elapsed_time = end - start
        print(f"Collection loaded in {elapsed_time} seconds")

        self.ids["document"] = set(self.collection.get(include=[])["ids"])
