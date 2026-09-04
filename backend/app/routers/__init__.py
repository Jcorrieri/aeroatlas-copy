from fastapi import APIRouter

from app.routers.destinations_router import router as destinations_router
from app.routers.itineraries_router import router as itineraries_router


api_router = APIRouter()
api_router.include_router(itineraries_router)
api_router.include_router(destinations_router)
