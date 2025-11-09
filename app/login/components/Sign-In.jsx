"use client";

import Cookie from "js-cookie";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginPassWord } from "@/libs/fetch";

export default function SignInPage({
  isOpen,
  setIsSignInOpen,
  setIsSignInOTPOpen,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // if (!email.includes("@") || !email.endsWith(".com")) {
    //   alert("Please enter a valid email address with '@' and '.com'");
    //   return;
    // }
    if (!validateForm()) {
      return;
    }
    const res = await loginPassWord(email, password);
    // console.log(res?.data.token);
    if (res.statusCode === 200) {
      Cookie.set("token", res?.data.token);
      // router.push("/home");
      window.location.href = "/home";
    } else if (res.statusCode === 401) {
      window.alert("Email or Password is incorrect");
    }
  };

  // ✅ ตรวจแต่ละช่องแบบเรียลไทม์
  const validateField = (field, value) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "* กรุณากรอกอีเมล";
        if (!value.includes("@") || !value.endsWith(".com"))
          return "* อีเมลไม่ถูกต้อง (ต้องมี @ และ .com)";
        return "";
      case "password":
        if (!value.trim()) return "* กรุณากรอกรหัสผ่าน";
        if (value.length < 8) return "* รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        return "";
      default:
        return "";
    }
  };

  // ✅ ตรวจทั้งฟอร์มก่อน submit
  const validateForm = () => {
    const newErrors = {};
    const emailErr = validateField("email", email);
    if (emailErr) {
      newErrors.email = emailErr;
    }
    const passwordErr = validateField("password", password);
    if (passwordErr) {
      newErrors.password = passwordErr;
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleOTPLogin = () => {
    setIsSignInOpen(false);
    setIsSignInOTPOpen(true);
  };
  const handleSignUp = () => {
    router.push("/sign-up");
  };
  if (!isOpen) return null;
  return (
    <>
      <div className="flex items-center justify-center py-20 px-4 mt-18">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Sign in
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
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition mb-6"
            >
              Sign in
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
              onClick={handleOTPLogin}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              {/* <Smartphone className="w-5 h-5 text-gray-400" /> */}
              Sign in with OTP
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
