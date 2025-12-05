"use client";

import React, { useState } from 'react';
import api from '@/lib/api';
import { Upload, FileJson, Check, AlertCircle } from 'lucide-react';

export default function BulkUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setStatus(null);

    try {
      const workflows = await Promise.all(files.map(async (file) => {
        const text = await file.text();
        // Validate JSON
        try {
          JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON in file: ${file.name}`);
        }
        
        return {
          title: file.name.replace(/\.json$/i, ''),
          workflowJson: text, // Send as string, backend handles parsing
        };
      }));

      await api.post('/workflows/bulk', { workflows });
      
      setStatus({
        type: 'success',
        message: `Bulk upload started for ${workflows.length} workflows. You will be notified when complete.`
      });
      setFiles([]);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatus({
        type: 'error',
        message: err.message || 'Failed to upload files.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Bulk Workflow Upload</h2>
        <p className="text-gray-400">Upload a JSON file containing an array of workflows to import them in bulk.</p>
      </div>

      <div className="bg-[#151519] border border-gray-800 rounded-xl p-8">
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors">
          <input
            type="file"
            accept=".json"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="bulk-upload-input"
          />
          <label htmlFor="bulk-upload-input" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400">
              {files.length > 0 ? <FileJson className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
            </div>
            {files.length > 0 ? (
              <div className="text-white font-medium">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </div>
            ) : (
              <>
                <div className="text-white font-medium mb-1">Click to upload JSON</div>
                <div className="text-sm text-gray-500">or drag and drop files here</div>
              </>
            )}
          </label>
        </div>

        {status && (
          <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
            status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {status.type === 'success' ? <Check className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
            <span>{status.message}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{loading ? 'Uploading...' : 'Start Import'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
