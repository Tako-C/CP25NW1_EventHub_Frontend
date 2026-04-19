"use client";

import Cookie from "js-cookie";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authLoginPassword, getData } from "@/libs/fetch";
import Notification from "@/components/Notification/Notification";
import { Eye, EyeOff, XCircle, Mail, Lock, Zap } from "lucide-react";

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
  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam === "inactive") {
      showNotification("ไม่สามารถเข้าสู่ระบบได้ เนื่องจากบัญชีของท่านยังไม่ได้เปิดใช้งาน (INACTIVE) กรุณาติดต่อผู้ดูแลระบบ", true);
    } else if (errorParam === "ban") {
      showNotification("ไม่สามารถเข้าสู่ระบบได้ เนื่องจากบัญชีของท่านถูกระงับการใช้งาน (BAN) กรุณาติดต่อผู้ดูแลระบบ", true);
    }
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
  }, []);

  const showNotification = (message, isError = false) => {
    setNotification({ isVisible: true, message, isError });
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const closeNotification = () => setNotification((prev) => ({ ...prev, isVisible: false }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await authLoginPassword(email, password);
      if (res.statusCode === 200) {
        Cookie.set("token", res?.data.token, { path: "/" });
        const profileRes = await getData("users/me/profile");
        const userStatus = profileRes?.data?.status;
        if (userStatus === "INACTIVE" || userStatus === "BAN") {
          Cookie.remove("token");
          const statusLabel = userStatus === "INACTIVE" ? "ยังไม่ได้เปิดใช้งาน (INACTIVE)" : "ถูกระงับการใช้งาน (BAN)";
          showNotification(`ไม่สามารถเข้าสู่ระบบได้ เนื่องจากบัญชีของท่าน${statusLabel} กรุณาติดต่อผู้ดูแลระบบ`, true);
          return;
        }
        if (rememberMe) { localStorage.setItem("remembered_email", email); }
        else { localStorage.removeItem("remembered_email"); }
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
      const errorMsg = error.status === 401 ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง";
      showNotification(errorMsg, true);
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "* กรุณากรอกอีเมล";
        if (!value.includes("@") || !value.endsWith(".com")) return "* รูปแบบอีเมลไม่ถูกต้อง";
        return "";
      case "password":
        if (!value.trim()) return "* กรุณากรอกรหัสผ่าน";
        if (value.length < 8) return "* รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        return "";
      default: return "";
    }
  };

  const validateForm = () => {
    const newErrors = { email: validateField("email", email), password: validateField("password", password) };
    const cleanErrors = Object.fromEntries(Object.entries(newErrors).filter(([_, v]) => v));
    setErrors(cleanErrors);
    return Object.keys(cleanErrors).length === 0;
  };

  const handleForgotPassword = (e) => { e.preventDefault(); setIsSignInOpen(false); setIsForgotPasswordOpen(true); };
  const handleOTPLogin = () => { setIsSignInOpen(false); setIsSignInOTPOpen(true); };

  if (!isOpen) return null;

  return (
    <>
      <Notification isVisible={notification.isVisible} isError={notification.isError} message={notification.message} onClose={closeNotification} />

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* Brand panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 flex-col items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-white/5 rounded-full" />
          <div className="relative z-10 text-center max-w-sm">
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">Expo Hub</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-snug">ยินดีต้อนรับ<br />กลับมา</h2>
            <p className="text-purple-200 text-base leading-relaxed">เข้าสู่ระบบเพื่อเข้าถึงกิจกรรม รางวัล และประสบการณ์ที่รอคุณอยู่</p>
            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              {[{ label: "กิจกรรม", value: "100+" }, { label: "ผู้ใช้งาน", value: "5K+" }, { label: "รางวัล", value: "200+" }].map((s) => (
                <div key={s.label} className="bg-white/10 rounded-2xl p-3">
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-purple-200 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Expo Hub</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
              <p className="text-gray-500 mt-1 text-sm">
                ยังไม่มีบัญชี?{" "}
                <button onClick={() => router.push("/sign-up")} className="text-purple-600 hover:text-purple-700 font-semibold">สมัครสมาชิกฟรี</button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" name="email" autoComplete="username" placeholder="example@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.email ? "border-red-400" : "border-gray-200"}`} />
                  {email && (
                    <button type="button" onClick={() => setEmail("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder="รหัสผ่านของคุณ" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.password ? "border-red-400" : "border-gray-200"}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer" />
                  <span className="text-sm text-gray-600">จดจำฉันไว้</span>
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-sm text-purple-600 hover:text-purple-700 font-medium">ลืมรหัสผ่าน?</button>
              </div>

              <button type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-purple-200">
                เข้าสู่ระบบ
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-gray-50 text-gray-400 font-medium">หรือเข้าสู่ระบบด้วย</span>
                </div>
              </div>

              <button type="button" onClick={handleOTPLogin}
                className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2">
                <span className="text-base">📧</span> เข้าสู่ระบบด้วย OTP
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}