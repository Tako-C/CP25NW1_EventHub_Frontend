"use client";

import { useState, useRef, useEffect } from "react";
import { loginOTPVerify, loginOTPRequest } from "@/libs/fetch";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Page() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [data, setData] = useState(null);
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    // const stored = sessionStorage.getItem("signinData");
    const data = Cookies.get("signinData");
    if (data !== null || data !== undefined) {
      const email = JSON?.parse(Cookies.get("signinData"));
      console.log(email);
      if (email) setData(email);
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    const key = `otp_end_time_${data}`;
    const savedEnd = localStorage.getItem(key);
    if (savedEnd) {
      const remaining = Math.floor((savedEnd - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
      else localStorage.removeItem(key);
    }
  }, [data]);

  useEffect(() => {
    if (cooldown <= 0 || !data) return;
    const key = `otp_end_time_${data}`;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(key);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, data]);

  const handleResend = async () => {
    if (cooldown > 0 || !data) return;

    setLoading(true);
    setCooldown(60);
    const newEnd = Date.now() + 60 * 1000;
    localStorage.setItem(`otp_end_time_${data}`, newEnd);

    const res = await loginOTPRequest(data);

    setTimeout(() => setLoading(false), 500);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    setIsDisabled(newOtp.join("").length !== 6);
    setErrors("");

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
    console.log(otpCode);
    if (otpCode.length === 6) {
      const res = await loginOTPVerify(data, otpCode);
      console.log("res", res);
      if (res.statusCode === 200) {
        // router.push('/home')
        Cookies.set("token", res?.data.token);
        Cookies.remove('signinData');

        window.location.href = "/home";
      } else {
        setErrors("ใส่ OTP ให้ถูกต้อง");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-8">Verify OTP</h1>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Sign IN</h2>
          <p className="text-sm text-gray-500 mb-6">
            ส่งรหัส 6 หลักไปยัง {data}
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

          {errors && (
            <p className="text-red-500 text-sm text-center mb-4">{errors}</p>
          )}

          <div className="text-center mb-6">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || loading}
              className="text-sm text-gray-600 underline hover:text-purple-600 disabled:text-gray-400"
            >
              {cooldown > 0 ? `รอ ${cooldown} วินาที` : "Resend code"}
            </button>
          </div>

          <button
            onClick={handleContinue}
            disabled={isDisabled}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${isDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-900 text-white hover:bg-blue-800"
              }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
