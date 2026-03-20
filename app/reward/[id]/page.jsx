"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Gift,
  Tag,
  Clock,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Notification from "@/components/Notification/Notification";
import { getDataNoToken, getData, redeemReward } from "@/libs/fetch";
import { RewardImage } from "@/utils/getImage";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const REQUIREMENT_CONFIG = {
  NONE: {
    label: "ไม่มีเงื่อนไข",
    description: "ทุกคนสามารถรับรางวัลนี้ได้ทันที ไม่มีข้อกำหนดเพิ่มเติม",
    color: "bg-green-50 border-green-200 text-green-800",
    iconColor: "text-green-500",
    Icon: CheckCircle2,
  },
  PRE_SURVEY_DONE: {
    label: "ต้องทำ Pre-Survey ก่อน",
    description: "คุณต้องกรอกแบบสอบถามก่อนงาน (Pre-Survey) ให้ครบถ้วนเสียก่อน จึงจะสามารถรับรางวัลนี้ได้",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    iconColor: "text-blue-500",
    Icon: AlertCircle,
  },
  POST_SURVEY_DONE: {
    label: "ต้องทำ Post-Survey ก่อน",
    description: "คุณต้องกรอกแบบสอบถามหลังงาน (Post-Survey) ให้ครบถ้วนเสียก่อน จึงจะสามารถรับรางวัลนี้ได้",
    color: "bg-purple-50 border-purple-200 text-purple-800",
    iconColor: "text-purple-500",
    Icon: AlertCircle,
  },
  CHECK_IN: {
    label: "ต้อง Check-in ก่อน",
    description: "คุณต้อง Check-in เข้างานก่อนเท่านั้น จึงจะสามารถรับรางวัลนี้ได้",
    color: "bg-orange-50 border-orange-200 text-orange-800",
    iconColor: "text-orange-500",
    Icon: AlertCircle,
  },
};

