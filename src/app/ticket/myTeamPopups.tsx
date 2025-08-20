'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { api } from '~/trpc/react'; // tRPC hooks
import { User2, X, Users, Clock, CheckCircle, Plus, Minus, UserPlus, UserMinus, Edit3, AlertTriangle, ArrowRight } from 'lucide-react';
import type { WorkerAssignment } from '~/types/teams/workerAssignment';
import { useRouter } from 'next/navigation';
import { AddWorkersSection } from './editAssignmentPopupCompos';
import { ReplaceAssignmentSection } from './editAssignmentPopupCompos';
import { FooterSection } from './editAssignmentPopupCompos';
import { useToast } from '../_components/ToastProvider';


interface EditAssignmentPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  complaintId: number;
  assignedWorkers: WorkerAssignment[] | undefined;
  mode?: string;
}

export default function EditAssignmentPopup({ open, setOpen, complaintId, assignedWorkers, mode = "edit" }: EditAssignmentPopupProps) {
  const router = useRouter();
  const {addToast} = useToast();
  const utils = api.useUtils();
  // State for selected workers to assign
  const [selectedWorkers, setSelectedWorkers] = useState<WorkerAssignment[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Replace assignment states
  const [currentWorkerToReplace, setCurrentWorkerToReplace] = useState<WorkerAssignment | null>(null);
  const [newWorkerToAssign, setNewWorkerToAssign] = useState<WorkerAssignment | null>(null);
  const [replacementReason, setReplacementReason] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);
  const [showReplaceSection, setShowReplaceSection] = useState(false);

  // fetching the team workers
  const { data: getTeamWorkersResponse, isLoading } = api.teams.getWorkersWhileAssignment.useQuery({ complaintId }, { enabled: open });
  
  // API mutation calls
  const assignTicketToWorkers = api.complaints.assignComplainToWorkers.useMutation();
  // call to add worker to assignment
    // api call to add a worker to the existing assignment of ticket
  const addWorkerToAssignment = api.complaints.addWorkerToAssignment.useMutation();
  
  // replace assignment
  const replaceAssignment = api.complaints.replaceAssignment.useMutation();
  
  const [workers, setWorkers] = useState<WorkerAssignment[]>([]);

  useEffect(() => {
    if (getTeamWorkersResponse) {
      // Filter out any undefined values before setting state
      const validWorkers = (getTeamWorkersResponse?.data?.workers ?? []).filter((worker) => worker !== undefined) as WorkerAssignment[];
      setWorkers(validWorkers);
    }
  }, [getTeamWorkersResponse]);

  // Reset states when popup opens
  useEffect(() => {
    if (open) {
      setSelectedWorkers([]);
      setCurrentWorkerToReplace(null);
      setNewWorkerToAssign(null);
      setReplacementReason('');
      // For initial assignment mode, never show replace section
      setShowReplaceSection(mode === "initial-assignment" ? false : false);
    }
  }, [open, mode]);

  // Function to check if a worker is already assigned to this complaint
  const isWorkerAssigned = (worker: WorkerAssignment): boolean => {
    if (worker.hasOwnProperty('isAssignedToThisComplaint')) {
      return worker.isAssignedToThisComplaint ?? false;
    }
    return assignedWorkers?.some(assignedWorker => assignedWorker.workerId === worker.workerId) ?? false;
  };

  // Function to check if a worker is currently selected
  const isWorkerSelected = (workerId: number): boolean => {
    return selectedWorkers.some(worker => worker.workerId === workerId);
  };

  // Function to toggle worker selection
  const toggleWorkerSelection = (worker: WorkerAssignment) => {
    if (isWorkerSelected(worker.workerId)) {
      // Remove from selection
      setSelectedWorkers(prev => prev.filter(w => w.workerId !== worker.workerId));
    } else {
      // Add to selection
      setSelectedWorkers(prev => [...prev, worker]);
    }
  };

  // Get count of assigned workers
  const assignedCount = assignedWorkers?.length ?? 0;

  // Handle assigning multiple workers
  const handleAssignWorkers = async () => {
    if (selectedWorkers.length === 0) return;
    
    try {
      setIsAssigning(true);
      
      // Create array of assignments
      const assignments = selectedWorkers.map(worker => worker.workerId);

      const response = await assignTicketToWorkers.mutateAsync({
        workerId: assignments,
        complaintId: complaintId
      });
      
      console.log('Workers assigned successfully:', response);
      await utils.complaints.getComplainInfo.invalidate({ id: String(complaintId) }); // Invalidate cache to refresh data
      await utils.complaints.getComplaintLogs.invalidate({ complaintId: String(complaintId) }); // Invalidate logs cache
      await utils.teams.getWorkersWhileAssignment.invalidate({ complaintId : complaintId }); // Invalidate workers cache
      setOpen(false); // Close popup
      setSelectedWorkers([]); // Clear selections
    } catch (error) {
      console.error('Error assigning workers:', error);
      addToast("Failed to assign workers. Please try again.")
    } finally {
      setIsAssigning(false);
    }
  };

  // handle add workers
  const handleAddWorkers = async () => {
    if (selectedWorkers.length === 0) return;

    try {
      setIsAssigning(true);

      // Create array of assignments
      const assignments = selectedWorkers.map(worker => worker.workerId);

      const response = await addWorkerToAssignment.mutateAsync({
        workerId: assignments,
        complaintId: complaintId
      });

      console.log('Workers added successfully:', response);
      await utils.complaints.getComplainInfo.invalidate({ id: String(complaintId) }); // Invalidate cache to refresh data
      await utils.complaints.getComplaintLogs.invalidate({ complaintId: String(complaintId) }); // Invalidate logs cache
      await utils.teams.getWorkersWhileAssignment.invalidate({ complaintId : complaintId }); // Invalidate workers cache
      setOpen(false); // Close popup
      setSelectedWorkers([]); // Clear selections
    } catch (error) {
      console.error('Error assigning workers:', error);
      addToast("Failed to assign workers. Please try again.")
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle replacing assignment
  const handleReplaceAssignment = async () => {
    if (!currentWorkerToReplace || !newWorkerToAssign || !replacementReason.trim()) return;
    
    try {
      setIsReplacing(true);
      
      const response = await replaceAssignment.mutateAsync({
        complaintId: complaintId,
        currentWorkerId: currentWorkerToReplace.workerId,
        newWorkerId: newWorkerToAssign.workerId,
        reason: replacementReason.trim()
      });
      console.log(response);
      
      console.log('Assignment replaced successfully:', response);
      await utils.complaints.getComplainInfo.invalidate({ id: String(complaintId) }); // Invalidate cache to refresh data
      await utils.complaints.getComplaintLogs.invalidate({ complaintId: String(complaintId) }); // Invalidate logs cache
      await utils.teams.getWorkersWhileAssignment.invalidate({ complaintId : complaintId }); // Invalidate workers cache

      setOpen(false); // Close popup
      
      // Reset replace states
      setCurrentWorkerToReplace(null);
      setNewWorkerToAssign(null);
      setReplacementReason('');
    } catch (error) {
      console.error('Error replacing assignment:', error);
      // Optionally show toast/notification
    } finally {
      setIsReplacing(false);
    }
  };

  // Get available workers for replacement (not currently assigned)
  const availableWorkersForReplacement = workers.filter(worker => 
    !isWorkerAssigned(worker) && worker.workerId !== currentWorkerToReplace?.workerId
  );

  const canReplace = currentWorkerToReplace && newWorkerToAssign && replacementReason.trim().length > 0;

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        {/* Animated backdrop */}
        <div
          className={`fixed inset-0 bg-gradient-to-br from-slate-900/20 via-slate-800/30 to-slate-900/40 backdrop-blur-sm transition-all duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
          <Dialog.Panel className={`w-full max-w-4xl max-h-[95vh] sm:max-h-[85vh] lg:max-h-[80vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200/60 transform transition-all duration-300 overflow-hidden flex flex-col ${
            open ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}>

            {/* Enhanced Header */}
            <div className="relative px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200/50 flex-shrink-0">
                    <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Dialog.Title className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                      {mode === "initial-assignment" ? "Assign Workers" : "Edit Assignment"}
                    </Dialog.Title>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                      {mode === "initial-assignment" 
                        ? "Select team members to assign to this task"
                        : "Manage team members assigned to this task"
                      }
                      {assignedCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {assignedCount} currently assigned
                        </span>
                      )}
                    </p>
                    {/* Mobile-only simplified subtitle */}
                    <p className="text-xs text-slate-500 mt-0.5 sm:hidden">
                      {mode === "initial-assignment" ? "Assign workers" : "Manage assignments"}
                      {assignedCount > 0 && (
                        <span className="ml-1 text-blue-600 font-medium">({assignedCount} assigned)</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 sm:p-2 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 group flex-shrink-0 touch-manipulation"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-slate-600" />
                </button>
              </div>
              
              {/* Tab Navigation - Only show for edit mode */}
              {mode !== "initial-assignment" && (
                <div className="mt-4 flex space-x-1 bg-white/60 rounded-lg p-1">
                  <button
                    onClick={() => setShowReplaceSection(false)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      !showReplaceSection
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Add Workers
                  </button>
                  <button
                    onClick={() => setShowReplaceSection(true)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      showReplaceSection
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Replace Assignment
                  </button>
                </div>
              )}
            </div>

            {/* Currently Assigned Workers */}
            {assignedWorkers && assignedWorkers.length > 0 && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-50/50 border-b border-blue-100">
                <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Currently Assigned:</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {assignedWorkers.map((worker) => (
                    <div key={`${mode}-complaint-${complaintId}-assigned-${worker.workerId}`} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-blue-100 rounded-full">
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-blue-800 font-medium truncate">{worker.workerName}</span>
                      <span className="text-xs text-blue-600 hidden sm:inline">#{worker.workerId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content - Either Add Workers or Replace Assignment */}
            <div className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-20rem)] sm:max-h-[calc(85vh-20rem)] lg:max-h-[calc(80vh-18rem)">
              {(!showReplaceSection || mode === "initial-assignment") ? (
                <AddWorkersSection
                  selectedWorkers={selectedWorkers}
                  setSelectedWorkers={setSelectedWorkers}
                  workers={workers}
                  isLoading={isLoading}
                  isWorkerAssigned={isWorkerAssigned}
                  isWorkerSelected={isWorkerSelected}
                  toggleWorkerSelection={toggleWorkerSelection}
                  assignedWorkers={assignedWorkers}
                  mode={mode}
                  complaintId={complaintId}
                />
              ) : (
                <ReplaceAssignmentSection
                  currentWorkerToReplace={currentWorkerToReplace}
                  setCurrentWorkerToReplace={setCurrentWorkerToReplace}
                  newWorkerToAssign={newWorkerToAssign}
                  setNewWorkerToAssign={setNewWorkerToAssign}
                  replacementReason={replacementReason}
                  setReplacementReason={setReplacementReason}
                  assignedWorkers={assignedWorkers}
                  availableWorkersForReplacement={availableWorkersForReplacement}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Footer with Action Buttons */}
            <FooterSection
              showReplaceSection={showReplaceSection}
              selectedWorkers={selectedWorkers}
              canReplace={!!canReplace}
              isAssigning={isAssigning}
              isReplacing={isReplacing}
              workers={workers}
              isWorkerAssigned={isWorkerAssigned}
              assignedCount={assignedCount}
              handleAssignWorkers={handleAssignWorkers}
              handleAddWorkers={handleAddWorkers}
              handleReplaceAssignment={handleReplaceAssignment}
              setOpen={setOpen}
              mode={mode}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}

