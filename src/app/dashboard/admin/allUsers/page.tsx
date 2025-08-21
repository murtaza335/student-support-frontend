'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, Users, Phone, Mail, MapPin, Calendar, Award, Eye, MoreVertical, ChevronDown, Loader } from 'lucide-react';
import { api } from '~/trpc/react';
import Image from 'next/image';
import type { User } from '~/types/user/allUsersSchema';

const UsersPage = () => {
  // Fetch users from API
  const { data: usersResponse, isLoading, error } = api.users.getAllUsers.useQuery();
  
  // Wrap users in its own useMemo to prevent exhaustive-deps warnings
  const users: User[] = useMemo(() => 
    usersResponse?.data?.users ?? [], 
    [usersResponse?.data?.users]
  );

  const [viewMode, setViewMode] = useState('grid');
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const roleColors: Record<string, string> = {
    employee: 'bg-blue-50 text-blue-700 border-blue-200',
    worker: 'bg-green-50 text-green-700 border-green-200',
    manager: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-red-50 text-red-700 border-red-200',
    user: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user: User) => {
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesSearch = searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.teamName?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesRole && matchesSearch;
    });

    return filtered.sort((a: User, b: User) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'points':
          return (b.points ?? 0) - (a.points ?? 0);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'joinDate':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [users, selectedRole, searchTerm, sortBy]);

  const roleStats = useMemo(() => {
    const stats: Record<string, number> = { employee: 0, worker: 0, manager: 0, admin: 0, user: 0, total: users.length };
    users.forEach((user: User) => {
      const roleCount = stats[user.role];
      if (roleCount !== undefined) {
        stats[user.role] = roleCount + 1;
      }
    });
    return stats;
  }, [users]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 touch-manipulation">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            { user?.picUrl ? (
            <Image
              src={user?.picUrl}
              alt={`${user.firstName} ${user.lastName}`}
              width={64}
              height={64}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=e5e7eb&color=374151&size=64`;
              }}
            />) : (
              <Image
                src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=e5e7eb&color=374151&size=64`}
                alt={`${user.firstName} ${user.lastName}`}
                width={64}
                height={64}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-100"
              />
            )}
            <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {user.designation ?? 'No designation'}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation flex-shrink-0">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
          <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
          <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>{user.phone}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{user.locationName ?? 'Not specified'}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
          <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">{user.teamName ?? 'No team assigned'}</span>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${roleColors[user.role] ?? roleColors.user}`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
        <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Award className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{user.points ?? 0} pts</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Points</th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Join Date</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <Image
                      src={user.picUrl ?? `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=e5e7eb&color=374151&size=40`}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={40}
                      height={40}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=e5e7eb&color=374151&size=40`;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${roleColors[user.role] ?? roleColors.user}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                  {user.department ?? 'N/A'}
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                  {user.locationName ?? 'N/A'}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                  {user.points ?? 0}
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
                  <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Organization Users</h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage and view all users across different roles</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-blue-50 rounded-full flex items-center justify-center">
              <Loader className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Loading Users</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center">
              Please wait while we fetch the user data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Organization Users</h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage and view all users across different roles</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Failed to load users</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
              There was an error loading the users data. Please check your connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Organization Users</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage and view all users across different roles</p>
            </div>
            <div className="flex items-center justify-end space-x-2 sm:space-x-4">
              {/* Mobile View Toggle */}
              <div className="sm:hidden flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors touch-manipulation ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors touch-manipulation ${
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Table view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              {/* Desktop View Toggle */}
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors touch-manipulation ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors touch-manipulation ${
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.total}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-50 rounded-md sm:rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Employees</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.employee}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-50 rounded-md sm:rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Workers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.worker}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-50 rounded-md sm:rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Managers</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{roleStats.manager}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-50 rounded-md sm:rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Search Bar - Always Visible */}
          <div className="relative mb-4 sm:mb-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm sm:text-base touch-manipulation"
            />
          </div>

          {/* Collapsible Filters for Mobile / Always Visible for Desktop */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pt-4 sm:pt-0">
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-manipulation bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="employee">Employees</option>
                  <option value="worker">Workers</option>
                  <option value="manager">Managers</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-manipulation bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="points">Sort by Points</option>
                  <option value="role">Sort by Role</option>
                  <option value="joinDate">Sort by Join Date</option>
                </select>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg sm:bg-transparent sm:px-0 sm:py-0">
                Showing {filteredAndSortedUsers.length} of {users.length} users
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <TableView />
        )}

        {/* Empty State */}
        {filteredAndSortedUsers.length === 0 && !isLoading && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
              {searchTerm || selectedRole !== 'all' 
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'No users are available at the moment.'
              }
            </p>
            {(searchTerm || selectedRole !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('all');
                }}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;