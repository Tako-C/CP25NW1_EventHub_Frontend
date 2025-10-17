"use client";
import SignInPage from "./components/Sign-In";
import SignInPageOTP from "./components/Sign-InOTP";
import { useState, useEffect } from "react";

export default function Page() {
  const [isSignInOpen, setIsSignInOpen] = useState(true);
  const [isSignInOTPOpen, setIsSignInOTPOpen] = useState(false);
  const [email, setEmail] = useState('******@gmail.com')

  return (
    <>
      <SignInPage
        isOpen={isSignInOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignInOTPOpen={setIsSignInOTPOpen}
      />
      <SignInPageOTP
        isOpen={isSignInOTPOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignInOTPOpen={setIsSignInOTPOpen}
      />
    </>
  );
}
