'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import AnalyticsCards from '@/components/admin/AnalyticsCards';
import UsersTable from '@/components/admin/UsersTable';
import WorkflowsTable from '@/components/admin/WorkflowsTable';
import { LayoutDashboard, Users, FileJson, Upload } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkflows: 0,
    totalDownloads: 0,
    recentUsers: [],
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-gray-400">Manage users, workflows, and view platform statistics.</p>
        </div>
        <Link 
          href="/admin/bulk-upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Bulk Upload
        </Link>
      </div>

      <AnalyticsCards stats={stats} />

      <div className="flex items-center gap-4 border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
            activeTab === 'overview' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </div>
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
            activeTab === 'users' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </div>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
            activeTab === 'workflows' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Workflows
          </div>
          {activeTab === 'workflows' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UsersTable />
          <WorkflowsTable />
        </div>
      )}

      {activeTab === 'users' && <UsersTable />}
      
      {activeTab === 'workflows' && <WorkflowsTable />}
    </div>
  );
}
