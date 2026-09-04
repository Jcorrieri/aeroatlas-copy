import enum
import uuid
from datetime import date, datetime, time, timezone

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, Integer, String, Time
from sqlalchemy import Uuid as SqlUuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class TripType(str, enum.Enum):
    PERSONAL = "Personal"
    BUSINESS = "Business"
    FAMILY = "Family"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        SqlUuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    sessions: Mapped[list["AuthSession"]] = relationship(
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    trips: Mapped[list["Trip"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        SqlUuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(
        SqlUuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    destination_name: Mapped[str] = mapped_column(String(300))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    trip_type: Mapped[TripType] = mapped_column(
        Enum(TripType, native_enum=False, length=20),
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        index=True,
    )

    owner: Mapped[User] = relationship(back_populates="trips")
    items: Mapped[list["ItineraryItem"]] = relationship(
        back_populates="trip",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ItineraryItem.day_number, ItineraryItem.position, ItineraryItem.created_at",
    )


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id: Mapped[uuid.UUID] = mapped_column(
        SqlUuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"),
        index=True,
    )
    external_place_id: Mapped[str | None] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(300))
    address: Mapped[str | None] = mapped_column(String(500))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    category: Mapped[str | None] = mapped_column(String(100))
    day_number: Mapped[int] = mapped_column(Integer, default=1)
    start_time: Mapped[time | None] = mapped_column(Time)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=120)
    position: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    trip: Mapped[Trip] = relationship(back_populates="items")
