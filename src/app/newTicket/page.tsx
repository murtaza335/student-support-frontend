'use client';

import { useState, useRef , useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react'; 
import { priorityEnum, submissionPreferenceEnum } from '~/types/enums';
import { uploadAttachment } from '~/utils/complaintAttachmentsUpload';
import { useToast } from '../_components/ToastProvider';
import type { IssueOption } from '~/types/categories/issueOptions';
import type { SubCategory } from '~/types/categories/subCategory';
import { useUser } from '@clerk/nextjs';
import Loader from '~/app/_components/Loader';
import LoginRequired from '~/app/_components/unauthorized/loginToContinue';


export default function ComplaintForm() {
  const router = useRouter();
  const {addToast} = useToast();
  const { isLoaded, isSignedIn } = useUser();

  type Upload = { file: File; note: string; type: string };
  type FormState = {
    title: string;
    categoryId: string;
    subCategoryId: string;
    issueOptionId: string;
    customDescription: string;
    device: string;
    submissionPreference: string;
    priority: string;
    uploads: Upload[];
  };

  const [form, setForm] = useState<FormState>({
    title: '',
    categoryId: '',
    subCategoryId: '',
    issueOptionId: '',
    customDescription: '',
    device: '',
    submissionPreference: '',
    priority: '',
    uploads: [],
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs for scrolling to error fields
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const subCategoryRef = useRef<HTMLSelectElement>(null);
  const issueOptionRef = useRef<HTMLSelectElement>(null);
  const customDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const deviceRef = useRef<HTMLInputElement>(null);
  const submissionPreferenceRef = useRef<HTMLSelectElement>(null);
  const priorityRef = useRef<HTMLSelectElement>(null);

  const { data: categoriesResponse, isLoading: categoriesLoading } = api.complaints.getCategories.useQuery();
  const categories = categoriesResponse?.data?.categories ?? [];
  
  const { data: subcategories, isLoading: subcategoriesLoading } = api.complaints.getSubCategories.useQuery(
    { categoryId: form.categoryId },
    { enabled: !!form.categoryId }
  );
  const subCategories = subcategories?.data?.subCategories ?? [];

  const { data: issues, isLoading: issuesLoading } = api.complaints.getIssueOptions.useQuery(
    { subCategoryId: form.subCategoryId },
    { enabled: !!form.subCategoryId }
  );
  const issueOptions = issues?.data?.issueOptions ?? [];

  // api call for the complaint generation
  const generateComplain = api.complaints.generateComplain.useMutation({
    onSuccess: (data) => {
      console.log('Complaint generated successfully:', data);
      addToast('Complaint submitted successfully!', 'success');
      // Redirect to employee dashboard after successful submission
      router.push('/dashboard/employee');
    },
    onError: (error) => {
      console.error('Error generating complaint:', error);
      addToast(`Error submitting complaint: ${error.message || 'Please try again'}`, 'error');
      setIsUploading(false);
      setUploadProgress('');
    },
  });

  // Reset loading state when mutation completes
  useEffect(() => {
    if (!generateComplain.isPending) {
      setIsUploading(false);
      setUploadProgress('');
    }
  }, [generateComplain.isPending]);

  // Authentication checks - after all hooks
  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center">
      <Loader />
      <p className="text-gray-500 pl-5">Please wait, while we authorize you...</p>
    </div>;
  }
  if(isLoaded && !isSignedIn) {
    return <LoginRequired />;
  }

  const handleBack = () => {
    router.back();
    router.refresh();
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error for the field being updated
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    // Validate file size and count
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;
    
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    if (form.uploads.length + files.length > maxFiles) {
      addToast(`You can only upload up to ${maxFiles} files. Please remove some files first.`, 'error');
      return;
    }
    
    Array.from(files).forEach(file => {
      if (file.size > maxFileSize) {
        invalidFiles.push(`${file.name} (${formatFileSize(file.size)} - exceeds 10MB limit)`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      addToast(`Some files were rejected: ${invalidFiles.join(', ')}`, 'error');
    }
    
    if (validFiles.length > 0) {
      const newUploads = validFiles.map(file => ({
        file,
        note: '',
        type: getFileType(file)
      }));
      
      setForm((prev) => ({
        ...prev,
        uploads: [...prev.uploads, ...newUploads],
      }));
      
      if (validFiles.length > 0) {
        addToast(`${validFiles.length} file(s) added successfully`, 'success');
      }
    }
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
    const updated = [...form.uploads];
    const currentUpload = updated[index];
    
    if (currentUpload) {
      // Explicitly preserve all properties
      updated[index] = {
        file: currentUpload.file,
        note: key === 'note' ? value : currentUpload.note,
        type: key === 'type' ? value : currentUpload.type,
      };
      setForm((prev) => ({ ...prev, uploads: updated }));
    }
  };

  const removeUpload = (index: number) => {
    const updated = [...form.uploads];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, uploads: updated }));
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required field validations
    if (!form.title.trim()) {
      newErrors.title = 'Complaint title is required';
    }
    
    if (!form.categoryId) {
      newErrors.categoryId = 'Category selection is required';
    }
    
    if (!form.subCategoryId) {
      newErrors.subCategoryId = 'Subcategory selection is required';
    }
    
    if (!form.issueOptionId) {
      newErrors.issueOptionId = 'Issue selection is required';
    }
    
    if (!form.device.trim()) {
      newErrors.device = 'Device/Platform information is required';
    }
    
    if (!form.submissionPreference) {
      newErrors.submissionPreference = 'Preferred contact method is required';
    }
    
    if (!form.priority) {
      newErrors.priority = 'Priority level is required';
    }
    
    // If "Other" is selected, custom description is required
    if (isOther && !form.customDescription.trim()) {
      newErrors.customDescription = 'Description is required when "Other" is selected';
    }
    
    setErrors(newErrors);
    
    // Scroll to first error field
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      let elementToFocus: HTMLElement | null = null;
      
      switch (firstError) {
        case 'title':
          elementToFocus = titleRef.current;
          break;
        case 'categoryId':
          elementToFocus = categoryRef.current;
          break;
        case 'subCategoryId':
          elementToFocus = subCategoryRef.current;
          break;
        case 'issueOptionId':
          elementToFocus = issueOptionRef.current;
          break;
        case 'customDescription':
          elementToFocus = customDescriptionRef.current;
          break;
        case 'device':
          elementToFocus = deviceRef.current;
          break;
        case 'submissionPreference':
          elementToFocus = submissionPreferenceRef.current;
          break;
        case 'priority':
          elementToFocus = priorityRef.current;
          break;
      }
      
      if (elementToFocus) {
        elementToFocus.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        elementToFocus.focus();
      }
      
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading files...');

    try {
      // Upload all files and get their URLs
      const uploadsWithUrls = await Promise.all(
        form.uploads.map(async (upload, index) => {
          setUploadProgress(`Uploading file ${index + 1} of ${form.uploads.length}: ${upload.file.name}...`);
          try {
            const url = await uploadAttachment(upload.file);
            return {
              type: upload.type,
              url: url,
              note: upload.note || null,
            };
          } catch (uploadError) {
            console.error(`Failed to upload ${upload.file.name}:`, uploadError);
            throw new Error(`Failed to upload ${upload.file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        })
      );

      setUploadProgress('Submitting complaint...');

      const complaintData = {
        categoryId: form.categoryId,
        subCategoryId: form.subCategoryId,
        issueOptionId: form.issueOptionId,
        customDescription: form.customDescription,
        submissionPreference: (["remote", "on_site", "call_back"].includes(form.submissionPreference) ? form.submissionPreference : "remote") as "remote" | "on_site" | "call_back",
        priority: (["low", "medium", "high", "urgent"].includes(form.priority) ? form.priority : "low") as "low" | "medium" | "high" | "urgent",
        title: form.title,
        device: form.device,
        uploads: uploadsWithUrls,
      };

      generateComplain.mutate(complaintData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during file upload';
      console.error('Error during submission:', error);
      addToast('Error during submission: ' + errorMessage, 'error');
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const isOther: boolean =
    issueOptions.find((i: IssueOption) => i.id.toString() === form.issueOptionId)?.name === 'Other (specify)';

  const isSubmitting = generateComplain.isPending || isUploading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {uploadProgress || 'Processing your request...'}
              </h3>
              <p className="text-sm text-gray-600">
                Please don&apos;t close this window. This may take a few moments.
              </p>
              {form.uploads.length > 0 && (
                <div className="mt-4 bg-gray-100 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    {form.uploads.length} file(s) being processed
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className={`bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100 ${isSubmitting ? 'opacity-75' : ''}`}>
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-white-600 px-8 py-6 rounded-t-2xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-2xl font-bold tracking-wide">Request a Support</h2>
                <p className="text-pink-100 text-sm mt-1">Fill in the required details to submit your request</p>
              </div>
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center bg-gray-100 px-4 py-2 text-black text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-black/30 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-800 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Complaint Title
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                ref={titleRef}
                type="text"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.title 
                    ? 'border-red-500 focus:border-red-500 bg-red-50' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="Brief description of your complaint"
                value={form.title}
                onChange={(e) => {
                  handleChange('title', e.target.value);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: '' }));
                  }
                }}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Issue Classification */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                Issue Classification
                <span className="text-red-500 ml-2 text-sm font-normal">(All fields required)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={categoryRef}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.categoryId 
                        ? 'border-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    value={form.categoryId}
                    onChange={(e) => {
                      handleChange('categoryId', e.target.value);
                      handleChange('subCategoryId', '');
                      handleChange('issueOptionId', '');
                      if (errors.categoryId) {
                        setErrors(prev => ({ ...prev, categoryId: '' }));
                      }
                    }}
                    disabled={categoriesLoading || isSubmitting}
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select category'}
                    </option>
                    {categories.map((cat) =>
                      cat ? (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ) : null
                    )}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.categoryId}
                    </p>
                  )}
                  {categoriesLoading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                      Loading categories...
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subcategory <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={subCategoryRef}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 ${
                      errors.subCategoryId 
                        ? 'border-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    value={form.subCategoryId}
                    onChange={(e) => {
                      handleChange('subCategoryId', e.target.value);
                      handleChange('issueOptionId', '');
                      if (errors.subCategoryId) {
                        setErrors(prev => ({ ...prev, subCategoryId: '' }));
                      }
                    }}
                    disabled={!form.categoryId || subcategoriesLoading || isSubmitting}
                  >
                    <option value="">
                      {subcategoriesLoading ? 'Loading subcategories...' : 'Select subcategory'}
                    </option>
                    {subCategories.map((sub: SubCategory) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  {errors.subCategoryId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.subCategoryId}
                    </p>
                  )}
                  {subcategoriesLoading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                      Loading subcategories...
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Specific Issue <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={issueOptionRef}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 ${
                      errors.issueOptionId 
                        ? 'border-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    value={form.issueOptionId}
                    onChange={(e) => {
                      handleChange('issueOptionId', e.target.value);
                      if (errors.issueOptionId) {
                        setErrors(prev => ({ ...prev, issueOptionId: '' }));
                      }
                    }}
                    disabled={!form.subCategoryId || issuesLoading || isSubmitting}
                  >
                    <option value="">
                      {issuesLoading ? 'Loading issues...' : 'Select issue'}
                    </option>
                    {issueOptions.map((issue: IssueOption) => (
                      <option key={issue.id} value={issue.id}>
                        {issue.name}
                      </option>
                    ))}
                  </select>
                  {errors.issueOptionId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.issueOptionId}
                    </p>
                  )}
                  {issuesLoading && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                      Loading issues...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Description */}
            {isOther && (
              <div className="border-2 border-dashed border-orange-300 bg-orange-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-800">
                      Please describe your complaint <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-sm text-orange-600">Provide as much detail as possible to help us understand and resolve your concern</p>
                  </div>
                </div>
                <textarea
                  ref={customDescriptionRef}
                  rows={4}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 resize-none text-gray-900 placeholder-orange-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.customDescription 
                      ? 'border-red-500 focus:border-red-500 bg-red-50' 
                      : 'border-orange-200 focus:border-orange-400'
                  }`}
                  placeholder="Please provide a detailed description of your complaint..."
                  value={form.customDescription}
                  onChange={(e) => {
                    handleChange('customDescription', e.target.value);
                    if (errors.customDescription) {
                      setErrors(prev => ({ ...prev, customDescription: '' }));
                    }
                  }}
                  disabled={isSubmitting}
                />
                {errors.customDescription && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.customDescription}
                  </p>
                )}
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                Additional Details
                <span className="text-red-500 ml-2 text-sm font-normal">(All fields required)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Device/Platform <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={deviceRef}
                    type="text"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.device 
                        ? 'border-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="e.g., Windows 11, iPhone 15"
                    value={form.device}
                    onChange={(e) => handleChange('device', e.target.value)}
                    disabled={isSubmitting}
                  />
                  {errors.device && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.device}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Preferred Contact Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={submissionPreferenceRef}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.submissionPreference 
                        ? 'border-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    value={form.submissionPreference}
                    onChange={(e) => handleChange('submissionPreference', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select contact method</option>
                    {submissionPreferenceEnum.options.map((option) => (
                      <option key={option} value={option}>
                        {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {errors.submissionPreference && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.submissionPreference}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Priority Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={priorityRef}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 transition-all duration-200 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.priority 
                        ? 'border-red-500 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select priority</option>
                    {priorityEnum.options.map((option) => (
                      <option key={option} value={option}>
                        {option.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.priority}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    Supporting Documents
                  </h3>
                  <p className="text-sm text-gray-600">Add screenshots, documents, or other relevant files to support your complaint</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Browse Files
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-purple-400 bg-purple-100'
                    : 'border-purple-300 bg-white hover:border-purple-400 hover:bg-purple-50'
                } ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium text-gray-700 mb-2">Drop files here to upload</p>
                  <p className="text-sm text-gray-500 mb-4">or click &quot;Browse Files&quot; to select from your device</p>
                  <p className="text-xs text-gray-400">Supports: Images, Documents, Videos, Log Files (Max 10MB each, up to 5 files)</p>
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
              <div className="mt-6 space-y-4">
                {form.uploads.map((upload, index) => (
                  <div key={index} className={`bg-white border-2 border-purple-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isSubmitting ? 'opacity-75' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-xs">{upload.file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(upload.file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUpload(index)}
                        disabled={isSubmitting}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="What does this file show?"
                          value={upload.note}
                          onChange={(e) => updateUpload(index, 'note', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">File Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 transition-all duration-200 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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

                {form.uploads.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">No files uploaded</p>
                    <p className="text-xs text-gray-400 mt-1">Supporting documents help us understand your complaint better</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="border-t-2 border-gray-100 pt-8">
              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-sm font-semibold text-red-800">Please fix the following errors:</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field} className="flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className={`flex-1 text-white font-bold py-4 px-8 rounded-xl shadow-xl transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-2xl transform hover:-translate-y-0.5'
                  }`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        {uploadProgress || 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Complaint
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              {isSubmitting && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>Please wait:</strong> Your complaint is being processed. Do not refresh or close this page.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}