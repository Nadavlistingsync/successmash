// Use global Supabase from CDN
// Hardcoded Supabase configuration to avoid module import issues
const SUPABASE_CONFIG = {
    url: "https://nubqazryyrougsyestiw.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51YnFhenJ5cnJvdWdzeWVzdGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDczMzksImV4cCI6MjA3MTEyMzMzOX0.gGdt11cb6eRk7qvfbLK0tAYpxz3zZphQLhEYl3KkdIk"
};

// Get Supabase from global scope
const { createClient } = window.supabase;

// Create Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Database helper functions
export const db = {
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("elo", { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("getUsers error:", error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("createUser error:", error);
      throw error;
    }
  },

  async updateUser(userId, updates) {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("updateUser error:", error);
      throw error;
    }
  },

  async updateUserElo(userId, newElo) {
    return this.updateUser(userId, { elo: newElo });
  },

  async createVote(voteData) {
    try {
      const { data, error } = await supabase
        .from("votes")
        .insert([voteData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("createVote error:", error);
      throw error;
    }
  },

  async getVotes() {
    try {
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("getVotes error:", error);
      throw error;
    }
  },

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .eq("id", "global")
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("getStatistics error:", error);
      throw error;
    }
  },

  async updateStatistics(stats) {
    try {
      const { data, error } = await supabase
        .from("statistics")
        .upsert([{
          id: "global",
          ...stats,
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("updateStatistics error:", error);
      throw error;
    }
  },

  async testConnection() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("count")
        .limit(1);
      
      if (error) return { success: false, error };
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }
};
