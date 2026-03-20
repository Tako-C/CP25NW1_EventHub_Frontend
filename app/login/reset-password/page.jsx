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

  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const inputRefs = useRef([]);
  const router = useRouter();
  
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

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
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const savedEmail = Cookie.get('resetPasswordEmail');
    if (!savedEmail) {
      showNotification("ไม่พบข้อมูลอีเมล กรุณาลองใหม่อีกครั้ง", true);
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
       showNotification("รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่อีกครั้ง", true);
       return;
    }

    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      showNotification("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก", true);
      return;
    }
    if (newPassword.length < 8) {
      showNotification("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร", true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification("รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่", true);
      return;
    }

    try {
      const res = await authPasswordReset(email, otpCode, newPassword, confirmPassword);
      
      if (res.statusCode === 200) {
        showNotification("รีเซ็ตรหัสผ่านสำเร็จ! กำลังนำท่านไปยังหน้าเข้าสู่ระบบ...");
        Cookie.remove('resetPasswordEmail');
        if (email) localStorage.removeItem(`otp_forgot_${email}`);
        
        setTimeout(() => {
            router.push('/login');
        }, 2000);
      }
    } catch (error) {
      // showNotification(error.data?.message || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง", true);
      showNotification("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง", true);
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
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            รีเซ็ตรหัสผ่าน
          </h1>
          
          <div className="text-center mb-8">
             <p className="text-sm text-gray-500 mb-3">
               ระบุรหัส OTP ที่ส่งไปยัง <span className="font-semibold text-gray-700">{email}</span>
             </p>
             
             <div className={`flex items-center justify-center gap-2 text-sm font-bold py-2 px-4 rounded-full inline-flex ${isExpired ? 'text-red-500 bg-red-50' : 'text-blue-600 bg-blue-50'}`}>
                <Clock size={16} />
                {isExpired ? (
                  <span>หมดเวลาส่งรหัส</span>
                ) : (
                  <span>เวลาที่เหลือ: {timeLeft} วินาที</span>
                )}
             </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-bold mb-3 text-center uppercase tracking-wide text-xs">รหัส OTP 6 หลัก</label>
            <div className="flex gap-2 justify-center">
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
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                    isExpired 
                      ? 'bg-gray-100 border-gray-200 text-gray-400' 
                      : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-50'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5 mb-8">
            <div>
              <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm">รหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านใหม่"
                  value={newPassword}
                  disabled={isExpired}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 transition-all disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm">ยืนยันรหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  disabled={isExpired}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-5 py-3.5 border-2 rounded-2xl focus:outline-none transition-all disabled:bg-gray-50 ${
                     !isExpired && confirmPassword && newPassword !== confirmPassword 
                     ? 'border-red-400 focus:border-red-500' 
                     : 'border-gray-200 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {isExpired ? (
            <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
                กลับไปขอรหัส OTP ใหม่
            </button>
          ) : (
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
                ยืนยันการเปลี่ยนรหัสผ่าน
            </button>
          )}
        </div>
      </div>
    </>
  );
}