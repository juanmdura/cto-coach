import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

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

export const ChatInterface: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create session on component mount
  const { data: session } = useQuery({
    queryKey: ['chat-session'],
    queryFn: chatService.createSession,
    staleTime: Infinity,
  });

  // Update session ID when session is created
  useEffect(() => {
    if (session?.sessionId) {
      setSessionId(session.sessionId);
    }
  }, [session]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId: string }) =>
      chatService.sendMessage(message, sessionId),
    onMutate: ({ message }) => {
      // Optimistically add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
    },
    onSuccess: (response) => {
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        sources: response.sources,
        timestamp: response.timestamp,
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (message: string) => {
    if (!sessionId || !message.trim()) return;
    
    sendMessageMutation.mutate({ message: message.trim(), sessionId });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Chat with your CTO Coach
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ask questions about engineering leadership, architecture, and best practices
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm">
              Ask me anything about engineering leadership, software architecture, or team management.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 max-w-md mx-auto">
              <button
                onClick={() => handleSendMessage("How should I structure my engineering team?")}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                "How should I structure my engineering team?"
              </button>
              <button
                onClick={() => handleSendMessage("What are the key principles of good software architecture?")}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                "What are the key principles of good software architecture?"
              </button>
              <button
                onClick={() => handleSendMessage("How do I implement effective code review processes?")}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                "How do I implement effective code review processes?"
              </button>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-6 py-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending || !sessionId}
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
};
