'use client';

import { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react';
import { api } from '~/trpc/react';
import { uploadAttachment } from '~/utils/complaintAttachmentsUpload';
import { useToast } from '../_components/ToastProvider';

interface CloseTicketPopupProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  ticketId: string;
}

type Upload = { file: File; note: string; type: string };

export default function MarkCompleteTicketPopup({ open, setOpen, ticketId }: CloseTicketPopupProps) {
  const { addToast } = useToast();
  const utils = api.useUtils();
  
  const [resolution, setResolution] = useState('');
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API call to resolve the ticket
  const resolveTicket = api.complaints.resolveComplaint.useMutation({
    onSuccess: async () => {
      addToast('Ticket Resolved successfully!');
      setOpen(false);
      await utils.complaints.getComplainInfo.invalidate({ id: ticketId }); // Invalidate cache to refresh data
      await utils.complaints.getComplaintLogs.invalidate({ complaintId: ticketId }); // Invalidate logs cache

    },
    onError: (error) => {
      console.error('Error resolving ticket:', error);
      addToast('Failed to Resolve ticket. Please try again.');
      setIsSubmitting(false);
      setUploadProgress('');
    },
  });

  // Reset form when popup opens/closes
  useEffect(() => {
    if (!open) {
      setResolution('');
      setUploads([]);
      setIsDragOver(false);
      setIsSubmitting(false);
      setUploadProgress('');
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isSubmitting) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, isSubmitting, setOpen]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newUploads = Array.from(files).map(file => ({
      file,
      note: '',
      type: getFileType(file)
    }));
    
    setUploads(prev => [...prev, ...newUploads]);
  };

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'Screenshot';
    if (file.type.startsWith('video/')) return 'Video';
    if (file.type === 'application/pdf' || file.type.startsWith('application/vnd.')) return 'Document';
    if (file.name.toLowerCase().includes('log') || file.type === 'text/plain') return 'Log File';
    return 'Other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateUpload = (index: number, key: 'note' | 'type', value: string) => {
    const updated = [...uploads];
    const currentUpload = updated[index];
    
    if (currentUpload) {
      updated[index] = {
        file: currentUpload.file,
        note: key === 'note' ? value : currentUpload.note,
        type: key === 'type' ? value : currentUpload.type,
      };
      setUploads(updated);
    }
  };

  const removeUpload = (index: number) => {
    const updated = [...uploads];
    updated.splice(index, 1);
    setUploads(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!resolution.trim()) {
      addToast(
        'Please provide a resolution summary.'
        );
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Processing ticket closure...');

    try {
      let uploadsWithUrls: Array<{ type: string; url: string; note: string | null }> = [];

      if (uploads.length > 0) {
        setUploadProgress('Uploading files...');
        
        // Upload all files and get their URLs
        uploadsWithUrls = await Promise.all(
          uploads.map(async (upload, index) => {
            setUploadProgress(`Uploading file ${index + 1} of ${uploads.length}...`);
            return {
              type: upload.type,
              url: await uploadAttachment(upload.file),
              note: upload.note || null,
            };
          })
        );
      }

      setUploadProgress('Finalizing ticket closure...');
      
      // Call the API to close the ticket
      await resolveTicket.mutateAsync({
        complaintId: ticketId,
        resolvedSummary: resolution,
        uploads: uploadsWithUrls,
      });

    } catch (error: unknown) {
      console.error('Error closing ticket:', error);
      addToast('Error closing ticket. Please try again.');
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // Reset submitting state when mutation completes
  useEffect(() => {
    if (!resolveTicket.isPending) {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  }, [resolveTicket.isPending]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {uploadProgress || 'Closing ticket...'}
            </h3>
            <p className="text-sm text-gray-600">
              Please don&apos;t close this window. This may take a few moments.
            </p>
            {uploads.length > 0 && (
              <div className="mt-4 bg-gray-100 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  {uploads.length} file(s) being processed
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900/20 via-slate-800/30 to-slate-900/40 backdrop-blur-sm transition-all duration-300" 
        onClick={() => !isSubmitting && setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <div className={`w-full max-w-4xl max-h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200/60 transform transition-all duration-300 flex flex-col ${isSubmitting ? 'opacity-75' : ''}`}>
          {/* Header */}
          <div className="relative px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200/60 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl shadow-sm border border-green-200/50">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Mark Complete
                  </h2>
                  {/* <p className="text-sm text-slate-500 mt-0.5">
                    {ticketTitle ? `Closing: ${ticketTitle}` : `Ticket ID: ${ticketId}`}
                  </p> */}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 sm:p-2 hover:bg-white/80 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 min-h-0">
            {/* Resolution Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-green-600" />
                <label className="text-sm font-semibold text-gray-800">
                  Resolution Summary
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                disabled={isSubmitting}
                placeholder="Describe how the issue was resolved, steps taken, or final outcome..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-200 resize-none text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                Provide a clear summary of the resolution for future reference and documentation.
              </p>
            </div>

            {/* File Upload Section */}
            <div className="bg-green-50 border-2 border-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center mb-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                    Supporting Documentation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add final screenshots, resolution documents, or proof of completion (optional)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg sm:rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-green-400 bg-green-100'
                    : 'border-green-300 bg-white hover:border-green-400 hover:bg-green-50'
                } ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-green-400 mb-3 sm:mb-4" />
                  <p className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">Drop files here to upload</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">or click &quot;Browse Files&quot; to select from your device</p>
                  <p className="text-xs text-gray-400">Supports: Images, Documents, Videos, Log Files (Max 10MB each)</p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.log"
                disabled={isSubmitting}
              />

              {/* Uploaded Files */}
              <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                {uploads.map((upload, index) => (
                  <div key={index} className={`bg-white border-2 border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${isSubmitting ? 'opacity-75' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{upload.file.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{formatFileSize(upload.file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUpload(index)}
                        disabled={isSubmitting}
                        className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-0 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="What does this file show?"
                          value={upload.note}
                          onChange={(e) => updateUpload(index, 'note', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">File Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-0 transition-all duration-200 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                          value={upload.type}
                          onChange={(e) => updateUpload(index, 'type', e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="">Select type</option>
                          <option value="Screenshot">📸 Screenshot</option>
                          <option value="Document">📄 Document</option>
                          <option value="Video">🎥 Video</option>
                          <option value="Log File">📋 Log File</option>
                          <option value="Other">📎 Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {uploads.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-medium">No files uploaded</p>
                    <p className="text-xs text-gray-400 mt-1">Supporting files help document the resolution process</p>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">Important Notice</h4>
                  <p className="text-sm text-amber-700">
                    Once closed, this ticket cannot be reopened. Please ensure all issues have been resolved 
                    and documented before proceeding. You can create a new ticket if additional issues arise.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-transparent rounded-b-xl sm:rounded-b-2xl flex-shrink-0 space-y-3 sm:space-y-0">
            <button
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="px-4 sm:px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg sm:rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none order-2 sm:order-1"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!resolution.trim() || isSubmitting}
              className={`px-4 sm:px-6 py-2.5 text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200 order-1 sm:order-2 ${
                resolution.trim() && !isSubmitting
                  ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-300'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Closing...
                </div>
              ) : (
                'Mark Complete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}