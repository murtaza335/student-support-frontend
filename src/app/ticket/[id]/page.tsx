'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Clock, Settings, Trash2, MoreVertical, Send, MessageSquare, Edit3 } from 'lucide-react';
import { api } from '~/trpc/react';
import { format } from 'date-fns';
import Loader from '~/app/_components/Loader';
// import { File } from 'lucide-react';
import { priorityColorMap } from '~/lib/PriorityColorMap';
import { complaintStatusColorMap } from '~/lib/statusColorMap';
import type { WorkerComplaintStatus } from '~/types/enums';
import PopupImageViewer from '~/app/_components/PopupImageViewer';
import { useState } from 'react';
import EditAssignmentPopup from '~/app/ticket/myTeamPopups';
import ForwardTeamPopup from '~/app/ticket/forwardComplaintPopup';
import { useUser } from '@clerk/nextjs';
// import type { log } from '~/types/logs/log';
import { useEffect } from 'react';
import { useToast } from '~/app/_components/ToastProvider';
import MarkCompleteTicketPopup from '~/app/ticket/MarkCompleteTicketPopup';
import LoginRequired from '~/app/_components/unauthorized/loginToContinue';
import ErrorLoading from '~/app/_components/unauthorized/errorLoading';
import AssignedWorkersCard from '~/app/ticket/assignedWorkersCard';
import AttachmentsDisplay from '~/app/ticket/AttachmentsDisplay';
import FeedbackPopup from '~/app/ticket/feedbackPopup';

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isSignedIn, user, isLoaded } = useUser();
  const { addToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const id = typeof params.id === 'string' ? params.id : '';
  // now we have to convert the id to a number
  const ticketId = parseInt(id, 10);
  // to toggle the popup for my team when the assign button is clicked
  const [isMyTeamPopupOpen, setIsMyTeamPopupOpen] = useState(false);
  // to toggle the popup for forwarding the ticket
  const [isForwardTeamPopupOpen, setIsForwardTeamPopupOpen] = useState(false);
  // to toggle the popup for feedback
  const [isFeedbackPopupOpen, setIsFeedbackPopupOpen] = useState(false);
  // to toggle the close ticket modal, this is only for workers
  const [showCloseModal, setShowCloseModal] = useState(false);
  // to toggle the edit assignment popup
  const [isEditAssignmentPopupOpen, setIsEditAssignmentPopupOpen] = useState(false);

  // const [shouldFetchTeams, setShouldFetchTeams] = useState(false);
  // const [shouldFetchMyTeamMembers, setShouldFetchMyTeamMembers] = useState(false);


  // api to fetch the ticket details
  const { data: ticket, isLoading, error } = api.complaints.getComplainInfo.useQuery({ id });
  const complaint = ticket?.data?.complaint;
  const formattedAttachments = ticket?.data?.formattedAttachments ?? { employeeAttachments: [], workerAttachments: [] };
  const employeeAttachments = formattedAttachments.employeeAttachments.map(attachment => ({
    ...attachment,
    note: attachment.note ?? undefined
  })) || [];
  const workerAttachments = formattedAttachments.workerAttachments.map(attachment => ({
    ...attachment,
    note: attachment.note ?? undefined
  })) || [];
  console.log("formattedAttachments:", formattedAttachments)
  console.log("employeeAttachments:", employeeAttachments)
  console.log("workerAttachments:", workerAttachments)
  const workers = ticket?.data?.complaint?.assignedWorkers?.workers ?? [];
  const currentWorkerStatus = ticket?.data?.complaint?.assignedWorkers?.currentWorkerStatus;

  // api to fetch the complaint logs
  const { data: getComplaintLogsResponse, isLoading: isLogsLoading } = api.complaints.getComplaintLogs.useQuery({ complaintId: id });
  const logs = getComplaintLogsResponse?.data?.logs ?? [];

  // api to delete the complaint
  // this will be used when the user clicks on delete button
  const {
    mutate: deleteComplaint,
    isPending: isDeleting,
    isSuccess: isDeleteSuccess,
    isError: isDeleteError,
    error: deleteError,
  } = api.complaints.deleteComplaint.useMutation();
  const MyTeamId: number | null = user?.publicMetadata?.teamId as number | null;
  // const MyTeamName: string | null = user?.publicMetadata?.teamName as string | null;

  // api call to add a worker to the existing assignment of ticket
  const {
    mutate: _addWorkerToAssignment,
    isPending: isAddingWorker,
    isSuccess: isAddWorkerSuccess,
    isError: isAddWorkerError,
    error: addWorkerError,
  } = api.complaints.addWorkerToAssignment.useMutation();

  // api call to submit feedback
  const {
    mutate: submitFeedback,
    isPending: isSubmittingFeedback,
    isSuccess: isFeedbackSuccess,
    isError: isFeedbackError,
    error: feedbackError,
  } = api.complaints.giveFeedback.useMutation();

  // api call to close ticket
  const {
    mutate: closeTicket,
    isPending: isClosingTicket,
    isSuccess: isCloseSuccess,
    isError: isCloseError,
    error: closeError,
  } = api.complaints.closeTicket.useMutation();

  // api call to reopen ticket
  const {
    mutate: reopenTicket,
    isPending: isReopeningTicket,
    isSuccess: isReopenSuccess,
    isError: isReopenError,
    error: reopenError,
  } = api.complaints.reopenTicket.useMutation();



  useEffect(() => {
    if (isDeleteSuccess) {
      const role = user?.publicMetadata?.role;
      if (role === 'employee') {
        router.replace('/dashboard/employee');
        router.refresh();
        addToast('Complaint deleted successfully!', 'success');
      } else if (role === 'admin') {
        router.replace('/dashboard/admin');
        router.refresh();
        addToast('Complaint deleted successfully!', 'success');
      }
    }

    if (isDeleteError) {
      console.error('Error deleting complaint:', deleteError);
      alert('Failed to delete the complaint. Please try again later.');
    }
  }, [isDeleteSuccess, isDeleteError, deleteError, user, router, addToast]);

  useEffect(() => {
    if (isAddWorkerSuccess) {
      addToast('Worker assignment updated successfully!', 'success');
      router.refresh();
      setIsEditAssignmentPopupOpen(false);
    }

    if (isAddWorkerError) {
      console.error('Error updating assignment:', addWorkerError);
      addToast('Failed to update assignment. Please try again.', 'error');
    }
  }, [isAddWorkerSuccess, isAddWorkerError, addWorkerError, router, addToast]);

  // Handle feedback submission success/error
  useEffect(() => {
    if (isFeedbackSuccess) {
      addToast('Thank you for your feedback!', 'success');
      // Automatically close the ticket after feedback is submitted
      closeTicket({ complaintId: id });
    }

    if (isFeedbackError) {
      console.error('Error submitting feedback:', feedbackError);
      addToast('Failed to submit feedback. Please try again.', 'error');
    }
  }, [isFeedbackSuccess, isFeedbackError, feedbackError, addToast, closeTicket, id]);

  // Handle close ticket success/error
  useEffect(() => {
    if (isCloseSuccess) {
      addToast('Ticket has been closed successfully!', 'success');
      setIsFeedbackPopupOpen(false);
      router.refresh();
    }

    if (isCloseError) {
      console.error('Error closing ticket:', closeError);
      addToast('Failed to close ticket. Please try again.', 'error');
    }
  }, [isCloseSuccess, isCloseError, closeError, addToast, router, setIsFeedbackPopupOpen]);

  // Handle reopen ticket success/error
  useEffect(() => {
    if (isReopenSuccess) {
      addToast('Ticket has been reopened successfully!', 'success');
      setIsFeedbackPopupOpen(false);
      router.refresh();
    }

    if (isReopenError) {
      console.error('Error reopening ticket:', reopenError);
      addToast('Failed to reopen ticket. Please try again.', 'error');
    }
  }, [isReopenSuccess, isReopenError, reopenError, addToast, router, setIsFeedbackPopupOpen]);


  if (isLoading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader />
          <p className="text-sm text-gray-500">Loading ticket details...</p>
        </div>
      </div>
    );
  }
  if (isLoaded && !isSignedIn) {
    return <LoginRequired />;
  }

  if (error || !ticket) {
    return (
      <ErrorLoading />
    );
  }



  if (isDeleting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader />
          <p className="text-sm text-gray-500">Deleting complaint...</p>
        </div>
      </div>
    );
  }



  function handleDeleteComplaint(complaintId: string) {
    deleteComplaint({ complaintId });
    console.log('deleting complaint with id:', complaintId);
  }

  // Feedback handlers
  const handleFeedbackSubmit = (feedbackData: { rating: number; comment?: string; action: 'close' | 'reopen' }) => {
    console.log('Feedback submitted:', feedbackData);
    
    if (feedbackData.action === 'close') {
      // Submit feedback with rating and comment
      submitFeedback({
        complaintId: id,
        feedback: feedbackData.comment ?? 'No additional comments',
        score: feedbackData.rating
      });
    } else if (feedbackData.action === 'reopen') {
      // Reopen the ticket without feedback
      reopenTicket({ complaintId: id });
    }
  };

  const handleReopenTicket = () => {
    // Handle ticket reopening logic
    console.log('Reopening ticket...');
    reopenTicket({ complaintId: id });
  };


  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Mobile-First Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Ticket #{complaint?.id}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Support Request Details</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Mark Complete Button - Show when currentWorkerStatus is not "resolved" */}
              {currentWorkerStatus !== "resolved" && user?.publicMetadata?.role === 'worker' && (
                <button 
                  className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  onClick={() => setShowCloseModal(true)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark Complete
                </button>
              )}
              
              {/* Resolve Button for Workers */}
              {/* {user?.publicMetadata?.role === 'worker' && complaint?.status !== 'closed' && complaint?.status !== 'resolved' && currentWorkerStatus !== "in_queue" && (
                <button className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm" onClick={() => setShowCloseModal(true)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Resolve
                </button>
              )} */}

              {(complaint?.status === "waiting_assignment" || complaint?.status === "reopened") && user?.publicMetadata?.role === 'manager' && (
                <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  onClick={() => { setIsMyTeamPopupOpen(true); console.log('Assigning ticket...'); }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Assign
                </button>
              )}
              {(complaint?.status === "in_progress" || complaint?.status === "assigned" || complaint?.status === "in_queue") && (user?.publicMetadata?.role === 'manager') && (
                <button
                  className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => { setIsEditAssignmentPopupOpen(true); console.log('Opening edit assignment...'); }}
                  disabled={isAddingWorker}
                >
                  {isAddingWorker ? (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Edit3 className="h-4 w-4 mr-2" />
                  )}
                  Edit Assignment
                </button>
              )}
              {(complaint?.status === "waiting_assignment" || complaint?.status === "reopened") && user?.publicMetadata?.role === 'manager' && (
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm" onClick={() => { setIsForwardTeamPopupOpen(true); console.log('Forwarding ticket...');}}>
                  <Send className="h-4 w-4 mr-2" />
                  Forward Complaint
                </button>
              )}

              {/* Feedback Button - Show for employees when ticket is resolved/closed */}
              {(complaint?.status === 'resolved') && user?.publicMetadata?.role === 'employee' && (
                <button 
                  className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  onClick={() => setIsFeedbackPopupOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Give Feedback
                </button>
              )}

              <div className="flex items-center">
                {user?.publicMetadata?.role === 'employee' && (complaint?.status === "waiting_assignment" || complaint?.status === "reopened") && (
                  <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDeleteComplaint(id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Action Bar */}
        <div className="lg:hidden px-4 py-3 bg-gray-50 border-t border-gray-200 w-full">
          <div className="flex space-x-2 max-w-full overflow-x-auto">
            {/* Mark Complete Button for Workers - Show when currentWorkerStatus is "in_queue" */}
            {currentWorkerStatus === "in_queue" && user?.publicMetadata?.role === 'worker' && (
              <button 
                className="flex-shrink-0 inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors touch-manipulation"
                onClick={() => setShowCloseModal(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Complete
              </button>
            )}

            {/* Mark Complete Button for Workers */}
            {user?.publicMetadata?.role === 'worker' && complaint?.status !== 'closed' && complaint?.status !== 'resolved' && currentWorkerStatus !== "in_queue" && (
              <button 
                className="flex-shrink-0 inline-flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors touch-manipulation"
                onClick={() => setShowCloseModal(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Complete
              </button>
            )}

            {/* Assign Button for Managers */}
            {(complaint?.status === "waiting_assignment" || complaint?.status === "reopened") && user?.publicMetadata?.role === 'manager' && (
              <button 
                className="flex-shrink-0 inline-flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors touch-manipulation"
                onClick={() => { setIsMyTeamPopupOpen(true); console.log('Assigning ticket...'); }}
              >
                <User className="h-4 w-4 mr-2" />
                Assign
              </button>
            )}

            {/* Edit Assignment Button for Managers */}
            {(complaint?.status === "in_progress" || complaint?.status === "assigned" || complaint?.status === "in_queue") && user?.publicMetadata?.role === 'manager' && (
              <button 
                className="flex-shrink-0 inline-flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => { setIsEditAssignmentPopupOpen(true); console.log('Opening edit assignment...'); }}
                disabled={isAddingWorker}
              >
                {isAddingWorker ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Edit3 className="h-4 w-4 mr-2" />
                )}
                Edit Assignment
              </button>
            )}

            {/* Forward Complaint Button for Managers */}
            {(complaint?.status === "waiting_assignment" || complaint?.status === "reopened") && user?.publicMetadata?.role === 'manager' && (
              <button 
                className="flex-shrink-0 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors touch-manipulation"
                onClick={() => { setIsForwardTeamPopupOpen(true); console.log('Forwarding ticket...'); }}
              >
                <Send className="h-4 w-4 mr-2" />
                Forward
              </button>
            )}

            {/* Feedback Button for Employees - Show when ticket is resolved/closed */}
            {(complaint?.status === 'resolved') && user?.publicMetadata?.role === 'employee' && (
              <button 
                className="flex-shrink-0 inline-flex items-center justify-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors touch-manipulation"
                onClick={() => setIsFeedbackPopupOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </button>
            )}

            {/* Delete Button for Employees */}
            {user?.publicMetadata?.role === 'employee' && (complaint?.status === "waiting_assignment" || complaint?.status === "reopened") && (
              <button 
                className="flex-shrink-0 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                onClick={() => handleDeleteComplaint(id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

          </div>
        </div>
      </header>

      {/* this is a random comment */}

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-32 overflow-hidden">
        {/* Priority Banner - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 break-words leading-tight">{complaint?.title}</h2>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{complaint?.customDescription}</p>
                </div>
              </div>
            </div>

            {/* Status Pills - Mobile Scrollable */}
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 w-full">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 sm:overflow-visible sm:flex-wrap -mx-1 px-1">
                <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</span>
                  <span className={`inline-flex text-white items-center px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${priorityColorMap[complaint?.priority?.toLowerCase() ?? ''] ?? priorityColorMap.default}`}>
                    {complaint?.priority}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                  <span className={`inline-flex text-white items-center px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ${complaintStatusColorMap[complaint?.status?.toLowerCase() ?? ''] ?? complaintStatusColorMap.default}`}>
                    {complaint?.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Level</span>
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-800 rounded-full">
                    {complaint?.escalationLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content - Full width on mobile, 2/3 on desktop */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">

            {/* Quick Stats - Mobile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">


              {/* assignedWorkersCard component */}
              <AssignedWorkersCard 
                assignedWorkers={
                  workers && workers.length > 0
                    ? workers.map((worker: { workerId: number; workerName: string; workerPic: string; workerStatus?: string; workerUserId?: string; teamId?: number }) => ({
                        workerId: worker.workerId,
                        workerUserId: worker.workerUserId ?? '',
                        teamId: worker.teamId ?? 0,
                        workerName: worker.workerName ?? 'Unknown',
                        status: (worker.workerStatus ?? 'active') as WorkerComplaintStatus,
                        picUrl: worker.workerPic || '', // optional URL for worker's profile picture
                      }))
                    : undefined
                }
              />
              



              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Location</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{complaint?.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Details Card */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Technical Information
                </h3>
              </div>
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Device</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{complaint?.device ?? 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Category</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{complaint?.categoryName ?? 'Uncategorized'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Subcategory</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{complaint?.subCategoryName ?? 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Issue Type</label>
                    <p className="text-sm sm:text-base text-gray-900 font-medium">{complaint?.issueOptionName ?? 'General'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Display Component */}
            <AttachmentsDisplay
              employeeAttachments={employeeAttachments}
              workerAttachments={workerAttachments}
              onImageClick={handleImageClick}
            />
          </div>

          {/* Sidebar - Stack on mobile */}
          <div className="space-y-4 sm:space-y-6">

            {/* Contact Information */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  <span className="hidden sm:inline">Contact Details</span>
                  <span className="sm:hidden">Contact</span>
                </h3>
              </div>
              <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Reported By</label>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">{complaint?.employeeName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Team</label>
                  <p className="text-sm sm:text-base text-gray-900">{complaint?.categoryName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Submission Method</label>
                  <p className="text-sm sm:text-base text-gray-900 capitalize">{complaint?.submissionPreference}</p>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Timeline
                </h3>
              </div>
              <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">Created</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {complaint?.createdAt
                        ? format(new Date(complaint.createdAt), 'PPp')
                        : 'Not available'}
                    </p>
                  </div>
                </div>
                {/* <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">
                      {complaint?.updatedAt
                        ? format(new Date(complaint.updatedAt), 'PPp')
                        : 'Not available'}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* {logs section} */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  Logs
                </h3>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {isLogsLoading ? (
                  <p className="text-sm text-gray-500">Loading logs...</p>
                ) : logs.length === 0 ? (
                  <p className="text-sm text-gray-500">No logs available.</p>
                ) : (
                  logs.map((log) => {
                    // Ensure complaintId is a string and comment/changedByName are nullable
                    const safeLog = {
                      ...log,
                      complaintId: String(log.complaintId),
                      comment: log.comment ?? null,
                      changedByName: log.changedByName ?? null,
                    };
                    return (
                      <div key={safeLog.id} className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${complaintStatusColorMap[safeLog.status] ?? "bg-gray-400"}`}
                        ></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {safeLog.status.replaceAll("_", " ")}
                          </p>
                          {safeLog.comment && (
                            <p className="text-sm text-gray-700 italic">“{safeLog.comment}”</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="text-blue-600 font-medium">
                              {safeLog.changedByName ? `By ${safeLog.changedByName}` : "By system"}
                            </span>{" "}
                            ·{" "}
                            <span className="text-gray-400">
                              {safeLog.timeStamp ? format(new Date(safeLog.timeStamp), "PPpp") : "Unknown time"}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>


            {/* Popup Image Viewer */}
            {selectedImage && (
              <PopupImageViewer
                imageUrl={selectedImage}
                onClose={() => setSelectedImage(null)}
              />
            )}

            {/* Initial Assignment Popup */}
            {
              <EditAssignmentPopup
                open={isMyTeamPopupOpen}
                setOpen={setIsMyTeamPopupOpen}
                complaintId={ticketId}
                assignedWorkers={
                  complaint?.assignedWorkers
                    ? complaint.assignedWorkers.workers.map((worker: { workerId: number; workerName: string; workerUserId?: string; teamId?: number; status?: string; name?: string }) => ({
                      workerId: worker.workerId,
                      workerUserId: worker.workerUserId ?? '',
                      teamId: worker.teamId ?? 0,
                      workerName: worker.workerName ?? worker.name ?? 'Unknown',
                      status: (worker.status === 'resolved' || worker.status === 'in_queue') ? 'busy' : 'active' as const,
                      isAssignedToThisComplaint: true,
                    }))
                    : undefined
                }
                mode="initial-assignment"
              />
            }

            {/* Edit Assignment Popup */}
            {
              <EditAssignmentPopup
                open={isEditAssignmentPopupOpen}
                setOpen={setIsEditAssignmentPopupOpen}
                complaintId={ticketId}
                assignedWorkers={
                  complaint?.assignedWorkers
                    ? complaint.assignedWorkers.workers.map((worker: { workerId: number; workerName: string; workerUserId?: string; teamId?: number; status?: string; name?: string }) => ({
                      workerId: worker.workerId,
                      workerUserId: worker.workerUserId ?? '',
                      teamId: worker.teamId ?? 0,
                      workerName: worker.workerName ?? worker.name ?? 'Unknown',
                      status: (worker.status === 'resolved' || worker.status === 'in_queue') ? 'busy' : 'active' as const,
                      isAssignedToThisComplaint: true,
                    }))
                    : undefined
                }
                mode="edit"
              />
            }

            <ForwardTeamPopup 
            open={isForwardTeamPopupOpen} 
            setOpen={setIsForwardTeamPopupOpen} 
            complainId={id} 
            MyTeamId={MyTeamId} />

            <MarkCompleteTicketPopup
              open={showCloseModal}
              setOpen={setShowCloseModal}
              ticketId={id}
            />

            {/* Feedback Popup */}
            <FeedbackPopup
              isOpen={isFeedbackPopupOpen}
              onClose={() => setIsFeedbackPopupOpen(false)}
              ticketId={complaint?.id ?? id}
              ticketTitle={complaint?.title ?? 'Support Request'}
              onSubmitFeedback={handleFeedbackSubmit}
              onReopenTicket={handleReopenTicket}
              isSubmitting={isSubmittingFeedback || isClosingTicket || isReopeningTicket}
            />

          </div>
        </div>
      </main>
    </div>
  );
}