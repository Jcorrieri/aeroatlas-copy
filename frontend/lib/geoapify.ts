export interface GeoapifyPlace {
    properties: {
        place_id: string;
        name: string;
        formatted: string;
        categories: string[];
        distance?: number;
        lat: number;
        lon: number;
        address_line1?: string;
        address_line2?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
        website?: string;
        phone?: string;
        opening_hours?: string;
        rating?: number;
        popularity?: number;
    };
    geometry: {
        type: string;
        coordinates: [number, number];
    };
}

export interface GeoapifyResponse {
    type: string;
    features: GeoapifyPlace[];
}

export type PlaceCategory = 'restaurants' | 'attractions' | 'nightlife' | 'hotels' | 'shopping' | null;

// Category color mapping
export const CATEGORY_COLORS = {
    restaurants: '#FF5722', // Orange-red
    attractions: '#2196F3', // Blue
    nightlife: '#9C27B0',   // Purple
    hotels: '#4CAF50',      // Green
    shopping: '#919e48',    // Yellow
    default: '#FF9800'      // Orange (default)
};

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "";

// Function to fetch places based on category and location
export async function fetchPlacesByCategory(
    category: PlaceCategory,
    lat: number,
    lon: number,
    radius: number = 5000, // 5km radius
    limit: number = 10    // Show only 10 results
): Promise<GeoapifyPlace[]> {
    if (!category || !lat || !lon || !GEOAPIFY_API_KEY) {
        console.log("Missing required parameters or API key", { category, lat, lon, hasApiKey: !!GEOAPIFY_API_KEY });
        return [];
    }

    // Define category-specific parameters - using broader categories to ensure results
    let categoryParams = "";

    switch (category) {
        case 'restaurants':
            categoryParams = "catering";
            break;
        case 'attractions':
            categoryParams = "tourism";
            break;
        case 'nightlife':
            categoryParams = "adult";
            break;
        case 'hotels':
            categoryParams = "accommodation";
            break;
        case 'shopping':
            categoryParams = "commercial";
            break;
        default:
            return [];
    }

    try {
        const url = `https://api.geoapify.com/v2/places?categories=${categoryParams}&filter=circle:${lon},${lat},${radius}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

        console.log("Fetching places with URL (without API key):", url.replace(GEOAPIFY_API_KEY, 'API_KEY_HIDDEN'));

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed with status ${response.status}: ${response.statusText}`, errorText);
            return [];
        }

        const data = await response.json() as GeoapifyResponse;

        if (!data.features || !Array.isArray(data.features)) {
            console.error("Invalid API response format:", data);
            return [];
        }

        // Add logging to see what we're getting back
        console.log(`Found ${data.features.length} places for category ${category}`);

        return data.features;
    } catch (error) {
        console.error("Error fetching places:", error);
        return [];
    }
}