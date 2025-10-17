"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerRequest } from "@/libs/fetch";
import Cookie from "js-cookie";

export default function Page() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    // phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    const res = await registerRequest(
      formData?.firstName,
      formData?.lastName,
      formData?.email,
      formData?.password
    );
    console.log(res);
    if (res.statusCode === 200) {
      // e.preventDefault();
      // sessionStorage.setItem("signupData", JSON.stringify(formData));
      Cookie.set("signupData", formData)
      router.push("/sign-up/verify-otp");
    }
  };
  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center py-20 px-4 mt-18">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Create Account
        </h1>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-gray-700 font-medium mb-2"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-medium mb-2"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
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
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 font-medium mb-2"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div> */}

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
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
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
                I agree to the{" "}
                <Link href="#" className="text-blue-500 hover:text-blue-600">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-500 hover:text-blue-600">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!agreeTerms}
            className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Create Account
          </button>
        </div>

        <p className="text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <button
            onClick={handleSignIn}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
