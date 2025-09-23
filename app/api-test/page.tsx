"use client";

import React, { useState } from 'react';
import axios from 'axios';

export default function ApiTest() {
    const [result, setResult] = useState<string>('Test not run yet');
    const [loading, setLoading] = useState(false);

    const testGeoapify = async () => {
        setLoading(true);
        try {
            const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
            setResult(`Using API Key: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT FOUND'}`);

            if (!API_KEY) {
                setResult('ERROR: API key is missing. Check your .env.local file');
                setLoading(false);
                return;
            }

            // Test geocoding
            const geoResponse = await axios.get(
                `https://api.geoapify.com/v1/geocode/search?text=Miami&apiKey=${API_KEY}`
            );

            if (geoResponse.status === 200 && geoResponse.data.features?.length > 0) {
                const coords = geoResponse.data.features[0].geometry.coordinates;
                setResult(prevResult => `${prevResult}\n✅ Geocoding API Test Successful! Found Miami at ${coords[1]}, ${coords[0]}`);

                // Test places
                const placesResponse = await axios.get(
                    `https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=circle:${coords[0]},${coords[1]},5000&limit=5&apiKey=${API_KEY}`
                );

                if (placesResponse.status === 200) {
                    const placeCount = placesResponse.data.features?.length || 0;
                    setResult(prevResult => `${prevResult}\n✅ Places API Test Successful! Found ${placeCount} restaurants near Miami`);

                    if (placeCount > 0) {
                        const samplePlace = placesResponse.data.features[0].properties;
                        setResult(prevResult => `${prevResult}\n\nSample place: ${samplePlace.name || 'Unnamed'}\nAddress: ${samplePlace.formatted || 'No address'}`);
                    }
                } else {
                    setResult(prevResult => `${prevResult}\n❌ Places API Test Failed: Unexpected response`);
                }
            } else {
                setResult(prevResult => `${prevResult}\n❌ Geocoding API Test Failed: Couldn't find coordinates for Miami`);
            }
        } catch (error: any) {
            console.error('API Test Error:', error);
            setResult(`ERROR: ${error.message}\n\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : 'No response data'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto my-8 bg-white rounded shadow-lg">
            <h1 className="text-xl font-bold mb-4">Geoapify API Test</h1>
            <button
                onClick={testGeoapify}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test API Key'}
            </button>

            <div className="mt-4 p-3 bg-gray-100 rounded whitespace-pre-wrap font-mono text-sm">
                {result}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p>If the test fails, make sure:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>You have a <code>.env.local</code> file in your project root</li>
                    <li>The file contains <code>NEXT_PUBLIC_GEOAPIFY_API_KEY=your_key_here</code></li>
                    <li>The API key is valid and has Places API access</li>
                    <li>You've restarted your development server after adding the .env.local file</li>
                </ol>
            </div>
        </div>
    );
}