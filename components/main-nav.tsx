// // "use client"
// //
// //
// // import Link from "next/link"
// // import { usePathname, useSearchParams } from "next/navigation"
// //
// // import { siteConfig } from "@/config/site"
// // import { cn } from "@/lib/utils"
// // import { Icons } from "@/components/icons"
// //
// // export function MainNav() {
// //     const pathname = usePathname()
// //     const searchParams = useSearchParams();
// //
// //     // Check if in guest mode
// //     const isGuest = searchParams.get('guest') === 'true';
// //
// //     // Get current search params to maintain them
// //     const currentParams = new URLSearchParams(searchParams.toString());
// //
// //     // Create link builder function that preserves existing params but sets the category
// //     const createCategoryLink = (category: string | null) => {
// //         const params = new URLSearchParams(currentParams.toString());
// //         if (category) {
// //             params.set('category', category);
// //         } else {
// //             params.delete('category');
// //         }
// //         return `${pathname}?${params.toString()}`;
// //     };
// //
// //     // Get current category
// //     const currentCategory = searchParams.get('category');
// //
// //     // Logo link should go to landing page only in guest mode, nowhere when logged in
// //     const logoLinkDestination = isGuest ? "/" : "#";
// //
// //     return (
// //         <div className="mr-4 hidden md:flex">
// //             {/* Logo link changes based on guest mode */}
// //             <Link
// //                 href={logoLinkDestination}
// //                 className="mr-4 flex items-center gap-2 lg:mr-6"
// //                 onClick={(e) => {
// //                     // Prevent default action when logged in (not guest mode)
// //                     if (!isGuest) {
// //                         e.preventDefault();
// //                     }
// //                 }}
// //             >
// //                 <Icons.logo className="h-6 w-6" />
// //                 <span className="hidden font-bold lg:inline-block">
// //                     {siteConfig.name}
// //                 </span>
// //             </Link>
// //             <nav className="flex items-center gap-4 text-sm xl:gap-6">
// //                 <Link
// //                     href={createCategoryLink('restaurants')}
// //                     className={cn(
// //                         "transition-colors hover:text-foreground/80",
// //                         currentCategory === "restaurants" ? "text-foreground" : "text-foreground/80"
// //                     )}
// //                 >
// //                     Local Restaurants
// //                 </Link>
// //                 <Link
// //                     href={createCategoryLink('attractions')}
// //                     className={cn(
// //                         "transition-colors hover:text-foreground/80",
// //                         currentCategory === "attractions" ? "text-foreground" : "text-foreground/80"
// //                     )}
// //                 >
// //                     Main Attractions
// //                 </Link>
// //                 <Link
// //                     href={createCategoryLink('nightlife')}
// //                     className={cn(
// //                         "transition-colors hover:text-foreground/80",
// //                         currentCategory === "nightlife" ? "text-foreground" : "text-foreground/80"
// //                     )}
// //                 >
// //                     Night Life
// //                 </Link>
// //                 <Link
// //                     href={createCategoryLink('hotels')}
// //                     className={cn(
// //                         "transition-colors hover:text-foreground/80",
// //                         currentCategory === "hotels" ? "text-foreground" : "text-foreground/80"
// //                     )}
// //                 >
// //                     Hotels
// //                 </Link>
// //                 <Link
// //                     href={createCategoryLink('shopping')}
// //                     className={cn(
// //                         "transition-colors hover:text-foreground/80",
// //                         currentCategory === "shopping" ? "text-foreground" : "text-foreground/80"
// //                     )}
// //                 >
// //                     Shopping
// //                 </Link>
// //                 <Link
// //                     href={createCategoryLink(null)}
// //                     className={cn(
// //                         "transition-colors hover:text-foreground/80",
// //                         pathname?.startsWith("/colors")
// //                             ? "text-foreground"
// //                             : "text-foreground/80"
// //                     )}
// //                 >
// //                     Flights
// //                 </Link>
// //
// //                 <Link
// //                     href={`/destination?${searchParams.toString()}`}
// //                     className={cn(
// //                         "transition-colors hover:text-foreground/80",
// //                         pathname?.startsWith("/destination")
// //                             ? "text-foreground"
// //                             : "text-foreground/80"
// //                     )}
// //                 >
// //                     Itinerary
// //                 </Link>
// //             </nav>
// //         </div>
// //     )
// // }
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// "use client"
//
//
// import Link from "next/link"
// import { usePathname, useSearchParams } from "next/navigation"
//
// import { siteConfig } from "@/config/site"
// import { cn } from "@/lib/utils"
// import { Icons } from "@/components/icons"
//
// export function MainNav() {
//     const pathname = usePathname()
//     const searchParams = useSearchParams();
//
//     // Check if in guest mode
//     const isGuest = searchParams.get('guest') === 'true';
//
//     // Get current search params to maintain them
//     const currentParams = new URLSearchParams(searchParams.toString());
//
//     // Create link builder function that preserves existing params but sets the category
//     const createCategoryLink = (category: string | null) => {
//         const params = new URLSearchParams(currentParams.toString());
//         if (category) {
//             params.set('category', category);
//         } else {
//             params.delete('category');
//         }
//         return `${pathname}?${params.toString()}`;
//     };
//
//     // Get current category
//     const currentCategory = searchParams.get('category');
//
//     // Logo link should go to landing page only in guest mode, nowhere when logged in
//     const logoLinkDestination = isGuest ? "/" : "#";
//
//     return (
//         <div className="mr-4 hidden md:flex">
//             {/* Logo link changes based on guest mode */}
//             <Link
//                 href={logoLinkDestination}
//                 className="mr-4 flex items-center gap-2 lg:mr-6"
//                 onClick={(e) => {
//                     // Prevent default action when logged in (not guest mode)
//                     if (!isGuest) {
//                         e.preventDefault();
//                     }
//                 }}
//             >
//                 <Icons.logo className="h-6 w-6" />
//                 <span className="hidden font-bold lg:inline-block">
//                     {siteConfig.name}
//                 </span>
//             </Link>
//             <nav className="flex items-center gap-4 text-sm xl:gap-6">
//                 <Link
//                     href={createCategoryLink('restaurants')}
//                     className={cn(
//                         "transition-colors hover:text-foreground/80",
//                         currentCategory === "restaurants" ? "text-foreground" : "text-foreground/80"
//                     )}
//                 >
//                     Local Restaurants
//                 </Link>
//                 <Link
//                     href={createCategoryLink('attractions')}
//                     className={cn(
//                         "transition-colors hover:text-foreground/80",
//                         currentCategory === "attractions" ? "text-foreground" : "text-foreground/80"
//                     )}
//                 >
//                     Main Attractions
//                 </Link>
//                 <Link
//                     href={createCategoryLink('nightlife')}
//                     className={cn(
//                         "transition-colors hover:text-foreground/80",
//                         currentCategory === "nightlife" ? "text-foreground" : "text-foreground/80"
//                     )}
//                 >
//                     Night Life
//                 </Link>
//                 <Link
//                     href={createCategoryLink('hotels')}
//                     className={cn(
//                         "transition-colors hover:text-foreground/80",
//                         currentCategory === "hotels" ? "text-foreground" : "text-foreground/80"
//                     )}
//                 >
//                     Hotels
//                 </Link>
//                 <Link
//                     href={createCategoryLink('shopping')}
//                     className={cn(
//                         "transition-colors hover:text-foreground/80",
//                         currentCategory === "shopping" ? "text-foreground" : "text-foreground/80"
//                     )}
//                 >
//                     Shopping
//                 </Link>
//                 <Link
//                     href={createCategoryLink(null)}
//                     className={cn(
//                         "transition-colors hover:text-foreground/80",
//                         pathname?.startsWith("/colors")
//                             ? "text-foreground"
//                             : "text-foreground/80"
//                     )}
//                 >
//                     Flights
//                 </Link>
//
//                 <Link
//                     href={`/destination?${searchParams.toString()}`}
//                     className={cn(
//                         "transition-colors hover:text-foreground/80",
//                         pathname?.startsWith("/destination")
//                             ? "text-foreground"
//                             : "text-foreground/80"
//                     )}
//                 >
//                     Itinerary
//                 </Link>
//             </nav>
//         </div>
//     )
// }






















