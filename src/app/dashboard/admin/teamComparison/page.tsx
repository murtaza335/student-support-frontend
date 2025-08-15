'use client';

import { useState, useEffect } from 'react';
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
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { Calendar, TrendingUp, Users, Clock, Star, AlertCircle, Filter } from 'lucide-react';
import { api } from '~/trpc/react'; // Adjust this import path to match your project structure

interface TeamData {
  team_id: number;
  team_name: string;
  total_complaints: string;
  resolved_complaints: string;
  avg_resolution_hours: string | null;
  total_ratings: string;
  avg_rating: string | null;
}


const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function TeamComparisonDashboard() {
  const [data, setData] = useState<TeamData[]>([]);
  const [filteredData, setFilteredData] = useState<TeamData[]>([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize date range with last 30 days
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    setStartDate(thirtyDaysAgoStr ?? '');
    setEndDate(todayStr ?? '');
  }, []);

  // Use tRPC query hook
  const { data: getTeamComparison, isLoading, error: queryError, refetch } = api.performanceMetrics.getTeamComparisonStats.useQuery(
    {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    {
      enabled: !!startDate && !!endDate, // Only run query when dates are set
    }
  );

  // Process API data
  useEffect(() => {
    if (queryError) {
      setError('Failed to fetch team comparison data');
      return;
    }

    if (getTeamComparison?.data?.teamComparison) {
      setData(getTeamComparison.data.teamComparison);
      setFilteredData(getTeamComparison.data.teamComparison);
      setSelectedTeams(getTeamComparison.data.teamComparison.map((team: TeamData) => team.team_id));
      
      if (getTeamComparison.data.dateRange) {
        const start = getTeamComparison.data.dateRange.startDate
          ? new Date(getTeamComparison.data.dateRange.startDate).toISOString().split('T')[0]
          : '';
        const end = getTeamComparison.data.dateRange.endDate
          ? new Date(getTeamComparison.data.dateRange.endDate).toISOString().split('T')[0]
          : '';
        setDateRange({ startDate: start ?? '', endDate: end ?? '' });   
      }
      
      setError(null);
    }
  }, [getTeamComparison, queryError]);

  const handleDateFilter = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    setError(null);
    
    // Trigger refetch with new dates
    await refetch();
  };

  const handleTeamFilter = (teamId: number) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  };

  const selectAllTeams = () => {
    setSelectedTeams(data.map(team => team.team_id));
  };

  const deselectAllTeams = () => {
    setSelectedTeams([]);
  };

  // Filter data based on selected teams
  useEffect(() => {
    if (selectedTeams.length === 0) {
      setFilteredData([]);
    } else {
      setFilteredData(data.filter(team => selectedTeams.includes(team.team_id)));
    }
  }, [selectedTeams, data]);

  // Data transformations for charts
  const complaintsData = filteredData.map(team => ({
    name: team.team_name.split(' ').slice(0, 2).join(' '),
    total: parseInt(team.total_complaints),
    resolved: parseInt(team.resolved_complaints),
    pending: parseInt(team.total_complaints) - parseInt(team.resolved_complaints),
    resolution_rate: parseInt(team.total_complaints) > 0 
      ? ((parseInt(team.resolved_complaints) / parseInt(team.total_complaints)) * 100).toFixed(1)
      : 0
  }));

  const resolutionTimeData = filteredData
    .filter(team => team.avg_resolution_hours !== null)
    .map(team => ({
      name: team.team_name.split(' ').slice(0, 2).join(' '),
      hours: parseFloat(team.avg_resolution_hours ?? '0').toFixed(2),
      complaints: parseInt(team.total_complaints)
    }));

  const ratingsData = filteredData
    .filter(team => team.avg_rating !== null)
    .map(team => ({
      name: team.team_name.split(' ').slice(0, 2).join(' '),
      rating: parseFloat(team.avg_rating ?? '0').toFixed(1),
      total_ratings: parseInt(team.total_ratings)
    }));

  const pieData = filteredData
    .filter(team => parseInt(team.total_complaints) > 0)
    .map(team => ({
      name: team.team_name,
      value: parseInt(team.total_complaints)
    }));

  // Summary statistics
  const totalComplaints = filteredData.reduce((sum, team) => sum + parseInt(team.total_complaints), 0);
  const totalResolved = filteredData.reduce((sum, team) => sum + parseInt(team.resolved_complaints), 0);
  const overallResolutionRate = totalComplaints > 0 ? ((totalResolved / totalComplaints) * 100).toFixed(1) : '0';
  const avgResolutionTime = filteredData
    .filter(team => team.avg_resolution_hours !== null)
    .reduce((sum, team, _, arr) => sum + parseFloat(team.avg_resolution_hours ?? '0') / arr.length, 0)
    .toFixed(2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team comparison data...</p>
        </div>
      </div>
    );
  }

  if (error || queryError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error ?? 'Failed to fetch team comparison data'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Performance Dashboard</h1>
          <p className="text-gray-600">Comprehensive analysis of team performance metrics and complaint resolution</p>
        </div>

        {/* Date and Team Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Date Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Date Range Filter</span>
              </div>
            </div>
            {error && error.includes('date') && (
              <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleDateFilter}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? 'Applying...' : 'Apply Filter'}
              </button>
            </div>
          </div>

          {/* Team Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Team Filter</span>
                <span className="text-sm text-gray-500">({selectedTeams.length} of {data.length} selected)</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllTeams}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAllTeams}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {data.map((team) => (
                <label key={team.team_id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.team_id)}
                    onChange={() => handleTeamFilter(team.team_id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 truncate">{team.team_name}</span>
                  <span className="text-xs text-gray-500 ml-auto">({team.total_complaints})</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-bold text-gray-900">{totalComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">{overallResolutionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-gray-900">{avgResolutionTime}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold text-gray-900">{selectedTeams.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Complaints Overview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints Overview by Team</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complaintsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="#3B82F6" name="Total Complaints" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                <Bar dataKey="pending" fill="#EF4444" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaints Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Resolution Time Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Resolution Time by Team</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${String(value)} hours`, 'Resolution Time']}

                />
                <Bar dataKey="hours" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Ratings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction Ratings</h3>
            {ratingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${String(value) } stars`, 'Average Rating']}
                  />
                  <Bar dataKey="rating" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-72 text-gray-500">
                <div className="text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No rating data available for the selected period</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Team Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Team Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Complaints
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolution Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Resolution Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((team) => {
                  const total = parseInt(team.total_complaints);
                  const resolved = parseInt(team.resolved_complaints);
                  const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';
                  const status = total === 0 ? 'Inactive' : resolutionRate === '100' ? 'Excellent' : parseFloat(resolutionRate) >= 80 ? 'Good' : parseFloat(resolutionRate) >= 50 ? 'Fair' : 'Needs Improvement';
                  
                  return (
                    <tr key={team.team_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{team.team_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{team.total_complaints}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{team.resolved_complaints}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resolutionRate}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {team.avg_resolution_hours 
                            ? `${parseFloat(team.avg_resolution_hours).toFixed(2)}h`
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {team.avg_rating ? (
                            <>
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-900">
                                {parseFloat(team.avg_rating).toFixed(1)} ({team.total_ratings} reviews)
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No ratings</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'Excellent' ? 'bg-green-100 text-green-800' :
                          status === 'Good' ? 'bg-blue-100 text-blue-800' :
                          status === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                          status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}