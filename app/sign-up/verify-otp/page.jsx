"use client";

import { useState, useRef, useEffect } from "react";
import { registerOTP, loginPassWord } from "@/libs/fetch";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";

export default function Page() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [data, setData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(Cookie.get("signupData"));
    if (stored) setData(stored);
  }, []);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      const res = await registerOTP(data?.email, otpCode, data?.password);
      if (res.statusCode === 200) {
        const resLogin = await loginPassWord(data?.email, data?.password);
        Cookie.set("token", resLogin?.data.token);
        // router.push("/home");
        window.location.href = "/home";

      } else {
        alert("Please enter correct OTP");
      }
    } else {
      alert("Please enter complete OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-8">Verify OTP</h1>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Enter Your OTP</h2>
          <p className="text-sm text-gray-500 mb-6">
            ส่งรหัส 6 หลักไปยัง {data?.email}
          </p>

          <div className="flex gap-2 justify-center mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            ))}
          </div>

          <div className="text-center mb-6">
            <button className="text-sm text-gray-600 underline hover:text-purple-600">
              Resend code
            </button>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
