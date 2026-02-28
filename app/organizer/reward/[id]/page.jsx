"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Gift,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getDataNoToken, getData, deleteReward, patchRewardStatus } from "@/libs/fetch";
import { EventCardImage } from "@/utils/getImage";
import RewardCard from "../components/RewardCard";
import Notification from "@/components/Notification/Notification";

function FormatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EventRewardsDetailPage() {
  const [event, setEvent] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

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
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventRes, rewardsRes] = await Promise.all([
        getDataNoToken(`events/${id}`),
        getData(`events/${id}/rewards/organizer`),
      ]);
      console.log(eventRes)
      console.log(rewardsRes)

      if (eventRes?.statusCode === 200) setEvent(eventRes.data);
      setRewards(rewardsRes?.data || []);
    } catch (error) {
      showNotification(`${error}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rewardId) => {
    if (!confirm("คุณต้องการลบรางวัลนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    try {
      const res = await deleteReward(id, rewardId);
      if (res === true || res?.statusCode === 200) {
        showNotification("ลบรางวัลสำเร็จ", false);
        fetchData();
      }
    } catch (error) {
      showNotification(`${error}`, true);
    }
  };

  const handleToggleStatus = async (rewardId, currentStatus) => {
    try {
      const res = await patchRewardStatus(id, rewardId);
      if (res === true || res?.statusCode === 200) {
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        showNotification(`เปลี่ยนสถานะรางวัลเป็น ${newStatus} สำเร็จ`, false);
        fetchData();
      }
    } catch (error) {
      showNotification(`${error}`, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">กลับไปหน้า My Rewards</span>
          </button>

          {event && (
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                <EventCardImage
                  imageCard={event?.images?.imgCard}
                  eventName={event.eventName}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {event.eventName}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{FormatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">เกี่ยวกับ Reward</h3>
            <p className="text-sm text-amber-800">
              รางวัลจะมอบให้ผู้เข้าร่วมงานที่ปฏิบัติตามเงื่อนไขที่กำหนด เช่น ทำ Pre-Survey หรือ Check-in
              ก่อนเวลา Redeem จะสิ้นสุด
            </p>
          </div>
        </div>

        {/* Rewards Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-500" />
            รางวัลทั้งหมด ({rewards.length})
          </h2>
          <button
            onClick={() => router.push(`/organizer/reward/${id}/create-reward`)}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรางวัล
          </button>
        </div>

        {/* Rewards Grid */}
        {rewards.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
              <Gift className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีรางวัล</h3>
            <p className="text-gray-500 mb-6">เพิ่มรางวัลแรกให้กับ Event นี้</p>
            <button
              onClick={() => router.push(`/organizer/reward/${id}/create-reward`)}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              เพิ่มรางวัล
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
  onEdit={(rid) => router.push(`/organizer/reward/${id}/edit-reward?rewardId=${rid}`)}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}