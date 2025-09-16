export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    id: number;
    title: string;
    relevantContent: string;
    category?: string;
    tags?: string[];
    summary?: string;
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
    category?: string;
    tags?: string[];
    summary?: string;
  }>;
  sessionId: string;
  timestamp: string;
}
