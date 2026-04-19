'use client';

import { useState, useEffect } from 'react';
import { Mail, Zap } from 'lucide-react';
import Notification from '@/components/Notification/Notification';

export default function RequestOTPForm({
  title,
  subtitle,
  buttonText,
  apiFunction,
  onSuccess,
  onSwitchMode,
  switchModeText,
  storageKeyPrefix = 'otp_end_time',
  cooldownTime = 60,
}) {
  const [email, setEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: '' });

  const showNotification = (message, isError = false) => {
    setNotification({ isVisible: true, message, isError });
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const closeNotification = () => setNotification((prev) => ({ ...prev, isVisible: false }));

  useEffect(() => {
    if (!email) return;
    const key = `${storageKeyPrefix}_${email}`;
    const savedEnd = localStorage.getItem(key);
    if (savedEnd) {
      const remaining = Math.floor((savedEnd - Date.now()) / 1000);
      if (remaining > 0) setCooldown(remaining);
      else localStorage.removeItem(key);
    }
  }, [email, storageKeyPrefix]);

  useEffect(() => {
    if (cooldown <= 0 || !email) return;
    const key = `${storageKeyPrefix}_${email}`;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { localStorage.removeItem(key); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, email, storageKeyPrefix]);

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = '* กรุณากรอกอีเมลของคุณ';
    else if (!email.includes('@') || !email.endsWith('.com')) newErrors.email = '* รูปแบบอีเมลไม่ถูกต้อง';
    setErrors(newErrors);
    return !newErrors.email;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const STORAGE_KEY = `${storageKeyPrefix}_${email}`;
    const now = Date.now();
    try {
      const savedEndTime = localStorage.getItem(STORAGE_KEY);
      if (savedEndTime && savedEndTime > now) {
        const remaining = Math.floor((savedEndTime - now) / 1000);
        setCooldown(remaining);
        onSuccess(email);
        return;
      }
      const res = await apiFunction(email);
      if (res.statusCode === 200) {
        const newEndTime = Date.now() + cooldownTime * 1000;
        localStorage.setItem(STORAGE_KEY, newEndTime);
        setCooldown(cooldownTime);
        showNotification('ส่งรหัส OTP ไปยังอีเมลของท่านเรียบร้อยแล้ว');
        onSuccess(email);
      }
    } catch (error) {
      showNotification('เกิดข้อผิดพลาดในการขอรหัส OTP กรุณาลองใหม่อีกครั้ง', true);
      localStorage.removeItem(STORAGE_KEY);
      setCooldown(0);
    }
  };

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
            <h2 className="text-3xl font-bold text-white mb-4 leading-snug">ความปลอดภัย<br />เป็นสิ่งสำคัญ</h2>
            <p className="text-purple-200 text-base leading-relaxed">ระบบจะส่งรหัส OTP ไปยังอีเมลที่ลงทะเบียนไว้เพื่อยืนยันตัวตนของคุณ</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">Expo Hub</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-purple-200"
              >
                {buttonText}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-gray-50 text-gray-400 font-medium">หรือ</span>
                </div>
              </div>

              <button
                onClick={onSwitchMode}
                className="w-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium text-sm transition-all"
              >
                {switchModeText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}