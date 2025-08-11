'use client';

import React from 'react';
import type { Team } from '~/types/responseTypes/adminDashResponses/adminDashResponses';

interface AddMemberModalProps { 
    closeModal: () => void;
    teamsData: Team[];
};
export const AddMemberModal: React.FC<AddMemberModalProps> = ({ closeModal, teamsData }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Member Name" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <input type="tel" placeholder="Phone Number" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <input type="text" placeholder="Role/Position" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          {/* <select className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="">Select Team</option>
            {teamsData.map((team: Team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select> */}
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