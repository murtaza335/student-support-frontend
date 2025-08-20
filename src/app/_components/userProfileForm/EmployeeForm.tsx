'use client';

import { useState } from 'react';
import { useToast } from '../ToastProvider';
import type { NustEmployee } from '~/types/user/nustEmployeeSchema';
import { api } from '~/trpc/react';
import { useUser } from '@clerk/nextjs';
import InputField from './InputField';
import SelectField from './SelectField';
import { useRouter } from 'next/navigation';
import { uploadProfileImage } from '~/utils/UploadProfileImage';
import { UploadCloud, User, CheckCircle, ArrowRight } from "lucide-react";
import Loader from '../Loader';
import Image from 'next/image';

interface Props {
  initialUser: NustEmployee;
  onSubmit: (data: Partial<NustEmployee>) => void;
  onSwitch: () => void;
}

const RegularUserForm = ({ initialUser, onSwitch }: Props) => {
  const Router = useRouter();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<NustEmployee>>(initialUser);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({}); 
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? '';
  const { data: locationResponse = [], isLoading: locationsLoading } = api.locations.getLocations.useQuery();
  const locationOptions = Array.isArray(locationResponse) ? [] : locationResponse?.data ?? [];

  const { mutate: completeProfile, isPending: isSubmitting } = api.auth.completeProfile.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      Router.push('/waiting-for-approval');
    },
    onError: () => addToast('Something went wrong!'),
  });

  const requiredFields: (keyof NustEmployee)[] = ['firstName', 'lastName', 'phone', 'locationId', 'designation'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field]?.toString().trim() === '') {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalSubmit = async () => {
    const isValid = validateStep();
    if (!isValid) return;

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !email ||
      !formData.locationId ||
      !formData.designation ||
      !formData.department ||
      !formData.officeNumber
    ) {
      addToast('Please fill all required fields.');
      return;
    }

    let imageUrl = '';

    if (profileImage) {
      try {
        setIsUploading(true);
        imageUrl = await uploadProfileImage(profileImage);
      } catch (error) {
        console.error('Image upload failed:', error);
        addToast('Image upload failed! Only jpg, png, webp are allowed.');
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      completeProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email,
        phone: formData.phone,
        officeNumber: formData.officeNumber,
        department: formData.department,
        designation: formData.designation,
        locationId: formData.locationId,
        picUrl: imageUrl,
      });
      
      addToast('Profile completed successfully!');
    } catch (error) {
      console.error('Profile submission failed:', error);
      addToast('Something went wrong while submitting the profile.');
    }
  };

  const isLoading = isSubmitting || isUploading || locationsLoading;

  if (submitted) {
    // Router.refresh();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Complete Your Profile</h2>
              <p className="text-gray-500 text-sm">Fill in your details to get started</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Profile Setup</span>
              <span>Step 1 of 1</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <Image width= '48' height = '48' src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <Loader />
                  </div>
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-3 px-6 py-4 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
                  <UploadCloud className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {profileImage ? 'Change image' : 'Upload profile picture'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={isUploading} />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Personal Information</label>
              <InputField label="First Name" name="firstName" value={formData.firstName ?? ''} onChange={handleChange} error={errors.firstName} disabled={isLoading} />
              <InputField label="Last Name" name="lastName" value={formData.lastName ?? ''} onChange={handleChange} error={errors.lastName} disabled={isLoading} />
              <InputField label="Phone Number" name="phone" value={formData.phone ?? ''} onChange={handleChange} error={errors.phone} disabled={isLoading} />
            </div>

            <div className="space-y-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Information</label>
              <SelectField label="Location" name="locationId" options={locationOptions} value={formData.locationId ?? ''} onChange={handleChange} error={errors.locationId} disabled={isLoading} />
              <InputField label="Department" name="department" value={formData.department ?? ''} onChange={handleChange} disabled={isLoading} />
              <InputField label="Designation" name="designation" value={formData.designation ?? ''} onChange={handleChange} error={errors.designation} disabled={isLoading} />
              <InputField label="Office Room Number" name="officeNumber" value={formData.officeNumber ?? ''} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-100">
            <button onClick={onSwitch} className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 underline underline-offset-2" disabled={isLoading}>
              Join as support team instead
            </button>

            <button onClick={handleFinalSubmit} disabled={isLoading} className="group relative px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader />
                  <span>{isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : 'Loading...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Submit for Approval</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Your profile will be reviewed by our team. You&apos;ll receive an email notification once it&apos;s approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegularUserForm;
