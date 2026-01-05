"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginOTPRequest } from "@/libs/fetch";
import Cookies from "js-cookie";
import Notification from "@/components/Notification/Notification";

export default function SignInPageOTP({
  isOpen,
  setIsSignInOpen,
  setIsSignInOTPOpen,
}) {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (!email) return;
    const key = `otp_end_time_${email}`;
    const savedEnd = localStorage.getItem(key);
    if (savedEnd) {
      const remaining = Math.floor((savedEnd - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
      else localStorage.removeItem(key);
    }
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0 || !email) return;
    const key = `otp_end_time_${email}`;
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
  }, [cooldown, email]);

  const handleSubmit = async (e) => {
    if (!validateForm()) return;

    const OTP_COOLDOWN_SEC = 60;
    const STORAGE_KEY = `otp_end_time_${email}`;
    const now = Date.now();

    try {
      const savedEndTime = localStorage.getItem(STORAGE_KEY);
      if (savedEndTime && savedEndTime > now) {
        const remaining = Math.floor((savedEndTime - now) / 1000);
        setCooldown(remaining);
        router.push("/login/otp");
        return;
      }

      const res = await loginOTPRequest(email);

      if (res.statusCode === 200) {
        const newEndTime = Date.now() + OTP_COOLDOWN_SEC * 1000;
        localStorage.setItem(STORAGE_KEY, newEndTime);

        setCooldown(OTP_COOLDOWN_SEC);
        Cookies.set("signinData", JSON.stringify(email));

        router.push("/login/otp");
      } else if (res.statusCode === 500) {
        setNotification({
          isVisible: true,
          isError: true,
          message: res?.message,
        });
      } else {
        // throw new Error(`Unexpected status code: ${res.statusCode}`);
        setNotification({
          isVisible: true,
          isError: true,
          message: res?.message,
        });
      }
    } catch (error) {
      setNotification({
        isVisible: true,
        isError: true,
        message: error,
      });

      localStorage.removeItem(STORAGE_KEY);
      setCooldown(0);

      window.alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleSignIn = () => {
    setIsSignInOTPOpen(false);
    setIsSignInOpen(true);
  };
  const handleSignUp = () => {
    router.push("/sign-up");
  };
  if (!isOpen) return null;

  const validateField = (field, value) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "* กรุณากรอกอีเมล";
        if (!value.includes("@") || !value.endsWith(".com"))
          return "* อีเมลไม่ถูกต้อง (ต้องมี @ และ .com)";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const err = validateField("email", email);
    if (err) {
      newErrors.email = err;
    }
    setErrors(newErrors);
    return !newErrors.email;
  };

  return (
    <>
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />
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
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
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
