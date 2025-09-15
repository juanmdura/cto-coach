# CTO Coach

**An AI-powered coaching platform that provides engineering leadership guidance through a conversational interface.**

CTO Coach helps engineering leaders get expert advice by leveraging a knowledge base of engineering documents and best practices, powered by Google's Gemini AI.

## 🎯 What It Does

- **Conversational AI Coach**: Chat with an AI that provides CTO-level guidance on engineering leadership, software architecture, and technology strategy
- **Knowledge-Driven Responses**: Upload your engineering documents (PDFs, markdown, text files) and the AI will reference them in responses
- **Source Citations**: Every AI response includes citations from your uploaded documents for transparency and verification
- **Session Management**: Maintains conversation context across chat sessions

## 🏗️ Architecture

```
React Frontend ↔ Node.js Backend ↔ Gemini AI
                        ↓
                  PostgreSQL Database
```

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM  
- **Database**: PostgreSQL
- **AI**: Google Gemini API
- **Deployment**: Vercel (frontend) + Railway (backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for local database)
- Google Gemini API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cto-coach
   ```

2. **Set up the database**
   ```bash
   docker-compose up -d postgres
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend  
   cd ../frontend && npm install
   ```

4. **Configure environment**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   
   # Add your Gemini API key to backend/.env
   GEMINI_API_KEY=your_api_key_here
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

6. **Start the development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend && npm run dev
   
   # Frontend (Terminal 2) 
   cd frontend && npm run dev
   ```

7. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📁 Project Structure

```
cto-coach/
├── .cursorrules          # Coding standards and practices
├── TODO.md              # Development tasks and progress
├── SYSTEM-DESIGN.md     # Technical documentation
├── readme.md            # This file
├── backend/             # Node.js API server
├── frontend/            # React application
└── docker-compose.yml   # Local development setup
```

## 📋 Development Status

**Current Phase**: Foundation & Setup

See [`TODO.md`](./TODO.md) for detailed task breakdown and progress tracking.

**MVP Timeline**: 4 weeks
- Week 1: Foundation & Setup ⏳
- Week 2: AI Integration  
- Week 3: Knowledge Base Integration
- Week 4: Polish & Deploy

## 📖 Documentation

- **[TODO.md](./TODO.md)** - Development tasks and progress tracking
- **[SYSTEM-DESIGN.md](./SYSTEM-DESIGN.md)** - Complete technical documentation including:
  - System architecture diagrams
  - Database schema
  - API specifications
  - Data flow explanations
  - Security considerations
  - Deployment strategy

## 🛠️ Code Quality

This project follows strict coding standards defined in [`.cursorrules`](./.cursorrules):

- **Commits**: Conventional Commits format
- **Versioning**: Semantic Versioning (SemVer)  
- **Code Style**: Airbnb JavaScript/TypeScript standards
- **Reviews**: Google Code Review practices
- **Testing**: Jest with 80%+ coverage requirement

## 🔮 Future Enhancements

After MVP completion, planned enhancements include:
- Vector embeddings for semantic search
- Real-time websockets for live chat
- Admin dashboard for content management
- User authentication and roles
- Web scraping ETL for automated content ingestion
- Redis caching for performance

## 🤝 Contributing

1. Follow the coding standards in `.cursorrules`
2. Check `TODO.md` for available tasks
3. Reference `SYSTEM-DESIGN.md` for technical details
4. Use conventional commit messages
5. Ensure tests pass before submitting PRs

## 📄 License

MIT License - see LICENSE file for details.
