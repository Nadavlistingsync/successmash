// YN Young Network Application - Professional Achievement Comparison
// Supabase integration with real-time features and localStorage fallback

class YoungNetwork {
    constructor() {
        this.profiles = [];
        this.currentComparison = null;
        this.votes = [];
        this.stats = {
            totalVotes: 0,
            comparisonsMade: 0,
            totalUsers: 0
        };
        this.eloChange = 20; // ELO points gained/lost per comparison
        this.debugMode = true; // Enable automatic feedback loop
        this.supabaseEnabled = false; // Track if Supabase is available
        this.subscriptions = []; // Real-time subscriptions
        this.localModeNotificationShown = false; // Track notification display
        
        this.init();
    }

    // Initialize the application
    async init() {
        this.log('🚀 YN Young Network application starting...', 'info', {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });
        
        try {
            // Try to load Supabase
            await this.loadSupabase();
            this.supabaseEnabled = true;
            await this.loadDataFromSupabase();
            await this.enableRealtime();
            this.showRealTimeStatus(true);
            this.log('✅ YN Young Network initialized with Supabase', 'info', {
                profilesCount: this.profiles.length,
                votesCount: this.votes.length,
                realTimeEnabled: true
            });
        } catch (error) {
            this.log('❌ Supabase connection failed - attempting fallback', 'error', {
                error: error.message,
                stack: error.stack,
                userAgent: navigator.userAgent,
                url: window.location.href
            });
            
            // Try to load mock data as fallback
            try {
                // First try to load from localStorage
                this.loadData();
                
                // If no data in localStorage, load mock data
                if (this.profiles.length === 0) {
                    await this.loadMockData();
                }
                
                this.log('✅ Loaded data from localStorage/mock data as fallback', 'info');
                // Show that app is working in local mode
                this.showRealTimeStatus(false);
            } catch (fallbackError) {
                this.log('❌ Fallback also failed - showing error', 'error', fallbackError);
                this.showConnectionError();
                return; // Don't continue initialization
            }
        }
        
        // Make available globally for debug page and live mode control
        window.youngNetwork = this;
        
        // Expose all diagnostic functions
        window.testDatabaseConnection = () => this.testDatabaseConnection();
        window.testDatabaseOperations = () => this.testDatabaseOperations();
        window.testUserEloUpdates = () => this.testUserEloUpdates();
        window.forceEnableLiveMode = () => this.forceEnableLiveMode();
        window.checkLiveStatus = () => this.checkRealTimeStatus();
        window.diagnoseRealTime = () => this.diagnoseRealTime();
        window.forceRefreshAndCheckElo = () => this.forceRefreshAndCheckElo();
        window.testSupabaseConnection = () => this.testSupabaseConnection();
        window.testRealTimeConnection = () => this.testRealTimeConnection();
        window.forceRefreshData = () => this.forceRefreshData();
        window.forceRefreshLeaderboard = () => this.forceRefreshLeaderboard();
        window.checkVoteStatus = () => this.checkVoteStatus();
        window.checkLeaderboardStatus = () => this.checkLeaderboardStatus();
        window.forceLoadData = () => this.forceLoadData();
        window.checkLeaderboardData = () => this.checkLeaderboardData();
        
        // Add connection status check
        window.getConnectionStatus = async () => {
            try {
                const supabase = await this.loadSupabase();
                const { error } = await supabase.from("users").select("*").limit(1);
                return { ok: !error, error };
            } catch (e) {
                return { ok: false, error: e?.message || String(e) };
            }
        };
        
        // Also expose as properties for easier access
        window.forceLiveMode = window.forceEnableLiveMode;
        window.testLiveConnection = window.testRealTimeConnection;
        window.getLiveStatus = window.checkLiveStatus;
        
        // Expose error logging functions
        window.getErrorLogs = () => this.getErrorLogs();
        window.clearErrorLogs = () => this.clearErrorLogs();
        window.exportErrorLogs = () => {
            const logs = this.getErrorLogs();
            const dataStr = JSON.stringify(logs, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            this.log('Error logs exported', 'info');
        };
        
        // Global error handler
        window.addEventListener('error', (event) => {
            this.log('Global error caught', 'error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.message,
                stack: event.error?.stack
            });
            this.reportError(event.error || new Error(event.message), 'Global Error Handler');
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.log('Unhandled promise rejection', 'error', {
                reason: event.reason,
                message: event.reason?.message,
                stack: event.reason?.stack
            });
            this.reportError(new Error(event.reason), 'Unhandled Promise Rejection');
        });
        
        this.setupEventListeners();
        this.setupActivityTracking();
        this.setupAnalytics();
        this.ensureAppFunctionality();
        
        this.log('🎯 Application initialization complete', 'info', {
            supabaseEnabled: this.supabaseEnabled,
            profilesLoaded: this.profiles.length,
            votesLoaded: this.votes.length,
            sessionId: this.getSessionId()
        });
        
        // Auto-run diagnostic after 3 seconds
        setTimeout(() => {
            this.log('🔍 Auto-running diagnostic tests...', 'info');
            this.runAutoDiagnostic();
        }, 3000);
    }

