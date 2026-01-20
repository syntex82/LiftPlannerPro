-- PostgreSQL Database Setup for Lift Planner Pro
-- Run this script after installing PostgreSQL

-- Create the database
CREATE DATABASE liftplannerpro_dev;

-- Create a dedicated user for the application (optional but recommended)
CREATE USER liftplanner WITH PASSWORD 'syntex82';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE liftplannerpro_dev TO liftplanner;

-- Connect to the new database and grant schema privileges
\c liftplannerpro_dev;
GRANT ALL ON SCHEMA public TO liftplanner;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO liftplanner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO liftplanner;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO liftplanner;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO liftplanner;

-- Display success message
SELECT 'Database setup complete! You can now use the application.' AS status;
