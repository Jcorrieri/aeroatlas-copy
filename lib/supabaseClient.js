import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, // Your Supabase URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Your Supabase Anon Key
);

export default supabase;