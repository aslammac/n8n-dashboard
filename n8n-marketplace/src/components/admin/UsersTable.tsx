import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MoreVertical, Shield, Ban, CheckCircle } from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  roles: string[];
  isBlocked: boolean;
  createdAt: string;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      // Assuming we have a users endpoint, if not we might need to add one or use a search endpoint
      // For now, let's assume GET /users returns all users for admin
      // If not, we'll need to update backend UsersController.findAll to be accessible by admin
      const res = await api.get('/users'); 
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (user: User) => {
    try {
      if (user.isBlocked) {
        await api.patch(`/users/${user._id}/unblock`);
      } else {
        await api.patch(`/users/${user._id}/block`);
      }
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to update user status', error);
    }
  };

  if (loading) return <div className="text-white">Loading users...</div>;

  return (
    <div className="bg-[#151519] border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">Users Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-900/50 text-gray-400 text-sm">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.fullName?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.roles.includes('admin') 
                      ? 'bg-purple-500/10 text-purple-400' 
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {user.roles.includes('admin') ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    user.isBlocked 
                      ? 'bg-red-500/10 text-red-400' 
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {user.isBlocked ? (
                      <><Ban className="w-3 h-3" /> Blocked</>
                    ) : (
                      <><CheckCircle className="w-3 h-3" /> Active</>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleBlock(user)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.isBlocked 
                        ? 'text-green-400 hover:bg-green-500/10' 
                        : 'text-red-400 hover:bg-red-500/10'
                    }`}
                    title={user.isBlocked ? "Unblock User" : "Block User"}
                  >
                    {user.isBlocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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
