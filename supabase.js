import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './supabase-config.js'

// Create Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

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

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateUserElo(userId, newElo) {
    return this.updateUser(userId, { elo: newElo })
  },

  async updateUserStats(userId, wins, totalVotes) {
    return this.updateUser(userId, { 
      wins: wins,
      total_votes: totalVotes
    })
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
      .eq('id', 'global')
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
      .channel('users_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        callback
      )
      .subscribe()
  },

  subscribeToVotes(callback) {
    return supabase
      .channel('votes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' },
        callback
      )
      .subscribe()
  },

  subscribeToStatistics(callback) {
    return supabase
      .channel('statistics_changes')
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
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
