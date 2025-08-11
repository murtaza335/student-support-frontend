'use client';
import React from 'react';
import type { Manager } from './page';

interface PrivilegesModalProps {
    closeModal: () => void;
    selectedManager?: Manager;
    };

export const PrivilegesModal: React.FC<PrivilegesModalProps> = ({ closeModal, selectedManager }) => (
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