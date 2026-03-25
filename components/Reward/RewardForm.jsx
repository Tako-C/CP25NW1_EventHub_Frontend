"use client";
import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import { Spin } from "antd";
import { RewardImage } from "@/utils/getImage";

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

export default function RewardForm({
  initialData,
  onFinish,
  onCancel,
  isLoading,
  isEditMode = false,
}) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        requirementType: initialData.requirementType || "FREE",
        startRedeemAt: toDatetimeLocal(initialData.startRedeemAt),
        endRedeemAt: toDatetimeLocal(initialData.endRedeemAt),
        quantity: initialData.quantity?.toString() || "",
      });
      setCurrentImagePath(initialData.imagePath || null);
    }
  }, [initialData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImageSelection = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("requirementType", formData.requirementType);
    data.append("quantity", formData.quantity);
    data.append("startRedeemAt", formData.startRedeemAt);
    data.append("endRedeemAt", formData.endRedeemAt);

    if (imageFile) {
      data.append("image", imageFile);
    }

    onFinish(data, formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <button
          onClick={onCancel}
          className="font-bold text-slate-400 hover:text-black flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={18} /> {isEditMode ? "Cancel Edit" : "Cancel"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Spin size="small" /> : <Save size={18} />}
          {isLoading ? "SAVING..." : isEditMode ? "SAVE CHANGES" : "CREATE REWARD"}
        </button>
      </div>

      <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Image Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full md:w-64 h-64 bg-white border-2 border-dashed border-indigo-200 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={clearImageSelection}
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={16} />
                </button>
              </>
            ) : currentImagePath ? (
              <div className="w-full h-full relative">
                <RewardImage imagePath={currentImagePath} rewardName={formData.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full">
                    Change Photo
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-indigo-400">
                <Upload size={32} className="mx-auto mb-2" />
                <p className="text-xs font-black uppercase">Upload Image</p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Reward Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                  placeholder="ชื่อของรางวัล..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Requirement <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                  value={formData.requirementType}
                  onChange={(e) => setFormData({ ...formData, requirementType: e.target.value })}
                >
                  {REQUIREMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                  value={formData.startRedeemAt}
                  onChange={(e) => setFormData({ ...formData, startRedeemAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                  value={formData.endRedeemAt}
                  onChange={(e) => setFormData({ ...formData, endRedeemAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                placeholder="รายละเอียดของรางวัล..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}