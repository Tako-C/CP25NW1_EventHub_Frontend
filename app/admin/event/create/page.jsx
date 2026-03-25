"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { getData, createEventAdmin } from "@/libs/fetch";
import EventForm from "@/components/Event/EventForm"; // <-- ชี้ไปที่ Shared Component
import Notification from "@/components/Notification/Notification";

dayjs.extend(utc);

export default function AdminCreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const fetchLocationData = async () => {
    try {
      const res = await getData('users/countrys');
      if (res?.data?.length > 0) {
        const resCity = await getData(`users/country/${res.data[0].id}/citys`);
        setCountry(resCity?.data || []);
      }
    } catch (err) {
      console.error("Fetch location failed", err);
      showNotification("ไม่สามารถดึงข้อมูลสถานที่ได้", true);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const parseJwt = (token) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) { return null; }
    };

    const token = getCookie('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setCurrentUserId(decoded.id || decoded.userId); 
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleCreate = async (values) => {
    if (!currentUserId) {
      showNotification('ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่', true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('eventName', values.eventName);
      formData.append('eventDesc', values.eventDescription); 
      formData.append('eventTypeId', values.eventType);
      formData.append('location', values.location);
      formData.append('createdBy', currentUserId); 
      formData.append('hostOrganisation', values.hostOrganization || '');

      const startDateStr = values.startDate
        ? dayjs(values.startDate).utc().format('YYYY-MM-DDTHH:mm:ss')
        : '';
      const endDateStr = values.endDate
        ? dayjs(values.endDate).utc().format('YYYY-MM-DDTHH:mm:ss')
        : '';

      formData.append('startDate', startDateStr);
      formData.append('endDate', endDateStr);
      
      formData.append('contactEmail', values.contactEmail || '');
      formData.append('contactPhone', values.contactPhone || '');
      formData.append('contactLine', values.contactLine || '');
      formData.append('contactFacebook', values.contactFacebook || '');

      if (values.eventCard?.[0]?.originFileObj) {
        formData.append('eventCard', values.eventCard[0].originFileObj);
      }
      if (values.eventDetail?.[0]?.originFileObj) {
        formData.append('eventDetail', values.eventDetail[0].originFileObj);
      }
      if (values.eventMap?.[0]?.originFileObj) {
        formData.append('eventMap', values.eventMap[0].originFileObj);
      }

      const slideFields = ['slideshowSlot1', 'slideshowSlot2', 'slideshowSlot3'];
      slideFields.forEach(field => {
        if (values[field]?.[0]?.originFileObj) {
          formData.append('eventSlideshow', values[field][0].originFileObj);
        }
      });

      await createEventAdmin(formData);
      showNotification('สร้างกิจกรรมสำเร็จแล้ว!', false);
      
      setTimeout(() => {
        router.push('/admin/event'); // Redirect ไปหน้า Admin Event
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      const errMsg = error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการสร้างกิจกรรม';
      showNotification(errMsg, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />
      
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-500">กรอกข้อมูลให้ครบถ้วนเพื่อสร้างกิจกรรมใหม่ในระบบ</p>
      </div>

      <EventForm
        onFinish={handleCreate}
        locationOptions={country}
        isLoading={loading}
        isEditMode={false} 
      />
    </div>
  );
}