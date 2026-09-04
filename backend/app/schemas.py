from pydantic import BaseModel


class ItineraryItem(BaseModel):
    place_id: str
    name: str
    address: str
    lat: float
    lon: float
    category: str
    trip_lat: str
    trip_lon: str
    trip_from: str
    trip_to: str
    trip_type: str
    day: int = 1
    time: str = "12:00 PM"
    duration: str = "2 hours"
