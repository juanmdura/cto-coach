import axios from 'axios';
import type { ChatResponse, ChatSession } from '../types/chat';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SessionResponse extends ChatSession {
  createdAt: string;
}

export const chatService = {
  async createSession(): Promise<SessionResponse> {
    const response = await apiClient.post('/chat/session');
    return response.data;
  },

  async sendMessage(message: string, sessionId: string): Promise<ChatResponse> {
    const response = await apiClient.post('/chat/message', {
      message,
      sessionId,
    });
    return response.data;
  },

  async getChatHistory(sessionId: string) {
    const response = await apiClient.get(`/chat/history/${sessionId}`);
    return response.data;
  },
};
