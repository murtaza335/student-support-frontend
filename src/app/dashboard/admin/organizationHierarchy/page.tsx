'use client';

import React, { useState } from 'react';
import { 
  Users, User, Crown, Plus, Edit, Trash2, Settings, Search, Filter,
  ChevronDown, ChevronRight, Mail, Phone, MapPin, Calendar, Clock,
  UserPlus, UserMinus, Shield, Eye, EyeOff, Save, X, Check
} from 'lucide-react';

// Type definitions
interface Privileges {
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canEditTasks: boolean;
  canViewReports: boolean;
  canManageBudget: boolean;
  canAccessSettings: boolean;
}

interface Manager {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  privileges: Privileges;
}

interface Member {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  avatar: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdDate: string;
  manager: Manager;
  members: Member[];
}

interface AvailableManager {
  id: number;
  name: string;
  email: string;
  avatar: string;
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

  // Mock data with proper typing
  const [teamsData, setTeamsData] = useState<Team[]>([
    {
      id: 1,
      name: "Frontend Development",
      description: "User interface and experience team",
      status: "active",
      createdDate: "2024-01-15",
      manager: {
        id: 101,
        name: "Sarah Johnson",
        email: "sarah.j@company.com",
        phone: "+1 234-567-8901",
        avatar: "SJ",
        joinDate: "2023-12-01",
        privileges: {
          canAddMembers: true,
          canRemoveMembers: true,
          canEditTasks: true,
          canViewReports: true,
          canManageBudget: false,
          canAccessSettings: true
        }
      },
      members: [
        { id: 201, name: "Alex Chen", role: "Senior Frontend Developer", email: "alex@company.com", phone: "+1 234-567-8902", status: "active", joinDate: "2024-01-20", avatar: "AC" },
        { id: 202, name: "Maria Garcia", role: "UI/UX Designer", email: "maria@company.com", phone: "+1 234-567-8903", status: "active", joinDate: "2024-02-10", avatar: "MG" },
        { id: 203, name: "Tom Wilson", role: "React Developer", email: "tom@company.com", phone: "+1 234-567-8904", status: "active", joinDate: "2024-02-15", avatar: "TW" },
      ]
    },
    {
      id: 2,
      name: "Backend Development",
      description: "Server-side and database management",
      status: "active",
      createdDate: "2024-01-10",
      manager: {
        id: 102,
        name: "Michael Rodriguez",
        email: "michael.r@company.com",
        phone: "+1 234-567-8905",
        avatar: "MR",
        joinDate: "2023-11-15",
        privileges: {
          canAddMembers: true,
          canRemoveMembers: true,
          canEditTasks: true,
          canViewReports: true,
          canManageBudget: true,
          canAccessSettings: true
        }
      },
      members: [
        { id: 204, name: "Emily Davis", role: "Senior Backend Developer", email: "emily@company.com", phone: "+1 234-567-8906", status: "active", joinDate: "2024-01-25", avatar: "ED" },
        { id: 205, name: "James Anderson", role: "Database Admin", email: "james@company.com", phone: "+1 234-567-8907", status: "active", joinDate: "2024-02-01", avatar: "JA" },
      ]
    },
    {
      id: 3,
      name: "Quality Assurance",
      description: "Testing and quality control team",
      status: "active",
      createdDate: "2024-01-20",
      manager: {
        id: 103,
        name: "Lisa Park",
        email: "lisa.p@company.com",
        phone: "+1 234-567-8908",
        avatar: "LP",
        joinDate: "2024-01-05",
        privileges: {
          canAddMembers: true,
          canRemoveMembers: false,
          canEditTasks: true,
          canViewReports: true,
          canManageBudget: false,
          canAccessSettings: false
        }
      },
      members: [
        { id: 206, name: "David Kim", role: "QA Engineer", email: "david@company.com", phone: "+1 234-567-8909", status: "active", joinDate: "2024-01-28", avatar: "DK" },
        { id: 207, name: "Rachel Green", role: "Test Automation Engineer", email: "rachel@company.com", phone: "+1 234-567-8910", status: "active", joinDate: "2024-02-05", avatar: "RG" },
        { id: 208, name: "Kevin Brown", role: "Manual Tester", email: "kevin@company.com", phone: "+1 234-567-8911", status: "inactive", joinDate: "2024-01-30", avatar: "KB" },
      ]
    },
    {
      id: 4,
      name: "DevOps & Infrastructure",
      description: "Deployment and infrastructure management",
      status: "active",
      createdDate: "2024-02-01",
      manager: {
        id: 104,
        name: "Robert Taylor",
        email: "robert.t@company.com",
        phone: "+1 234-567-8912",
        avatar: "RT",
        joinDate: "2023-10-20",
        privileges: {
          canAddMembers: true,
          canRemoveMembers: true,
          canEditTasks: true,
          canViewReports: true,
          canManageBudget: true,
          canAccessSettings: true
        }
      },
      members: [
        { id: 209, name: "Sophie Martinez", role: "DevOps Engineer", email: "sophie@company.com", phone: "+1 234-567-8913", status: "active", joinDate: "2024-02-02", avatar: "SM" },
        { id: 210, name: "Chris Lee", role: "Cloud Architect", email: "chris@company.com", phone: "+1 234-567-8914", status: "active", joinDate: "2024-02-08", avatar: "CL" },
      ]
    },
    {
      id: 5,
      name: "Product Management",
      description: "Product strategy and roadmap planning",
      status: "active",
      createdDate: "2024-01-05",
      manager: {
        id: 105,
        name: "Jennifer White",
        email: "jennifer.w@company.com",
        phone: "+1 234-567-8915",
        avatar: "JW",
        joinDate: "2023-12-15",
        privileges: {
          canAddMembers: true,
          canRemoveMembers: true,
          canEditTasks: true,
          canViewReports: true,
          canManageBudget: true,
          canAccessSettings: true
        }
      },
      members: [
        { id: 211, name: "Andrew Davis", role: "Product Manager", email: "andrew@company.com", phone: "+1 234-567-8916", status: "active", joinDate: "2024-01-12", avatar: "AD" },
        { id: 212, name: "Nina Patel", role: "Business Analyst", email: "nina@company.com", phone: "+1 234-567-8917", status: "active", joinDate: "2024-01-18", avatar: "NP" },
      ]
    }
  ]);

