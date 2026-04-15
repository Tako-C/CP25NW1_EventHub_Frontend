'use client';
import React from 'react';
import { Plus, Calendar, MapPin, Edit2, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormatDate } from '@/utils/format';
import { EventCardImage } from '@/utils/getImage';
import XLSX from 'xlsx-js-style'; 

const downloadTemplate = (e, eventName) => {
  e.stopPropagation();

  const wb = XLSX.utils.book_new();
  const headerData = [['First Name', 'Last Name', 'Email', 'Gender', 'Date of Birth']];
  
  const colsConfig = [
    { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 }
  ];

  const headerStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: "C6EFCE" } 
    },
    font: {
      name: "Arial",
      sz: 11,
      bold: true,
      color: { rgb: "000000" } 
    },
    alignment: {
      vertical: "center",
      horizontal: "center"
    },
    border: {
      top: { style: "thin", color: { rgb: "94C493" } },
      bottom: { style: "thin", color: { rgb: "94C493" } },
      left: { style: "thin", color: { rgb: "94C493" } },
      right: { style: "thin", color: { rgb: "94C493" } }
    }
  };

  const createStyledSheet = (data) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = colsConfig;

    // ใส่สไตล์ให้ Row แรก (Header)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1"; 
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }
    return ws;
  };

  // สร้างเฉพาะ 2 Sheet ที่ต้องการ
  XLSX.utils.book_append_sheet(wb, createStyledSheet(headerData), 'STAFF');
  XLSX.utils.book_append_sheet(wb, createStyledSheet(headerData), 'EXHIBITOR');

  const safeName = (eventName || 'event').replace(/[^a-zA-Z0-9ก-๙]/g, '_');
  XLSX.writeFile(wb, `Staff_Exhibitor_Template_${safeName}.xlsx`);
};

export default function OrganizerEvents({ events = [] }) {
  const router = useRouter();

  return (
    <section className="max-w-7xl mx-auto py-8 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 mt-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1">
            Organizer Portal
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
            My Events
          </h2>
        </div>
        <span className="text-sm text-gray-400">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => router.push('/organizer/event/create')}
          className="group relative flex flex-col items-center justify-center min-h-[320px] bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-200 transition-all duration-300">
            <Plus className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-500 group-hover:text-purple-700 transition-colors">
            Create New Event
          </h3>
        </div>
        
        {events.map((event, index) => (
          <div key={event.id || index} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col min-h-[320px]">
            <div className="relative h-44 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => router.push(`/organizer/event/${event.id}/edit`)}>
              <EventCardImage imageCard={event.imageCard || event.images?.imgSlideShow} eventName={event.eventName} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                  <Edit2 className="w-3.5 h-3.5" /> Manage Event
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-3">
              <h3 className="text-base font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-purple-600 transition-colors" onClick={() => router.push(`/organizer/event/${event.id}/edit`)}>
                {event.eventName}
              </h3>

              <div className="space-y-1.5 flex-1 text-gray-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{event.startDate ? FormatDate(event.startDate) : 'TBA'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="line-clamp-1">{event.location || 'Online'}</span>
                </div>
              </div>

              <button
                onClick={(e) => downloadTemplate(e, event.eventName)}
                className="mt-auto w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 hover:border-emerald-300 active:scale-[0.98] transition-all duration-200"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                GET IMPORT TEMPLATE
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}