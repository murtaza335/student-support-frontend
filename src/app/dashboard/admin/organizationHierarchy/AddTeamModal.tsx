'use client';

import React from "react";
import type { AvailableManager } from "./page";

interface AddTeamModalProps {
    closeModal: () => void;
    availableManagers: AvailableManager[];
}

export const AddTeamModal: React.FC<AddTeamModalProps> = ({ closeModal, availableManagers }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">Add New Team</h3>
        <div className="space-y-4">
          <input type="text" placeholder="Team Name" className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm" />
          <textarea placeholder="Description" className="w-full p-3 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm resize-none"></textarea>
          {/* <select className="w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm">
            <option value="">Select Manager</option>
            {availableManagers.map((manager: AvailableManager) => (
              <option key={manager.id} value={manager.id}>{manager.name}</option>
            ))}
          </select> */}
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