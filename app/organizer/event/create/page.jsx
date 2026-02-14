'use client';
import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { useRouter } from 'next/navigation';
import EventForm from '../../components/EventForm';
import dayjs from 'dayjs';
import { createEvent, getData } from '@/libs/fetch';
import Notification from '@/components/Notification/Notification';

const { Title, Text } = Typography;

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [country, setCountry] = useState([])

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: '',
  });

  const showNotification = (msg, isError = false) => {
    setNotification({
      isVisible: true,
      isError: isError,
      message: msg,
    });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

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
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (e) {
        return null;
      }
    };

    const token = getCookie('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setCurrentUserId(decoded.id || decoded.userId);
      }
    } else {
      showNotification('Session expired. Please login again.', true);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const res = await getData('users/countrys');
    const resCity = await getData(`users/country/${res?.data[0].id}/citys`)
    console.log(resCity)
    setCountry(resCity?.data || [])
  }

  const handleCreate = async (values) => {
    if (!currentUserId) {
      showNotification('User not identified', true);
      return;
    }

    if (values.eventSlideShow && values.eventSlideShow.length > 3) {
      showNotification('Slideshow image cannot exceed 3 files.', true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('eventName', values.eventName);
      formData.append('eventDesc', values.eventDescription);
      formData.append('eventTypeId', values.eventType);
      // formData.append('organizer', values.hostOrganization);
      formData.append('location', values.location);
      formData.append('createdBy', currentUserId);

      const startDateStr = values.startDate
        ? dayjs(values.startDate).format('YYYY-MM-DDTHH:mm:ss')
        : '';
      const endDateStr = values.endDate
        ? dayjs(values.endDate).format('YYYY-MM-DDTHH:mm:ss')
        : '';
      formData.append('startDate', startDateStr);
      formData.append('endDate', endDateStr);
      formData.append('contactEmail', values.contactEmail || '');
      formData.append('contactPhone', values.contactPhone || '');
      formData.append('contactLine', values.contactLine || '');
      formData.append('contactFacebook', values.contactFacebook || '');

      // จัดการ Files (Single File)
      if (values.eventCard?.[0]?.originFileObj) {
        formData.append('eventCard', values.eventCard[0].originFileObj);
      }
      if (values.eventDetail?.[0]?.originFileObj) {
        formData.append('eventDetail', values.eventDetail[0].originFileObj);
      }
      if (values.eventMap?.[0]?.originFileObj) {
        formData.append('eventMap', values.eventMap[0].originFileObj);
      }

      // จัดการ Files (Multiple Files - Slideshow)
      if (values.eventSlideShow && values.eventSlideShow.length > 0) {
        // ใช้ slice(0, 3) เพื่อความชัวร์ว่าจะไม่ส่งเกิน 3 แม้ Logic อื่นจะหลุดมา
        values.eventSlideShow.slice(0, 3).forEach((fileItem) => {
          if (fileItem.originFileObj) {
            formData.append('eventSlideshow', fileItem.originFileObj);
          }
        });
      }

      // === Slideshow Logic (Create) ===
      // รวมไฟล์จาก 3 Slot เข้าไปใน eventSlideshow ตัวแปรเดียว
      const slides = [];
      if (values.slideshowSlot1?.[0]?.originFileObj)
        slides.push(values.slideshowSlot1[0].originFileObj);
      if (values.slideshowSlot2?.[0]?.originFileObj)
        slides.push(values.slideshowSlot2[0].originFileObj);
      if (values.slideshowSlot3?.[0]?.originFileObj)
        slides.push(values.slideshowSlot3[0].originFileObj);

      // วนลูปส่งไป
      slides.forEach((file) => {
        formData.append('eventSlideshow', file);
      });

      // เรียก API
      await createEvent(formData);

      showNotification('Event created successfully!', false);
      setTimeout(() => {
        router.push('/home#organizer-section');
      }, 1500);
    } catch (error) {
      console.error('Error creating event:', error);
      showNotification(error.message || 'Failed to create event', true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* ใส่ Component Notification ไว้ตรงนี้ */}
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />

      <EventForm
        onFinish={handleCreate}
        isLoading={loading}
        isEditMode={false}
        locationOptions={country}
        onValidationFailed={() =>
          showNotification('Please fill all required fields.', true)
        }
      />
    </div>
  );
}
