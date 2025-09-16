import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Document {
  id: number;
  title: string;
  fileType: string | null;
  createdAt: string;
}

const fetchDocuments = async (): Promise<Document[]> => {
  const response = await fetch('http://localhost:3000/api/documents');
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
};

const deleteDocument = async (id: number): Promise<void> => {
  const response = await fetch(`http://localhost:3000/api/documents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
};

export const DocumentList: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getFileIcon = (fileType: string | null) => {
    switch (fileType) {
      case 'application/pdf':
        return '📄';
      case 'text/markdown':
        return '📝';
      case 'text/plain':
        return '📄';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-800">
          Failed to load documents. Please try again.
        </p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📚</div>
        <p className="text-sm">No documents uploaded yet.</p>
        <p className="text-xs mt-1">Upload some documents to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Uploaded Documents ({documents.length})
      </h4>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-lg">{getFileIcon(doc.fileType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.title}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(doc.createdAt)}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleDelete(doc.id, doc.title)}
              disabled={deleteMutation.isPending}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete document"
            >
              {deleteMutation.isPending ? (
                <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
