"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearch } from "@/app/(front)/components/textbox";
import { useTheme } from "next-themes";
import Script from 'next/script';

// Define types
interface PlaceDetails {
    name: string;
    displayName: string;
    type: string;
    latitude: number;
    longitude: number;
    address?: {
        road?: string;
        city?: string;
        state?: string;
        country?: string;
        postcode?: string;
    };
    amenity?: string;
    cuisine?: string;
    phone?: string;
    website?: string;
    openingHours?: string;
    isLoading: boolean;
}

interface MapStyle {
    id: string;
    name: string;
    urlTemplate?: string;
    description: string;
}

// Get API keys from environment variables
const LOCATIONIQ_API_KEY = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || "";
const CESIUM_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN || "";

// Default position (University of North Florida)
const DEFAULT_POSITION: [number, number] = [30.2661, -81.5072];

// CSS styles for Cesium and controls
const cesiumCSS = `
.cesium-container {
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* Hide Cesium widgets we don't need */
.cesium-viewer-toolbar,
.cesium-viewer-timelineContainer,
.cesium-viewer-animationContainer,
.cesium-viewer-fullscreenContainer,
.cesium-viewer-vrContainer,
.cesium-widget-credits {
  display: none !important;
}

.cesium-viewer-geocoderContainer {
  visibility: hidden;
}

/* Style controls */
.cesium-navigation-help,
.cesium-viewer-homeButton {
  background: rgba(255, 255, 255, 0.8) !important;
  border-radius: 4px !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3) !important;
}

.dark .cesium-navigation-help,
.dark .cesium-viewer-homeButton {
  background: rgba(40, 40, 40, 0.8) !important;
  filter: brightness(0.8);
}

/* Custom controls */
.cesium-custom-controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cesium-custom-control {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 4px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  font-weight: bold;
  color: #555;
  transition: all 0.2s ease;
}

.cesium-custom-control:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.dark .cesium-custom-control {
  background: rgba(40, 40, 40, 0.8);
  color: #eee;
}

.dark .cesium-custom-control:hover {
  background: rgba(60, 60, 60, 0.9);
}

/* Map style selector */
.map-style-selector {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  width: 150px;
}

.dark .map-style-selector {
  background: rgba(40, 40, 40, 0.8);
}

.map-style-selector select {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  appearance: none;
  cursor: pointer;
  color: #555;
  font-size: 14px;
}

.dark .map-style-selector select {
  color: #eee;
}

.map-style-selector:after {
  content: '';
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #555;
  pointer-events: none;
}

.dark .map-style-selector:after {
  border-top-color: #eee;
}

/* Waiting indicator */
.cesium-waiting {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 1000;
}

/* Error message */
.cesium-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  z-index: 1000;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
`;

