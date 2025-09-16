import React from 'react';
import type { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-3xl px-4 py-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-opacity-20">
                <div className="text-xs font-medium mb-2 opacity-80">
                  📚 Referenced from {message.sources.length} document{message.sources.length > 1 ? 's' : ''}:
                </div>
                <div className="space-y-2">
                  {message.sources.map((source) => (
                    <div
                      key={source.id}
                      className={`text-xs rounded-lg p-3 border ${
                        message.role === 'user'
                          ? 'bg-white bg-opacity-20 border-white border-opacity-30'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className={`font-medium ${
                        message.role === 'user' ? 'text-white' : 'text-gray-900'
                      }`}>
                        📄 {source.title}
                      </div>
                      <div className={`mt-1 text-xs ${
                        message.role === 'user' ? 'text-white text-opacity-80' : 'text-gray-600'
                      }`}>
                        {source.relevantContent}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs mt-2 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
