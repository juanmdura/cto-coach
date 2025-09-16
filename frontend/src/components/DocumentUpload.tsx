import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UploadResponse {
  id: number;
  title: string;
  fileType: string | null;
  createdAt: string;
}

const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch('http://localhost:3000/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  return response.json();
};

export const DocumentUpload: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      // Invalidate and refetch documents list if we have one
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a text file (.txt), markdown file (.md), or PDF file.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {uploadMutation.isPending ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Uploading document...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Drag and drop your document here, or{' '}
              <button
                onClick={handleButtonClick}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                click to browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Supports .txt, .md, and .pdf files (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {uploadMutation.isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            ✅ Document uploaded successfully! It will now be used to enhance AI responses.
          </p>
        </div>
      )}

      {uploadMutation.isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            ❌ Failed to upload document. Please try again.
          </p>
        </div>
      )}
    </div>
  );
};
