"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { notification, Select, Spin } from "antd";

// Mock ดึงข้อมูลตาม ID
const mockInitialReward = {
  id: 501,
  name: "เสื้อยืด Loomera Limited",
  description: "เสื้อยืดผ้าพรีเมียมลายพิเศษสำหรับผู้ร่วมงาน",
  requirementType: "PRE_SURVEY_DONE",
  quantity: 50,
  startRedeemAt: "2026-03-10T09:00",
  endRedeemAt: "2026-03-15T18:00",
};

export default function EditAdminRewardPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("rewardId");
  const router = useRouter();
  
  const [formData, setFormData] = useState(mockInitialReward);
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      notification.success({ message: "อัปเดตข้อมูลสำเร็จ" });
      router.push(`/admin/reward/${id}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <button onClick={() => router.back()} className="font-bold text-slate-400 hover:text-black flex items-center gap-1 transition-colors">
            <ArrowLeft size={18} /> Cancel Edit
          </button>
          <button onClick={handleUpdate} disabled={loading} className="bg-amber-500 text-white px-10 py-3 rounded-2xl font-black shadow-lg hover:bg-amber-600 transition-all flex items-center gap-2">
            <Save size={18} /> {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>

        <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200">
          {/* Form โครงสร้างเดียวกับหน้า Create แต่ค่า value มาจาก formData ที่โหลดมา */}
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-64 h-64 bg-white border-2 border-dashed border-indigo-200 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden group">
               <div className="text-center text-indigo-400">
                  <Upload size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-black uppercase">Change Image</p>
                </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reward Name</label>
                  <input className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                  <input type="number" className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirement</label>
                <Select className="w-full h-14" value={formData.requirementType} onChange={(v) => setFormData({...formData, requirementType: v})} options={[
                  { value: "NONE", label: "ไม่มีเงื่อนไข" },
                  { value: "PRE_SURVEY_DONE", label: "ทำ Pre-Survey แล้ว" },
                  { value: "CHECK_IN", label: "Check-in แล้ว" }
                ]} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none min-h-[100px]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}