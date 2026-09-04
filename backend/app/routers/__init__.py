from fastapi import APIRouter

from app.routers.auth_router import router as auth_router
from app.routers.trips_router import router as trips_router


api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(trips_router)
