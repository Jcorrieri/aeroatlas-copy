"use client";


import React, { useEffect, useState, CSSProperties } from "react";
import { SidebarLeft } from "@/app/(front)/components/sidebar-left";
import { SidebarRight } from "@/app/(front)/components/sidebar-right";
import StreetMap from "@/components/streetmap";
import { SearchProvider, useSearch } from "@/app/(front)/components/textbox";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/ui/sidebar";
import TextboxWithButton from "@/app/(front)/components/textbox";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearchParams } from 'next/navigation';
import { HeroHeader } from "@/components/Hero-header";
import { fetchPlacesByCategory, GeoapifyPlace, PlaceCategory } from "@/lib/geoapify";

function AppLayout() {
    const searchParams = useSearchParams();
    const isGuest = searchParams.get('guest') === 'true';
    const [leftSidebarVisible, setLeftSidebarVisible] = useState(false);
    const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { location, setFetchCoordinates } = useSearch();

    // Get the category from URL params
    const categoryParam = searchParams.get('category') as PlaceCategory;
    const [activeCategory, setActiveCategory] = useState<PlaceCategory>(null);
    const [categoryPlaces, setCategoryPlaces] = useState<GeoapifyPlace[]>([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<GeoapifyPlace | null>(null);

    // Keep track of current coordinates for place search
    const [currentCoords, setCurrentCoords] = useState<{lat: number, lon: number} | null>(null);

    // Keep track of current location name for display
    const [currentLocation, setCurrentLocation] = useState<string>("");

    // Debug state changes with very explicit console logs
    useEffect(() => {
        console.log("Left sidebar visibility state changed to:", leftSidebarVisible);
    }, [leftSidebarVisible]);

    useEffect(() => {
        console.log("Right sidebar visibility state changed to:", rightSidebarVisible);
    }, [rightSidebarVisible]);

    // Update active category when URL param changes
    useEffect(() => {
        // Clear places when category changes to avoid showing old markers
        setCategoryPlaces([]);
        setActiveCategory(categoryParam);
    }, [categoryParam]);

    // Extract trip data from URL parameters
    const tripData = {
        lat: searchParams.get('lat'),
        lon: searchParams.get('lon'),
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        type: searchParams.get('type'),
        displayName: decodeURIComponent(searchParams.get('displayName') || '')
    };

    // Initialize current coordinates and location from trip data
    useEffect(() => {
        if (tripData.lat && tripData.lon) {
            setCurrentCoords({
                lat: parseFloat(tripData.lat),
                lon: parseFloat(tripData.lon)
            });
        }

        if (tripData.displayName) {
            setCurrentLocation(tripData.displayName);
        }
    }, [tripData.lat, tripData.lon, tripData.displayName]);

    // Function to update location name
    const updateLocationName = (name: string) => {
        if (name) {
            setCurrentLocation(name);
        }
    };

    // Function to update coordinates and location name
    const updateCoordinates = (lat: number, lon: number, locationName?: string) => {
        setCurrentCoords({ lat, lon });
        if (locationName) {
            setCurrentLocation(locationName);
        }
    };

    // Fetch places when category or location coordinates change
    useEffect(() => {
        // Skip if no category is selected or no location is available
        if (!activeCategory || !currentCoords) {
            setCategoryPlaces([]);
            return;
        }

        async function loadPlaces() {
            setLoadingPlaces(true);
            try {
                // Ensure currentCoords is not null before accessing its properties
                if (!activeCategory || !currentCoords) {
                    setCategoryPlaces([]);
                    setLoadingPlaces(false);
                    return;
                }

                const places = await fetchPlacesByCategory(
                    activeCategory,
                    currentCoords.lat,
                    currentCoords.lon
                );
                setCategoryPlaces(places);
            } catch (error) {
                console.error("Error loading places:", error);
                setCategoryPlaces([]);
            } finally {
                setLoadingPlaces(false);
            }
        }

        loadPlaces();
    }, [activeCategory, currentCoords]);

    const toggleLeftSidebar = () => {
        console.log("Toggle left sidebar button clicked! Current state:", leftSidebarVisible);
        const newState = !leftSidebarVisible;
        setLeftSidebarVisible(newState);

        // Direct DOM manipulation as a last resort
        const sidebar = document.querySelector('.left-sidebar') as HTMLElement;
        if (sidebar) {
            console.log("Found sidebar element, applying transform directly");
            sidebar.style.transform = newState ? 'translateX(0)' : 'translateX(-100%)';
        } else {
            console.log("Could not find sidebar element for direct manipulation!");
        }
    };

    const toggleRightSidebar = () => {
        console.log("Toggle right sidebar button clicked! Current state:", rightSidebarVisible);
        const newState = !rightSidebarVisible;
        setRightSidebarVisible(newState);

        // Direct DOM manipulation as a last resort
        const sidebar = document.querySelector('.right-sidebar') as HTMLElement;
        if (sidebar) {
            console.log("Found sidebar element, applying transform directly");
            sidebar.style.transform = newState ? 'translateX(0)' : 'translateX(100%)';
        } else {
            console.log("Could not find sidebar element for direct manipulation!");
        }
    };

    // When a category is selected, automatically open the left sidebar
    useEffect(() => {
        if (activeCategory && !leftSidebarVisible) {
            console.log("Category selected, opening left sidebar automatically");
            toggleLeftSidebar();
        }
    }, [activeCategory]);

    // Handle place selection with more logging
    const handlePlaceClick = (place: GeoapifyPlace) => {
        console.log("Place clicked from sidebar:", place.properties.name);
        console.log("Setting selected place:", place.properties.place_id);
        setSelectedPlace(place);
    };

    const baseButtonStyle: CSSProperties = {
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2000, // Much higher z-index
        width: '40px',
        height: '40px',
        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease',
        border: isDark ? '1px solid rgba(55, 65, 81, 0.5)' : '1px solid rgba(229, 231, 235, 0.8)',
        color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
        pointerEvents: 'auto'
    };

    const leftButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        left: leftSidebarVisible ? '280px' : '10px'
    };

    const rightButtonStyle: CSSProperties = {
        ...baseButtonStyle,
        right: rightSidebarVisible ? '280px' : '10px'
    };

    const searchBoxStyle: CSSProperties = {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '600px',
        zIndex: 50
    };

    // Apply CSS styles for sidebars directly
    useEffect(() => {
        const leftSidebar = document.querySelector('.left-sidebar') as HTMLElement;
        const rightSidebar = document.querySelector('.right-sidebar') as HTMLElement;

        if (leftSidebar) {
            leftSidebar.style.position = 'fixed';
            leftSidebar.style.top = '0';
            leftSidebar.style.bottom = '0';
            leftSidebar.style.left = '0';
            leftSidebar.style.width = '280px';
            leftSidebar.style.transition = 'transform 0.3s ease';
            leftSidebar.style.transform = leftSidebarVisible ? 'translateX(0)' : 'translateX(-100%)';
            leftSidebar.style.zIndex = '40';
        }

        if (rightSidebar) {
            rightSidebar.style.position = 'fixed';
            rightSidebar.style.top = '0';
            rightSidebar.style.bottom = '0';
            rightSidebar.style.right = '0';
            rightSidebar.style.width = '280px';
            rightSidebar.style.transition = 'transform 0.3s ease';
            rightSidebar.style.transform = rightSidebarVisible ? 'translateX(0)' : 'translateX(100%)';
            rightSidebar.style.zIndex = '40';
        }
    }, [leftSidebarVisible, rightSidebarVisible]);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Show the Hero header for guest mode */}
            {isGuest && <HeroHeader />}

            {/* Map with trip data */}
            <div className="absolute inset-0">
                <StreetMap
                    initialLat={tripData.lat ? parseFloat(tripData.lat) : undefined}
                    initialLon={tripData.lon ? parseFloat(tripData.lon) : undefined}
                    tripName={tripData.displayName}
                    activeCategory={activeCategory}
                    categoryPlaces={categoryPlaces}
                    onPlaceSelected={handlePlaceClick}
                    onLocationUpdated={updateCoordinates}
                    selectedPlace={selectedPlace} /* Pass the selected place to map */
                />
            </div>

            {/* Authenticated UI Elements */}
            {!isGuest && (
                <>
                    <div className={`left-sidebar z-40 ${leftSidebarVisible ? 'visible' : 'hidden'}`}>
                        <SidebarLeft
                            tripData={tripData}
                            activeCategory={activeCategory}
                            categoryPlaces={categoryPlaces}
                            onPlaceClick={handlePlaceClick}
                            currentLocation={currentLocation}
                        />
                    </div>

                    <div className={`right-sidebar z-40 ${rightSidebarVisible ? 'visible' : 'hidden'}`}>
                        <SidebarRight />
                    </div>

                    {/* Left sidebar toggle button - completely separate from other elements */}
                    <button
                        id="leftToggleButton"
                        style={leftButtonStyle}
                        onClick={() => toggleLeftSidebar()}
                        aria-label="Toggle left sidebar"
                        className="sidebar-toggle-left"
                    >
                        {leftSidebarVisible ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>

                    {/* Right sidebar toggle button - completely separate from other elements */}
                    <button
                        id="rightToggleButton"
                        style={rightButtonStyle}
                        onClick={() => toggleRightSidebar()}
                        aria-label="Toggle right sidebar"
                        className="sidebar-toggle-right"
                    >
                        {rightSidebarVisible ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </>
            )}

            {/* Search Box */}
            <div style={searchBoxStyle}>
                <TextboxWithButton initialValue={tripData.displayName} />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <SidebarProvider>
            <SearchProvider>
                <AppLayout />
            </SearchProvider>
        </SidebarProvider>
    );
}