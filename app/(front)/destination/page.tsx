"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Save, Edit, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCityData } from "@/hooks/use-city-data"
import { Weather } from "@/components/weather"
import { TravelInfo } from "@/components/travel-info"
import { TravelRequirements } from "@/components/travel-requirements"
import { Itinerary } from "@/components/itinerary"
import {useSearchParams} from "next/navigation";


// Character limit for trip title
const TITLE_CHAR_LIMIT = 40



export default function TravelItinerary() {
    const searchParams = useSearchParams();

    const tripData = new URLSearchParams({
        lat: searchParams.get('lat') || '',
        lon: searchParams.get('lon') || '',
        from_: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        trip_type: searchParams.get('type') || '',
        location: decodeURIComponent(searchParams.get('displayName') || '')
    })

    let city = tripData.get("location")
    if (city != null) {
        city = city.split(", ")[0]
    }

    const { data, loading } = useCityData(tripData)
    const [tripTitle, setTripTitle] = useState("Summer Trip to " + city)
    const [editingTitle, setEditingTitle] = useState(false)
    const [tempTitle, setTempTitle] = useState(tripTitle)
    const [originalTitle, setOriginalTitle] = useState("Summer Trip to " + city)

    // Handle title change
    const startEditingTitle = () => {
        setTempTitle(tripTitle)
        setEditingTitle(true)
    }

    const saveTitle = () => {
        if (tempTitle.trim()) {
            setTripTitle(tempTitle)
        }
        setEditingTitle(false)
    }

    const cancelEditingTitle = () => {
        setEditingTitle(false)
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    if (!data) {
        return <div className="min-h-screen  flex items-center justify-center">Itinerary Not Available</div>
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
                    {/* Left Sidebar */}
                    <div className="space-y-8">
                        {/* Trip Title */}
                        <div className="flex items-center justify-between">
                            {editingTitle ? (
                                <div className="w-full">
                                    <div className="flex items-center w-full">
                                        <input
                                            type="text"
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            className="rounded px-2 py-1 w-full mr-2"
                                            autoFocus
                                            maxLength={TITLE_CHAR_LIMIT}
                                        />
                                        <Button variant="ghost" size="sm" onClick={cancelEditingTitle} className="text-red-400">
                                            <X className="w-5 h-5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={saveTitle}>
                                            <Check className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    <div className="text-xs mt-1">
                                        {tempTitle.length}/{TITLE_CHAR_LIMIT} characters
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-mono">{tripTitle}</h1>
                                    <Button variant="ghost" size="sm" onClick={startEditingTitle}>
                                        <Edit className="w-5 h-5" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* City Header */}
                        <div className="flex items-center gap-4">
                            <Image
                                src={data.countryIcon.imageUrl}
                                alt={data.countryIcon.alt}
                                width={60}
                                height={40}
                                className="rounded-md border border-gray-500"
                            />
                            <div>
                                <h2 className="text-xl font-mono">{data.cityName}</h2>
                                <p>{data.country}</p>
                            </div>
                            <div className="ml-auto">
                                <Weather summary={data.weatherSummary} />
                            </div>
                        </div>

                        {/* City Description */}
                        <div className="space-y-6">
                            <p className="text-lg leading-relaxed">{data.description}</p>
                            <div className="flex items-center gap-2.5">
                                <Button variant="default" className="rounded-full flex items-center gap-2" disabled={true}>
                                    <Save className="w-4 h-4" />
                                    Save Itinerary
                                </Button>
                                <p className="text-gray-500 italic">Coming Soon</p>
                            </div>
                        </div>

                        {/* Travel Requirements */}
                        <TravelRequirements
                            tripType={data.tripType}
                            requiredItems={data.requiredItems}
                        />
                    </div>

                    {/* Right Content */}
                    <div className="space-y-8">
                        {/* City Images Section */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-mono">Explore {data.cityName}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {data.images.map((image) => (
                                    <div
                                        key={image.id}
                                        className="relative aspect-square rounded-lg overflow-hidden group"
                                    >
                                        <Image
                                            src={image.url || "/placeholder.svg"}
                                            alt={`${city} image ${image.id}`}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Itinerary */}
                        <Itinerary items={data.itinerary} />

                        {/* Travel Info Component */}
                        <TravelInfo details={data.travelDetails} />
                    </div>
                </div>
            </div>
        </div>
    )
}