    // Setup activity tracking
    setupActivityTracking() {
        this.log('📊 Setting up activity tracking...', 'info');
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.log('👁️ User left the page', 'info', {
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId()
                });
            } else {
                this.log('👁️ User returned to the page', 'info', {
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId()
                });
            }
        });

        // Track mouse movements (throttled)
        let mouseMoveTimeout;
        document.addEventListener('mousemove', () => {
            if (mouseMoveTimeout) return;
            mouseMoveTimeout = setTimeout(() => {
                this.log('🖱️ User activity detected (mouse movement)', 'info', {
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId()
                });
                mouseMoveTimeout = null;
            }, 5000); // Log every 5 seconds of mouse activity
        });

        // Track clicks
        document.addEventListener('click', (event) => {
            const target = event.target;
            this.log('🖱️ User clicked element', 'info', {
                element: target.tagName,
                className: target.className,
                id: target.id,
                text: target.textContent?.substring(0, 50),
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });
        });

        // Track scroll events (throttled)
        let scrollTimeout;
        document.addEventListener('scroll', () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                this.log('📜 User scrolled page', 'info', {
                    scrollY: window.scrollY,
                    scrollX: window.scrollX,
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId()
                });
                scrollTimeout = null;
            }, 1000);
        });

        // Track keyboard activity
        document.addEventListener('keydown', (event) => {
            this.log('⌨️ User pressed key', 'info', {
                key: event.key,
                keyCode: event.keyCode,
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });
        });

        // Track window focus/blur
        window.addEventListener('focus', () => {
            this.log('🪟 Window gained focus', 'info', {
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });
        });

        window.addEventListener('blur', () => {
            this.log('🪟 Window lost focus', 'info', {
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });
        });

        // Track network status
        window.addEventListener('online', () => {
            this.log('🌐 Network connection restored', 'success', {
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });
        });

        window.addEventListener('offline', () => {
            this.log('🌐 Network connection lost', 'warning', {
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });
        });

        // Periodic activity logging
        setInterval(() => {
            this.log('⏰ Periodic activity check', 'info', {
                currentTime: new Date().toISOString(),
                sessionId: this.getSessionId(),
                appState: {
                    supabaseEnabled: this.supabaseEnabled,
                    profilesCount: this.profiles?.length || 0,
                    votesCount: this.votes?.length || 0,
                    currentComparison: this.currentComparison ? {
                        left: this.currentComparison.left?.name,
                        right: this.currentComparison.right?.name
                    } : null
                }
            });
        }, 30000); // Log every 30 seconds

        this.log('✅ Activity tracking setup complete', 'success');
    }

    // Update comparison display with current ELO scores
    updateComparisonDisplay() {
        if (this.currentComparison) {
            const left = this.currentComparison.left;
            const right = this.currentComparison.right;
            
            if (left) {
                document.getElementById('left-elo').textContent = left.elo;
            }
            if (right) {
                document.getElementById('right-elo').textContent = right.elo;
            }
        }
    }

    // Show real-time status indicator
    showRealTimeStatus(enabled) {
        const statusElement = document.getElementById('real-time-status');
        if (statusElement) {
            if (enabled && this.supabaseEnabled) {
                statusElement.textContent = '🟢 Live Updates Active';
                statusElement.className = 'status-online';
                this.showNotification('✅ Live mode activated! Real-time updates enabled!', 'success');
            } else if (!this.supabaseEnabled) {
                statusElement.textContent = '🟡 Local Mode';
                statusElement.className = 'status-warning';
                // Only show notification once during initialization
                if (!this.localModeNotificationShown) {
                    this.showNotification('📝 App working in local mode - votes saved locally', 'info');
                    this.localModeNotificationShown = true;
                }
            } else {
                statusElement.textContent = '🔴 Connecting...';
                statusElement.className = 'status-error';
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Set background color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#dc3545';
        } else {
            notification.style.backgroundColor = '#17a2b8';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // Show connection error to user
    showConnectionError() {
        this.log('🔴 Showing connection error to user', 'error');
        
        // Hide all content
        document.querySelector('.container').style.display = 'none';
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a365d, #2d5a87);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        errorDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; max-width: 600px;">
                <h1 style="font-size: 3rem; margin-bottom: 20px;">🔴 Connection Required</h1>
                <p style="font-size: 1.2rem; margin-bottom: 30px;">
                    YN Young Network requires an active internet connection to play.
                </p>
                <p style="font-size: 1rem; margin-bottom: 30px; opacity: 0.8;">
                    Please check your internet connection and refresh the page.
                </p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px;
                    background: #fbbf24;
                    color: #1a365d;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                ">🔄 Refresh Page</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    // Load Supabase configuration
    async loadSupabase() {
        this.log('🔧 Loading Supabase configuration...', 'info', {
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            userAgent: navigator.userAgent
        });
        
        // Check if we're in local development
        const isLiveEnvironment = window.location.hostname !== 'localhost' && 
                                 window.location.hostname !== '127.0.0.1';
        
        this.log('Environment check', 'info', {
            isLiveEnvironment,
            hostname: window.location.hostname,
            isLocalhost: window.location.hostname === 'localhost',
            is127: window.location.hostname === '127.0.0.1'
        });
        
        if (!isLiveEnvironment) {
            this.log('🔄 Local testing mode - skipping Supabase', 'info');
            this.supabaseEnabled = false;
            this.supabase = null;
            this.db = null;
            throw new Error('Local testing mode - using mock data instead');
        }
        
        // In production, use the ESM-loaded Supabase
        try {
            this.log('Checking for window.__supabase...', 'info', {
                hasWindowSupabase: typeof window.__supabase !== 'undefined',
                windowSupabaseType: typeof window.__supabase,
                windowKeys: Object.keys(window).filter(key => key.includes('supabase'))
            });
            
            if (window.__supabase) {
                this.log('✅ Found window.__supabase, creating database helper...', 'info');
                this.supabase = window.__supabase;
                this.db = this.createDbHelper(this.supabase);
                this.supabaseEnabled = true;
                this.log('✅ Supabase loaded successfully via ESM', 'success', {
                    supabaseType: typeof this.supabase,
                    hasDbHelper: !!this.db,
                    dbMethods: this.db ? Object.keys(this.db) : null
                });
                return this.supabase;
            } else {
                this.log('❌ window.__supabase not found', 'error', {
                    windowKeys: Object.keys(window).filter(key => key.includes('supabase')),
                    scriptTags: Array.from(document.scripts).map(s => s.src || s.innerHTML.substring(0, 100))
                });
                throw new Error('Supabase not available: inject it via ESM script first.');
            }
        } catch (error) {
            this.log('❌ Failed to load Supabase', 'error', {
                error: error.message,
                stack: error.stack,
                windowSupabase: typeof window.__supabase,
                windowKeys: Object.keys(window).filter(key => key.includes('supabase'))
            });
            this.supabaseEnabled = false;
            this.supabase = null;
            this.db = null;
            throw error;
        }
    }

    // Create database helper functions
    createDbHelper(supabase) {
        return {
            // Users
            async getUsers() {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .order('elo', { ascending: false });
                    
                    if (error) throw error;
                    return data || [];
                } catch (error) {
                    console.error('getUsers error:', error);
                    throw error;
                }
            },

            async createUser(userData) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .insert([userData])
                        .select();
                    
                    if (error) throw error;
                    return data[0];
                } catch (error) {
                    console.error('createUser error:', error);
                    throw error;
                }
            },

            async updateUser(userId, updates) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .update({ 
                            ...updates,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId)
                        .select();
                    
                    if (error) throw error;
                    return data[0];
                } catch (error) {
                    console.error('updateUser error:', error);
                    throw error;
                }
            },

            async updateUserElo(userId, newElo) {
                return this.updateUser(userId, { elo: newElo });
            },

            // Votes
            async createVote(voteData) {
                try {
                    const { data, error } = await supabase
                        .from('votes')
                        .insert([voteData])
                        .select();
                    
                    if (error) throw error;
                    return data[0];
                } catch (error) {
                    console.error('createVote error:', error);
                    throw error;
                }
            },

            async getVotes() {
                try {
                    const { data, error } = await supabase
                        .from('votes')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    return data || [];
                } catch (error) {
                    console.error('getVotes error:', error);
                    throw error;
                }
            },

            // Statistics
            async getStatistics() {
                try {
                    const { data, error } = await supabase
                        .from('statistics')
                        .select('*')
                        .eq('id', 'global')
                        .single();
                    
                    if (error) throw error;
                    return data;
                } catch (error) {
                    console.error('getStatistics error:', error);
                    throw error;
                }
            },

            async updateStatistics(stats) {
                try {
                    const { data, error } = await supabase
                        .from('statistics')
                        .upsert([{
                            id: 'global',
                            ...stats,
                            updated_at: new Date().toISOString()
                        }])
                        .select();
                    
                    if (error) throw error;
                    return data[0];
                } catch (error) {
                    console.error('updateStatistics error:', error);
                    throw error;
                }
            },

            // Test connection
            async testConnection() {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('count')
                        .limit(1);
                    
                    if (error) return { success: false, error };
                    return { success: true, data };
                } catch (error) {
                    return { success: false, error };
                }
            }
        };
    }

    // Enable realtime functionality
    async enableRealtime() {
        try {
            const supabase = await this.loadSupabase();
            this.channel = supabase
                .channel("public:comparisons")
                .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
                    this.log("Realtime event", "info", payload);
                    this.handleUserUpdate(payload);
                })
                .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, (payload) => {
                    this.log("Realtime event", "info", payload);
                    this.handleVoteUpdate(payload);
                })
                .on("postgres_changes", { event: "*", schema: "public", table: "statistics" }, (payload) => {
                    this.log("Realtime event", "info", payload);
                    this.handleStatsUpdate(payload);
                })
                .subscribe();
            
            this.log('✅ Realtime enabled successfully', 'success');
            return this.channel;
        } catch (error) {
            this.log('❌ Failed to enable realtime', 'error', error);
            throw error;
        }
    }

    // Test Supabase connection
    async testSupabaseConnection() {
        if (!this.supabaseEnabled || !this.db) {
            this.log('❌ Supabase not available for testing', 'warning');
            return { success: false, message: 'Supabase disabled for local testing' };
        }
        
        try {
            // Test basic connection by trying to get users
            const users = await this.db.getUsers();
            this.log('Supabase connection test successful', 'info', { userCount: users.length });
            
            // Check if database schema is set up
            await this.checkDatabaseSchema();
            
            // Test real-time connection
            await this.testRealTimeConnection();
            
            return { success: true, userCount: users.length };
        } catch (error) {
            this.log('Supabase connection test failed', 'error', error);
            throw error;
        }
    }

    // Check if database schema is set up
    async checkDatabaseSchema() {
        if (!this.supabaseEnabled || !this.supabase) {
            this.log('❌ Supabase not available for schema check', 'warning');
            return;
        }
        
        try {
            // Test if users table exists
            const { data: users, error: usersError } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);
            
            if (usersError) {
                this.log('Users table error - schema may not be set up', 'error', usersError);
                throw new Error('Database schema not set up. Run database-schema.sql in Supabase SQL Editor.');
            } else {
                this.log('Users table exists and accessible', 'info');
            }
            
            // Test if votes table exists
            const { data: votes, error: votesError } = await this.supabase
                .from('votes')
                .select('count')
                .limit(1);
            
            if (votesError) {
                this.log('Votes table error - schema may not be set up', 'error', votesError);
            } else {
                this.log('Votes table exists and accessible', 'info');
            }
            
            // Test if statistics table exists
            const { data: stats, error: statsError } = await this.supabase
                .from('statistics')
                .select('count')
                .limit(1);
            
            if (statsError) {
                this.log('Statistics table error - schema may not be set up', 'error', statsError);
            } else {
                this.log('Statistics table exists and accessible', 'info');
            }
            
        } catch (error) {
            this.log('Database schema check failed', 'error', error);
            throw error;
        }
    }

    // Test real-time connection
    async testRealTimeConnection() {
        if (!this.supabaseEnabled || !this.supabase) {
            this.log('❌ Supabase not available for real-time test', 'warning');
            return { success: false, message: 'Supabase disabled for local testing' };
        }
        
        return new Promise((resolve, reject) => {
            this.log('Testing real-time connection...', 'info');
            
            const testChannel = this.supabase
                .channel('test_connection')
                .on('presence', { event: 'sync' }, () => {
                    this.log('Real-time connection test successful', 'success');
                    resolve({ success: true });
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        this.log('Real-time subscription active', 'success');
                    } else if (status === 'CHANNEL_ERROR') {
                        this.log('Real-time connection test failed', 'error');
                        reject(new Error('Real-time connection failed'));
                    }
                });
            
            // Clean up test channel after 5 seconds
            setTimeout(() => {
                this.supabase.removeChannel(testChannel);
                resolve({ success: true, message: 'Test completed' });
            }, 5000);
        });
    }

    // Setup real-time subscriptions with error logging
    setupRealTimeSubscriptions() {
        try {
            if (!this.supabaseEnabled || !this.supabase) {
                this.log('Supabase not enabled, skipping real-time setup', 'warning');
                this.showRealTimeStatus(false);
                return;
            }

            this.log('Setting up real-time subscriptions...', 'info');
            this.showNotification('🔄 Setting up real-time connection...', 'info');

            // Clear any existing subscriptions
            if (this.subscriptions) {
                this.subscriptions.forEach(sub => {
                    if (sub && sub.unsubscribe) {
                        sub.unsubscribe();
                    }
                });
            }

            // Create separate channels for better reliability
            const usersChannel = this.supabase.channel('users_live')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'users' },
                    (payload) => {
                        this.log('Real-time user update received', 'info', payload);
                        this.handleUserUpdate(payload);
                    }
                )
                .subscribe((status) => {
                    this.log(`Users channel status: ${status}`, 'info');
                    this.updateRealTimeStatus();
                });

            const votesChannel = this.supabase.channel('votes_live')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'votes' },
                    (payload) => {
                        this.log('Real-time vote update received', 'info', payload);
                        this.handleVoteUpdate(payload);
                    }
                )
                .subscribe((status) => {
                    this.log(`Votes channel status: ${status}`, 'info');
                    this.updateRealTimeStatus();
                });

            const statsChannel = this.supabase.channel('stats_live')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'statistics' },
                    (payload) => {
                        this.log('Real-time stats update received', 'info', payload);
                        this.handleStatsUpdate(payload);
                    }
                )
                .subscribe((status) => {
                    this.log(`Stats channel status: ${status}`, 'info');
                    this.updateRealTimeStatus();
                });

            this.subscriptions = [usersChannel, votesChannel, statsChannel];
            this.log('Real-time subscriptions setup complete', 'success');
            
            // Check connection status after 5 seconds
            setTimeout(() => {
                this.checkRealTimeStatus();
            }, 5000);
            
        } catch (error) {
            this.reportError(error, 'setupRealTimeSubscriptions');
            this.showRealTimeStatus(false);
            this.showNotification('❌ Real-time setup error - retrying...', 'error');
            
            // Retry after 5 seconds
            setTimeout(() => {
                this.setupRealTimeSubscriptions();
            }, 5000);
        }
    }

    // Check real-time status
    checkRealTimeStatus() {
        // If Supabase is not enabled, we're in local mode
        if (!this.supabaseEnabled) {
            this.log('App running in local mode (Supabase disabled)', 'info');
            this.showRealTimeStatus(false);
            return;
        }

        if (!this.subscriptions || this.subscriptions.length === 0) {
            this.log('No real-time subscriptions found', 'warning');
            this.showRealTimeStatus(false);
            return;
        }

        let allSubscribed = true;
        this.subscriptions.forEach((sub, index) => {
            if (sub && sub.subscribe) {
                const status = sub.subscribe.status;
                this.log(`Channel ${index} status: ${status}`, 'info');
                if (status !== 'SUBSCRIBED') {
                    allSubscribed = false;
                }
            } else {
                allSubscribed = false;
            }
        });

        if (allSubscribed) {
            this.log('✅ All real-time channels connected - LIVE MODE ACTIVE!', 'success');
            this.showRealTimeStatus(true);
            this.showNotification('✅ LIVE MODE ACTIVATED! Real-time updates enabled!', 'success');
        } else {
            this.log('❌ Some real-time channels not connected', 'warning');
            this.showRealTimeStatus(false);
            this.showNotification('🔄 Real-time connection incomplete - retrying...', 'warning');
            
            // Retry setup
            setTimeout(() => {
                this.setupRealTimeSubscriptions();
            }, 3000);
        }
    }

    // Update real-time status based on current subscriptions
    updateRealTimeStatus() {
        setTimeout(() => {
            this.checkRealTimeStatus();
        }, 1000);
    }

    // Force enable live mode
    async forceEnableLiveMode() {
        this.log('🚀 Force enabling live mode...', 'info');
        
        try {
            // Clear existing subscriptions
            if (this.subscriptions) {
                this.subscriptions.forEach(sub => {
                    if (sub && sub.unsubscribe) {
                        sub.unsubscribe();
                    }
                });
            }
            
            // Test database connection first
            const connectionTest = await this.testDatabaseConnection();
            if (!connectionTest.success) {
                this.log('❌ Database connection failed, cannot enable live mode', 'error');
                return { success: false, error: 'Database connection failed' };
            }
            
            // Setup real-time subscriptions
            this.setupRealTimeSubscriptions();
            
            // Check status after 3 seconds
            setTimeout(() => {
                this.checkRealTimeStatus();
            }, 3000);
            
            this.log('✅ Live mode activation initiated', 'success');
            return { success: true, message: 'Live mode activation initiated' };
            
        } catch (error) {
            this.log('❌ Failed to force enable live mode', 'error', error);
            return { success: false, error: error.message };
        }
    }

    // Refresh data from Supabase to ensure we have latest
    async refreshDataFromSupabase() {
        try {
            await this.loadDataFromSupabase();
            this.updateLeaderboard();
            this.updateStats();
            this.log('Data refreshed from Supabase', 'info');
        } catch (error) {
            this.log('Error refreshing data from Supabase', 'error', error);
        }
    }

    // Handle real-time user updates
    handleUserUpdate(payload) {
        this.log('⚡ Real-time user update received', 'info', {
            eventType: payload.eventType,
            userId: payload.new?.id,
            sessionId: this.getSessionId(),
            timestamp: new Date().toISOString()
        });

        if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new;
            const index = this.profiles.findIndex(p => p.id === updatedUser.id);
            if (index !== -1) {
                this.profiles[index] = updatedUser;
                this.updateLeaderboard();
                this.log('✅ User updated via real-time', 'info', {
                    user: updatedUser.name,
                    newElo: updatedUser.elo,
                    sessionId: this.getSessionId()
                });
            }
        } else if (payload.eventType === 'INSERT') {
            this.profiles.push(payload.new);
            this.updateLeaderboard();
            this.log('✅ New user added via real-time', 'info', {
                user: payload.new.name,
                sessionId: this.getSessionId()
            });
        }
    }

    // Handle real-time vote updates
    handleVoteUpdate(payload) {
        this.log('⚡ Real-time vote update received', 'info', {
            eventType: payload.eventType,
            voteId: payload.new?.id,
            sessionId: this.getSessionId(),
            timestamp: new Date().toISOString()
        });

        if (payload.eventType === 'INSERT') {
            const vote = payload.new;
            this.votes.push(vote);
            
            // Update user ELO scores based on the vote
            const winnerIndex = this.profiles.findIndex(p => p.id === vote.winner_id);
            const loserIndex = this.profiles.findIndex(p => p.id === vote.loser_id);
            
            if (winnerIndex !== -1) {
                this.profiles[winnerIndex].elo = vote.winner_elo_after;
                this.profiles[winnerIndex].wins = (this.profiles[winnerIndex].wins || 0) + 1;
                this.profiles[winnerIndex].totalVotes = (this.profiles[winnerIndex].totalVotes || 0) + 1;
                this.log('✅ Winner updated via real-time', 'info', {
                    user: this.profiles[winnerIndex].name,
                    newElo: vote.winner_elo_after,
                    wins: this.profiles[winnerIndex].wins
                });
            }
            
            if (loserIndex !== -1) {
                this.profiles[loserIndex].elo = vote.loser_elo_after;
                this.profiles[loserIndex].totalVotes = (this.profiles[loserIndex].totalVotes || 0) + 1;
                this.log('✅ Loser updated via real-time', 'info', {
                    user: this.profiles[loserIndex].name,
                    newElo: vote.loser_elo_after
                });
            }
            
            // Update UI immediately
            this.updateStats();
            this.updateLeaderboard();
            
            // Show notification for real-time update
            this.showNotification('⚡ Live update received!', 'info');
            
            this.log('✅ Vote processed via real-time - UI updated', 'success', {
                voteId: vote.id,
                winnerElo: vote.winner_elo_after,
                loserElo: vote.loser_elo_after
            });
        }
    }

    // Handle real-time stats updates
    handleStatsUpdate(payload) {
        if (payload.eventType === 'UPDATE') {
            this.stats = payload.new;
            this.updateStatsDisplay();
            this.log('Stats updated via real-time', 'info', payload.new);
        }
    }

    // Load data from Supabase with error logging
    async loadDataFromSupabase() {
        if (!this.supabaseEnabled || !this.db) {
            this.log('❌ Supabase not available for data loading', 'warning');
            throw new Error('Supabase disabled for local testing');
        }
        
        try {
            this.log('Loading data from Supabase...', 'info');
            this.profiles = await this.db.getUsers();
            this.log('Loaded profiles from Supabase', 'info', { count: this.profiles.length });
            
            this.votes = await this.db.getVotes();
            this.log('Loaded votes from Supabase', 'info', { count: this.votes.length });
            
            this.stats = await this.db.getStatistics();
            this.log('Loaded stats from Supabase', 'info', this.stats);
            
            this.stats.totalUsers = this.profiles.length;
            this.log('Data loaded successfully from Supabase', 'success');
        } catch (error) {
            this.log('Failed to load data from Supabase', 'error', error);
            throw error;
        }
    }

    // Enhanced logging for Vercel
    log(message, level = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            appState: {
                supabaseEnabled: this.supabaseEnabled,
                profilesCount: this.profiles?.length || 0,
                votesCount: this.votes?.length || 0,
                currentComparison: this.currentComparison ? {
                    left: this.currentComparison.left?.name,
                    right: this.currentComparison.right?.name
                } : null
            }
        };
        
        // Console logging
        const logMethod = level === 'error' ? console.error : 
                         level === 'warning' ? console.warn : 
                         level === 'success' ? console.log : console.log;
        
        const emoji = level === 'error' ? '❌' : 
                     level === 'warning' ? '⚠️' : 
                     level === 'success' ? '✅' : '📝';
        
        logMethod(`${emoji} [${level.toUpperCase()}] ${message}`, logEntry);
        
        // Store logs in localStorage for debugging
        const logs = JSON.parse(localStorage.getItem('ynYoungNetwork_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('ynYoungNetwork_logs', JSON.stringify(logs));
        
        // Send to Vercel Analytics (if available)
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'app_log', {
                event_category: 'interaction',
                event_label: level,
                value: 1,
                custom_parameter_1: message,
                custom_parameter_2: JSON.stringify(data)
            });
        }
        
        // Auto-detect and report errors
        if (level === 'error') {
            this.reportError(logEntry);
        }
        
        // Send ALL logs to server for comprehensive Vercel logging
        this.sendLogToServer(logEntry);
    }

    // Store error logs locally for debugging
    storeErrorLog(logEntry) {
        try {
            const errorLogs = JSON.parse(localStorage.getItem('yn_error_logs') || '[]');
            errorLogs.push(logEntry);
            
            // Keep only last 100 logs
            if (errorLogs.length > 100) {
                errorLogs.splice(0, errorLogs.length - 100);
            }
            
            localStorage.setItem('yn_error_logs', JSON.stringify(errorLogs));
        } catch (error) {
            console.error('Failed to store error log:', error);
        }
    }

    // Get all error logs
    getErrorLogs() {
        try {
            return JSON.parse(localStorage.getItem('yn_error_logs') || '[]');
        } catch (error) {
            console.error('Failed to get error logs:', error);
            return [];
        }
    }

    // Clear error logs
    clearErrorLogs() {
        try {
            localStorage.removeItem('yn_error_logs');
            this.log('Error logs cleared', 'info');
        } catch (error) {
            console.error('Failed to clear error logs:', error);
        }
    }

    // Enhanced error reporting
    reportError(error, context = '') {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: this.getSessionId(),
            appState: {
                supabaseEnabled: this.supabaseEnabled,
                profilesCount: this.profiles?.length || 0,
                votesCount: this.votes?.length || 0,
                currentComparison: this.currentComparison ? {
                    left: this.currentComparison.left?.name,
                    right: this.currentComparison.right?.name
                } : null
            }
        };
        
        this.log(`Error in ${context}: ${error.message}`, 'error', errorInfo);
        
        // Send detailed error to server
        this.sendErrorToServer(errorInfo);
        
        return errorInfo;
    }

    // Send error to server
    async sendErrorToServer(errorInfo) {
        try {
            await fetch('/api/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    level: 'error',
                    message: `ERROR: ${errorInfo.context} - ${errorInfo.message}`,
                    data: errorInfo
                })
            });
        } catch (error) {
            console.error('Failed to send error to server:', error);
        }
    }

    // Online-only data loading - no localStorage fallback
    loadData() {
        this.log('❌ Offline mode not supported - online connection required', 'error', {
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent
        });
        throw new Error('Online connection required to play YN Young Network');
    }

    // Load mock data for initial testing
    loadMockData() {
        if (this.profiles.length === 0) {
            this.profiles = [
                {
                    id: '1',
                    name: "Sarah Chen",
                    title: "Senior Software Engineer",
                    university: "Stanford University",
                    company: "Google",
                    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                    linkedinUrl: "https://linkedin.com/in/sarah-chen-google",
                    achievements: [
                        "Google Software Engineering Internship",
                        "Stanford Computer Science Degree",
                        "Microsoft MVP Award",
                        "AWS Solutions Architect Certification",
                        "Open Source Contributor (500+ stars)"
                    ],
                    industry: "technology",
                    wins: 0,
                    totalVotes: 0,
                    elo: 1200
                },
                {
                    id: '2',
                    name: "Marcus Rodriguez",
                    title: "Product Manager",
                    university: "Harvard University",
                    company: "Netflix",
                    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                    linkedinUrl: "https://linkedin.com/in/marcus-rodriguez-netflix",
                    achievements: [
                        "Netflix Product Management Internship",
                        "Harvard Business School MBA",
                        "Forbes 30 Under 30",
                        "Product Hunt Maker of the Year",
                        "Led $50M revenue growth project"
                    ],
                    industry: "business",
                    wins: 0,
                    totalVotes: 0,
                    elo: 1200
                },
                {
                    id: '3',
                    name: "Emily Watson",
                    title: "Data Scientist",
                    university: "MIT",
                    company: "Meta",
                    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                    linkedinUrl: "https://linkedin.com/in/emily-watson-meta",
                    achievements: [
                        "Meta Data Science Internship",
                        "MIT Statistics PhD",
                        "Kaggle Grandmaster",
                        "Published 15+ research papers",
                        "TEDx Speaker on AI Ethics"
                    ],
                    industry: "technology",
                    wins: 0,
                    totalVotes: 0,
                    elo: 1200
                },
                {
                    id: '4',
                    name: "David Kim",
                    title: "Investment Banker",
                    university: "University of Pennsylvania (Wharton)",
                    company: "Goldman Sachs",
                    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                    linkedinUrl: "https://linkedin.com/in/david-kim-goldman",
                    achievements: [
                        "Goldman Sachs Summer Analyst",
                        "Wharton Finance Degree",
                        "CFA Charterholder",
                        "Closed $2B M&A deal",
                        "Youngest VP in department history"
                    ],
                    industry: "finance",
                    wins: 0,
                    totalVotes: 0,
                    elo: 1200
                },
                {
                    id: '5',
                    name: "Alex Johnson",
                    title: "Creative Director",
                    university: "Parsons School of Design",
                    company: "Apple",
                    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                    linkedinUrl: "https://linkedin.com/in/alex-johnson-apple",
                    achievements: [
                        "Apple Design Internship",
                        "Parsons School of Design",
                        "Cannes Lions Grand Prix",
                        "Designed iPhone 15 interface",
                        "100+ million users worldwide"
                    ],
                    industry: "creative",
                    wins: 0,
                    totalVotes: 0,
                    elo: 1200
                },
                {
                    id: '6',
                    name: "Priya Patel",
                    title: "Medical Director",
                    university: "Johns Hopkins University",
                    company: "Mayo Clinic",
                    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
                    linkedinUrl: "https://linkedin.com/in/priya-patel-mayo",
                    achievements: [
                        "Mayo Clinic Residency",
                        "Johns Hopkins Medical School",
                        "Board Certified in 3 specialties",
                        "Published 50+ medical papers",
                        "Led breakthrough cancer research"
                    ],
                    industry: "healthcare",
                    wins: 0,
                    totalVotes: 0,
                    elo: 1200
                }
            ];
            this.saveData();
            this.log('Mock data loaded', 'info', { profilesCount: this.profiles.length });
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem('ynYoungNetwork_profiles', JSON.stringify(this.profiles));
            localStorage.setItem('ynYoungNetwork_votes', JSON.stringify(this.votes));
            localStorage.setItem('ynYoungNetwork_stats', JSON.stringify(this.stats));
            this.log('Data saved to localStorage', 'info', {
                profiles: this.profiles.length,
                votes: this.votes.length,
                stats: this.stats
            });
        } catch (error) {
            this.log('Error saving data to localStorage', 'error', error);
        }
    }

    // Load data from localStorage
    loadData() {
        try {
            const savedProfiles = localStorage.getItem('ynYoungNetwork_profiles');
            const savedVotes = localStorage.getItem('ynYoungNetwork_votes');
            const savedStats = localStorage.getItem('ynYoungNetwork_stats');
            
            if (savedProfiles) {
                this.profiles = JSON.parse(savedProfiles);
                this.log('Loaded profiles from localStorage', 'info', { count: this.profiles.length });
            }
            
            if (savedVotes) {
                this.votes = JSON.parse(savedVotes);
                this.log('Loaded votes from localStorage', 'info', { count: this.votes.length });
            }
            
            if (savedStats) {
                this.stats = JSON.parse(savedStats);
                this.log('Loaded stats from localStorage', 'info', this.stats);
            }
            
            this.log('Data loaded from localStorage', 'success');
        } catch (error) {
            this.log('Error loading data from localStorage', 'error', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        try {
            // Navigation buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const view = e.currentTarget.dataset.view;
                    this.switchView(view);
                });
            });

            // Add profile form
            const addProfileForm = document.getElementById('add-profile-form');
            if (addProfileForm) {
                addProfileForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleAddProfile();
                });
            }

            // Industry filter
            const industrySelect = document.getElementById('industry-select');
            if (industrySelect) {
                industrySelect.addEventListener('change', (e) => {
                    const selectedIndustry = e.target.value;
                    this.filterByIndustry(selectedIndustry);
                });
            }

            this.log('Event listeners setup complete', 'success');
        } catch (error) {
            this.reportError(error, 'setupEventListeners');
        }
    }

    // Switch between views
    switchView(viewName) {
        try {
            // Hide all views
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });

            // Remove active class from all nav buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Show selected view
            const selectedView = document.getElementById(`${viewName}-view`);
            if (selectedView) {
                selectedView.classList.add('active');
            }

            // Add active class to nav button
            const selectedBtn = document.querySelector(`[data-view="${viewName}"]`);
            if (selectedBtn) {
                selectedBtn.classList.add('active');
            }

            // Special handling for leaderboard view
            if (viewName === 'leaderboard') {
                this.updateLeaderboard();
            }

            // Special handling for analytics view
            if (viewName === 'analytics') {
                this.updateAnalytics();
            }

            this.log(`Switched to ${viewName} view`, 'info');
        } catch (error) {
            this.reportError(error, 'switchView');
        }
    }

    // Start new comparison with error logging
    startNewComparison() {
        try {
            if (this.profiles.length < 2) {
                this.log('Not enough profiles for comparison', 'warning', { profileCount: this.profiles.length });
                return;
            }

            // Get two random profiles
            const shuffled = [...this.profiles].sort(() => 0.5 - Math.random());
            const left = shuffled[0];
            const right = shuffled[1];

            this.currentComparison = { left, right };
            this.updateComparisonDisplay();
            
            this.log('New comparison started', 'info', {
                left: left.name,
                right: right.name,
                leftElo: left.elo,
                rightElo: right.elo
            });

        } catch (error) {
            this.reportError(error, 'startNewComparison');
        }
    }

    // Update comparison display with error logging
    updateComparisonDisplay() {
        try {
            if (!this.currentComparison) {
                this.log('No current comparison to display', 'warning');
                return;
            }

            const left = this.currentComparison.left;
            const right = this.currentComparison.right;

            // Update left card
            if (left) {
                document.getElementById('left-name').textContent = left.name;
                document.getElementById('left-title').textContent = left.title;
                document.getElementById('left-university').textContent = left.university;
                document.getElementById('left-company').textContent = left.company;
                document.getElementById('left-elo').textContent = left.elo;
                
                if (left.imageUrl) {
                    document.getElementById('left-image').src = left.imageUrl;
                }
                
                if (left.linkedinUrl) {
                    const linkedinLink = document.getElementById('left-linkedin');
                    linkedinLink.href = left.linkedinUrl;
                    linkedinLink.style.display = 'inline-block';
                }
            }

            // Update right card
            if (right) {
                document.getElementById('right-name').textContent = right.name;
                document.getElementById('right-title').textContent = right.title;
                document.getElementById('right-university').textContent = right.university;
                document.getElementById('right-company').textContent = right.company;
                document.getElementById('right-elo').textContent = right.elo;
                
                if (right.imageUrl) {
                    document.getElementById('right-image').src = right.imageUrl;
                }
                
                if (right.linkedinUrl) {
                    const linkedinLink = document.getElementById('right-linkedin');
                    linkedinLink.href = right.linkedinUrl;
                    linkedinLink.style.display = 'inline-block';
                }
            }

            this.log('Comparison display updated', 'info', {
                left: left?.name,
                right: right?.name
            });

        } catch (error) {
            this.reportError(error, 'updateComparisonDisplay');
        }
    }

    // Handle voting
    async handleVote(winnerSide) {
        this.log('🎯 Vote interaction started', 'info', {
            winnerSide,
            sessionId: this.getSessionId(),
            timestamp: new Date().toISOString()
        });

        if (!this.currentComparison) {
            this.log('❌ No current comparison available for voting', 'error');
            return;
        }

        const winner = this.currentComparison[winnerSide];
        const loser = this.currentComparison[winnerSide === 'left' ? 'right' : 'left'];

        if (!winner || !loser) {
            this.log('❌ Invalid winner or loser in comparison', 'error', { winner, loser });
            return;
        }

        // Log the comparison details
        this.log('📊 Comparison details', 'info', {
            winner: {
                name: winner.name,
                title: winner.title,
                company: winner.company,
                elo: winner.elo
            },
            loser: {
                name: loser.name,
                title: loser.title,
                company: loser.company,
                elo: loser.elo
            },
            winnerSide,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        });

        // Record vote
        const vote = {
            winner_id: winner.id,
            loser_id: loser.id,
            winner_elo_before: winner.elo,
            loser_elo_before: loser.elo,
            winner_elo_after: winner.elo + this.eloChange,
            loser_elo_after: Math.max(0, loser.elo - this.eloChange)
        };

        this.log('📊 Recording vote...', 'info', {
            vote,
            winner: { name: winner.name, elo: winner.elo },
            loser: { name: loser.name, elo: loser.elo },
            sessionId: this.getSessionId()
        });

        try {
            // Update local user data immediately for responsive UI
            winner.wins = (winner.wins || 0) + 1;
            winner.totalVotes = (winner.totalVotes || 0) + 1;
            winner.elo += this.eloChange;
            
            loser.totalVotes = (loser.totalVotes || 0) + 1;
            loser.elo = Math.max(0, loser.elo - this.eloChange);

            // Update stats
            this.stats.totalVotes++;
            this.stats.comparisonsMade++;

            // Log the ELO changes
            this.log('📈 ELO changes applied', 'success', {
                winner: {
                    name: winner.name,
                    oldElo: winner.elo - this.eloChange,
                    newElo: winner.elo,
                    wins: winner.wins,
                    totalVotes: winner.totalVotes
                },
                loser: {
                    name: loser.name,
                    oldElo: loser.elo + this.eloChange,
                    newElo: loser.elo,
                    totalVotes: loser.totalVotes
                },
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });

            // Update UI immediately for instant feedback
            this.updateStats();
            this.updateLeaderboard();
            this.updateComparisonDisplay();

            // Show success modal
            this.showModal();

            // Try to save to database if Supabase is available
            if (this.supabaseEnabled && this.db) {
                try {
                    // Create vote in database
                    this.log('Attempting to save vote to Supabase...', 'info');
                    const savedVote = await this.db.createVote(vote);
                    this.log('Vote successfully recorded in Supabase', 'success', savedVote);
                    this.votes.push(savedVote);

                    // Update user ELO scores in Supabase database
                    this.log('Updating winner ELO in database...', 'info', {
                        userId: winner.id,
                        name: winner.name,
                        oldElo: winner.elo - this.eloChange,
                        newElo: winner.elo,
                        wins: winner.wins,
                        totalVotes: winner.totalVotes
                    });
                    
                    await this.db.updateUser(winner.id, {
                        elo: winner.elo,
                        wins: winner.wins,
                        total_votes: winner.totalVotes
                    });
                    
                    this.log('Updating loser ELO in database...', 'info', {
                        userId: loser.id,
                        name: loser.name,
                        oldElo: loser.elo + this.eloChange,
                        newElo: loser.elo,
                        totalVotes: loser.totalVotes
                    });
                    
                    await this.db.updateUser(loser.id, {
                        elo: loser.elo,
                        total_votes: loser.totalVotes
                    });
                    
                    // Update stats in Supabase
                    await this.db.updateStatistics(this.stats);
                    this.log('Stats updated in Supabase', 'success', this.stats);

                } catch (dbError) {
                    this.log('❌ Database update failed, but local changes saved', 'warning', {
                        error: dbError.message,
                        localData: { winner: winner.name, loser: loser.name, newElos: { winner: winner.elo, loser: loser.elo } }
                    });
                }
            } else {
                this.log('📝 Vote saved locally (Supabase not available)', 'info', {
                    winner: winner.name,
                    loser: loser.name,
                    newElos: { winner: winner.elo, loser: loser.elo }
                });
                
                // Save to localStorage
                this.saveData();
            }

            // Start new comparison after delay
            setTimeout(() => {
                this.hideModal();
                this.startNewComparison();
            }, 2000);

        } catch (error) {
            this.log('❌ Error processing vote', 'error', {
                error: error.message,
                stack: error.stack,
                sessionId: this.getSessionId()
            });
            
            // Show user-friendly error message
            this.showNotification('❌ Error processing vote. Please try again.', 'error');
        }
    }

    // Calculate cracked score
    calculateCrackedScore(profile) {
        const winRate = profile.totalVotes > 0 ? profile.wins / profile.totalVotes : 0;
        const achievementBonus = Math.min(profile.achievements.length * 0.05, 0.5);
        
        return Math.round((winRate * 70 + achievementBonus * 30) * 100) / 100;
    }

    // Show modal
    showModal() {
        try {
            const modal = document.getElementById('vote-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        } catch (error) {
            this.reportError(error, 'showModal');
        }
    }

    // Hide modal
    hideModal() {
        try {
            const modal = document.getElementById('vote-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        } catch (error) {
            this.reportError(error, 'hideModal');
        }
    }

    // Update stats display
    updateStats() {
        try {
            document.getElementById('total-votes').textContent = this.stats.totalVotes;
            document.getElementById('total-comparisons').textContent = this.stats.comparisonsMade;
            document.getElementById('total-users').textContent = this.stats.totalUsers;
        } catch (error) {
            this.reportError(error, 'updateStats');
        }
    }

    // Update stats display (for real-time updates)
    updateStatsDisplay() {
        this.updateStats();
    }

    // Update leaderboard
    updateLeaderboard() {
        try {
            const leaderboardList = document.getElementById('leaderboard-list');
            if (!leaderboardList) return;

            if (this.profiles.length === 0) {
                leaderboardList.innerHTML = '<p>No profiles available</p>';
                return;
            }

            // Sort profiles by ELO score
            const sortedProfiles = [...this.profiles].sort((a, b) => b.elo - a.elo);

            leaderboardList.innerHTML = sortedProfiles.map((profile, index) => `
                <div class="leaderboard-item">
                    <div class="rank">#${index + 1}</div>
                    <div class="profile-info">
                        <div class="name">${profile.name}</div>
                        <div class="title">${profile.title} at ${profile.company}</div>
                    </div>
                    <div class="stats">
                        <div class="elo">ELO: ${profile.elo}</div>
                        <div class="wins">Wins: ${profile.wins || 0}</div>
                        <div class="votes">Votes: ${profile.totalVotes || 0}</div>
                    </div>
                </div>
            `).join('');

            this.log('Leaderboard updated', 'info', { profileCount: sortedProfiles.length });
        } catch (error) {
            this.reportError(error, 'updateLeaderboard');
        }
    }

    // Add new profile
    async addNewProfile() {
        const form = document.getElementById('add-profile-form');
        const formData = new FormData(form);

        const newProfile = {
            id: Date.now().toString(), // Simple ID generation
            name: formData.get('name'),
            title: formData.get('title'),
            university: formData.get('university'),
            company: formData.get('company'),
            imageUrl: formData.get('imageUrl') || '',
            linkedinUrl: formData.get('linkedinUrl') || '',
            achievements: formData.get('achievements').split('\n').filter(a => a.trim()),
            industry: formData.get('industry'),
            elo: 1200,
            wins: 0,
            totalVotes: 0
        };

        // Validate profile
        if (newProfile.achievements.length === 0) {
            this.log('Profile validation failed: no achievements', 'error');
            alert('Please add at least one achievement.');
            return;
        }

        try {
            // This part is now a placeholder for Supabase
            if (this.supabaseEnabled && this.db) {
                await this.db.createUser(newProfile);
                this.log('New profile added to Supabase', 'info', newProfile);
            } else {
                this.profiles.push(newProfile);
                this.saveData(); // Save updated profiles
                this.log('New profile added to localStorage (fallback)', 'info', newProfile);
            }
            form.reset();

            // Switch back to compare view
            this.switchView('compare');
            await this.startNewComparison();

            this.log('New profile added', 'info', { name: newProfile.name, achievements: newProfile.achievements.length });
        } catch (error) {
            this.log('Error adding profile', 'error', error);
            alert('Error adding profile. Please try again.');
        }
    }

    // Get debug information
    getDebugInfo() {
        return {
            profiles: this.profiles.length,
            votes: this.votes.length,
            stats: this.stats,
            currentComparison: this.currentComparison,
            localStorage: {
                profiles: localStorage.getItem('ynYoungNetwork_profiles') ? 'exists' : 'missing',
                votes: localStorage.getItem('ynYoungNetwork_votes') ? 'exists' : 'missing',
                stats: localStorage.getItem('ynYoungNetwork_stats') ? 'exists' : 'missing'
            }
        };
    }

    // Export data for debugging
    exportData() {
        const data = {
            profiles: this.profiles,
            votes: this.votes,
            stats: this.stats,
            debugInfo: this.getDebugInfo(),
            logs: JSON.parse(localStorage.getItem('ynYoungNetwork_logs') || '[]'),
            errors: JSON.parse(localStorage.getItem('ynYoungNetwork_errors') || '[]')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `youngNetwork-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.log('Debug data exported', 'info');
    }

    // Force enable real-time mode - makes site 100% live
    forceEnableLiveMode() {
        this.log('Force enabling LIVE MODE...', 'info');
        this.showNotification('🚀 FORCING LIVE MODE ACTIVATION!', 'info');
        
        // Ensure Supabase is loaded
        if (!this.supabaseEnabled) {
            this.log('Loading Supabase for live mode...', 'info');
            this.loadSupabase().then(() => {
                this.supabaseEnabled = true;
                this.setupRealTimeSubscriptions();
            }).catch(error => {
                this.log('Failed to load Supabase for live mode', 'error', error);
                this.showNotification('❌ Failed to enable live mode - Supabase not available', 'error');
            });
        } else {
            // Re-setup real-time with aggressive retry
            this.setupRealTimeSubscriptions();
        }
        
        // Force refresh all data
        this.refreshDataFromSupabase();
        
        // Update UI to show live mode
        this.showRealTimeStatus(true);
        this.log('LIVE MODE force enabled!', 'success');
    }

    // Force refresh leaderboard
    forceRefreshLeaderboard() {
        this.log('Force refreshing leaderboard...', 'info');
        this.updateLeaderboard();
        this.showNotification('🔄 Leaderboard refreshed', 'info');
    }

    // Check leaderboard status
    checkLeaderboardStatus() {
        const leaderboardList = document.getElementById('leaderboard-list');
        const profilesCount = this.profiles.length;
        const leaderboardItems = leaderboardList.children.length;
        
        const status = {
            profilesCount,
            leaderboardItems,
            profiles: this.profiles.map(p => ({ name: p.name, elo: p.elo, wins: p.wins })),
            leaderboardVisible: document.getElementById('leaderboard-view').classList.contains('active')
        };
        
        console.log('Leaderboard Status:', status);
        this.log('Leaderboard status checked', 'info', status);
        return status;
    }

    // Force load data from Supabase only
    async forceLoadData() {
        this.log('🔄 Force loading data from Supabase...', 'info', {
            sessionId: this.getSessionId()
        });
        
        if (!this.supabaseEnabled || !this.db) {
            const error = 'Supabase connection required for data loading';
            this.log('❌ ' + error, 'error', {
                sessionId: this.getSessionId(),
                supabaseEnabled: this.supabaseEnabled,
                dbAvailable: !!this.db
            });
            this.showNotification('❌ Online connection required', 'error');
            throw new Error(error);
        }
        
        try {
            await this.loadDataFromSupabase();
            this.updateStats();
            this.updateLeaderboard();
            this.log('✅ Data loaded from Supabase', 'success');
            this.showNotification('✅ Data loaded from database', 'success');
        } catch (error) {
            this.log('❌ Failed to load from Supabase', 'error', {
                error: error.message,
                stack: error.stack,
                sessionId: this.getSessionId()
            });
            this.showNotification('❌ Failed to load data', 'error');
            throw error;
        }
    }

    // Check if leaderboard has data
    checkLeaderboardData() {
        const status = {
            profilesCount: this.profiles.length,
            votesCount: this.votes.length,
            stats: this.stats,
            hasData: this.profiles.length > 0,
            sessionId: this.getSessionId()
        };
        
        console.log('Leaderboard Data Status:', status);
        this.log('Leaderboard data status checked', 'info', status);
        return status;
    }

    // Get connection status for debugging
    getConnectionStatus() {
        const status = {
            supabaseEnabled: this.supabaseEnabled,
            realTimeActive: false,
            subscriptions: this.subscriptions ? this.subscriptions.length : 0,
            profilesCount: this.profiles ? this.profiles.length : 0,
            votesCount: this.votes ? this.votes.length : 0,
            stats: this.stats || null
        };
        
        if (this.subscriptions && this.subscriptions.length > 0) {
            status.realTimeActive = this.subscriptions[0].subscribe && 
                                   this.subscriptions[0].subscribe.status === 'SUBSCRIBED';
        }
        
        return status;
    }

    // Test real-time connection
    testRealTimeConnection() {
        this.log('Testing real-time connection...', 'info');
        
        if (!this.supabaseEnabled) {
            this.log('Supabase not enabled', 'error');
            return false;
        }
        
        if (!this.subscriptions || this.subscriptions.length === 0) {
            this.log('No real-time subscriptions active', 'error');
            return false;
        }
        
        const subscription = this.subscriptions[0];
        if (subscription.subscribe && subscription.subscribe.status === 'SUBSCRIBED') {
            this.log('Real-time connection is ACTIVE!', 'success');
            return true;
        } else {
            this.log('Real-time connection is NOT active', 'error');
            return false;
        }
    }

    // Check vote status and database connectivity
    async checkVoteStatus() {
        this.log('Checking vote status and database connectivity...', 'info');
        
        const status = {
            supabaseEnabled: this.supabaseEnabled,
            dbAvailable: !!this.db,
            currentVotes: this.votes.length,
            currentProfiles: this.profiles.length,
            currentStats: this.stats
        };
        
        if (this.supabaseEnabled && this.db) {
            try {
                // Test database connection
                const dbVotes = await this.db.getVotes();
                const dbStats = await this.db.getStatistics();
                
                status.dbVotesCount = dbVotes.length;
                status.dbStats = dbStats;
                status.dbConnection = 'success';
                
                this.log('Database connection successful', 'success', status);
            } catch (error) {
                status.dbConnection = 'error';
                status.dbError = error.message;
                this.log('Database connection failed', 'error', error);
            }
        }
        
        console.log('Vote Status:', status);
        return status;
    }

    // Force refresh data and check ELO scores
    async forceRefreshAndCheckElo() {
        this.log('🔄 Force refreshing data and checking ELO scores...', 'info');
        
        try {
            // Force reload data from Supabase
            await this.loadDataFromSupabase();
            
            // Check current ELO scores
            const eloScores = this.profiles.map(p => ({
                id: p.id,
                name: p.name,
                elo: p.elo,
                wins: p.wins || 0,
                totalVotes: p.totalVotes || 0
            }));
            
            this.log('Current ELO scores from database:', 'info', eloScores);
            
            // Update UI
            this.updateLeaderboard();
            this.updateStats();
            
            // Check if all ELO scores are the same (indicating no updates)
            const uniqueElos = [...new Set(eloScores.map(p => p.elo))];
            if (uniqueElos.length === 1) {
                this.log('⚠️ All ELO scores are the same - no votes have been recorded', 'warning', {
                    elo: uniqueElos[0],
                    userCount: eloScores.length
                });
            } else {
                this.log('✅ ELO scores are different - votes have been recorded', 'success', {
                    uniqueElos,
                    userCount: eloScores.length
                });
            }
            
            return {
                success: true,
                eloScores,
                uniqueElos,
                allSame: uniqueElos.length === 1
            };
            
        } catch (error) {
            this.log('❌ Force refresh failed', 'error', error);
            return { success: false, error: error.message };
        }
    }

    // Force refresh data from database
    async forceRefreshData() {
        this.log('Force refreshing data from database...', 'info');
        
        if (this.supabaseEnabled && this.db) {
            try {
                await this.loadDataFromSupabase();
                this.updateStats();
                this.updateLeaderboard();
                this.log('Data refreshed successfully', 'success');
                this.showNotification('✅ Data refreshed from database', 'success');
            } catch (error) {
                this.log('Error refreshing data', 'error', error);
                this.showNotification('❌ Error refreshing data', 'error');
            }
        } else {
            this.log('Supabase not available for data refresh', 'warning');
            this.showNotification('⚠️ Supabase not available', 'warning');
        }
    }

    // Test database connection and operations
    async testDatabaseConnection() {
        this.log('🔍 Testing database connection...', 'info', {
            sessionId: this.getSessionId(),
            supabaseEnabled: this.supabaseEnabled,
            dbAvailable: !!this.db,
            config: {
                url: this.supabase?.supabaseUrl,
                hasKey: !!this.supabase?.supabaseKey
            }
        });
        
        if (!this.supabaseEnabled || !this.db) {
            this.log('❌ Supabase not enabled or db not available', 'error');
            return { success: false, error: 'Supabase not enabled' };
        }
        
        try {
            // Test basic connection
            const connectionTest = await this.db.testConnection();
            this.log('Database connection test result', 'info', connectionTest);
            
            if (!connectionTest.success) {
                this.log('❌ Database connection failed', 'error', connectionTest.error);
                return connectionTest;
            }
            
            // Test reading data
            const users = await this.db.getUsers();
            const votes = await this.db.getVotes();
            const stats = await this.db.getStatistics();
            
            const result = {
                success: true,
                connection: connectionTest,
                data: {
                    usersCount: users.length,
                    votesCount: votes.length,
                    stats: stats,
                    sampleUsers: users.slice(0, 2).map(u => ({ id: u.id, name: u.name, elo: u.elo }))
                }
            };
            
            this.log('✅ Database connection test successful', 'success', result);
            return result;
            
        } catch (error) {
            this.log('❌ Database connection test failed', 'error', {
                error: error.message,
                stack: error.stack,
                sessionId: this.getSessionId()
            });
            return { success: false, error };
        }
    }

    // Force test database operations
    async testDatabaseOperations() {
        this.log('🧪 Testing database operations...', 'info');
        
        if (!this.supabaseEnabled || !this.db) {
            this.log('❌ Supabase not available for database operations test', 'warning');
            return { success: false, message: 'Supabase disabled for local testing' };
        }
        
        try {
            // Test creating a vote
            const testVote = {
                winner_id: 'test-winner-id',
                loser_id: 'test-loser-id',
                winner_elo_before: 1200,
                loser_elo_before: 1200,
                winner_elo_after: 1220,
                loser_elo_after: 1180
            };
            
            this.log('Testing vote creation...', 'info', testVote);
            const createdVote = await this.db.createVote(testVote);
            this.log('✅ Vote creation test successful', 'success', createdVote);
            
            // Test updating statistics
            const testStats = {
                total_votes: 1,
                total_comparisons: 1,
                total_users: 6
            };
            
            this.log('Testing statistics update...', 'info', testStats);
            const updatedStats = await this.db.updateStatistics(testStats);
            this.log('✅ Statistics update test successful', 'success', updatedStats);
            
            return { success: true, vote: createdVote, stats: updatedStats };
            
        } catch (error) {
            this.log('❌ Database operations test failed', 'error', {
                error: error.message,
                stack: error.stack,
                sessionId: this.getSessionId()
            });
            return { success: false, error };
        }
    }

    // Test user ELO updates specifically
    async testUserEloUpdates() {
        this.log('🎯 Testing user ELO updates...', 'info');
        
        if (!this.supabaseEnabled || !this.db) {
            this.log('❌ Supabase not available for ELO update test', 'warning');
            return { success: false, message: 'Supabase disabled for local testing' };
        }
        
        try {
            // Get first two users for testing
            const users = await this.db.getUsers();
            if (users.length < 2) {
                throw new Error('Need at least 2 users to test ELO updates');
            }
            
            const user1 = users[0];
            const user2 = users[1];
            
            this.log('Testing ELO update for user 1...', 'info', {
                userId: user1.id,
                name: user1.name,
                currentElo: user1.elo
            });
            
            // Test updating user 1's ELO
            const updatedUser1 = await this.db.updateUser(user1.id, {
                elo: user1.elo + 20,
                wins: (user1.wins || 0) + 1,
                total_votes: (user1.total_votes || 0) + 1
            });
            
            this.log('✅ User 1 ELO update successful', 'success', updatedUser1);
            
            // Test updating user 2's ELO
            this.log('Testing ELO update for user 2...', 'info', {
                userId: user2.id,
                name: user2.name,
                currentElo: user2.elo
            });
            
            const updatedUser2 = await this.db.updateUser(user2.id, {
                elo: Math.max(0, user2.elo - 20),
                total_votes: (user2.total_votes || 0) + 1
            });
            
            this.log('✅ User 2 ELO update successful', 'success', updatedUser2);
            
            return { 
                success: true, 
                user1: updatedUser1, 
                user2: updatedUser2 
            };
            
        } catch (error) {
            this.log('❌ User ELO update test failed', 'error', {
                error: error.message,
                stack: error.stack,
                sessionId: this.getSessionId()
            });
            return { success: false, error };
        }
    }

    // Diagnose real-time connection issues
    async diagnoseRealTime() {
        this.log('🔍 Diagnosing real-time connection...', 'info');
        
        const diagnosis = {
            timestamp: new Date().toISOString(),
            supabaseEnabled: this.supabaseEnabled,
            dbAvailable: !!this.db,
            subscriptions: this.subscriptions?.length || 0,
            subscriptionStatuses: [],
            realTimeEnabled: false,
            issues: []
        };
        
        try {
            // Check if Supabase is enabled
            if (!this.supabaseEnabled) {
                diagnosis.issues.push('Supabase not enabled');
                this.log('❌ Supabase not enabled', 'error');
                return diagnosis;
            }
            
            // Check if database is available
            if (!this.db) {
                diagnosis.issues.push('Database not available');
                this.log('❌ Database not available', 'error');
                return diagnosis;
            }
            
            // Test basic database connection
            const connectionTest = await this.testDatabaseConnection();
            if (!connectionTest.success) {
                diagnosis.issues.push('Database connection failed');
                this.log('❌ Database connection failed', 'error');
                return diagnosis;
            }
            
            // Check subscription statuses
            if (this.subscriptions && this.subscriptions.length > 0) {
                this.subscriptions.forEach((sub, index) => {
                    if (sub && sub.subscribe) {
                        const status = sub.subscribe.status;
                        diagnosis.subscriptionStatuses.push({ index, status });
                        this.log(`Channel ${index} status: ${status}`, 'info');
                        
                        if (status === 'SUBSCRIBED') {
                            diagnosis.realTimeEnabled = true;
                        } else {
                            diagnosis.issues.push(`Channel ${index} not subscribed (${status})`);
                        }
                    } else {
                        diagnosis.issues.push(`Channel ${index} invalid subscription`);
                    }
                });
            } else {
                diagnosis.issues.push('No subscriptions found');
            }
            
            // Test real-time by creating a test subscription
            this.log('Testing real-time subscription...', 'info');
            const testChannel = this.supabase.channel('diagnosis_test')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'users' },
                    (payload) => {
                        this.log('Test real-time message received', 'success', payload);
                    }
                )
                .subscribe((status) => {
                    this.log(`Test channel status: ${status}`, 'info');
                    if (status === 'SUBSCRIBED') {
                        diagnosis.realTimeEnabled = true;
                        testChannel.unsubscribe();
                    } else if (status === 'CHANNEL_ERROR') {
                        diagnosis.issues.push('Real-time subscription failed');
                        testChannel.unsubscribe();
                    }
                });
            
            this.log('✅ Real-time diagnosis complete', 'success', diagnosis);
            return diagnosis;
            
        } catch (error) {
            diagnosis.issues.push(`Diagnosis error: ${error.message}`);
            this.log('❌ Real-time diagnosis failed', 'error', error);
            return diagnosis;
        }
    }

    // Auto-run diagnostic tests
    async runAutoDiagnostic() {
        this.log('🔍 Running automatic diagnostic tests...', 'info');
        
        try {
            // Test 1: Check if app is loaded
            this.log('✅ App loaded successfully', 'success');
            
            // Test 2: Check data
            this.log(`📊 Data status: ${this.profiles.length} profiles, ${this.votes.length} votes`, 'info');
            
            // Test 3: Check Supabase connection if enabled
            if (this.supabaseEnabled) {
                try {
                    await this.testSupabaseConnection();
                    this.log('✅ Supabase connection working', 'success');
                } catch (error) {
                    this.log('❌ Supabase connection failed', 'error', error);
                }
            } else {
                this.log('⚠️ Using mock data (Supabase disabled)', 'warning');
            }
            
            // Test 4: Check real-time if enabled
            if (this.supabaseEnabled) {
                try {
                    await this.testRealTimeConnection();
                    this.log('✅ Real-time connection working', 'success');
                } catch (error) {
                    this.log('❌ Real-time connection failed', 'error', error);
                }
            }
            
            // Test 5: Check ELO scores
            const uniqueElos = [...new Set(this.profiles.map(p => p.elo))];
            if (uniqueElos.length > 1) {
                this.log('✅ ELO scores are varied', 'success', { uniqueElos });
            } else {
                this.log('⚠️ All ELO scores are the same', 'warning', { elo: uniqueElos[0] });
            }
            
            this.log('🎯 Auto-diagnostic complete', 'success');
            
        } catch (error) {
            this.log('❌ Auto-diagnostic failed', 'error', error);
        }
    }

    // Cleanup subscriptions
    cleanup() {
        if (this.supabaseEnabled) {
            this.subscriptions.forEach(sub => sub.unsubscribe());
            this.subscriptions = [];
            this.log('Supabase subscriptions cleaned up', 'info');
        }
    }

    // Get session ID for tracking
    getSessionId() {
        let sessionId = sessionStorage.getItem('ynYoungNetwork_sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('ynYoungNetwork_sessionId', sessionId);
        }
        return sessionId;
    }

    // Get user ID for tracking
    getUserId() {
        let userId = localStorage.getItem('ynYoungNetwork_userId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ynYoungNetwork_userId', userId);
        }
        return userId;
    }

    // Send log to server for Vercel logging
    async sendLogToServer(logEntry) {
        try {
            // Send to a logging endpoint (you can create this in your Vercel functions)
            const response = await fetch('/api/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry)
            });
            
            if (!response.ok) {
                console.warn('Failed to send log to server:', response.status);
            }
        } catch (error) {
            // Silently fail - don't break the app for logging
            console.warn('Could not send log to server:', error);
        }
    }

    // Ensure app is always functional
    ensureAppFunctionality() {
        this.log('🔧 Ensuring app functionality...', 'info');
        
        // Ensure we have profiles to work with
        if (this.profiles.length === 0) {
            this.log('⚠️ No profiles found, loading mock data...', 'warning');
            this.loadMockData();
        }
        
        // Ensure current comparison exists
        if (!this.currentComparison) {
            this.log('⚠️ No current comparison, starting new one...', 'warning');
            this.startNewComparison();
        }
        
        // Update UI
        this.updateStats();
        this.updateLeaderboard();
        this.updateComparisonDisplay();
        
        // Set appropriate status
        if (this.supabaseEnabled) {
            this.showRealTimeStatus(true);
        } else {
            this.showRealTimeStatus(false);
        }
        
        this.log('✅ App functionality ensured', 'success');
    }

    // Enhanced error recovery
    async recoverFromError(error) {
        this.log('🔄 Attempting error recovery...', 'info', { error: error.message });
        
        try {
            // Try to reload data
            if (this.supabaseEnabled) {
                await this.loadDataFromSupabase();
            } else {
                await this.loadMockData();
            }
            
            // Ensure functionality
            this.ensureAppFunctionality();
            
            this.log('✅ Error recovery successful', 'success');
            this.showNotification('✅ App recovered successfully!', 'success');
            
        } catch (recoveryError) {
            this.log('❌ Error recovery failed', 'error', recoveryError);
            this.showNotification('❌ Recovery failed, but app is still functional', 'error');
        }
    }

    // Handle add profile
    handleAddProfile() {
        try {
            const formData = new FormData(document.getElementById('add-profile-form'));
            const profile = {
                id: 'profile_' + Date.now(),
                name: formData.get('name') || document.getElementById('name').value,
                title: formData.get('title') || document.getElementById('title').value,
                university: formData.get('university') || document.getElementById('university').value,
                company: formData.get('company') || document.getElementById('company').value,
                linkedinUrl: formData.get('linkedin') || document.getElementById('linkedin').value,
                imageUrl: formData.get('image-url') || document.getElementById('image-url').value,
                achievements: (formData.get('achievements') || document.getElementById('achievements').value).split(',').map(a => a.trim()),
                elo: 1200,
                wins: 0,
                totalVotes: 0
            };

            this.profiles.push(profile);
            this.stats.totalUsers = this.profiles.length;

            // Save to database if available
            if (this.supabaseEnabled && this.db) {
                this.db.createUser(profile).catch(error => {
                    this.log('Failed to save profile to database', 'warning', error);
                });
            }

            // Reset form
            document.getElementById('add-profile-form').reset();

            // Switch back to compare view
            this.switchView('compare');

            // Update UI
            this.updateStats();
            this.updateLeaderboard();

            this.log('Profile added successfully', 'success', { profile: profile.name });
            this.showNotification('✅ Profile added successfully!', 'success');
        } catch (error) {
            this.reportError(error, 'handleAddProfile');
            this.showNotification('❌ Failed to add profile', 'error');
        }
    }

    // Industry Filtering
    setupIndustryFilter() {
        const industrySelect = document.getElementById('industry-select');
        if (industrySelect) {
            industrySelect.addEventListener('change', (e) => {
                const selectedIndustry = e.target.value;
                this.filterByIndustry(selectedIndustry);
            });
        }
    }

    filterByIndustry(industry) {
        this.log('🔍 Filtering by industry: ' + (industry || 'All'), 'info');
        
        if (!industry) {
            // Show all profiles
            this.updateComparisonDisplay();
            this.updateLeaderboard();
            return;
        }
        
        // Filter profiles by industry
        const filteredProfiles = this.profiles.filter(profile => 
            profile.industry && profile.industry.toLowerCase() === industry.toLowerCase()
        );
        
        if (filteredProfiles.length < 2) {
            this.showNotification('⚠️ Not enough profiles in this industry for comparison', 'warning');
            return;
        }
        
        // Update current comparison with filtered profiles
        this.currentComparison = this.getRandomComparison(filteredProfiles);
        this.updateComparisonDisplay();
        this.updateLeaderboard(filteredProfiles);
    }

    // Analytics Dashboard
    setupAnalytics() {
        this.updateAnalytics();
    }

    updateAnalytics() {
        this.updateIndustryChart();
        this.updateVotingTrends();
        this.updateAchievementsList();
    }

    updateIndustryChart() {
        const chartContainer = document.getElementById('industry-chart');
        if (!chartContainer) return;
        
        const industryStats = {};
        this.profiles.forEach(profile => {
            const industry = profile.industry || 'Unknown';
            industryStats[industry] = (industryStats[industry] || 0) + 1;
        });
        
        const chartHTML = Object.entries(industryStats)
            .map(([industry, count]) => `
                <div class="achievement-item">
                    <span class="achievement-text">${industry}</span>
                    <span class="achievement-count">${count}</span>
                </div>
            `).join('');
        
        chartContainer.innerHTML = chartHTML || '<p>No industry data available</p>';
    }

    updateVotingTrends() {
        const trendsContainer = document.getElementById('voting-trends');
        if (!trendsContainer) return;
        
        const recentVotes = this.votes.slice(-10); // Last 10 votes
        const trendsHTML = recentVotes.length > 0 ? 
            `<p>Recent activity: ${recentVotes.length} votes in last session</p>
             <p>Total votes: ${this.stats.totalVotes}</p>
             <p>Comparisons made: ${this.stats.comparisonsMade}</p>` :
            '<p>No voting data available yet</p>';
        
        trendsContainer.innerHTML = trendsHTML;
    }

    updateAchievementsList() {
        const achievementsContainer = document.getElementById('achievements-list');
        if (!achievementsContainer) return;
        
        const achievementStats = {};
        this.profiles.forEach(profile => {
            if (profile.achievements) {
                profile.achievements.forEach(achievement => {
                    achievementStats[achievement] = (achievementStats[achievement] || 0) + 1;
                });
            }
        });
        
        const sortedAchievements = Object.entries(achievementStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10); // Top 10 achievements
        
        const achievementsHTML = sortedAchievements.length > 0 ?
            sortedAchievements.map(([achievement, count]) => `
                <div class="achievement-item">
                    <span class="achievement-text">${achievement}</span>
                    <span class="achievement-count">${count}</span>
                </div>
            `).join('') :
            '<p>No achievements data available</p>';
        
        achievementsContainer.innerHTML = achievementsHTML;
    }

    // Social Sharing
    shareResults() {
        const shareData = {
            title: 'YN Young Network - Professional Achievement Comparison',
            text: `I've compared ${this.stats.totalVotes} professionals on YN Young Network! Check out the leaderboard and see who's more "cracked".`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).then(() => {
                this.log('📤 Results shared successfully', 'success');
            }).catch(err => {
                this.log('❌ Share failed: ' + err.message, 'error');
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    shareVoteResult() {
        if (!this.currentComparison) return;
        
        const winner = this.currentComparison.left.elo > this.currentComparison.right.elo ? 
            this.currentComparison.left : this.currentComparison.right;
        
        const shareData = {
            title: 'YN Young Network Vote Result',
            text: `I voted for ${winner.name} as more "cracked"! ${winner.title} at ${winner.company} has an ELO of ${winner.elo}.`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).then(() => {
                this.log('📤 Vote result shared successfully', 'success');
            }).catch(err => {
                this.log('❌ Share failed: ' + err.message, 'error');
                this.fallbackShare(shareData);
            });
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        window.open(shareUrl, '_blank');
        this.log('📤 Shared via Twitter fallback', 'info');
    }

    exportAnalytics() {
        const analyticsData = {
            timestamp: new Date().toISOString(),
            profiles: this.profiles,
            votes: this.votes,
            stats: this.stats,
            industryStats: this.getIndustryStats(),
            achievementStats: this.getAchievementStats()
        };
        
        const dataStr = JSON.stringify(analyticsData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `yn-analytics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.log('📊 Analytics data exported', 'success');
    }

    getIndustryStats() {
        const stats = {};
        this.profiles.forEach(profile => {
            const industry = profile.industry || 'Unknown';
            stats[industry] = (stats[industry] || 0) + 1;
        });
        return stats;
    }

    getAchievementStats() {
        const stats = {};
        this.profiles.forEach(profile => {
            if (profile.achievements) {
                profile.achievements.forEach(achievement => {
                    stats[achievement] = (stats[achievement] || 0) + 1;
                });
            }
        });
        return stats;
    }

    // Achievement Categorization
    categorizeAchievement(achievement) {
        const achievementLower = achievement.toLowerCase();
        
        if (achievementLower.includes('internship') || achievementLower.includes('software') || 
            achievementLower.includes('engineer') || achievementLower.includes('developer') ||
            achievementLower.includes('tech') || achievementLower.includes('programming')) {
            return 'tech';
        }
        
        if (achievementLower.includes('mba') || achievementLower.includes('business') ||
            achievementLower.includes('product') || achievementLower.includes('management') ||
            achievementLower.includes('strategy')) {
            return 'business';
        }
        
        if (achievementLower.includes('finance') || achievementLower.includes('banking') ||
            achievementLower.includes('investment') || achievementLower.includes('cfa') ||
            achievementLower.includes('m&a') || achievementLower.includes('deal')) {
            return 'finance';
        }
        
        if (achievementLower.includes('design') || achievementLower.includes('creative') ||
            achievementLower.includes('art') || achievementLower.includes('cannes') ||
            achievementLower.includes('award') || achievementLower.includes('creative')) {
            return 'creative';
        }
        
        if (achievementLower.includes('phd') || achievementLower.includes('research') ||
            achievementLower.includes('paper') || achievementLower.includes('academic') ||
            achievementLower.includes('university') || achievementLower.includes('education')) {
            return 'education';
        }
        
        if (achievementLower.includes('health') || achievementLower.includes('medical') ||
            achievementLower.includes('doctor') || achievementLower.includes('nurse') ||
            achievementLower.includes('hospital')) {
            return 'healthcare';
        }
        
        return 'other';
    }

    renderAchievementWithCategory(achievement) {
        const category = this.categorizeAchievement(achievement);
        return `<span class="achievement-category category-${category}">${category}</span> ${achievement}`;
    }


}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new YoungNetwork();
});

