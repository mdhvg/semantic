from typing import Collection, Optional
from pydantic import BaseModel


class DocumentRecord(BaseModel):
    title: str
    content: str
    # color: Optional[str] = None
    # starred: Optional[bool] = None
