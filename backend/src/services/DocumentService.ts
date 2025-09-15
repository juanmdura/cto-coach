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
  createdAt: Date;
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

      // Save to database
      const document = await prisma.document.create({
        data: {
          title: this.generateTitle(file.originalname),
          content,
          filePath: file.path,
          fileType: file.mimetype,
        },
      });

      return {
        id: document.id,
        title: document.title,
        fileType: document.fileType,
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

  async searchDocuments(query: string, limit: number = 5): Promise<Array<{
    id: number;
    title: string;
    content: string;
  }>> {
    try {
      // Simple text search using PostgreSQL LIKE - can be improved with full-text search
      const documents = await prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return documents;
    } catch (error) {
      console.error('Document search error:', error);
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
}
