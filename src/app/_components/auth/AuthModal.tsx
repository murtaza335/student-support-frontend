'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { isClerkAPIResponseError } from '@clerk/clerk-js';
import { api } from '~/trpc/react';
import { useUser } from '@clerk/nextjs';
import { Eye, EyeOff } from 'lucide-react';

export default function CustomAuthForm() {
  const {user, isLoaded, isSignedIn} = useUser();
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'verify-email' | 'forgot-password' | 'code-login' | 'reset-password-email' | 'reset-password-code' | 'backup-codes'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  const router = useRouter();

  // const { data, isLoading } = api.auth.loginCheck.useQuery(undefined, { enabled: isLoaded && isSignedIn });
  // const responseData = data?.data;
  // console.log(responseData);

  // api for the login with codes
  const loginWithCode = api.auth.loginWithCode.useMutation({
  });
  // api for update password
  const updatePassword = api.auth.updatePassword.useMutation({ });

  // api call for the login with codes

  const clearState = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setBackupCode('');
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Domain verification function
  const verifyDomain = (email: string): boolean => {
    if (!email?.includes('@')) {
      return false;
    }
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === 'nust.edu.pk';
  };

  // Validate fields function
  const validateFields = (email: string, password: string, confirmPassword?: string): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!password.trim()) {
      return 'Password is required';
    }
    if (confirmPassword !== undefined && !confirmPassword.trim()) {
      return 'Confirm password is required';
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return 'Passwords do not match';
    }
    // if (!verifyDomain(email)) {
    //   return 'Please use your NUST email address (example@nust.edu.pk)';
    // }
    return null;
  };

  const handleSignIn = async () => {
    if (!signInLoaded || isLoading) return;
    
    // Validate fields and domain
    const validationError = validateFields(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        console.log('Intermediate step required:', result);
      }
    } catch (err) {
      const msg = isClerkAPIResponseError(err) ? err.errors[0]?.message ?? 'Unknown error' : 'Unknown error';
      setError(msg ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpLoaded || isLoading) return;
    
    // Validate fields and domain
    const validationError = validateFields(email, password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setMode('verify-email');
    } catch (err) {
      const msg = isClerkAPIResponseError(err) ? err.errors[0]?.message : 'Unknown error';
      setError(msg ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signUpLoaded || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        router.push('/');
      }
    } catch (err) {
      const msg = isClerkAPIResponseError(err) ? err.errors[0]?.message : 'Unknown error';
      setError(msg ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!signInLoaded || !email || isLoading) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await signIn.create({ identifier: email });
      // Find the emailAddressId from supportedFirstFactors
      const emailFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'reset_password_email_code' && 'emailAddressId' in factor
      ) as { emailAddressId?: string } | undefined;
      const emailAddressId = emailFactor?.emailAddressId;
      if (!emailAddressId) {
        setError('Unable to find email address for password reset.');
        return;
      }
      await signIn.prepareFirstFactor({ strategy: 'reset_password_email_code', emailAddressId });
      setSuccessMsg('Reset code sent to your email.');
      setError(''); // Clear any previous errors
      setMode('code-login');
    } catch (err) {
      const msg = isClerkAPIResponseError(err) ? err.errors[0]?.message : 'Error';
      setError(msg ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError('');
    setSuccessMsg('');
    setMode('forgot-password');
  };

  const handleCodeLogin = async () => {
    if (!signInLoaded || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code });
      if (result.status === 'needs_new_password') {
        setSuccessMsg('Code verified! Please enter your new password.');
        setError(''); // Clear any previous errors
        setMode('reset-password-email');
      } else if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        router.push('/');
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      const msg = isClerkAPIResponseError(err) ? err.errors[0]?.message : 'Invalid code';
      setError(msg ?? 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeLogin = async () => {
    console.log("email", email);
    if (!email || !backupCode) {
      setError('Please enter both email and backup code');
      return;
    }
    if (loginWithCode.isPending || isLoading) return;
    
    setError('');
    try {
      // here we will call the login with backup codes api
      console.log("email", email);
      const result = await loginWithCode.mutateAsync({ 
        email: email,
        code: backupCode 
      });
      // on success we will show the reset password code section
      if (!result.success) {
        setError('Invalid email or backup code. Please try again.');
        return;
      }
      setSuccessMsg('Backup code verified! Please enter the reset password code.');
      setError('');
      setMode('reset-password-code');
    } catch (err) {
      setError('Invalid email or backup code. Please try again.');
    }
  };

  const handleResetPasswordEmail = async () => {
    if (!signInLoaded || isLoading) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    console.log("password", password);
    try {
      const result = await signIn.resetPassword({ password });
      console.log("password", password);
      console.log("result", result);
      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        setSuccessMsg('Password reset successfully!');
        router.push('/');
      }
    } catch (err) {
      const msg = isClerkAPIResponseError(err) ? err.errors[0]?.message : 'Error';
      console.log("Error in reset password", msg);
      setError(msg ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordCode = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }
    if (updatePassword.isPending || isLoading) return;
    
    setError('');
    try {
      const result = await updatePassword.mutateAsync({ email: email, newPassword: password });
      if(!result.success) {
        setError('Failed to reset password. Please try again.');
        return;
      }
      // For now, just show success and redirect
      setSuccessMsg('Password reset successfully!');
      setError('');
      router.push('/');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  const renderInput = (type: string, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={isLoading || loginWithCode.isPending || updatePassword.isPending}
      className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  );

  const renderPasswordInput = (placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, showPassword: boolean, toggleVisibility: () => void) => (
    <div className="relative mb-3">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={isLoading || loginWithCode.isPending || updatePassword.isPending}
        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        disabled={isLoading || loginWithCode.isPending || updatePassword.isPending}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );

  const renderForm = () => {
    switch (mode) {
      case 'sign-up':
        return (
          <>
            {renderInput('email', 'Email', email, (e) => setEmail(e.target.value))}
            {renderPasswordInput('Password', password, (e) => setPassword(e.target.value), showPassword, () => setShowPassword(!showPassword))}
            {renderPasswordInput('Confirm Password', confirmPassword, (e) => setConfirmPassword(e.target.value), showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleSignUp}
              disabled={isLoading || !signUpLoaded}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Sign Up'}
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account?{' '}
              <button onClick={() => { clearState(); setMode('sign-in'); }} className="text-blue-600 hover:underline" disabled={isLoading}>
                Sign In
              </button>
            </p>
          </>
        );
      case 'sign-in':
        return (
          <>
            {renderInput('email', 'Email', email, (e) => setEmail(e.target.value))}
            {renderPasswordInput('Password', password, (e) => setPassword(e.target.value), showPassword, () => setShowPassword(!showPassword))}
            <button
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleSignIn}
              disabled={isLoading || !signInLoaded}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>
            <p className="text-sm text-center mt-4">
              <button onClick={handleForgotPassword} className="text-blue-500 hover:underline" disabled={isLoading}>
                Forgot Password?
              </button>
            </p>
            <p className="text-sm text-center mt-2">
              Don&apos;t have an account?{' '}
              <button onClick={() => { clearState(); setMode('sign-up'); }} className="text-blue-600 hover:underline" disabled={isLoading}>
                Sign Up
              </button>
            </p>
          </>
        );
      case 'verify-email':
        return (
          <>
            <p className="mb-2 text-sm text-gray-700">Enter the verification code sent to your email.</p>
            {renderInput('text', 'Verification Code', code, (e) => setCode(e.target.value))}
            <button
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleVerify}
              disabled={isLoading || !signUpLoaded}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify Email'}
            </button>
          </>
        );
      case 'code-login':
        return (
          <>
            <p className="text-sm text-gray-700 mb-2">Enter the security code sent to your email.</p>
            {renderInput('text', 'Security Code', code, (e) => setCode(e.target.value))}
            <button
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleCodeLogin}
              disabled={isLoading || !signInLoaded}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify Code'}
            </button>
            <p className="text-sm text-center mt-4">
              Didn&apos;t receive the code?{' '}
              <button onClick={() => { setError(''); setSuccessMsg(''); setMode('backup-codes'); }} className="text-blue-600 hover:underline" disabled={isLoading}>
                Use backup codes instead
              </button>
            </p>
            <p className="text-sm text-center mt-2">
              <button onClick={() => { clearState(); setMode('sign-in'); }} className="text-blue-600 hover:underline" disabled={isLoading}>
                Back to Sign In
              </button>
            </p>
          </>
        );
      case 'backup-codes':
        return (
          <>
            <p className="text-sm text-gray-700 mb-2">Enter your email and one of your backup codes to reset your password.</p>
            {renderInput('email', 'Email Address', email, (e) => setEmail(e.target.value))}
            {renderInput('text', 'Backup Code', backupCode, (e) => setBackupCode(e.target.value))}
            <button
              className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleBackupCodeLogin}
              disabled={loginWithCode.isPending}
            >
              {loginWithCode.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify Backup Code'}
            </button>
            <p className="text-sm text-center mt-4">
              <button onClick={() => { setError(''); setSuccessMsg(''); setMode('code-login'); }} className="text-blue-600 hover:underline" disabled={loginWithCode.isPending}>
                Back to email code
              </button>
            </p>
            <p className="text-sm text-center mt-2">
              <button onClick={() => { clearState(); setMode('sign-in'); }} className="text-blue-600 hover:underline" disabled={loginWithCode.isPending}>
                Back to Sign In
              </button>
            </p>
          </>
        );
      case 'reset-password-email':
        return (
          <>
            <p className="text-sm text-gray-700 mb-2">Enter your new password.</p>
            {renderPasswordInput('New Password', password, (e) => setPassword(e.target.value), showPassword, () => setShowPassword(!showPassword))}
            {renderPasswordInput('Confirm New Password', confirmPassword, (e) => setConfirmPassword(e.target.value), showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
            <button
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleResetPasswordEmail}
              disabled={isLoading || !signInLoaded}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </>
              ) : 'Reset Password'}
            </button>
          </>
        );
      case 'reset-password-code':
        return (
          <>
            <p className="text-sm text-gray-700 mb-2">Enter your new password.</p>
            {renderPasswordInput('New Password', password, (e) => setPassword(e.target.value), showPassword, () => setShowPassword(!showPassword))}
            {renderPasswordInput('Confirm New Password', confirmPassword, (e) => setConfirmPassword(e.target.value), showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
            <button
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleResetPasswordCode}
              disabled={updatePassword.isPending}
            >
              {updatePassword.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </>
              ) : 'Reset Password'}
            </button>
          </>
        );
      case 'forgot-password':
        return (
          <>
            <p className="text-sm text-gray-700 mb-2">Enter your email address to receive a password reset code.</p>
            {renderInput('email', 'Enter your email', email, (e) => setEmail(e.target.value))}
            <button
              className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleForgotPasswordRequest}
              disabled={isLoading || !signInLoaded}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send Reset Code'}
            </button>
            <p className="text-sm text-center mt-4">
              Have backup codes?{' '}
              <button onClick={() => { setError(''); setSuccessMsg(''); setMode('backup-codes'); }} className="text-blue-600 hover:underline" disabled={isLoading}>
                Use backup codes instead
              </button>
            </p>
            <p className="text-sm text-center mt-2">
              Remembered your password?{' '}
              <button onClick={() => { clearState(); setMode('sign-in'); }} className="text-blue-600 hover:underline" disabled={isLoading}>
                Back to Sign In
              </button>
            </p>
          </>
        );
    }
  };

  return (
    <div className="w-90 mx-auto p-4 py-8 bg-white rounded-xl shadow-lg border border-gray-200 mt-0">
      <h2 className="text-2xl font-bold mb-4 text-center capitalize text-gray-800">
        {mode.replace('-', ' ')}
      </h2>

      {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
      {successMsg && <p className="text-green-600 text-sm mb-4 text-center">{successMsg}</p>}

      {renderForm()}
    </div>
  );
}
