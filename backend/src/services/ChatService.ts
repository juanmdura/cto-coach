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
    category?: string;
    tags?: string[];
    summary?: string;
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
      // 1. Search for relevant documents with improved search
      const relevantDocs = await this.documentService.searchDocuments(message, 5);

      // 2. Build enhanced context for AI
      const context = this.buildEnhancedContext(message, relevantDocs);

      // 3. Get AI response
      const aiResponse = await this.geminiService.generateResponse(context);

      // 4. Save conversation
      await this.saveMessage(sessionId, 'user', message);
      await this.saveMessage(sessionId, 'assistant', aiResponse, relevantDocs.map(doc => doc.id));

      // 5. Format response with enhanced sources
      const sources = relevantDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        relevantContent: this.extractRelevantContent(doc.content, message),
        category: doc.category,
        tags: doc.tags,
        summary: doc.summary,
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

  private buildEnhancedContext(message: string, documents: Array<{
    id: number;
    title: string;
    content: string;
    summary?: string;
    category?: string;
    tags?: string[];
    relevanceScore?: number;
  }>): string {
    if (documents.length === 0) {
      return `
You are an expert CTO coach providing guidance on engineering leadership, 
software architecture, and technology strategy.

User question: ${message}

Provide helpful, practical advice as a CTO would. Draw from your knowledge 
of engineering best practices, leadership principles, and technology trends.
      `;
    }

    // Sort documents by relevance score
    const sortedDocs = documents.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    const knowledgeContext = sortedDocs
      .map((doc, index) => {
        const relevantContent = this.extractRelevantContent(doc.content, message);
        return `Document ${index + 1}: ${doc.title}
Category: ${doc.category || 'General'}
Tags: ${doc.tags?.join(', ') || 'None'}
Summary: ${doc.summary || 'No summary available'}
Relevant Content: ${relevantContent}`;
      })
      .join('\n\n');

    return `
You are an expert CTO coach providing guidance on engineering leadership, 
software architecture, and technology strategy.

Context from knowledge base (${documents.length} relevant documents found):
${knowledgeContext}

User question: ${message}

Provide helpful, practical advice as a CTO would. Reference the provided 
context when relevant and cite the document titles in your response. 
When citing sources, use the format: "According to [Document Title]..." 
or "As mentioned in [Document Title]...". Be specific about which document 
you're referencing.
    `;
  }

  private extractRelevantContent(content: string, query: string): string {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Find sentences that contain query words
    const relevantSentences = sentences.filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      return queryWords.some(word => sentenceLower.includes(word));
    });

    if (relevantSentences.length > 0) {
      // Return up to 3 most relevant sentences
      return relevantSentences.slice(0, 3).join('. ').trim() + '.';
    }

    // Fallback to first few sentences if no matches
    return sentences.slice(0, 2).join('. ').trim() + '.';
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
