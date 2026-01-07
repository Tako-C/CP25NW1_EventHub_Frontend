'use client';

import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function Error403() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 shadow-xl">
                <ShieldX
                  className="w-20 h-20 md:w-24 md:h-24 text-red-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>

          <h1 className="text-7xl md:text-9xl font-bold text-gray-900 mb-4">
            403
          </h1>

          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            ไม่มีสิทธิ์เข้าถึง
          </h2>

          <p className="text-gray-600 text-base md:text-lg mb-8 px-4">
            ขออภัย คุณไม่ได้รับอนุญาตให้เข้าถึงหน้านี้
            <br className="hidden sm:block" />
            กรุณาตรวจสอบสิทธิ์การเข้าถึงของคุณ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <button
              onClick={() => (window.location.href = '/home')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Home className="w-5 h-5" />
              <span>กลับหน้าหลัก</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
