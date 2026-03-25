"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Minus,
  Send,
  Edit3,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Tabs } from "antd";
import {
  createSurvey,
  getDataNoToken,
  createSurveyByAdmin,
} from "@/libs/fetch";

import QuestionEditor from "../../components/QuestionEditor";
import SurveyPreview from "../../components/SurveyPreview";
import Notification from "@/components/Notification/Notification";

const DISABLED_STATUSES = ["ACTIVE", "INACTIVE"];

const STATUS_LABEL = {
  ACTIVE: "กำลังดำเนินการ (Active)",
  INACTIVE: "ยังไม่เริ่ม (Inactive)",
  FINISHED: "สิ้นสุดแล้ว (Finished)",
  DELETED: "ถูกลบแล้ว (Deleted)",
};

export default function CreateAdminSurveyPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const surveyType = searchParams.get("type") || "pre";
  const role = searchParams.get("role") || "visitor";

  const [surveyData, setSurveyData] = useState(() => {
    if (surveyType === "post") {
      return {
        name: "",
        description: "",
        // points: 0,
        questions: [
          {
            question: "ความพึงพอใจโดยรวม",
            questionType: "SINGLE",
            choices: ["1", "2", "3", "4", "5"],
            kpiType: "satisfaction",
            required: true,
          },
          {
            question: "ท่านเคยเข้าร่วมงานนี้มาก่อนหรือไม่?",
            questionType: "SINGLE",
            choices: ["มากกว่า 2 ครั้ง", "1 ครั้ง", "ไม่เคย"],
            kpiType: "returning",
            required: true,
          },
        ],
      };
    }
    return {
      name: "",
      description: "",
      // points: 0,
      questions: [{ question: "", questionType: "TEXT", choices: [] }],
    };
  });
  const [activeTab, setActiveTab] = useState("edit");
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const eventStatus = eventData?.data?.eventStatus ?? null;
  const isCreateDisabled =
    eventLoading ||
    (eventStatus !== null && DISABLED_STATUSES.includes(eventStatus));

  const showNotification = (message, isError = false) => {
    setNotification({ isVisible: true, message, isError });
    setTimeout(() => closeNotification(), 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQuestions = [...surveyData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    if (
      field === "questionType" &&
      (value === "SINGLE" || value === "MULTIPLE")
    ) {
      newQuestions[index].choices = ["", ""];
    }
    setSurveyData({ ...surveyData, questions: newQuestions });
  };

  const handleAddQuestion = () => {
    if (surveyData.questions.length >= 10) return;
    setSurveyData({
      ...surveyData,
      questions: [
        ...surveyData.questions,
        { question: "", questionType: "TEXT", choices: [] },
      ],
    });
  };

  const handleDeleteQuestion = (index) => {
    if (surveyData.questions.length <= 1) {
      showNotification("ต้องมีอย่างน้อย 1 คำถาม", true);
      return;
    }
    const newQuestions = surveyData.questions.filter((_, i) => i !== index);
    setSurveyData({ ...surveyData, questions: newQuestions });
  };

  // const handleIncrementPoints = () => {
  //   const current = parseInt(surveyData.points) || 0;
  //   setSurveyData({ ...surveyData, points: current + 1 });
  // };

  // const handleDecrementPoints = () => {
  //   const current = parseInt(surveyData.points) || 0;
  //   if (current > 0) setSurveyData({ ...surveyData, points: current - 1 });
  // };

  const surveyTypeFunction = () => {
    if (surveyType === "pre" && role === "visitor") return "PRE_VISITOR";
    if (surveyType === "pre" && role === "exhibitor") return "PRE_EXHIBITOR";
    if (surveyType === "post" && role === "visitor") return "POST_VISITOR";
    if (surveyType === "post" && role === "exhibitor") return "POST_EXHIBITOR";
    return null;
  };

  const handleSave = () => {
    if (isCreateDisabled) return;

    if (!surveyData.name.trim())
      return showNotification("กรุณาระบุชื่อแบบสำรวจ", true);
    if (!surveyData.description.trim())
      return showNotification("กรุณากรอกรายละเอียดของแบบสำรวจ", true);

    // const point = parseInt(surveyData.points);
    // if (isNaN(point) || point < 0)
    //   return showNotification(
    //     "คะแนนสะสมต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0",
    //     true,
    //   );

    if (surveyData.questions.length === 0)
      return showNotification("ต้องมีคำถามอย่างน้อย 1 ข้อ", true);
    if (surveyData.questions.length > 10)
      return showNotification("มีคำถามได้ไม่เกิน 10 ข้อ", true);

    if (surveyType === "post") {
      const hasSuggestion = surveyData.questions.some(
        (q) =>
          q.question.includes("ข้อเสนอแนะ") ||
          q.question.toLowerCase().includes("suggestion"),
      );
      if (!hasSuggestion)
        return showNotification(
          "กรุณาเพิ่มคำถามสำหรับ 'ข้อเสนอแนะ' (แบบข้อความสั้น) ก่อนบันทึก",
          true,
        );
    }

    for (let i = 0; i < surveyData.questions.length; i++) {
      const q = surveyData.questions[i];
      const questionNumber = i + 1;
      if (!q.question.trim())
        return showNotification(
          `กรุณาระบุหัวข้อคำถามที่ ${questionNumber}`,
          true,
        );
      if (q.questionType === "SINGLE" || q.questionType === "MULTIPLE") {
        if (!q.choices || q.choices.length < 3)
          return showNotification(
            `คำถามที่ ${questionNumber} ต้องมีอย่างน้อย 3 ตัวเลือก`,
            true,
          );
        if (q.choices.length > 10)
          return showNotification(
            `คำถามที่ ${questionNumber} มีตัวเลือกได้ไม่เกิน 10 ข้อ`,
            true,
          );
        if (q.choices.some((c) => !c.trim()))
          return showNotification(
            `กรุณากรอกข้อความในทุกตัวเลือกของคำถามที่ ${questionNumber}`,
            true,
          );
      }
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    try {
      setLoading(true);

      const eventDetail = {
        name: surveyData.name || "",
        description: surveyData.description || "",
        // points: parseInt(surveyData.points) || 0,
        type: surveyTypeFunction() || "",
      };

      const res = await createSurveyByAdmin(
        eventDetail,
        id,
        surveyData.questions,
      );

      if (res) {
        showNotification(`สร้างแบบสำรวจสำหรับ ${role} สำเร็จแล้ว!`);
        setTimeout(() => router.push(`/admin/survey/${id}`), 2000);
      }
    } catch (error) {
      console.error("Create survey error:", error);
      showNotification(error.message || "ไม่สามารถสร้างแบบสำรวจได้", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setEventLoading(true);
        const res = await getDataNoToken(`/events/${id}`);
        setEventData(res);
      } catch (error) {
        console.error("Failed to fetch event:", error);
        showNotification("ไม่สามารถโหลดข้อมูลกิจกรรมได้", true);
      } finally {
        setEventLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              ยืนยันการสร้างแบบสำรวจ
            </h2>
            <p className="text-sm text-gray-600 text-center mb-2">
              คุณกำลังจะสร้างแบบสำรวจใหม่
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 text-center font-medium">
                ⚠️ เมื่ออีเว้นท์เริ่มต้นแล้ว คุณจะ
                <span className="font-bold underline">ไม่สามารถแก้ไข</span>
                แบบสำรวจนี้ได้อีก
              </p>
              <p className="text-xs text-amber-700 text-center mt-1">
                กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนยืนยัน
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">ชื่อแบบสำรวจ</span>
                <span className="font-semibold text-gray-900 truncate max-w-[60%] text-right">
                  {surveyData.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">จำนวนคำถาม</span>
                <span className="font-semibold text-gray-900">
                  {surveyData.questions.length} ข้อ
                </span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-gray-500">คะแนนที่ได้รับ</span>
                <span className="font-semibold text-purple-600">
                  {surveyData.points || 0} แต้ม
                </span>
              </div> */}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                ยืนยันสร้าง
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 mb-2"
            >
              <ArrowLeft size={18} /> Cancel & Exit
            </button>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              Create New {surveyType}-Survey ({role})
            </h1>
          </div>

          <div className="flex gap-4 items-center">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "edit",
                  label: (
                    <span className="font-bold">
                      <Edit3 size={16} className="inline mr-2" />
                      Editor
                    </span>
                  ),
                },
                {
                  key: "preview",
                  label: (
                    <span className="font-bold">
                      <Eye size={16} className="inline mr-2" />
                      Preview
                    </span>
                  ),
                },
              ]}
              className="mb-0"
            />

            <div className="relative group">
              <button
                onClick={handleSave}
                disabled={isCreateDisabled || loading}
                className={`flex items-center gap-2 px-10 py-3 rounded-2xl font-black shadow-xl transition-all ${
                  isCreateDisabled || loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                }`}
              >
                {isCreateDisabled ? <Lock size={18} /> : <Send size={18} />}
                {loading ? "CREATING..." : "CREATE SURVEY"}
              </button>

              {!eventLoading && isCreateDisabled && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-xs rounded-xl px-3 py-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  <div className="absolute -top-1.5 right-6 w-3 h-3 bg-gray-800 rotate-45" />
                  <p className="font-semibold mb-1">
                    ไม่สามารถสร้างแบบสำรวจได้
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    อีเว้นท์มีสถานะ{" "}
                    <span className="text-yellow-300 font-semibold">
                      {STATUS_LABEL[eventStatus] ?? eventStatus}
                    </span>{" "}
                    — สามารถสร้างได้เฉพาะเมื่ออีเว้นท์ยังไม่ Active หรือ
                    Inactive เท่านั้น
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {!eventLoading && isCreateDisabled && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <Lock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                ไม่สามารถสร้างแบบสำรวจได้ในขณะนี้
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                อีเว้นท์นี้มีสถานะเป็น{" "}
                <span className="font-bold">
                  {STATUS_LABEL[eventStatus] ?? eventStatus}
                </span>{" "}
                — การสร้างหรือแก้ไขแบบสำรวจจะถูกล็อกในระหว่างที่อีเว้นท์ Active
                หรือ Inactive
              </p>
            </div>
          </div>
        )}

        {activeTab === "edit" ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Survey Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    placeholder="เช่น แบบสำรวจความพึงพอใจ..."
                    value={surveyData.name}
                    disabled={isCreateDisabled}
                    onChange={(e) =>
                      setSurveyData({ ...surveyData, name: e.target.value })
                    }
                  />
                </div>

                {/* <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Reward Points
                  </label>
                  <div className="relative flex items-center w-full max-w-[200px] group">
                    <button
                      type="button"
                      onClick={handleDecrementPoints}
                      disabled={isCreateDisabled}
                      className="absolute left-1 z-10 w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-90 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={surveyData.points}
                      disabled={isCreateDisabled}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setSurveyData({ ...surveyData, points: val });
                      }}
                      className="w-full h-12 text-center text-lg font-bold text-purple-700 bg-gray-50 border-2 border-gray-200 rounded-xl px-12 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={handleIncrementPoints}
                      disabled={isCreateDisabled}
                      className="absolute right-1 z-10 w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200 active:scale-90 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    * ระบุแต้มที่ผู้ใช้จะได้รับเมื่อทำแบบสำรวจสำเร็จ
                  </p>
                </div> */}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all min-h-[100px] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  placeholder="ระบุคำอธิบายสั้นๆ สำหรับผู้ทำแบบสำรวจ..."
                  value={surveyData.description}
                  disabled={isCreateDisabled}
                  onChange={(e) =>
                    setSurveyData({
                      ...surveyData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-800">
                Survey Questions ({surveyData.questions.length})
              </h3>
              {surveyData.questions.map((q, idx) => (
                <QuestionEditor
                  key={idx}
                  index={idx}
                  questions={q}
                  // surveyType={surveyType}
                  surveyType={
                    surveyData?.type?.toLowerCase().includes("post")
                      ? "post"
                      : "pre"
                  }
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}

              {surveyData.questions.length < 10 && (
                <button
                  onClick={handleAddQuestion}
                  disabled={isCreateDisabled}
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={24} /> ADD NEW QUESTION
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <SurveyPreview
              surveyTitle={surveyData.name || "ชื่อแบบสำรวจ"}
              surveyDescription={
                surveyData.description || "คำอธิบายจะปรากฏที่นี่..."
              }
              questions={surveyData.questions}
              surveyType={surveyType}
            />
          </div>
        )}
      </div>
    </div>
  );
}