// Info popup component - retained but not displayed by default
const InfoPopup = ({
                       placeDetails,
                       isDark,
                       isVisible,
                       onClose,
                       position = 'top-right'
                   }: {
    placeDetails: PlaceDetails;
    isDark: boolean;
    isVisible: boolean;
    onClose: () => void;
    position?: 'top-right' | 'bottom-right';
}) => {
    if (!isVisible) return null;
    if (placeDetails.isLoading) {
        return (
            <div className={`absolute ${position === 'top-right' ? 'top-24 right-24' : 'bottom-24 right-24'} p-4 rounded-lg shadow-lg z-50 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                Loading place details...
            </div>
        );
    }
    const positionClass = position === 'top-right' ? 'top-24 right-24' : 'bottom-24 right-24';
    return (
        <div className={`absolute ${positionClass} p-4 rounded-lg shadow-lg max-w-md z-50 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{placeDetails.name || "Selected Location"}</h3>
                <button onClick={onClose} className={`ml-4 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                    ×
                </button>
            </div>
            {placeDetails.displayName && <p className="text-sm mb-3">{placeDetails.displayName}</p>}
            <div className="grid grid-cols-3 gap-1 text-sm mb-2">
                <span className="font-semibold">Type:</span>
                <span className="col-span-2 capitalize">{placeDetails.type || "Unknown"}</span>
                <span className="font-semibold">Latitude:</span>
                <span className="col-span-2">{placeDetails.latitude.toFixed(6)}</span>
                <span className="font-semibold">Longitude:</span>
                <span className="col-span-2">{placeDetails.longitude.toFixed(6)}</span>
            </div>
            {(placeDetails.phone || placeDetails.website || placeDetails.openingHours) && (
                <div className="border-t pt-2 mt-2 text-sm">
                    {placeDetails.phone && (
                        <p className="mb-1"><span className="font-semibold">Phone:</span> {placeDetails.phone}</p>
                    )}
                    {placeDetails.website && (
                        <p className="mb-1 break-words">
                            <span className="font-semibold">Website:</span>{" "}
                            <a href={placeDetails.website} target="_blank" rel="noopener noreferrer" className={isDark ? "text-blue-300" : "text-blue-500"}>
                                {placeDetails.website.replace(/(^\w+:|^)\/\//, '')}
                            </a>
                        </p>
                    )}
                    {placeDetails.openingHours && (
                        <p><span className="font-semibold">Hours:</span> {placeDetails.openingHours}</p>
                    )}
                </div>
            )}
        </div>
    );
};

// Custom Zoom Controls component with improved styling
const ZoomControls = ({ onZoomIn, onZoomOut }: { onZoomIn: () => void, onZoomOut: () => void }) => {
    return (
        <div className="cesium-custom-controls">
            <button
                className="cesium-custom-control"
                onClick={onZoomIn}
                aria-label="Zoom in"
                title="Zoom in"
            >
                +
            </button>
            <button
                className="cesium-custom-control"
                onClick={onZoomOut}
                aria-label="Zoom out"
                title="Zoom out"
            >
                -
            </button>
        </div>
    );
};

// Map style selector component
const MapStyleSelector = ({ styles, currentStyle, onChange }: {
    styles: MapStyle[];
    currentStyle: string;
    onChange: (style: string) => void;
}) => {
    return (
        <div className="map-style-selector">
            <select
                value={currentStyle}
                onChange={(e) => onChange(e.target.value)}
                aria-label="Select map style"
            >
                {styles.map((style) => (
                    <option key={style.id} value={style.id}>
                        {style.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

// Common locations map with coordinates - used as fallback when API fails
const COMMON_LOCATIONS: Record<string, [number, number, string]> = {
    // US Cities
    "new york": [40.7128, -74.0060, "city"],
    "nyc": [40.7128, -74.0060, "city"],
    "los angeles": [34.0522, -118.2437, "city"],
    "la": [34.0522, -118.2437, "city"],
    "chicago": [41.8781, -87.6298, "city"],
    "san francisco": [37.7749, -122.4194, "city"],
    "sf": [37.7749, -122.4194, "city"],
    "miami": [25.7617, -80.1918, "city"],
    "seattle": [47.6062, -122.3321, "city"],
    "boston": [42.3601, -71.0589, "city"],
    "washington dc": [38.9072, -77.0369, "city"],
    "dc": [38.9072, -77.0369, "city"],
    "orlando": [28.5383, -81.3792, "city"],
    "dallas": [32.7767, -96.7970, "city"],
    "philadelphia": [39.9526, -75.1652, "city"],
    "houston": [29.7604, -95.3698, "city"],
    "phoenix": [33.4484, -112.0740, "city"],
    "las vegas": [36.1699, -115.1398, "city"],

    // World Cities
    "london": [51.5074, -0.1278, "city"],
    "paris": [48.8566, 2.3522, "city"],
    "tokyo": [35.6762, 139.6503, "city"],
    "sydney": [33.8688, 151.2093, "city"],
    "rome": [41.9028, 12.4964, "city"],
    "beijing": [39.9042, 116.4074, "city"],
    "moscow": [55.7558, 37.6173, "city"],
    "dubai": [25.2048, 55.2708, "city"],
    "hong kong": [22.3193, 114.1694, "city"],
    "singapore": [1.3521, 103.8198, "city"],
    "toronto": [43.6532, -79.3832, "city"],
    "bangkok": [13.7563, 100.5018, "city"],
    "berlin": [52.5200, 13.4050, "city"],
    "madrid": [40.4168, -3.7038, "city"],
    "seoul": [37.5665, 126.9780, "city"],
    "mexico city": [19.4326, -99.1332, "city"],
    "cairo": [30.0444, 31.2357, "city"],

    // Attractions
    "disney world": [28.3852, -81.5639, "attraction"],
    "disney": [28.3852, -81.5639, "attraction"],
    "eiffel tower": [48.8584, 2.2945, "attraction"],
    "statue of liberty": [40.6892, -74.0445, "attraction"],
    "grand canyon": [36.1069, -112.1129, "attraction"],
    "niagara falls": [43.0962, -79.0377, "attraction"],
    "taj mahal": [27.1751, 78.0421, "attraction"],
    "great wall of china": [40.4319, 116.5704, "attraction"],
    "pyramids of giza": [29.9773, 31.1325, "attraction"],
    "machu picchu": [-13.1631, -72.5450, "attraction"],
    "colosseum": [41.8902, 12.4922, "attraction"],
    "mount everest": [27.9881, 86.9250, "attraction"],

    // Other
    "university of north florida": [30.2661, -81.5072, "university"],
    "unf": [30.2661, -81.5072, "university"],
};

// Main component for Cesium globe
export default function StreetMap() {
    const { location, setFetchCoordinates } = useSearch();
    const [position, setPosition] = useState<[number, number]>(DEFAULT_POSITION);
    const [error, setError] = useState("");
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [popupVisible, setPopupVisible] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [cesiumReady, setCesiumReady] = useState(false);
    const [cesiumLoaded, setCesiumLoaded] = useState(false);
    const [waitingForSearch, setWaitingForSearch] = useState(false);
    const [initRetryCount, setInitRetryCount] = useState(0);
    const [placeDetails, setPlaceDetails] = useState<PlaceDetails>({
        name: "Selected Location",
        displayName: "",
        type: "",
        latitude: DEFAULT_POSITION[0],
        longitude: DEFAULT_POSITION[1],
        isLoading: false
    });

    // Store previous location to prevent duplicating searches
    const prevLocationRef = useRef<string>("");

    // Map style state
    const [currentMapStyle, setCurrentMapStyle] = useState<string>("aerial");

    // Available map styles
    const mapStyles: MapStyle[] = [
        {
            id: "aerial",
            name: "Aerial with Labels",
            description: "Satellite imagery with labels"
        },
        {
            id: "osm",
            name: "Street Map",
            urlTemplate: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            description: "Standard OpenStreetMap style"
        }
    ];

    // References
    const cesiumContainerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const locationRef = useRef<string>("");
    const cameraEventRef = useRef<any>(null);
    const initializationAttempted = useRef<boolean>(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cesiumLibraryCheckRef = useRef<NodeJS.Timeout | null>(null);

    // Fix hydration errors by setting isClient on mount
    useEffect(() => {
        setIsClient(true);
        locationRef.current = location;
    }, [location]);

    // Add CSS to document
    useEffect(() => {
        if (!isClient) return;

        // Add Cesium custom styles
        const style = document.createElement('style');
        style.textContent = cesiumCSS;
        document.head.appendChild(style);

        return () => {
            if (style.parentNode) {
                document.head.removeChild(style);
            }
        };
    }, [isClient]);

    // Get appropriate altitude based on location type
    const getAppropriateZoomAltitude = (locationType: string): number => {
        switch (locationType?.toLowerCase()) {
            case 'country': return 2000000;
            case 'state':
            case 'province':
            case 'region': return 500000;
            case 'city': return 15000;
            case 'town': return 10000;
            case 'village':
            case 'hamlet': return 5000;
            case 'suburb':
            case 'quarter':
            case 'neighbourhood':
            case 'neighborhood': return 3000;
            case 'university': return 5000;
            case 'building':
            case 'attraction':
            case 'hotel':
            case 'restaurant': return 2000;
            default: return 10000;
        }
    };

    // Create the imagery provider based on the selected style
    const createImageryProvider = (style: string, Cesium: any) => {
        const selectedStyle = mapStyles.find(s => s.id === style);

        try {
            switch (style) {
                case "aerial":
                    return Cesium.createWorldImagery({
                        style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS
                    });
                case "osm":
                    if (selectedStyle?.urlTemplate) {
                        return new Cesium.UrlTemplateImageryProvider({
                            url: selectedStyle.urlTemplate,
                            minimumLevel: 1,
                            maximumLevel: 19
                        });
                    }
                    return Cesium.createWorldImagery();
                default:
                    return Cesium.createWorldImagery();
            }
        } catch (err) {
            console.error("Error creating imagery provider:", err);
            // Fallback to default imagery
            return Cesium.createWorldImagery();
        }
    };

    // Function to enforce camera constraints - always look straight down
    const enforceCameraConstraints = () => {
        if (!viewerRef.current || !cesiumReady) return;

        try {
            const Cesium = (window as any).Cesium;
            if (!Cesium) return;

            const camera = viewerRef.current.camera;
            if (!camera) return;

            // Force the camera to always look straight down
            camera.setView({
                destination: camera.position,
                orientation: {
                    heading: camera.heading,
                    pitch: -Cesium.Math.PI_OVER_TWO, // Look straight down
                    roll: 0.0
                }
            });

            viewerRef.current.scene.requestRender();
        } catch (err) {
            console.error("Error enforcing camera constraints:", err);
        }
    };

    // Handle zoom in function with improved error handling and zoom behavior
    const handleZoomIn = () => {
        if (!viewerRef.current || !cesiumReady) return;

        try {
            const Cesium = (window as any).Cesium;
            if (!Cesium || !viewerRef.current.camera) return;

            const camera = viewerRef.current.camera;

            // More reliable way to get camera height
            let cameraHeight;
            try {
                const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(camera.position);
                if (cartographic) {
                    cameraHeight = cartographic.height;
                } else {
                    // Fallback if cartographic conversion fails
                    cameraHeight = camera.positionCartographic?.height || 10000000;
                }
            } catch (e) {
                console.warn("Error getting camera height, using default value", e);
                cameraHeight = 10000000; // Default value if we can't get height
            }

            // Improved zoom logic with better constraints
            if (cameraHeight > 100) {
                // More aggressive zoom for better UX
                const zoomFactor = Math.min(0.5, Math.max(0.2, 20000 / cameraHeight));

                try {
                    // First attempt: try using the zoomIn method
                    camera.zoomIn(cameraHeight * zoomFactor);
                } catch (zoomErr) {
                    console.warn("Primary zoom method failed, using alternative", zoomErr);

                    // Alternative method: manually set position
                    try {
                        const currentCartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(camera.position);
                        if (currentCartographic) {
                            const newHeight = cameraHeight * (1 - zoomFactor);
                            const newPosition = Cesium.Cartesian3.fromRadians(
                                currentCartographic.longitude,
                                currentCartographic.latitude,
                                newHeight
                            );

                            camera.setView({
                                destination: newPosition,
                                orientation: {
                                    heading: camera.heading,
                                    pitch: -Cesium.Math.PI_OVER_TWO,
                                    roll: 0.0
                                }
                            });
                        }
                    } catch (altErr) {
                        console.error("Alternative zoom method also failed", altErr);
                    }
                }

                // Ensure constraints are maintained
                enforceCameraConstraints();

                // Force render
                if (viewerRef.current.scene) {
                    viewerRef.current.scene.requestRender();
                }
            }
        } catch (err) {
            console.error("Error in zoom in handler:", err);
        }
    };

    // Handle zoom out function with improved error handling and zoom behavior
    const handleZoomOut = () => {
        if (!viewerRef.current || !cesiumReady) return;

        try {
            const Cesium = (window as any).Cesium;
            if (!Cesium || !viewerRef.current.camera) return;

            const camera = viewerRef.current.camera;

            // More reliable way to get camera height
            let cameraHeight;
            try {
                const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(camera.position);
                if (cartographic) {
                    cameraHeight = cartographic.height;
                } else {
                    // Fallback if cartographic conversion fails
                    cameraHeight = camera.positionCartographic?.height || 10000000;
                }
            } catch (e) {
                console.warn("Error getting camera height, using default value", e);
                cameraHeight = 10000000; // Default value if we can't get height
            }

            // Improved zoom logic with better constraints
            if (cameraHeight < 30000000) {
                // More aggressive zoom for better UX
                const zoomFactor = Math.min(0.8, Math.max(0.3, cameraHeight / 100000));

                try {
                    // First attempt: try using the zoomOut method
                    camera.zoomOut(cameraHeight * zoomFactor);
                } catch (zoomErr) {
                    console.warn("Primary zoom method failed, using alternative", zoomErr);

                    // Alternative method: manually set position
                    try {
                        const currentCartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(camera.position);
                        if (currentCartographic) {
                            const newHeight = cameraHeight * (1 + zoomFactor);
                            const newPosition = Cesium.Cartesian3.fromRadians(
                                currentCartographic.longitude,
                                currentCartographic.latitude,
                                newHeight
                            );

                            camera.setView({
                                destination: newPosition,
                                orientation: {
                                    heading: camera.heading,
                                    pitch: -Cesium.Math.PI_OVER_TWO,
                                    roll: 0.0
                                }
                            });
                        }
                    } catch (altErr) {
                        console.error("Alternative zoom method also failed", altErr);
                    }
                }

                // Ensure constraints are maintained
                enforceCameraConstraints();

                // Force render
                if (viewerRef.current.scene) {
                    viewerRef.current.scene.requestRender();
                }
            }
        } catch (err) {
            console.error("Error in zoom out handler:", err);
        }
    };

    // Check if Cesium is actually loaded in the window
    const checkCesiumLibrary = () => {
        if (typeof window !== 'undefined' && (window as any).Cesium) {
            if (cesiumLibraryCheckRef.current) {
                clearInterval(cesiumLibraryCheckRef.current);
                cesiumLibraryCheckRef.current = null;
            }
            if (!cesiumLoaded) {
                setCesiumLoaded(true);
            }
            return true;
        }
        return false;
    };

    // Initialize Cesium map with improved reliability
    const initializeCesiumMap = () => {
        if (!isClient || viewerRef.current) {
            return;
        }

        // Don't attempt initialization if container doesn't exist yet
        if (!cesiumContainerRef.current) {
            const retryTimer = setTimeout(() => {
                setInitRetryCount(count => count + 1);
            }, 150);
            return () => clearTimeout(retryTimer);
        }

        initializationAttempted.current = true;

        try {
            // Check if Cesium actually exists in window
            if (!checkCesiumLibrary()) {
                console.warn("Cesium library not found in window object, retrying...");
                const retryTimer = setTimeout(() => {
                    setInitRetryCount(count => count + 1);
                }, 200);
                return () => clearTimeout(retryTimer);
            }

            const Cesium = (window as any).Cesium;
            if (!Cesium) {
                setError("Cesium library not found. Please check your internet connection and refresh the page.");
                return;
            }

            // Configure Cesium token
            if (!CESIUM_ACCESS_TOKEN) {
                console.warn("No Cesium access token provided. Using default token.");
            }

            Cesium.Ion.defaultAccessToken = CESIUM_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ5NH0.XcKpgANiY19MC4bdFUXMVEBToBmBLvEFQtW-Gh12LXE';

            // Use minimal configuration for better performance
            const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
                baseLayerPicker: false,
                geocoder: false,
                homeButton: true,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                animation: false,
                fullscreenButton: false,
                infoBox: false,
                terrainProvider: new Cesium.EllipsoidTerrainProvider(),
                requestRenderMode: true, // Only render when needed
                maximumRenderTimeChange: Infinity,
                targetFrameRate: 30
            });

            // Disable the double-click zoom behavior for better UX
            viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            // Set imagery layer
            try {
                const imageryProvider = createImageryProvider(currentMapStyle, Cesium);
                viewer.imageryLayers.removeAll();
                viewer.imageryLayers.addImageryProvider(imageryProvider);
            } catch (err) {
                console.error("Error setting imagery provider:", err);
            }

            // Performance optimizations
            viewer.scene.globe.maximumScreenSpaceError = 2;
            viewer.scene.logarithmicDepthBuffer = false;
            viewer.scene.globe.enableLighting = false;
            viewer.scene.fog.enabled = false;
            viewer.scene.skyAtmosphere.show = true;

            // Disable tilt to maintain top-down view
            viewer.scene.screenSpaceCameraController.enableTilt = false;
            viewer.scene.screenSpaceCameraController.enableLook = true;
            viewer.scene.screenSpaceCameraController.enableRotate = true;

            // Start with the entire globe in view
            try {
                viewer.camera.flyHome(0); // Quick transition to home view
            } catch (err) {
                console.error("Error flying to home view:", err);
                // Fallback: manually set a view of the entire Earth
                const center = Cesium.Cartesian3.fromDegrees(0, 0, 12000000);
                viewer.camera.setView({
                    destination: center,
                    orientation: {
                        heading: 0.0,
                        pitch: -Cesium.Math.PI_OVER_TWO,
                        roll: 0.0
                    }
                });
            }

            // Add camera changed event listener to enforce constraints
            const cameraChangedCallback = () => {
                try {
                    // Always reset the pitch to look straight down
                    if (viewer.camera.pitch !== -Cesium.Math.PI_OVER_TWO || viewer.camera.roll !== 0) {
                        viewer.camera.setView({
                            destination: viewer.camera.position,
                            orientation: {
                                heading: viewer.camera.heading,
                                pitch: -Cesium.Math.PI_OVER_TWO,
                                roll: 0.0
                            }
                        });
                    }
                } catch (err) {
                    console.error("Error in camera constraint callback:", err);
                }
            };

            // Add the event listener
            viewer.camera.changed.addEventListener(cameraChangedCallback);
            cameraEventRef.current = cameraChangedCallback;

            // Create a marker for search results
            try {
                const pinBuilder = new Cesium.PinBuilder();
                const pinColor = isDark ? Cesium.Color.RED : Cesium.Color.ROYALBLUE;
                const pinImage = pinBuilder.fromColor(pinColor, 48).toDataURL();

                // Create pin entity initially hidden
                const pinEntity = viewer.entities.add({
                    name: "Selected Location",
                    position: Cesium.Cartesian3.fromDegrees(position[1], position[0]),
                    billboard: {
                        image: pinImage,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        scale: 0.8,
                        show: false
                    },
                    description: undefined
                });
                markerRef.current = pinEntity;
            } catch (err) {
                console.error("Error creating marker:", err);
            }

            // Disable default click behavior on entities
            viewer.screenSpaceEventHandler.setInputAction(() => {
                // No-op - prevent default click behavior
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // Save reference
            viewerRef.current = viewer;
            setCesiumReady(true);
            setError(""); // Clear any error messages

            // Immediately request a render to show the globe
            viewer.scene.requestRender();

            return () => {
                if (viewer && !viewer.isDestroyed()) {
                    if (cameraEventRef.current) {
                        viewer.camera.changed.removeEventListener(cameraEventRef.current);
                    }
                    viewer.entities.removeAll();
                    viewer.destroy();
                }
                viewerRef.current = null;
                markerRef.current = null;
                cameraEventRef.current = null;
            };
        } catch (err) {
            console.error("Error initializing Cesium:", err);
            setError("Failed to initialize map. Please refresh the page and try again.");

            // Retry initialization with a delay
            const retryTimer = setTimeout(() => {
                setInitRetryCount(count => count + 1);
            }, 500);
            return () => clearTimeout(retryTimer);
        }
    };

    // Update marker when theme changes
    useEffect(() => {
        if (!isClient || !viewerRef.current || !cesiumReady || !markerRef.current) return;

        try {
            const Cesium = (window as any).Cesium;
            if (!Cesium) return;

            const pinBuilder = new Cesium.PinBuilder();
            const pinColor = isDark ? Cesium.Color.RED : Cesium.Color.ROYALBLUE;
            const pinImage = pinBuilder.fromColor(pinColor, 48).toDataURL();

            markerRef.current.billboard.image = pinImage;
        } catch (err) {
            console.error("Error updating marker:", err);
        }
    }, [isDark, cesiumReady, isClient]);

    // Update map style when changed
    useEffect(() => {
        if (!viewerRef.current || !cesiumReady) return;

        try {
            const Cesium = (window as any).Cesium;
            if (!Cesium) return;

            const viewer = viewerRef.current;

            // Create new imagery provider
            const newImageryProvider = createImageryProvider(currentMapStyle, Cesium);

            // Update imagery layers
            viewer.imageryLayers.removeAll();
            viewer.imageryLayers.addImageryProvider(newImageryProvider);

            // Force render
            viewer.scene.requestRender();
        } catch (err) {
            console.error("Error updating map style:", err);
        }
    }, [currentMapStyle, cesiumReady]);

    // Handle successful location discovery and camera movement
    const handleLocationFound = (latitude: number, longitude: number, locationType: string) => {
        if (!viewerRef.current || !cesiumReady || !markerRef.current) {
            setError("Map is not ready. Please try again.");
            return false;
        }

        try {
            const Cesium = (window as any).Cesium;
            if (!Cesium) throw new Error("Cesium not available");

            // Set marker position
            markerRef.current.position = Cesium.Cartesian3.fromDegrees(longitude, latitude);

            // Show marker
            markerRef.current.billboard.show = true;

            // Get appropriate altitude based on location type
            const altitude = getAppropriateZoomAltitude(locationType);

            // Fly to location with orientation constraints
            viewerRef.current.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
                orientation: {
                    heading: 0.0,
                    pitch: -Cesium.Math.PI_OVER_TWO,
                    roll: 0.0
                },
                duration: 2.0,
                complete: function() {
                    enforceCameraConstraints();
                    viewerRef.current.scene.requestRender();
                }
            });

            // Clear any error messages
            setError("");
            return true;
        } catch (err) {
            console.error("Error navigating to location:", err);
            setError("An error occurred while navigating to the location.");
            return false;
        }
    };

    // Fallback with common locations when API fails
    const handleMockLocation = (searchQuery: string) => {
        const searchLower = searchQuery.toLowerCase().trim();

        // First try exact matches
        for (const [key, [lat, lon, type]] of Object.entries(COMMON_LOCATIONS)) {
            if (searchLower === key) {
                setPosition([lat, lon]);
                return handleLocationFound(lat, lon, type);
            }
        }

        // Then try partial matches
        for (const [key, [lat, lon, type]] of Object.entries(COMMON_LOCATIONS)) {
            if (searchLower.includes(key) || key.includes(searchLower)) {
                setPosition([lat, lon]);
                return handleLocationFound(lat, lon, type);
            }
        }

        // If no match found, return false
        return false;
    };

    // Fetch place details (for future use if needed)
    const fetchPlaceDetails = async (lat: number, lon: number) => {
        if (!LOCATIONIQ_API_KEY) {
            console.warn("LocationIQ API key is missing");
            return;
        }
        setPlaceDetails(prev => ({ ...prev, isLoading: true }));
        try {
            const response = await axios.get(
                `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json&namedetails=1&extratags=1`,
                { timeout: 5000 }
            );

            const data = response.data;

            setPlaceDetails({
                name: data.namedetails?.name || data.name || locationRef.current || "Selected Location",
                displayName: data.display_name || "",
                type: data.type || "Unknown",
                latitude: parseFloat(data.lat),
                longitude: parseFloat(data.lon),
                address: data.address,
                amenity: data.extratags?.amenity,
                cuisine: data.extratags?.cuisine,
                phone: data.extratags?.phone || data.extratags?.contact_phone,
                website: data.extratags?.website || data.extratags?.url,
                openingHours: data.extratags?.opening_hours,
                isLoading: false
            });
        } catch (err) {
            console.error("Error fetching place details:", err);

            setPlaceDetails({
                name: locationRef.current || "Selected Location",
                displayName: "",
                type: "Unknown",
                latitude: lat,
                longitude: lon,
                isLoading: false
            });
        }
    };

    // Fetch coordinates function for search
    const fetchCoordinates = async () => {
        // Clear any previous search timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }

        if (!locationRef.current.trim()) {
            setError("Please enter a location.");
            return;
        }

        // Skip if this is the same search as before
        if (prevLocationRef.current === locationRef.current) {
            return;
        }

        prevLocationRef.current = locationRef.current;

        setError("");
        setPopupVisible(false);
        setWaitingForSearch(true);

        // If we don't have an API key or if the map isn't ready, fall back to mock data
        if (!LOCATIONIQ_API_KEY || !viewerRef.current || !cesiumReady) {
            console.warn("Using mock location data (no API key or map not ready)");
            if (handleMockLocation(locationRef.current)) {
                setWaitingForSearch(false);
                return;
            } else if (!LOCATIONIQ_API_KEY) {
                setError("LocationIQ API key is missing. Using built-in locations only.");
                setWaitingForSearch(false);
                return;
            }
        }

        try {
            // Direct API call with custom timeout and error handling
            const response = await axios({
                method: 'get',
                url: `https://us1.locationiq.com/v1/search.php`,
                params: {
                    key: LOCATIONIQ_API_KEY,
                    q: locationRef.current,
                    format: 'json'
                },
                timeout: 5000  // 5-second timeout
            });

            if (response.data && response.data.length > 0) {
                const { lat, lon, type } = response.data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);

                // Update position
                setPosition([latitude, longitude]);
                handleLocationFound(latitude, longitude, type || '');

                // Fetch details (optional)
                try {
                    await fetchPlaceDetails(latitude, longitude);
                } catch (detailsErr) {
                    console.warn("Could not fetch details, continuing anyway", detailsErr);
                }
            } else {
                // Try the mock data as a fallback
                if (!handleMockLocation(locationRef.current)) {
                    setError("Location not found. Please try a different search term.");
                }
            }
        } catch (err: any) {
            console.error("Error fetching location:", err);

            // Handle rate limiting errors specifically
            if (err.response && err.response.status === 429) {
                console.warn("API rate limit exceeded, using fallback data");
                // Try the mock data as a fallback
                if (!handleMockLocation(locationRef.current)) {
                    setError("API rate limit exceeded. Using built-in locations.");
                }
            } else {
                // Try the mock data for any error
                if (!handleMockLocation(locationRef.current)) {
                    setError("Failed to fetch location. Please try again later.");
                }
            }
        } finally {
            setWaitingForSearch(false);
        }
    };

    // Set up location tracking and coordinates fetching
    useEffect(() => {
        // Track location changes without triggering search
        locationRef.current = location;

        // Set the fetch coordinates function in the parent component
        // This will be called when the user presses Enter or clicks the search button
        if (setFetchCoordinates) {
            setFetchCoordinates(() => fetchCoordinates);
        }

        // No longer auto-searching as user types
        // The search will only happen when fetchCoordinates is explicitly called

    }, [location]);

    // Handle Cesium script loading
    const handleCesiumLoaded = () => {
        console.log("Cesium script loading callback triggered");
        setCesiumLoaded(true);

        // Also check if Cesium is actually in window
        if (!checkCesiumLibrary()) {
            // Start polling to check if Cesium gets loaded
            if (!cesiumLibraryCheckRef.current) {
                cesiumLibraryCheckRef.current = setInterval(checkCesiumLibrary, 100);
            }
        }
    };

    // Initialize Cesium once script is loaded
    useEffect(() => {
        if (isClient) {
            if ((cesiumLoaded || checkCesiumLibrary()) && !viewerRef.current) {
                // Use a shorter timeout to make the map appear faster
                const timer = setTimeout(() => {
                    initializeCesiumMap();
                }, 50);

                return () => clearTimeout(timer);
            }
        }
    }, [cesiumLoaded, isClient, initRetryCount]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (cesiumLibraryCheckRef.current) {
                clearInterval(cesiumLibraryCheckRef.current);
            }
        };
    }, []);

    // Verify script loading status for guest mode
    useEffect(() => {
        // This effect ensures the script loading even if onLoad doesn't fire
        if (isClient && !cesiumLoaded) {
            const scriptCheck = setTimeout(() => {
                if (checkCesiumLibrary()) {
                    console.log("Cesium found in window object");
                } else {
                    console.log("Cesium not found in window, checking again");
                    // If Cesium isn't available after a delay, we might need to reload the script
                    const existingScript = document.querySelector('script[src*="cesium"]');
                    if (!existingScript) {
                        console.log("No Cesium script found, attempting to add it manually");
                        const script = document.createElement('script');
                        script.src = "https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Cesium.js";
                        script.onload = handleCesiumLoaded;
                        document.head.appendChild(script);

                        // Also add the CSS
                        const link = document.createElement('link');
                        link.rel = "stylesheet";
                        link.href = "https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Widgets/widgets.css";
                        document.head.appendChild(link);
                    }
                }
            }, 1000);

            return () => clearTimeout(scriptCheck);
        }
    }, [isClient, cesiumLoaded]);

    return (
        <div className="w-full h-full relative">
            {isClient && (
                <>
                    {/* Load Cesium scripts with more reliable loading strategy */}
                    <Script
                        src="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Cesium.js"
                        onLoad={handleCesiumLoaded}
                        strategy="beforeInteractive"
                        id="cesium-script"
                    />
                    <link
                        rel="stylesheet"
                        href="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Widgets/widgets.css"
                        id="cesium-css"
                    />
                </>
            )}

            {/* Container for the Cesium viewer */}
            {isClient && (
                <div className="w-full h-full relative">
                    <div
                        ref={cesiumContainerRef}
                        className="cesium-container"
                    >
                        {/* Custom zoom controls */}
                        {cesiumReady && (
                            <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut}/>
                        )}

                        {/* Map style selector */}
                        {cesiumReady && (
                            <MapStyleSelector
                                styles={mapStyles}
                                currentStyle={currentMapStyle}
                                onChange={(style) => setCurrentMapStyle(style)}
                            />
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="cesium-error">{error}</div>
                        )}

                        {/* Waiting indicator */}
                        {waitingForSearch && (
                            <div className="cesium-waiting">
                                Searching for location...
                            </div>
                        )}
                    </div>

                    {/* Loading indicator */}
                    {(!cesiumReady) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
                            <div className="text-white text-xl font-semibold">Loading map...</div>
                        </div>
                    )}

                    {/* Info popup - hidden by default */}
                    <InfoPopup
                        placeDetails={placeDetails}
                        isDark={isDark}
                        isVisible={popupVisible}
                        onClose={() => setPopupVisible(false)}
                    />
                </div>
            )}

            {/* Fallback for server-side rendering */}
            {!isClient && (
                <div className="h-screen w-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                    <div className="text-center">
                        <p>Loading interactive map...</p>
                    </div>
                </div>
            )}
        </div>
    );
}