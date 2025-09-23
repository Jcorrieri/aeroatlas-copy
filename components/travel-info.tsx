"use client"

import { Plane, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {useTheme} from "next-themes";

interface TravelDetails {
    type: "flight"
    departure: string
    arrival: string
    departureDate: string
    returnDate: string
    flightUrl: string
}

interface TravelDetailsProps {
    details: TravelDetails
}

export function TravelInfo({ details } : TravelDetailsProps) {
    const { theme } = useTheme()
    const isDark = theme === 'dark';

    return (
        <div className={` ${ isDark ? 'bg-gray-800 text-white' : 'bg-gray-300 text-black'} rounded-xl p-6`}>
            <h2 className="text-2xl font-mono mb-4">Flight Information</h2>

            <div className={` ${ isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-400 border-gray-200'} rounded-lg p-4 border`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <Plane className={`w-6 h-6 mr-3 ${ isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                        <div>
                            <p className="font-semibold text-lg">
                                {details.departure} → {details.arrival}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-800'}`}>Round-Trip</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-2 px-3 ${isDark ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-800' : 'text-blue-500 hover:text-blue-400 hover:bg-gray-200'}`}
                        onClick={() =>
                            window.open(details.flightUrl, "_blank")
                        }
                    >
                        <span className="text-sm">Google Flights</span>
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={`${ isDark ? 'bg-gray-800' : 'bg-gray-300'} p-3 rounded-lg`}>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Departure</p>
                        <div className="flex items-center">
                            <Calendar className={`w-4 h-4 mr-2 ${ isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                            <p className="font-medium">{details.departureDate}</p>
                        </div>
                    </div>

                    <div className={`${ isDark ? 'bg-gray-800' : 'bg-gray-300'} p-3 rounded-lg`}>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-700'} mb-1`}>Return</p>
                        <div className="flex items-center">
                            <Calendar className={`w-4 h-4 mr-2 ${ isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                            <p className="font-medium">{details.returnDate}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}