'use client';

import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  ScanLine, ClipboardList, User, Calendar, Loader2,
  CheckCircle2, Search, RotateCcw, ChevronDown, Zap
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { postQRCheckIn, postQRUserInfo, getImage, getListUser, getData, postUserCheckIn } from '@/libs/fetch';
import Notification from '@/components/Notification/Notification';

export default function StaffCheckInPage() {
  const [activeTab, setActiveTab] = useState('qr');

  // shared
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: '' });

  // QR
  const [isScanning, setIsScanning] = useState(true);
  const [confirmData, setConfirmData] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manual
  const [searchQuery, setSearchQuery] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const searchParams = useSearchParams();

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => setNotification(p => ({ ...p, isVisible: false })), 3000);
  };
  const closeNotification = () => setNotification(p => ({ ...p, isVisible: false }));
  const selectedEvent = events.find(e => e.eventId?.toString() === selectedEventId?.toString());

  useEffect(() => {
    getData('users/me/registered-events').then(res => {
      if (res?.data && Array.isArray(res.data)) setEvents(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const paramEventId = searchParams.get('eventId');
    if (events.length > 0 && paramEventId) {
      if (events.find(e => e.eventId.toString() === paramEventId)) setSelectedEventId(paramEventId);
    }
  }, [events, searchParams]);

  useEffect(() => {
    if (activeTab === 'qr') setIsScanning(true);
  }, [activeTab]);

  // QR handlers
  const handleScanSuccess = async (results) => {
    if (!results?.length) return;
    const raw = results[0].rawValue;
    const qrContent = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
    setIsScanning(false);
    try {
      const res = await postQRUserInfo(qrContent);
      if (res?.statusCode === 200 && res.data) {
        const user = res.data.userProfile || {};
        const event = res.data.eventDetail || {};
        setConfirmData({ qrContent, firstName: user.firstName, lastName: user.lastName, email: user.email, imgPath: user.imgPath, eventName: event.eventName || 'ไม่ระบุชื่อกิจกรรม' });
        if (user.imgPath) {
          const clean = user.imgPath.startsWith('/') ? user.imgPath.substring(1) : user.imgPath;
          getImage(`upload/users/${clean}`).then(setUserImage).catch(() => setUserImage(null));
        } else setUserImage(null);
      } else throw new Error(res?.message || 'ไม่พบข้อมูลผู้ใช้งาน');
    } catch (err) { showNotification(err.message, true); setIsScanning(true); }
  };

  const handleConfirmCheckIn = async () => {
    if (!confirmData) return;
    setIsProcessing(true);
    try {
      const res = await postQRCheckIn(confirmData.qrContent);
      if (res?.statusCode === 200 || res?.message === 'Check-in successful') {
        showNotification(`Check-in สำเร็จ: ${confirmData.firstName} ${confirmData.lastName}`);
        setConfirmData(null);
        setIsScanning(true);
      } else throw new Error(res?.message || 'Check-in ไม่สำเร็จ');
    } catch (err) { showNotification(err.message, true); }
    finally { setIsProcessing(false); }
  };

  // Manual handlers
  const handleSearch = async () => {
    if (!selectedEventId) { showNotification('กรุณาเลือกกิจกรรมก่อน', true); return; }
    if (!searchQuery.trim()) { showNotification('กรุณากรอกข้อมูลเพื่อค้นหา', true); return; }
    setIsLoading(true); setHasSearched(true); setVisitors([]);
    try {
      const result = await getListUser('manual/search', { query: searchQuery.trim(), eventId: selectedEventId });
      if (result) {
        if (Array.isArray(result)) setVisitors(result);
        else if (result.userId) setVisitors([result]);
      } else showNotification('ไม่พบข้อมูลผู้เข้าร่วมงาน', true);
    } catch { showNotification('เกิดข้อผิดพลาดในการค้นหาข้อมูล', true); setVisitors([]); }
    finally { setIsLoading(false); }
  };

  const handleCheckIn = async (visitor) => {
    if (visitor.status === 'check_in' || visitor.status === 'CHECK_IN') return;
    if (!selectedEventId) { showNotification('กรุณาเลือกกิจกรรมก่อน', true); return; }
    setIsUpdating(true);
    try {
      const result = await postUserCheckIn('manual/check-in', selectedEventId, visitor.userId);
      if (result?.statusCode === 200) {
        setVisitors(prev => prev.map(v => v.userId === visitor.userId ? { ...v, status: 'check_in' } : v));
        showNotification('Check-in สำเร็จ');
      } else showNotification('Check-in ไม่สำเร็จ', true);
    } catch { showNotification('เกิดข้อผิดพลาด กรุณาลองใหม่', true); }
    finally { setIsUpdating(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Notification isVisible={notification.isVisible} onClose={closeNotification} isError={notification.isError} message={notification.message} />

      {/* Confirm Modal */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 flex flex-col items-center">
              <span className="text-xs font-bold text-white/80 bg-white/15 border border-white/20 px-3 py-1 rounded-full mb-5 tracking-wide text-center max-w-[220px] truncate">
                {confirmData.eventName}
              </span>
              <div className="w-20 h-20 rounded-2xl border-4 border-white/30 bg-white/20 overflow-hidden mb-4">
                {userImage
                  ? <img src={userImage} alt="User" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-white/60" /></div>}
              </div>
              <h3 className="text-lg font-bold text-white">{confirmData.firstName} {confirmData.lastName}</h3>
              <p className="text-sm text-white/70 mt-0.5">{confirmData.email}</p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-center text-sm text-gray-500">ยืนยันการ Check-in สำหรับผู้เข้าร่วมงานคนนี้?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setConfirmData(null); setIsScanning(true); }}
                  className="py-3 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  ยกเลิก
                </button>
                <button onClick={handleConfirmCheckIn} disabled={isProcessing}
                  className="py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} />ยืนยัน</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 pt-5 pb-4 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-200">
                <Zap size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-none">Expo Hub</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">Staff Portal</p>
              </div>
            </div>
            {selectedEvent && (
              <div className="text-right max-w-[160px]">
                <p className="text-xs text-gray-400">กิจกรรม</p>
                <p className="text-xs font-semibold text-purple-600 truncate">{selectedEvent.eventName}</p>
              </div>
            )}
          </div>

          {/* Event selector */}
          <div className="relative">
            <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedEventId}
              onChange={e => { setSelectedEventId(e.target.value); setVisitors([]); setHasSearched(false); }}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl pl-9 pr-9 py-2.5 appearance-none focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
            >
              <option value="" disabled className="text-gray-400">— เลือกกิจกรรม —</option>
              {events.map(ev => (
                <option key={ev.eventId} value={ev.eventId}>
                  {ev.eventName} · {new Date(ev.startDate).toLocaleDateString('th-TH')}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-2xl p-1 flex gap-1">
            {[
              { id: 'qr', label: 'QR Scan', icon: ScanLine },
              { id: 'manual', label: 'Manual Check-in', icon: ClipboardList },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-700 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5">
        <div className="max-w-md mx-auto">

          {/* QR Tab */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              {!selectedEventId && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
                  <p className="text-xs text-amber-700 font-medium">⚠ กรุณาเลือกกิจกรรมก่อนสแกน QR</p>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                {/* Label */}
                <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-50">
                  <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                    <ScanLine size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">สแกน QR Code</p>
                    <p className="text-xs text-gray-400">ชี้กล้องไปที่ QR Code บนบัตรผู้เข้าร่วม</p>
                  </div>
                </div>

                {/* Camera */}
                <div className="relative aspect-square bg-gray-900">
                  {isScanning ? (
                    <div className="w-full h-full relative">
                      <Scanner
                        onScan={handleScanSuccess}
                        onError={err => console.log(err)}
                        scanDelay={200}
                        allowMultiple={false}
                        components={{ audio: false, finder: true }}
                        styles={{ container: { width: '100%', height: '100%' }, video: { width: '100%', height: '100%', objectFit: 'cover' } }}
                      />
                      {/* Corner brackets */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-52 h-52 relative">
                          <div className="absolute top-0 left-0 w-9 h-9 border-t-[3px] border-l-[3px] border-purple-400 rounded-tl-2xl" />
                          <div className="absolute top-0 right-0 w-9 h-9 border-t-[3px] border-r-[3px] border-purple-400 rounded-tr-2xl" />
                          <div className="absolute bottom-0 left-0 w-9 h-9 border-b-[3px] border-l-[3px] border-purple-400 rounded-bl-2xl" />
                          <div className="absolute bottom-0 right-0 w-9 h-9 border-b-[3px] border-r-[3px] border-purple-400 rounded-br-2xl" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 size={30} className="text-emerald-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white">สแกนเรียบร้อย</p>
                        <p className="text-gray-400 text-xs mt-1">กำลังโหลดข้อมูล...</p>
                      </div>
                      <button onClick={() => setIsScanning(true)}
                        className="mt-1 px-5 py-2 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-full hover:bg-white/20 transition active:scale-95">
                        สแกนใบถัดไป
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-widest">ค้นหาผู้เข้าร่วม</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="ชื่อ, อีเมล หรือเบอร์โทร..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      disabled={!selectedEventId}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl pl-9 pr-4 py-2.5 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                  <button onClick={handleSearch} disabled={isLoading || !selectedEventId}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm shadow-purple-200">
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  </button>
                  <button onClick={() => { setSearchQuery(''); setVisitors([]); setHasSearched(false); }} disabled={isLoading}
                    className="px-3 py-2.5 bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl text-sm disabled:opacity-40 transition-all">
                    <RotateCcw size={14} />
                  </button>
                </div>
                {!selectedEventId && (
                  <p className="text-xs text-amber-600 mt-2.5">⚠ เลือกกิจกรรมด้านบนก่อนค้นหา</p>
                )}
              </div>

              {/* Results */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <Loader2 size={22} className="animate-spin text-purple-500" />
                  <p className="text-sm text-gray-500">กำลังค้นหา...</p>
                </div>
              ) : visitors.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-400 px-1">
                    พบ <span className="text-purple-600 font-semibold">{visitors.length}</span> รายการ
                  </p>
                  {visitors.map((visitor, index) => {
                    const checked = visitor.status === 'check_in' || visitor.status === 'CHECK_IN';
                    return (
                      <div key={visitor.userId || index}
                        className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${checked ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${checked ? 'bg-emerald-100' : 'bg-purple-50'}`}>
                              {checked
                                ? <CheckCircle2 size={18} className="text-emerald-500" />
                                : <User size={18} className="text-purple-500" />}
                            </div>
                            <div className="min-w-0 space-y-1 flex-1">
                              <div className="flex flex-wrap gap-x-2 items-baseline">
                                <span className="text-xs text-gray-400 w-20 flex-shrink-0">ชื่อ-นามสกุล</span>
                                <span className="text-sm font-semibold text-gray-900 break-words">{visitor.name}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-2 items-baseline">
                                <span className="text-xs text-gray-400 w-20 flex-shrink-0">อีเมล</span>
                                <span className="text-xs text-gray-600 break-all">{visitor.email}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-2 items-baseline">
                                <span className="text-xs text-gray-400 w-20 flex-shrink-0">เบอร์โทร</span>
                                <span className="text-xs text-gray-600">{visitor.phone || '—'}</span>
                              </div>
                            </div>
                          </div>
                          {checked ? (
                            <span className="flex-shrink-0 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full">
                              เข้างานแล้ว
                            </span>
                          ) : (
                            <button onClick={() => handleCheckIn(visitor)} disabled={isUpdating}
                              className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all shadow-sm shadow-purple-200 flex items-center gap-1.5">
                              {isUpdating ? <Loader2 size={12} className="animate-spin" /> : null}
                              Check-in
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : hasSearched ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">ไม่พบข้อมูล</p>
                  <p className="text-xs text-gray-400">ลองค้นหาด้วยชื่อ, อีเมล หรือเบอร์โทร</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center">
                    <ClipboardList size={22} className="text-purple-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">พร้อมสำหรับการ Check-in</p>
                  <p className="text-xs text-gray-400">ค้นหาชื่อผู้เข้าร่วมด้านบน</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}