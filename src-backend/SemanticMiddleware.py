from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp


class SemanticMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, collection_map: dict[str, bool]):
        super().__init__(app)
        self.collection_map = collection_map

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        for collection_name in self.collection_map:
            if not self.collection_map[collection_name]:
                return JSONResponse(
                    content={"error": f"{collection_name} not loaded yet"},
                    status_code=503,
                )
        return await call_next(request)
