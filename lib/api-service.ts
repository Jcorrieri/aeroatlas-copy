// api-service.ts - create this file in your lib or services folder

import axios from 'axios';
import { GeoapifyPlace } from "@/lib/geoapify";

// API base URL - adjust based on your backend setup
// ❗ IMPORTANT: Change this to match your FastAPI backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ItineraryItemRequest {
    place_id: string;
    name: string;
    address: string;
    lat: number;
    lon: number;
    category: string;
    trip_lat: string;
    trip_lon: string;
    trip_from: string;
    trip_to: string;
    trip_type: string;
    day?: number;
    time?: string;
    duration?: string;
}

interface ItineraryItemResponse {
    id: number;
    place_id: string;
    day: number;
    time: string;
    activity: string;
    location: string;
    duration: string;
    category: string;
    lat: number;
    lon: number;
}

interface ItineraryResponse {
    success: boolean;
    message: string;
    itinerary: ItineraryItemResponse[];
}

// Enhanced API functions for api-service.ts

export async function getItinerary(tripData: {
    lat: string;
    lon: string;
    from: string;
    to: string;
    type: string;
}): Promise<{success: boolean; message: string; itinerary: any[]}> {
    try {
        console.log("Fetching itinerary for trip:", tripData);

        // Build the query string properly
        const queryParams = new URLSearchParams({
            lat: tripData.lat,
            lon: tripData.lon,
            // Use 'from' as the parameter name for the API
            from: tripData.from,
            to: tripData.to,
            type: tripData.type
        });

        const response = await fetch(`${API_BASE_URL}/api/itinerary?${queryParams.toString()}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}): ${errorText}`);
            return { success: false, message: "Failed to fetch itinerary", itinerary: [] };
        }

        const data = await response.json();
        console.log("Received itinerary data:", data);
        return data;
    } catch (error) {
        console.error('Error getting itinerary:', error);
        return { success: false, message: "Error fetching itinerary", itinerary: [] };
    }
}

export async function addPlaceToItinerary(
    place: GeoapifyPlace,
    tripData: {
        lat: string;
        lon: string;
        from: string;
        to: string;
        type: string;
    },
    details: {
        day?: number;
        time?: string;
        duration?: string;
    } = {}
): Promise<{success: boolean; message: string; itinerary: any[]}> {
    console.log("Adding place to itinerary:", place.properties.name);
    console.log("API URL:", `${API_BASE_URL}/api/itinerary/add`);

    try {
        // Format the request with all necessary fields
        const request: ItineraryItemRequest = {
            place_id: place.properties.place_id,
            name: place.properties.name,
            address: place.properties.formatted,
            lat: place.properties.lat,
            lon: place.properties.lon,
            category: place.properties.categories?.[0] || 'attraction',
            trip_lat: tripData.lat,
            trip_lon: tripData.lon,
            trip_from: tripData.from,
            trip_to: tripData.to,
            trip_type: tripData.type || 'vacation',
            day: details.day || 1,
            time: details.time || "12:00 PM",
            duration: details.duration || "2 hours"
        };

        console.log("Request payload:", JSON.stringify(request, null, 2));

        // Make the API call to add the place to the itinerary
        const response = await fetch(`${API_BASE_URL}/api/itinerary/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}): ${errorText}`);
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Successfully added place to itinerary:", data);

        // Dispatch a custom event that other components can listen for
        const itineraryUpdatedEvent = new CustomEvent('itineraryUpdated', {
            detail: {
                tripData,
                updatedItinerary: data.itinerary
            }
        });
        window.dispatchEvent(itineraryUpdatedEvent);

        return data;
    } catch (error) {
        console.error('Error adding place to itinerary:', error);
        throw error;
    }
}

export async function deleteItineraryItem(
    placeId: string,
    tripData: {
        lat: string;
        lon: string;
        from: string;
        to: string;
        type: string;
    }
): Promise<{ success: boolean; message: string; itinerary: any[] }> {
    console.log("Deleting itinerary item with JSON body...");

    // Construct the body as required by your FastAPI ItineraryItem model
    const item = {
        place_id: placeId,
        name: "", // Not needed for deletion, but required by model — FastAPI will ignore it if unused
        address: "",
        lat: parseFloat(tripData.lat),
        lon: parseFloat(tripData.lon),
        category: "",
        trip_lat: tripData.lat,
        trip_lon: tripData.lon,
        trip_from: tripData.from,
        trip_to: tripData.to,
        trip_type: tripData.type,
        day: 1,
        time: "12:00 PM",
        duration: "1 hour"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/itinerary/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error (${response.status}): ${errorText}`);
            throw new Error("Failed to delete itinerary item");
        }

        const data = await response.json();

        // Remove from localStorage
        const tripKey = `${tripData.lat}_${tripData.lon}_${tripData.from}_${tripData.to}_${tripData.type}`;
        const addedPlacesKey = `added_places_${tripKey}`;
        const stored = localStorage.getItem(addedPlacesKey);
        if (stored) {
            const addedPlaces = JSON.parse(stored);
            delete addedPlaces[placeId];
            localStorage.setItem(addedPlacesKey, JSON.stringify(addedPlaces));
        }

        // Broadcast the update event
        const itineraryUpdatedEvent = new CustomEvent('itineraryUpdated', {
            detail: { tripData, updatedItinerary: data.itinerary }
        });
        window.dispatchEvent(itineraryUpdatedEvent);

        return data;
    } catch (error) {
        console.error("Error deleting itinerary item:", error);
        throw error;
    }
}