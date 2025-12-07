import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Edit, Trash2, ExternalLink, Eye, Crown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

interface Workflow {
  _id: string;
  title: string;
  slug: string;
  creatorId: {
    fullName: string;
  };
  downloadsCount: number;
  status: string;
  createdAt: string;
  isPremium: boolean;
}

export default function WorkflowsTable() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workflows?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setWorkflows(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch workflows', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchWorkflows();
  }, [debouncedSearch, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow', error);
    }
  };

  const handleTogglePremium = async (id: string) => {
    try {
      await api.patch(`/workflows/${id}/premium`);
      // Optimistic update
      setWorkflows(workflows.map(w => 
        w._id === id ? { ...w, isPremium: !w.isPremium } : w
      ));
    } catch (error) {
      console.error('Failed to toggle premium status', error);
      alert('Failed to update premium status');
    }
  };

  return (
    <div className="bg-[#151519] border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">Workflows Management</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#1c1c21] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">Workflow</th>
              <th className="px-6 py-4 font-medium">Creator</th>
              <th className="px-6 py-4 font-medium">Downloads</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Premium</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {workflows.map((workflow) => (
              <tr key={workflow._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-white">{workflow.title}</div>
                  <div className="text-xs text-gray-500">/{workflow.slug}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {workflow.creatorId?.fullName || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {workflow.downloadsCount}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTogglePremium(workflow._id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      workflow.isPremium 
                        ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' 
                        : 'bg-gray-800 text-gray-500 hover:text-gray-400'
                    }`}
                    title={workflow.isPremium ? "Remove Premium" : "Make Premium"}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link 
                      href={`/workflow/${workflow.slug}`}
                      target="_blank"
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(workflow._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
