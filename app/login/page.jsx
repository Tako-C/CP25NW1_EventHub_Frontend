"use client";
import SignInPage from "./components/Sign-In";
import SignInPageOTP from "./components/Sign-InOTP";
import SignUpPage from "./components/Sign-Up";
import { useState, useEffect } from "react";

export default function Page() {
  const [isSignInOpen, setIsSignInOpen] = useState(true);
  const [isSignInOTPOpen, setIsSignInOTPOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <>
      <SignInPage
        isOpen={isSignInOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignInOTPOpen={setIsSignInOTPOpen}
        setIsSignUpOpen={setIsSignUpOpen}
      />
      <SignInPageOTP
        isOpen={isSignInOTPOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignInOTPOpen={setIsSignInOTPOpen}
        setIsSignUpOpen={setIsSignUpOpen}
      />
      <SignUpPage
        isOpen={isSignUpOpen}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignUpOpen={setIsSignUpOpen}
      />
    </>
  );
}
