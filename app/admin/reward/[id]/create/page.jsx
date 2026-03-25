"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createRewardByAdmin } from "@/libs/fetch";
import RewardForm from "@/components/Reward/RewardForm"; // <-- เรียก Component
import Notification from "@/components/Notification/Notification";

export default function CreateAdminRewardPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isErr = false) => {
    setNotification({ isVisible: true, message: msg, isError: isErr });
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
      await createRewardByAdmin(id, formData);
      showNotification("สร้างรางวัลสำเร็จ! ระบบได้เพิ่มรางวัลเข้าสู่กิจกรรมเรียบร้อยแล้ว");
      setTimeout(() => {
        router.push(`/admin/reward/${id}`);
      }, 2000);
    } catch (error) {
      console.error("Create Reward Error:", error);
      showNotification("เกิดข้อผิดพลาดในการสร้างรางวัล", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
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