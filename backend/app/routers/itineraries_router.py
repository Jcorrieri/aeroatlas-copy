from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_itinerary_service
from app.schemas import ItineraryItem
from app.services.itinerary_service import ItineraryService


router = APIRouter(tags=["itineraries"])
ItineraryServiceDependency = Annotated[
    ItineraryService,
    Depends(get_itinerary_service),
]


@router.post("/api/itinerary/add")
async def add_to_itinerary(
    item: ItineraryItem,
    service: ItineraryServiceDependency,
) -> dict[str, Any]:
    message, itinerary = service.add_item(item)
    return {"success": True, "message": message, "itinerary": itinerary}


@router.delete("/api/itinerary/delete")
async def remove_from_itinerary(
    item: ItineraryItem,
    service: ItineraryServiceDependency,
) -> dict[str, Any]:
    success, message, itinerary = service.remove_item(item)
    return {"success": success, "message": message, "itinerary": itinerary}


@router.get("/api/itinerary")
async def get_itinerary(
    service: ItineraryServiceDependency,
    lat: str,
    lon: str,
    from_: Annotated[str, Query(alias="from")],
    to: str,
    type_: Annotated[str, Query(alias="type")],
) -> dict[str, Any]:
    itinerary = service.get_itinerary(lat, lon, from_, to, type_)
    return {
        "success": True,
        "message": "Itinerary retrieved successfully",
        "itinerary": itinerary,
    }
