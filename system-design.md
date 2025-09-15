# CTO Coach - System Design Documentation

## Overview
CTO Coach is an AI-powered coaching platform that provides engineering leadership guidance through a conversational interface. The system uses uploaded engineering documents as a knowledge base to provide contextually relevant responses.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CTO Coach System                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│                 │◄──────────────────►│                 │
│   Frontend      │                    │   Backend       │
│   (React)       │    WebSocket       │   (Node.js)     │
│                 │◄──────────────────►│                 │
└─────────────────┘                    └─────────────────┘
│                                                │
│ Components:                                    │ Components:
│ • Chat Interface                               │ • Express Server
│ • Document Upload                              │ • REST API Routes
│ • Message History                              │ • Chat Service
│ • Loading States                               │ • Document Service
│                                                │ • Gemini Integration
│                                                │
│                                                ▼
│                                      ┌─────────────────┐
│                                      │   External      │
│                                      │   Services      │
│                                      │                 │
│                                      │ • Gemini API    │
│                                      │ • File Storage  │
│                                      └─────────────────┘
│                                                │
│                                                ▼
└──────────────────────────────────────┌─────────────────┐
                                       │   Database      │
                                       │  (PostgreSQL)   │
                                       │                 │
                                       │ • Documents     │
                                       │ • Chat Sessions │
                                       │ • Messages      │
                                       │ • Metadata      │
                                       └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Query + useState
- **HTTP Client**: Axios
- **Routing**: React Router (future)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database ORM**: Prisma
- **Authentication**: JWT (future)
- **File Upload**: Multer
- **Validation**: Zod

### Database
- **Primary DB**: PostgreSQL 15+
- **Extensions**: None initially (pgvector for future)
- **Hosting**: Railway/Supabase (production)

### External Services
- **AI Provider**: Google Gemini API
- **File Storage**: Local filesystem (S3 for future)
- **Deployment**: Vercel (frontend) + Railway (backend)

## Data Models

### Database Schema

```sql
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

## API Design

### REST Endpoints

#### Chat API
```typescript
// Send a message
POST /api/chat/message
Content-Type: application/json

Request:
{
  "message": "How should I structure a microservices architecture?",
  "sessionId": "uuid-string"
}

Response:
{
  "response": "Based on the uploaded documents...",
  "sources": [
    {
      "id": 1,
      "title": "Microservices Best Practices",
      "relevantContent": "excerpt..."
    }
  ],
  "sessionId": "uuid-string",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

#### Documents API
```typescript
// Upload document
POST /api/documents/upload
Content-Type: multipart/form-data

Request:
FormData with file and metadata

Response:
{
  "id": 1,
  "title": "Document Title",
  "status": "uploaded",
  "message": "Document processed successfully"
}

// Get all documents
GET /api/documents

Response:
{
  "documents": [
    {
      "id": 1,
      "title": "Document Title",
      "file_type": "pdf",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

## Core Services

### Chat Service
```typescript
class ChatService {
  async processMessage(message: string, sessionId: string) {
    // 1. Search for relevant documents
    const relevantDocs = await this.searchDocuments(message);
    
    // 2. Build context for AI
    const context = this.buildContext(message, relevantDocs);
    
    // 3. Get AI response
    const response = await this.geminiService.generateResponse(context);
    
    // 4. Save conversation
    await this.saveMessage(sessionId, 'user', message);
    await this.saveMessage(sessionId, 'assistant', response, relevantDocs);
    
    return { response, sources: relevantDocs };
  }
}
```

### Document Service
```typescript
class DocumentService {
  async uploadDocument(file: File, metadata: DocumentMetadata) {
    // 1. Validate file type and size
    this.validateFile(file);
    
    // 2. Extract text content
    const content = await this.extractContent(file);
    
    // 3. Store in database
    const document = await this.saveDocument({
      title: metadata.title || file.name,
      content,
      file_type: file.mimetype,
      file_path: filePath
    });
    
    return document;
  }
}
```

### Gemini Integration Service
```typescript
class GeminiService {
  async generateResponse(context: string): Promise<string> {
    const response = await this.client.generateContent({
      model: 'gemini-pro',
      prompt: this.buildPrompt(context),
      maxTokens: 1000,
      temperature: 0.7
    });
    
    return response.text;
  }
  
  private buildPrompt(context: string): string {
    return `
You are an expert CTO coach providing guidance on engineering leadership, 
software architecture, and technology strategy.

Context from knowledge base:
${context}

Provide helpful, practical advice as a CTO would. Reference the provided 
context when relevant and cite sources.
    `;
  }
}
```

## Data Flow

### Chat Message Flow
1. User types message in React chat interface
2. Frontend sends POST request to `/api/chat/message`
3. Backend ChatService processes the message:
   - Searches documents for relevant content using SQL LIKE queries
   - Builds context string with relevant document excerpts
   - Calls Gemini API with context and user message
   - Saves user message and AI response to database
4. Backend returns AI response with source citations
5. Frontend displays response in chat interface

### Document Upload Flow
1. User selects file in React upload component
2. Frontend sends multipart form data to `/api/documents/upload`
3. Backend DocumentService processes the file:
   - Validates file type and size
   - Extracts text content (PDF, TXT, MD support)
   - Saves document content to database
   - Stores file metadata
4. Backend returns success response
5. Frontend updates document list

## Security Considerations

### Current (MVP)
- Input validation on all API endpoints
- File type restrictions for uploads
- SQL injection prevention with Prisma ORM
- CORS configuration for frontend domain

### Future Enhancements
- JWT-based authentication
- Rate limiting on API endpoints
- File scanning for malware
- User authorization and roles
- API key management
- Request/response logging

## Performance Considerations

### Current Optimizations
- Database indexing on frequently queried columns
- Efficient text search using PostgreSQL LIKE queries
- Connection pooling with Prisma
- Frontend code splitting with Vite

### Future Optimizations
- Vector embeddings for semantic search
- Redis caching for frequent queries
- CDN for static assets
- Database query optimization
- Response compression

## Deployment Architecture

### Development
```
Local Machine:
├── Frontend (React) - http://localhost:5173
├── Backend (Node.js) - http://localhost:3000
└── Database (PostgreSQL) - localhost:5432
```

### Production
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Railway       │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Static Assets │    │ • API Server    │    │ • Data Storage  │
│ • React App     │    │ • File Storage  │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Monitoring and Observability

### Current (Basic)
- Console logging for errors and important events
- Basic error handling with try-catch blocks
- HTTP status codes for API responses

### Future Enhancements
- Structured logging with Winston
- Error tracking with Sentry
- Performance monitoring
- Database query monitoring
- User analytics
- Health check endpoints

## Scalability Considerations

### Current Limitations
- Single server instance
- Local file storage
- Simple text search
- No caching layer

### Future Scaling Strategy
- Horizontal scaling with load balancers
- Microservices architecture
- Vector database for semantic search
- CDN for file storage
- Redis for session management
- Queue system for background processing

## Development Workflow

### Local Development
1. Clone repository
2. Run `docker-compose up` for database
3. Install dependencies: `npm install`
4. Run migrations: `npx prisma migrate dev`
5. Start backend: `npm run dev`
6. Start frontend: `npm run dev`

### Code Quality
- ESLint with Airbnb configuration
- Prettier for code formatting
- TypeScript for type safety
- Pre-commit hooks with Husky
- Automated testing with Jest

### Git Workflow
- Feature branches from main
- Conventional commit messages
- Pull request reviews
- Automated CI/CD with GitHub Actions
