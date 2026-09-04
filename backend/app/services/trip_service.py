import uuid
from datetime import date
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import ItineraryItem, Trip, TripType, User, utc_now
from app.schemas import ItineraryItemCreate, ItineraryItemUpdate, TripCreate, TripUpdate


class TripNotFoundError(Exception):
    pass


class InvalidTripError(Exception):
    pass


class TripService:
    def __init__(self, database: Session) -> None:
        self.database = database

    def create_trip(self, user: User, payload: TripCreate) -> Trip:
        trip = Trip(
            user_id=user.id,
            title=payload.title or f"Trip to {payload.destination_name}",
            destination_name=payload.destination_name,
            latitude=payload.latitude,
            longitude=payload.longitude,
            start_date=payload.start_date,
            end_date=payload.end_date,
            trip_type=payload.trip_type,
        )
        self.database.add(trip)
        self.database.commit()
        return trip

    def list_trips(self, user: User) -> list[Trip]:
        statement = (
            select(Trip)
            .where(Trip.user_id == user.id)
            .order_by(Trip.updated_at.desc())
        )
        return list(self.database.scalars(statement))

    def get_trip(self, user: User, trip_id: uuid.UUID) -> Trip:
        statement = (
            select(Trip)
            .options(selectinload(Trip.items))
            .where(Trip.id == trip_id, Trip.user_id == user.id)
        )
        trip = self.database.scalar(statement)
        if trip is None:
            raise TripNotFoundError
        return trip

    def update_trip(self, user: User, trip_id: uuid.UUID, payload: TripUpdate) -> Trip:
        trip = self.get_trip(user, trip_id)
        changes = payload.model_dump(exclude_unset=True)
        state = self._updated_trip_state(trip, changes)
        self._validate_trip_state(**state)

        for field, value in changes.items():
            setattr(trip, field, value)
        trip.updated_at = utc_now()
        self.database.commit()
        return trip

    def delete_trip(self, user: User, trip_id: uuid.UUID) -> None:
        trip = self.get_trip(user, trip_id)
        self.database.delete(trip)
        self.database.commit()

    def list_items(self, user: User, trip_id: uuid.UUID) -> list[ItineraryItem]:
        trip = self.get_trip(user, trip_id)
        return list(trip.items)

    def add_item(
        self,
        user: User,
        trip_id: uuid.UUID,
        payload: ItineraryItemCreate,
    ) -> ItineraryItem:
        trip = self.get_trip(user, trip_id)
        position = payload.position
        if position is None:
            position = self._next_position(trip_id, payload.day_number)

        data = payload.model_dump(exclude={"position"})
        item = ItineraryItem(trip_id=trip.id, position=position, **data)
        self.database.add(item)
        trip.updated_at = utc_now()
        self.database.commit()
        return item

    def update_item(
        self,
        user: User,
        trip_id: uuid.UUID,
        item_id: uuid.UUID,
        payload: ItineraryItemUpdate,
    ) -> ItineraryItem:
        trip = self.get_trip(user, trip_id)
        item = self._get_item(trip_id, item_id)
        changes = payload.model_dump(exclude_unset=True)
        if (
            "day_number" in changes
            and changes["day_number"] != item.day_number
            and "position" not in changes
        ):
            changes["position"] = self._next_position(trip_id, changes["day_number"])

        for field, value in changes.items():
            setattr(item, field, value)
        item.updated_at = utc_now()
        trip.updated_at = utc_now()
        self.database.commit()
        return item

    def delete_item(
        self,
        user: User,
        trip_id: uuid.UUID,
        item_id: uuid.UUID,
    ) -> None:
        trip = self.get_trip(user, trip_id)
        item = self._get_item(trip_id, item_id)
        self.database.delete(item)
        trip.updated_at = utc_now()
        self.database.commit()

    def _get_item(self, trip_id: uuid.UUID, item_id: uuid.UUID) -> ItineraryItem:
        item = self.database.scalar(
            select(ItineraryItem).where(
                ItineraryItem.id == item_id,
                ItineraryItem.trip_id == trip_id,
            )
        )
        if item is None:
            raise TripNotFoundError
        return item

    def _next_position(self, trip_id: uuid.UUID, day_number: int) -> int:
        current = self.database.scalar(
            select(func.max(ItineraryItem.position)).where(
                ItineraryItem.trip_id == trip_id,
                ItineraryItem.day_number == day_number,
            )
        )
        return 0 if current is None else current + 1

    @staticmethod
    def _updated_trip_state(trip: Trip, changes: dict[str, Any]) -> dict[str, Any]:
        return {
            "latitude": changes.get("latitude", trip.latitude),
            "longitude": changes.get("longitude", trip.longitude),
            "start_date": changes.get("start_date", trip.start_date),
            "end_date": changes.get("end_date", trip.end_date),
            "trip_type": changes.get("trip_type", trip.trip_type),
        }

    @staticmethod
    def _validate_trip_state(
        latitude: float | None,
        longitude: float | None,
        start_date: date,
        end_date: date,
        trip_type: TripType,
    ) -> None:
        if (latitude is None) != (longitude is None):
            raise InvalidTripError("Latitude and longitude must be provided together")
        if end_date < start_date:
            raise InvalidTripError("End date cannot be before start date")
