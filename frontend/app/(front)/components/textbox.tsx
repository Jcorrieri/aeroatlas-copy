"use client";
import React, { useState, createContext, useContext, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

type SearchContextType = {
    location: string;
    setLocation: (value: string) => void;
    fetchCoordinates: () => void;
    setFetchCoordinates: (fetchFunction: () => void) => void;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) throw new Error("useSearch must be used within a SearchProvider");
    return context;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const [location, setLocation] = useState("");
    const [fetchCoordinates, setFetchCoordinates] = useState<() => void>(() => {});
    return (
        <SearchContext.Provider value={{ location, setLocation, fetchCoordinates, setFetchCoordinates }}>
            {children}
        </SearchContext.Provider>
    );
}

type TextboxProps = {
    initialValue?: string;
};

function TextboxComponent({ initialValue = "" }: TextboxProps) {
    const { location, setLocation, fetchCoordinates } = useSearch();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => setLocation(initialValue), [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setLocation(e.target.value);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        inputRef.current?.blur();
        fetchCoordinates();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            fetchCoordinates();
        }
    };

    return (
        <div className="flex flex-col items-center w-full mt-4">
            <form onSubmit={handleSubmit} className="w-full max-w-5xl">
                <textarea
                    ref={inputRef}
                    className={`w-full rounded-lg border p-3 ${
                        isDark ? 'bg-gray-800 text-gray-100 border-gray-700'
                            : 'bg-white text-gray-900 border-gray-300'
                    } placeholder-gray-400`}
                    placeholder="Enter location..."
                    value={location}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    rows={2}
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg mt-2 font-medium transition-colors"
                >
                    Search location
                </button>
            </form>
        </div>
    );
}

export default TextboxComponent;
export const TextareaWithButton = TextboxComponent;