'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import RegularUserForm from '../_components/userProfileForm/EmployeeForm';
import SupportTeamForm from '../_components/userProfileForm/SupportTeamForm';

import type { SupportStaffMember } from '~/types/user/supportStaffMemberSchema';
import type { NustEmployee } from '~/types/user/nustEmployeeSchema';
import { supportStaffRolesEnum } from '~/types/enums';
import { User, Shield } from 'lucide-react';
import Loader from '../_components/Loader';
import { useRouter } from 'next/navigation';

const defaultNustEmployee: NustEmployee = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  is_approved: false,
  createdAt: '',
  updatedAt: '',
  locationId: '',
  role: '',
  officeNumber: '',
  department: '',
  designation: '',
};

const defaultSupportStaff: SupportStaffMember = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  is_approved: false,
  createdAt: '',
  updatedAt: '',
  department: '',
  role: 'worker',
  teamId: '',
};

const UserProfileForm = () => {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [userType, setUserType] = useState<'employee' | 'support'>('employee');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Just return null if not authenticated - let middleware handle redirect
  if (!isLoaded) {
    return null; // Minimal loading - just wait for auth to load
  }

  if (!isSignedIn || !user) {
    return null; // No loading screen - middleware will redirect immediately
  }


  const handleSubmit = async (data: Partial<SupportStaffMember | NustEmployee>) => {
    setIsSubmitting(true);
    try {

    } catch (error) {
      // console.error('Profile creation failed:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserTypeSwitch = (newType: 'employee' | 'support') => {
    if (newType === userType) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setUserType(newType);
      setIsTransitioning(false);
    }, 150);
  };

  // Only show registration form
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-full shadow">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Profile Setup</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 mt-4">Welcome to NUST Portal</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Complete your profile to get started. Choose the option that best describes your role.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="bg-white p-2 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUserTypeSwitch('employee')}
                disabled={isTransitioning}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[160px] justify-center ${userType === 'employee' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <User className="w-4 h-4" />
                <span>Regular User</span>
              </button>
              <button
                onClick={() => handleUserTypeSwitch('support')}
                disabled={isTransitioning}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 min-w-[160px] justify-center ${userType === 'support' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Shield className="w-4 h-4" />
                <span>Support Team</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`max-w-5xl mx-auto transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {/* Form submission loading overlay */}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Profile</h3>
                  <p className="text-gray-600">Please wait while we set up your account...</p>
                </div>
              </div>
            </div>
          )}

          {/* User type transition loading overlay */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-2xl">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Loader />
                </div>
                <p className="text-sm text-gray-600">Switching form...</p>
              </div>
            </div>
          )}
          
          {userType === 'support' ? (
            <SupportTeamForm
              initialUser={defaultSupportStaff}
              roleOptions={supportStaffRolesEnum.options}
              onSubmit={handleSubmit}
              onSwitch={() => handleUserTypeSwitch('employee')}
            />
          ) : (
            <RegularUserForm
              initialUser={defaultNustEmployee}
              onSubmit={handleSubmit}
              onSwitch={() => handleUserTypeSwitch('support')}
            />
          )}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600">
            <div 
              className={`w-2 h-2 rounded-full ${
                isSubmitting 
                  ? 'bg-blue-500 animate-bounce' 
                  : isTransitioning 
                    ? 'bg-yellow-500 animate-pulse' 
                    : 'bg-green-500 animate-pulse'
              }`}
            ></div>
            <span>
              {isSubmitting 
                ? 'Creating your profile...' 
                : isTransitioning 
                  ? 'Switching forms...' 
                  : 'Secure registration powered by NUST ICT'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
