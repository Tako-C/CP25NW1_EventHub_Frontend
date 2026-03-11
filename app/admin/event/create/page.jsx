"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { notification as antNotification } from "antd";

// เรียกใช้ฟังก์ชันจาก libs/fetch.js
import {
  createEvent,
  getData
} from "@/libs/fetch";

import EventForm from "@/app/organizer/components/EventForm";
import Notification from "@/components/Notification/Notification";

dayjs.extend(utc);

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState([]);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  // ดึงข้อมูลสถานที่สำหรับ Dropdown ใน Form
  const fetchLocationData = async () => {
    try {
      const res = await getData('users/countrys');
      if (res?.data?.length > 0) {
        const resCity = await getData(`users/country/${res.data[0].id}/citys`);
        setCountry(resCity?.data || []);
      }
    } catch (err) {
      console.error("Fetch location failed", err);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  // --- ฟังก์ชันหลัก: การสร้างอีเว้นท์ (Create Function) ---
  const handleCreate = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // 1. จัดการข้อมูล Text และค่าพื้นฐาน
      formData.append("eventName", values.eventName);
      formData.append("eventDesc", values.eventDescription || "");
      formData.append("eventTypeId", values.eventType);
      formData.append("hostOrganisation", values.hostOrganization || "");
      formData.append("location", values.location);
      formData.append("contactEmail", values.contactEmail || "");
      formData.append("contactPhone", values.contactPhone || "");
      formData.append("contactLine", values.contactLine || "");
      formData.append("contactFacebook", values.contactFacebook || "");
      
      // กำหนดสถานะเริ่มต้นเป็น UPCOMING หากไม่ได้เลือก
      formData.append("status", values.eventStatus || "UPCOMING");

      // 2. จัดการข้อมูลวันที่ (แปลงเป็น UTC ก่อนส่ง)
      if (values.startDate) {
        formData.append("startDate", values.startDate.utc().format("YYYY-MM-DDTHH:mm:ss"));
      }
      if (values.endDate) {
        formData.append("endDate", values.endDate.utc().format("YYYY-MM-DDTHH:mm:ss"));
      }

      // 3. จัดการไฟล์รูปภาพหลัก
      if (values.eventCard?.[0]?.originFileObj) {
        formData.append("eventCard", values.eventCard[0].originFileObj);
      }
      if (values.eventDetail?.[0]?.originFileObj) {
        formData.append("eventDetail", values.eventDetail[0].originFileObj);
      }
      if (values.eventMap?.[0]?.originFileObj) {
        formData.append("eventMap", values.eventMap[0].originFileObj);
      }

      // 4. จัดการ Slideshow และระบุลำดับ (Indices)
      const indices = [];
      if (values.slideshowSlot1?.[0]?.originFileObj) {
        formData.append("eventSlideshow", values.slideshowSlot1[0].originFileObj);
        indices.push(1);
      }
      if (values.slideshowSlot2?.[0]?.originFileObj) {
        formData.append("eventSlideshow", values.slideshowSlot2[0].originFileObj);
        indices.push(2);
      }
      if (values.slideshowSlot3?.[0]?.originFileObj) {
        formData.append("eventSlideshow", values.slideshowSlot3[0].originFileObj);
        indices.push(3);
      }

      // ส่งรายการลำดับของสไลด์ที่อัปโหลด
      if (indices.length > 0) {
        indices.forEach((idx) => formData.append("slideshowIndices", idx));
      }

      // ส่ง Request ไปยัง Backend
      await createEvent(formData);
      
      antNotification.success({
        message: "สร้างกิจกรรมสำเร็จ",
        description: `กิจกรรม ${values.eventName} ถูกเพิ่มเข้าสู่ระบบแล้ว`,
      });

      // นำทางกลับไปยังหน้าจัดการหลัก
      setTimeout(() => router.push("/admin/event"), 1500);
    } catch (error) {
      const errorMsg = error.data?.message || "เกิดข้อผิดพลาดในการสร้างกิจกรรม";
      showNotification(errorMsg, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <Notification
        isVisible={notification.isVisible}
        onClose={() => setNotification(p => ({...p, isVisible: false}))}
        isError={notification.isError}
        message={notification.message}
      />
      
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-500">กรอกข้อมูลให้ครบถ้วนเพื่อสร้างกิจกรรมใหม่ในระบบ</p>
      </div>

      <EventForm
        onFinish={handleCreate} // เรียกใช้ฟังก์ชันสร้างเมื่อกด Save
        locationOptions={country}
        isLoading={loading}
        isEditMode={false} // ระบุว่าเป็นโหมดสร้าง (ปุ่ม Delete จะไม่ขึ้น)
      />
    </div>
  );
}