// app/aeroatlas/layout.tsx
import React from "react";
import { HeroHeader } from "@/components/Hero-header";

export default function AeroatlasLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        // Flex container with min-h-screen ensures the page always fills the viewport.
        <div className="flex flex-col min-h-screen">
            {/* Render the HeroHeader at the top */}
            {/*<HeroHeader />*/}
            {/* Main content area grows to fill remaining space */}
            <main className="flex-1">{children}</main>
        </div>
    );
}
