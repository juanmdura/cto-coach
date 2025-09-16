import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { DocumentService } from '../services/DocumentService';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      const document = await this.documentService.processUpload(req.file);

      res.status(201).json({
        id: document.id,
        title: document.title,
        fileType: document.fileType,
        status: 'uploaded',
        message: 'Document processed successfully',
        createdAt: document.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, tags, search } = req.query;
      
      let documents;
      
      if (search && typeof search === 'string') {
        // Use search functionality
        const tagArray = tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined;
        documents = await this.documentService.searchDocuments(
          search,
          50, // Get more results for listing
          category as string,
          tagArray
        );
      } else if (category && typeof category === 'string') {
        // Get documents by category
        documents = await this.documentService.getDocumentsByCategory(category);
      } else {
        // Get all documents
        documents = await prisma.document.findMany({
          where: { isProcessed: true },
          select: {
            id: true,
            title: true,
            fileType: true,
            sourceUrl: true,
            category: true,
            tags: true,
            summary: true,
            wordCount: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      res.json({
        documents,
        totalCount: documents.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const documentId = parseInt(id);

      if (isNaN(documentId)) {
        throw createError('Invalid document ID', 400);
      }

      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw createError('Document not found', 404);
      }

      res.json(document);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const documentId = parseInt(id);

      if (isNaN(documentId)) {
        throw createError('Invalid document ID', 400);
      }

      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw createError('Document not found', 404);
      }

      await this.documentService.deleteDocument(documentId);

      res.json({
        message: 'Document deleted successfully',
        id: documentId,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.documentService.getDocumentCategories();
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await this.documentService.getDocumentTags();
      res.json({ tags });
    } catch (error) {
      next(error);
    }
  }
}
