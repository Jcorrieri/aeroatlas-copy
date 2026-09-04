import uuid
from datetime import date, datetime, time

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

from app.models import TripType


class RegisterRequest(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("display_name")
    @classmethod
    def strip_display_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Display name cannot be blank")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    display_name: str
    created_at: datetime


class TripCreate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    destination_name: str = Field(min_length=1, max_length=300)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    start_date: date
    end_date: date
    trip_type: TripType

    @field_validator("title", "destination_name")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Text fields cannot be blank")
        return value

    @model_validator(mode="after")
    def validate_trip(self) -> "TripCreate":
        if not self.destination_name:
            raise ValueError("Destination name cannot be blank")
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Latitude and longitude must be provided together")
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date")
        return self


class TripUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    destination_name: str | None = Field(default=None, min_length=1, max_length=300)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    start_date: date | None = None
    end_date: date | None = None
    trip_type: TripType | None = None

    @field_validator("title", "destination_name")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Text fields cannot be blank")
        return value

    @model_validator(mode="after")
    def reject_null_required_fields(self) -> "TripUpdate":
        nullable = {"latitude", "longitude"}
        for field in self.model_fields_set - nullable:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class ItineraryItemCreate(BaseModel):
    external_place_id: str | None = Field(default=None, max_length=255)
    name: str = Field(min_length=1, max_length=300)
    address: str | None = Field(default=None, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    category: str | None = Field(default=None, max_length=100)
    day_number: int = Field(default=1, ge=1)
    start_time: time | None = None
    duration_minutes: int = Field(default=120, gt=0)
    position: int | None = Field(default=None, ge=0)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be blank")
        return value


class ItineraryItemUpdate(BaseModel):
    external_place_id: str | None = Field(default=None, max_length=255)
    name: str | None = Field(default=None, min_length=1, max_length=300)
    address: str | None = Field(default=None, max_length=500)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    category: str | None = Field(default=None, max_length=100)
    day_number: int | None = Field(default=None, ge=1)
    start_time: time | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    position: int | None = Field(default=None, ge=0)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be blank")
        return value

    @model_validator(mode="after")
    def reject_null_required_fields(self) -> "ItineraryItemUpdate":
        required = {
            "name",
            "latitude",
            "longitude",
            "day_number",
            "duration_minutes",
            "position",
        }
        for field in self.model_fields_set & required:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class ItineraryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    external_place_id: str | None
    name: str
    address: str | None
    latitude: float
    longitude: float
    category: str | None
    day_number: int
    start_time: time | None
    duration_minutes: int
    position: int
    created_at: datetime
    updated_at: datetime


class TripResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    destination_name: str
    latitude: float | None
    longitude: float | None
    start_date: date
    end_date: date
    trip_type: TripType
    created_at: datetime
    updated_at: datetime


class TripDetailResponse(TripResponse):
    items: list[ItineraryItemResponse]
