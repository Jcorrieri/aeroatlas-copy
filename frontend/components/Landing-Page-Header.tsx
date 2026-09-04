"use client";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";

export function LandingPageHeader() {
    return (
        <header className="border-grid sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container-wrapper">
                <div className="flex h-14 items-center">
                    <Link href="/" className="mr-4 flex items-center gap-2">
                        <Icons.logo className="h-6 w-6" />
                        <span className="font-bold">
                            {siteConfig.name}
                        </span>
                    </Link>

                    <div className="flex-1"></div>

                    <nav className="flex items-center gap-4">
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
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="text-sm font-medium hover:underline text-foreground"
                            >
                                Log In
                            </Link>
                            <span className="text-sm text-muted-foreground">|</span>
                            <Link
                                href="/signup"
                                className="text-sm font-medium hover:underline text-foreground"
                            >
                                Sign Up
                            </Link>
                        </div>
                        <ModeToggle />
                    </nav>
                </div>
            </div>
        </header>
    );
}