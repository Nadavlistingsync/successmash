import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_PROJECT_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('elo', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateUserElo(userId, newElo) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        elo: newElo,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateUserStats(userId, wins, totalVotes) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        wins: wins,
        total_votes: totalVotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Votes
  async createVote(voteData) {
    const { data, error } = await supabase
      .from('votes')
      .insert([voteData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getVotes() {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from('statistics')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async updateStatistics(stats) {
    const { data, error } = await supabase
      .from('statistics')
      .upsert([{
        id: 'global',
        ...stats,
        updated_at: new Date().toISOString()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Real-time subscriptions
  subscribeToUsers(callback) {
    return supabase
      .channel('users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        callback
      )
      .subscribe()
  },

  subscribeToVotes(callback) {
    return supabase
      .channel('votes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        callback
      )
      .subscribe()
  },

  subscribeToStatistics(callback) {
    return supabase
      .channel('statistics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'statistics' }, 
        callback
      )
      .subscribe()
  }
}

// Authentication helpers
export const auth = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
