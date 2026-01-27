'use client';

import { useRouter } from 'next/navigation';
import { authPasswordForgot } from '@/libs/fetch';
import Cookie from 'js-cookie';
import RequestOTPForm from './RequestOTPForm';

export default function ForgotPassword({
  isOpen,
  setIsSignInOpen,
  setIsForgotPasswordOpen,
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSuccess = (email) => {
    Cookie.set('resetPasswordEmail', email, { expires: 0.0035 });
    router.push('/login/reset-password');
  };

  const handleBackToSignIn = () => {
    setIsForgotPasswordOpen(false);
    setIsSignInOpen(true);
  };

  return (
    <RequestOTPForm
      title="Forgot Password"
      buttonText="Send Reset Link"
      apiFunction={authPasswordForgot}
      onSuccess={handleSuccess}
      onSwitchMode={handleBackToSignIn}
      switchModeText="Back to Sign in"
      storageKeyPrefix="otp_forgot"
      cooldownTime={300}
    />
  );
}