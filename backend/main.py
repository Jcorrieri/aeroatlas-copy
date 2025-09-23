import os
from contextlib import asynccontextmanager

from diskcache import Cache
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from destination import get_flag_img_src, get_description, get_place_images


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.data_cache = Cache("./data_cache")
    app.state.trip_counters = {}

    load_dotenv()
    app.state.img_key = os.getenv("IMG_KEY")

    yield

    app.state.data_cache.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.post("/api/itinerary/add")
async def add_to_itinerary(request: Request, item: ItineraryItem):
    trip_key = f"{item.trip_lat}_{item.trip_lon}_{item.trip_from}_{item.trip_to}_{item.trip_type}"
    itinerary_key = f"{trip_key}_itinerary"

    if itinerary_key in request.app.state.data_cache:
        itinerary = request.app.state.data_cache[itinerary_key]
    else:
        itinerary = []

    for existing_item in itinerary:
        if existing_item.get('place_id') == item.place_id:
            return {"success": True, "message": "Place already in itinerary", "itinerary": itinerary}

    if trip_key not in request.app.state.trip_counters:
        request.app.state.trip_counters[trip_key] = 1

    new_item = {
        "id": request.app.state.trip_counters[trip_key],
        "place_id": item.place_id,
        "day": item.day,
        "time": item.time,
        "activity": f"Visit {item.name}",
        "location": item.address,
        "duration": item.duration,
        "category": item.category,
        "lat": item.lat,
        "lon": item.lon
    }

    itinerary.append(new_item)
    request.app.state.trip_counters[trip_key] += 1
    request.app.state.data_cache[itinerary_key] = itinerary

    return {"success": True, "message": "Place added to itinerary", "itinerary": itinerary}


@app.delete("/api/itinerary/delete")
async def remove_from_itinerary(request: Request, item: ItineraryItem):
    trip_key = f"{item.trip_lat}_{item.trip_lon}_{item.trip_from}_{item.trip_to}_{item.trip_type}"
    itinerary_key = f"{trip_key}_itinerary"

    if itinerary_key in request.app.state.data_cache:
        itinerary = request.app.state.data_cache[itinerary_key]
    else:
        return {"success": False, "message": "Itinerary Not found", "itinerary": []}

    for existing_item in itinerary:
        if existing_item.get('place_id') == item.place_id:
            itinerary.remove(existing_item)
            request.app.state.data_cache[itinerary_key] = itinerary
            return {"success": True, "message": "Item removed", "itinerary": itinerary}

    return {"success": False, "message": "Item not found in itinerary", "itinerary": itinerary}


@app.get("/api/itinerary")
async def get_itinerary(
        request: Request,
        lat: str,
        lon: str,
        from_: str = Query(..., alias="from"),
        to: str = Query(...),
        type_: str = Query(..., alias="type")
):

    trip_key = f"{lat}_{lon}_{from_}_{to}_{type_}"
    itinerary_key = f"{trip_key}_itinerary"

    if itinerary_key in request.app.state.data_cache:
        itinerary = request.app.state.data_cache[itinerary_key]
    else:
        itinerary = []

    # Return the itinerary
    return {
        "success": True,
        "message": "Itinerary retrieved successfully",
        "itinerary": itinerary
    }


@app.get("/destinations/info/")
async def destination_info(request: Request, lat: str, lon: str, from_: str, to: str, trip_type: str, location: str):
    loc_split = location.strip().split(', ')
    lat, lon = float(lat), float(lon)
    from_, to = from_[0:10], to[0:10]
    city, country = loc_split[0], loc_split[len(loc_split)-1]

    if country == "USA":
        state = loc_split[len(loc_split)-3]
    else:
        state = None

    print("Getting info for:",city, country, state)

    flag_img_src = await get_flag_img_src(lat, lon, country, request)
    description = await get_description(city, state, country, request)
    img_urls = await get_place_images(city, state, country, request)

    images = []
    for i in range(len(img_urls)):
        images.append({
            "id": f"{i + 1}",
            "url": img_urls.pop()
        })

    trip_key = f"{lat}_{lon}_{from_}_{to}_{trip_type}"
    itinerary_key = f"{trip_key}_itinerary"

    if itinerary_key in request.app.state.data_cache:
        itinerary = request.app.state.data_cache[itinerary_key]
    else:
        itinerary = []

    weather_summary = {  # replace with Ian's data
        "averageTemperature": 28,
        "condition": "Sunny",
        "humidity": 65
    }

    travel_details = {
        "type": "flight",
        "departure": "Jacksonville, USA",
        "arrival": city + ", " + country,
        "departureDate": from_,
        "returnDate": to,
        "flightUrl": f"https://www.google.com/travel/flights?q=from+Jacksonville,%20USA+to+{city},%20{country}+on+{from_}+through+{to}",
    }

    required_items = []
    if country != "USA":
        required_items.append("Passport")

    data = {
        "cityName": city,
        "country": country,
        "description": description,
        "countryIcon": {
            "imageUrl": flag_img_src,
            "alt": f"{country} flag"
        },
        "itinerary": itinerary,
        "images": images,
        "weatherSummary": weather_summary,
        "travelDetails": travel_details,
        "tripType": trip_type,
        "requiredItems": required_items,
    }

    return data