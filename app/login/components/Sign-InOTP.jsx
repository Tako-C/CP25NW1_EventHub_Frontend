"use client";

import React, { useState } from "react";

export default function SignInPageOTP({
  isOpen,
  setIsSignInOpen,
  setIsSignInOTPOpen,
  setIsSignUpOpen,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  // const router = useRouter();

  const handleSubmit = () => {
    console.log("Login submitted", { email, password, rememberMe });
  };

  const handleSignIn = () => {
    setIsSignInOTPOpen(false)
    setIsSignInOpen(true)
  };
    const handleSignUp = () => {
    setIsSignInOTPOpen(false)
    setIsSignUpOpen(true)
  };
  if (!isOpen) return null;

  return (
    <>
      <div className="flex items-center justify-center py-20 px-4 mt-18">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Sign in with OTP
          </h1>
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition mb-6"
            >
              Sent OTP
            </button>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  OR
                </span>
              </div>
            </div>
            <button
              onClick={handleSignIn}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              {/* <Smartphone className="w-5 h-5 text-gray-400" /> */}
              Sign in with Email
            </button>
          </div>

          <p className="text-center mt-6 text-gray-700">
            Don't have account?{" "}
            <button
              onClick={handleSignUp}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Register Here!
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
