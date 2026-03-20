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
    try {
      const res = await getData('users/countrys');
      const resCity = await getData(`users/country/${res?.data[0].id}/citys`)
      setCountry(resCity?.data || [])
    } catch (error) {
      console.error("Fetch location error:", error);
    }
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

            if (fetchPath.startsWith("/")) {
              fetchPath = fetchPath.substring(1);
            }

            const blobUrl = await getUpdateImage(fetchPath);

            if (!blobUrl || typeof blobUrl !== "string") {
              return [];
            }

            return [
              {
                uid: `-existing-${uidSuffix}`,
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
        const pathCard = imagesObj.imgCard;
        const pathDetail = imagesObj.imgDetail;
        const pathMap = imagesObj.imgMap || eventData.imgMap;
        const slidesArray = imagesObj.imgSlideShow || [];

        const [fileCard, fileDetail, fileMap, slide1, slide2, slide3] =
          await Promise.all([
            loadAndFormatImage(pathCard, "card"),
            loadAndFormatImage(pathDetail, "detail"),
            loadAndFormatImage(pathMap, "map"),
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
          startDate: eventData.startDate
            ? dayjs.utc(eventData.startDate).local()
            : null,
          endDate: eventData.endDate
            ? dayjs.utc(eventData.endDate).local()
            : null,
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
        console.error("Error fetching event:", error);
        showNotification("ไม่สามารถโหลดข้อมูลกิจกรรมได้", true);
      } finally {
        setFetching(false);
      }
    };
    fetchData()
    fetchEventData();
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

      if (values.eventCard?.[0]?.originFileObj)
        formData.append("eventCard", values.eventCard[0].originFileObj);
      if (values.eventDetail?.[0]?.originFileObj)
        formData.append("eventDetail", values.eventDetail[0].originFileObj);
      if (values.eventMap?.[0]?.originFileObj)
        formData.append("eventMap", values.eventMap[0].originFileObj);

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

      if (indices.length > 0) {
        indices.forEach((idx) => formData.append("slideshowIndices", idx));
      } else {
        formData.append("slideshowIndices", "");
      }

      await updateEvent(id, formData);

      showNotification("อัปเดตข้อมูลสำเร็จ!", false);
      setTimeout(() => router.push("/home#organizer-section"), 1500);
    } catch (error) {
      console.error(error);
      showNotification("ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteEvent(id);
      showNotification("ลบกิจกรรมสำเร็จ!", false);
      setTimeout(() => {
        router.push("/home#organizer-section");
      }, 1500);
    } catch (error) {
      console.error("Delete error:", error);
      // showNotification(error.message || "ไม่สามารถลบกิจกรรมได้", true);
      showNotification("ไม่สามารถลบกิจกรรมได้", true);
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
        showNotification("ลบรูปภาพสำเร็จ", false);
        return true;
      }
    } catch (error) {
      console.error(error);
      showNotification("ลบรูปภาพไม่สำเร็จ", true);
      return false;
    }
  };

  if (fetching) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 mt-20">
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
          showNotification("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", true)
        }
      />
    </div>
  );
}