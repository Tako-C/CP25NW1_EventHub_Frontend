'use client';
import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { useRouter } from 'next/navigation';
import EventForm from '../../components/EventForm';
import dayjs from 'dayjs';
import { createEvent, getData } from '@/libs/fetch';
import Notification from '@/components/Notification/Notification';
import utc from 'dayjs/plugin/utc';

const { Title, Text } = Typography;
dayjs.extend(utc);

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
      showNotification('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง', true);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await getData('users/countrys');
      if (res?.data?.length > 0) {
        const resCity = await getData(`users/country/${res?.data[0].id}/citys`)
        setCountry(resCity?.data || [])
      }
    } catch (error) {
      console.error("Fetch location failed", error);
    }
  }

  const handleCreate = async (values) => {
    if (!currentUserId) {
      showNotification('ไม่พบข้อมูลผู้ใช้งาน', true);
      return;
    }

    if (values.eventSlideShow && values.eventSlideShow.length > 3) {
      showNotification('รูปภาพสไลด์โชว์ห้ามเกิน 3 ไฟล์', true);
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

      const slides = [];
      if (values.slideshowSlot1?.[0]?.originFileObj)
        slides.push(values.slideshowSlot1[0].originFileObj);
      if (values.slideshowSlot2?.[0]?.originFileObj)
        slides.push(values.slideshowSlot2[0].originFileObj);
      if (values.slideshowSlot3?.[0]?.originFileObj)
        slides.push(values.slideshowSlot3[0].originFileObj);

      slides.forEach((file) => {
        formData.append('eventSlideshow', file);
      });

      await createEvent(formData);

      showNotification('สร้างกิจกรรมสำเร็จ!', false);
      setTimeout(() => {
        router.push('/home#organizer-section');
      }, 1500);
    } catch (error) {
      console.error('Error creating event:', error);
      // showNotification(error.message || 'สร้างกิจกรรมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', true);
      showNotification('สร้างกิจกรรมไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', true);
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
        <Title level={2}>สร้างกิจกรรมใหม่</Title>
        <Text type="secondary">กรุณากรอกข้อมูลด้านล่างให้ครบถ้วนเพื่อเปิดกิจกรรมใหม่</Text>
      </div>

      <EventForm
        onFinish={handleCreate}
        isLoading={loading}
        isEditMode={false}
        locationOptions={country}
        onValidationFailed={() =>
          showNotification('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', true)
        }
      />
    </div>
  );
}