import { PrismaClient } from '@prisma/client';
import { GeminiService } from './GeminiService';
import { DocumentService } from './DocumentService';

const prisma = new PrismaClient();

export interface ChatResponse {
  content: string;
  sources: Array<{
    id: number;
    title: string;
    relevantContent: string;
  }>;
}

export class ChatService {
  private geminiService: GeminiService;
  private documentService: DocumentService;

  constructor() {
    this.geminiService = new GeminiService();
    this.documentService = new DocumentService();
  }

  async processMessage(message: string, sessionId: string): Promise<ChatResponse> {
    try {
      // 1. Search for relevant documents
      const relevantDocs = await this.documentService.searchDocuments(message);

      // 2. Build context for AI
      const context = this.buildContext(message, relevantDocs);

      // 3. Get AI response
      const aiResponse = await this.geminiService.generateResponse(context);

      // 4. Save conversation
      await this.saveMessage(sessionId, 'user', message);
      await this.saveMessage(sessionId, 'assistant', aiResponse, relevantDocs.map(doc => doc.id));

      // 5. Format response with sources
      const sources = relevantDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        relevantContent: doc.content.substring(0, 200) + '...',
      }));

      return {
        content: aiResponse,
        sources,
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  private buildContext(message: string, documents: Array<{ title: string; content: string }>): string {
    if (documents.length === 0) {
      return `
You are an expert CTO coach providing guidance on engineering leadership, 
software architecture, and technology strategy.

User question: ${message}

Provide helpful, practical advice as a CTO would.
      `;
    }

    const knowledgeContext = documents
      .map(doc => `Title: ${doc.title}\nContent: ${doc.content.substring(0, 500)}...`)
      .join('\n\n');

    return `
You are an expert CTO coach providing guidance on engineering leadership, 
software architecture, and technology strategy.

Context from knowledge base:
${knowledgeContext}

User question: ${message}

Provide helpful, practical advice as a CTO would. Reference the provided 
context when relevant and cite the document titles in your response.
    `;
  }

  private async saveMessage(
    sessionId: string, 
    role: 'user' | 'assistant', 
    content: string, 
    sources?: number[]
  ): Promise<void> {
    await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
        sources: sources ? sources : undefined,
      },
    });
  }
}
