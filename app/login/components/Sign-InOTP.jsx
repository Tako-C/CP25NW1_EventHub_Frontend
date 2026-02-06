'use client';

import { useRouter } from 'next/navigation';
import { authLoginOTPRequest } from '@/libs/fetch';
import Cookie from 'js-cookie';
import RequestOTPForm from './RequestOTPForm';

export default function SignInPageOTP({
  isOpen,
  setIsSignInOpen,
  setIsSignInOTPOpen,
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSuccess = (email) => {
    Cookie.set('signinData', JSON.stringify(email));
    router.push('/login/otp');
  };

  const handleBackToSignIn = () => {
    setIsSignInOTPOpen(false);
    setIsSignInOpen(true);
  };

  return (
    <RequestOTPForm
      title="Sign in with OTP"
      buttonText="Sent OTP"
      apiFunction={authLoginOTPRequest}
      onSuccess={handleSuccess}
      onSwitchMode={handleBackToSignIn}
      switchModeText="Sign in with Email"
      storageKeyPrefix="otp_end_time"
    />
  );
}