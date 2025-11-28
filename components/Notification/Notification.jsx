'use client';

import { X, CheckCircle } from 'lucide-react';

export default function Notification({ 
  isVisible, 
  onClose, 
  isError = false, 
  message 
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[100] animate-fade-in w-full px-4 
      {/* Mobile: อยู่ชิดบนหน่อย / Desktop: เว้นลงมา */}
      top-4 md:top-8 
      {/* Mobile: กว้างพอดีคำ / Desktop: กว้างขึ้นได้อีกนิด */}
      max-w-sm md:max-w-md"
    >
      <div
        className={`flex items-start md:items-center gap-3 rounded-xl shadow-lg border bg-white transition-all 
          {/* Mobile: padding น้อยหน่อย / Desktop: padding ปกติ */}
          p-3 md:p-4
          ${isError ? 'border-red-100' : 'border-green-100'}`
        }
      >
        {/* Icon Container */}
        <div
          className={`rounded-full flex-shrink-0 flex items-center justify-center
            p-1.5 md:p-2
            ${isError
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600'
          }`}
        >
          {isError ? (
            // ปรับขนาดไอคอนตามหน้าจอ
            <X className="w-4 h-4 md:w-5 md:h-5" />
          ) : (
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pt-0.5 md:pt-0">
          <h4
            className={`font-bold leading-tight
              text-sm md:text-base
              ${isError ? 'text-red-700' : 'text-gray-900'}`
            }
          >
            {isError ? 'Error' : 'Success'}
          </h4>
          <p
            className={`mt-0.5 break-words leading-snug
              text-xs md:text-sm
              ${isError ? 'text-red-600' : 'text-gray-500'}`
            }
          >
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 -mr-1 md:mr-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}