"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import api from '@/lib/api';
import { Shield, ShieldAlert, Check, X } from 'lucide-react';

export default function UsersPage() {
  const { data: users, error, mutate } = useSWR('/users', fetcher);
  const [loading, setLoading] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, role: string) => {
    setLoading(userId);
    try {
      await api.post(`/users/${userId}/role`, { role });
      mutate(); // Refresh data
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('Failed to update role');
    } finally {
      setLoading(null);
    }
  };

  if (error) return <div className="text-red-500">Failed to load users</div>;
  if (!users) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <span className="text-gray-400 text-sm">{users.length} users found</span>
      </div>

      <div className="bg-[#151519] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1c1c21] border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user: any) => (
              <tr key={user._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{user._id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.roles?.map((role: string) => (
                      <span 
                        key={role}
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${
                          role === 'admin' 
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.emailVerified ? (
                    <span className="flex items-center text-xs text-green-400">
                      <Check className="w-3 h-3 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center text-xs text-yellow-400">
                      <X className="w-3 h-3 mr-1" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleRoleUpdate(user._id, 'admin')}
                    disabled={loading === user._id || user.roles?.includes('admin')}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Make Admin</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
