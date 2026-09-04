from typing import Any, MutableMapping

from app.schemas import ItineraryItem


class ItineraryService:
    def __init__(
        self,
        cache: MutableMapping[str, Any],
        trip_counters: dict[str, int],
    ) -> None:
        self.cache = cache
        self.trip_counters = trip_counters

    @staticmethod
    def _trip_key(
        lat: str,
        lon: str,
        trip_from: str,
        trip_to: str,
        trip_type: str,
    ) -> str:
        return f"{lat}_{lon}_{trip_from}_{trip_to}_{trip_type}"

    def _itinerary_key(self, item: ItineraryItem) -> tuple[str, str]:
        trip_key = self._trip_key(
            item.trip_lat,
            item.trip_lon,
            item.trip_from,
            item.trip_to,
            item.trip_type,
        )
        return trip_key, f"{trip_key}_itinerary"

    def get_itinerary(
        self,
        lat: str,
        lon: str,
        trip_from: str,
        trip_to: str,
        trip_type: str,
    ) -> list[dict[str, Any]]:
        trip_key = self._trip_key(lat, lon, trip_from, trip_to, trip_type)
        return self.cache.get(f"{trip_key}_itinerary", [])

    def add_item(self, item: ItineraryItem) -> tuple[str, list[dict[str, Any]]]:
        trip_key, itinerary_key = self._itinerary_key(item)
        itinerary = self.cache.get(itinerary_key, [])

        if any(existing.get("place_id") == item.place_id for existing in itinerary):
            return "Place already in itinerary", itinerary

        item_id = self.trip_counters.setdefault(trip_key, 1)
        new_item = {
            "id": item_id,
            "place_id": item.place_id,
            "day": item.day,
            "time": item.time,
            "activity": f"Visit {item.name}",
            "location": item.address,
            "duration": item.duration,
            "category": item.category,
            "lat": item.lat,
            "lon": item.lon,
        }
        itinerary.append(new_item)
        self.trip_counters[trip_key] += 1
        self.cache[itinerary_key] = itinerary
        return "Place added to itinerary", itinerary

    def remove_item(self, item: ItineraryItem) -> tuple[bool, str, list[dict[str, Any]]]:
        _, itinerary_key = self._itinerary_key(item)
        itinerary = self.cache.get(itinerary_key)
        if itinerary is None:
            return False, "Itinerary Not found", []

        for existing in itinerary:
            if existing.get("place_id") == item.place_id:
                itinerary.remove(existing)
                self.cache[itinerary_key] = itinerary
                return True, "Item removed", itinerary

        return False, "Item not found in itinerary", itinerary
