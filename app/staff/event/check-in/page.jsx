"use client"

import { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function CheckInStaff() {
  const [searchEmail, setSearchEmail] = useState('');
  const [checkedInIds, setCheckedInIds] = useState([]);

  const visitors = [
    { id: '0001', name: 'Kongpop jaidee', email: 'kongpop@gmail.com' },
    { id: '0002', name: 'Somchai Dee', email: 'somchai@gmail.com' },
    { id: '0003', name: 'Somsri Jai', email: 'somsri@gmail.com' },
    { id: '0004', name: 'Sompong Smith', email: 'sompong@gmail.com' },
    { id: '0005', name: 'Nitaya Jones', email: 'nitaya@gmail.com' }
  ];

  const filteredVisitors = visitors.filter(v => 
    v.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    v.name.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const handleCheckIn = (visitorId) => {
    setCheckedInIds(prev => {
        if(prev?.includes(visitorId)){
            return prev
        }
        return [...prev, visitorId]
    });
  };

  const handleReset = () => {
    setSearchEmail('');
    setCheckedInIds([]);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gray-200 py-3 px-4">
        <h2 className="text-xl text-gray-600">Check-in Manual(Staff)</h2>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-semibold text-center mb-2">Check-in</h3>
          <p className="text-center text-gray-600 mb-8">Event : FOODS AND BEVERAGES ASIA EXPO</p>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Visitors</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredVisitors.length > 0 ? (
              filteredVisitors.map((visitor) => {
                const isCheckedIn = checkedInIds.includes(visitor.id);
                return (
                  <div key={visitor.id} className="bg-gray-100 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="text-gray-600 w-32">Visitor ID :</span>
                          <span className="text-gray-900">{visitor.id}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-32">Full name :</span>
                          <span className="text-gray-900">{visitor.name}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-600 w-32">Email :</span>
                          <span className="text-gray-900">{visitor.email}</span>
                        </div>
                      </div>
                      
                      {!isCheckedIn ? (
                        <button
                          onClick={() => handleCheckIn(visitor.id)}
                          className="bg-green-400 hover:bg-green-500 text-white font-medium px-8 py-3 rounded-md transition-colors"
                        >
                          Check-in
                        </button>
                      ) : (
                        <div className="text-center">
                          <div className="text-green-600 font-medium mb-1">✓ Checked in</div>
                          <button
                            disabled
                            className="bg-gray-300 text-gray-500 font-medium px-8 py-3 rounded-md cursor-not-allowed"
                          >
                            Check-in
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                ไม่พบข้อมูลผู้เข้าร่วมงาน
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}