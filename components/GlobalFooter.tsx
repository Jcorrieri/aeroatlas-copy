// components/GlobalFooter.tsx
"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";

export default function GlobalFooter() {
    const pathname = usePathname();

    // If we're on an aeroatlas page, do not render the global footer.
    if (pathname.startsWith("/aeroatlas")) {
        return null;
    }
    return <Footer />;
}
