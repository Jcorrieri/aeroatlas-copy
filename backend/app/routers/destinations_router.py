from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_destination_service
from app.services.destination_service import (
    DestinationProviderError,
    DestinationService,
)


router = APIRouter(tags=["destinations"])
DestinationServiceDependency = Annotated[
    DestinationService,
    Depends(get_destination_service),
]


@router.get("/destinations/info/")
async def destination_info(
    service: DestinationServiceDependency,
    lat: float,
    lon: float,
    from_: str,
    to: str,
    trip_type: str,
    location: str,
) -> dict[str, Any]:
    try:
        return await service.get_destination(
            lat=lat,
            lon=lon,
            trip_from=from_,
            trip_to=to,
            trip_type=trip_type,
            location=location,
        )
    except DestinationProviderError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
