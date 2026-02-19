"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  ClipboardCheck,
  AlertCircle,
  User,
  Store,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getDataNoToken, deleteSurvey, patchSurvey } from "@/libs/fetch";
import { EventCardImage } from "@/utils/getImage";
import SurveyCard from "../components/SurveyCard";
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
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // const fetchData = async () => {
  //   try {
  //     const eventRes = await getDataNoToken(`/events/${id}`);
  //     let preRes = null;
  //     let postRes = null;

  //     if (eventRes?.statusCode === 200) setEvent(eventRes.data);
  //     if (eventRes?.data?.hasPreSurvey === true) {
  //       preRes = await getDataNoToken(`/events/${id}/surveys/pre`);
  //       console.log(preRes)
  //     }
  //     if (eventRes?.data?.hasPostSurvey === true) {
  //       postRes = await getDataNoToken(`/events/${id}/surveys/post`);
  //     }

  //     setSurveys({
  //       pre: {
  //         visitor: preRes?.data?.visitor?.filter(s => s.status === 'ACTIVE') || null,
  //         exhibitor: preRes?.data?.exhibitor?.filter(s => s.status === 'ACTIVE') || null,
  //       },
  //       post: {
  //         visitor: postRes?.data?.visitor?.filter(s => s.status === 'ACTIVE') || null,
  //         exhibitor: postRes?.data?.exhibitor?.filter(s => s.status === 'ACTIVE') || null,
  //       },
  //     });
  //   } catch (error) {
  //     showNotification(`${error}`, true);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

    const fetchData = async () => {
    try {
      const eventRes = await getDataNoToken(`/events/${id}`);
      console.log(eventRes)
      let preRes = null;
      let postRes = null;

      if (eventRes?.statusCode === 200) setEvent(eventRes.data);
        preRes = await getDataNoToken(`/events/${id}/surveys/pre`);
        postRes = await getDataNoToken(`/events/${id}/surveys/post`);

      setSurveys({
        pre: {
          visitor: preRes?.data?.visitor || null,
          exhibitor: preRes?.data?.exhibitor || null,
        },
        post: {
          visitor: postRes?.data?.visitor || null,
          exhibitor: postRes?.data?.exhibitor || null,
        },
      });
    } catch (error) {
      showNotification(`${error}`, true);
    } finally {
      setLoading(false);
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

  const handleDelete = async (surveyId) => {
    if (
      !confirm(
        "คุณต้องการลบแบบสำรวจนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    ) {
      return;
    }

    try {
      const res = await deleteSurvey(id, surveyId);

      if (res.statusCode === 200) {
        showNotification(`${res?.message}`, false);
        fetchData();
      }
    } catch (error) {
      showNotification(`${error}`, true);
    }
  };

  const isEventStarted = () => {
    if (!event?.startDate) return false;
    return new Date() >= new Date(event.startDate);
  };

  const handleToggleStatus = async (surveyId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await patchSurvey(id, surveyId);
      if (res.statusCode === 200) {
        showNotification(
          `เปลี่ยนสถานะ Survey เป็น ${newStatus} สำเร็จ`,
          false
        );
        fetchData();
      }
    } catch (error) {
      showNotification(`${error}`, true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">กลับไปหน้า My Surveys</span>
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              เกี่ยวกับ Survey แบบต่างๆ
            </h3>
            <p className="text-sm text-blue-800">
              <strong>Pre-Event Survey:</strong> แบบสำรวจก่อนงาน
              เก็บข้อมูลความคาดหวังและข้อมูลพื้นฐาน
              <br />
              <strong>Post-Event Survey:</strong> แบบสำรวจหลังงาน
              ประเมินความพึงพอใจและข้อเสนอแนะ
              <br />
              <strong>Visitor:</strong> สำหรับผู้เข้าชมงาน |{" "}
              <strong>Exhibitor:</strong> สำหรับผู้ออกบูธ
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            Pre-Event Surveys
          </h2>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
          <div className="grid grid-cols-1 gap-6">
            <SurveyCard
              survey={surveys.pre.visitor?.[0]}
              type="pre"
              userType="visitor"
              onCreate={() =>
                router.push(
                  `/organizer/survey/create-survey?type=pre&role=visitor&eventId=${id}`,
                )
              }
              onEdit={() =>
                router.push(
                  `/organizer/survey/${id}/edit-survey?type=pre&role=visitor`,
                )
              }
              onView={(sId) => router.push(`/organizer/survey/results/${sId}`)}
              onDelete={(sId) => handleDelete(sId)}
              onToggleStatus={(sId, status) => handleToggleStatus(sId, status)}
              isEditDisabled={isEventStarted()}
            />
            {/* <SurveyCard
              survey={surveys.pre.exhibitor}
              type="pre"
              userType="exhibitor"
              onCreate={() =>
                router.push(
                  `/organizer/survey/create-survey?type=pre&role=exhibitor&eventId=${id}`,
                )
              }
              onEdit={() =>
                router.push(
                  `/organizer/survey/${id}/edit-survey?type=pre&role=exhibitor`,
                )
              }
              onView={(sId) => router.push(`/organizer/survey/results/${sId}`)}
              onDelete={(sId) => handleDelete(sId)}
            /> */}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-green-600" />
            Post-Event Surveys
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SurveyCard
              survey={surveys.post.visitor?.[0]}
              type="post"
              userType="visitor"
              onCreate={() =>
                router.push(
                  `/organizer/survey/create-survey?type=post&role=visitor&eventId=${id}`,
                )
              }
              onEdit={() =>
                router.push(
                  `/organizer/survey/${id}/edit-survey?type=post&role=visitor`,
                )
              }
              onView={(sId) => router.push(`/organizer/survey/results/${sId}`)}
              onDelete={(sId) => handleDelete(sId)}
              onToggleStatus={(sId, status) => handleToggleStatus(sId, status)}
              isEditDisabled={isEventStarted()}
            />
            <SurveyCard
              survey={surveys.post.exhibitor?.[0]}
              type="post"
              userType="exhibitor"
              onCreate={() =>
                router.push(
                  `/organizer/survey/create-survey?type=post&role=exhibitor&eventId=${id}`,
                )
              }
              onEdit={() =>
                router.push(
                  `/organizer/survey/${id}/edit-survey?type=post&role=exhibitor`,
                )
              }
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