// Supabase Configuration
// Replace these values with your actual Supabase project credentials

export const SUPABASE_CONFIG = {
    // Your Supabase project URL (found in your project settings)
    url: 'YOUR_SUPABASE_PROJECT_URL',
    
    // Your Supabase anon key (found in your project settings)
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Instructions:
// 1. Go to https://supabase.com and create a new project
// 2. Go to Settings > API in your Supabase dashboard
// 3. Copy the "Project URL" and replace 'YOUR_SUPABASE_PROJECT_URL'
// 4. Copy the "anon public" key and replace 'YOUR_SUPABASE_ANON_KEY'
// 5. Run the database-schema.sql file in your Supabase SQL editor
// 6. Enable real-time features in your Supabase dashboard

export default SUPABASE_CONFIG;
