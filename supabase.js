// Use global Supabase from CDN
// Hardcoded Supabase configuration to avoid module import issues
const SUPABASE_CONFIG = {
    url: 'https://nubqazryyrougsyestiw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51YnFhenJ5cnJvdWdzeWVzdGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NDczMzksImV4cCI6MjA3MTEyMzMzOX0.gGdt11cb6eRk7qvfbLK0tAYpxz3zZphQLhEYl3KkdIk'
};

// Get Supabase from global scope
const { createClient } = window.supabase;

// Create Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Enhanced logging function
function logDbOperation(operation, data = null, error = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        operation,
        data,
        error: error ? {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        } : null,
        config: {
            url: SUPABASE_CONFIG.url,
            hasKey: !!SUPABASE_CONFIG.anonKey
        }
    };
    
    console.log(`[DB] ${operation}:`, logEntry);
    
    // Send to Vercel logging
    fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            level: error ? 'error' : 'info',
            message: `Database operation: ${operation}`,
            data: logEntry
        })
    }).catch(e => console.warn('Failed to send DB log:', e));
}

// Database helper functions
export const db = {
  async getUsers() {
    try {
      logDbOperation('getUsers - starting');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('elo', { ascending: false })
      
      if (error) {
        logDbOperation('getUsers - error', null, error);
        throw error;
      }
      
      logDbOperation('getUsers - success', { count: data?.length || 0 });
      return data || []
    } catch (error) {
      logDbOperation('getUsers - exception', null, error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      logDbOperation('createUser - starting', userData);
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
      
      if (error) {
        logDbOperation('createUser - error', userData, error);
        throw error;
      }
      
      logDbOperation('createUser - success', data[0]);
      return data[0]
    } catch (error) {
      logDbOperation('createUser - exception', userData, error);
      throw error;
    }
  },

  async updateUser(userId, updates) {
    try {
      logDbOperation('updateUser - starting', { userId, updates });
      const { data, error } = await supabase
        .from('users')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
      
      if (error) {
        logDbOperation('updateUser - error', { userId, updates }, error);
        throw error;
      }
      
      logDbOperation('updateUser - success', data[0]);
      return data[0]
    } catch (error) {
      logDbOperation('updateUser - exception', { userId, updates }, error);
      throw error;
    }
  },

  async updateUserElo(userId, newElo) {
    return this.updateUser(userId, { elo: newElo });
  },

  async createVote(voteData) {
    try {
      logDbOperation('createVote - starting', voteData);
      const { data, error } = await supabase
        .from('votes')
        .insert([voteData])
        .select()
      
      if (error) {
        logDbOperation('createVote - error', voteData, error);
        throw error;
      }
      
      logDbOperation('createVote - success', data[0]);
      return data[0]
    } catch (error) {
      logDbOperation('createVote - exception', voteData, error);
      throw error;
    }
  },

  async getVotes() {
    try {
      logDbOperation('getVotes - starting');
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        logDbOperation('getVotes - error', null, error);
        throw error;
      }
      
      logDbOperation('getVotes - success', { count: data?.length || 0 });
      return data || []
    } catch (error) {
      logDbOperation('getVotes - exception', null, error);
      throw error;
    }
  },

  async getStatistics() {
    try {
      logDbOperation('getStatistics - starting');
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .eq('id', 'global')
        .single()
      
      if (error) {
        logDbOperation('getStatistics - error', null, error);
        throw error;
      }
      
      logDbOperation('getStatistics - success', data);
      return data
    } catch (error) {
      logDbOperation('getStatistics - exception', null, error);
      throw error;
    }
  },

  async updateStatistics(stats) {
    try {
      logDbOperation('updateStatistics - starting', stats);
      const { data, error } = await supabase
        .from('statistics')
        .upsert([{
          id: 'global',
          ...stats,
          updated_at: new Date().toISOString()
        }])
        .select()
      
      if (error) {
        logDbOperation('updateStatistics - error', stats, error);
        throw error;
      }
      
      logDbOperation('updateStatistics - success', data[0]);
      return data[0]
    } catch (error) {
      logDbOperation('updateStatistics - exception', stats, error);
      throw error;
    }
  },

  // Test database connection
  async testConnection() {
    try {
      logDbOperation('testConnection - starting');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        logDbOperation('testConnection - error', null, error);
        return { success: false, error };
      }
      
      logDbOperation('testConnection - success');
      return { success: true, data };
    } catch (error) {
      logDbOperation('testConnection - exception', null, error);
      return { success: false, error };
    }
  }
};
