from typing import Optional, Union, Literal, List
from pydantic import BaseModel, root_validator, ValidationError, validator


class Deleted(BaseModel):
    status: bool
    timeLeft: Optional[int]


class Fields(BaseModel):
    include: List[str]

    @validator("include")
    def check_literals(cls, v):
        valid_literals = [
            "documents",
            "embeddings",
            "metadatas",
            "distances",
            "uris",
            "data",
        ]
        if not set(v).issubset(valid_literals):
            raise ValueError("Invalid literal in include list")
        return v


class DocumentRecord(BaseModel):
    color: Optional[str] = None
    starred: Optional[bool] = None
    title: str
    # TODO: Make textContent and displayContent separate fields
    # textContent will contain the text content of the document
    # displayContent will contain the text content of the document in HTML format
    # This will allow the user to view the document in a browser and also allow for
    # better search indexing by the model
    content: str
    deleted_status: Optional[bool] = None
    deleted_timeLeft: Optional[int] = None

    @root_validator(pre=True)
    def check_timeLeft(cls, values):
        deleted_status, deleted_timeLeft = values.get("deleted_status"), values.get(
            "deleted_timeLeft"
        )
        if deleted_status and deleted_timeLeft is None:
            raise ValidationError("timeLeft is required when status is true")
        return values
