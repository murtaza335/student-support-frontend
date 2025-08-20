import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { api } from '~/trpc/react';
import InputField from './InputField';
import SelectField from './SelectField';
import type { supportStaffRoles } from '~/types/enums';
import type { SupportStaffMember } from '~/types/user/supportStaffMemberSchema';
import { useRouter } from 'next/navigation';
import { UploadCloud, Users, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { uploadProfileImage } from '~/utils/UploadProfileImage';
import { useToast } from '../ToastProvider';
import Loader from '../Loader'; import Image from 'next/image';

interface Props {
  initialUser: SupportStaffMember;
  roleOptions: supportStaffRoles[];
  onSubmit: (data: Partial<SupportStaffMember>) => void;
  onSwitch: () => void;
}

const SupportTeamForm = ({ initialUser, roleOptions, onSwitch }: Props) => {
  const { addToast } = useToast();
  const Router = useRouter();

  const [formData, setFormData] = useState<Partial<SupportStaffMember>>(initialUser);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? '';
  const { data: getTeamResponse = [], isLoading: isTeamLoading } = api.teams.getTeams.useQuery();
  const teamOptions = Array.isArray(getTeamResponse) ? [] : getTeamResponse?.data?.teams ?? [];

  const { mutate: completeProfileStaff, isPending: isSubmitting } = api.auth.completeProfileStaff.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      Router.push('/waiting-for-approval');
    },
    onError: () => addToast('Something went wrong!'),
  });

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
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string>= {};
    (['firstName', 'lastName', 'phone', 'role', 'teamId'] as (keyof SupportStaffMember)[]).forEach((field) => {
      if (!formData[field]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        newErrors[field as string] = `${fieldName} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalSubmit = async () => {
    const isValid = validate();
    if (!isValid) {
      addToast('Please fill all required fields.');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.phone || !email) {
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
      completeProfileStaff({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email,
        phone: formData.phone,
        role: formData.role ?? '',
        teamId: formData.teamId ?? '',
        picUrl: imageUrl,
      });
      addToast('Profile completed successfully!');
    } catch (error) {
      console.error('Profile submission failed:', error);
      addToast('Something went wrong while submitting the profile.');
    }
  };


    // Add a no-op handler for disabled fields
  const handleDisabledChange = () => {
    // No operation for disabled fields
  };
  const isLoading = isSubmitting || isUploading || isTeamLoading;

  // if (submitted) {
  //   return (
  //     <div className="max-w-2xl mx-auto p-8">
  //       <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center shadow-lg">
  //         <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <CheckCircle className="w-8 h-8 text-emerald-600" />
  //         </div>
  //         <h3 className="text-2xl font-bold text-gray-900 mb-2">Support Team Profile Submitted!</h3>
  //         <p className="text-gray-600 mb-4">
  //           Your support team profile has been submitted for approval. Our admin team will review your application shortly.
  //         </p>
  //         <div className="w-full bg-blue-200 rounded-full h-2">
  //           <div className="bg-emerald-600 h-2 rounded-full w-full"></div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Join Support Team</h2>
              <p className="text-sm text-gray-500">Help us provide excellent user support</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
              <span>Support Team Registration</span>
              <span>Step 1 of 1</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full w-full transition-all duration-300"></div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <Image width='48' height='48' src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <Loader />
                  </div>
                )}
              </div>

              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-3 px-6 py-4 border border-dashed border-gray-300 rounded-md hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group">
                  <UploadCloud className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div className="text-center">
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600">
                      {profileImage ? 'Change image' : 'Upload profile picture'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Personal Information</label>
                <div className="space-y-4">
                  <InputField label="First Name" name="firstName" value={formData.firstName ?? ''} onChange={handleChange} error={errors.firstName} disabled={isLoading} />
                  <InputField label="Last Name" name="lastName" value={formData.lastName ?? ''} onChange={handleChange} error={errors.lastName} disabled={isLoading} />
                  <InputField label="Phone Number" name="phone" value={formData.phone ?? ''} onChange={handleChange} error={errors.phone} disabled={isLoading} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Support Team Details</label>
                <div className="space-y-4">
                  <SelectField
                    label="Role"
                    name="role"
                    options={roleOptions.map((r) => ({ id: r, name: r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }))}
                    value={formData.role ?? ''}
                    onChange={handleChange}
                    error={errors.role}
                    disabled={isLoading}
                  />
                  <SelectField label="Team" name="teamId" options={teamOptions} value={formData.teamId ?? ''} onChange={handleChange} error={errors.teamId} disabled={isLoading || isTeamLoading} />
                  <InputField label="Department" name="department" value="ICT OFFICE" disabled onChange={handleDisabledChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={onSwitch}
              className="text-blue-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200 underline decoration-2 underline-offset-2"
              disabled={isLoading}
            >
              Join as regular user instead
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="group relative px-8 py-3 bg-emerald-600 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader />
                  <span>
                    {isUploading ? 'Uploading...' : isSubmitting ? 'Submitting...' : isTeamLoading ? 'Loading...' : 'Processing...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Submit for Approval</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-emerald-700 font-medium mb-1">Support Team Benefits</p>
                <p className="text-sm text-emerald-600">
                  As a support team member, you&apos;ll have access to advanced tools and the ability to help other users resolve their issues quickly and efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTeamForm;
