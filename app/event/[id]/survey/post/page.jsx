"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Heart } from "lucide-react";
import { getDataNoToken, postEventRegister } from "@/libs/fetch"; // ปรับตามความเหมาะสมของ API
import { useParams, useRouter } from "next/navigation";
import SuccessPage from "@/components/Notification/Success_Regis_Page";
import Notification from "@/components/Notification/Notification";

const RATING_OPTIONS = [
  { value: 1, label: "ควรปรับปรุง", emoji: "😞" },
  { value: 2, label: "พอใช้", emoji: "😐" },
  { value: 3, label: "ปานกลาง", emoji: "😊" },
  { value: 4, label: "ดี", emoji: "😃" },
  { value: 5, label: "ดีเยี่ยม", emoji: "🤩" },
];

export default function PostSurveyForm() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    satisfaction: null,
    recommend: null,
    feedback: "",
    usefulContent: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const handleSubmit = async () => {
    if (!formData.satisfaction) {
      setNotification({
        isVisible: true,
        isError: true,
        message: "กรุณาเลือกความพึงพอใจก่อนส่งข้อมูล",
      });
      return;
    }

    // จำลองการส่งข้อมูล (ปรับเป็น API จริงของคุณ)
    console.log("Survey Submitted:", formData);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />

      {isSuccess ? (
        <div className="max-w-2xl mx-auto py-20 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-green-600 fill-current" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">ขอบคุณสำหรับความคิดเห็น!</h2>
            <p className="text-gray-600 mb-8">ข้อมูลของคุณจะถูกนำไปพัฒนาการจัดงานในครั้งถัดไปให้ดียิ่งขึ้น</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition-all"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 text-white mb-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">แบบสอบถามหลังจบงาน (Post-Event Survey)</h1>
            <p className="text-blue-100">ความคิดเห็นของคุณมีความสำคัญต่อเราอย่างยิ่ง</p>
          </div>

          <div className="space-y-6">
            {/* 1. Overall Satisfaction */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-xl font-semibold text-gray-800">ความพึงพอใจโดยรวมต่อกิจกรรม</h3>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {RATING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, satisfaction: opt.value })}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                      formData.satisfaction === opt.value 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-100 hover:border-blue-200"
                    }`}
                  >
                    <span className="text-4xl mb-2">{opt.emoji}</span>
                    <span className="text-xs font-medium text-gray-500">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Most Useful Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-xl font-semibold text-gray-800">ส่วนใดของงานที่คุณประทับใจหรือคิดว่ามีประโยชน์ที่สุด?</h3>
              </div>
              <textarea
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-400 outline-none transition-all"
                rows="3"
                placeholder="ระบุสิ่งที่ท่านชอบ..."
                value={formData.usefulContent}
                onChange={(e) => setFormData({ ...formData, usefulContent: e.target.value })}
              />
            </div>

            {/* 3. Feedback / Suggestion */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">3</div>
                <h3 className="text-xl font-semibold text-gray-800">ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุง</h3>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 mt-1">
                  <MessageSquare className="text-gray-400" />
                </div>
                <textarea
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                  rows="4"
                  placeholder="เราควรปรับปรุงเรื่องใดในครั้งต่อไป?"
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-16 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
              >
                <span>ส่งแบบประเมิน</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}