'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Calendar, Users, Clock, Star, Activity, RefreshCw } from 'lucide-react';
import { api } from '~/trpc/react';
import { useParams } from 'next/navigation';
import { setDate } from 'date-fns';

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  info: '#06B6D4'
};

const PIE_COLORS = [COLORS.danger, COLORS.warning, COLORS.info, COLORS.secondary, COLORS.accent, COLORS.primary];

export default function TeamPerformancePage() {
    const router = useRouter();
  const { id } = useParams();

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const { data: performanceData, isLoading, error, refetch } = api.performanceMetrics.getSingleTeamPerformanceMetric.useQuery(
    { teamId: id as string },
    {
      enabled: !!id && typeof id === 'string',
    }
  );
//   setDateRange({
//     startDate: performanceData?.data?.dateRange?.startDate ?? '',
//     endDate: performanceData?.data?.dateRange?.endDate ?? ''
//   });

  const handleDateFilter = async () => {
    await refetch();
  };

  // Show loading state while router is initializing or data is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!performanceData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-4">Unable to load performance data for team ID: {id}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { team, statusCounts, timeMetrics, ratings, workerPerformance, priorityBreakdown, categoryBreakdown } = performanceData.data;

  // Prepare chart data
  const statusData = [
    { name: 'Waiting Assignment', value: parseInt(statusCounts?.waiting_assignment ?? ''), color: COLORS.warning },
    { name: 'In Progress', value: parseInt(statusCounts?.in_progress ?? ''), color: COLORS.info },
    { name: 'In Queue', value: parseInt(statusCounts?.in_queue ?? ''), color: COLORS.accent },
    { name: 'Resolved', value: parseInt(statusCounts?.resolved ?? ''), color: COLORS.secondary },
    { name: 'Closed', value: parseInt(statusCounts?.closed ?? ''), color: COLORS.primary },
  ];

  const workerPerformanceData = workerPerformance.map(worker => ({
    name: worker.worker_name.length > 15 ? worker.worker_name.substring(0, 15) + '...' : worker.worker_name,
    points: worker.points,
    assigned: parseInt(worker.assigned_count),
    resolved: parseInt(worker.resolved_count),
    avgHours: worker.avg_hours ? parseFloat(worker.avg_hours) : 0,
  }));

  const priorityData = priorityBreakdown.map(item => ({
    name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
    count: parseInt(item.count),
    color: item.priority === 'urgent' ? COLORS.danger : COLORS.warning,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{team.name} </h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  ID: {id}
                </span>
              </div>
              <p className="text-gray-600">{team.description}</p>
              <p className="text-sm text-gray-500 mt-2">Created: {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button 
                onClick={handleDateFilter}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600">
          <button 
            onClick={() => router.push('/dashboard/admin')}
            className="hover:text-blue-600 transition-colors"
          >
            Admin Dashboard
          </button>
          <span className="mx-2">/</span>
          <button 
            onClick={() => router.push('/dashboard/admin/teams')}
            className="hover:text-blue-600 transition-colors"
          >
            Teams
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Team Performance</span>
        </nav>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Complaints</h3>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{statusCounts.total_complaints}</div>
            <p className="text-sm text-gray-500">Total tickets processed</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Avg Resolution Time</h3>
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{timeMetrics.averageResolutionHours}h</div>
            <p className="text-sm text-gray-500">{timeMetrics.totalResolved} resolved tickets</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Team Rating</h3>
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {ratings?.averageRating ?? 0 > 0 ? ratings?.averageRating ?? 0 .toFixed(1) : 'N/A'}
            </div>
            <p className="text-sm text-gray-500">{ratings?.totalRatings ?? 0} total ratings</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Active Workers</h3>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{workerPerformance.length}</div>
            <p className="text-sm text-gray-500">Team members</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ticket Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Priority Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Worker Performance Analysis</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={workerPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="points" fill={COLORS.primary} name="Points" radius={[2, 2, 0, 0]} />
              <Bar dataKey="assigned" fill={COLORS.accent} name="Assigned" radius={[2, 2, 0, 0]} />
              <Bar dataKey="resolved" fill={COLORS.secondary} name="Resolved" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Worker Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Worker Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Worker Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Points</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Resolved</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Success Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Hours</th>
                </tr>
              </thead>
              <tbody>
                {workerPerformance.map((worker, index) => {
                  const successRate = parseInt(worker.assigned_count) > 0 
                    ? ((parseInt(worker.resolved_count) / parseInt(worker.assigned_count)) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <tr key={worker.user_id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-25' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{worker.worker_name}</div>
                        <div className="text-sm text-gray-500">ID: {worker.team_worker_id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          worker.points > 50 ? 'bg-green-100 text-green-800' : 
                          worker.points > 20 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {worker.points}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{worker.assigned_count}</td>
                      <td className="py-3 px-4 text-gray-900">{worker.resolved_count}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-24">
                            <div 
                              className={`h-2 rounded-full ${
                                parseFloat(successRate) > 50 ? 'bg-green-500' : 
                                parseFloat(successRate) > 25 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(parseFloat(successRate), 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{successRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {worker.avg_hours ? parseFloat(worker.avg_hours).toFixed(1) + 'h' : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Distribution</h2>
          <div className="space-y-4">
            {categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="font-medium text-gray-900">{category.category_name}</div>
                <div className="text-2xl font-bold text-blue-600">{category.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}