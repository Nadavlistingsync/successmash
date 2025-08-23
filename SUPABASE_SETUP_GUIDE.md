# Supabase Setup Guide

## 🚨 Current Issue
The current Supabase project URL `nubqazryyrougsyestiw.supabase.co` cannot be resolved, which means the project doesn't exist or has been deleted.

## 🔧 How to Fix This

### Step 1: Create a New Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `young-network` (or any name you prefer)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait for the project to be created (usually 1-2 minutes)

### Step 2: Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
3. Copy the **anon public** key (starts with `eyJ...`)

### Step 3: Update the Configuration
Replace the values in `supabase-config.js`:

```javascript
export const SUPABASE_CONFIG = {
    url: 'YOUR_NEW_PROJECT_URL_HERE',
    anonKey: 'YOUR_NEW_ANON_KEY_HERE'
};
```

### Step 4: Set Up the Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to create the tables

### Step 5: Enable Real-time Features
1. In your Supabase dashboard, go to **Database** → **Replication**
2. Enable real-time for the `users`, `votes`, and `statistics` tables

### Step 6: Test the Connection
1. Update the credentials in the HTML files
2. Visit `https://your-vercel-app.vercel.app/test-supabase.html`
3. Check the console for success messages

## 📋 Required Files to Update
- `supabase-config.js`
- `index.html` (Supabase credentials)
- `test-supabase.html` (Supabase credentials)
- `supabase.js` (Supabase credentials)

## 🔍 Testing
After setup, you should see:
- ✅ "CDN loaded successfully"
- ✅ "Supabase client created"
- ✅ "Database connection successful!"
- ✅ "Users in database: X"

## 🆘 Need Help?
If you need help setting up Supabase, you can:
1. Follow the official docs: https://supabase.com/docs
2. Check the Supabase Discord: https://discord.supabase.com
3. Create a new project and I'll help you configure it
