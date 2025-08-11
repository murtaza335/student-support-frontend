// 'use client';

import { P } from "node_modules/framer-motion/dist/types.d-Bq-Qm38R";

// import React, { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
// import { Calendar, FileText, CheckCircle, XCircle, RotateCcw, User, Clock, TrendingUp, type LucideIcon } from 'lucide-react';

// // Types
// interface OverviewStats {
//   totalTickets: number;
//   resolved: number;
//   closed: number;
//   reopened: number;
//   assigned: number;
//   waitingAssignment: number;
//   complete: number;
// }

// interface TeamStats {
//   name: string;
//   total: number;
//   reopened: number;
//   resolved: number;
// }

// interface StatCardProps {
//   title: string;
//   value: number;
//   percentage?: number;
//   icon: LucideIcon;
//   bgColor: string;
//   textColor: string;
//   iconColor: string;
// }

// // Components
// const StatCard: React.FC<StatCardProps> = ({ 
//   title, 
//   value, 
//   percentage, 
//   icon: Icon, 
//   bgColor, 
//   textColor, 
//   iconColor 
// }) => (
//   <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm text-gray-600 mb-1">{title}</p>
//         <p className={`text-3xl font-bold ${textColor}`}>{value.toLocaleString()}</p>
//         {percentage && (
//           <p className="text-sm text-gray-500 mt-1">{percentage}%</p>
//         )}
//       </div>
//       <div className={`p-3 rounded-lg ${bgColor}`}>
//         <Icon className={`w-6 h-6 ${iconColor}`} />
//       </div>
//     </div>
//   </div>
// );

// const AdminDashboard: React.FC = () => {
//   const [dateRange, setDateRange] = useState<string>('Last 30 Days');
//   const [overviewData, setOverviewData] = useState<OverviewStats>({
//     totalTickets: 1847,
//     resolved: 1234,
//     closed: 1167,
//     reopened: 67,
//     assigned: 289,
//     waitingAssignment: 324,
//     complete: 1098
//   });

//   const [teamData, setTeamData] = useState<TeamStats[]>([
//     { name: 'Frontend Team', total: 425, reopened: 18, resolved: 380 },
//     { name: 'Backend Team', total: 389, reopened: 22, resolved: 341 },
//     { name: 'DevOps Team', total: 278, reopened: 12, resolved: 251 },
//     { name: 'QA Team', total: 356, reopened: 9, resolved: 334 },
//     { name: 'Mobile Team', total: 399, reopened: 6, resolved: 368 }
//   ]);

//   const [loading, setLoading] = useState<boolean>(false);

//   // Simulated tRPC calls - replace with actual tRPC hooks
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // Example: const overviewStats = await trpc.dashboard.getOverviewStats.query({ dateRange });
//         // Example: const teamStats = await trpc.dashboard.getTeamStats.query({ dateRange });
//         // setOverviewData(overviewStats);
//         // setTeamData(teamStats);
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [dateRange]);

//   const dateRangeOptions = [
//     'Last 7 Days',
//     'Last 30 Days',
//     'Last 3 Months',
//     'Last 6 Months',
//     'Last Year'
//   ];

//   const calculatePercentage = (value: number, total: number): number => {
//     return Math.round((value / total) * 100);
//   };

