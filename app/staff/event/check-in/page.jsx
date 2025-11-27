'use client';

import { useState, useEffect } from 'react';
import { Search, RotateCcw, Loader2, Calendar } from 'lucide-react';
import { getListUser, getData, userCheckIn } from '@/libs/fetch';
import { useSearchParams } from 'next/navigation';

export default function CheckInStaff() {
  const [searchEmail, setSearchEmail] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [userId, setUserId] = useState('');

  const searchParams = useSearchParams(); // 2. เรียกใช้ hook
  const paramEventId = searchParams.get('eventId'); // 3. ดึงค่า eventId จาก URL

  const handleCheckIn = async (visitorData) => {
    if (visitorData.status === 'check_in') return;

    if (!selectedEventId) {
      alert('กรุณาเลือก Event ก่อนทำการ Check-in');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await userCheckIn(
        'manual/check-in',
        selectedEventId,
        userId
      );

      if (result) {
        setVisitors((prevVisitors) =>
          prevVisitors.map((v) => {
            if (v.email === visitorData.email) {
              return { ...v, status: 'check_in' };
            }
            return v;
          })
        );
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      alert('เกิดข้อผิดพลาดในการ Check-in');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;

    if (!selectedEventId) {
      alert('กรุณาเลือก Event ที่ต้องการค้นหา');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setVisitors([]);

    try {
      const result = await getListUser(
        'manual/search',
        searchEmail,
        selectedEventId
      );

      console.log(result);
      if (Array.isArray(result)) {
        setVisitors(result);
      } else if (result) {
        setVisitors([result]);
      }
      setUserId(result?.userId);
    } catch (error) {
      console.error('Error fetching user:', error);
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchEmail('');
    setVisitors([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchData = async () => {
    try {
      const res = await getData('users/me/registered-events');
      console.log('Events loaded:', res?.data);
      if (res?.data && Array.isArray(res.data)) {
        setEvents(res.data);

        // Optional: ถ้าอยากให้เลือกอันแรกเป็น Default อัตโนมัติ
        // if (res.data.length > 0) {
        //     setSelectedEventId(res.data[0].eventId);
        // }
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  const handleEventChange = (e) => {
    const newId = e.target.value;
    setSelectedEventId(newId);

    setVisitors([]);
    setHasSearched(false);
  };

  const selectedEventObj = events.find(
    (e) => e.eventId.toString() === selectedEventId.toString()
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (events.length > 0 && paramEventId) {
      const targetEvent = events.find(
        (e) => e.eventId.toString() === paramEventId
      );
      if (targetEvent) {
        setSelectedEventId(paramEventId);
      }
    }
  }, [events, paramEventId]);

  return (
    <div className="min-h-screen">
      <div className="bg-gray-200 py-3 px-4">
        <h2 className="text-xl text-gray-600">Check-in Manual(Staff)</h2>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-semibold text-center mb-2">Check-in</h3>

          <p className="text-center text-gray-600 mb-8">
            Event :{' '}
            <span className="font-medium text-purple-600">
              {selectedEventObj
                ? selectedEventObj.eventName
                : 'Please select an event'}
            </span>
          </p>

          <div className="mb-6">
            <label className="text-gray-700 font-medium mb-2 items-center gap-2">
              <Calendar className="w-4 h-4" /> Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={handleEventChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="" disabled>
                -- กรุณาเลือกงานกิจกรรม (Select Event) --
              </option>
              {events.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.eventName} (
                  {new Date(event.startDate).toLocaleDateString('th-TH')})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Visitors Search
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!selectedEventId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading || !selectedEventId}
                className="flex items-center gap-2 px-6 py-2 bg-green-200 hover:bg-green-300 disabled:bg-gray-300 disabled:text-gray-500 text-gray-700 rounded-md transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
            {!selectedEventId && (
              <p className="text-red-500 text-sm mt-2">
                * กรุณาเลือก Event ด้านบนก่อนเริ่มค้นหา
              </p>
            )}
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                กำลังค้นหาข้อมูล...
              </div>
            ) : (
              <>
                {visitors.length > 0 ? (
                  visitors.map((visitor, index) => {
                    const isCheckedIn = visitor.status === 'check_in';
                    return (
                      <div key={index} className="bg-gray-100 rounded-lg p-6">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2">
                            <div className="flex">
                              <span className="text-gray-600 w-32">
                                Visitor ID:
                              </span>
                              <span className="text-gray-900">
                                {visitor.userId}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-gray-600 w-32">
                                Full name :
                              </span>
                              <span className="text-gray-900">
                                {visitor.name}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-gray-600 w-32">
                                Email :
                              </span>
                              <span className="text-gray-900">
                                {visitor.email}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-gray-600 w-32">
                                Phone :
                              </span>
                              <span className="text-gray-900">
                                {visitor.phone || '-'}
                              </span>
                            </div>
                          </div>

                          {!isCheckedIn ? (
                            <button
                              onClick={() => handleCheckIn(visitor)}
                              disabled={isUpdating}
                              className="bg-green-400 hover:bg-green-500 disabled:bg-green-200 text-white font-medium px-8 py-3 rounded-md transition-colors"
                            >
                              {isUpdating ? 'Saving...' : 'Check-in'}
                            </button>
                          ) : (
                            <div className="text-center">
                              <div className="text-green-600 font-medium mb-1">
                                ✓ Checked in
                              </div>
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
                    {hasSearched
                      ? 'ไม่พบข้อมูลผู้เข้าร่วมงาน (User Not Found)'
                      : 'กรุณากรอกข้อมูลเพื่อค้นหา'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
