"use client";

import Cookie from "js-cookie";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authLoginPassword } from "@/libs/fetch";
import Notification from "@/components/Notification/Notification";
// เพิ่ม Import Icon สำหรับ UX ที่ดีขึ้น
import { Eye, EyeOff, XCircle } from "lucide-react";

export default function SignInPage({
  isOpen,
  setIsSignInOpen,
  setIsSignInOTPOpen,
  setIsForgotPasswordOpen,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  // 1. [Effect] ดึงค่าอีเมลที่เคยจำไว้ใน localStorage เมื่อโหลดหน้า
  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await authLoginPassword(email, password);

      if (res.statusCode === 200) {
        // 2. [Logic] จัดการการจดจำอีเมลตามสถานะ Checkbox
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }

        Cookie.set("token", res?.data.token, { path: "/" });
        window.dispatchEvent(new Event("user-logged-in"));

        showNotification("เข้าสู่ระบบสำเร็จ กำลังนำท่านไปหน้าหลัก...");

        if (Cookie.get("surveyPost")) {
          const redirectPath = Cookie.get("surveyPost");
          Cookie.remove("surveyPost");
          setTimeout(() => router.push(redirectPath), 1000);
          return;
        }

        setTimeout(() => router.push("/home"), 1000);
      }
    } catch (error) {
      const errorMsg = error.status === 401 
        ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" 
        : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง";
      showNotification(errorMsg, true);
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "* กรุณากรอกอีเมล";
        if (!value.includes("@") || !value.endsWith(".com"))
          return "* รูปแบบอีเมลไม่ถูกต้อง (ต้องมี @ และลงท้ายด้วย .com)";
        return "";
      case "password":
        if (!value.trim()) return "* กรุณากรอกรหัสผ่าน";
        if (value.length < 8) return "* รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: validateField("email", email),
      password: validateField("password", password)
    };
    const cleanErrors = Object.fromEntries(Object.entries(newErrors).filter(([_, v]) => v));
    setErrors(cleanErrors);
    return Object.keys(cleanErrors).length === 0;
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsSignInOpen(false);
    setIsForgotPasswordOpen(true);
  };

  const handleOTPLogin = () => {
    setIsSignInOpen(false);
    setIsSignInOTPOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">เข้าสู่ระบบ</h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
            {/* Field: Email */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2 ml-1">อีเมล</label>
              <div className="relative">
                <input
                  id="email"
                  name="email" // สำหรับ Browser Autofill
                  type="email"
                  autoComplete="username" // ใบ้ให้ Browser จำชื่อผู้ใช้
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 transition-all"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Field: Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2 ml-1">รหัสผ่าน</label>
              <div className="relative">
                <input
                  id="password"
                  name="password" // สำหรับ Browser Autofill
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password" // ใบ้ให้ Browser จำรหัสผ่าน
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between mb-6 px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">จดจำฉันไว้</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-500 hover:text-blue-600 underline bg-transparent border-none cursor-pointer"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition-all active:scale-[0.98] mb-6 shadow-md"
            >
              เข้าสู่ระบบ
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium uppercase">หรือ</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOTPLogin}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบด้วย OTP
            </button>
          </form>

          <p className="text-center mt-6 text-gray-700">
            ยังไม่มีบัญชีผู้ใช้?{" "}
            <button
              onClick={() => router.push("/sign-up")}
              className="text-blue-500 hover:text-blue-600 font-medium underline-offset-4 hover:underline"
            >
              ลงทะเบียนที่นี่!
            </button>
          </p>
        </div>
      </div>
    </>
  );
}