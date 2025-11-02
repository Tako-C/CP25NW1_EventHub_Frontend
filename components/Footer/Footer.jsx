"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="bg-gray-100 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full"></div>
                <span className="text-xl font-bold text-purple-600">
                  EXPO HUB
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">FAQ</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    How to register?
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Where is my QR-Code?
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Forgot Password?
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Customer Support</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✉</span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    support@expo.com
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">@</span>
                  </div>
                  <span className="text-gray-600 text-sm">@expo</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">E</span>
                  </div>
                  <span className="text-gray-600 text-sm">Expo</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">☎</span>
                  </div>
                  <span className="text-gray-600 text-sm">
                    Thailand: +66 9 999 9999
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
