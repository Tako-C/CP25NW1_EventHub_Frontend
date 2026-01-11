// app/organizer/components/EventPreview.jsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Tabs } from 'antd';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import dayjs from 'dayjs';
import EventCard from '@/components/Card/EventCard';

// ฟังก์ชัน format วันที่
const formatDatePreview = (date) => {
  if (!date) return 'Date Unavailable';
  return dayjs(date).format('D MMM YYYY');
};

export default function EventPreview({ formValues }) {
  // --- 1. Prepare Data for Preview (Logic หลักอยู่ที่นี่) ---
  const eventData = useMemo(() => {
    // Helper: ดึง URL จาก Field ของ Antd Upload (รองรับทั้งรูปเก่าและรูปใหม่)
    const getImg = (field) => {
      if (!field) return null;

      // หา File Object จริงๆ ไม่ว่าจะมาท่าไหน (Array หรือ Object)
      let fileObj = null;
      if (Array.isArray(field)) {
        fileObj = field[0];
      } else if (field?.fileList && Array.isArray(field.fileList)) {
        fileObj = field.fileList[0];
      } else if (typeof field === 'object' && field?.file) {
        fileObj = field.file;
      }

      if (fileObj) {
        // กรณี 1: รูปใหม่ที่เพิ่ง Upload (สำคัญ: ต้องเช็ค originFileObj ก่อน)
        if (fileObj.originFileObj) {
          return URL.createObjectURL(fileObj.originFileObj);
        }
        // กรณี 2: รูปเก่าที่มีอยู่แล้ว (ดึงจาก url ที่ set ไว้ใน initialValues)
        // ข้อ 4: ทำให้รูปขึ้นทันทีตอนเข้าหน้า Edit
        if (fileObj.url) {
          return fileObj.url;
        }
        // Fallback
        if (fileObj.thumbUrl) return fileObj.thumbUrl;
      }

      // กรณี 3: เป็น String path (เผื่อกรณีส่งค่า string มาตรงๆ)
      if (typeof field === 'string') {
        if (field.startsWith('http') || field.startsWith('blob:')) return field;
        return `http://localhost:8080/api/images/${field}`;
      }

      return null;
    };

    // ดึงรูปแยกตามประเภท
    const imgCard = getImg(formValues.eventCard);
    const imgDetail = getImg(formValues.eventDetail);

    const slide1 = getImg(formValues.slideshowSlot1);
    const slide2 = getImg(formValues.slideshowSlot2);
    const slide3 = getImg(formValues.slideshowSlot3);

    // รวม Slideshow เป็น Array (ตัดค่า null ออก)
    const slideshow = [slide1, slide2, slide3].filter(Boolean);

    return {
      id: 'preview-id',
      eventName: formValues.eventName || 'Event Title',
      eventDesc: formValues.eventDescription || 'Event description...',
      location: formValues.location || 'Location',

      startDate: formValues.startDate
        ? formValues.startDate.toISOString()
        : null,
      endDate: formValues.endDate ? formValues.endDate.toISOString() : null,

      // Images for usage
      imgCard: imgCard, // ข้อ 2: ใช้สำหรับ Card
      imgDetail: imgDetail, // ข้อ 3: ใช้สำหรับ Detail Cover

      // ข้อ 1: Slideshow Array
      slideshow: slideshow,

      // ข้อ 3: Background ของ Detail ให้ใช้ Slideshow รูปที่ 1
      bgDetail: slide1 || imgDetail || null,

      // Mock Type
      eventTypeId: {
        eventTypeName: 'Event Type',
        id: formValues.eventType,
      },
    };
  }, [formValues]);

  // --- 2. Tab Components ---

  // 🔴 Tab 1: Slideshow Preview (Loop Images)
  const SlideshowPreview = () => {
    // ข้อ 1: ใช้รูปจาก slideshow array
    const slides =
      eventData.slideshow.length > 0 ? eventData.slideshow : [null];
    const [currentEventIndex, setCurrentEventIndex] = useState(0);

    // Auto Loop Logic
    useEffect(() => {
      if (slides.length <= 1) return;
      const interval = setInterval(() => {
        setCurrentEventIndex((prev) => (prev + 1) % slides.length);
      }, 5000); // เปลี่ยนรูปทุก 5 วินาที
      return () => clearInterval(interval);
    }, [slides.length]);

    return (
      <div className="relative h-[500px] overflow-hidden bg-slate-900 rounded-xl group">
        <div className="absolute inset-0">
          {slides.map((imgSrc, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === currentEventIndex
                  ? 'opacity-100 z-0'
                  : 'opacity-0 -z-10'
              }`}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={`Slide ${index}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                  No Slideshow Image Uploaded (Slot 1-3)
                </div>
              )}
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        <div className="relative h-full flex items-center justify-center px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">
                Featured Event (Preview)
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {eventData.eventName}
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-base md:text-lg">
                  {eventData.location}
                </span>
              </div>
              <div className="hidden md:block w-1 h-1 bg-white/40 rounded-full" />
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span className="text-base md:text-lg">
                  {eventData.startDate
                    ? `${formatDatePreview(
                        eventData.startDate
                      )} - ${formatDatePreview(eventData.endDate)}`
                    : 'Date Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🟢 Tab 2: Card Preview
  const CardPreview = () => {
    // ข้อ 2: ส่งเฉพาะ imgCard ไปแสดงผลใน Card
    const mockEventForCard = {
      eventName: eventData.eventName,
      location: eventData.location,
      startDate: eventData.startDate,
      eventTypeId: eventData.eventTypeId,
      // EventCard component ของคุณน่าจะรับค่าแบบนี้
      images: { imgCard: eventData.imgCard },
      eventCard: eventData.imgCard,
    };

    return (
      <div className="flex justify-center p-8 bg-gray-50 rounded-xl">
        <div className="w-[300px] md:w-[350px]">
          <EventCard event={mockEventForCard} />
        </div>
      </div>
    );
  };

  // 🔵 Tab 3: Detail Page Preview
  const DetailPreview = () => {
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);

    return (
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <div className="relative h-auto md:h-[500px] bg-gradient-to-r from-gray-200 to-gray-300">
          {/* ข้อ 3: Background ใช้ Slideshow รูปที่ 1 (bgDetail) */}
          <div className="absolute inset-0 opacity-40">
            {eventData.bgDetail && (
              <div className="w-full h-full relative">
                <img
                  src={eventData.bgDetail}
                  className="w-full h-full object-cover blur-sm"
                  alt="bg-slide-1"
                />
              </div>
            )}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8 py-10 md:py-0">
              {/* ข้อ 3: Cover Image ใช้รูป Detail (imgDetail) */}
              <div className="bg-white rounded-3xl shadow-2xl w-64 h-64 md:w-80 md:h-80 p-4 flex-shrink-0 relative">
                <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden relative">
                  {eventData.imgDetail ? (
                    <img
                      src={eventData.imgDetail}
                      className="w-full h-full object-cover"
                      alt="detail-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Detail Image
                    </div>
                  )}
                </div>
              </div>

              {/* Content Box */}
              <div className="flex flex-col items-center space-y-6 w-full md:w-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 text-center w-full max-w-lg">
                  <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                    {eventData.eventName}
                  </h1>

                  <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-base md:text-lg font-medium break-words">
                        {eventData.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-base md:text-lg font-medium">
                        {`${formatDatePreview(
                          eventData.startDate
                        )} - ${formatDatePreview(eventData.endDate)}`}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full md:w-auto font-semibold px-8 md:px-32 py-4 rounded-full shadow-lg bg-blue-900 text-white opacity-90 cursor-default">
                  Register Now (Preview)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <button
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className="flex items-center justify-between w-full"
            >
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Description
              </h2>
              <ChevronDown
                className={`w-6 h-6 text-gray-500 transition-transform ${
                  isDescriptionOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDescriptionOpen && (
              <div className="mt-6 space-y-4 text-sm md:text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                <p>{eventData.eventDesc}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const items = [
    { key: '1', label: 'Slideshow Preview', children: <SlideshowPreview /> },
    { key: '2', label: 'Card Preview', children: <CardPreview /> },
    { key: '3', label: 'Detail Page Preview', children: <DetailPreview /> },
  ];

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        Live Preview
      </h3>
      <Tabs
        defaultActiveKey="1"
        items={items}
        type="card"
        size="large"
        className="w-full"
      />
    </div>
  );
}
