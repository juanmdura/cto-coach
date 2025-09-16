import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface DocumentUpload {
  id: number;
  title: string;
  fileType: string | null;
  category?: string;
  tags?: string[];
  summary?: string;
  wordCount?: number;
  createdAt: Date;
}

export interface DocumentSearchResult {
  id: number;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  relevanceScore?: number;
}

interface MulterFile {
  originalname: string;
  path: string;
  mimetype: string;
}

export class DocumentService {
  async processUpload(file: MulterFile): Promise<DocumentUpload> {
    try {
      // Extract text content based on file type
      const content = await this.extractContent(file);
      
      // Generate metadata
      const title = this.generateTitle(file.originalname);
      const wordCount = this.countWords(content);
      const category = this.categorizeDocument(title, content);
      const tags = this.extractTags(title, content);
      const summary = this.generateSummary(content);

      // Save to database
      const document = await prisma.document.create({
        data: {
          title,
          content,
          summary,
          filePath: file.path,
          fileType: file.mimetype,
          category,
          tags,
          wordCount,
          isProcessed: true,
        },
      });

      return {
        id: document.id,
        title: document.title,
        fileType: document.fileType,
        category: document.category || undefined,
        tags: document.tags,
        summary: document.summary || undefined,
        wordCount: document.wordCount || undefined,
        createdAt: document.createdAt,
      };
    } catch (error) {
      // Clean up uploaded file if processing fails
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
      throw error;
    }
  }

  async searchDocuments(
    query: string, 
    limit: number = 5,
    category?: string,
    tags?: string[]
  ): Promise<DocumentSearchResult[]> {
    try {
      // Build search conditions
      const searchConditions: any = {
        isProcessed: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
        ],
      };

      // Add category filter if provided
      if (category) {
        searchConditions.category = category;
      }

      // Add tags filter if provided
      if (tags && tags.length > 0) {
        searchConditions.tags = {
          hasSome: tags,
        };
      }

      const documents = await prisma.document.findMany({
        where: searchConditions,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          category: true,
          tags: true,
        },
        take: limit * 2, // Get more results for relevance scoring
      });

      // Calculate relevance scores and sort
      const scoredDocuments = documents.map(doc => ({
        ...doc,
        relevanceScore: this.calculateRelevanceScore(query, doc),
      }));

