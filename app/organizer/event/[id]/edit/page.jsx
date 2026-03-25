"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import EventForm from "@/components/Event/EventForm"; 

// เรียกใช้ API ปกติสำหรับ Organizer
import { 
  getEventById, 
  deleteEvent, 
  deleteEventImage, 
  getUpdateImage, 
  getData,
  updateEvent
} from "@/libs/fetch";
import Notification from "@/components/Notification/Notification";

dayjs.extend(utc);

export default function OrganizerEditEventPage() {
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

  const showNotification = (msg, isErr = false) => {
    setNotification({ isVisible: true, message: msg, isError: isErr });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      try {
        const resLocation = await getData("users/countrys");
        if (resLocation?.data?.[0]?.id) {
          const resCity = await getData(`users/country/${resLocation.data[0].id}/citys`);
          setCountry(resCity?.data || []);
        }

        // ดึงข้อมูลสำหรับ Organizer
        const response = await getEventById(id);
        const eventData = response.data || response;

        const formatExistingImage = async (imgFilename, uidSuffix) => {
          if (!imgFilename) return [];
          try {
            let fetchPath = imgFilename.startsWith("upload/events") 
              ? imgFilename 
              : `upload/events/${imgFilename}`;
            
            const blobUrl = await getUpdateImage(fetchPath);
            return [{
              uid: `-existing-${uidSuffix}`,
              name: imgFilename,
              status: "done",
              url: blobUrl,
              thumbUrl: blobUrl,
            }];
          } catch (err) {
            console.error(`Failed to load: ${imgFilename}`, err);
            return [];
          }
        };

        const images = eventData.images || {};
        
        const [fileCard, fileDetail, fileMap, s1, s2, s3] = await Promise.all([
          formatExistingImage(images.imgCard, "card"),
          formatExistingImage(images.imgDetail, "detail"),
          formatExistingImage(images.imgMap || eventData.imgMap, "map"),
          formatExistingImage(images.imgSlideShow?.[0], "slide1"),
          formatExistingImage(images.imgSlideShow?.[1], "slide2"),
          formatExistingImage(images.imgSlideShow?.[2], "slide3"),
        ]);

        setInitialData({
          ...eventData,
          eventName: eventData.eventName,
          hostOrganization: eventData.hostOrganisation, 
          eventDescription: eventData.eventDesc,    
          eventType: eventData.eventTypeId?.id,
          startDate: eventData.startDate ? dayjs.utc(eventData.startDate).local() : null,
          endDate: eventData.endDate ? dayjs.utc(eventData.endDate).local() : null,
          eventCard: fileCard,
          eventDetail: fileDetail,
          eventMap: fileMap,
          slideshowSlot1: s1,
          slideshowSlot2: s2,
          slideshowSlot3: s3,
        });
      } catch (error) {
        console.error("Fetch Error:", error);
        showNotification("ไม่สามารถโหลดข้อมูลกิจกรรมได้", true);
      } finally {
        setFetching(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleUpdate = async (values) => {
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
      formData.append("contactLine", values.contactLine || "");
      formData.append("contactFacebook", values.contactFacebook || "");

      const creatorId = initialData.createdBy?.id || initialData.createdBy;
      if (creatorId) formData.append("createdBy", creatorId);

      if (values.startDate) formData.append("startDate", values.startDate.utc().format("YYYY-MM-DDTHH:mm:ss"));
      if (values.endDate) formData.append("endDate", values.endDate.utc().format("YYYY-MM-DDTHH:mm:ss"));

      if (values.eventCard?.[0]?.originFileObj) formData.append("eventCard", values.eventCard[0].originFileObj);
      if (values.eventDetail?.[0]?.originFileObj) formData.append("eventDetail", values.eventDetail[0].originFileObj);
      if (values.eventMap?.[0]?.originFileObj) formData.append("eventMap", values.eventMap[0].originFileObj);

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
      indices.forEach(idx => formData.append("slideshowIndices", idx));

      // อัปเดตสำหรับ Organizer
      await updateEvent(id, formData);
      showNotification("อัปเดตกิจกรรมสำเร็จ!", false);
      setTimeout(() => router.push("/organizer/event"), 1500);
    } catch (error) {
      const msg = error.data?.message || "อัปเดตไม่สำเร็จ";
      showNotification(msg, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // ลบกิจกรรมสำหรับ Organizer
      await deleteEvent(id);
      showNotification("ลบกิจกรรมสำเร็จ", false);
      setTimeout(() => router.push("/organizer/event"), 1500); 
    } catch (error) {
      showNotification("ลบไม่สำเร็จ: " + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = async (file, fieldName) => {
    if (!file.uid.startsWith("-existing-")) return true;
    try {
      let category = "";
      let index = null;
      if (fieldName === "eventCard") category = "card";
      else if (fieldName === "eventDetail") category = "detail";
      else if (fieldName === "eventMap") category = "map";
      else if (fieldName.startsWith("slideshow")) {
        category = "slideshow";
        index = fieldName.replace("slideshowSlot", "");
      }
      
      await deleteEventImage(id, category, index);
      showNotification("ลบรูปภาพสำเร็จ", false);
      return true;
    } catch (error) {
      showNotification("ลบรูปไม่สำเร็จ", true);
      return false;
    }
  };

  if (fetching) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />

      <EventForm
        initialValues={initialData}
        onFinish={handleUpdate}
        onDelete={handleDelete}
        onFileRemove={handleImageRemove}
        locationOptions={country}
        isLoading={loading}
        isEditMode={true}
        onValidationFailed={() => showNotification("กรุณาตรวจสอบข้อมูล", true)}
      />
    </div>
  );
}