  const [availableManagers] = useState<AvailableManager[]>([
    { id: 301, name: "John Smith", email: "john@company.com", avatar: "JS" },
    { id: 302, name: "Emma Johnson", email: "emma@company.com", avatar: "EJ" },
    { id: 303, name: "Ryan Thompson", email: "ryan@company.com", avatar: "RT" },
  ]);

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

  const getStatusColor = (status: 'active' | 'inactive'): string => {
    return status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const closeModal = (): void => {
    setActiveModal(null);
    setSelectedTeam(null);
    setSelectedManager(null);
  };

  const openModal = (modalType: ModalType, team?: Team, manager?: Manager): void => {
    setActiveModal(modalType);
    if (team) setSelectedTeam(team);
    if (manager) setSelectedManager(manager);
  };

  // Filtered teams with proper typing
  const filteredTeams: Team[] = teamsData.filter((team: Team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.manager.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Statistics with proper typing
  const totalMembers: number = teamsData.reduce((acc: number, team: Team) => acc + team.members.length, 0);
  const activeTeams: number = teamsData.filter((team: Team) => team.status === 'active').length;

  // Modal Components with proper typing
  const AddTeamModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Add New Team</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Team Name" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <textarea placeholder="Description" className="w-full p-3 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm resize-none"></textarea>
          <select className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="">Select Manager</option>
            {availableManagers.map((manager: AvailableManager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl">
            Create Team
          </button>
          <button 
            onClick={closeModal}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const EditManagerModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Change Team Manager</h3>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            Current Manager: <span className="font-medium">{selectedTeam?.manager?.name}</span>
          </div>
          <select className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="">Select New Manager</option>
            {availableManagers.map((manager: AvailableManager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl">
            Update Manager
          </button>
          <button 
            onClick={closeModal}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const PrivilegesModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Manager Privileges - {selectedManager?.name}</h3>
        <div className="space-y-4">
          {selectedManager?.privileges && Object.entries(selectedManager.privileges).map(([key, value]: [string, boolean]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl shadow-sm">
              <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={value} className="sr-only" />
                <div className={`w-12 h-6 rounded-full ${value ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors shadow-inner`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-md ${value ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </div>
              </label>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl">
            Save Changes
          </button>
          <button 
            onClick={closeModal}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const AddMemberModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Member Name" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <input type="tel" placeholder="Phone Number" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <input type="text" placeholder="Role/Position" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <select className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="">Select Team</option>
            {teamsData.map((team: Team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl">
            Add Member
          </button>
          <button 
            onClick={closeModal}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Header with Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
            <p className="text-gray-600">Manage teams, assign managers, and control member access</p>
          </div>
          
          {/* Action Buttons - Top Right on Desktop, Below Header on Mobile */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            <button
              onClick={() => openModal('addTeam')}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </button>
            <button
              onClick={() => openModal('addMember')}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </button>
            <button className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teamsData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl mr-4">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl mr-4">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Managers</p>
              <p className="text-2xl font-bold text-gray-900">{teamsData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl mr-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900">{activeTeams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teams or managers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-auto shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-6">
        {filteredTeams.map((team: Team) => {
          const isExpanded: boolean = expandedTeams.has(team.id);
          return (
            <div key={team.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all">
              {/* Team Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors"
                onClick={() => toggleTeamExpansion(team.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="mr-4">
                      {isExpanded ? 
                        <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                    <div className="mr-5">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{team.name}</h3>
                      <p className="text-gray-600 truncate mt-1">{team.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(team.status)}`}>
                          {team.status}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Created: {team.createdDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm text-gray-600 hidden sm:block font-medium bg-gray-100 px-3 py-1 rounded-lg">
                      {team.members.length} members
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openModal('editManager', team);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Change Manager"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          openModal('privileges', undefined, team.manager);
                        }}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Privileges"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-b-2xl">
                  {/* Manager Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                      <Crown className="w-5 h-5 mr-3 text-yellow-500" />
                      Team Manager
                    </h4>
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center flex-1">
                          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-5 shadow-lg">
                            {team.manager.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 text-lg">{team.manager.name}</h5>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600 mt-2">
                              <span className="flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                {team.manager.email}
                              </span>
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {team.manager.phone}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-2 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Joined: {team.manager.joinDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => openModal('editManager', team)}
                            className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium shadow-sm"
                          >
                            Change
                          </button>
                          <button
                            onClick={() => openModal('privileges', undefined, team.manager)}
                            className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium shadow-sm"
                          >
                            Privileges
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold text-gray-700 flex items-center">
                        <Users className="w-5 h-5 mr-3" />
                        Team Members ({team.members.length})
                      </h4>
                      <button
                        onClick={() => openModal('addMember', team)}
                        className="text-sm px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium shadow-sm"
                      >
                        Add Member
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {team.members.map((member: Member) => (
                        <div key={member.id} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0 shadow-md">
                                {member.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-900 truncate">{member.name}</h5>
                                <p className="text-sm text-gray-600 truncate mt-1">{member.role}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(member.status)}`}>
                                    {member.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-3">
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 text-xs text-gray-500 space-y-2 bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center truncate">
                              <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span className="truncate">{member.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                              <span>Joined: {member.joinDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {team.members.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 text-lg font-medium">No team members yet</p>
                        <button
                          onClick={() => openModal('addMember', team)}
                          className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Add first member
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Team Actions */}
                  <div className="mt-8 pt-6 flex flex-wrap gap-3">
                    <button className="px-5 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium shadow-sm">
                      View Reports
                    </button>
                    <button className="px-5 py-2 text-sm bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium shadow-sm">
                      Team Settings
                    </button>
                    <button className="px-5 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors font-medium shadow-sm">
                      Performance
                    </button>
                    <button className="px-5 py-2 text-sm bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium shadow-sm ml-auto">
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
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Users className="w-20 h-20 mx-auto mb-6 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-3">No teams found</h3>
          <p className="text-gray-600 mb-6 text-lg">
            {searchTerm || filterStatus !== 'all' 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by creating your first team"
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => openModal('addTeam')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create First Team
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {activeModal === 'addTeam' && <AddTeamModal />}
      {activeModal === 'editManager' && <EditManagerModal />}
      {activeModal === 'privileges' && <PrivilegesModal />}
      {activeModal === 'addMember' && <AddMemberModal />}
    </div>
  );
};

export default TeamManagementDashboard;