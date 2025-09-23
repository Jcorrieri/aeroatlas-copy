import os

import httpx
import wikipediaapi
from fastapi import HTTPException, Request

from config import settings


async def get_flag_img_src(lat: float, lon: float, country: str, request: Request) -> str:
    data_cache = request.app.state.data_cache

    flag_key = f"{country}_flag"
    if flag_key in data_cache:
        print("Using flag cache")
        return data_cache[flag_key]

    # get country code -- takes time for sure
    print("Fetching flag image")

    url = "https://nominatim.openstreetmap.org/reverse"
    params = {"format": "json", "lat": lat, "lon": lon}
    headers = {"User-Agent": settings.USER_AGENT}

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url, params=params, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch country code")

    data = response.json()
    country_code = data["address"]["country_code"].lower()

    # build and cache src attribute
    flag_img_src = f"https://flagcdn.com/w80/{country_code}.png"
    request.app.state.data_cache[flag_key] = flag_img_src

    return flag_img_src


async def get_description(city: str, state: str, country: str, request: Request) -> str:
    data_cache = request.app.state.data_cache

    desc_key = city + "_" + country + "_desc"
    if desc_key in data_cache:
        print("Using text cache")
        return data_cache[desc_key]

    print("Fetching text")
    page_str = f"{city}, {state or country}"

    wiki_wiki = wikipediaapi.Wikipedia(user_agent=settings.USER_AGENT, language="en")
    print(page_str)
    page = wiki_wiki.page(page_str)

    if not page.exists():
        return "Failed to load description"

    description = page.summary[0:650]
    description = description[0:description.rfind('.') + 1]
    request.app.state.data_cache[desc_key] = description

    return description


async def get_place_images(city, state: str, country: str, request: Request):
    data_cache = request.app.state.data_cache
    q = f"{city}, {state or country}"
    images = set()

    img_key = city + "_" + country + "_images"
    if img_key in data_cache:
        print("Using text cache")
        images = {url.strip() for url in data_cache[img_key].split(",")}
        return images

    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": q,
        "client_id": request.app.state.img_key,
        "content_filter": "high",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url, params=params)

    base_url = "https://images.unsplash.com/photo-1478860409698-8707f313ee8b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    if response.status_code != 200:
        "error fetching image"
        return base_url

    data = response.json().get("results", [])
    for item in data:
        if len(images) >= 3:
            break
        url = item["urls"]["regular"]
        if url not in images:
            print(url)
            images.add(url)

    while len(images) < 3:
        images.add(base_url)

    data_str = ""
    for url in images:
        data_str = data_str + f"{url},"
    data_str = data_str + images.pop()

    request.app.state.data_cache[img_key] = data_str
    return images