"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
    const pathname = usePathname()
    const searchParams = useSearchParams();

    // Check if in guest mode
    const isGuest = searchParams.get('guest') === 'true';

    // Get current search params to maintain them
    const currentParams = new URLSearchParams(searchParams.toString());

    // Check if we're on the destination/itinerary page
    const isOnItineraryPage = pathname?.startsWith("/destination");

    // Create link builder function that preserves existing params but sets the category
    const createCategoryLink = (category: string | null) => {
        const params = new URLSearchParams(currentParams.toString());

        if (category) {
            params.set('category', category);
        } else {
            params.delete('category');
        }

        // If on itinerary page, redirect to the actual map page at /aeroatlas
        if (isOnItineraryPage) {
            return `/aeroatlas?${params.toString()}`;
        }

        // Otherwise, stay on the current path and just update parameters
        return `${pathname}?${params.toString()}`;
    };

    // Get current category
    const currentCategory = searchParams.get('category');

    // Logo link should go to landing page only in guest mode, nowhere when logged in
    const logoLinkDestination = isGuest ? "/" : "#";

    return (
        <div className="mr-4 hidden md:flex">
            {/* Logo link changes based on guest mode */}
            <Link
                href={logoLinkDestination}
                className="mr-4 flex items-center gap-2 lg:mr-6"
                onClick={(e) => {
                    // Prevent default action when logged in (not guest mode)
                    if (!isGuest) {
                        e.preventDefault();
                    }
                }}
            >
                <Icons.logo className="h-6 w-6" />
                <span className="hidden font-bold lg:inline-block">
                    {siteConfig.name}
                </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm xl:gap-6">
                <Link
                    href={createCategoryLink('restaurants')}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        currentCategory === "restaurants" ? "text-foreground" : "text-foreground/80"
                    )}
                >
                    Local Restaurants
                </Link>
                <Link
                    href={createCategoryLink('attractions')}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        currentCategory === "attractions" ? "text-foreground" : "text-foreground/80"
                    )}
                >
                    Main Attractions
                </Link>
                <Link
                    href={createCategoryLink('nightlife')}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        currentCategory === "nightlife" ? "text-foreground" : "text-foreground/80"
                    )}
                >
                    Night Life
                </Link>
                <Link
                    href={createCategoryLink('hotels')}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        currentCategory === "hotels" ? "text-foreground" : "text-foreground/80"
                    )}
                >
                    Hotels
                </Link>
                <Link
                    href={createCategoryLink('shopping')}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        currentCategory === "shopping" ? "text-foreground" : "text-foreground/80"
                    )}
                >
                    Shopping
                </Link>
                <Link
                    href={createCategoryLink(null)}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        pathname?.startsWith("/colors")
                            ? "text-foreground"
                            : "text-foreground/80"
                    )}
                >
                    Flights
                </Link>

                <Link
                    href={`/destination?${searchParams.toString()}`}
                    className={cn(
                        "transition-colors hover:text-foreground/80",
                        pathname?.startsWith("/destination")
                            ? "text-foreground"
                            : "text-foreground/80"
                    )}
                >
                    Itinerary
                </Link>
            </nav>
        </div>
    )
}