"use client";
// This is where you can modify the navigation links for AeroAtlas’s landing page.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Icons } from "@/components/icons";

export function HeroMainNav() {
    const pathname = usePathname();

    return (
        <div className="mr-4 hidden md:flex">
            {/* Logo and Site Name */}
            <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
                <Icons.logo className="h-6 w-6" />
                <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
            </Link>
            {/* Navigation Links with AeroAtlas friendly labels */}
            {/*<nav className="flex items-center gap-4 text-sm xl:gap-6">*/}
            {/*    <Link*/}
            {/*        href="/destinations"*/}
            {/*        className={cn(*/}
            {/*            "transition-colors hover:text-foreground/80",*/}
            {/*            pathname === "/destinations" ? "text-foreground" : "text-foreground/80"*/}
            {/*        )}*/}
            {/*    >*/}
            {/*        Destinations*/}
            {/*    </Link>*/}
            {/*    <Link*/}
            {/*        href="/itineraries"*/}
            {/*        className={cn(*/}
            {/*            "transition-colors hover:text-foreground/80",*/}
            {/*            pathname?.startsWith("/itineraries") ? "text-foreground" : "text-foreground/80"*/}
            {/*        )}*/}
            {/*    >*/}
            {/*        Itineraries*/}
            {/*    </Link>*/}
            {/*    <Link*/}
            {/*        href="/experiences"*/}
            {/*        className={cn(*/}
            {/*            "transition-colors hover:text-foreground/80",*/}
            {/*            pathname?.startsWith("/experiences") ? "text-foreground" : "text-foreground/80"*/}
            {/*        )}*/}
            {/*    >*/}
            {/*        Experiences*/}
            {/*    </Link>*/}
            {/*    <Link*/}
            {/*        href="/hotels"*/}
            {/*        className={cn(*/}
            {/*            "transition-colors hover:text-foreground/80",*/}
            {/*            pathname?.startsWith("/hotels") ? "text-foreground" : "text-foreground/80"*/}
            {/*        )}*/}
            {/*    >*/}
            {/*        Hotels*/}
            {/*    </Link>*/}
            {/*    <Link*/}
            {/*        href="/flights"*/}
            {/*        className={cn(*/}
            {/*            "transition-colors hover:text-foreground/80",*/}
            {/*            pathname?.startsWith("/flights") ? "text-foreground" : "text-foreground/80"*/}
            {/*        )}*/}
            {/*    >*/}
            {/*        Flights*/}
            {/*    </Link>*/}
            {/*    <Link*/}
            {/*        href="/travel-trends"*/}
            {/*        className={cn(*/}
            {/*            "transition-colors hover:text-foreground/80",*/}
            {/*            pathname?.startsWith("/travel-trends") ? "text-foreground" : "text-foreground/80"*/}
            {/*        )}*/}
            {/*    >*/}
            {/*        Travel Trends*/}
            {/*    </Link>*/}
            {/*</nav>*/}
        </div>
    );
}
