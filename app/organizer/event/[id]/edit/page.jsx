"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
import EventForm from "@/app/organizer/components/EventForm";
import Notification from "@/components/Notification/Notification";
import {
  getEventById,
  updateEvent,
  deleteEvent,
  deleteEventImage,
  getUpdateImage,
  getData
} from "@/libs/fetch";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [country, setCountry] = useState([])

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
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

    const fetchData = async () => {
      const res = await getData('users/countrys');
      const resCity = await getData(`users/country/${res?.data[0].id}/citys`)
      console.log(resCity)
      setCountry(resCity?.data || [])
    }

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      try {
        const response = await getEventById(id);
        const eventData = response.data || response;

        const loadAndFormatImage = async (imgFilename, uidSuffix) => {
          if (!imgFilename) return [];

          try {
            let fetchPath = imgFilename;
            if (
              !fetchPath.startsWith("upload/events") &&
              !fetchPath.includes("/")
            ) {
              fetchPath = `upload/events/${fetchPath}`;
            }

            // ลบ / ตัวแรกออก ถ้ามี
            if (fetchPath.startsWith("/")) {
              fetchPath = fetchPath.substring(1);
            }

            // ดึง Blob URL
            const blobUrl = await getUpdateImage(fetchPath);

            if (!blobUrl || typeof blobUrl !== "string") {
              return [];
            }

            return [
              {
                uid: `-existing-${uidSuffix}`, // สำคัญ: ใช้ prefix นี้เพื่อเช็คตอนลบ
                name: imgFilename,
                status: "done",
                url: blobUrl,
                thumbUrl: blobUrl,
              },
            ];
          } catch (err) {
            console.error(`Failed to load image: ${imgFilename}`, err);
            return [];
          }
        };

        const imagesObj = eventData.images || {};
        const pathCard = imagesObj.imgCard; // "1_card.jpg"
        const pathDetail = imagesObj.imgDetail; // "1_detail.jpg"
        // เช็คเผื่อว่ามี imgMap ในอนาคต (ใน JSON ตัวอย่างไม่มี)
        const pathMap = imagesObj.imgMap || eventData.imgMap;
        const slidesArray = imagesObj.imgSlideShow || []; // ["1_slideshow.jpg"]

        // Parallel Fetching: ดึงทุกรูปพร้อมกัน
        const [fileCard, fileDetail, fileMap, slide1, slide2, slide3] =
          await Promise.all([
            loadAndFormatImage(pathCard, "card"),
            loadAndFormatImage(pathDetail, "detail"),
            loadAndFormatImage(pathMap, "map"),
            // Slideshow: ดึงตาม Index
            loadAndFormatImage(slidesArray[0], "slide1"),
            loadAndFormatImage(slidesArray[1], "slide2"),
            loadAndFormatImage(slidesArray[2], "slide3"),
          ]);

        setInitialData({
          ...eventData, // ระวังการ spread ข้อมูลที่ไม่ได้ใช้

          // --- Text Data Mapping ---
          eventName: eventData.eventName,
          hostOrganization: eventData.hostOrganisation, // Map Organisation -> Organization
          location: eventData.location,
          eventDescription: eventData.eventDesc, // Map eventDesc -> eventDescription

          // Event Type (เข้าถึง nested object)
          eventType: eventData.eventTypeId?.id,

          // Date
          startDate: eventData.startDate
            ? dayjs.utc(eventData.startDate).local()
            : null,
          endDate: eventData.endDate
            ? dayjs.utc(eventData.endDate).local()
            : null,

          // Contacts
          contactEmail: eventData.contactEmail || "",
          contactPhone: eventData.contactPhone || "",
          contactLine: eventData.contactLine || "",
          contactFacebook: eventData.contactFacebook || "",

          // --- Image Data (FileList) ---
          eventCard: fileCard,
          eventDetail: fileDetail,
          eventMap: fileMap,

          // --- Slideshow Slots ---
          slideshowSlot1: slide1,
          slideshowSlot2: slide2,
          slideshowSlot3: slide3,
        });
      } catch (error) {
        console.error("Error fetching event:", error);
        showNotification("Error fetching event data", true);
      } finally {
        setFetching(false);
      }
    };
    fetchData()
    fetchEventData();
  }, [id]);

  // --- 2. Handle Update ---
  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Text Data
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
      if (creatorId) {
        formData.append("createdBy", creatorId);
      }
      if (values.startDate)
        formData.append(
          "startDate",
          values.startDate.utc().format("YYYY-MM-DDTHH:mm:ss"),
        );
      if (values.endDate)
        formData.append(
          "endDate",
          values.endDate.utc().format("YYYY-MM-DDTHH:mm:ss"),
        );

      // Single Files
      if (values.eventCard?.[0]?.originFileObj)
        formData.append("eventCard", values.eventCard[0].originFileObj);
      if (values.eventDetail?.[0]?.originFileObj)
        formData.append("eventDetail", values.eventDetail[0].originFileObj);
      if (values.eventMap?.[0]?.originFileObj)
        formData.append("eventMap", values.eventMap[0].originFileObj);

      // Slideshow Files
      const indices = [];

      if (values.slideshowSlot1?.[0]?.originFileObj) {
        formData.append(
          "eventSlideshow",
          values.slideshowSlot1[0].originFileObj,
        );
        indices.push(1);
      }
      if (values.slideshowSlot2?.[0]?.originFileObj) {
        formData.append(
          "eventSlideshow",
          values.slideshowSlot2[0].originFileObj,
        );
        indices.push(2);
      }
      if (values.slideshowSlot3?.[0]?.originFileObj) {
        formData.append(
          "eventSlideshow",
          values.slideshowSlot3[0].originFileObj,
        );
        indices.push(3);
      }

      // ส่ง Indices ถ้ามีรูป Slideshow ใหม่
      if (indices.length > 0) {
        indices.forEach((idx) => formData.append("slideshowIndices", idx));
      } else {
        // กรณีไม่มีการแก้ไข Slideshow เลย ให้ส่งค่า null
        formData.append("slideshowIndices", "");
      }

      await updateEvent(id, formData);

      showNotification("Update Success!", false);
      setTimeout(() => router.push("/home#organizer-section"), 1000);
    } catch (error) {
      console.error(error);
      showNotification("Update failed", true);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Handle Delete ---
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteEvent(id);

      showNotification("Delete event success!", false);

      setTimeout(() => {
        router.push("/home#organizer-section");
      }, 1000);
    } catch (error) {
      console.error("Delete error:", error);
      showNotification(error.message || "Cannot delete event", true);
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
      else if (fieldName === "slideshowSlot1") {
        category = "slideshow";
        index = 1;
      } else if (fieldName === "slideshowSlot2") {
        category = "slideshow";
        index = 2;
      } else if (fieldName === "slideshowSlot3") {
        category = "slideshow";
        index = 3;
      }

      if (category) {
        await deleteEventImage(id, category, index);
        showNotification("Delete image success", false);
        return true;
      }
    } catch (error) {
      console.error(error);
      showNotification("Delete image failed", true);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />

      <EventForm
        initialValues={initialData}
        onFinish={handleUpdate}
        onDelete={handleDelete}
        onFileRemove={handleImageRemove}
        locationOptions={country}
        isLoading={loading}
        isEditMode={true}
        onValidationFailed={() =>
          showNotification("Please fill all required fields.", true)
        }
      />
    </div>
  );
}
