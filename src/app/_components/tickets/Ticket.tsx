'use client';

import { useState } from 'react';
import { Clock, User2, ChevronDown, ChevronUp, ArrowUpRight, AlertCircle, MessageSquare, Play } from 'lucide-react';
import '~/styles/globals.css';
import type { ticket } from '~/types/tickets/ticket';
import { useRouter } from 'next/navigation';
import { complaintStatusLabelMap } from '~/lib/complaintStatusLabelMap';
import { priorityColorMap } from '~/lib/PriorityColorMap';
import { complaintStatusColorMap } from '~/lib/statusColorMap';
import { useUser } from '@clerk/nextjs';
import { api } from '~/trpc/react';

interface TicketProps {
  ticket?: ticket;
}

const ComplaintCard = ({ ticket }: TicketProps) => {
  const { user } = useUser();
  const role = user?.publicMetadata?.role ?? 'guest';
  const router = useRouter();
  // const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const readableStatus = ticket?.status ? complaintStatusLabelMap[ticket.status] : 'UNKNOWN';

  // Simplified feedback check - only role and feedbackGiven
  const shouldShowFeedbackPrompt = () => {
    return role === 'employee' && ticket?.feedbackGiven === false;
  };

  // Check if activate button should be shown
  const shouldShowActivateButton = () => {
    return role === 'worker' && ticket?.currentWorkerStatus === 'in_queue';
  };

  // api to activate the complaint
  const { mutate: activateComplaint, isPending: isActivating } = api.complaints.activateTicketInQueue.useMutation({
    onSuccess: () => {
      console.log('Ticket activated successfully');
      // Optionally refresh the page or show a toast
      // window.location.reload();
    },
    onError: (error) => {
      console.error('Error activating ticket:', error);
      // Optionally show error toast
    },
  });

  const showFeedbackPrompt = shouldShowFeedbackPrompt();
  const showActivateButton = shouldShowActivateButton();

  // useEffect(() => {
  //   const checkScreen = () => setIsMobile(window.innerWidth < 768);
  //   checkScreen();
  //   window.addEventListener('resize', checkScreen);
  //   return () => window.removeEventListener('resize', checkScreen);
  // }, []);

  const handleFeedbackClick = () => {
    router.push(`/ticket/${ticket?.id}?feedback=true`);
  };

  const handleActivateClick = () => {
    if (ticket?.id) {
      activateComplaint({ complaintId: ticket.id });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mt-4">
      {/* Feedback Prompt Banner */}
      {showFeedbackPrompt && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                Ticket has been marked completed by the worker. Review and give feedback
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Your feedback helps us improve our service quality
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={handleFeedbackClick}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                <MessageSquare className="w-3 h-3" />
                <span className="hidden sm:inline">Give Feedback</span>
                <span className="sm:hidden">Feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Complaint Banner for Workers */}
      {showActivateButton && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800">
                This ticket is in your queue and ready to be activated
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Click activate to start working on this ticket
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={handleActivateClick}
                disabled={isActivating}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                {isActivating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Activating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span className="hidden sm:inline">Activate Ticket</span>
                    <span className="sm:hidden">Activate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          {/* Top Row - ID and Status */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">#{ticket?.id}</span>
            <div className="flex items-center gap-2">
              {showFeedbackPrompt && (
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              )}
              {showActivateButton && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              <span className={`text-white text-xs font-medium rounded px-2 py-1 ${
                complaintStatusColorMap[ticket?.status?.toLowerCase() ?? ''] ?? complaintStatusColorMap.default
              }`}>
                {readableStatus}
              </span>
            </div>
          </div>

          {/* Title Row */}
          <div className="mb-3">
            <div className="flex items-start gap-2 group">
              <h2
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 leading-tight flex-1"
                onClick={() => router.push(`/ticket/${ticket?.id}`)}
              >
                {ticket?.title}
              </h2>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Employee and Date Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-600 gap-1.5">
              <User2 className="w-4 h-4" />
              <span className="text-sm">{ticket?.employeeName}</span>
            </div>
            <div className="flex items-center text-gray-500 gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{ticket?.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'UNKNOWN'}</span>
            </div>
          </div>

          {/* Priority Row */}
          <div className="flex justify-end mb-4">
            <span className={`text-white text-xs font-medium px-2 py-1 rounded ${
              priorityColorMap[ticket?.priority?.toLowerCase() ?? ''] ?? priorityColorMap.default
            }`}>
              {ticket?.priority?.toUpperCase() ?? 'UNKNOWN'}
            </span>
          </div>

          {/* Activate Button for Mobile (if not shown in banner) */}
          {showActivateButton && (
            <div className="mb-4">
              <button
                onClick={handleActivateClick}
                disabled={isActivating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 touch-manipulation"
              >
                {isActivating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Activating Ticket...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Activate Ticket</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Toggle Button */}
          <div className="border-t border-gray-100 pt-3 mb-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expandable Details */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isExpanded
                ? 'max-h-64 opacity-100 border-t border-gray-100 pt-3'
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">Preferred Mode</dt>
                <dd className="text-sm text-gray-900">{ticket?.submissionPreference ?? 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">Category</dt>
                <dd className="text-sm text-gray-900">{ticket?.categoryName ?? 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 mb-1">Subcategory</dt>
                <dd className="text-sm text-gray-900">{ticket?.subCategoryName ?? 'Not assigned'}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout (sm and up) */}
        <div className="hidden sm:block">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              {/* ID and Status */}
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">#{ticket?.id}</span>
                  {showFeedbackPrompt && (
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  )}
                  {showActivateButton && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span className={`text-white text-xs font-medium rounded px-2 py-1 ${
                  complaintStatusColorMap[ticket?.status?.toLowerCase() ?? ''] ?? complaintStatusColorMap.default
                }`}>
                  {readableStatus}
                </span>
              </div>

              {/* Title and Employee */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 group">
                  <h2
                    className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                    onClick={() => router.push(`/ticket/${ticket?.id}`)}
                  >
                    {ticket?.title}
                  </h2>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" />
                </div>
                <div className="flex items-center text-gray-600 mt-2 gap-1.5">
                  <User2 className="w-4 h-4" />
                  <span className="text-sm">{ticket?.employeeName}</span>
                </div>
              </div>
            </div>

            {/* Date, Priority, and Activate Button */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center text-gray-500 gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{ticket?.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'UNKNOWN'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-white text-xs font-medium px-2 py-1 rounded ${
                  priorityColorMap[ticket?.priority?.toLowerCase() ?? ''] ?? priorityColorMap.default
                }`}>
                  {ticket?.priority?.toUpperCase() ?? 'UNKNOWN'}
                </span>
                
                {/* Desktop Activate Button */}
                {showActivateButton && (
                  <button
                    onClick={handleActivateClick}
                    disabled={isActivating}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-lg transition-colors duration-200 touch-manipulation"
                  >
                    {isActivating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Preferred Mode</dt>
                <dd className="text-sm text-gray-900">{ticket?.submissionPreference ?? 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Category</dt>
                <dd className="text-sm text-gray-900">{ticket?.categoryName ?? 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Subcategory</dt>
                <dd className="text-sm text-gray-900">{ticket?.subCategoryName ?? 'Not assigned'}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;