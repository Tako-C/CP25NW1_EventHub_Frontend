"use client";

import { useState, useRef, useEffect } from "react";
import {
  authRegisterVerify,
  authLoginPassword,
  authRegisterRequest,
} from "@/libs/fetch";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import Notification from "@/components/Notification/Notification";

export default function Page() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [data, setData] = useState(null);
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (message, isError = false) => {
    setNotification({
      isVisible: true,
      message: message,
      isError: isError,
    });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const raw = Cookie.get("signupData");
    if (raw) {
      try {
        const stored = JSON.parse(raw);
        setData(stored);
      } catch (err) {
        console.error("Invalid signupData cookie", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!data?.email) return;
    const key = `otp_end_time_${data.email}`;
    const savedEnd = localStorage.getItem(key);
    if (savedEnd) {
      const remaining = Math.floor((savedEnd - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
      else localStorage.removeItem(key);
    }
  }, [data?.email]);

  useEffect(() => {
    if (cooldown <= 0 || !data?.email) return;
    const key = `otp_end_time_${data.email}`;
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
  }, [cooldown, data?.email]);

  const handleResend = async () => {
    if (cooldown > 0 || !data?.email) return;

    try {
      setLoading(true);
      setCooldown(60);
      const newEnd = Date.now() + 60 * 1000;
      localStorage.setItem(`otp_end_time_${data.email}`, newEnd);

      await authRegisterRequest(
        data?.firstName,
        data?.lastName,
        data?.email,
        data?.password
      );
      
      showNotification("ส่งรหัส OTP ใหม่ไปยังอีเมลของท่านแล้ว");
    } catch (error) {
      showNotification("ไม่สามารถส่งรหัสใหม่ได้ กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    setIsDisabled(newOtp.join("").length !== 6);

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
    try {
      const otpCode = otp.join("");
      if (otpCode.length === 6) {
        await authRegisterVerify(
          data?.email,
          otpCode,
          data?.password
        );

        const loginRes = await authLoginPassword(data?.email, data?.password);

        localStorage.removeItem(`otp_end_time_${data?.email}`);
        
        Cookie.set("token", loginRes?.data?.token, { path: "/" });
        
        Cookie.remove("signupData");
        window.dispatchEvent(new Event("user-logged-in"));
        
        showNotification("ยืนยันตัวตนสำเร็จ กำลังเข้าสู่ระบบ...");

        setTimeout(() => {
          router.push("/home");
        }, 1500);
      }
    } catch (error) {
      // showNotification(error.data?.message || "รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง", true);
      showNotification("รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง", true);
    }
  };

  return (
    <>
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
            ยืนยันรหัส OTP
          </h1>

          <div className="mb-6 text-center">
            <h2 className="text-lg font-medium mb-2 text-gray-800">กรอกรหัสยืนยัน</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              เราได้ส่งรหัสยืนยัน 6 หลักไปยังอีเมล <br/>
              <span className="font-bold text-gray-700">{data?.email}</span>
            </p>

            <div className="flex gap-2 justify-center mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition-all"
                />
              ))}
            </div>

            <div className="text-center mb-8">
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="text-sm font-semibold text-purple-600 underline hover:text-purple-800 disabled:text-gray-400 disabled:no-underline transition-colors"
              >
                {cooldown > 0 ? `ขอรหัสใหม่ได้ในอีก ${cooldown} วินาที` : "ส่งรหัสใหม่อีกครั้ง"}
              </button>
            </div>

            <button
              onClick={handleContinue}
              disabled={isDisabled}
              className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 ${
                isDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-blue-900 text-white hover:bg-blue-800 shadow-blue-100"
              }`}
            >
              ดำเนินการต่อ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}