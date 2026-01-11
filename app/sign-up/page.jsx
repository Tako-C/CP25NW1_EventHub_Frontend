'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getData, authRegisterRequest } from '@/libs/fetch';
import Cookie from 'js-cookie';
import { Eye, EyeOff } from 'lucide-react';
import Notification from '@/components/Notification/Notification';

export default function Page() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    message: '',
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

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

  const validateField = (field, value) => {
    switch (field) {
      case 'firstName':
        return value.trim() ? '' : '* กรุณากรอกชื่อจริง';
      case 'lastName':
        return value.trim() ? '' : '* กรุณากรอกนามสกุล';
      case 'email':
        if (!value.trim()) return '* กรุณากรอกอีเมล';
        if (!value.includes('@') || !value.endsWith('.com'))
          return '* อีเมลไม่ถูกต้อง (ต้องมี @ และ .com)';
        return '';
      case 'password':
        return value.trim() ? '' : '* กรุณากรอกรหัสผ่าน';
      case 'confirmPassword':
        if (!value.trim()) return '* กรุณายืนยันรหัสผ่าน';
        if (value !== formData.password) return '* รหัสผ่านไม่ตรงกัน';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData?.email;

    if (!validateForm() || !agreeTerms) {
      if (!agreeTerms) {
        console.log('Please agree to the Terms & Conditions.');
      }
      return;
    }

    const key = `otp_end_time_${email}`;

    try {
      setLoading(true);

      Cookie.set('signupData', JSON.stringify(formData), {
        secure: true,
        sameSite: 'strict',
      });

      const savedEnd = localStorage.getItem(key);
      const remaining = savedEnd
        ? Math.floor((savedEnd - Date.now()) / 1000)
        : 0;

      if (remaining > 0) {
        setCooldown(remaining);
        router.push('/sign-up/verify-otp');
        return;
      }

      const endTime = Date.now() + 60 * 1000;
      localStorage.setItem(key, endTime);
      setCooldown(60);

      const res = await authRegisterRequest(
        formData?.firstName,
        formData?.lastName,
        formData?.email,
        formData?.password
      );

      if (res.statusCode === 200) {
        router.push('/sign-up/verify-otp');
      } else if (res.statusCode === 400) {
        localStorage.removeItem(key);
        setCooldown(0);
        setNotification({
          isVisible: true,
          isError: true,
          message: res?.message,
        });
      } else {
        localStorage.removeItem(key);
        setCooldown(0);
        setNotification({
          isVisible: true,
          isError: true,
          message: res?.message,
        });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      localStorage.removeItem(key);
      setCooldown(0);
      setNotification({
        isVisible: true,
        isError: true,
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSignIn = () => {
    router.push('/login');
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
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                maxLength={20}
                className={`w-full px-4 py-3 border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
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
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                maxLength={20}
                className={`w-full px-4 py-3 border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
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
                onChange={(e) => handleInputChange('email', e.target.value)}
                maxLength={50}
                className={`w-full px-4 py-3 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
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
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  maxLength={20}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  maxLength={20}
                  className={`w-full px-4 py-3 border ${
                    errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
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
                  I agree to the{' '}
                  <Link href="#" className="text-blue-500 hover:text-blue-600">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
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
            Already have an account?{' '}
            <button
              onClick={handleSignIn}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
