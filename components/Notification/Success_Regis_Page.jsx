// import React from 'react';
import { Check } from "lucide-react";

export default function SuccessPage({ detail }) {
  console.log(detail);
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Success Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8">
          Success!
        </h1>

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative">
          {/* Decorative Lines */}
          {/* <div className="absolute left-0 top-1/2 w-1/4 h-px bg-gray-300 hidden md:block"></div>
          <div className="absolute right-0 top-1/2 w-1/4 h-px bg-gray-300 hidden md:block"></div> */}

          {/* Check Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-14 h-14 text-white stroke-[3]" />
            </div>
          </div>

          {/* Success Message */}
          <p className="text-center text-gray-700 text-lg md:text-xl mb-8 leading-relaxed">
            You have successfully registered {detail?.eventName}. You can check
            your QR Code and registration details on your profile page.
          </p>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-3 rounded-full transition-colors duration-200">
              Continue to profile page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
