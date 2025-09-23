"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { siteConfig } from "@/config/site"
import { CommandMenu } from "@/components/command-menu"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import {ModeToggle} from "@/components/ModeToggle";
import { usePathname } from "next/navigation";

export function GlobalSiteHeader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isGuest = searchParams.get('guest') === 'true';

    // Check if we should hide the header
    if (pathname === "/" ||
        pathname === "/front" ||
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/plan" ||
        isGuest) {
        return null
    }

    return (
        <header className="border-grid sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60  mx-auto max-w-5xl px-4  ">
            <div className="container-wrapper">
                <div className=" flex h-14  items-center">
                    <MainNav />
                    <MobileNav />
                    <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            <CommandMenu />
                        </div>
                        <nav className="flex items-center gap-0.5">
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 px-0"
                            >
                                <Link
                                    href={siteConfig.links.github}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Icons.gitHub className="h-4 w-4" />
                                    <span className="sr-only">GitHub</span>
                                </Link>
                            </Button>
                            <ModeToggle />
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    )
}