import React from 'react';
import { Users, FileJson, Download, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalWorkflows: number;
  totalDownloads: number;
}

export default function AnalyticsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Total Workflows',
      value: stats.totalWorkflows,
      icon: FileJson,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Total Downloads',
      value: stats.totalDownloads,
      icon: Download,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Active Now',
      value: '24', // Mock data for now
      icon: TrendingUp,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-[#151519] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{card.value}</h3>
          <p className="text-sm text-gray-400">{card.title}</p>
        </div>
      ))}
    </div>
  );
}
