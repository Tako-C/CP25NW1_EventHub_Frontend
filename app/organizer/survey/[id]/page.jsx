"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ClipboardCheck,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getDataNoToken, deleteSurvey, patchSurvey } from "@/libs/fetch";
import { EventCardImage } from "@/utils/getImage";
import SurveyCard from "@/components/Survey/SurveyCard"; 
import Notification from "@/components/Notification/Notification";

function FormatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EventSurveysDetailPage() {
  const [event, setEvent] = useState(null);
  const [surveys, setSurveys] = useState({
    pre: { visitor: null, exhibitor: null },
    post: { visitor: null, exhibitor: null },
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isError = false) => {
    setNotification({
      isVisible: true,
      isError: isError,
      message: msg,
    });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const fetchEventAndSurveys = async () => {

    try {

      const eventRes = await getDataNoToken(`events/${id}`);

      let preRes = null;

      let postRes = null;

      if (eventRes?.statusCode === 200) setEvent(eventRes.data);



      if (eventRes?.data?.hasPreSurvey) preRes = await getDataNoToken(`events/${id}/surveys/pre`);

      if (eventRes?.data?.hasPostSurvey) postRes = await getDataNoToken(`events/${id}/surveys/post`);



      setSurveys({

        pre: {

          visitor: preRes?.data?.visitor.find((r) => r.status = "ACTIVE") || null,

          exhibitor: preRes?.data?.exhibitor.find((r) => r.status = "ACTIVE") || null,

        },

        post: {

          visitor: postRes?.data?.visitor.find((r) => r.status = "ACTIVE") || null,

          exhibitor: postRes?.data?.exhibitor.find((r) => r.status = "ACTIVE") || null,

        },

      });

    } catch (error) {

      showNotification(`ไม่สามารถโหลดข้อมูลได้: ${error}`, true);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    if (id) fetchEventAndSurveys();
  }, [id]);

  const handleDelete = async (surveyId) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบแบบสำรวจนี้? ข้อมูลจะไม่สามารถกู้คืนได้")) return;
    try {
      const res = await deleteSurvey(id, surveyId);
      if (res.statusCode === 200 || res) {
        showNotification("ลบแบบสำรวจสำเร็จ");
        fetchEventAndSurveys(); 
      }
    } catch (error) {
      showNotification("ไม่สามารถลบแบบสำรวจได้", true);
    }
  };

  const handleToggleStatus = async (surveyId, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await patchSurvey(id, surveyId, newStatus);
      if (res.statusCode === 200 || res) {
        showNotification(`เปลี่ยนสถานะเป็น ${newStatus} สำเร็จ`);
        fetchEventAndSurveys();
      }
    } catch (error) {
      showNotification("ไม่สามารถเปลี่ยนสถานะแบบสำรวจได้", true);
    }
  };

  const isEventStarted = () => {
    if (!event?.eventStatus) return false;
    return ["ACTIVE", "FINISHED", "ONGOING"].includes(event.eventStatus);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/organizer/survey")}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> กลับหน้า My Surveys
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 h-48 md:h-auto rounded-2xl overflow-hidden relative">
            <EventCardImage
              imageCard={event?.images?.imgCard}
              eventName={event?.eventName}
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${event?.eventStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              {event?.eventStatus || "N/A"}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 line-clamp-2">
              {event?.eventName}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 text-gray-600">
                <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Date</p>
                  <p className="font-medium text-gray-800">
                    {FormatDate(event?.startDate)} - {FormatDate(event?.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">Location</p>
                  <p className="font-medium text-gray-800 line-clamp-2">
                    {event?.location || "Online"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Pre-Event Surveys</h2>
          </div>
          {/* ปรับให้เป็น 1 Column เพื่อให้ Visitor ขยายเต็มความกว้าง */}
          <div className="grid grid-cols-1 gap-6">
            <SurveyCard
              survey={surveys.pre.visitor}
              type="pre"
              userType="visitor"
              onCreate={() => router.push(`/organizer/survey/create-survey?type=pre&role=visitor&eventId=${id}`)}
              onEdit={() => router.push(`/organizer/survey/${id}/edit-survey?type=pre&role=visitor`)}
              onView={(sId) => router.push(`/organizer/survey/results/${sId}`)}
              onDelete={(sId) => handleDelete(sId)}
              onToggleStatus={(sId, status) => handleToggleStatus(sId, status)}
              isEditDisabled={isEventStarted()}
            />
            {/* นำการ์ด Exhibitor ออกจากส่วน Pre-Event */}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Post-Event Surveys</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SurveyCard
              survey={surveys.post.visitor}
              type="post"
              userType="visitor"
              onCreate={() => router.push(`/organizer/survey/create-survey?type=post&role=visitor&eventId=${id}`)}
              onEdit={() => router.push(`/organizer/survey/${id}/edit-survey?type=post&role=visitor`)}
              onView={(sId) => router.push(`/organizer/survey/results/${sId}`)}
              onDelete={(sId) => handleDelete(sId)}
              onToggleStatus={(sId, status) => handleToggleStatus(sId, status)}
              isEditDisabled={isEventStarted()}
            />
            <SurveyCard
              survey={surveys.post.exhibitor}
              type="post"
              userType="exhibitor"
              onCreate={() => router.push(`/organizer/survey/create-survey?type=post&role=exhibitor&eventId=${id}`)}
              onEdit={() => router.push(`/organizer/survey/${id}/edit-survey?type=post&role=exhibitor`)}
              onView={(sId) => router.push(`/organizer/survey/results/${sId}`)}
              onDelete={(sId) => handleDelete(sId)}
              onToggleStatus={(sId, status) => handleToggleStatus(sId, status)}
              isEditDisabled={isEventStarted()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}