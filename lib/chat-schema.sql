-- Add these tables to your existing database

-- Chat rooms (project-based or direct messages)
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50) DEFAULT 'project', -- 'project', 'direct', 'general'
    project_id INTEGER REFERENCES projects(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat room participants
CREATE TABLE chat_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- Messages
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'system', 'image'
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(100),
    reply_to INTEGER REFERENCES chat_messages(id),
    mentions TEXT[], -- Array of mentioned usernames
    reactions JSONB DEFAULT '[]', -- JSON array of reactions
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User online status
CREATE TABLE user_status (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_room_id INTEGER REFERENCES chat_rooms(id)
);

-- Indexes for performance
CREATE INDEX idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_user_status_online ON user_status(is_online);

-- Typing indicators
CREATE TABLE chat_typing (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- Message read status
CREATE TABLE chat_read_status (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- File uploads tracking
CREATE TABLE chat_files (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for enhanced features
CREATE INDEX idx_chat_messages_content_search ON chat_messages USING gin(to_tsvector('english', content));
CREATE INDEX idx_chat_messages_mentions ON chat_messages USING gin(mentions);
CREATE INDEX idx_chat_messages_reactions ON chat_messages USING gin(reactions);
CREATE INDEX idx_chat_typing_room_user ON chat_typing(room_id, user_id);
CREATE INDEX idx_chat_read_status_message ON chat_read_status(message_id);
CREATE INDEX idx_chat_read_status_user ON chat_read_status(user_id);
CREATE INDEX idx_chat_files_message ON chat_files(message_id);

-- Insert default general chat room
INSERT INTO chat_rooms (name, type, created_at)
VALUES ('General Chat', 'general', CURRENT_TIMESTAMP);
