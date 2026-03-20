"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getData, authRegisterRequest } from "@/libs/fetch";
import Cookie from "js-cookie";
import { Eye, EyeOff, Users, ChevronDown, Calendar } from "lucide-react";
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

  const handleSignIn = () => {
    router.push("/login");
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
            สร้างบัญชีใหม่
          </h1>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
                ชื่อจริง
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="กรอกชื่อจริงของคุณ"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                maxLength={20}
                className={`w-full px-4 py-3 border ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1 ml-2">{errors.firstName}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
                นามสกุล
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="กรอกนามสกุลของคุณ"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                maxLength={20}
                className={`w-full px-4 py-3 border ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1 ml-2">{errors.lastName}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                maxLength={50}
                className={`w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 ml-2">{errors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 ml-1 text-sm">
                เพศ
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Users size={18} />
                </div>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none text-gray-700"
                >
                  {genderOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 ml-1 text-sm">
                วันเดือนปีเกิด
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className={`w-full pl-11 pr-4 py-3 border ${errors.dateOfBirth ? "border-red-500" : "border-gray-300"} rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-700`}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1 ml-3">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" class="block text-gray-700 font-medium mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ตั้งรหัสผ่านของคุณ"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  maxLength={20}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 ml-2">{errors.password}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" class="block text-gray-700 font-medium mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  maxLength={20}
                  className={`w-full px-4 py-3 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 ml-2">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">
                  ฉันยอมรับ{" "}
                  <Link href="#" className="text-blue-500 hover:text-blue-600 font-semibold">
                    เงื่อนไขและข้อกำหนด
                  </Link>{" "}
                  และ{" "}
                  <Link href="#" className="text-blue-500 hover:text-blue-600 font-semibold">
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3.5 rounded-full font-bold hover:bg-blue-800 transition shadow-lg active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังดำเนินการ..." : "สร้างบัญชีผู้ใช้"}
            </button>
          </div>

          <p className="text-center mt-6 text-gray-700">
            มีบัญชีผู้ใช้อยู่แล้ว?{" "}
            <button
              onClick={handleSignIn}
              className="text-blue-500 hover:text-blue-600 font-bold"
            >
              เข้าสู่ระบบที่นี่
            </button>
          </p>
        </div>
      </div>
    </>
  );
}