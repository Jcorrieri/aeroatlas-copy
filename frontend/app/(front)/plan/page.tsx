"use client";

import { useState, useEffect, useRef } from "react";
import { DatePickerWithRange } from "@/app/(front)/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";

type Location = {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        city?: string;
        state?: string;
        country?: string;
    };
};

export default function PlanTripPage() {
    const router = useRouter();
    const [locationQuery, setLocationQuery] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [travelType, setTravelType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Sync input with selected location
    useEffect(() => {
        if (selectedLocation?.display_name !== locationQuery) {
            setLocationQuery(selectedLocation?.display_name || "");
        }
    }, [selectedLocation]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setLocations([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch autocomplete suggestions directly from LocationIQ
    useEffect(() => {
        const controller = new AbortController();

        const fetchLocations = async () => {
            const query = locationQuery.trim();
            if (query.length < 2) {
                setLocations([]);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const apiUrl = new URL("https://api.locationiq.com/v1/autocomplete");
                apiUrl.searchParams.set('key', process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || "");
                apiUrl.searchParams.set('q', query);
                apiUrl.searchParams.set('limit', '5');
                apiUrl.searchParams.set('tag', 'place:city,place:town');
                apiUrl.searchParams.set('format', 'json');

                const response = await fetch(apiUrl.toString(), {
                    method: "GET",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                }

                const data = await response.json();

                // Transform LocationIQ response to our format
                const transformedData: Location[] = data.map((item: any) => ({
                    display_name: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                    address: {
                        city: item.address.city || item.address.town ||
                            item.address.village || item.address.municipality || "",
                        state: item.address.state || "",
                        country: item.address.country || ""
                    }
                }));

                setLocations(transformedData);
            } catch (err: any) {
                if (!controller.signal.aborted) {
                    setError(err.message || "Failed to fetch locations");
                    setLocations([]);
                }
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchLocations, 300);
        return () => {
            controller.abort();
            clearTimeout(debounceTimer);
        };
    }, [locationQuery]);

    // Handle location selection
    const handleLocationSelect = (location: Location) => {
        setSelectedLocation(location);
        setLocations([]);
    };

    // Submit trip details
    const handleSubmit = () => {
        setError("");

        // Validate required fields
        if (!locationQuery.trim()) {
            setError("Please enter a destination");
            return;
        }
        if (!dateRange?.from || !dateRange?.to) {
            setError("Please select travel dates");
            return;
        }
        if (!travelType) {
            setError("Please select a travel type");
            return;
        }

        // Prepare parameters
        const params = new URLSearchParams({
            displayName: encodeURIComponent(locationQuery.trim()),
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            type: travelType,
            ...(selectedLocation && {
                lat: selectedLocation.lat,
                lon: selectedLocation.lon
            })
        });


        router.push(`/login?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto space-y-6">
                {/* Search Section */}
                <div className="space-y-2 relative" ref={searchContainerRef}>
                    <label className="block text-sm font-medium text-foreground">
                        Destination
                    </label>
                    <input
                        type="text"
                        placeholder="Enter city, country, or address"
                        className="w-full px-4 py-3 border-2 rounded-lg bg-card text-foreground
                            focus:ring-4 focus:ring-blue-300 focus:border-blue-500"
                        value={locationQuery}
                        onChange={(e) => {
                            setLocationQuery(e.target.value);
                            setSelectedLocation(null);
                            setError("");
                        }}
                        autoComplete="off"
                    />

                    {/* Autocomplete Suggestions */}
                    {locations.length > 0 && (
                        <div className="absolute z-20 w-full mt-2 bg-card border rounded-lg shadow-xl max-h-80 overflow-y-auto">
                            {locations.map((loc) => (
                                <div
                                    key={`${loc.lat}-${loc.lon}`}
                                    className="p-4 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                    onClick={() => handleLocationSelect(loc)}
                                >
                                    <div className="font-semibold text-foreground">
                                        {loc.address.city || loc.address.country || loc.display_name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {[loc.address.state, loc.address.country]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Loading/Error States */}
                    {loading && (
                        <div className="absolute z-20 w-full p-3 bg-card text-sm text-muted-foreground">
                            Searching for "{locationQuery}"...
                        </div>
                    )}
                    {!loading && locationQuery.length >= 2 && locations.length === 0 && !selectedLocation && (
                        <div className="absolute z-20 w-full mt-2 bg-card border rounded-lg shadow-xl p-4 text-muted-foreground">
                            {error || "No matches found - feel free to use custom input"}
                        </div>
                    )}
                </div>

                {/* Date Range Picker */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                        Travel Dates
                    </label>
                    <DatePickerWithRange
                        onSelect={setDateRange}
                        className="w-full bg-card text-foreground"
                    />
                </div>

                {/* Travel Type Selector */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                        Travel Type
                    </label>
                    <select
                        value={travelType}
                        onChange={(e) => setTravelType(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-lg bg-card text-foreground focus:ring-4 focus:ring-blue-300 focus:border-blue-500"
                    >
                        <option value="">Select travel type...</option>
                        <option value="Personal">Personal</option>
                        <option value="Business">Business</option>
                        <option value="Family">Family</option>
                    </select>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                        ⚠️ {error}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all"
                >
                    Continue to Planning
                </Button>
            </div>
        </div>
    );
}