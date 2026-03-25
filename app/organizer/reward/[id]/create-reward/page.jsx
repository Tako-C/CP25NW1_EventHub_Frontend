"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createReward } from "@/libs/fetch";
import RewardForm from "@/components/Reward/RewardForm"; // <-- เรียก Component
import Notification from "@/components/Notification/Notification";

export default function CreateRewardPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

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

  const handleSave = async (formData, rawValues) => {
    if (!rawValues.name || !rawValues.quantity || !rawValues.startRedeemAt || !rawValues.endRedeemAt) {
      return showNotification("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", true);
    }

    setLoading(true);
    try {
      const res = await createReward(id, formData);
      if (res?.statusCode === 201 || res?.data) {
        showNotification("สร้างของรางวัลสำเร็จเรียบร้อยแล้ว", false);
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการสร้างของรางวัล", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <Notification
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
        isError={notification.isError}
        message={notification.message}
      />
      <RewardForm
        onFinish={handleSave}
        onCancel={() => router.back()}
        isLoading={loading}
        isEditMode={false}
      />
    </div>
  );
}