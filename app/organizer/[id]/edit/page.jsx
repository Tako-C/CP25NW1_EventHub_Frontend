'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dayjs from 'dayjs';
import EventForm from '@/app/organizer/components/EventForm';
import Notification from '@/components/Notification/Notification';
import {
  getEventById,
  updateEvent,
  deleteEvent,
  deleteEventImage,
  getUpdateImage,
} from '@/libs/fetch';

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState(null);

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
    const fetchEventData = async () => {
      if (!id) return;
      try {
        const data = await getEventById(id);
        const event = data.data || data;

        const loadAndFormatImage = async (path, uid) => {
          if (!path) return [];

          try {
            const result = await getUpdateImage(path);

            if (typeof result !== 'string') {
              return [];
            }

            return [
              {
                uid: `-existing-${uid}`,
                name: 'image.jpg',
                status: 'done',
                url: result,
              },
            ];
          } catch (err) {
            return [];
          }
        };

        const imgSource = event.images || event;
        const pathCard = imgSource.imgCard || event.eventCard;
        const pathDetail = imgSource.imgDetail || event.eventDetail;
        const pathMap = imgSource.imgMap || event.eventMap;

        // Slideshow Array
        const slides = imgSource.imgSlideShow || event.eventSlideshow || [];
        const [fileCard, fileDetail, fileMap, slide1, slide2, slide3] =
          await Promise.all([
            loadAndFormatImage(pathCard, 'card'),
            loadAndFormatImage(pathDetail, 'detail'),
            loadAndFormatImage(pathMap, 'map'),
            // Slideshow Slots
            loadAndFormatImage(slides[0], 'slide1'),
            loadAndFormatImage(slides[1], 'slide2'),
            loadAndFormatImage(slides[2], 'slide3'),
          ]);
        console.log(event);
        setInitialData({
          ...event,
          // Text Data
          eventDescription: event.eventDesc || event.eventDescription,
          eventType:
            event.eventTypeId?.id ||
            event.eventTypeId ||
            event.eventType?.id ||
            event.eventType,
          startDate: event.startDate ? dayjs(event.startDate) : null,
          endDate: event.endDate ? dayjs(event.endDate) : null,
          contactEmail: event.contactEmail || event.email || '',
          contactPhone: event.contactPhone || event.phone || '',
          contactLine: event.contactLine || event.lineId || '',
          contactFacebook: event.contactFacebook || event.facebook || '',

          // Image Data
          eventCard: fileCard,
          eventDetail: fileDetail,
          eventMap: fileMap,

          // Slideshow Slots
          slideshowSlot1: slide1,
          slideshowSlot2: slide2,
          slideshowSlot3: slide3,
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        showNotification('Error fetching event data', true);
      } finally {
        setFetching(false);
      }
    };

    fetchEventData();
  }, [id]);

  // --- 2. Handle Update ---
  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Text Data
      formData.append('eventName', values.eventName);
      formData.append('eventDesc', values.eventDescription);
      formData.append('eventTypeId', values.eventType);
      formData.append('location', values.location);
      formData.append('contactEmail', values.contactEmail || '');
      formData.append('contactPhone', values.contactPhone || '');
      formData.append('contactLine', values.contactLine || '');
      formData.append('contactFacebook', values.contactFacebook || '');
      const creatorId = initialData.createdBy?.id || initialData.createdBy;
      if (creatorId) {
        formData.append('createdBy', creatorId);
      }
      if (values.startDate)
        formData.append(
          'startDate',
          values.startDate.format('YYYY-MM-DDTHH:mm:ss')
        );
      if (values.endDate)
        formData.append(
          'endDate',
          values.endDate.format('YYYY-MM-DDTHH:mm:ss')
        );

      // Single Files
      if (values.eventCard?.[0]?.originFileObj)
        formData.append('eventCard', values.eventCard[0].originFileObj);
      if (values.eventDetail?.[0]?.originFileObj)
        formData.append('eventDetail', values.eventDetail[0].originFileObj);
      if (values.eventMap?.[0]?.originFileObj)
        formData.append('eventMap', values.eventMap[0].originFileObj);

      // Slideshow Files
      const indices = [];

      if (values.slideshowSlot1?.[0]?.originFileObj) {
        formData.append(
          'eventSlideshow',
          values.slideshowSlot1[0].originFileObj
        );
        indices.push(1);
      }
      if (values.slideshowSlot2?.[0]?.originFileObj) {
        formData.append(
          'eventSlideshow',
          values.slideshowSlot2[0].originFileObj
        );
        indices.push(2);
      }
      if (values.slideshowSlot3?.[0]?.originFileObj) {
        formData.append(
          'eventSlideshow',
          values.slideshowSlot3[0].originFileObj
        );
        indices.push(3);
      }

      // ส่ง Indices ถ้ามีรูป Slideshow ใหม่
      if (indices.length > 0) {
        indices.forEach((idx) => formData.append('slideshowIndices', idx));
      } else {
        // กรณีไม่มีการแก้ไข Slideshow เลย ให้ส่งค่า null
        formData.append('slideshowIndices', '');
      }

      await updateEvent(id, formData);

      showNotification('Update Success!', false);
      setTimeout(() => router.push('/home#organizer-section'), 1000);
    } catch (error) {
      console.error(error);
      showNotification('Update failed', true);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Handle Delete ---
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteEvent(id);

      showNotification('Delete event success!', false);

      setTimeout(() => {
        router.push('/home#organizer-section');
      }, 1000);
    } catch (error) {
      console.error('Delete error:', error);
      showNotification(error.message || 'Cannot delete event', true);
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = async (file, fieldName) => {
    if (!file.uid.startsWith('-existing-')) return true;

    try {
      let category = '';
      let index = null;

      if (fieldName === 'eventCard') category = 'card';
      else if (fieldName === 'eventDetail') category = 'detail';
      else if (fieldName === 'eventMap') category = 'map';
      else if (fieldName === 'slideshowSlot1') {
        category = 'Slideshow';
        index = 1;
      } else if (fieldName === 'slideshowSlot2') {
        category = 'Slideshow';
        index = 2;
      } else if (fieldName === 'slideshowSlot3') {
        category = 'Slideshow';
        index = 3;
      }

      if (category) {
        await deleteEventImage(id, category, index);
        showNotification('Delete image success', false);
        return true;
      }
    } catch (error) {
      console.error(error);
      showNotification('Delete image failed', true);
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
        isLoading={loading}
        isEditMode={true}
        onValidationFailed={() =>
          showNotification('Please fill all required fields.', true)
        }
      />
    </div>
  );
}
