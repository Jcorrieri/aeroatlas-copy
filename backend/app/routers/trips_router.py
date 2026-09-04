import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.dependencies import CurrentUserDependency, TripServiceDependency
from app.schemas import (
    ItineraryItemCreate,
    ItineraryItemResponse,
    ItineraryItemUpdate,
    TripCreate,
    TripDetailResponse,
    TripResponse,
    TripUpdate,
)
from app.services.trip_service import InvalidTripError, TripNotFoundError


router = APIRouter(prefix="/api/v1/trips", tags=["trips"])


def not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    payload: TripCreate,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> TripResponse:
    return TripResponse.model_validate(service.create_trip(user, payload))


@router.get("", response_model=list[TripResponse])
def list_trips(
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> list[TripResponse]:
    return [TripResponse.model_validate(trip) for trip in service.list_trips(user)]


@router.get("/{trip_id}", response_model=TripDetailResponse)
def get_trip(
    trip_id: uuid.UUID,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> TripDetailResponse:
    try:
        return TripDetailResponse.model_validate(service.get_trip(user, trip_id))
    except TripNotFoundError as error:
        raise not_found() from error


@router.patch("/{trip_id}", response_model=TripDetailResponse)
def update_trip(
    trip_id: uuid.UUID,
    payload: TripUpdate,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> TripDetailResponse:
    try:
        trip = service.update_trip(user, trip_id, payload)
        return TripDetailResponse.model_validate(trip)
    except TripNotFoundError as error:
        raise not_found() from error
    except InvalidTripError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: uuid.UUID,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> None:
    try:
        service.delete_trip(user, trip_id)
    except TripNotFoundError as error:
        raise not_found() from error


@router.get("/{trip_id}/items", response_model=list[ItineraryItemResponse])
def list_items(
    trip_id: uuid.UUID,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> list[ItineraryItemResponse]:
    try:
        items = service.list_items(user, trip_id)
        return [ItineraryItemResponse.model_validate(item) for item in items]
    except TripNotFoundError as error:
        raise not_found() from error


@router.post(
    "/{trip_id}/items",
    response_model=ItineraryItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_item(
    trip_id: uuid.UUID,
    payload: ItineraryItemCreate,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> ItineraryItemResponse:
    try:
        item = service.add_item(user, trip_id, payload)
        return ItineraryItemResponse.model_validate(item)
    except TripNotFoundError as error:
        raise not_found() from error


@router.patch("/{trip_id}/items/{item_id}", response_model=ItineraryItemResponse)
def update_item(
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    payload: ItineraryItemUpdate,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> ItineraryItemResponse:
    try:
        item = service.update_item(user, trip_id, item_id, payload)
        return ItineraryItemResponse.model_validate(item)
    except TripNotFoundError as error:
        raise not_found() from error


@router.delete("/{trip_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    trip_id: uuid.UUID,
    item_id: uuid.UUID,
    user: CurrentUserDependency,
    service: TripServiceDependency,
) -> None:
    try:
        service.delete_item(user, trip_id, item_id)
    except TripNotFoundError as error:
        raise not_found() from error
