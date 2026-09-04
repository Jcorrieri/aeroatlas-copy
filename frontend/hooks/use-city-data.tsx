"use client"

import { useState, useEffect, useRef } from "react"
import { getItinerary } from "@/lib/api-service"

interface Image {
    id: number
    url: string
}

interface ItineraryItem {
    id: number
    day: number
    time: string
    activity: string
    location: string
    duration: string
    place_id?: string // Added to match API response
}

interface WeatherSummary {
    averageTemperature: number
    condition: "Sunny" | "Cloudy" | "Rainy"
    humidity: number
}

interface TravelDetails {
    type: "flight"
    departure: string
    arrival: string
    departureDate: string
    returnDate: string
    flightUrl: string
}

interface CountryIcon {
    imageUrl: string
    alt: string
}

interface CityData {
    cityName: string
    country: string
    description: string
    countryIcon: CountryIcon
    images: Image[]
    itinerary: ItineraryItem[]
    weatherSummary: WeatherSummary
    travelDetails: TravelDetails
    tripType: string
    requiredItems: string[]
}

// Enhanced hook with itinerary refresh capabilities
export function useCityData(query: URLSearchParams) {
    const [data, setData] = useState<CityData | null>(null)
    const [loading, setLoading] = useState(true)
    const initialFetchDone = useRef(false)
    const lastRefreshTime = useRef(Date.now())

    // Main data fetching effect
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            // Skip refetching if we've already fetched once and there's no explicit refresh
            if (initialFetchDone.current && data && Date.now() - lastRefreshTime.current < 300) {
                return;
            }

            try {
                setLoading(true);
                console.log("Fetching city data with query:", query.toString());

                const response = await fetch(`http://127.0.0.1:8000/destinations/info/?${query.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch city data");
                }

                const cityData = await response.json();

                // After fetching city data, check if we should also fetch the latest itinerary
                if (query.get('lat') && query.get('lon')) {
                    try {
                        console.log("Fetching latest itinerary data");

                        // Format the tripData to match what the API expects
                        const tripData = {
                            lat: query.get("lat") || "",
                            lon: query.get("lon") || "",
                            from: query.get("from_") || "", // Handle the different parameter name
                            to: query.get("to") || "",
                            type: query.get("trip_type") || "vacation",
                        };

                        const itineraryResponse = await getItinerary(tripData);

                        if (itineraryResponse.success &&
                            itineraryResponse.itinerary &&
                            itineraryResponse.itinerary.length > 0) {
                            // Replace the itinerary data with the latest data from the API
                            cityData.itinerary = itineraryResponse.itinerary;
                            console.log("Updated city data with latest itinerary:", itineraryResponse.itinerary);
                        }
                    } catch (itineraryError) {
                        console.error("Error fetching itinerary:", itineraryError);
                        // Continue with original city data if itinerary fetch fails
                    }
                }

                if (isMounted) {
                    setData(cityData);
                    setLoading(false);
                    initialFetchDone.current = true;
                    lastRefreshTime.current = Date.now();
                }
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to fetch city data:", error);
                    setLoading(false);
                    initialFetchDone.current = true;
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []); // Only depend on query changes

    // Setup listener for itinerary update events - with debounce protection
    useEffect(() => {
        let refreshTimeout: NodeJS.Timeout | null = null;

        const handleItineraryUpdated = (event: Event) => {
            console.log("Itinerary updated event received");

            // Clear any existing timeout
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }

            // Immediately update the local state if possible
            const customEvent = event as CustomEvent;
            if (data && customEvent.detail?.updatedItinerary) {
                setData(prevData => {
                    if (!prevData) return null;
                    return {
                        ...prevData,
                        itinerary: customEvent.detail.updatedItinerary
                    };
                });
                console.log("Immediately updated itinerary in city data");
            } else {
                // Use a timeout to avoid multiple rapid refreshes
                refreshTimeout = setTimeout(() => {
                    lastRefreshTime.current = 0; // Force a refresh on next render
                    setLoading(true); // Show loading state to indicate refresh

                    // Hack: Add a dummy parameter to force the effect to rerun
                    const dummyQuery = new URLSearchParams(query.toString());
                    dummyQuery.set('_refresh', Date.now().toString());
                    window.history.replaceState(
                        {},
                        '',
                        `${window.location.pathname}?${dummyQuery.toString()}`
                    );

                    // Force a rerender
                    setData(null);
                }, 300); // 300ms debounce
            }
        };

        // Add event listener
        window.addEventListener('itineraryUpdated', handleItineraryUpdated);

        // Cleanup function
        return () => {
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
            window.removeEventListener('itineraryUpdated', handleItineraryUpdated);
        };
    }, [data, query]); // Dependencies are stable

    // Add a manual refresh function
    const refreshData = () => {
        lastRefreshTime.current = 0; // Force a refresh
        setLoading(true);
        setData(null); // Force a rerender
    };

    return { data, loading, refreshData };
}