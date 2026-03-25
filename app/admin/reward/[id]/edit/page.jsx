"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { getData, updateRewardByAdmin } from "@/libs/fetch";
import RewardForm from "@/components/Reward/RewardForm"; // <-- เรียก Component
import Notification from "@/components/Notification/Notification";

export default function EditAdminRewardPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("rewardId");
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
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

  useEffect(() => {
    const fetchReward = async () => {
      if (!id || !rewardId) return;
      try {
        const res = await getData(`admin/events/${id}/rewards`);
        const r = res?.data?.find((item) => item.id == rewardId);
        if (r) {
          setInitialData(r);
        }
      } catch (error) {
        showNotification("ไม่สามารถดึงข้อมูลรางวัลได้", true);
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
      await updateRewardByAdmin(id, rewardId, formData);
      showNotification("อัปเดตข้อมูลรางวัลสำเร็จ");
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการอัปเดต", true);
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
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