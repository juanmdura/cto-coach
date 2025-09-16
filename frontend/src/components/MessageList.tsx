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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`font-medium ${
                            message.role === 'user' ? 'text-white' : 'text-gray-900'
                          }`}>
                            📄 {source.title}
                          </div>
                          
                          {(source.category || source.tags?.length) && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {source.category && (
                                <span className={`px-2 py-1 rounded text-xs ${
                                  message.role === 'user' 
                                    ? 'bg-white bg-opacity-30 text-white' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {source.category}
                                </span>
                              )}
                              {source.tags?.slice(0, 2).map((tag) => (
                                <span key={tag} className={`px-2 py-1 rounded text-xs ${
                                  message.role === 'user' 
                                    ? 'bg-white bg-opacity-20 text-white' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className={`mt-2 text-xs ${
                            message.role === 'user' ? 'text-white text-opacity-80' : 'text-gray-600'
                          }`}>
                            {source.relevantContent}
                          </div>
                        </div>
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
