import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Edit, Trash2, ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';

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
}

export default function WorkflowsTable() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    try {
      const res = await api.get('/workflows?limit=100'); // Fetch more for admin
      setWorkflows(res.data.data);
    } catch (error) {
      console.error('Failed to fetch workflows', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow', error);
    }
  };

  if (loading) return <div className="text-white">Loading workflows...</div>;

  return (
    <div className="bg-[#151519] border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Workflows Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">Workflow</th>
              <th className="px-6 py-4 font-medium">Creator</th>
              <th className="px-6 py-4 font-medium">Downloads</th>
              <th className="px-6 py-4 font-medium">Status</th>
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
    </div>
  );
}
