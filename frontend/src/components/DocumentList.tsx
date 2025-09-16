import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Document {
  id: number;
  title: string;
  fileType: string | null;
  category?: string;
  tags?: string[];
  summary?: string;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentFilters {
  search?: string;
  category?: string;
  tags?: string[];
}

const fetchDocuments = async (filters?: DocumentFilters): Promise<Document[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => params.append('tags', tag));
  }

  const url = `http://localhost:3000/api/documents${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.status}`);
  }
  const data = await response.json();
  return data.documents || [];
};

const fetchCategories = async (): Promise<string[]> => {
  const response = await fetch('http://localhost:3000/api/documents/categories');
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }
  const data = await response.json();
  return data.categories || [];
};

const fetchTags = async (): Promise<string[]> => {
  const response = await fetch('http://localhost:3000/api/documents/tags');
  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.status}`);
  }
  const data = await response.json();
  return data.tags || [];
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
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', filters],
    queryFn: () => fetchDocuments(filters),
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 300000, // 5 minutes
  });

  const {
    data: tags = [],
    isLoading: tagsLoading,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 300000, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
  };

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({ 
      ...prev, 
      category: category === 'all' ? undefined : category 
    }));
  };

  const handleTagFilter = (tag: string) => {
    setFilters(prev => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      return { ...prev, tags: newTags.length > 0 ? newTags : undefined };
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

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

  // Ensure documents is an array
  const documentList = Array.isArray(documents) ? documents : [];

  if (documentList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📚</div>
        <p className="text-sm">No documents uploaded yet.</p>
        <p className="text-xs mt-1">Upload some documents to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Documents ({documentList.length})
        </h4>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 p-3 bg-gray-50 rounded-md">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Tag Filters */}
          {tags.slice(0, 8).map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagFilter(tag)}
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                filters.tags?.includes(tag)
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}

          {(filters.search || filters.category || filters.tags?.length) && (
            <button
              onClick={clearFilters}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {documentList.map((doc) => (
          <div
            key={doc.id}
            className="p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <span className="text-lg">{getFileIcon(doc.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.title}
                  </p>
                  
                  {doc.summary && (
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                      {doc.summary}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {doc.fileType}
                    </span>
                    {doc.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {doc.category}
                      </span>
                    )}
                    {doc.wordCount && (
                      <span>{doc.wordCount} words</span>
                    )}
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
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
          </div>
        ))}
      </div>
    </div>
  );
};
