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
import { FormatDate } from "@/utils/format";

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
            รางวัลของฉัน
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
                className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
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

                {/* Reward image */}
                <div className="flex-shrink-0 w-full sm:w-28 md:w-32 h-36 sm:h-28 md:h-32 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <RewardImage
                    imagePath={reward.imagePath}
                    rewardName={reward.name}
                  />
                </div>

                {/* Reward info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <p className="text-xs text-amber-600 font-semibold mb-1 flex items-center gap-1 truncate">
                      <Calendar size={11} className="flex-shrink-0" />
                      <span className="truncate">{reward.eventName}</span>
                    </p>

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 min-w-0">
                        {reward.name}
                      </h3>
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}
                      >
                        <StatusIcon size={11} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                      {reward.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${reqConfig.color}`}
                      >
                        <ReqIcon size={11} />
                        {reqConfig.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-full font-medium border border-gray-200">
                        <Package size={11} />
                        เหลือ {reward.quantity} ชิ้น
                      </span>
                      {!isRedeemed && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
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
                              : `หมดเขต ${FormatDate(reward.endRedeemAt, "thaiShort")}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    {isRedeemed ? (
                      <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium border border-green-100">
                        <CheckCircle2 size={14} />
                        รับรางวัลแล้ว
                      </div>
                    ) : canRedeem ? (
                      <button
                        onClick={() => router.push(`/reward/${reward.id}?eventId=${reward.eventId}`)}
                        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                      >
                        <Gift size={14} />
                        รับรางวัล
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg text-sm border border-gray-100">
                        <XCircle size={14} />
                        {reward.quantity <= 0 ? "ของหมดแล้ว" : "หมดเวลาแล้ว"}
                      </div>
                    )}
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