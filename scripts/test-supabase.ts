import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error("Missing credentials in .env");
    process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
    console.log("Testing Supabase connection... URL: " + url);
    try {
        const { data, error } = await supabase.storage.getBucket('images');
        if (error) {
            console.error("Error getting bucket:", error.message);
            console.error("Full error:", JSON.stringify(error, null, 2));
            return;
        }
        console.log("Successfully connected to Supabase and retrieved bucket details!");
        console.log(JSON.stringify(data, null, 2));
    } catch (e: any) {
        console.error("Exception:", e.message);
    }
}
main();
