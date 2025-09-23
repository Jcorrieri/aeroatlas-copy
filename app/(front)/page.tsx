import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Announcement } from "@/components/announcement";
import {
    PageActions,
    PageHeader,
    PageHeaderDescription,
    PageHeaderHeading,
} from "@/components/page-header";
import { Button } from "@/components/ui/button";
import cardsLight from "@/app/(front)/examples/cards-light.png"
import cardsDark from "@/app/(front)/examples/cards-dark.png"
// Import the LandingPageHeader instead of HeroHeader
import { LandingPageHeader } from "@/components/Landing-Page-Header";

const title = "Revolutionize Your Journey with AeroAtlas";
const description =
    "Experience AI-powered dynamic travel itineraries that craft the perfect adventure for you—effortlessly and in seconds.";

export const metadata: Metadata = {
    title,
    description,
    openGraph: {
        images: [
            {
                url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
                    description
                )}`,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        images: [
            {
                url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
                    description
                )}`,
            },
        ],
    },
};

const IndexPage: React.FC = () => {
    return (
        <>
            {/* Landing Page Header */}
            <LandingPageHeader />

            {/* Hero Section */}
            <section className="min-h-screen flex flex-col items-center justify-start pt-16">
                <PageHeader className="text-center">
                    <Announcement />
                    {/*you can make the size bigger or smaller */}
                    <PageHeaderHeading className="text-4xl md:text-5xl font-bold">{title}</PageHeaderHeading>
                    <PageHeaderDescription className="text-lg md:text-xl text-gray-600 dark:text-gray-300">{description}</PageHeaderDescription>
                    <PageActions>
                        <Button asChild size="lg" className="my-5 px-8 rounded-md">
                            <Link href="/plan">Get Started</Link>
                        </Button>
                    </PageActions>
                </PageHeader>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container-wrapper">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">Why Choose AeroAtlas?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
                                <h3 className="text-xl font-semibold mb-2">Personalized Itineraries</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Our AI crafts itineraries tailored just for you, ensuring every journey is unique.
                                </p>
                            </div>
                            <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
                                <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Stay informed with live travel data and personalized recommendations on the go.
                                </p>
                            </div>
                            <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
                                <h3 className="text-xl font-semibold mb-2">Seamless Booking</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Book flights, hotels, and experiences directly through our platform in just a few clicks.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16">
                <div className="container-wrapper">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">How It Works</h2>
                        <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300 mb-8">
                            AeroAtlas leverages cutting-edge AI to analyze your travel preferences and generate dynamic itineraries that evolve as your journey unfolds. From tailored recommendations to real-time updates, every detail is designed to make travel planning a breeze.
                        </p>
                        <Button asChild size="lg" className="mx-auto px-8 rounded-md">
                            {/*link this to a the demo page that Jacomo's template page with more info*/}
                            <Link href="/login">See It in Action</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="container-wrapper">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">Visualize Your Journey</h2>
                        <div className="flex justify-center">
                            <div className="w-full md:w-3/4">
                                <Image
                                    src={cardsLight}
                                    width={1280}
                                    height={1214}
                                    alt="Travel Itinerary Light Mode"
                                    className="block dark:hidden rounded-lg shadow-md"
                                />
                                <Image
                                    src={cardsDark}
                                    width={1280}
                                    height={1214}
                                    alt="Travel Itinerary Dark Mode"
                                    className="hidden dark:block rounded-lg shadow-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default IndexPage;