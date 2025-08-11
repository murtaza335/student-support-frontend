'use client';

import React, { useState } from 'react';
import {
  Users, User, Crown, Plus, Edit, Settings, Search,
  ChevronDown, ChevronRight, Mail, Phone, Calendar, Clock,
  UserPlus, UserMinus
} from 'lucide-react';
import { api } from '~/trpc/react';
import Image from 'next/image';

import { AddTeamModal } from './AddTeamModal';
import { EditManagerModal } from './EditManagerModal';
import { PrivilegesModal } from './PrivilegesModal';
import { AddMemberModal } from './AddMemeberModal';
import type { Team } from '~/types/responseTypes/adminDashResponses/adminDashResponses';
import type { Manager } from '~/types/responseTypes/adminDashResponses/adminDashResponses';
import type { Member } from '~/types/responseTypes/adminDashResponses/adminDashResponses';

export interface AvailableManager {
  id: number;
  name: string;
  email: string;
  picUrl: string;
}

type FilterStatus = 'all' | 'active' | 'inactive';
type ModalType = 'addTeam' | 'editManager' | 'privileges' | 'addMember' | null;

const TeamManagementDashboard: React.FC = () => {
  // State management with proper typing
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set([1]));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // api call for the team hierarchy
  const { data: getTeamHierarchyResponse, isLoading } = api.teams.getTeamHierarchy.useQuery();

  // const [teamsData, setTeamsData] = useState<Team[]>(getTeamHierarchyResponse?.data?.teams ?? []);

  const teamsData: Team[] = getTeamHierarchyResponse?.data?.teams ?? [];


  console.log('[TeamManagementDashboard] Initial teams data:', teamsData);

  // Helper functions with proper typing
  const toggleTeamExpansion = (teamId: number): void => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getStatusColor = (status: 'active' | 'busy'): string => {
    return status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const closeModal = (): void => {
    setActiveModal(null);
    setSelectedTeam(null);
    setSelectedManager(null);
  };

  const openModal = (modalType: ModalType, team?: Team, manager?: Manager | null): void => {
    setActiveModal(modalType);
    if (team) setSelectedTeam(team);
    if (manager) setSelectedManager(manager);
  };

  // Filtered teams with proper typing
  const filteredTeams: Team[] = teamsData.filter((team: Team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team?.manager?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Statistics with proper typing
  const totalMembers: number = teamsData.reduce((acc: number, team: Team) => acc + team.members.length, 0);

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header with Action Buttons */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1 sm:mb-2">Team Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage teams, assign managers, and control member access</p>
          </div>

          {/* Action Buttons - Stack on mobile, row on larger screens */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
            <button
              onClick={() => openModal('addTeam')}
              className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Add Team</span>
            </button>
            <button
              onClick={() => openModal('addMember')}
              className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Add Member</span>
            </button>
            <button className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm hover:shadow-md">
              <Settings className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg mr-3 sm:mr-4">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Teams</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{teamsData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg mr-3 sm:mr-4">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Members</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{totalMembers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-50 rounded-lg mr-3 sm:mr-4">
              <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Managers</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{teamsData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-orange-50 rounded-lg mr-3 sm:mr-4">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Active Status</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teams or managers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg w-full border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none sm:w-auto text-sm sm:text-base"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4 sm:space-y-6">
        {filteredTeams.map((team: Team) => {
          const isExpanded: boolean = expandedTeams.has(team.id);
          return (
            <div key={team.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Team Header */}
              <div
                className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => toggleTeamExpansion(team.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="mr-3 sm:mr-4">
                      {isExpanded ?
                        <ChevronDown className="w-5 h-5 text-gray-400" /> :
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                    <div className="mr-3 sm:mr-5">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{team.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 truncate mt-1">{team.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                        <span className="text-xs sm:text-sm text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Created: {team.createdDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
                    <span className="text-xs sm:text-sm text-gray-600 hidden sm:block font-medium bg-gray-100 px-2 sm:px-3 py-1 rounded-md">
                      {team.members.length} members
                    </span>
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openModal('editManager', team);
                        }}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Change Manager"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openModal('privileges', undefined, team?.manager ?? undefined);
                        }}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                        title="Edit Privileges"
                      >
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-b-lg border-t border-gray-100">
                  {/* Manager Section */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-yellow-500" />
                      Team Manager
                    </h4>
                    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm sm:text-lg mr-3 sm:mr-5 shadow-sm flex-shrink-0">
                            {team?.manager?.picUrl ? (
                              <Image 
                                src={team.manager.picUrl} 
                                alt={team.manager.name} 
                                width={56} 
                                height={56} 
                                className="rounded-lg object-cover w-full h-full" 
                              />
                            ) : (
                              team?.manager?.name?.charAt(0)?.toUpperCase() ?? 'M'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{team?.manager?.name}</h5>
                            <div className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                              <span className="flex items-center truncate">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                {team?.manager?.email}
                              </span>
                              <span className="flex items-center truncate">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                                {team?.manager?.phone ?? 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => openModal('editManager', team)}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                          >
                            Change
                          </button>
                          <button
                            onClick={() => openModal('privileges', undefined, team.manager ?? undefined)}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                          >
                            Privileges
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-700 flex items-center">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                        Team Members ({team.members.length})
                      </h4>
                      <button
                        onClick={() => openModal('addMember', team)}
                        className="text-xs sm:text-sm px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        Add Member
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {team.members.map((member: Member) => (
                        <div key={member.id} className="bg-white rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm mr-3 sm:mr-4 flex-shrink-0 shadow-sm">
                                {member.picUrl ? (
                                  <Image 
                                    src={member.picUrl} 
                                    alt={member.name} 
                                    width={48} 
                                    height={48} 
                                    className="rounded-lg object-cover w-full h-full" 
                                  />
                                ) : (
                                  member.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{member.name}</h5>
                                <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">{member.role}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${getStatusColor(member.status)}`}>
                                    {member.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2 sm:ml-3">
                              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                <UserMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 sm:mt-4 text-xs text-gray-500 space-y-1 sm:space-y-2 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            <div className="flex items-center truncate">
                              <Mail className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <Phone className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">{member.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 sm:mr-2 flex-shrink-0" />
                              <span>Joined: {member.joinDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {team.members.length === 0 && (
                      <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
                        <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                        <p className="text-gray-500 text-base sm:text-lg font-medium">No team members yet</p>
                        <button
                          onClick={() => openModal('addMember', team)}
                          className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Add first member
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Team Actions */}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 flex flex-wrap gap-2 sm:gap-3">
                    <button className="px-3 sm:px-5 py-2 text-xs sm:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                      View Reports
                    </button>
                    <button className="px-3 sm:px-5 py-2 text-xs sm:text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium">
                      Team Settings
                    </button>
                    <button className="px-3 sm:px-5 py-2 text-xs sm:text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium">
                      Performance
                    </button>
                    <button className="px-3 sm:px-5 py-2 text-xs sm:text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium ml-auto">
                      Archive Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
          <Users className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No teams found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            {searchTerm || filterStatus !== 'all'
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first team"
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => openModal('addTeam')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Create First Team
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {/* {activeModal === 'addTeam' && <AddTeamModal availableManagers={availableManagers} closeModal={closeModal} />}
      {activeModal === 'editManager' && <EditManagerModal closeModal={closeModal} availableManagers={availableManagers} />} */}
      {activeModal === 'privileges' && <PrivilegesModal selectedManager={selectedManager ?? undefined} closeModal={closeModal} />}
      {activeModal === 'addMember' && <AddMemberModal teamsData={teamsData} closeModal={closeModal} />}
    </div>
  );
};

export default TeamManagementDashboard;