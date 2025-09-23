"use client";

import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ModeToggle";
import { useTheme } from "next-themes";

// Define the Contributor interface.
interface Contributor {
    id: number;
    name: string;
    roles: string;
    github: string;
    linkedin: string;
}

// List of foundational contributors.
const foundationalContributors: Contributor[] = [
    {
        id: 1,
        name: "Thomas Seife",
        roles: "Lead Architect, Full stack development, Project Management",
        github: "https://github.com/teseife",
        linkedin: "https://www.linkedin.com/in/teseife",
    },
    {
        id: 2,
        name: "Joshua Prakash",
        roles: "Full Stack development, Testing",
        github: "https://github.com/jPrakash28",
        linkedin: "https://www.linkedin.com/in/joshua-prakash/",
    },
    {
        id: 3,
        name: "Alex Canizares",
        roles: "Front-end Development, Lead Designer, Creative Director",
        github: "https://github.com/alexcm24",
        linkedin: "https://www.linkedin.com/in/canizaresalex",
    },
    {
        id: 4,
        name: "Ian Dahlin",
        roles: "back-end Development, Data analysis",
        github: "https://github.com/yeahian",
        linkedin: "https://www.linkedin.com/in/ian-dahlin/",
    },
    {
        id: 5,
        name: "Jacomo Corrieri",
        roles: "Full Stack development, integration",
        github: "https://github.com/Jcorrieri",
        linkedin: "https://www.linkedin.com/in/jacomo-corrieri-538292268/",
    },
];

// Helper function to ensure URLs are absolute.
const formatLink = (url: string) => {
    if (!/^https?:\/\//.test(url)) {
        return `https://${url}`;
    }
    return url;
};

const AboutPage: React.FC = () => {
    const { resolvedTheme } = useTheme();

    // Determine dynamic styling classes based on the active theme.
    const cardBgClass = resolvedTheme === "dark" ? "bg-gray-800" : "bg-white";
    const mainBgClass = resolvedTheme === "dark" ? "bg-gray-900" : "bg-white";
    const mainTextClass = resolvedTheme === "dark" ? "text-gray-100" : "text-gray-900";
    const paragraphTextClass = resolvedTheme === "dark" ? "text-gray-400" : "text-gray-700";

    // Sort contributors alphabetically by name.
    const sortedContributors = [...foundationalContributors].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    return (
        <ThemeProvider attribute="class">
            <div className={`min-h-screen ${mainBgClass} ${mainTextClass} transition-colors relative`}>
                <div className="container mx-auto px-4 py-12">
                    {/* About Section */}
                    <section className="text-center mb-16">
                        <h1 className="text-5xl font-extrabold mb-4">About Our Software</h1>
                        <p className={`max-w-2xl mx-auto text-lg ${paragraphTextClass}`}>
                            We are a passionate team of innovators building software that pushes the boundaries of
                            technology. Our ethos is built on creativity, collaboration, and a commitment to
                            excellence.
                        </p>
                    </section>

                    {/* Contributors Section */}
                    <section className="mb-16">
                        <h2 className="text-4xl font-bold text-center mb-8">Foundational Contributors</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {sortedContributors.map((contributor) => (
                                <div
                                    key={contributor.id}
                                    className={`flex flex-col items-center ${cardBgClass} rounded-lg shadow-lg p-6 transition transform hover:-translate-y-1 hover:shadow-xl`}
                                >
                                    <h3 className="text-2xl font-semibold mb-1">{contributor.name}</h3>
                                    <p className={`${paragraphTextClass} text-center`}>{contributor.roles}</p>
                                    {/* Social Links */}
                                    <div className="flex justify-center mt-4 space-x-4">
                                        <a
                                            href={formatLink(contributor.github)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="GitHub"
                                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="lucide lucide-github-icon lucide-github w-6 h-6"
                                            >
                                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                                <path d="M9 18c-4.51 2-5-2-7-2" />
                                            </svg>
                                        </a>
                                        <a
                                            href={formatLink(contributor.linkedin)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="LinkedIn"
                                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-6 h-6"
                                            >
                                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                                <rect width="4" height="12" x="2" y="9" />
                                                <circle cx="4" cy="4" r="2" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 text-center">
                            <p className={`text-lg ${paragraphTextClass}`}>
                                And many more talented contributors to come...
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default AboutPage;
