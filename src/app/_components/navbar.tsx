'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import NotificationsComponent from './notifications';
import Image from 'next/image';
import { useClerk } from '@clerk/nextjs';
import { api } from '~/trpc/react';

const Navbar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const utils = api.useUtils();

    const handleSignOut = async () => {
          // First clear tRPC cache
    await utils.auth.loginCheck.reset();

    // Then sign the user out
    await signOut({ redirectUrl: '/' }); 
  };

  return (
    <header className="w-full fixed top-0 h-16 bg-white px-4 sm:px-6 flex items-center justify-between z-50 md:left-16 md:w-[calc(100%-4rem)] border-b border-gray-200">

      {/* Left Section - Mobile Optimized */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
            <Image src="/nust-seeklogo.png" alt="NUST Logo" className="w-6 h-6 sm:w-8 sm:h-8" width={48} height={48}/>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900">NSS</h1>
            <p className="text-xs text-gray-500">Support System</p>
          </div>
          {/* Mobile: Show abbreviated title */}
          <div className="block sm:hidden">
            <h1 className="text-lg font-bold text-gray-900">NSS</h1>
          </div>
        </div>
      </div>

      {/* Right Section - Mobile Optimized */}
      {user && (
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Component */}
          <NotificationsComponent />

          {/* Logout - Mobile Optimized */}
          <div className="relative">
            {/* <SignOutButton
            > */}
              <button
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
                title="Logout"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            {/* </SignOutButton> */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;