// import { SidebarLeft } from "@/app/(front)/components/sidebar-left"
// import react from "react";
// import {
//     SidebarInset, SidebarProvider, SidebarTrigger,
// } from "@/components/ui/sidebar"
// import {Separator} from "@/components/ui/separator";
//
//
// export default function Page () {
//     return (
//         <SidebarProvider>
//             <SidebarLeft />
//             <SidebarTrigger />
//             <Separator orientation="vertical" className="mr-2 h-4" />
//         </SidebarProvider>
//     )
// }












"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { SidebarLeft } from "@/app/(front)/components/sidebar-left";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function Page() {
    const searchParams = useSearchParams();

    // Create mock trip data to pass to SidebarLeft if it needs it
    const tripData = {
        lat: searchParams.get('lat') || null,
        lon: searchParams.get('lon') || null,
        from: searchParams.get('from') || null,
        to: searchParams.get('to') || null,
        type: searchParams.get('type') || 'vacation',
        displayName: searchParams.get('displayName') || ''
    };

    return (
        <SidebarProvider>
            <SidebarLeft tripData={tripData} activeCategory={null} categoryPlaces={[]} onPlaceClick={() => {}} currentLocation="" />
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
        </SidebarProvider>
    );
}