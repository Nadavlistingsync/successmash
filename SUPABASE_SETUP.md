# Supabase Setup Guide for Young Network

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `young-network`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Update `supabase.js` with these values:

```javascript
const supabaseUrl = 'https://your-project-id.supabase.co'
const supabaseAnonKey = 'your-anon-key-here'
```

### 3. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the entire contents of `database-schema.sql`
3. Click **Run** to execute the schema

### 4. Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Update Supabase Configuration

Update `supabase.js` to use environment variables:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 📊 Database Structure

### Tables Created:

1. **users** - User profiles with ELO ratings
2. **votes** - Voting history and ELO changes
3. **statistics** - Global application statistics

### Views Created:

1. **leaderboard** - Real-time leaderboard with win percentages
2. **recent_votes** - Recent voting activity

### Features:

- ✅ **Real-time subscriptions** for live updates
- ✅ **Automatic ELO calculations** with triggers
- ✅ **Row Level Security** for data protection
- ✅ **Performance indexes** for fast queries
- ✅ **Sample data** for testing

## 🔧 Configuration Options

### Row Level Security (RLS)

The schema includes RLS policies that allow:
- **Public read access** to all data
- **Public write access** for votes and user updates
- **Automatic statistics updates** via triggers

### ELO System

- **Starting ELO**: 1200
- **ELO Change**: 20 points per vote
- **Minimum ELO**: 0 (won't go below)

### Real-time Features

Enable real-time for these tables:
1. Go to **Database** → **Replication**
2. Enable real-time for:
   - `users`
   - `votes`
   - `statistics`

## 🧪 Testing Your Setup

### 1. Test Database Connection

```javascript
// In browser console
import { supabase } from './supabase.js'

// Test connection
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(1)

console.log('Connection test:', { data, error })
```

### 2. Test Real-time Subscriptions

```javascript
// Subscribe to user changes
const subscription = supabase
  .channel('users')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' }, 
    (payload) => {
      console.log('Real-time update:', payload)
    }
  )
  .subscribe()
```

### 3. Test Voting System

```javascript
// Create a test vote
const { data, error } = await supabase
  .from('votes')
  .insert([{
    winner_id: 'user-id-1',
    loser_id: 'user-id-2',
    winner_elo_before: 1200,
    loser_elo_before: 1200,
    winner_elo_after: 1220,
    loser_elo_after: 1180,
    elo_change: 20
  }])
```

## 🔒 Security Considerations

### Row Level Security Policies

The schema includes policies that:
- Allow public read access to all data
- Allow public write access for votes
- Allow public updates to user statistics
- Prevent unauthorized data access

### API Key Security

- **anon key**: Safe to expose in client-side code
- **service_role key**: Keep secret, use only in server-side code

## 📈 Performance Optimization

### Indexes Created

- `idx_users_elo` - Fast leaderboard queries
- `idx_users_industry` - Industry filtering
- `idx_votes_created_at` - Recent votes queries
- `idx_votes_winner_id` - User vote history
- `idx_votes_loser_id` - User vote history

### Query Optimization

Use the provided views for common queries:
- `leaderboard` - For displaying rankings
- `recent_votes` - For activity feeds

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Vercel

Add these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔍 Monitoring

### Supabase Dashboard

Monitor your application in the Supabase dashboard:
- **Database** → **Tables** - View data
- **Database** → **Logs** - Monitor queries
- **Analytics** → **Usage** - Track API calls

### Real-time Monitoring

Use the real-time subscriptions to monitor:
- User activity
- Voting patterns
- ELO changes

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your domain is in Supabase allowed origins
2. **RLS Errors**: Check that policies are correctly configured
3. **Real-time Not Working**: Enable real-time in replication settings
4. **Environment Variables**: Ensure they're properly set in deployment

### Debug Commands

```javascript
// Check connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

// Test query
const { data, error } = await supabase.from('users').select('count')
console.log('User count:', data, error)
```

## 📚 Next Steps

After setup:

1. **Integrate with frontend** - Update your JavaScript to use Supabase
2. **Add authentication** - Implement user login/signup
3. **Real-time features** - Add live leaderboards
4. **Analytics** - Track user engagement
5. **Scaling** - Monitor performance and scale as needed

---

**Your Supabase setup is now ready for Young Network!** 🎉
