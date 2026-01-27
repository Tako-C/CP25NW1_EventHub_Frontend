'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authPasswordReset } from '@/libs/fetch';
import Cookie from 'js-cookie';
import Notification from '@/components/Notification/Notification';
import { Eye, EyeOff, Clock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State สำหรับนับเวลาถอยหลัง
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const inputRefs = useRef([]);
  const router = useRouter();
  
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  useEffect(() => {
    const savedEmail = Cookie.get('resetPasswordEmail');
    if (!savedEmail) {
      setNotification({
        isVisible: true,
        isError: true,
        message: "Email information not found. Please try again.",
      });
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setEmail(savedEmail);
      
      const key = `otp_forgot_${savedEmail}`;
      const savedEndTime = localStorage.getItem(key);
      
      if (savedEndTime) {
        const updateTimer = () => {
          const now = Date.now();
          const remaining = Math.floor((parseInt(savedEndTime) - now) / 1000);
          
          if (remaining <= 0) {
            setTimeLeft(0);
            setIsExpired(true);
          } else {
            setTimeLeft(remaining);
            setIsExpired(false);
          }
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);
        return () => clearInterval(timerId);
      } else {
        setIsExpired(true); 
      }
    }
  }, [router]);

  const closeNotification = () => setNotification(prev => ({ ...prev, isVisible: false }));

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== "" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (isExpired) {
       setNotification({ isVisible: true, isError: true, message: "OTP has expired. Please request a new one." });
       return;
    }

    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setNotification({ isVisible: true, isError: true, message: "Please enter the complete 6-digit OTP." });
      return;
    }
    if (newPassword.length < 8) {
      setNotification({ isVisible: true, isError: true, message: "Password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotification({ isVisible: true, isError: true, message: "Confirm password does not match the new password." });
      return;
    }

    try {
      const res = await authPasswordReset(email, otpCode, newPassword, confirmPassword);
      
      if (res.statusCode === 200) {
        setNotification({ 
            isVisible: true, 
            isError: false, 
            message: "Password reset successful! Redirecting to login..." 
        });
        Cookie.remove('resetPasswordEmail');
        if (email) localStorage.removeItem(`otp_forgot_${email}`);
        
        setTimeout(() => {
            router.push('/login');
        }, 2000);
      }
    } catch (error) {
      setNotification({
        isVisible: true,
        isError: true,
        message: error.data?.message || "An error occurred while resetting password.",
      });
    }
  };

  if (!email) return null;

  return (
    <>
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-semibold text-center mb-2">
            Reset Password
          </h1>
          
          <div className="text-center mb-6">
             <p className="text-sm text-gray-500 mb-2">
               Enter the OTP sent to {email}
             </p>
             
             <div className={`flex items-center justify-center gap-2 text-sm font-medium ${isExpired ? 'text-red-500' : 'text-blue-600'}`}>
                <Clock size={16} />
                {isExpired ? (
                  <span>OTP Expired</span>
                ) : (
                  <span>Time remaining: {timeLeft}s</span>
                )}
             </div>
          </div>

          {/* OTP Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 text-center">OTP Code</label>
            <div className="flex gap-2 justify-center mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  disabled={isExpired}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-10 h-12 text-center text-xl border-2 rounded-lg focus:outline-none ${
                    isExpired 
                      ? 'bg-gray-100 border-gray-300 text-gray-400' 
                      : 'border-gray-300 focus:border-purple-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* New Password Section */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-gray-700 font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  disabled={isExpired}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  disabled={isExpired}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                     !isExpired && confirmPassword && newPassword !== confirmPassword 
                     ? 'border-red-500 focus:ring-red-500' 
                     : 'border-gray-300 focus:ring-purple-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {isExpired ? (
            <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-500 text-white py-3 rounded-full font-semibold hover:bg-gray-600 transition"
            >
                Back to Request OTP
            </button>
          ) : (
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition"
            >
                Confirm Reset Password
            </button>
          )}
        </div>
      </div>
    </>
  );
}