//   const statsCards = [
//     {
//       title: 'Total Tickets',
//       value: overviewData.totalTickets,
//       icon: FileText,
//       bgColor: 'bg-blue-100',
//       textColor: 'text-blue-600',
//       iconColor: 'text-blue-600'
//     },
//     {
//       title: 'Resolved',
//       value: overviewData.resolved,
//       percentage: calculatePercentage(overviewData.resolved, overviewData.totalTickets),
//       icon: CheckCircle,
//       bgColor: 'bg-green-100',
//       textColor: 'text-green-600',
//       iconColor: 'text-green-600'
//     },
//     {
//       title: 'Closed',
//       value: overviewData.closed,
//       percentage: calculatePercentage(overviewData.closed, overviewData.totalTickets),
//       icon: XCircle,
//       bgColor: 'bg-green-100',
//       textColor: 'text-green-600',
//       iconColor: 'text-green-600'
//     },
//     {
//       title: 'Reopened',
//       value: overviewData.reopened,
//       percentage: calculatePercentage(overviewData.reopened, overviewData.totalTickets),
//       icon: RotateCcw,
//       bgColor: 'bg-yellow-100',
//       textColor: 'text-yellow-600',
//       iconColor: 'text-yellow-600'
//     },
//     {
//       title: 'Assigned',
//       value: overviewData.assigned,
//       percentage: calculatePercentage(overviewData.assigned, overviewData.totalTickets),
//       icon: User,
//       bgColor: 'bg-blue-100',
//       textColor: 'text-blue-600',
//       iconColor: 'text-blue-600'
//     },
//     {
//       title: 'Waiting Assignment',
//       value: overviewData.waitingAssignment,
//       percentage: calculatePercentage(overviewData.waitingAssignment, overviewData.totalTickets),
//       icon: Clock,
//       bgColor: 'bg-orange-100',
//       textColor: 'text-orange-600',
//       iconColor: 'text-orange-600'
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
//               <p className="text-gray-600 mt-1">Comprehensive overview of all tickets across locations, categories, and teams</p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2">
//                 <Calendar className="w-4 h-4 text-gray-500" />
//                 <select
//                   value={dateRange}
//                   onChange={(e) => setDateRange(e.target.value)}
//                   className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   {dateRangeOptions.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="p-6">
//         {/* Overall Statistics Section */}
//         <div className="mb-8">
//           <div className="flex items-center mb-6">
//             <FileText className="w-5 h-5 text-gray-700 mr-2" />
//             <h2 className="text-lg font-medium text-gray-900">Overall Ticket Statistics</h2>
//           </div>
          
//           {loading ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
//               {[...Array(6)].map((_, index) => (
//                 <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
//                   <div className="h-4 bg-gray-200 rounded mb-2"></div>
//                   <div className="h-8 bg-gray-200 rounded mb-1"></div>
//                   <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
//               {statsCards.map((stat, index) => (
//                 <StatCard key={index} {...stat} />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Team Performance Section */}
//         <div>
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <TrendingUp className="w-5 h-5 text-gray-700 mr-2" />
//               <h2 className="text-lg font-medium text-gray-900">Team Performance</h2>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Calendar className="w-4 h-4 text-gray-500" />
//               <select
//                 value={dateRange}
//                 onChange={(e) => setDateRange(e.target.value)}
//                 className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 {dateRangeOptions.map((option) => (
//                   <option key={option} value={option}>
//                     {option}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Total vs Reopened Tickets Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">Total vs Reopened Tickets</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={teamData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis 
//                     dataKey="name" 
//                     angle={-45}
//                     textAnchor="end"
//                     height={100}
//                     fontSize={12}
//                   />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="total" fill="#3B82F6" name="Total Tickets" />
//                   <Bar dataKey="reopened" fill="#F59E0B" name="Reopened Tickets" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Resolution Rate Chart */}
//             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">Team Resolution Trends</h3>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={teamData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis 
//                     dataKey="name"
//                     angle={-45}
//                     textAnchor="end"
//                     height={100}
//                     fontSize={12}
//                   />
//                   <YAxis />
//                   <Tooltip />
//                   <Line 
//                     type="monotone" 
//                     dataKey="resolved" 
//                     stroke="#10B981" 
//                     strokeWidth={2}
//                     name="Resolved Tickets"
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Team Statistics Table */}
//           <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900">Detailed Team Statistics</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Team
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Total Tickets
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Resolved
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Reopened
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Resolution Rate
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Reopen Rate
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {teamData.map((team, index) => {
//                     const resolutionRate = ((team.resolved / team.total) * 100).toFixed(1);
//                     const reopenRate = ((team.reopened / team.total) * 100).toFixed(1);
                    
//                     return (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {team.name}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {team.total.toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
//                           {team.resolved.toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
//                           {team.reopened.toLocaleString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           <div className="flex items-center">
//                             <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
//                               <div 
//                                 className="bg-green-500 h-2 rounded-full" 
//                                 style={{ width: `${resolutionRate}%` }}
//                               ></div>
//                             </div>
//                             <span className="text-xs">{resolutionRate}%</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
//                             parseFloat(reopenRate) < 5 
//                               ? 'bg-green-100 text-green-800' 
//                               : parseFloat(reopenRate) < 10 
//                               ? 'bg-yellow-100 text-yellow-800' 
//                               : 'bg-red-100 text-red-800'
//                           }`}>
//                             {reopenRate}%
//                           </span>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

function AdminDashboard() {

  return (
    <p>this is an admin dashboard home page</p>
  );
}

export default AdminDashboard;