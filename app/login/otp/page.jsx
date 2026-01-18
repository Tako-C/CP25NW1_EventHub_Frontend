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
  // const [errors, setErrors] = useState("");
  const [eventId, setEventId] = useState();

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const data = Cookie.get("signinData");
    if (data) {
      const email = JSON?.parse(Cookie.get("signinData"));
      console.log(email);
      if (email) setData(email);
    }
  }, []);

  useEffect(() => {
    const raw_up = Cookie.get("signupDataFromRegis");
    const raw_in = Cookie.get("signinDataFromRegis");
    if (raw_in) {
      const data = JSON.parse(raw_in);
      console.log(data);
      setNotification({
        isVisible: true,
        isError: true,
        message:
          "You Have an account, Please Sign in by Enter OTP before registration event",
      });
      setData(data?.email);
      setEventId(data?.eventId);
      setCooldown(60);
      Cookie.remove("signinDataFromRegis");
    }
    if (raw_up) {
      const data = JSON.parse(raw_up);
      console.log(data);
      setNotification({
        isVisible: true,
        isError: true,
        message:
          "You Have no an account, Please Sign in by Enter OTP before registration event",
      });
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
    console.log(data);
    if (cooldown > 0 || !data) return;

    setLoading(true);
    setCooldown(60);
    const newEnd = Date.now() + 60 * 1000;
    localStorage.setItem(`otp_end_time_${data}`, newEnd);

    const res = await authLoginOTPRequest(data);

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
  //   console.log(otpCode);
  //   if (otpCode.length === 6) {
  //     if (eventId) {
  //       const res = await verifyEmailOTP(data, otpCode, eventId);
  //       console.log(res);
  //       if (res.statusCode === 200) {
  //         Cookie.set("token", res?.data.token);
  //         // window.location.href = `/profile?tab=events`;
  //         router.push("/profile?tab=events");
  //         setTimeout(() => {
  //           window.location.reload();
  //         }, 100);
  //       }
  //     } else {
  //       const res = await authLoginOTPVerify(data, otpCode);
  //       console.log("res", res);
  //       if (res.statusCode === 200) {
  //         Cookie.set("token", res?.data.token);
  //         Cookie.remove("signinData");
  //         // window.location.href = '/home';
  //         router.push("/home");
  //         setTimeout(() => {
  //           window.location.reload();
  //         }, 100);
  //       } else {
  //         setErrors("ใส่ OTP ให้ถูกต้อง");
  //       }
  //     }
  //   }
  // };

  const handleContinue = async () => {
    try {
      const otpCode = otp.join("");
      if (otpCode.length === 6) {
        const res = eventId
          ? await verifyEmailOTP(data, otpCode, eventId)
          : await authLoginOTPVerify(data, otpCode);

        localStorage.removeItem(`otp_end_time_${data}`);

        Cookie.set("token", res?.data.token, { path: "/" });
        if (!eventId) Cookie.remove("signinData");

        window.dispatchEvent(new Event("user-logged-in"));
        router.push(eventId ? "/profile?tab=events" : "/home");
      }
    } catch (error) {
      // setErrors("ใส่ OTP ให้ถูกต้อง");
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
