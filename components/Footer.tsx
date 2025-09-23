import Link from "next/link";
import React from "react";

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container-wrapper">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <Link href="/" className="text-2xl font-bold">
                            AeroAtlas
                        </Link>
                        <p className="mt-2 text-gray-400">
                            Your trusted partner in AI-powered travel planning.
                        </p>
                    </div>
                    <div className="flex space-x-6">
                        <Link href="/about" className="text-gray-400 hover:text-white">
                            About
                        </Link>
                        <Link href="/contact" className="text-gray-400 hover:text-white">
                            Contact
                        </Link>
                        <Link href="/privacy" className="text-gray-400 hover:text-white">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-400 hover:text-white">
                            Terms of Service
                        </Link>
                    </div>
                </div>
                <div className="mt-8 text-center text-gray-500">
                    © {new Date().getFullYear()} AeroAtlas. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