function FormatDateTime(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RewardDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [userId, setUserId] = useState(null);
  const [eligible, setEligible] = useState(null) 

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
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await getDataNoToken("events/rewards");
        const all = res?.data || [];
        const found = all.find((r) => r.id == id);
        
        if (found) {
          const resData = await getData(`events/${found?.eventId}/rewards/visitor`);
          const foundEligible = resData?.data.find((r) => r.id == id) || [];
          setReward(found);
          setEligible(foundEligible?.eligible);
        }

        const token = Cookies.get("token");
        if (token) {
          const decoded = jwtDecode(token);
          const uid = decoded.id || decoded.userId || decoded.sub;
          setUserId(uid);

          if (uid) {
            const userRewardsRes = await getData(`events/rewards/${uid}`);
            const userRewards = userRewardsRes?.data || [];
            const userReward = userRewards.find((r) => r.id == id);
            if (userReward !== null && userReward !== undefined) {
              setRedeemed(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching reward:", error);
        showNotification("ไม่สามารถโหลดข้อมูลของรางวัลได้ กรุณาลองใหม่อีกครั้ง", true);
        setReward(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleRedeem = async () => {
    if (!reward || redeemed) return;
    setRedeeming(true);
    try {
      await redeemReward(reward.eventId, userId, reward.id);
      setRedeemed(true);
      showNotification("แลกรับของรางวัลสำเร็จ! 🎉", false);
    } catch (error) {
      // showNotification(error.message || "เกิดข้อผิดพลาดในการแลกรับรางวัล กรุณาลองใหม่อีกครั้ง", true);
      showNotification("เกิดข้อผิดพลาดในการแลกรับรางวัล กรุณาลองใหม่อีกครั้ง", true);
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4">
        <XCircle className="w-16 h-16 text-gray-300" />
        <p className="text-gray-500 text-lg font-medium">ไม่พบข้อมูลของรางวัลนี้</p>
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline font-bold">
          กลับไปหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  const reqConfig = REQUIREMENT_CONFIG[reward.requirementType] || REQUIREMENT_CONFIG.NONE;
  const { Icon } = reqConfig;
  const endDate = new Date(reward.endRedeemAt);
  const startDate = new Date(reward.startRedeemAt);
  const now = new Date();
  const isExpired = endDate < now;
  const isNotStarted = startDate > now;
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  const isOutOfStock = reward.quantity <= 0;
  const isNotEligible = eligible === false; 
  const canRedeem = !isExpired && !isNotStarted && !isOutOfStock && !redeemed && !isNotEligible;

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />

      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">กลับ</span>
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="w-full h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center shadow-sm">
          <RewardImage imagePath={reward.imagePath} rewardName={reward.name} />
        </div>

        <div>
          <p className="text-sm text-amber-600 font-semibold mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {reward.eventName}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{reward.name}</h1>
          <p className="text-gray-500 leading-relaxed text-sm">{reward.description}</p>
        </div>

        {redeemed ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">รับรางวัลแล้ว</p>
              <p className="text-sm text-green-600">คุณได้ทำการแลกรับของรางวัลนี้เรียบร้อยแล้ว</p>
            </div>
          </div>
        ) : isExpired ? (
          <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-2xl p-4">
            <XCircle className="w-6 h-6 text-gray-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-600">หมดระยะเวลาการแลก</p>
              <p className="text-sm text-gray-400">ของรางวัลนี้สิ้นสุดระยะเวลาการแลกรับแล้ว</p>
            </div>
          </div>
        ) : isNotStarted ? (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <Clock className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">ยังไม่เปิดให้แลก</p>
              <p className="text-sm text-yellow-600">จะเปิดให้แลกในวันที่ {FormatDateTime(reward.startRedeemAt)}</p>
            </div>
          </div>
        ) : isOutOfStock ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
            <Package className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">ของรางวัลหมดแล้ว</p>
              <p className="text-sm text-red-500">ขออภัย รางวัลนี้ถูกแลกครบตามจำนวนที่กำหนดแล้ว</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">สามารถแลกรับได้!</p>
              <p className="text-sm text-green-600">
                {daysLeft <= 3
                  ? `⚠️ เหลือเวลาอีกเพียง ${daysLeft} วันเท่านั้น`
                  : `หมดเขตวันที่ ${FormatDateTime(reward.endRedeemAt)}`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5 font-bold">
              <Package className="w-4 h-4" />
              <span className="text-xs uppercase">จำนวนคงเหลือ</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {reward.quantity} <span className="text-sm font-normal text-gray-400">ชิ้น</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5 font-bold">
              <Tag className="w-4 h-4" />
              <span className="text-xs uppercase">เงื่อนไขการรับ</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{reqConfig.label}</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5 font-bold">
              <Calendar className="w-4 h-4" />
              <span className="text-xs uppercase">เริ่มแลกได้เมื่อ</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {startDate.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5 font-bold">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase">หมดเขตวันที่</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {endDate.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <button
          onClick={handleRedeem}
          disabled={!canRedeem || redeeming}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200
            ${redeemed
              ? "bg-green-100 text-green-700 cursor-default"
              : canRedeem
                ? "bg-gray-900 text-white hover:bg-gray-700 active:scale-95 shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed font-black"
            }`}
        >
          {redeeming ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> กำลังดำเนินการ...</>
          ) : redeemed ? (
            <><CheckCircle2 className="w-5 h-5" /> รับรางวัลเรียบร้อยแล้ว</>
          ) : isExpired ? (
            <><XCircle className="w-5 h-5" /> หมดเวลาแลกรับ</>
          ) : isOutOfStock ? (
            <><Package className="w-5 h-5" /> ขออภัย ของรางวัลหมดแล้ว</>
          ) : isNotStarted ? (
            <><Clock className="w-5 h-5" /> ยังไม่ถึงเวลาเปิดรับ</>
          ) : (
            <><Gift className="w-5 h-5" /> ยืนยันรับของรางวัลนี้</>
          )}
        </button>

        {eligible === false && reward.requirementType !== "NONE" && !redeemed && !isExpired && (
          <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-purple-800 text-sm mb-1">
                ยังไม่สามารถแลกรับรางวัลได้
              </p>
              <p className="text-purple-700 text-sm opacity-80">
                {reqConfig.description}
              </p>
              {reward.requirementType === "PRE_SURVEY_DONE" && (
                <button
                  onClick={() => router.push(`/event/${reward.eventId}/survey/pre`)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  ไปทำ Pre-Survey ตอนนี้ →
                </button>
              )}
              {reward.requirementType === "POST_SURVEY_DONE" && (
                <button
                  onClick={() => router.push(`/event/${reward.eventId}/survey/post`)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  ไปทำ Post-Survey ตอนนี้ →
                </button>
              )}
              {reward.requirementType === "CHECK_IN" && (
                <p className="mt-2 text-xs text-purple-500 font-bold">
                  ⚠️ กรุณาทำการ Check-in ที่หน้างานก่อนจึงจะรับรางวัลได้
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}