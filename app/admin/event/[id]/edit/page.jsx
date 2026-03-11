"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Modal, notification as antNotification } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

// เรียกใช้ฟังก์ชันจาก libs/fetch.js ที่คุณมีอยู่แล้ว
import {
  getEventById,
  updateEvent,
  hardDeleteEvent,
  deleteEventImage,
  getUpdateImage,
  getData
} from "@/libs/fetch";

import EventForm from "@/app/organizer/components/EventForm";
import Notification from "@/components/Notification/Notification";

dayjs.extend(utc);

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState(null);
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

  // --- ส่วนที่ 1: ดึงข้อมูลสถานที่ (เดิม) ---
  const fetchData = async () => {
    try {
      const res = await getData('users/countrys');
      if (res?.data?.length > 0) {
        const resCity = await getData(`users/country/${res.data[0].id}/citys`);
        setCountry(resCity?.data || []);
      }
    } catch (err) { console.error(err); }
  };

  // --- ส่วนที่ 2: ดึงข้อมูลอีเว้นท์และจัดรูปแบบรูปภาพ (เดิม + แก้ไขรูป) ---
  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      try {
        const response = await getEventById(id);
        const eventData = response.data || response;

        // ฟังก์ชันช่วยดึงรูปเดิมมาแสดงใน Form (ใช้ getUpdateImage เดิมของคุณ)
        const loadAndFormatImage = async (imgFilename, uidSuffix) => {
          if (!imgFilename) return [];
          try {
            let fetchPath = imgFilename;
            if (!fetchPath.startsWith("upload/events") && !fetchPath.includes("/")) {
              fetchPath = `upload/events/${fetchPath}`;
            }
            if (fetchPath.startsWith("/")) fetchPath = fetchPath.substring(1);
            
            const blobUrl = await getUpdateImage(fetchPath);
            return [{
              uid: `-existing-${uidSuffix}`,
              name: imgFilename,
              status: "done",
              url: blobUrl,
              thumbUrl: blobUrl,
            }];
          } catch (err) { return []; }
        };

        const imagesObj = eventData.images || {};
        const slidesArray = imagesObj.imgSlideShow || [];

        const [fileCard, fileDetail, fileMap, slide1, slide2, slide3] = await Promise.all([
          loadAndFormatImage(imagesObj.imgCard, "card"),
          loadAndFormatImage(imagesObj.imgDetail, "detail"),
          loadAndFormatImage(imagesObj.imgMap, "map"),
          loadAndFormatImage(slidesArray[0], "slide1"),
          loadAndFormatImage(slidesArray[1], "slide2"),
          loadAndFormatImage(slidesArray[2], "slide3"),
        ]);

        setInitialData({
          ...eventData,
          eventName: eventData.eventName,
          hostOrganization: eventData.hostOrganisation,
          location: eventData.location,
          eventDescription: eventData.eventDesc,
          eventType: eventData.eventTypeId?.id,
          eventStatus: eventData.eventStatus, 
          startDate: eventData.startDate ? dayjs.utc(eventData.startDate).local() : null,
          endDate: eventData.endDate ? dayjs.utc(eventData.endDate).local() : null,
          contactEmail: eventData.contactEmail || "",
          contactPhone: eventData.contactPhone || "",
          contactLine: eventData.contactLine || "",
          contactFacebook: eventData.contactFacebook || "",
          eventCard: fileCard,
          eventDetail: fileDetail,
          eventMap: fileMap,
          slideshowSlot1: slide1,
          slideshowSlot2: slide2,
          slideshowSlot3: slide3,
        });
      } catch (error) {
        showNotification("Error fetching event data", true);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
    fetchEventData();
  }, [id]);

  // --- ส่วนที่ 3: อัปเดตข้อมูล (Update Function ตามรูป Postman) ---
  const handleUpdate = async (values) => {
    // Check Status Logic: กิจกรรมจบแล้วต้องเป็น FINISHED/DELETED เท่านั้น
    const now = dayjs();
    const eventEndDate = values.endDate || initialData.endDate;
    if (dayjs(eventEndDate).isBefore(now) && (values.eventStatus === "UPCOMING" || values.eventStatus === "ONGOING")) {
      antNotification.error({
        message: 'สถานะไม่ถูกต้อง',
        description: 'อีเว้นท์จบไปแล้ว ไม่สามารถตั้งเป็น UPCOMING หรือ ONGOING ได้ กรุณาแก้เวลาจบกิจกรรมก่อน',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("eventName", values.eventName);
      formData.append("eventDesc", values.eventDescription);
      formData.append("eventTypeId", values.eventType);
      formData.append("hostOrganisation", values.hostOrganization || "");
      formData.append("location", values.location);
      formData.append("contactEmail", values.contactEmail || "");
      formData.append("contactPhone", values.contactPhone || "");
      formData.append("status", values.eventStatus); 

      if (values.startDate) formData.append("startDate", values.startDate.utc().format("YYYY-MM-DDTHH:mm:ss"));
      if (values.endDate) formData.append("endDate", values.endDate.utc().format("YYYY-MM-DDTHH:mm:ss"));

      // จัดการไฟล์รูปภาพ (ถ้ามีไฟล์ใหม่จะส่ง originFileObj)
      if (values.eventCard?.[0]?.originFileObj) formData.append("eventCard", values.eventCard[0].originFileObj);
      if (values.eventDetail?.[0]?.originFileObj) formData.append("eventDetail", values.eventDetail[0].originFileObj);
      if (values.eventMap?.[0]?.originFileObj) formData.append("eventMap", values.eventMap[0].originFileObj);

      // Slideshow Indices Logic
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
      if (indices.length > 0) indices.forEach((idx) => formData.append("slideshowIndices", idx));

      await updateEvent(id, formData);
      showNotification("Update Success!", false);
      setTimeout(() => router.push("/home#organizer-section"), 1000);
    } catch (error) {
      showNotification(error.data?.message || "Update failed", true);
    } finally {
      setLoading(false);
    }
  };

  // --- ส่วนที่ 4: ลบข้อมูลถาวร (Hard Delete ตามรูป Postman) ---
  const handleDelete = () => {
    Modal.confirm({
      title: 'ยืนยันการลบกิจกรรมถาวร?',
      icon: <ExclamationCircleFilled />,
      content: 'คำเตือน: ข้อมูลผู้ลงทะเบียน, ผล Survey และของรางวัลจะถูกลบถาวร ไม่สามารถกู้คืนได้',
      okText: 'ลบถาวร',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      async onOk() {
        setLoading(true);
        try {
          await hardDeleteEvent(id);
          showNotification("Delete event success!", false);
          setTimeout(() => router.push("/home#organizer-section"), 1000);
        } catch (error) {
          showNotification("Cannot delete event", true);
        } finally { setLoading(false); }
      },
    });
  };

  // --- ส่วนที่ 5: ลบรูปภาพเดี่ยว (ใช้ฟังก์ชันเดิมของคุณ) ---
  const handleImageRemove = async (file, fieldName) => {
    if (!file.uid.startsWith("-existing-")) return true;
    try {
      let category = "";
      let index = null;
      if (fieldName === "eventCard") category = "card";
      else if (fieldName === "eventDetail") category = "detail";
      else if (fieldName === "eventMap") category = "map";
      else if (fieldName.startsWith("slideshowSlot")) {
        category = "slideshow";
        index = fieldName.replace("slideshowSlot", "");
      }
      if (category) {
        await deleteEventImage(id, category, index);
        showNotification("Delete image success", false);
        return true;
      }
    } catch (error) { return false; }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <Notification
        isVisible={notification.isVisible}
        onClose={() => setNotification(p => ({...p, isVisible: false}))}
        isError={notification.isError}
        message={notification.message}
      />
      <EventForm
        initialValues={initialData}
        onFinish={handleUpdate} // ส่งฟังก์ชัน Update ไปใช้
        onDelete={handleDelete} // ส่งฟังก์ชัน Hard Delete ไปใช้
        onFileRemove={handleImageRemove} // ส่งฟังก์ชันลบรูปไปใช้
        locationOptions={country}
        isLoading={loading || fetching}
        isEditMode={true}
      />
    </div>
  );
}