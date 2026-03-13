"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Upload, X, ImageIcon } from "lucide-react";
import { notification, Select, Spin } from "antd";
import { getData, updateReward } from "@/libs/fetch";
import { RewardImage } from "@/utils/getImage";

function toDatetimeLocal(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 16);
}

export default function EditAdminRewardPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("rewardId");
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requirementType: "NONE",
    startRedeemAt: "",
    endRedeemAt: "",
    quantity: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImagePath, setCurrentImagePath] = useState(null);

  // ดึงข้อมูลเดิมมาใส่ใน Form
  useEffect(() => {
    const fetchReward = async () => {
      if (!id || !rewardId) return;
      try {
        const res = await getData(`admin/events/${id}/rewards`);
        const r = res?.data?.find((item) => item.id == rewardId);
        if (r) {
          setFormData({
            name: r.name || "",
            description: r.description || "",
            requirementType: r.requirementType || "NONE",
            startRedeemAt: toDatetimeLocal(r.startRedeemAt),
            endRedeemAt: toDatetimeLocal(r.endRedeemAt),
            quantity: r.quantity?.toString() || "",
          });
          setCurrentImagePath(r.imagePath || null);
        }
      } catch (error) {
        notification.error({ message: "ไม่สามารถดึงข้อมูลได้" });
      }
    };
    fetchReward();
  }, [id, rewardId]);

  // จัดการการเลือกรูปภาพ
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const clearImageSelection = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ส่งข้อมูลไปยัง Server
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("requirementType", formData.requirementType);
      data.append("startRedeemAt", formData.startRedeemAt);
      data.append("endRedeemAt", formData.endRedeemAt);
      data.append("quantity", formData.quantity);
      
      if (imageFile) {
        data.append("image", imageFile);
      }

      await updateReward(id, rewardId, data);
      
      notification.success({ message: "อัปเดตข้อมูลรางวัลสำเร็จ" });
      router.back();
    } catch (error) {
      notification.error({ message: "เกิดข้อผิดพลาดในการอัปเดต" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => router.back()} 
            className="font-bold text-slate-400 hover:text-black flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={18} /> Cancel Edit
          </button>
          <button 
            onClick={handleUpdate} 
            disabled={loading} 
            className="bg-amber-500 text-white px-10 py-3 rounded-2xl font-black shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Spin size="small" /> : <Save size={18} />}
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200">
          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Image Upload Section */}
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
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : currentImagePath ? (
                <div className="w-full h-full relative">
                   <RewardImage imagePath={currentImagePath} rewardName={formData.name} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-xs bg-black/50 px-3 py-1 rounded-full">Change Photo</p>
                   </div>
                </div>
              ) : (
                <div className="text-center text-indigo-400">
                  <Upload size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-black uppercase">Upload Image</p>
                </div>
              )}
            </div>

            {/* Form Fields Section */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reward Name</label>
                  <input 
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirement</label>
                <Select 
                  className="w-full h-14 custom-select" 
                  value={formData.requirementType} 
                  onChange={(v) => setFormData({...formData, requirementType: v})} 
                  options={[
                    { value: "NONE", label: "ไม่มีเงื่อนไข" },
                    { value: "PRE_SURVEY_DONE", label: "ทำ Pre-Survey แล้ว" },
                    { value: "POST_SURVEY_DONE", label: "ทำ Post-Survey แล้ว" },
                    { value: "CHECK_IN", label: "Check-in แล้ว" }
                  ]} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none" 
                    value={formData.startRedeemAt} 
                    onChange={(e) => setFormData({...formData, startRedeemAt: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none" 
                    value={formData.endRedeemAt} 
                    onChange={(e) => setFormData({...formData, endRedeemAt: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none min-h-[100px]" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}