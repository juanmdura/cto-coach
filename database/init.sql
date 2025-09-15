-- CTO Coach Database Schema
-- This file initializes the database with the basic schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source_url VARCHAR(500),
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB, -- Array of document IDs that were referenced
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_content ON documents USING gin(to_tsvector('english', content));

-- Insert sample data for testing
INSERT INTO documents (title, content, file_type) VALUES 
('Software Architecture Principles', 'SOLID principles are fundamental to good software design. Single Responsibility Principle states that a class should have only one reason to change.', 'text'),
('Microservices Best Practices', 'When designing microservices, consider service boundaries, data consistency, and communication patterns. Each service should own its data.', 'text'),
('Engineering Leadership Guide', 'Effective engineering leaders focus on people, process, and technology. Building trust and clear communication are essential.', 'text');
