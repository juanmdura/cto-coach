import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ChatService } from '../services/ChatService';
import { createError } from '../middleware/errorHandler';
import { z } from 'zod';

const prisma = new PrismaClient();

const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().uuid('Invalid session ID format'),
});

// const createSessionSchema = z.object({
//   // No required fields for now, but can be extended
// });

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, sessionId } = sendMessageSchema.parse(req.body);

      // Verify session exists
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        throw createError('Chat session not found', 404);
      }

      const response = await this.chatService.processMessage(message, sessionId);

      res.json({
        response: response.content,
        sources: response.sources,
        sessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        throw createError('Session ID is required', 400);
      }

      const messages = await prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });

      res.json({
        messages,
        sessionId,
        totalCount: messages.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await prisma.chatSession.create({
        data: {},
      });

      res.status(201).json({
        sessionId: session.id,
        createdAt: session.createdAt,
      });
    } catch (error) {
      next(error);
    }
  }
}