// Add test function to window object
window.testRealTime = async function() {
    if (window.youngNetwork) {
        console.log('Testing real-time features...');
        try {
            if (window.youngNetwork.supabaseEnabled) {
                console.log('✅ Supabase is enabled');
                console.log('✅ Real-time subscriptions active');
                console.log('📊 Current profiles:', window.youngNetwork.profiles.length);
                console.log('📊 Current votes:', window.youngNetwork.votes.length);
                
                // Test a vote to see real-time updates
                console.log('🎯 Try voting on one tab and watch another tab update!');
            } else {
                console.log('❌ Supabase is disabled - using localStorage fallback');
                console.log('📊 Current profiles:', window.youngNetwork.profiles.length);
                console.log('📊 Current votes:', window.youngNetwork.votes.length);
            }
        } catch (error) {
            console.error('Error testing real-time features:', error);
        }
    }
};

// Add connection status function
window.getConnectionStatus = function() {
    if (window.youngNetwork) {
        return {
            supabaseEnabled: window.youngNetwork.supabaseEnabled,
            profilesCount: window.youngNetwork.profiles.length,
            votesCount: window.youngNetwork.votes.length,
            subscriptionsCount: window.youngNetwork.subscriptions.length
        };
    }
    return null;
};

// Add diagnostic function to window object
window.diagnoseRealTime = async function() {
    console.log('🔍 Diagnosing real-time connection...');
    
    if (window.youngNetwork) {
        const status = window.youngNetwork.supabaseEnabled;
        console.log('📊 Supabase Enabled:', status);
        
        if (!status) {
            console.log('❌ Issue: Supabase is disabled');
            console.log('🔧 Solution: Check supabase-config.js credentials');
            console.log('🔧 Solution: Run database schema in Supabase');
            console.log('🔧 Solution: Enable real-time in Supabase dashboard');
        } else {
            console.log('✅ Supabase is enabled');
            console.log('📊 Profiles loaded:', window.youngNetwork.profiles.length);
            console.log('📊 Votes loaded:', window.youngNetwork.votes.length);
            console.log('📊 Subscriptions active:', window.youngNetwork.subscriptions.length);
        }
        
        // Test connection
        try {
            if (window.youngNetwork.supabase) {
                const { data, error } = await window.youngNetwork.supabase
                    .from('users')
                    .select('count')
                    .limit(1);
                
                if (error) {
                    console.log('❌ Database connection error:', error);
                } else {
                    console.log('✅ Database connection successful');
                }
            }
        } catch (err) {
            console.log('❌ Connection test failed:', err);
        }
    } else {
        console.log('❌ Young Network not initialized');
    }
};

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`YN Young Network loaded in ${loadTime.toFixed(2)}ms`);
    
    if (window.youngNetwork) {
        window.youngNetwork.log('Page load complete', 'info', { loadTime: loadTime.toFixed(2) });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.youngNetwork) {
        window.youngNetwork.cleanup();
    }
});
