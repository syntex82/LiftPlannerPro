-- Lift Planner Pro - Initial Database Schema
-- Creates tables for users, scenarios, attempts, and progress tracking

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'trainee', -- 'trainee', 'trainer', 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training Scenarios table
CREATE TABLE IF NOT EXISTS training_scenarios (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  category VARCHAR(100),
  estimated_time_minutes INTEGER,
  learning_objectives TEXT,
  site_width DECIMAL(10, 2),
  site_length DECIMAL(10, 2),
  load_weight DECIMAL(10, 2),
  load_width DECIMAL(10, 2),
  load_length DECIMAL(10, 2),
  load_height DECIMAL(10, 2),
  load_fragile BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenario Obstructions table
CREATE TABLE IF NOT EXISTS scenario_obstructions (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER NOT NULL REFERENCES training_scenarios(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'building', 'tree', 'power_line', 'fence', 'vehicle'
  x DECIMAL(10, 2),
  y DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  hazard_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ground Conditions table
CREATE TABLE IF NOT EXISTS ground_conditions (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER NOT NULL REFERENCES training_scenarios(id) ON DELETE CASCADE,
  x DECIMAL(10, 2),
  y DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  type VARCHAR(50), -- 'hard', 'soft', 'sloped', 'water'
  bearing_capacity DECIMAL(10, 2),
  risk_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scenario Attempts table
CREATE TABLE IF NOT EXISTS scenario_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id INTEGER NOT NULL REFERENCES training_scenarios(id) ON DELETE CASCADE,
  selected_crane_id INTEGER,
  crane_x DECIMAL(10, 2),
  crane_y DECIMAL(10, 2),
  capacity_checked BOOLEAN DEFAULT FALSE,
  radius_verified BOOLEAN DEFAULT FALSE,
  ground_bearing_checked BOOLEAN DEFAULT FALSE,
  obstacles_reviewed BOOLEAN DEFAULT FALSE,
  outriggers_checked BOOLEAN DEFAULT FALSE,
  score INTEGER,
  passed BOOLEAN,
  total_time_seconds INTEGER,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Results table
CREATE TABLE IF NOT EXISTS verification_results (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES scenario_attempts(id) ON DELETE CASCADE,
  check_type VARCHAR(50), -- 'capacity', 'radius', 'ground_bearing', 'obstacle', 'outrigger'
  passed BOOLEAN,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk Assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES scenario_attempts(id) ON DELETE CASCADE,
  hazard_count INTEGER,
  critical_hazards INTEGER,
  risk_level VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
  safe_to_proceed BOOLEAN,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Scores table
CREATE TABLE IF NOT EXISTS performance_scores (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES scenario_attempts(id) ON DELETE CASCADE,
  category VARCHAR(100), -- 'equipment_selection', 'positioning', 'hazard_identification', etc.
  score INTEGER,
  max_score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_scenarios_difficulty ON training_scenarios(difficulty);
CREATE INDEX idx_scenarios_category ON training_scenarios(category);
CREATE INDEX idx_attempts_user_id ON scenario_attempts(user_id);
CREATE INDEX idx_attempts_scenario_id ON scenario_attempts(scenario_id);
CREATE INDEX idx_attempts_completed ON scenario_attempts(completed_at);
CREATE INDEX idx_obstructions_scenario ON scenario_obstructions(scenario_id);
CREATE INDEX idx_ground_scenario ON ground_conditions(scenario_id);

