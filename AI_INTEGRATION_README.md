# AI Integration - CTO Coach

## ✅ Completed Features

### Backend AI Integration
- ✅ **Gemini API Integration**: Configured Google Gemini Pro model for AI responses
- ✅ **Chat API Endpoints**: Implemented POST `/api/chat/message`, GET `/api/chat/history/:sessionId`, POST `/api/chat/session`
- ✅ **Document Search**: Basic text search in documents using PostgreSQL LIKE queries
- ✅ **Context Building**: AI responses enhanced with relevant document context
- ✅ **Error Handling**: Comprehensive error handling for API failures and edge cases

### Frontend Chat Interface
- ✅ **Chat Interface**: Complete chat UI with message history and real-time responses
- ✅ **Document Upload**: Drag-and-drop interface for uploading .txt, .md, and .pdf files
- ✅ **Document Management**: List and delete uploaded documents
- ✅ **Source Citations**: AI responses show which documents were referenced
- ✅ **Error Boundaries**: Graceful error handling with user-friendly messages
- ✅ **Loading States**: Visual feedback during AI processing and file uploads

## 🚀 How to Test the AI Integration

### 1. Start the Application

```bash
# Start the database
npm run dev:db

# Add sample documents (optional but recommended)
npm run seed:docs

# Start the full application
npm run dev
```

### 2. Test Basic AI Chat

1. Open http://localhost:5173
2. The chat interface will automatically create a session
3. Try these sample questions:
   - "What are the SOLID principles?"
   - "How should I structure my engineering team?"
   - "What are microservices best practices?"
   - "How do I implement effective code reviews?"

### 3. Test Document Integration

1. **Upload Documents**:
   - Click "Upload" in the Knowledge Base sidebar
   - Upload the sample documents from `sample-docs/` folder
   - Or drag and drop your own engineering documents

2. **Test Context-Aware Responses**:
   - Ask: "What does the uploaded document say about SOLID principles?"
   - Ask: "How should I implement code reviews according to the best practices?"
   - Notice how the AI references specific documents in its responses

### 4. Test Error Scenarios

1. **API Errors**: Stop the backend and try sending a message
2. **Invalid Files**: Try uploading unsupported file types
3. **Large Files**: Try uploading files > 10MB
4. **Network Issues**: Test with poor connectivity

## 📋 Sample Test Scenarios

### Scenario 1: Engineering Leadership Advice
```
User: "I'm a new CTO. How should I approach building my engineering team?"

Expected: AI provides comprehensive advice, potentially referencing the 
Engineering Leadership Guide document if uploaded.
```

### Scenario 2: Technical Architecture Questions
```
User: "Explain the Single Responsibility Principle with examples"

Expected: AI explains SRP, potentially with examples from the Software 
Architecture Principles document.
```

### Scenario 3: Process Implementation
```
User: "What should I include in a code review checklist?"

Expected: AI provides detailed checklist, potentially referencing the 
Code Review Best Practices document.
```

## 🔧 Configuration

### Environment Variables Required

```bash
# .env file in project root
GEMINI_API_KEY=your_actual_gemini_api_key
DATABASE_URL="postgresql://postgres:password@localhost:5433/cto_coach"
```

### API Endpoints

- **POST** `/api/chat/session` - Create new chat session
- **POST** `/api/chat/message` - Send message and get AI response
- **GET** `/api/chat/history/:sessionId` - Get chat history
- **POST** `/api/documents/upload` - Upload document
- **GET** `/api/documents` - List documents
- **DELETE** `/api/documents/:id` - Delete document

## 🐛 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY environment variable is required"**
   - Ensure you have a valid Gemini API key in the .env file
   - Get one from: https://makersuite.google.com/app/apikey

2. **Database connection errors**
   - Ensure PostgreSQL container is running: `npm run dev:db`
   - Check if local PostgreSQL conflicts with Docker

3. **Module import errors**
   - Clear Vite cache: `rm -rf frontend/node_modules/.vite`
   - Restart the frontend dev server

4. **File upload failures**
   - Check file type (only .txt, .md, .pdf supported)
   - Check file size (max 10MB)
   - Ensure backend is running

### Development Tips

1. **Check AI Responses**: Monitor backend logs to see the context being sent to Gemini
2. **Database Inspection**: Use `npm run db:studio` to view database contents
3. **Network Debugging**: Use browser DevTools to inspect API calls

## 📊 Performance Notes

- **Document Search**: Currently uses simple LIKE queries; can be improved with full-text search
- **AI Context**: Limited to top 5 documents and 500 characters per document
- **Caching**: No caching implemented yet; each request hits the Gemini API
- **Rate Limiting**: No rate limiting implemented; be mindful of API quotas

## 🔄 Next Steps (Phase 3: Knowledge Base Integration)

- [ ] Improve document search with full-text search or vector embeddings
- [ ] Add document chunking for better context extraction
- [ ] Implement caching for frequently asked questions
- [ ] Add more document formats (Word, PowerPoint)
- [ ] Enhance source citations with page numbers and exact quotes
