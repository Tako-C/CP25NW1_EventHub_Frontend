'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, ScanLine } from 'lucide-react';
import { qrCodefetch } from '@/libs/fetch';

export default function QRScannerCheckin() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState();
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScanSuccess = async (results) => {
    if (!results || results.length === 0) return;
    console.log('result', results);
    setIsScanning(false);

    const data = results[0].rawValue;
    const desiredValue = data.slice(1, -1);

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const dateString = now.toLocaleDateString('en-GB');

    setScanResult({
      date: dateString,
      time: timeString,
    });

    try {
      console.log('yoo');
      const res = await qrCodefetch(desiredValue);
      console.log(res?.message);

      setShowNotification(true);
    } catch (error) {
      console.error('Check-in failed:', error.message);
      setError(true);
      setErrorMessage(error.message);
    }
  };

  const closeNotification = () => {
    setShowNotification(false);
  };

  const resetScanner = () => {
    setScanResult(null);
    setShowNotification(false);
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {showNotification && scanResult && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl p-4 pr-12 relative min-w-[400px]">
            <button
              onClick={closeNotification}
              className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
            >
              <X size={14} />
            </button>
            <p className="text-gray-800">
              <b>{scanResult.name}</b> Scanned at {scanResult.date} —{' '}
              <span className="text-red-500 font-semibold">
                {scanResult.time}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <ScanLine size={22} className="text-purple-600" />
              QR Scanner
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Scan visitor ticket for admission
            </p>
          </div>

          {/* Scanner Area */}
          <div className="relative bg-gray-100 rounded-2xl p-6 mb-6 border-4 border-gray-800">
            <div className="aspect-square bg-black rounded-xl overflow-hidden relative">
              {isScanning ? (
                <Scanner
                  allowMultiple={false}
                  onScan={handleScanSuccess}
                  onError={(e) => console.log(e)}
                  scanDelay={100} // 0.1s → สแกนเร็ว
                  components={{
                    finder: true, // เปิดกรอบสี่เหลี่ยมแบบสแกนเนอร์จริง
                    tracker: false, // ← ปิดเสียง beep ที่ซ่อนอยู่
                    audio: false, // ← ปิดระบบเสียงทั้งหมด
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    },
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-xl text-gray-700">Scan Complete</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            {isScanning ? (
              <p className="text-gray-600 text-lg">Scanning QR Code...</p>
            ) : (
              <>
                {error ? (
                  <p className="text-red-500 text-2xl font-semibold mb-4">
                    {errorMessage}
                  </p>
                ) : (
                  <p className="text-green-500 text-2xl font-semibold mb-4">
                    Check-in Successful
                  </p>
                )}

                <button
                  onClick={resetScanner}
                  className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
                >
                  Scan Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
