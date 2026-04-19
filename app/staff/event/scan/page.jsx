'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, ScanLine, ClipboardList, User, Calendar, Loader2, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { postQRCheckIn, postQRUserInfo, getImage } from '@/libs/fetch';
import Notification from '@/components/Notification/Notification';

export default function QRScannerCheckin() {
  const [isScanning, setIsScanning] = useState(true);
  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: '' });
  const [confirmData, setConfirmData] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };
  const closeNotification = () => setNotification((prev) => ({ ...prev, isVisible: false }));

  const handleScanSuccess = async (results) => {
    if (!results || results.length === 0) return;
    const rawValue = results[0].rawValue;
    const qrContent = rawValue.startsWith('"') && rawValue.endsWith('"') ? rawValue.slice(1, -1) : rawValue;
    setIsScanning(false);
    try {
      const res = await postQRUserInfo(qrContent);
      if (res?.statusCode === 200 && res.data) {
        const user = res.data.userProfile || {};
        const event = res.data.eventDetail || {};
        setConfirmData({
          qrContent,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          imgPath: user.imgPath,
          eventName: event.eventName || 'ไม่ระบุชื่อกิจกรรม',
        });
        if (user.imgPath) fetchUserImage(user.imgPath);
        else setUserImage(null);
      } else {
        throw new Error(res?.message || 'ไม่พบข้อมูลผู้ใช้งาน');
      }
    } catch (error) {
      showNotification(error.message, true);
      setIsScanning(true);
    }
  };

  const fetchUserImage = async (path) => {
    try {
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      const imgUrl = await getImage(`upload/users/${cleanPath}`);
      setUserImage(imgUrl);
    } catch { setUserImage(null); }
  };

  const handleConfirmCheckIn = async () => {
    if (!confirmData) return;
    setIsProcessing(true);
    try {
      const res = await postQRCheckIn(confirmData.qrContent);
      if (res?.statusCode === 200 || res?.message === 'Check-in successful') {
        showNotification(`Check-in สำเร็จ: ${confirmData.firstName}`, false);
        setConfirmData(null);
        setIsScanning(true);
      } else {
        throw new Error(res?.message || 'Check-in ไม่สำเร็จ');
      }
    } catch (error) {
      showNotification(error.message, true);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScanner = () => { setConfirmData(null); setIsScanning(true); };
  const handleCancel = () => { setConfirmData(null); setIsScanning(true); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Notification isVisible={notification.isVisible} onClose={closeNotification} isError={notification.isError} message={notification.message} />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Expo Hub</span>
              <p className="text-xs text-gray-400 leading-none">Staff Portal</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
            QR Scanner
          </span>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full mb-5">
                <Calendar size={13} className="text-white" />
                <span className="text-xs font-bold text-white truncate max-w-[200px]">{confirmData.eventName}</span>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 overflow-hidden mb-3">
                {userImage ? (
                  <img src={userImage} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={36} className="text-white/70" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white text-center">{confirmData.firstName} {confirmData.lastName}</h3>
              <p className="text-sm text-white/70">{confirmData.email}</p>
            </div>

            {/* Modal actions */}
            <div className="p-5">
              <p className="text-center text-sm text-gray-500 mb-4">ยืนยันการ Check-in ผู้เข้าร่วมงานคนนี้?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleCancel}
                  className="py-3 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  ยกเลิก
                </button>
                <button onClick={handleConfirmCheckIn} disabled={isProcessing}
                  className="py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> ยืนยัน</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Scanner card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-5 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                  <ScanLine size={18} className="text-purple-600" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">สแกน QR Code</h1>
                  <p className="text-xs text-gray-400">ชี้กล้องไปที่ QR Code บัตรของผู้เข้าร่วม</p>
                </div>
              </div>
            </div>

            {/* Camera area */}
            <div className="relative aspect-square bg-gray-900">
              {isScanning ? (
                <div className="w-full h-full relative">
                  <Scanner
                    onScan={handleScanSuccess}
                    onError={(error) => console.log(error)}
                    scanDelay={200}
                    allowMultiple={false}
                    components={{ audio: false, finder: true }}
                    styles={{
                      container: { width: '100%', height: '100%' },
                      video: { width: '100%', height: '100%', objectFit: 'cover' },
                    }}
                  />
                  {/* Corner brackets */}
                  {/* <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400 rounded-br-lg" />
                    </div>
                  </div> */}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500/20">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <p className="font-bold text-base mb-1">สแกนเรียบร้อย</p>
                  <p className="text-gray-400 text-xs mb-6">กำลังตรวจสอบข้อมูล...</p>
                  <button onClick={resetScanner}
                    className="px-6 py-2.5 bg-white text-gray-900 rounded-full text-sm font-bold hover:bg-gray-100 transition active:scale-95">
                    สแกนใบถัดไป
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-center border-t border-gray-50">
              <Link href="/staff/event/check-in"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 font-semibold transition-colors py-1">
                <ClipboardList size={15} />
                เปลี่ยนเป็น Manual Check-in
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Expo Hub Staff Portal · QR Scanner
          </p>
        </div>
      </div>
    </div>
  );
}