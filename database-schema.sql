-- Young Network Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  university VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  image_url TEXT,
  linkedin_url TEXT,
  industry VARCHAR(100),
  achievements TEXT[] DEFAULT '{}',
  elo INTEGER DEFAULT 1200,
  wins INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  winner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  loser_id UUID REFERENCES users(id) ON DELETE CASCADE,
  winner_elo_before INTEGER NOT NULL,
  loser_elo_before INTEGER NOT NULL,
  winner_elo_after INTEGER NOT NULL,
  loser_elo_after INTEGER NOT NULL,
  elo_change INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statistics table
CREATE TABLE statistics (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
  total_votes INTEGER DEFAULT 0,
  total_comparisons INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial statistics record
INSERT INTO statistics (id, total_votes, total_comparisons, total_users) 
VALUES ('global', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can be created by anyone" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can be updated by anyone" ON users
  FOR UPDATE USING (true);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Votes can be created by anyone" ON votes
  FOR INSERT WITH CHECK (true);

-- Statistics policies
CREATE POLICY "Statistics are viewable by everyone" ON statistics
  FOR SELECT USING (true);

CREATE POLICY "Statistics can be updated by anyone" ON statistics
  FOR UPDATE USING (true);

-- Functions and Triggers

-- Function to update user statistics when votes are created
CREATE OR REPLACE FUNCTION update_user_stats_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Update winner stats
  UPDATE users 
  SET 
    wins = wins + 1,
    total_votes = total_votes + 1,
    elo = NEW.winner_elo_after,
    updated_at = NOW()
  WHERE id = NEW.winner_id;
  
  -- Update loser stats
  UPDATE users 
  SET 
    total_votes = total_votes + 1,
    elo = NEW.loser_elo_after,
    updated_at = NOW()
  WHERE id = NEW.loser_id;
  
  -- Update global statistics
  UPDATE statistics 
  SET 
    total_votes = total_votes + 1,
    total_comparisons = total_comparisons + 1,
    updated_at = NOW()
  WHERE id = 'global';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats when a vote is created
CREATE TRIGGER trigger_update_user_stats_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_vote();

-- Function to update total users count
CREATE OR REPLACE FUNCTION update_total_users_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE statistics 
    SET total_users = total_users + 1, updated_at = NOW()
    WHERE id = 'global';
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE statistics 
    SET total_users = total_users - 1, updated_at = NOW()
    WHERE id = 'global';
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total users count
CREATE TRIGGER trigger_update_total_users_count
  AFTER INSERT OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_total_users_count();

-- Indexes for better performance
CREATE INDEX idx_users_elo ON users(elo DESC);
CREATE INDEX idx_users_industry ON users(industry);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);
CREATE INDEX idx_votes_winner_id ON votes(winner_id);
CREATE INDEX idx_votes_loser_id ON votes(loser_id);

-- Views for common queries

-- Leaderboard view
CREATE VIEW leaderboard AS
SELECT 
  id,
  name,
  title,
  university,
  company,
  industry,
  elo,
  wins,
  total_votes,
  CASE 
    WHEN total_votes > 0 THEN ROUND((wins::DECIMAL / total_votes) * 100, 2)
    ELSE 0 
  END as win_percentage
FROM users
ORDER BY elo DESC, wins DESC;

-- Recent votes view
CREATE VIEW recent_votes AS
SELECT 
  v.id,
  v.created_at,
  winner.name as winner_name,
  loser.name as loser_name,
  v.winner_elo_before,
  v.winner_elo_after,
  v.loser_elo_before,
  v.loser_elo_after,
  v.elo_change
FROM votes v
JOIN users winner ON v.winner_id = winner.id
JOIN users loser ON v.loser_id = loser.id
ORDER BY v.created_at DESC;

-- Sample data for testing (optional)
INSERT INTO users (name, title, university, company, image_url, linkedin_url, industry, achievements, elo) VALUES
('Sarah Chen', 'Senior Software Engineer', 'Stanford University', 'Google', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/sarah-chen-google', 'technology', ARRAY['Google Software Engineering Internship', 'Stanford Computer Science Degree', 'Microsoft MVP Award', 'AWS Solutions Architect Certification', 'Open Source Contributor (500+ stars)'], 1200),
('Marcus Rodriguez', 'Product Manager', 'Harvard University', 'Netflix', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/marcus-rodriguez-netflix', 'business', ARRAY['Netflix Product Management Internship', 'Harvard Business School MBA', 'Forbes 30 Under 30', 'Product Hunt Maker of the Year', 'Led $50M revenue growth project'], 1200),
('Emily Watson', 'Data Scientist', 'MIT', 'Meta', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/emily-watson-meta', 'technology', ARRAY['Meta Data Science Internship', 'MIT Statistics PhD', 'Kaggle Grandmaster', 'Published 15+ research papers', 'TEDx Speaker on AI Ethics'], 1200),
('David Kim', 'Investment Banker', 'University of Pennsylvania (Wharton)', 'Goldman Sachs', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/david-kim-goldman', 'finance', ARRAY['Goldman Sachs Summer Analyst', 'Wharton Finance Degree', 'CFA Charterholder', 'Closed $2B M&A deal', 'Youngest VP in department history'], 1200),
('Alex Johnson', 'Creative Director', 'Parsons School of Design', 'Apple', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/alex-johnson-apple', 'creative', ARRAY['Apple Design Internship', 'Parsons School of Design', 'Cannes Lions Grand Prix', 'Designed iPhone 15 interface', '100+ million users worldwide'], 1200),
('Priya Patel', 'Medical Director', 'Johns Hopkins University', 'Mayo Clinic', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/priya-patel-mayo', 'healthcare', ARRAY['Mayo Clinic Residency', 'Johns Hopkins Medical School', 'Board Certified in 3 specialties', 'Published 50+ medical papers', 'Led breakthrough cancer research'], 1200);
