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
      const documents = await prisma.document.findMany({
        select: {
          id: true,
          title: true,
          fileType: true,
          sourceUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

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
}
