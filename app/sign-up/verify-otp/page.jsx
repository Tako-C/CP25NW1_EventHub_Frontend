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
  // const [errors, setErrors] = useState("");
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

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

    setLoading(true);
    setCooldown(60);
    const newEnd = Date.now() + 60 * 1000;
    localStorage.setItem(`otp_end_time_${data.email}`, newEnd);

    const res = await authRegisterRequest(
      data?.firstName,
      data?.lastName,
      data?.email,
      data?.password
    );

    setTimeout(() => setLoading(false), 500);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    setIsDisabled(newOtp.join("").length !== 6);
    // setErrors("");

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // const handleContinue = async () => {
  //   const otpCode = otp.join("");

  //   if (otpCode.length === 6) {
  //     try {
  //       const res = await authRegisterVerify(
  //         data?.email,
  //         otpCode,
  //         data?.password
  //       );
  //       if (res.statusCode === 200) {
  //         const resLogin = await authLoginPassword(data?.email, data?.password);
  //         if (resLogin?.statusCode === 200 || resLogin?.data?.token) {
  //           Cookie.set("token", resLogin?.data.token);
  //           Cookie.remove("signupData");
  //           // window.location.href = '/home';
  //           router.push("/home");
  //           setTimeout(() => {
  //             window.location.reload();
  //           }, 100);
  //         }
  //       } else {
  //         setErrors("รหัส OTP ไม่ถูกต้อง");
  //       }
  //     } catch (error) {
  //       console.error("Error confirming OTP:", error);
  //       setErrors("เกิดข้อผิดพลาด กรุณาลองใหม่");
  //     }
  //   }
  // };

  const handleContinue = async () => {
    try {
      const otpCode = otp.join("");
      if (otpCode.length === 6) {
        // 1. ยืนยัน OTP (ถ้า Backend error จะ throw ไป catch เอง)
        await authRegisterVerify(
          data?.email,
          otpCode,
          data?.password
        );

        // 2. Login เพื่อรับ Token
        const loginRes = await authLoginPassword(data?.email, data?.password);

        // 3. ลบ Cooldown (ต้องใช้ data.email ให้ตรงกับตอน set)
        localStorage.removeItem(`otp_end_time_${data?.email}`);
        
        // 4. บันทึก Token (แก้ไขจาก res เป็น loginRes)
        Cookie.set("token", loginRes?.data?.token, { path: "/" });
        
        // 5. ลบข้อมูลชั่วคราวและ Redirect
        Cookie.remove("signupData");

        window.dispatchEvent(new Event("user-logged-in"));
        router.push("/home");
      }
    } catch (error) {
      setNotification({
        isVisible: true,
        isError: true,
        message: error.data?.message,
      });
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
            Verify OTP
          </h1>

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

            {/* {errors && (
              <p className="text-red-500 text-sm text-center mb-4">{errors}</p>
            )} */}

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
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-900 text-white hover:bg-blue-800"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
