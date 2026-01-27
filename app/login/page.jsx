"use client";
import SignInPage from "./components/Sign-In";
import SignInPageOTP from "./components/Sign-InOTP";
import { useState, useEffect } from "react";
import ForgotPassword from "./components/ForgotPassword";

export default function Page() {
  const [isSignInOpen, setIsSignInOpen] = useState(true);
  const [isSignInOTPOpen, setIsSignInOTPOpen] = useState(false);
  const [email, setEmail] = useState('******@gmail.com')
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  return (
    <>
      <SignInPage
        isOpen={isSignInOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignInOTPOpen={setIsSignInOTPOpen}
        setIsForgotPasswordOpen={setIsForgotPasswordOpen}
      />
      <SignInPageOTP
        isOpen={isSignInOTPOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignInOTPOpen={setIsSignInOTPOpen}
      />
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsForgotPasswordOpen={setIsForgotPasswordOpen}
      />
    </>
  );
}
