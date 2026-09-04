"use client";

import React, { useState, useEffect } from 'react';
import { useSearch } from '@/app/(front)/components/textbox';
import { useTheme } from 'next-themes';
import axios from 'axios';
import { MapPinIcon, Loader2, ExternalLink, ChevronDown, ChevronUp, Phone, Clock, Link } from 'lucide-react';

// Categories for places
const PLACE_CATEGORIES = [
    { id: 'accommodation', name: 'Hotels', icon: '🏨', color: 'bg-orange-500' },
    { id: 'catering', name: 'Restaurants', icon: '🍽️', color: 'bg-red-500' },
    { id: 'tourism', name: 'Attractions', icon: '🏛️', color: 'bg-blue-500' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎭', color: 'bg-purple-500' },
    { id: 'activity', name: 'Activities', icon: '🏊', color: 'bg-green-500' },
    { id: 'commercial', name: 'Shopping', icon: '🛍️', color: 'bg-pink-500' }
];

// Interface for place data
interface Place {
    id: string;
    name: string;
    category: string;
    address: string;
    formattedAddress?: string;
    phone?: string;
    website?: string;
    openingHours?: string;
    latitude: number;
    longitude: number;
    distance?: number;
}

interface PlacesListProps {
    onPlaceSelect?: (place: Place) => void;
}

const PlacesList = ({ onPlaceSelect }: PlacesListProps) => {
    const { location } = useSearch();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [cityCoords, setCityCoords] = useState<[number, number] | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
        PLACE_CATEGORIES.reduce((acc, category) => ({...acc, [category.id]: true}), {})
    );

    // Get coordinates for the searched location
    useEffect(() => {
        // Don't search if location is empty
        if (!location || location.trim() === '') return;

        setLoading(true);
        setError('');

        // First get coordinates for the city
        const fetchCityCoords = async () => {
            try {
                const LOCATIONIQ_API_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;

                if (!LOCATIONIQ_API_KEY) {
                    console.warn("LocationIQ API key missing");
                    // Use mock data as fallback
                    setMockCityData(location);
                    return;
                }

                const response = await axios.get(
                    `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(location)}&format=json`,
                    { timeout: 10000 }
                );

                if (response.data && response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    const latitude = parseFloat(lat);
                    const longitude = parseFloat(lon);
                    setCityCoords([latitude, longitude]);
                } else {
                    setError('Location not found. Please try a different search term.');
                    setMockCityData(location);
                }
            } catch (err) {
                console.error("Error fetching city coordinates:", err);
                setError('Failed to fetch location. Using simulated data instead.');
                // Use mock data as fallback
                setMockCityData(location);
            } finally {
                setLoading(false);
            }
        };

        fetchCityCoords();
    }, [location]);

    // Fetch places when city coordinates are set
    useEffect(() => {
        if (!cityCoords) return;

        setLoading(true);

        // Fetch places from Geoapify
        const fetchPlaces = async () => {
            try {
                const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

                if (!GEOAPIFY_API_KEY) {
                    console.warn("Geoapify API key missing");
                    // Use simulated data
                    generateSimulatedPlaces(cityCoords[0], cityCoords[1]);
                    return;
                }

                const allPlaces: Place[] = [];

                // Fetch places for each category
                for (const category of PLACE_CATEGORIES) {
                    try {
                        const response = await axios.get(
                            `https://api.geoapify.com/v2/places`, {
                                params: {
                                    categories: category.id,
                                    filter: `circle:${cityCoords[1]},${cityCoords[0]},10000`, // 10km radius
                                    limit: 10,
                                    apiKey: GEOAPIFY_API_KEY
                                },
                                timeout: 10000
                            }
                        );

                        if (response.data?.features) {
                            response.data.features.forEach((place: any) => {
                                try {
                                    const props = place.properties;
                                    const lon = place.geometry.coordinates[0];
                                    const lat = place.geometry.coordinates[1];

                                    allPlaces.push({
                                        id: props.place_id || `${lat}-${lon}`,
                                        name: props.name || `${category.name} Place`,
                                        category: category.id,
                                        address: props.address_line1 || props.street || "No address available",
                                        formattedAddress: props.formatted || props.address_line2 || "",
                                        phone: props.phone || props.contact?.phone,
                                        website: props.website || props.contact?.website,
                                        openingHours: props.opening_hours,
                                        latitude: lat,
                                        longitude: lon,
                                        distance: calculateDistance(cityCoords[0], cityCoords[1], lat, lon)
                                    });
                                } catch (err) {
                                    console.warn(`Skipped a place due to data format issue: ${err}`);
                                }
                            });
                        }
                    } catch (categoryErr) {
                        console.warn(`Error fetching ${category.name} places: ${categoryErr}`);
                    }
                }

                if (allPlaces.length === 0) {
                    console.warn("No places found via API, using simulated data");
                    generateSimulatedPlaces(cityCoords[0], cityCoords[1]);
                } else {
                    // Sort places by distance
                    allPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                    setPlaces(allPlaces);
                }
            } catch (err) {
                console.error("Error fetching places:", err);
                setError('Failed to fetch places. Using simulated data instead.');
                // Use simulated data as fallback
                generateSimulatedPlaces(cityCoords[0], cityCoords[1]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [cityCoords]);

    // Mock city data for fallback
    const setMockCityData = (cityName: string) => {
        // Map common cities to coordinates
        const cityMap: Record<string, [number, number]> = {
            'new york': [40.7128, -74.0060],
            'los angeles': [34.0522, -118.2437],
            'chicago': [41.8781, -87.6298],
            'miami': [25.7617, -80.1918],
            'tokyo': [35.6762, 139.6503],
            'london': [51.5074, -0.1278],
            'paris': [48.8566, 2.3522],
            'rome': [41.9028, 12.4964],
            'sydney': [-33.8688, 151.2093],
            'hong kong': [22.3193, 114.1694]
        };

        // Try to find the city or use default coordinates
        const lowerCity = cityName.toLowerCase();
        let coords: [number, number] | null = null;

        // Check exact matches
        if (cityMap[lowerCity]) {
            coords = cityMap[lowerCity];
        } else {
            // Check partial matches
            for (const [key, value] of Object.entries(cityMap)) {
                if (lowerCity.includes(key) || key.includes(lowerCity)) {
                    coords = value;
                    break;
                }
            }
        }

        // If no match, use default (Miami)
        if (!coords) {
            coords = [25.7617, -80.1918];
        }

        setCityCoords(coords);
    };

    // Helper to calculate distance between points (in km)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in km
        return parseFloat(d.toFixed(1));
    };

    const deg2rad = (deg: number): number => {
        return deg * (Math.PI/180);
    };

    // Generate simulated places for fallback
    const generateSimulatedPlaces = (baseLat: number, baseLon: number) => {
        const simulatedPlaces: Place[] = [];

        // Sample names by category
        const namesByCategory: Record<string, string[]> = {
            accommodation: [
                "Grand Hotel", "City Plaza Hotel", "Seaside Resort",
                "Central Suites", "Downtown Inn", "Luxury Rooms",
                "Business Hotel", "Family Stay", "Comfort Lodge", "Park View Hotel"
            ],
            catering: [
                "Delicious Dining", "Urban Kitchen", "The Local Spot",
                "Fusion Restaurant", "Sunset Cafe", "City Grill",
                "Seafood Palace", "Fine Dining Experience", "Taste of Italy", "Asian Fusion"
            ],
            tourism: [
                "City Museum", "Historic District", "Culture Center",
                "Art Gallery", "Heritage Site", "Landmark Tower",
                "National Monument", "Waterfront Park", "Famous Bridge", "Observation Deck"
            ],
            entertainment: [
                "City Theater", "Live Music Venue", "Comedy Club",
                "Nightclub", "Cinema Center", "Performance Hall",
                "Game Arcade", "Bowling Alley", "Sports Bar", "Entertainment Complex"
            ],
            activity: [
                "Adventure Park", "Water Sports Center", "City Tours",
                "Bike Rentals", "Hiking Trails", "Fitness Center",
                "Yoga Studio", "Tennis Courts", "Golf Course", "Rock Climbing"
            ],
            commercial: [
                "Shopping Mall", "Downtown Market", "Fashion District",
                "Outlet Center", "Local Boutiques", "Souvenir Shop",
                "Department Store", "Electronics Shop", "Jewelry Store", "Book Shop"
            ]
        };

        // Random offset generator (max ~5km)
        const randomOffset = () => (Math.random() - 0.5) * 0.05;

        // Generate simulated places for each category
        PLACE_CATEGORIES.forEach(category => {
            const names = namesByCategory[category.id] || [];

            for (let i = 0; i < 10; i++) {
                const name = names[i % names.length] || `${category.name} ${i+1}`;
                const lat = baseLat + randomOffset();
                const lon = baseLon + randomOffset();

                simulatedPlaces.push({
                    id: `sim-${category.id}-${i}`,
                    name: name,
                    category: category.id,
                    address: "123 Main Street",
                    formattedAddress: "City Center",
                    phone: "+1 (555) 123-4567",
                    website: "https://example.com",
                    openingHours: "9:00 AM - 10:00 PM",
                    latitude: lat,
                    longitude: lon,
                    distance: calculateDistance(baseLat, baseLon, lat, lon)
                });
            }
        });

        // Sort by distance
        simulatedPlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setPlaces(simulatedPlaces);
    };

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Handle place selection
    const handlePlaceClick = (place: Place) => {
        if (onPlaceSelect) {
            onPlaceSelect(place);
        }
    };

    // Group places by category
    const placesByCategory = PLACE_CATEGORIES.map(category => {
        const categoryPlaces = places.filter(place => place.category === category.id);
        return {
            ...category,
            places: categoryPlaces
        };
    });

    return (
        <div className={`h-full overflow-y-auto ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-2">
                    Places in {location || 'Current Location'}
                </h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                        <p>Finding places...</p>
                    </div>
                ) : error ? (
                    <div className={`p-4 rounded-md ${isDark ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'}`}>
                        {error}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {placesByCategory.map(category => (
                            <div key={category.id} className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <div
                                    className={`p-3 flex items-center justify-between cursor-pointer ${category.color} text-white`}
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <div className="flex items-center">
                                        <span className="mr-2">{category.icon}</span>
                                        <h3 className="font-semibold">{category.name}</h3>
                                        <span className="ml-2 text-sm bg-white/20 px-1.5 rounded-full">
                      {category.places.length}
                    </span>
                                    </div>
                                    {expandedCategories[category.id] ? (
                                        <ChevronUp size={18} />
                                    ) : (
                                        <ChevronDown size={18} />
                                    )}
                                </div>

                                {expandedCategories[category.id] && (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {category.places.length > 0 ? (
                                            category.places.map(place => (
                                                <div
                                                    key={place.id}
                                                    className={`p-3 hover:${isDark ? 'bg-gray-700' : 'bg-gray-100'} cursor-pointer transition-colors`}
                                                    onClick={() => handlePlaceClick(place)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium">{place.name}</h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{place.address}</p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {place.distance !== undefined && (
                                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {place.distance} km
                                </span>
                                                            )}
                                                            <button
                                                                className="ml-2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                                                aria-label="Show on map"
                                                            >
                                                                <MapPinIcon size={16} className="text-blue-500" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Additional details */}
                                                    <div className="mt-2 text-sm space-y-1">
                                                        {place.phone && (
                                                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                                <Phone size={14} className="mr-1.5 flex-shrink-0" />
                                                                <span>{place.phone}</span>
                                                            </div>
                                                        )}
                                                        {place.website && (
                                                            <div className="flex items-center text-blue-600 dark:text-blue-400">
                                                                <Link size={14} className="mr-1.5 flex-shrink-0" />
                                                                <a
                                                                    href={place.website}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="truncate hover:underline"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {place.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {place.openingHours && (
                                                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                                <Clock size={14} className="mr-1.5 flex-shrink-0" />
                                                                <span>{place.openingHours}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                No {category.name.toLowerCase()} found in this area.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlacesList;