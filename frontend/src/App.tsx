import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatInterface } from './components/ChatInterface';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  🎯 CTO Coach
                </h1>
                <span className="ml-2 text-sm text-gray-500">
                  AI-Powered Engineering Leadership Guidance
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <ChatInterface />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Knowledge Base Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Knowledge Base
                  </h3>
                  <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {showUpload ? 'Hide Upload' : 'Upload'}
                  </button>
                </div>
                
                {showUpload ? (
                  <DocumentUpload />
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload engineering documents to enhance AI responses with your specific context.
                    </p>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="btn-secondary w-full"
                    >
                      Upload Documents
                    </button>
                  </>
                )}
                
                <div className="mt-6">
                  <DocumentList />
                </div>
              </div>

              {/* Sample Topics */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sample Questions
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• How do I structure my engineering team?</div>
                  <div>• What are SOLID principles?</div>
                  <div>• How to implement code reviews?</div>
                  <div>• Microservices best practices?</div>
                </div>
              </div>
            </div>
          </div>
        </main>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;