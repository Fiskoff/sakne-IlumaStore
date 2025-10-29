import logging

from fastapi import FastAPI, APIRouter
from uvicorn import run
from sqladmin import Admin

from app.admin import admin_views
from app.api.routers.products_routers import router as products_router
from core.config import settings
from core.db_helper import db_helper


settings.log.setup_logging()
logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    app = FastAPI(title="IlumaStore", version="1.0.0", docs_url="/docs", redoc_url="/redoc")

    router = APIRouter(tags=["root"])
    @router.get("/")
    async def root():
        return {
            "message": "IlumaStore API",
            "swagger": "/docs",
            "admin": "/admin"
        }

    app.include_router(router)
    app.include_router(products_router)

    admin = Admin(app, db_helper.engine)
    for view in admin_views:
        admin.add_view(view)

    return app

main_app = create_application()


if __name__ == '__main__':
    run("main:main_app", host=settings.run.host, port=settings.run.port)
