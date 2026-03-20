"use client";

import { useState, useRef, useEffect } from "react";
import {
  authLoginOTPVerify,
  authLoginOTPRequest,
  verifyEmailOTP,
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
  const [eventId, setEventId] = useState();

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
    const data = Cookie.get("signinData");
    if (data) {
      try {
        const email = JSON.parse(data);
        if (email) setData(email);
      } catch (e) {
        setData(data);
      }
    }
  }, []);

  useEffect(() => {
    const raw_up = Cookie.get("signupDataFromRegis");
    const raw_in = Cookie.get("signinDataFromRegis");
    
    if (raw_in) {
      const data = JSON.parse(raw_in);
      showNotification("ท่านมีบัญชีผู้ใช้อยู่แล้ว กรุณายืนยันรหัส OTP เพื่อเข้าสู่ระบบก่อนลงทะเบียนกิจกรรม", true);
      setData(data?.email);
      setEventId(data?.eventId);
      setCooldown(60);
      Cookie.remove("signinDataFromRegis");
    }
    
    if (raw_up) {
      const data = JSON.parse(raw_up);
      showNotification("ท่านยังไม่มีบัญชีผู้ใช้ กรุณายืนยันรหัส OTP เพื่อสร้างบัญชีและลงทะเบียนกิจกรรม", true);
      setData(data?.email);
      setEventId(data?.eventId);
      setCooldown(60);
      Cookie.remove("signupDataFromRegis");
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
    try {
      setCooldown(60);
      const newEnd = Date.now() + 60 * 1000;
      localStorage.setItem(`otp_end_time_${data}`, newEnd);

      await authLoginOTPRequest(data);
      showNotification("ส่งรหัส OTP ใหม่ไปยังอีเมลของท่านแล้ว");
    } catch (error) {
      showNotification("ไม่สามารถส่งรหัสใหม่ได้ กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setLoading(false);
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
        const res = eventId
          ? await verifyEmailOTP(eventId, data, otpCode)
          : await authLoginOTPVerify(data, otpCode);

        localStorage.removeItem(`otp_end_time_${data}`);
        Cookie.set("token", res?.data.token, { path: "/" });
        
        if (!eventId) Cookie.remove("signinData");

        window.dispatchEvent(new Event("user-logged-in"));
        showNotification("ยืนยันตัวตนสำเร็จ กำลังนำท่านไปยังขั้นตอนถัดไป...");

        setTimeout(() => {
          if (Cookie.get("surveyPost")) {
            const redirectPath = Cookie.get("surveyPost");
            Cookie.remove("surveyPost");
            router.push(redirectPath);
            return;
          }
          router.push(eventId ? "/profile?tab=events" : "/home");
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
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-semibold text-center mb-8">
            ยืนยันรหัส OTP
          </h1>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2 text-gray-800 italic">เข้าสู่ระบบ / ยืนยันตัวตน</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              เราได้ส่งรหัสยืนยัน 6 หลักไปยังอีเมล <br/>
              <span className="font-bold text-gray-700">{data}</span>
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
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              ))}
            </div>

            <div className="text-center mb-8">
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 disabled:text-gray-400 disabled:no-underline transition-colors"
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
              ยืนยันรหัส
            </button>
          </div>
        </div>
      </div>
    </>
  );
}