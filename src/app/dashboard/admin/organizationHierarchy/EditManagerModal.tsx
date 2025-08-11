'use client';

import React from "react";
import type { AvailableManager } from './page'; // Adjust the import path as necessary

interface EditManagerModalProps {
    closeModal: () => void;
    availableManagers: AvailableManager[];
    selectedTeam?: { manager?: { name: string } };
}

export const EditManagerModal: React.FC<EditManagerModalProps> = ({ closeModal, availableManagers, selectedTeam }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Change Team Manager</h3>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            Current Manager: <span className="font-medium">{selectedTeam?.manager?.name}</span>
          </div>
          {/* <select className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="">Select New Manager</option>
            {availableManagers.map((manager: AvailableManager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select> */}
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