      // Sort by relevance score and return top results
      return scoredDocuments
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('Document search error:', error);
      return [];
    }
  }

  async getDocumentsByCategory(category: string): Promise<DocumentSearchResult[]> {
    try {
      const documents = await prisma.document.findMany({
        where: {
          category,
          isProcessed: true,
        },
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return documents;
    } catch (error) {
      console.error('Error fetching documents by category:', error);
      return [];
    }
  }

  async getDocumentCategories(): Promise<string[]> {
    try {
      const categories = await prisma.document.findMany({
        where: {
          category: { not: null },
          isProcessed: true,
        },
        select: { category: true },
        distinct: ['category'],
      });

      return categories
        .map(c => c.category)
        .filter((category): category is string => category !== null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getDocumentTags(): Promise<string[]> {
    try {
      const documents = await prisma.document.findMany({
        where: {
          isProcessed: true,
        },
        select: { tags: true },
      });

      const allTags = documents.flatMap(doc => doc.tags);
      return [...new Set(allTags)]; // Remove duplicates
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  async deleteDocument(id: number): Promise<void> {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw createError('Document not found', 404);
    }

    // Delete file from filesystem if it exists
    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (error) {
        console.error('Failed to delete file:', error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });
  }

  private async extractContent(file: { path: string; mimetype: string }): Promise<string> {
    try {
      switch (file.mimetype) {
        case 'text/plain':
        case 'text/markdown': {
          return await fs.readFile(file.path, 'utf-8');
        }

        case 'application/pdf': {
          const pdfBuffer = await fs.readFile(file.path);
          const pdfData = await pdfParse(pdfBuffer);
          return pdfData.text;
        }

        default:
          throw createError(`Unsupported file type: ${file.mimetype}`, 400);
      }
    } catch (error) {
      console.error('Content extraction error:', error);
      throw createError('Failed to extract content from file', 500);
    }
  }

  private generateTitle(filename: string): string {
    // Remove file extension and clean up the filename
    const nameWithoutExt = path.parse(filename).name;
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  private countWords(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private categorizeDocument(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();
    
    // Define category keywords
    const categories = {
      'Architecture': ['architecture', 'design pattern', 'system design', 'microservices', 'monolith', 'scalability'],
      'Leadership': ['leadership', 'management', 'team', 'mentoring', 'culture', 'strategy'],
      'Engineering': ['engineering', 'development', 'coding', 'programming', 'software', 'technical'],
      'Process': ['process', 'workflow', 'agile', 'scrum', 'kanban', 'methodology', 'best practice'],
      'Security': ['security', 'vulnerability', 'authentication', 'authorization', 'encryption', 'privacy'],
      'DevOps': ['devops', 'deployment', 'ci/cd', 'infrastructure', 'monitoring', 'automation'],
      'Quality': ['quality', 'testing', 'code review', 'qa', 'bug', 'defect', 'reliability'],
    };

    // Score each category
    const scores: { [key: string]: number } = {};
    for (const [category, keywords] of Object.entries(categories)) {
      scores[category] = keywords.reduce((score, keyword) => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        return score + matches;
      }, 0);
    }

    // Return category with highest score, or 'General' if no matches
    const bestCategory = Object.entries(scores).reduce((a, b) => 
      scores[a[0]] > scores[b[0]] ? a : b
    );
    
    return scores[bestCategory[0]] > 0 ? bestCategory[0] : 'General';
  }

  private extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const commonTags = [
      'react', 'nodejs', 'typescript', 'javascript', 'python', 'java',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes',
      'api', 'rest', 'graphql', 'database', 'sql', 'nosql',
      'frontend', 'backend', 'fullstack', 'mobile',
      'performance', 'optimization', 'scalability', 'reliability',
      'testing', 'tdd', 'bdd', 'unit test', 'integration test',
      'agile', 'scrum', 'kanban', 'ci/cd', 'git',
    ];

    const foundTags = commonTags.filter(tag => 
      text.includes(tag.toLowerCase())
    );

    // Add some dynamic tags based on content analysis
    if (text.includes('microservice')) foundTags.push('microservices');
    if (text.includes('monolith')) foundTags.push('monolith');
    if (text.includes('cloud')) foundTags.push('cloud');
    if (text.includes('ai') || text.includes('machine learning')) foundTags.push('ai-ml');

    return [...new Set(foundTags)]; // Remove duplicates
  }

  private generateSummary(content: string): string {
    // Simple extractive summarization - take first few sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summaryLength = Math.min(3, sentences.length);
    return sentences.slice(0, summaryLength).join('. ').trim() + '.';
  }

  private calculateRelevanceScore(query: string, document: DocumentSearchResult): number {
    const queryLower = query.toLowerCase();
    const titleLower = document.title.toLowerCase();
    const contentLower = document.content.toLowerCase();
    const summaryLower = document.summary?.toLowerCase() || '';

    let score = 0;

    // Title matches are weighted highest
    if (titleLower.includes(queryLower)) {
      score += 10;
    }

    // Summary matches are weighted high
    if (summaryLower.includes(queryLower)) {
      score += 8;
    }

    // Content matches are weighted lower
    const contentMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 2;

    // Tag matches
    if (document.tags) {
      const tagMatches = document.tags.filter(tag => 
        tag.toLowerCase().includes(queryLower)
      ).length;
      score += tagMatches * 5;
    }

    // Category matches
    if (document.category?.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    return score;
  }
}
