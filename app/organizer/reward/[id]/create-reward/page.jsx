"use client";

import { useState } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { createReward } from "@/libs/fetch";
import Notification from "@/components/Notification/Notification";

const REQUIREMENT_TYPES = [
  { value: "NONE", label: "ไม่มีเงื่อนไข" },
  { value: "PRE_SURVEY_DONE", label: "ทำ Pre-Survey แล้ว" },
  { value: "POST_SURVEY_DONE", label: "ทำ Post-Survey แล้ว" },
  { value: "CHECK_IN", label: "Check-in แล้ว" },
];

export default function CreateRewardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const eventId = searchParams.get("id") || "";
  const {id} = useParams();

  const [form, setForm] = useState({
    name: "",
    description: "",
    requirementType: "NONE",
    startRedeemAt: "",
    endRedeemAt: "",
    quantity: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.startRedeemAt || !form.endRedeemAt || !form.quantity) {
      showNotification("กรุณากรอกข้อมูลให้ครบถ้วน", true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("requirementType", form.requirementType);
      formData.append("startRedeemAt", form.startRedeemAt);
      formData.append("endRedeemAt", form.endRedeemAt);
      formData.append("quantity", form.quantity);
      if (imageFile) formData.append("image", imageFile);

      const res = await createReward(id, formData);
      if (res?.statusCode === 201 || res?.data) {
        showNotification("สร้างรางวัลสำเร็จ", false);
        setTimeout(() => router.back(), 1000);
      }
    } catch (error) {
      showNotification(`${error}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
        isError={notification.isError}
        message={notification.message}
      />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">กลับ</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">เพิ่มรางวัลใหม่</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              รูปภาพรางวัล
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => document.getElementById("reward-image").click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">คลิกเพื่ออัพโหลดรูปภาพ</span>
                </div>
              )}
            </div>
            <input
              id="reward-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ชื่อรางวัล <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="เช่น เสื้อยืดระลึกงาน Tech Conference 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="อธิบายรายละเอียดของรางวัล"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>

          {/* Requirement Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เงื่อนไขการรับรางวัล <span className="text-red-500">*</span>
            </label>
            <select
              name="requirementType"
              value={form.requirementType}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              {REQUIREMENT_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              จำนวน <span className="text-red-500">*</span>
            </label>
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              placeholder="100"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เริ่มแลก <span className="text-red-500">*</span>
              </label>
              <input
                name="startRedeemAt"
                type="datetime-local"
                value={form.startRedeemAt}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                สิ้นสุดแลก <span className="text-red-500">*</span>
              </label>
              <input
                name="endRedeemAt"
                type="datetime-local"
                value={form.endRedeemAt}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังบันทึก..." : "สร้างรางวัล"}
          </button>
        </form>
      </div>
    </div>
  );
}