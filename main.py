import logging

from fastapi import FastAPI, APIRouter
from uvicorn import run

from core.config import settings


settings.log.setup_logging()
logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    app = FastAPI(title="IlumaStore", version="1.0.0", docs_url="/docs", redoc_url="/redoc")
    router = APIRouter(tags=["root"])
    @router.get("/")
    async def root():
        return {
            "message": "IlumaStore API",
            "swagger": "/docs"
        }
    app.include_router(router)
    return app

main_app = create_application()


if __name__ == '__main__':
    run("main:main_app", host=settings.run.host, port=settings.run.port)
