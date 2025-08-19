// YN Young Network Application - Professional Achievement Comparison
// ELO system with localStorage fallback

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
        
        this.init();
    }

    // Initialize the application
    init() {
        this.loadData();
        this.setupEventListeners();
        this.loadMockData();
        this.startNewComparison();
        this.updateStats();
        this.log('YN Young Network initialized successfully', 'info');
    }

    // Automatic feedback loop for debugging
    log(message, level = 'info', data = null) {
        if (!this.debugMode) return;
        
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
        
        // Store logs in localStorage for debugging
        const logs = JSON.parse(localStorage.getItem('ynYoungNetwork_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('ynYoungNetwork_logs', JSON.stringify(logs));
        
        // Auto-detect and report errors
        if (level === 'error') {
            this.reportError(logEntry);
        }
    }

    // Report errors automatically
    reportError(errorLog) {
        console.error('Error detected:', errorLog);
        
        // Store error for debugging
        const errors = JSON.parse(localStorage.getItem('ynYoungNetwork_errors') || '[]');
        errors.push(errorLog);
        localStorage.setItem('ynYoungNetwork_errors', JSON.stringify(errors));
    }

    // Load data from localStorage
    loadData() {
        try {
            this.profiles = JSON.parse(localStorage.getItem('ynYoungNetwork_profiles') || '[]');
            this.votes = JSON.parse(localStorage.getItem('ynYoungNetwork_votes') || '[]');
            this.stats = JSON.parse(localStorage.getItem('ynYoungNetwork_stats') || JSON.stringify(this.stats));
            this.log('Data loaded from localStorage', 'info', { profiles: this.profiles.length, votes: this.votes.length });
        } catch (error) {
            this.log('Error loading data from localStorage', 'error', error);
            this.profiles = [];
            this.votes = [];
        }
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem('ynYoungNetwork_profiles', JSON.stringify(this.profiles));
            localStorage.setItem('ynYoungNetwork_votes', JSON.stringify(this.votes));
            localStorage.setItem('ynYoungNetwork_stats', JSON.stringify(this.stats));
            this.log('Data saved to localStorage', 'info');
        } catch (error) {
            this.log('Error saving data to localStorage', 'error', error);
        }
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

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Vote buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleVote(e.target.dataset.candidate);
            });
        });

        // Add profile form
        document.getElementById('add-profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewProfile();
        });

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        // Error handling
        window.addEventListener('error', (e) => {
            this.log('Global error caught', 'error', { error: e.error, filename: e.filename, lineno: e.lineno });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.log('Unhandled promise rejection', 'error', { reason: e.reason });
        });

        this.log('Event listeners setup complete', 'info');
    }

    // Switch between views
    switchView(viewName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        // Load specific view data
        if (viewName === 'leaderboard') {
            this.updateLeaderboard();
        }

        this.log('View switched', 'info', { view: viewName });
    }

    // Start a new comparison
    async startNewComparison() {
        if (this.profiles.length < 2) {
            this.log('Not enough profiles for comparison', 'warning');
            return;
        }

        // Get two random profiles
        const shuffled = [...this.profiles].sort(() => 0.5 - Math.random());
        this.currentComparison = {
            left: shuffled[0],
            right: shuffled[1],
            timestamp: Date.now()
        };

        this.updateComparisonDisplay();
        this.log('New comparison started', 'info', { 
            left: this.currentComparison.left.name, 
            right: this.currentComparison.right.name 
        });
    }

    // Update the comparison display
    updateComparisonDisplay() {
        if (!this.currentComparison) return;

        const { left, right } = this.currentComparison;

        // Update left candidate
        this.updateCandidateDisplay('left', left);
        
        // Update right candidate
        this.updateCandidateDisplay('right', right);
    }

    // Update individual candidate display
    updateCandidateDisplay(side, candidate) {
        const imageElement = document.getElementById(`${side}-image`);
        const nameElement = document.getElementById(`${side}-name`);
        const titleElement = document.getElementById(`${side}-title`);
        const universityElement = document.getElementById(`${side}-university`);
        const companyElement = document.getElementById(`${side}-company`);
        const eloElement = document.getElementById(`${side}-elo`);
        const linkedinElement = document.getElementById(`${side}-linkedin`);
        const achievementsElement = document.getElementById(`${side}-achievements`);

        // Update image
        if (candidate.imageUrl) {
            imageElement.src = candidate.imageUrl;
            imageElement.style.display = 'block';
            imageElement.parentElement.querySelector('.image-placeholder').style.display = 'none';
        } else {
            imageElement.style.display = 'none';
            imageElement.parentElement.querySelector('.image-placeholder').style.display = 'flex';
        }

        // Update text content
        nameElement.textContent = candidate.name;
        titleElement.textContent = candidate.title;
        universityElement.textContent = candidate.university || 'University not specified';
        companyElement.textContent = candidate.company;
        eloElement.textContent = candidate.elo || 1200;

        // Update LinkedIn link
        if (candidate.linkedinUrl) {
            const linkedinBtn = linkedinElement.querySelector('.linkedin-btn');
            linkedinBtn.href = candidate.linkedinUrl;
            linkedinElement.style.display = 'block';
        } else {
            linkedinElement.style.display = 'none';
        }

        // Update achievements
        achievementsElement.innerHTML = '';
        candidate.achievements.forEach(achievement => {
            const li = document.createElement('li');
            li.textContent = achievement;
            achievementsElement.appendChild(li);
        });
    }

    // Handle voting
    async handleVote(winnerSide) {
        if (!this.currentComparison) return;

        const winner = this.currentComparison[winnerSide];
        const loser = this.currentComparison[winnerSide === 'left' ? 'right' : 'left'];

        // Record vote
        const vote = {
            winner_id: winner.id,
            loser_id: loser.id,
            winner_elo_before: winner.elo,
            loser_elo_before: loser.elo,
            winner_elo_after: winner.elo + this.eloChange,
            loser_elo_after: Math.max(0, loser.elo - this.eloChange),
            elo_change: this.eloChange
        };

        try {
            // Create vote in database
            // This part is now a placeholder for localStorage
            this.votes.push(vote);
            this.saveData(); // Save updated votes

            // Update local data
            winner.wins++;
            winner.totalVotes++;
            winner.elo += this.eloChange;
            
            loser.totalVotes++;
            loser.elo = Math.max(0, loser.elo - this.eloChange);

            // Update stats
            this.stats.totalVotes++;
            this.stats.comparisonsMade++;
            this.saveData(); // Save updated stats

            // Show success modal
            this.showModal();

            // Log vote
            this.log('Vote recorded', 'info', vote);

            // Start new comparison after delay
            setTimeout(() => {
                this.hideModal();
                this.startNewComparison();
                this.updateStats();
            }, 2000);

        } catch (error) {
            this.log('Error recording vote', 'error', error);
            alert('Error recording vote. Please try again.');
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
        document.getElementById('success-modal').style.display = 'block';
    }

    // Hide modal
    hideModal() {
        document.getElementById('success-modal').style.display = 'none';
    }

    // Update stats display
    updateStats() {
        document.getElementById('total-votes').textContent = this.stats.totalVotes || 0;
        document.getElementById('comparisons-made').textContent = this.stats.comparisonsMade || 0;
        document.getElementById('total-users').textContent = this.profiles.length;
    }

    // Update stats display (for real-time updates)
    updateStatsDisplay() {
        this.updateStats();
    }

    // Update leaderboard
    updateLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';

        // Sort profiles by ELO rating
        const sortedProfiles = [...this.profiles].sort((a, b) => b.elo - a.elo);

        sortedProfiles.forEach((profile, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">${profile.name}</span>
                <span class="score">${profile.elo}</span>
                <span class="wins">${profile.wins}</span>
                <span class="total-votes">${profile.totalVotes}</span>
            `;
            leaderboardList.appendChild(item);
        });

        this.log('Leaderboard updated', 'info', { profilesCount: sortedProfiles.length });
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
            this.profiles.push(newProfile);
            this.saveData(); // Save updated profiles
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

    // Cleanup subscriptions
    cleanup() {
        // No subscriptions to unsubscribe in localStorage fallback
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.youngNetwork = new YoungNetwork();
    
    // Add debug commands to console
    console.log('YN Young Network loaded! Debug commands available:');
    console.log('- window.youngNetwork.getDebugInfo() - Get debug information');
    console.log('- window.youngNetwork.exportData() - Export debug data');
    console.log('- window.youngNetwork.log("message", "level") - Add custom log');
});

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
