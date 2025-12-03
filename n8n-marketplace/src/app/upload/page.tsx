"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
        setError('Please upload a valid JSON file.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const fileContent = await file.text();
      let jsonContent;
      try {
        jsonContent = JSON.parse(fileContent);
      } catch (err) {
        throw new Error('Invalid JSON file content.');
      }

      const payload = {
        title: file.name.replace('.json', ''), // Temporary title, AI will overwrite or user can edit later
        description: 'Uploaded workflow',
        workflowJson: jsonContent,
      };

      const response = await api.post('/workflows', payload);
      
      setSuccess('Workflow uploaded successfully! Redirecting...');
      setTimeout(() => {
        router.push(`/workflow/${response.data.slug}`);
      }, 2000);

    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload workflow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-100 font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#151519] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Upload Workflow</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Share your automation magic with the world.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Workflow JSON File
            </label>
            <div className="relative group">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${
                file ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-700 hover:border-gray-600 bg-[#1c1c21]'
              }`}>
                {file ? (
                  <>
                    <FileJson className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-400 font-medium truncate max-w-full">
                      {file.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-500 mb-2 group-hover:text-gray-400" />
                    <span className="text-sm text-gray-500 group-hover:text-gray-400">
                      Click to browse or drag file here
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Upload & Analyze'
              )}
            </button>
            <Link 
              href="/"
              className="w-full py-3 px-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-medium text-center transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
