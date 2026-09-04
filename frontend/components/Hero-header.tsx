"use client";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CommandMenu } from "@/components/command-menu";
import { Icons } from "@/components/icons";
import { HeroMainNav } from "@/components/Hero-main-nav";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";

export function HeroHeader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isGuest = searchParams.get("guest") === "true";

    // Hide the header on these pages
    if (
        pathname === "/" ||
        pathname === "/front" ||
        pathname === "/login" ||
        pathname === "/signup"
    ) {
        return null;
    }

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "auto",
                minWidth: "600px",
                maxWidth: "90%",
                zIndex: 50,
                margin: "0 auto"
            }}
            className="border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-b-lg"
        >
            <div className="flex h-14 items-center justify-between px-6">
                <div className="flex-shrink-0">
                    {/* Main Navigation */}
                    <HeroMainNav />
                </div>
                <div className="flex items-center">
                    <div className="mr-4">
                        <CommandMenu />
                    </div>
                    <nav className="flex items-center space-x-4">
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
                        <div className="flex items-center">
                            <Link
                                href="/login"
                                className="text-sm font-medium hover:underline text-foreground px-2"
                            >
                                Log In
                            </Link>
                            <span className="text-sm text-muted-foreground px-1">|</span>
                            <Link
                                href="/signup"
                                className="text-sm font-medium hover:underline text-foreground px-2"
                            >
                                Sign Up
                            </Link>
                        </div>
                        <div className="ml-3">
                            <ModeToggle />
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}