'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, FileText, CheckCircle, XCircle, RotateCcw, User, Clock, type LucideIcon } from 'lucide-react';
import { api } from '~/trpc/react';

// Types
interface StatCardProps {
  title: string;
  value: number;
  percentage?: number;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

// Components
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  percentage, 
  icon: Icon, 
  bgColor, 
  textColor, 
  iconColor 
}) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
        {percentage !== undefined && (
          <p className="text-sm text-gray-500 mt-1">{percentage}%</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const COLORS = ['#3B82F6', '#10B981', '#F43F5E', '#F59E0B', '#6366F1', '#FB923C'];

const AdminDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');

  const { 
    data: overviewStats, 
    isLoading, 
    error,
    refetch
  } = api.performanceMetrics.getOverallStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  const dateRangeOptions = [
    'Last 7 Days',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months',
    'Last Year'
  ];

  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const total = Number(overviewStats?.data?.total ?? 0);

  const statsCards = [
    {
      title: 'Total Tickets',
      value: total,
      icon: FileText,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Resolved',
      value: Number(overviewStats?.data?.resolved ?? 0),
      percentage: calculatePercentage(Number(overviewStats?.data?.resolved ?? 0), total),
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      iconColor: 'text-green-600'
    },
    {
      title: 'Closed',
      value: Number(overviewStats?.data?.closed ?? 0),
      percentage: calculatePercentage(Number(overviewStats?.data?.closed ?? 0), total),
      icon: XCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      iconColor: 'text-green-600'
    },
    {
      title: 'Reopened',
      value: Number(overviewStats?.data?.reopened ?? 0),
      percentage: calculatePercentage(Number(overviewStats?.data?.reopened ?? 0), total),
      icon: RotateCcw,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Assigned',
      value: Number(overviewStats?.data?.in_progress ?? 0),
      percentage: calculatePercentage(Number(overviewStats?.data?.in_progress ?? 0), total),
      icon: User,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Waiting',
      value: Number(overviewStats?.data?.waiting_assignment ?? 0),
      percentage: calculatePercentage(Number(overviewStats?.data?.waiting_assignment ?? 0), total),
      icon: Clock,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      iconColor: 'text-orange-600'
    }
  ];

  // Prepare chart data
  const chartData = statsCards
    .filter(stat => stat.title !== 'Total Tickets')
    .map(stat => ({
      name: stat.title,
      value: stat.value
    }));

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Error: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of all tickets</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              {dateRangeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statsCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Proportion of Tickets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
