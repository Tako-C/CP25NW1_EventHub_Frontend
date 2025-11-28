'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  X,
  ScanLine,
  Link,
  ClipboardList,
  User,
  AlertCircle,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { qrCodefetch, getUserInfo, getImage } from '@/libs/fetch';

export default function QRScannerCheckin() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationState, setNotificationState] = useState({
    error: false,
    message: '',
  });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmData, setConfirmData] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanSuccess = async (results) => {
    if (!results || results.length === 0) return;

    const rawValue = results[0].rawValue;
    const qrContent =
      rawValue.startsWith('"') && rawValue.endsWith('"')
        ? rawValue.slice(1, -1)
        : rawValue;

    setIsScanning(false);

    try {
      const res = await getUserInfo(qrContent);

      if (res?.statusCode === 200 && res.data) {
        const user = res.data.userProfile || {};
        const event = res.data.eventDetail || {};
        setConfirmData({
          qrContent: qrContent,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          imgPath: user.imgPath,
          eventName: event.eventName || 'Unknown Event',
        });

        if (user.imgPath) {
          fetchUserImage(user.imgPath);
        } else {
          setUserImage(null);
        }
      } else {
        throw new Error(res?.message || 'User not found');
      }
    } catch (error) {
      console.error('Scan Error:', error);
      showError(error.message);
    }
  };

  const fetchUserImage = async (path) => {
    try {
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      const imgUrl = await getImage(`upload/users/${cleanPath}`);
      setUserImage(imgUrl);
    } catch (err) {
      console.error('Error loading user image', err);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!confirmData) return;
    setIsProcessing(true);

    try {
      const res = await qrCodefetch(confirmData.qrContent);

      if (res?.statusCode === 200 || res?.message === 'Check-in successful') {
        setNotificationState({
          error: false,
          message: `Checked-in: ${confirmData.firstName}`,
        });
        setShowNotification(true);
        setConfirmData(null);
      } else {
        throw new Error(res?.message || 'Check-in failed');
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const showError = (msg) => {
    setNotificationState({ error: true, message: msg });
    setShowNotification(true);
    setConfirmData(null);
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setShowNotification(false);
    setIsScanning(true);
  };

  const handleCancel = () => {
    setConfirmData(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-20 z-[100] animate-fade-in px-4 w-full max-w-sm">
          <div
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border bg-white ${
              notificationState.error ? 'border-red-100' : 'border-green-100'
            }`}
          >
            <div
              className={`p-2 rounded-full flex-shrink-0 ${
                notificationState.error
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {notificationState.error ? (
                <X size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={`font-bold text-sm ${
                  notificationState.error ? 'text-red-700' : 'text-gray-900'
                }`}
              >
                {notificationState.error ? 'Error' : 'Success'}
              </h4>
              <p
                className={`text-xs mt-0.5 ${
                  notificationState.error ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                {notificationState.message}
              </p>
            </div>
            <button
              onClick={closeNotification}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="bg-purple-50 p-6 flex flex-col items-center border-b border-purple-100">
              <div className="mb-5 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-purple-100 rounded-full shadow-sm flex items-center gap-2">
                <Calendar size={14} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wide">
                  {confirmData.eventName}
                </span>
              </div>

              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-200 overflow-hidden mb-3">
                {userImage ? (
                  <img
                    src={userImage}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={40} />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center">
                {confirmData.firstName} {confirmData.lastName}
              </h3>
              <p className="text-sm text-gray-500">{confirmData.email}</p>
            </div>

            {/* Actions */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCancel}
                  className="py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={isProcessing}
                  className="py-3 rounded-xl font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:bg-purple-300"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <ScanLine size={22} className="text-purple-600" />
            QR Scanner
          </h1>
          <p className="text-gray-400 text-xs mt-1">Scan visitor ticket</p>
        </div>

        <div className="relative aspect-square bg-black rounded-2xl overflow-hidden mb-6 border border-gray-100 shadow-inner ring-1 ring-black/5">
          {isScanning ? (
            <div className="w-full h-full relative">
              <Scanner
                onScan={handleScanSuccess}
                onError={(error) => console.log(error)}
                scanDelay={100}
                allowMultiple={true}
                components={{ audio: false, finder: true }}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { width: '100%', height: '100%', objectFit: 'cover' },
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-900 p-6 text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                  error
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {error ? <X size={28} /> : <ScanLine size={28} />}
              </div>
              <p className="font-semibold text-base mb-1">
                {error ? 'Error' : 'Scan Complete'}
              </p>
              <p className="text-gray-400 text-xs mb-5 px-4">
                {error ? errorMessage : 'Check-in process finished.'}
              </p>

              <button
                onClick={resetScanner}
                className="px-6 py-2.5 bg-white text-gray-900 rounded-full text-xs font-bold hover:bg-gray-100 transition shadow-lg active:scale-95"
              >
                Scan Next
              </button>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/staff/event/check-in"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors py-2 px-4 rounded-lg hover:bg-purple-50"
          >
            <ClipboardList size={16} />
            Manual Check-in
          </Link>
        </div>
      </div>
    </div>
  );
}
