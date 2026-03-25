"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getData, updateReward } from "@/libs/fetch";
import RewardForm from "@/components/Reward/RewardForm"; // <-- เรียก Component
import Notification from "@/components/Notification/Notification";

export default function EditRewardPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("rewardId");

  const [initialData, setInitialData] = useState(null);
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

  useEffect(() => {
    const fetchReward = async () => {
      if (!id || !rewardId) return;
      try {
        const res = await getData(`events/${id}/rewards/organizer`);
        const r = res?.data?.find((item) => item.id == rewardId);
        if (r) setInitialData(r);
      } catch (error) {
        showNotification("ไม่สามารถโหลดข้อมูลของรางวัลได้", true);
      } finally {
        setFetching(false);
      }
    };
    fetchReward();
  }, [id, rewardId]);

  const handleUpdate = async (formData, rawValues) => {
    if (!rawValues.name || !rawValues.quantity || !rawValues.startRedeemAt || !rawValues.endRedeemAt) {
      return showNotification("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", true);
    }

    setLoading(true);
    try {
      const res = await updateReward(id, rewardId, formData);
      if (res?.statusCode === 200 || res?.data) {
        showNotification("อัปเดตของรางวัลสำเร็จเรียบร้อยแล้ว", false);
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการอัปเดตของรางวัล", true);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <Notification
        isVisible={notification.isVisible}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
        isError={notification.isError}
        message={notification.message}
      />
      <RewardForm
        initialData={initialData}
        onFinish={handleUpdate}
        onCancel={() => router.back()}
        isLoading={loading}
        isEditMode={true}
      />
    </div>
  );
}