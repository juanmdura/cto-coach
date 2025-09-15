export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    id: number;
    title: string;
    relevantContent: string;
  }>;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  sources: Array<{
    id: number;
    title: string;
    relevantContent: string;
  }>;
  sessionId: string;
  timestamp: string;
}
