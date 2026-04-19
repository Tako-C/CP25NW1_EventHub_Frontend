"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getData, authRegisterRequest } from "@/libs/fetch";
import Cookie from "js-cookie";
import { Eye, EyeOff, Users, ChevronDown, Calendar, Zap, Mail, Lock } from "lucide-react";
import Notification from "@/components/Notification/Notification";

export default function Page() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "N",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isError = false) => {
    setNotification({
      isVisible: true,
      isError: isError,
      message: msg,
    });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const genderOptions = [
    { id: "M", label: "ชาย" },
    { id: "F", label: "หญิง" },
    { id: "U", label: "เพศที่สาม" },
    { id: "N", label: "ไม่ระบุ" },
  ];

  useEffect(() => {
    if (!formData.email) return;
    const key = `otp_end_time_${formData.email}`;
    const savedEnd = localStorage.getItem(key);
    if (savedEnd) {
      const remaining = Math.floor((savedEnd - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
      else localStorage.removeItem(key);
    }
  }, [formData.email]);

  useEffect(() => {
    if (cooldown <= 0 || !formData.email) return;
    const key = `otp_end_time_${formData.email}`;
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
  }, [cooldown, formData.email]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "* กรุณากรอกชื่อจริง";
    if (!formData.lastName.trim()) newErrors.lastName = "* กรุณากรอกนามสกุล";
    
    if (!formData.email.trim()) {
      newErrors.email = "* กรุณากรอกอีเมล";
    } else if (!formData.email.includes("@") || !formData.email.endsWith(".com")) {
      newErrors.email = "* รูปแบบอีเมลไม่ถูกต้อง (ต้องมี @ และลงท้ายด้วย .com)";
    }

    if (!formData.dateOfBirth) newErrors.dateOfBirth = "* กรุณาเลือกวันเกิด";
    
    if (!formData.password.trim()) {
      newErrors.password = "* กรุณากรอกรหัสผ่าน";
    } else if (formData.password.length < 8) {
      newErrors.password = "* รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "* รหัสผ่านยืนยันไม่ตรงกัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = formData?.email;

    if (!validateForm()) return;

    if (!agreeTerms) {
      showNotification("กรุณากดยอมรับเงื่อนไขและข้อกำหนดการใช้งาน", true);
      return;
    }

    const key = `otp_end_time_${email}`;

    try {
      setLoading(true);

      Cookie.set("signupData", JSON.stringify(formData), {
        secure: true,
        sameSite: "strict",
      });

      const savedEnd = localStorage.getItem(key);
      const remaining = savedEnd ? Math.floor((savedEnd - Date.now()) / 1000) : 0;

      if (remaining > 0) {
        setCooldown(remaining);
        router.push("/sign-up/verify-otp");
        return;
      }

      const res = await authRegisterRequest(
        formData?.firstName,
        formData?.lastName,
        formData?.email,
        formData?.password,
        formData.gender,
        formData.dateOfBirth,
      );

      if (res.statusCode === 200 || res.statusCode === 201) {
        const endTime = Date.now() + 60 * 1000;
        localStorage.setItem(key, endTime);
        setCooldown(60);
        showNotification("ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว");
        setTimeout(() => {
          router.push("/sign-up/verify-otp");
        }, 1500);
      }
    } catch (error) {
      console.error("Registration error:", error);
      localStorage.removeItem(key);
      setCooldown(0);
      // showNotification(error.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง", true);
      showNotification("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => router.push("/login");

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
            <h2 className="text-3xl font-bold text-white mb-4 leading-snug">เริ่มต้น<br />ประสบการณ์ใหม่</h2>
            <p className="text-purple-200 text-base leading-relaxed">สมัครสมาชิกและเข้าร่วมกิจกรรม สะสมรางวัล และอีกมากมาย</p>
            <div className="mt-10 space-y-3">
              {["เข้าร่วมกิจกรรมพิเศษ", "สะสมคะแนนและรางวัล", "รับการแจ้งเตือนก่อนใคร"].map((t) => (
                <div key={t} className="flex items-center gap-3 text-left bg-white/10 rounded-xl px-4 py-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="text-white text-sm font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Expo Hub</span>
            </div>

            <div className="mb-7">
              <h1 className="text-3xl font-bold text-gray-900">สร้างบัญชีใหม่</h1>
              <p className="text-gray-500 mt-1 text-sm">
                มีบัญชีอยู่แล้ว?{" "}
                <button onClick={handleSignIn} className="text-purple-600 hover:text-purple-700 font-semibold">เข้าสู่ระบบ</button>
              </p>
            </div>

            <div className="space-y-4">
              {/* ชื่อ-นามสกุล */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อจริง</label>
                  <input
                    type="text" placeholder="ชื่อ" value={formData.firstName} maxLength={20}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.firstName ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">นามสกุล</label>
                  <input
                    type="text" placeholder="นามสกุล" value={formData.lastName} maxLength={20}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.lastName ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* อีเมล */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email" placeholder="example@email.com" value={formData.email} maxLength={50}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.email ? "border-red-400" : "border-gray-200"}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* เพศ + วันเกิด */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">เพศ</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 appearance-none transition-all"
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">วันเกิด</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="date" value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className={`w-full pl-10 pr-3 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.dateOfBirth ? "border-red-400" : "border-gray-200"}`}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>
              </div>

              {/* รหัสผ่าน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"} placeholder="ตั้งรหัสผ่านของคุณ (อย่างน้อย 8 ตัว)" value={formData.password} maxLength={20}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.password ? "border-red-400" : "border-gray-200"}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* ยืนยันรหัสผ่าน */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ยืนยันรหัสผ่าน</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"} placeholder="กรอกรหัสผ่านอีกครั้ง" value={formData.confirmPassword} maxLength={20}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* ยอมรับเงื่อนไข */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  ฉันยอมรับ{" "}
                  <Link href="#" className="text-purple-600 hover:text-purple-700 font-semibold">เงื่อนไขและข้อกำหนด</Link>{" "}
                  และ{" "}
                  <Link href="#" className="text-purple-600 hover:text-purple-700 font-semibold">นโยบายความเป็นส่วนตัว</Link>
                </span>
              </label>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังดำเนินการ..." : "สร้างบัญชี"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}