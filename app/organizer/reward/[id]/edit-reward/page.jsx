"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getData, updateReward } from "@/libs/fetch";
import { RewardImage } from "@/utils/getImage";
import Notification from "@/components/Notification/Notification";

const REQUIREMENT_TYPES = [
  { value: "FREE", label: "ไม่มีเงื่อนไข" },
  { value: "PRE_SURVEY_DONE", label: "ทำ Pre-Survey แล้ว" },
  { value: "POST_SURVEY_DONE", label: "ทำ Post-Survey แล้ว" },
  { value: "CHECK_IN", label: "Check-in แล้ว" },
];

function toDatetimeLocal(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 16);
}

export default function EditRewardPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("rewardId");

  const [form, setForm] = useState({
    name: "",
    description: "",
    requirementType: "FREE",
    startRedeemAt: "",
    endRedeemAt: "",
    quantity: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchReward = async () => {
      if (!id || !rewardId) return;
      try {
        const res = await getData(`events/${id}/rewards/organizer`);
        const r = res?.data?.find((item) => item.id == rewardId);
        if (r) {
          setForm({
            name: r.name || "",
            description: r.description || "",
            requirementType: r.requirementType || "FREE",
            startRedeemAt: toDatetimeLocal(r.startRedeemAt),
            endRedeemAt: toDatetimeLocal(r.endRedeemAt),
            quantity: r.quantity?.toString() || "",
          });
          setCurrentImagePath(r.imagePath || null);
        }
      } catch (error) {
        showNotification("ไม่สามารถโหลดข้อมูลของรางวัลได้", true);
      } finally {
        setFetching(false);
      }
    };
    fetchReward();
  }, [id, rewardId]);

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
      showNotification("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", true);
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

      const res = await updateReward(id, rewardId, formData);
      if (res?.statusCode === 200 || res?.data) {
        showNotification("อัปเดตของรางวัลสำเร็จเรียบร้อยแล้ว", false);
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      // showNotification(error?.message || "เกิดข้อผิดพลาดในการอัปเดตของรางวัล", true);
      showNotification("เกิดข้อผิดพลาดในการอัปเดตของรางวัล", true);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 mt-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>กลับ</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-8 uppercase italic tracking-tight">แก้ไขรางวัล</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              รูปภาพรางวัล
            </label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-400 transition-colors bg-white shadow-sm"
              onClick={() => document.getElementById("reward-image-edit").click()}
            >
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ) : currentImagePath ? (
                <div className="relative h-48 group">
                  <RewardImage imagePath={currentImagePath} rewardName={form.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">คลิกเพื่อเปลี่ยนรูป</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                </div>
              )}
            </div>
            <input id="reward-image-edit" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ชื่อรางวัล <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="กรอกชื่อรางวัล..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">คำอธิบาย</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="กรอกรายละเอียดรางวัล..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">เงื่อนไขการรับรางวัล <span className="text-red-500">*</span></label>
            <select
              name="requirementType"
              value={form.requirementType}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white shadow-sm"
            >
              {REQUIREMENT_TYPES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

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
              placeholder="จำนวนของรางวัล..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">เริ่มแลก <span className="text-red-500">*</span></label>
              <input
                name="startRedeemAt"
                type="datetime-local"
                value={form.startRedeemAt}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">สิ้นสุดแลก <span className="text-red-500">*</span></label>
              <input
                name="endRedeemAt"
                type="datetime-local"
                value={form.endRedeemAt}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </form>
      </div>
    </div>
  );
}