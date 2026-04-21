'use client';

import { X, CheckCircle } from 'lucide-react';

// แยก message ออกเป็น prefix text และ emails (ถ้ามี)
// รองรับรูปแบบ "ข้อความ: email1, email2, ..."
function parseMessage(message) {
  if (!message) return { text: '', emails: [] };
  const colonIdx = message.lastIndexOf(':');
  if (colonIdx === -1) return { text: message, emails: [] };

  const prefix = message.slice(0, colonIdx).trim();
  const afterColon = message.slice(colonIdx + 1).trim();

  // เช็คว่าหลัง : มี email จริงๆ
  const parts = afterColon.split(',').map((s) => s.trim()).filter(Boolean);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const allAreEmails = parts.length > 0 && parts.every((p) => emailRegex.test(p));

  if (allAreEmails) return { text: prefix, emails: parts };
  return { text: message, emails: [] };
}

export default function Notification({ 
  isVisible, 
  onClose, 
  isError = false, 
  message 
}) {
  if (!isVisible) return null;

  const { text, emails } = parseMessage(message);

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[9999] animate-fade-in w-full px-4 top-4 md:top-8 max-w-sm md:max-w-md">
      <div
        className={`flex items-start gap-3 rounded-xl shadow-lg border bg-white transition-all p-3 md:p-4
          ${isError ? 'border-red-100' : 'border-green-100'}`}
      >
        {/* Icon */}
        <div
          className={`rounded-full flex-shrink-0 flex items-center justify-center p-1.5 md:p-2 mt-0.5
            ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
        >
          {isError
            ? <X className="w-4 h-4 md:w-5 md:h-5" />
            : <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
          }
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold leading-tight text-sm md:text-base
            ${isError ? 'text-red-700' : 'text-gray-900'}`}
          >
            {isError ? 'Error' : 'Success'}
          </h4>

          <p className={`mt-0.5 leading-snug text-xs md:text-sm
            ${isError ? 'text-red-600' : 'text-gray-500'}`}
          >
            {text}
          </p>

          {/* Email Pills */}
          {emails.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {emails.map((email) => (
                <span
                  key={email}
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium truncate max-w-full
                    ${isError
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                    }`}
                >
                  {email}
                </span>
              ))}
            </div>
          )}
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