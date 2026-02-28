"use client";

import {
  Gift,
  Edit3,
  Trash2,
  Plus,
  Calendar,
  Package,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { EventCardImage, RewardImage } from "@/utils/getImage";

const REQUIREMENT_LABELS = {
  NONE: { label: "ไม่มีเงื่อนไข", color: "bg-gray-100 text-gray-700" },
  PRE_SURVEY_DONE: { label: "ทำ Pre-Survey", color: "bg-blue-100 text-blue-700" },
  POST_SURVEY_DONE: { label: "ทำ Post-Survey", color: "bg-green-100 text-green-700" },
  CHECK_IN: { label: "Check-in แล้ว", color: "bg-purple-100 text-purple-700" },
};

function FormatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RewardCard({ reward, onEdit, onDelete, onToggleStatus, onCreate }) {
  const req = REQUIREMENT_LABELS[reward?.requirementType] || REQUIREMENT_LABELS.NONE;

  if (!reward) {
    return (
      <div
        onClick={onCreate}
        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 min-h-[200px]"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Plus className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">เพิ่มรางวัล</p>
      </div>
    );
  }

  const isActive = reward.status === "ACTIVE";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex">
        {/* Image */}
        <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
          <RewardImage imagePath={reward.imagePath} rewardName={reward.name} />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 line-clamp-1 flex-1">{reward.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{reward.description}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full font-medium ${req.color}`}>
              <Tag className="w-3 h-3 inline mr-1" />
              {req.label}
            </span>
            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
              <Package className="w-3 h-3 inline mr-1" />
              คงเหลือ {reward.quantity}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {FormatDateTime(reward.startRedeemAt)} – {FormatDateTime(reward.endRedeemAt)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2 bg-gray-50">
        {/* <button
          onClick={() => onToggleStatus(reward.id, reward.status)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {isActive ? (
            <ToggleRight className="w-5 h-5 text-green-500" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-gray-400" />
          )}
          {isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
        </button> */}

        <div className="flex-1" />

        <button
          onClick={() => onEdit(reward.id)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          แก้ไข
        </button>
        <button
          onClick={() => onDelete(reward.id)}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          ลบ
        </button>
      </div>
    </div>
  );
}