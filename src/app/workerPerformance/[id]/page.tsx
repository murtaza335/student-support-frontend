'use client';

import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock, User, Star, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { api } from '~/trpc/react';


interface TooltipPayloadEntry {
    color: string;
    name: string;
    value: number | string;
    dataKey: string;
    payload: Record<string, unknown>;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
}

const WorkerPerformanceDashboard: React.FC = () => {
    const params = useParams();
    const workerId = params?.id as string || '16';
    const [queryParams, setQueryParams] = useState({
        workerId,
        startDate: '', // ISO format string e.g., "2025-07-08"
        endDate: ''
    });

    const [dateRange, setDateRange] = useState({
        startDate: '', // ISO format string e.g., "2025-07-08"
        endDate: ''    // same format
    });

    // api call for the worker performance metrics
    const { data: getWorkerPerformanceMetricsResponse, refetch, isLoading } =
        api.performanceMetrics.getWorkerPerformanceMetrics.useQuery(
            queryParams,
            {
                enabled: true,
            }
        );
    //  extracting the data object from the response
    const workerPerformance = getWorkerPerformanceMetricsResponse?.data;


    // initially set the date range from the worker performance data
    useEffect(() => {
        if (workerPerformance?.dateRange) {
            setDateRange({
                startDate: workerPerformance?.dateRange?.startDate.split('T')[0] ?? '',
                endDate: workerPerformance?.dateRange?.endDate.split('T')[0] ?? ''
            });
        }
    }, [workerPerformance]);

    const refetchData = () => {
        setQueryParams({
            workerId,
            endDate: dateRange.endDate ?? null,
            startDate: dateRange.startDate ?? null
        });
        void refetch();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading worker performance data...</p>
                </div>
            </div>
        );
    }

    if (!workerPerformance) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Worker Not Found</h2>
                    <p className="text-gray-600">No performance data available for worker ID: {workerId}</p>
                </div>
            </div>
        );
    }



    // Prepare chart data
    const statusChartData = [
        { name: 'Resolved', value: parseInt(workerPerformance?.statusCounts?.resolved ?? '0'), color: '#10b981' },
        { name: 'In Queue', value: parseInt(workerPerformance?.statusCounts?.inQueue ?? '0'), color: '#f59e0b' },
        { name: 'Active', value: parseInt(workerPerformance?.statusCounts?.active ?? '0'), color: '#3b82f6' }
    ].filter(item => item.value > 0);

    const priorityChartData = workerPerformance?.priorityBreakdown?.map(item => ({
        priority: item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
        count: parseInt(item.count),
        avgHours: parseFloat(item.avg_hours ?? '0'),
        color: {
            'Urgent': '#ef4444',
            'High': '#f97316',
            'Medium': '#eab308',
            'Low': '#22c55e'
        }[item.priority.charAt(0).toUpperCase() + item.priority.slice(1)] ?? '#6b7280'
    }));

    const resolutionTimeData = [
        { name: 'Minimum', hours: workerPerformance.timeMetrics.minResolutionHours },
        { name: 'Average', hours: workerPerformance.timeMetrics.averageResolutionHours },
        { name: 'Maximum', hours: workerPerformance.timeMetrics.maxResolutionHours }
    ];

    const qualityMetricsData = [
        { name: 'Completed Successfully', value: parseInt(workerPerformance.reopenMetrics.totalResolved ?? '0') - parseInt(workerPerformance.reopenMetrics.reopenedCount ?? '0') },
        { name: 'Reopened', value: parseInt(workerPerformance.reopenMetrics.reopenedCount ?? '0') }
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'available': return 'bg-green-100 text-green-800 border-green-200';
            case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatHours = (hours: number | string | null) => {
        if (hours === null || hours === undefined || (typeof hours === 'string' && hours.trim() === '')) {
            return 'N/A';
        }
        const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
        return `${numHours.toFixed(1)}h`;
    };


    //   tooltip for all the graphs
    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'avgHours' ? formatHours(entry.value) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Performance Dashboard</h1>
                            <p className="text-gray-600">
                                Performance metrics from {formatDate(workerPerformance.dateRange.startDate)} to {formatDate(workerPerformance.dateRange.endDate)}
                            </p>
                            <div className="flex space-x-4 mb-6">
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="border rounded p-2"
                                />
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="border rounded p-2"
                                />
                                <button
                                    onClick={() => refetchData()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Worker ID</p>
                            <p className="text-lg font-semibold text-blue-600">{workerId}</p>
                        </div>
                    </div>
                </div>

                {/* Worker Info Card */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Worker #{workerPerformance.worker.teamWorkerId}</h2>
                                <p className="text-gray-600">Team ID: {workerPerformance.worker.teamId} • Worker ID: {workerPerformance.worker.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{workerPerformance.worker.points}</p>
                                <p className="text-sm text-gray-500">Points</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(workerPerformance.worker.currentStatus)}`}>
                                {workerPerformance.worker.currentStatus}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{workerPerformance.timeMetrics.totalCompleted}</p>
                                <p className="text-sm text-gray-600">Total Completed</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{formatHours(workerPerformance.timeMetrics.averageResolutionHours)}</p>
                                <p className="text-sm text-gray-600">Avg Resolution Time</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <Target className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{workerPerformance.statusCounts.totalAssigned}</p>
                                <p className="text-sm text-gray-600">Total Assigned</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center">
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{(workerPerformance.reopenMetrics.reopenPercentage ?? 0).toFixed(1)}%</p>
                                <p className="text-sm text-gray-600">Reopen Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Task Status Chart */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Priority Breakdown Chart */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={priorityChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="priority" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Task Count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Resolution Time Analysis */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Time Analysis</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={resolutionTimeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatHours(value as number), 'Hours']} />
                                <Area type="monotone" dataKey="hours" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Priority vs Time Chart */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority vs Average Resolution Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={priorityChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="priority" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="avgHours" name="avgHours" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quality Metrics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Task Quality Chart */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Quality Overview</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={qualityMetricsData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value, percent }) => `${name}: ${value}${typeof percent === 'number' ? ` (${(percent * 100).toFixed(0)}%)` : ''}`}
                                >
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Ratings & Detailed Metrics */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                        <div className="space-y-4">
                            {/* Performance Score Visual */}
                            <div className="text-center mb-6">
                                {parseInt(workerPerformance.ratings.totalRatings ?? '0') === 0 ? (
                                    <div className="text-gray-500">
                                        <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                        <p>No ratings available yet</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex justify-center items-center mb-2">
                                            <Star className="h-6 w-6 text-yellow-400 fill-current" />
                                            <span className="text-2xl font-bold ml-2">{workerPerformance.ratings.averageRating}</span>
                                        </div>
                                        <p className="text-gray-600">{workerPerformance?.ratings?.totalRatings ?? '0'} ratings</p>
                                    </div>
                                )}
                            </div>

                            {/* Key Metrics */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <span className="text-gray-600">Total Tasks</span>
                                    <span className="font-semibold">{workerPerformance.statusCounts.totalAssigned}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                    <span className="text-gray-600">Completion Rate</span>
                                    <span className="font-semibold text-green-600">
                                        {((parseInt(workerPerformance?.statusCounts?.resolved ?? '0') / parseInt(workerPerformance?.statusCounts?.totalAssigned ?? '0')) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                    <span className="text-gray-600">Average Resolution</span>
                                    <span className="font-semibold text-blue-600">{formatHours(workerPerformance?.timeMetrics?.averageResolutionHours)}</span>
                                </div>
                                <div className={`flex justify-between items-center p-3 rounded ${workerPerformance?.reopenMetrics?.reopenPercentage ?? 0 > 50 ? 'bg-red-50' : workerPerformance?.reopenMetrics?.reopenPercentage ?? 0 > 25 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                                    <span className="text-gray-600">Reopen Rate</span>
                                    <span className={`font-semibold ${workerPerformance?.reopenMetrics?.reopenPercentage ?? 0 > 50 ? 'text-red-600' : workerPerformance?.reopenMetrics?.reopenPercentage ?? 0 > 25 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {workerPerformance?.reopenMetrics?.reopenPercentage?.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkerPerformanceDashboard;