"use client"


import * as React from "react"
import { useState, useEffect } from "react"
import { Blocks, Calendar, Settings2, Trash2, Utensils, Ticket, Beer, Hotel, ShoppingBag } from "lucide-react"
import { NavSecondary } from "@/app/(front)/components/nav-secondary"
import { NavWorkspaces } from "@/app/(front)/components/nav-workspaces"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { GeoapifyPlace, PlaceCategory, CATEGORY_COLORS } from "@/lib/geoapify"

type TripData = {
    lat: string | null;
    lon: string | null;
    from: string | null;
    to: string | null;
    type: string | null;
    displayName: string;
};

type SidebarLeftProps = React.ComponentProps<typeof Sidebar> & {
    tripData: TripData;
    activeCategory: PlaceCategory;
    categoryPlaces: GeoapifyPlace[];
    onPlaceClick: (place: GeoapifyPlace) => void;
    currentLocation?: string;
};

const data = {
    navSecondary: [
        { title: "Calendar", url: "#", icon: Calendar },
        { title: "Settings", url: "#", icon: Settings2 },
        { title: "Itineraries", url: "#", icon: Blocks },
        { title: "Trash", url: "#", icon: Trash2 },
    ],
    workspaces: [
        {
            name: "Travel & Adventure",
            emoji: "🧳",
            pages: [
                { name: "Trip Planning", url: "#", emoji: "🗺️" },
                { name: "Travel Bucket List", url: "#", emoji: "🌎" },
            ],
        },
    ],
};

// Category-specific icons for the sidebar
const categoryIcons = {
    restaurants: Utensils,
    attractions: Ticket,
    nightlife: Beer,
    hotels: Hotel,
    shopping: ShoppingBag,
};

export function SidebarLeft({
                                tripData,
                                activeCategory,
                                categoryPlaces,
                                onPlaceClick,
                                currentLocation,
                                ...props
                            }: SidebarLeftProps) {
    // Track which place is currently selected
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);


    useEffect(() => {
        console.log("SidebarLeft rendered with", categoryPlaces.length, "places");
    }, [categoryPlaces]);

    const getStarRating = (rating?: number) => {
        if (!rating) return "☆☆☆☆☆";
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return "★".repeat(fullStars) + (halfStar ? "⭑" : "") + "☆".repeat(emptyStars);
    };


    const getCategoryColor = (category: PlaceCategory) => {
        return category ? CATEGORY_COLORS[category] : CATEGORY_COLORS.default;
    };

    const categoryColor = getCategoryColor(activeCategory);

    // Handle place selection from sidebar
    const handlePlaceSelection = (place: GeoapifyPlace) => {
        console.log("Place selected from sidebar:", place.properties.name);
        setSelectedPlaceId(place.properties.place_id);

        // Call the parent component's handler
        if (onPlaceClick) {
            console.log("Calling parent onPlaceClick handler");
            onPlaceClick(place);
        } else {
            console.warn("No onPlaceClick handler provided to SidebarLeft");
        }
    };

    return (
        <Sidebar className="border-r-0" {...props}>
            <SidebarHeader>
                {activeCategory ? (
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center"
                            style={{ color: categoryColor }}>
                            {React.createElement(categoryIcons[activeCategory] || Blocks, {
                                className: "mr-2",
                                size: 18,
                                color: categoryColor
                            })}
                            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                        </h2>
                        <div className="text-sm text-muted-foreground mb-2">
                            Showing results for: {currentLocation || tripData.displayName}
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        <h2 className="text-xl font-bold">Trip Explorer</h2>
                        <div className="text-sm text-muted-foreground mt-1">
                            Select a category from the top navigation
                        </div>
                    </div>
                )}
            </SidebarHeader>
            <SidebarContent>
                {activeCategory && categoryPlaces.length > 0 ? (
                    <div className="space-y-2 px-4 py-2">
                        {categoryPlaces.map((place, index) => (
                            <div
                                key={place.properties.place_id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 
                                            ${selectedPlaceId === place.properties.place_id
                                    ? 'bg-accent/50 dark:bg-accent/40'
                                    : 'bg-card hover:bg-accent/20'}`}
                                style={{ borderLeftColor: categoryColor }}
                                onClick={() => handlePlaceSelection(place)}
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-6 h-6 mr-2 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                                        style={{ backgroundColor: categoryColor }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="font-medium">{place.properties.name}</div>
                                </div>
                                {place.properties.rating && (
                                    <div className="text-amber-500 text-sm ml-8">
                                        {getStarRating(place.properties.rating)}
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-1 ml-8">
                                    {place.properties.address_line1 || place.properties.city || ''}
                                </div>
                                {place.properties.distance && (
                                    <div className="text-xs font-medium mt-1 ml-8">
                                        {(place.properties.distance / 1000).toFixed(1)} km away
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : activeCategory ? (
                    <div className="p-4 text-center text-muted-foreground">
                        No {activeCategory} found in this area
                    </div>
                ) : (
                    <>
                        <NavWorkspaces workspaces={data.workspaces} />
                    </>
                )}

                {/* Always show the secondary nav at the bottom */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}