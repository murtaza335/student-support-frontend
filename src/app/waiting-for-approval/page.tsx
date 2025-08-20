import React from 'react';
import { Mail } from 'lucide-react';

const ApprovalWaitingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-8">
          <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20"></div>
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center relative z-10">
            <span className="text-white text-xl font-bold">!</span>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
          Waiting for Approval
        </h1>
        <p className="text-lg text-gray-600 font-light mb-4">
          Your request is being reviewed
        </p>
        <p className="text-sm text-red-500 flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          You will be notified via email once approved
        </p>
      </div>
    </div>
  );
};

export default ApprovalWaitingScreen;