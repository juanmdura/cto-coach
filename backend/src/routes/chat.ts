import express from 'express';
import { ChatController } from '../controllers/ChatController';

const router = express.Router();
const chatController = new ChatController();

// Send a chat message
router.post('/message', chatController.sendMessage.bind(chatController));

// Get chat history
router.get('/history/:sessionId', chatController.getHistory.bind(chatController));

// Create new chat session
router.post('/session', chatController.createSession.bind(chatController));

export default router;
