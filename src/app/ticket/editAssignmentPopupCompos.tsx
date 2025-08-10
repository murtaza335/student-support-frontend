'use client';

import { User2, X, Users, Clock, CheckCircle, Plus, Minus, UserPlus, UserMinus, AlertTriangle, ArrowRight } from 'lucide-react';
import type { WorkerAssignment } from '~/types/teams/workerAssignment';


// Add Workers Section Component
export function AddWorkersSection({ 
  selectedWorkers, 
  setSelectedWorkers, 
  workers, 
  isLoading, 
  isWorkerAssigned, 
  isWorkerSelected, 
  toggleWorkerSelection,
  assignedWorkers,
  mode,
  complaintId
}: {
  selectedWorkers: WorkerAssignment[];
  setSelectedWorkers: (workers: WorkerAssignment[]) => void;
  workers: WorkerAssignment[];
  isLoading: boolean;
  isWorkerAssigned: (worker: WorkerAssignment) => boolean;
  isWorkerSelected: (workerId: number) => boolean;
  toggleWorkerSelection: (worker: WorkerAssignment) => void;
  assignedWorkers: WorkerAssignment[] | undefined;
  mode: string;
  complaintId: number;
}) {
  return (
    <>
      {/* Selected Workers Section */}
      {selectedWorkers.length > 0 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs sm:text-sm font-medium text-emerald-900">
              <span className="sm:hidden">Selected ({selectedWorkers.length}):</span>
              <span className="hidden sm:inline">Ready to assign ({selectedWorkers.length} selected):</span>
            </h4>
            <button
              onClick={() => setSelectedWorkers([])}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium touch-manipulation"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {selectedWorkers.map((worker) => (
              <div key={`${mode}-complaint-${complaintId}-selected-${worker.workerId}`} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-emerald-100 rounded-full">
                <UserPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-emerald-800 font-medium truncate">{worker.workerName}</span>
                <button
                  onClick={() => toggleWorkerSelection(worker)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center transition-colors touch-manipulation flex-shrink-0"
                >
                  <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-700" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workers List */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex-1 overflow-hidden min-h-0 max-h-[calc(100%-8rem)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 min-h-[200px]">
            <div className="relative">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-slate-200"></div>
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-slate-600 mt-3 sm:mt-4 animate-pulse text-sm sm:text-base">Loading team members...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-8 sm:py-12 min-h-[200px] flex flex-col justify-center">
            <div className="p-3 sm:p-4 bg-slate-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium text-sm sm:text-base">No team members available</p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Add team members to get started</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-[40vh] lg:max-h-[50vh] overflow-hidden pr-2 pb-4">
            {workers?.map((worker: WorkerAssignment, index: number) => {
              const isAssigned = isWorkerAssigned(worker);
              const isSelected = isWorkerSelected(worker.workerId);
              const isBusyButNear = worker.status === 'busy' && worker.near === true;
              const isBusyAndFar = worker.status === 'busy' && worker.near === false;
              const canSelect = !isAssigned && !isBusyAndFar;
              const isRecommended = isBusyButNear;
              const queueCount = worker.queueCount ?? 0;
              
              // Create a highly unique key using mode, complaintId, and workerId to prevent conflicts
              const uniqueKey = `${mode}-complaint-${complaintId}-worker-${worker.workerId}-idx-${index}`;
              
              return (
                <WorkerCard
                  key={uniqueKey}
                  worker={worker}
                  isAssigned={isAssigned}
                  isSelected={isSelected}
                  isBusyButNear={isBusyButNear}
                  isBusyAndFar={isBusyAndFar}
                  canSelect={canSelect}
                  isRecommended={isRecommended}
                  queueCount={queueCount}
                  toggleWorkerSelection={toggleWorkerSelection}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// Replace Assignment Section Component
export function ReplaceAssignmentSection({
  currentWorkerToReplace,
  setCurrentWorkerToReplace,
  newWorkerToAssign,
  setNewWorkerToAssign,
  replacementReason,
  setReplacementReason,
  assignedWorkers,
  availableWorkersForReplacement,
  isLoading
}: {
  currentWorkerToReplace: WorkerAssignment | null;
  setCurrentWorkerToReplace: (worker: WorkerAssignment | null) => void;
  newWorkerToAssign: WorkerAssignment | null;
  setNewWorkerToAssign: (worker: WorkerAssignment | null) => void;
  replacementReason: string;
  setReplacementReason: (reason: string) => void;
  assignedWorkers: WorkerAssignment[] | undefined;
  availableWorkersForReplacement: WorkerAssignment[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-slate-200"></div>
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="text-slate-600 mt-3 sm:mt-4 animate-pulse text-sm sm:text-base">Loading workers...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-6 h-full max-h-[calc(100vh-25rem)] sm:max-h-[calc(85vh-25rem)] lg:max-h-[calc(80vh-23rem)] overflow-hidden pr-2 pb-4">
      {/* Current Worker Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserMinus className="w-4 h-4 text-red-600" />
          <h4 className="text-sm font-medium text-slate-900">Select Worker to Replace</h4>
        </div>
        
        {!assignedWorkers || assignedWorkers.length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-sm">
            No workers are currently assigned to this complaint.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {assignedWorkers.map((worker) => (
              <button
                key={`replace-current-${worker.workerId}`}
                onClick={() => setCurrentWorkerToReplace(worker)}
                className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                  currentWorkerToReplace?.workerId === worker.workerId
                    ? 'border-red-300 bg-red-50 ring-2 ring-red-200'
                    : 'border-slate-200 hover:border-red-200 hover:bg-red-50/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <User2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{worker.workerName}</p>
                    <p className="text-xs text-slate-500">ID: {worker.workerId}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Arrow Indicator */}
      {currentWorkerToReplace && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="text-xs text-slate-600 font-medium">Replace with</span>
          </div>
        </div>
      )}

      {/* New Worker Selection */}
      {currentWorkerToReplace && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-medium text-slate-900">Select New Worker</h4>
          </div>
          
          {availableWorkersForReplacement.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              No available workers for replacement.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableWorkersForReplacement.map((worker) => (
                <button
                  key={`replace-new-${worker.workerId}`}
                  onClick={() => setNewWorkerToAssign(worker)}
                  className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                    newWorkerToAssign?.workerId === worker.workerId
                      ? 'border-green-300 bg-green-50 ring-2 ring-green-200'
                      : 'border-slate-200 hover:border-green-200 hover:bg-green-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <User2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-slate-900">{worker.workerName}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          worker.status === 'busy' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {worker.status === 'busy' ? 'Busy' : 'Available'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">ID: {worker.workerId}</p>
                      {worker.queueCount && worker.queueCount > 0 && (
                        <p className="text-xs text-orange-600">Queue: {worker.queueCount} tasks</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reason Input */}
      {currentWorkerToReplace && newWorkerToAssign && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-medium text-slate-900">Reason for Replacement <span className="text-red-500">*</span></h4>
          </div>
          <textarea
            value={replacementReason}
            onChange={(e) => setReplacementReason(e.target.value)}
            placeholder="Please provide a reason for this worker replacement..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            rows={3}
            required
          />
          {replacementReason.trim().length === 0 && (
            <p className="text-xs text-red-600">Reason is required for worker replacement</p>
          )}
        </div>
      )}
    </div>
  );
}

// Worker Card Component
export function WorkerCard({
  worker,
  isAssigned,
  isSelected,
  isBusyButNear,
  isBusyAndFar,
  canSelect,
  isRecommended,
  queueCount,
  toggleWorkerSelection,
  index
}: {
  worker: WorkerAssignment;
  isAssigned: boolean;
  isSelected: boolean;
  isBusyButNear: boolean;
  isBusyAndFar: boolean;
  canSelect: boolean;
  isRecommended: boolean;
  queueCount: number;
  toggleWorkerSelection: (worker: WorkerAssignment) => void;
  index: number;
}) {
  return (
    <div
      onClick={() => canSelect && toggleWorkerSelection(worker)}
      className={`group flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-blue-200 touch-manipulation ${
        isAssigned
          ? 'border-green-200 bg-green-50/70'
          : isSelected
          ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
          : isRecommended
          ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200 cursor-pointer'
          : isBusyAndFar
          ? 'border-slate-200/60 bg-slate-50/70 opacity-75'
          : 'border-slate-200/60 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      tabIndex={canSelect ? 0 : -1}
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
            isAssigned
              ? 'bg-gradient-to-br from-green-100 to-green-200'
              : isSelected
              ? 'bg-gradient-to-br from-emerald-100 to-emerald-200'
              : isRecommended
              ? 'bg-gradient-to-br from-orange-100 to-orange-200'
              : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-blue-100 group-hover:to-blue-200'
          }`}>
            <User2 className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
              isAssigned 
                ? 'text-green-600' 
                : isSelected
                ? 'text-emerald-600'
                : isRecommended
                ? 'text-orange-600'
                : 'text-slate-600 group-hover:text-blue-600'
            }`} />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white rounded-full shadow-sm ${
            isAssigned
              ? 'bg-green-500'
              : isSelected
              ? 'bg-emerald-500'
              : isRecommended
              ? 'bg-orange-500'
              : isBusyAndFar 
              ? 'bg-red-500' 
              : 'bg-slate-400'
          }`}>
            {isAssigned && (
              <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white absolute -top-0.5 -left-0.5" />
            )}
            {isSelected && !isAssigned && (
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white absolute -top-0.5 -left-0.5" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <p className={`font-medium truncate transition-colors duration-300 text-sm sm:text-base ${
                isAssigned 
                  ? 'text-green-900' 
                  : isSelected
                  ? 'text-emerald-900'
                  : isRecommended
                  ? 'text-orange-900'
                  : 'text-slate-900 group-hover:text-blue-900'
              }`}>
                {worker.workerName}
              </p>
              {isRecommended && (
                <span className="px-1.5 py-0.5 sm:px-2 text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 rounded-full whitespace-nowrap">
                  <span className="hidden sm:inline">Recommended</span>
                  <span className="sm:hidden">Rec</span>
                </span>
              )}
            </div>
            <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${
              isAssigned
                ? 'bg-green-100 text-green-700 border-green-200'
                : isSelected
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : isRecommended
                ? 'bg-orange-100 text-orange-700 border-orange-200'
                : isBusyAndFar
                ? 'bg-red-100 text-red-700 border-red-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-1 ${
                isAssigned
                  ? 'bg-green-400'
                  : isSelected
                  ? 'bg-emerald-400'
                  : isRecommended
                  ? 'bg-orange-400'
                  : isBusyAndFar 
                  ? 'bg-red-400' 
                  : 'bg-slate-400'
              }`} />
              {isAssigned 
                ? 'Assigned' 
                : isSelected 
                ? 'Selected' 
                : isRecommended
                ? <span><span className="sm:hidden">Busy</span><span className="hidden sm:inline">{`Busy (${queueCount ? `${queueCount} tasks` : 'Near'})`}</span></span>
                : isBusyAndFar 
                ? <span><span className="sm:hidden">Busy</span><span className="hidden sm:inline">Busy (Far)</span></span>
                : 'Available'}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 font-mono">
            <p>ID: {worker.workerId}</p>
            {queueCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 hidden sm:inline">Queue:</span>
                <span className="text-xs text-slate-400 sm:hidden">Q:</span>
                <span className={`px-1 sm:px-1.5 py-0.5 rounded text-xs font-medium ${
                  queueCount > 2 
                    ? 'bg-red-100 text-red-700' 
                    : queueCount > 1 
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {queueCount}
                </span>
              </div>
            )}
            <div className="flex items-center text-xs text-slate-400 font-sans">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
              <span className="hidden sm:inline">Online</span>
              <span className="sm:hidden">On</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Selection Button */}
      {isAssigned ? (
        <div className="px-2 py-1 sm:px-4 sm:py-2 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Assigned</span>
          <span className="sm:hidden">✓</span>
        </div>
      ) : isBusyAndFar ? (
        <div className="px-2 py-1 sm:px-4 sm:py-2 bg-red-200 text-red-600 text-xs sm:text-sm font-medium rounded-lg cursor-not-allowed opacity-60 flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Busy (Far)</span>
          <span className="sm:hidden">Busy</span>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWorkerSelection(worker);
          }}
          className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 flex items-center gap-1 sm:gap-2 flex-shrink-0 touch-manipulation ${
            isSelected
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-300'
              : isRecommended
              ? 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-300 shadow-md'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md focus:ring-blue-300'
          }`}
        >
          {isSelected ? (
            <>
              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Remove</span>
              <span className="sm:hidden">-</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {isRecommended 
                  ? `Select (${queueCount ? `${queueCount} tasks` : 'Near'})` 
                  : 'Select'}
              </span>
              <span className="sm:hidden">+</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Footer Section Component
export function FooterSection({
  showReplaceSection,
  selectedWorkers,
  canReplace,
  isAssigning,
  isReplacing,
  workers,
  isWorkerAssigned,
  assignedCount,
  handleAssignWorkers,
  handleReplaceAssignment,
  setOpen,
  mode
}: {
  showReplaceSection: boolean;
  selectedWorkers: WorkerAssignment[];
  canReplace: boolean;
  isAssigning: boolean;
  isReplacing: boolean;
  workers: WorkerAssignment[];
  isWorkerAssigned: (worker: WorkerAssignment) => boolean;
  assignedCount: number;
  handleAssignWorkers: () => void;
  handleReplaceAssignment: () => void;
  setOpen: (open: boolean) => void;
  mode: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-transparent rounded-b-xl sm:rounded-b-2xl gap-3 sm:gap-0">
      {/* Stats - Stack on mobile, horizontal on desktop */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        {(!showReplaceSection || mode === "initial-assignment") && (
          <>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <p className="text-slate-600 font-medium">
                {workers.filter(w => !isWorkerAssigned(w) && w.status !== 'busy').length} 
                <span className="hidden sm:inline"> available</span>
                <span className="sm:hidden"> avail</span>
              </p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <p className="text-orange-600 font-medium">
                {workers.filter(w => !isWorkerAssigned(w) && w.status === 'busy' && w.near === true).length} 
                <span className="hidden sm:inline"> recommended</span>
                <span className="sm:hidden"> rec</span>
              </p>
            </div>
            {assignedCount > 0 && mode !== "initial-assignment" && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"></div>
                <p className="text-blue-600 font-medium">
                  {assignedCount} 
                  <span className="hidden sm:inline"> assigned</span>
                </p>
              </div>
            )}
            {selectedWorkers.length > 0 && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full"></div>
                <p className="text-emerald-600 font-medium">
                  {selectedWorkers.length} 
                  <span className="hidden sm:inline"> selected</span>
                </p>
              </div>
            )}
          </>
        )}
        
        {showReplaceSection && (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full"></div>
            <p className="text-amber-600 font-medium text-xs sm:text-sm">
              Replace Assignment Mode
            </p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 touch-manipulation"
        >
          Cancel
        </button>
        
        {((!showReplaceSection || mode === "initial-assignment") && selectedWorkers.length > 0) && (
          <button
            onClick={handleAssignWorkers}
            disabled={isAssigning}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 touch-manipulation ${
              isAssigning
                ? 'bg-emerald-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white focus:ring-emerald-300'
            }`}
          >
            {isAssigning ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Assigning...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {mode === "initial-assignment" ? "Assign" : "Add"} {selectedWorkers.length} Worker{selectedWorkers.length !== 1 ? 's' : ''}
                </span>
                <span className="sm:hidden">
                  {mode === "initial-assignment" ? "Assign" : "Add"} ({selectedWorkers.length})
                </span>
              </>
            )}
          </button>
        )}

        {showReplaceSection && canReplace && (
          <button
            onClick={handleReplaceAssignment}
            disabled={isReplacing}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-center gap-1 sm:gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 touch-manipulation ${
              isReplacing
                ? 'bg-amber-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white focus:ring-amber-300'
            }`}
          >
            {isReplacing ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Replacing...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Replace Assignment</span>
                <span className="sm:hidden">Replace</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}