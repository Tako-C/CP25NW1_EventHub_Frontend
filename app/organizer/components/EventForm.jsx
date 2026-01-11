'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Image,
  Phone,
  Mail,
  Facebook,
  Globe,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Form,
  DatePicker,
  Select,
  Upload,
  message,
  Button,
  Popconfirm,
  Spin,
  Input,
} from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { getEventTypes } from '@/libs/fetch';
import EventPreview from './EventPreview';

// --- Custom Input Field ---
function CustomInputField({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  placeholder,
  disabled = false,
  isTextArea = false,
  rows = 4,
}) {
  return (
    <div className="flex flex-col mb-0">
      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400 z-10">{icon}</div>
        )}

        {isTextArea ? (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className={`w-full ${
              icon ? 'pl-10' : 'pl-4'
            } pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 text-sm md:text-base resize-none placeholder-gray-400`}
          />
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full ${
              icon ? 'pl-10' : 'pl-4'
            } pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-700 text-sm md:text-base placeholder-gray-400 ${
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
export default function EventForm({
  initialValues,
  onFinish,
  onDelete,
  onFileRemove,
  isLoading,
  isEditMode = false,
  onValidationFailed,
}) {
  const router = useRouter();
  const [form] = Form.useForm();
  const startDate = Form.useWatch('startDate', form);

  const formValues = Form.useWatch([], form);

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledEndDate = (current) => {
    if (current && current < dayjs().startOf('day')) {
      return true;
    }
    if (startDate) {
      return current && current < dayjs(startDate).startOf('day');
    }
    return false;
  };

  const uploadProps = {
    beforeUpload: (file) => {
      // return false เพื่อระงับการ auto upload
      return false;
    },
    listType: 'picture-card',
    maxCount: 1,
    showUploadList: { showPreviewIcon: false }, // ปรับตามต้องการ
    accept: 'image/*',
  };

  const [eventTypes, setEventTypes] = useState([]);
  const [isTypeLoading, setIsTypesLoading] = useState(true);

  const [formData, setFormData] = useState({
    eventName: '',
    hostOrganization: '',
    location: '',
    eventDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactLine: '',
    contactFacebook: '',
  });

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({ ...prev, ...initialValues }));
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await getEventTypes();
        setEventTypes(data.data || []);
      } catch (error) {
        console.error('Failed to load types:', error);
        setEventTypes([]);
      } finally {
        setIsTypesLoading(false);
      }
    };

    fetchTypes();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    form.setFieldsValue({ [field]: value });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const handleFormSubmit = (values) => {
    const finalValues = { ...formData, ...values };
    onFinish(finalValues);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 border-b border-gray-100 pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isEditMode
              ? 'Update your event details.'
              : 'Fill in the details to publish your event.'}
          </p>
        </div>

        {isEditMode && onDelete && (
          <Popconfirm
            title="Delete this event?"
            onConfirm={onDelete}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <button
              type="button"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Delete Event</span>
            </button>
          </Popconfirm>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        onFinishFailed={() => {
          if (onValidationFailed) onValidationFailed();
        }}
        initialValues={initialValues}
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="flex-1 w-full space-y-8">
            {/* 1. General Information */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-600" /> General Info
                <span className="text-red-500 font-normal text-s">*</span>
                {/* <span className="text-gray-400 font-normal text-xs">
                  (All fields are required)
                </span> */}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Event Name */}
                <div className="md:col-span-2">
                  <Form.Item
                    name="eventName"
                    rules={[
                      { required: true, message: 'Please enter event name' },
                    ]}
                    className="mb-0"
                  >
                    <CustomInputField
                      label="Event Name"
                      icon={<Briefcase size={18} />}
                      placeholder="Ex. Tech Summit 2024"
                    />
                  </Form.Item>
                </div>

                {/* Event Type (Antd Select Style - Box) */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Event Type
                  </label>
                  <Form.Item
                    name="eventType"
                    rules={[
                      { required: true, message: 'Please select event type' },
                    ]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="Select Type"
                      size="large"
                      className="w-full"
                      style={{ height: '46px' }}
                      popupMatchSelectWidth={false}
                      // 3. แก้ไขตรงนี้: ใช้ state ตัวใหม่แทน eventTypes.length
                      loading={isTypeLoading}
                      disabled={isTypeLoading} // แถม: ปิดไม่ให้กดตอนโหลดอยู่
                    >
                      {eventTypes.map((t) => (
                        <Select.Option key={t.id} value={t.id}>
                          {t.eventTypeName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                {/* Host Organization */}
                <CustomInputField
                  label="Host Organization"
                  value={formData.hostOrganization}
                  onChange={(v) => handleChange('hostOrganization', v)}
                  icon={<Briefcase size={18} />}
                />

                {/* Location */}
                <div className="md:col-span-2">
                  <Form.Item
                    name="location"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter event location',
                      },
                    ]}
                    className="mb-0"
                  >
                    <CustomInputField
                      label="Location"
                      icon={<MapPin size={18} />}
                      placeholder="Location of the event"
                    />
                  </Form.Item>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Form.Item
                    name="eventDescription"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter event description',
                      },
                    ]}
                    className="mb-0"
                  >
                    <CustomInputField
                      label="Description"
                      isTextArea={true}
                      placeholder="Describe your event..."
                    />
                  </Form.Item>
                </div>

                {/* Date Pickers (Box Style) */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Start Date
                  </label>
                  <Form.Item
                    name="startDate"
                    rules={[
                      { required: true, message: 'Please select start date' },
                    ]}
                    className="mb-0"
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={disabledDate}
                      className="w-full h-[46px] rounded-xl border-gray-200 bg-gray-50 hover:bg-white focus:bg-white"
                    />
                  </Form.Item>
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    End Date
                  </label>
                  <Form.Item
                    name="endDate"
                    rules={[
                      { required: true, message: 'Please select end date' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || !getFieldValue('startDate')) {
                            return Promise.resolve();
                          }
                          if (value.isAfter(getFieldValue('startDate'))) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('End date must be after start date!')
                          );
                        },
                      }),
                    ]}
                    className="mb-0"
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={disabledEndDate}
                      className="w-full h-[46px] rounded-xl border-gray-200 bg-gray-50 hover:bg-white focus:bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </section>

            <hr className="border-gray-100 my-6" />

            {/* 2. Contact Information */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Phone size={20} className="text-purple-600" /> Contact Info
                <span className="text-red-500 font-normal text-s">*</span>
                <span className="text-gray-400 font-normal text-xs">
                  (Email and telephone are required)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Email */}
                <Form.Item
                  name="contactEmail"
                  rules={[
                    { required: true, message: 'Please enter contact email' },
                    { type: 'email', message: 'Invalid email format' },
                  ]}
                  className="mb-0"
                >
                  <CustomInputField
                    label="Email"
                    icon={<Mail size={18} />}
                    type="email"
                  />
                </Form.Item>

                {/* Phone */}
                <Form.Item
                  name="contactPhone"
                  rules={[
                    { required: true, message: 'Please enter contact phone' },
                    {
                      pattern: /^[0-9+\-()\s]+$/,
                      message: 'Invalid phone number',
                    },
                  ]}
                  className="mb-0"
                >
                  <CustomInputField
                    label="Phone"
                    icon={<Phone size={18} />}
                    type="tel"
                  />
                </Form.Item>

                <CustomInputField
                  label="Line ID"
                  value={formData.contactLine}
                  onChange={(v) => handleChange('contactLine', v)}
                  icon={<Globe size={18} />}
                />
                <CustomInputField
                  label="Facebook"
                  value={formData.contactFacebook}
                  onChange={(v) => handleChange('contactFacebook', v)}
                  icon={<Facebook size={18} />}
                />
              </div>
            </section>

            <hr className="border-gray-100 my-6" />

            {/* 3. Media Uploads */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Image size={20} className="text-purple-600" /> Event Images
                <span className="text-red-500 font-normal text-s">*</span>
                <span className="text-gray-400 font-normal text-xs">
                  (All images are required except slideshow which needs at least
                  1 image)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* ส่ง onRemove ไปให้ UploadBox */}
                <UploadBox
                  label="Event Card"
                  name="eventCard"
                  normFile={normFile}
                  onRemove={onFileRemove}
                  required={!isEditMode}
                />
                <UploadBox
                  label="Detail Cover"
                  name="eventDetail"
                  normFile={normFile}
                  onRemove={onFileRemove}
                  required={!isEditMode}
                />
                <UploadBox
                  label="Location Map"
                  name="eventMap"
                  normFile={normFile}
                  onRemove={onFileRemove}
                  required={!isEditMode}
                />
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  Slideshow Gallery
                  <span className="text-red-500 font-normal text-s">*</span>
                  <span className="text-gray-400 font-normal text-xs">
                    (At least 1 image required, Max 3)
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <UploadBox
                    label="Slide 1"
                    name="slideshowSlot1"
                    normFile={normFile}
                    onRemove={onFileRemove}
                    desc={isEditMode ? 'Change/Delete Slide 1' : 'Image 1'}
                  />
                  <UploadBox
                    label="Slide 2"
                    name="slideshowSlot2"
                    normFile={normFile}
                    onRemove={onFileRemove}
                    desc={isEditMode ? 'Change/Delete Slide 2' : 'Image 2'}
                  />
                  <UploadBox
                    label="Slide 3"
                    name="slideshowSlot3"
                    normFile={normFile}
                    onRemove={onFileRemove}
                    desc={isEditMode ? 'Change/Delete Slide 3' : 'Image 3'}
                  />
                </div>

                <Form.Item
                  name="slideshowValidator"
                  dependencies={[
                    'slideshowSlot1',
                    'slideshowSlot2',
                    'slideshowSlot3',
                  ]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator() {
                        const s1 = getFieldValue('slideshowSlot1');
                        const s2 = getFieldValue('slideshowSlot2');
                        const s3 = getFieldValue('slideshowSlot3');

                        const hasSlide =
                          (s1 && s1.length > 0) ||
                          (s2 && s2.length > 0) ||
                          (s3 && s3.length > 0);

                        if (hasSlide) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('At least 1 slideshow image is required!')
                        );
                      },
                    }),
                  ]}
                  className="[&_.ant-form-item-explain]:text-center [&_.ant-form-item-explain]:-mt-2.5"
                >
                  <Input type="hidden" />
                </Form.Item>
              </div>
            </section>

            {formValues && <EventPreview formValues={formValues} />}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-2.5 rounded-full font-medium bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Event'
                  : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

// Helper: Upload Box
function UploadBox({
  label,
  name,
  normFile,
  desc,
  required = false,
  onRemove,
}) {
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
      <span className="text-sm font-semibold text-gray-700 mb-2">{label}</span>
      <Form.Item
        name={name}
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={required ? [{ required: true, message: 'Required' }] : []}
        className="mb-1 [&_.ant-form-item-explain]:text-center"
      >
        <Upload
          listType="picture-card"
          maxCount={1}
          beforeUpload={() => false}
          showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
          onRemove={(file) => {
            if (onRemove) return onRemove(file, name);
            return true;
          }}
        >
          <div className="flex flex-col items-center justify-center text-gray-400 hover:text-purple-500">
            <Plus size={20} />
            <div className="mt-1 text-xs">Upload</div>
          </div>
        </Upload>
      </Form.Item>
      <span className="text-xs text-gray-400 text-center">{desc}</span>
    </div>
  );
}
