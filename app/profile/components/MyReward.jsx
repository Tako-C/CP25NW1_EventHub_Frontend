"use client";

import { useState, useMemo } from "react";
import {
  Gift,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Package,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RewardImage } from "@/utils/getImage";

const REQUIREMENT_CONFIG = {
  NONE: {
    label: "ไม่มีเงื่อนไข",
    color: "bg-gray-100 text-gray-600",
    Icon: CheckCircle2,
  },
  PRE_SURVEY_DONE: {
    label: "Pre-Survey",
    color: "bg-blue-100 text-blue-700",
    Icon: AlertCircle,
  },
  POST_SURVEY_DONE: {
    label: "Post-Survey",
    color: "bg-purple-100 text-purple-700",
    Icon: AlertCircle,
  },
  CHECK_IN: {
    label: "Check-in",
    color: "bg-orange-100 text-orange-700",
    Icon: AlertCircle,
  },
};

const REDEEM_STATUS_CONFIG = {
  REDEEMED: {
    label: "รับแล้ว",
    color: "bg-green-100 text-green-700",
    Icon: CheckCircle2,
  },
  PENDING: {
    label: "ยังไม่รับ",
    color: "bg-amber-100 text-amber-700",
    Icon: Clock,
  },
  EXPIRED: {
    label: "หมดเวลา",
    color: "bg-gray-100 text-gray-500",
    Icon: XCircle,
  },
};

export default function MyRewardPage({ rewards = [] }) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const availableStatuses = useMemo(() => {
    const statuses = rewards.map(
      (r) =>
        r.redeemStatus || (r.status === "INACTIVE" ? "EXPIRED" : "PENDING"),
    );
    return ["ALL", ...new Set(statuses)];
  }, [rewards]);

  const filteredRewards = useMemo(() => {
    if (selectedStatus === "ALL") return rewards;
    return rewards.filter((r) => {
      const s =
        r.redeemStatus || (r.status === "INACTIVE" ? "EXPIRED" : "PENDING");
      return s === selectedStatus;
    });
  }, [rewards, selectedStatus]);

  const STATUS_LABELS = {
    ALL: "ทั้งหมด",
    REDEEMED: "รับแล้ว",
    PENDING: "ยังไม่รับ",
    EXPIRED: "หมดเวลา",
  };

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            My Rewards
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            รางวัลที่คุณได้รับจาก Events ที่เข้าร่วม
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-transparent text-gray-700 text-sm font-bold outline-none cursor-pointer"
          >
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-4">
          <Gift className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-gray-500 text-lg font-medium">ไม่พบรางวัล</p>
          <p className="text-gray-400 text-sm">
            ลองเปลี่ยนตัวกรองหรือเข้าร่วม Event เพื่อรับรางวัล
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRewards.map((reward) => {
            const redeemStatus =
              reward.redeemStatus ||
              (reward.status === "INACTIVE" ? "EXPIRED" : "PENDING");
            const reqConfig =
              REQUIREMENT_CONFIG[reward.requirementType] ||
              REQUIREMENT_CONFIG.NONE;
            const statusConfig =
              REDEEM_STATUS_CONFIG[redeemStatus] ||
              REDEEM_STATUS_CONFIG.PENDING;
            const { Icon: ReqIcon } = reqConfig;
            const { Icon: StatusIcon } = statusConfig;

            const endDate = new Date(reward.endRedeemAt);
            const isExpired = endDate < new Date();
            const daysLeft = Math.ceil(
              (endDate - new Date()) / (1000 * 60 * 60 * 24),
            );
            const isRedeemed = redeemStatus === "REDEEMED";
            const canRedeem = !isExpired && !isRedeemed && reward.quantity > 0;

            return (
              <div
                key={reward.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-5 hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                    isRedeemed
                      ? "bg-green-400"
                      : isExpired
                        ? "bg-gray-300"
                        : "bg-amber-400"
                  }`}
                />

                <div className="flex-shrink-0 w-full md:w-36 h-36 md:h-auto bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                  <RewardImage
                    imagePath={reward.imagePath}
                    rewardName={reward.name}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <p className="text-xs text-amber-600 font-semibold mb-1 flex items-center gap-1">
                      <Calendar size={11} />
                      {reward.eventName}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1">
                        {reward.name}
                      </h3>
                      <span
                        className={`self-start flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}
                      >
                        <StatusIcon size={12} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {reward.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${reqConfig.color}`}
                      >
                        <ReqIcon size={11} />
                        {reqConfig.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full font-medium border border-gray-200">
                        <Package size={11} />
                        เหลือ {reward.quantity} ชิ้น
                      </span>
                      {!isRedeemed && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                            isExpired
                              ? "bg-gray-50 text-gray-400 border border-gray-200"
                              : daysLeft <= 3
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-gray-50 text-gray-500 border border-gray-200"
                          }`}
                        >
                          <Clock size={11} />
                          {isExpired
                            ? "หมดเวลาแล้ว"
                            : daysLeft <= 3
                              ? `เหลือ ${daysLeft} วัน!`
                              : `หมดเขต ${endDate.toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* <div className="mt-4">
                    {isRedeemed ? (
                      <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium border border-green-100">
                        <CheckCircle2 size={16} />
                        รับรางวัลแล้ว
                      </div>
                    ) : canRedeem ? (
                      <button
                        onClick={() => router.push(`/reward/${reward.id}?eventId=${reward.eventId}`)}
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95"
                      >
                        <Gift size={16} />
                        รับรางวัล
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-gray-400 bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100">
                        <XCircle size={16} />
                        {reward.quantity <= 0 ? "ของหมดแล้ว" : "หมดเวลาแล้ว"}
                      </div>
                    )}
                  </div> */}

                  <div className="mt-4">
                    <button
                      onClick={() =>
                        router.push(
                          `/reward/${reward.id}?eventId=${reward.eventId}`,
                        )
                      }
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95"
                    >
                      <Gift size={16} />
                      รายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
