"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Eye, Save, AlertTriangle, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSurvey, getDataNoToken } from "@/libs/fetch";
import QuestionEditor from "@/components/Survey/QuestionEditor"; // <-- เรียกจากส่วนกลาง
import SurveyPreview from "@/components/Survey/SurveyPreview"; // <-- เรียกจากส่วนกลาง
import Notification from "@/components/Notification/Notification";

const DISABLED_STATUSES = ["ACTIVE", "INACTIVE"];

const STATUS_LABEL = {
  ACTIVE: "กำลังดำเนินการ (Active)",
  INACTIVE: "ยังไม่เริ่ม (Inactive)",
  FINISHED: "สิ้นสุดแล้ว (Finished)",
  DELETED: "ถูกลบแล้ว (Deleted)",
};

export default function CreateSurveyPage() {
  const searchParams = useSearchParams();
  const surveyType = searchParams.get("type");
  const role = searchParams.get("role");
  const eventId = parseInt(searchParams.get("eventId"));
  const router = useRouter();

  const [eventData, setEventData] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);

  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");

  const [questions, setQuestions] = useState(() => {
    if (searchParams.get("type") === "post") {
      return [
        {
          questionType: "SINGLE", // ใช้ค่า API ตรงๆ 
          question: "ความพึงพอใจโดยรวม",
          choices: ["1", "2", "3", "4", "5"],
          kpiType: "satisfaction",
        },
        {
          question: "ท่านเคยเข้าร่วมงานนี้มาก่อนหรือไม่?",
          questionType: "SINGLE",
          choices: ["มากกว่า 2 ครั้ง", "1 ครั้ง", "ไม่เคย"],
          kpiType: "returning",
        },
      ];
    }
    return [{ questionType: "TEXT", question: "", choices: [], kpiType: null }];
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setEventLoading(true);
        const res = await getDataNoToken(`/events/${eventId}`);
        setEventData(res);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setEventLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  const eventStatus = eventData?.data?.eventStatus ?? null;
  const isCreateDisabled = eventLoading || (eventStatus !== null && DISABLED_STATUSES.includes(eventStatus));

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => closeNotification(), 3000);
  };

  const closeNotification = () => setNotification((prev) => ({ ...prev, isVisible: false }));

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionType: "TEXT", question: "", choices: [] }]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    if (field === "questionType" && (value === "SINGLE" || value === "MULTIPLE")) {
      newQuestions[index].choices = ["", ""];
    }
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const surveyTypeFunction = () => {
    if (surveyType === "pre" && role === "visitor") return "PRE_VISITOR";
    if (surveyType === "pre" && role === "exhibitor") return "PRE_EXHIBITOR";
    if (surveyType === "post" && role === "visitor") return "POST_VISITOR";
    if (surveyType === "post" && role === "exhibitor") return "POST_EXHIBITOR";
    return null;
  };

  const handleSave = () => {
    if (isCreateDisabled) return;

    if (!surveyTitle.trim()) return showNotification("กรุณาระบุชื่อแบบสำรวจ", true);
    if (!surveyDescription.trim()) return showNotification("กรุณากรอกรายละเอียดของแบบสำรวจ", true);
    if (questions.length === 0) return showNotification("ต้องมีคำถามอย่างน้อย 1 ข้อ", true);
    if (questions.length > 10) return showNotification("มีคำถามได้ไม่เกิน 10 ข้อ", true);

    if (surveyType === "post") {
      const hasSuggestion = questions.some(q => q.question.includes("ข้อเสนอแนะ") || q.question.toLowerCase().includes("suggestion"));
      if (!hasSuggestion) {
        return showNotification("กรุณาเพิ่มคำถามสำหรับ 'ข้อเสนอแนะ' (แบบข้อความสั้น) ก่อนบันทึก", true);
      }
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return showNotification(`กรุณาระบุหัวข้อคำถามที่ ${i + 1}`, true);
      if (q.questionType === "SINGLE" || q.questionType === "MULTIPLE") {
        if (!q.choices || q.choices.length < 3) return showNotification(`คำถามที่ ${i + 1} ต้องมีอย่างน้อย 3 ตัวเลือก`, true);
        if (q.choices.length > 10) return showNotification(`คำถามที่ ${i + 1} มีตัวเลือกได้ไม่เกิน 10 ข้อ`, true);
        if (q.choices.some((c) => !c.trim())) return showNotification(`กรุณากรอกข้อความในทุกตัวเลือกของคำถามที่ ${i + 1}`, true);
      }
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);

    const eventDetail = {
      name: surveyTitle || "",
      description: surveyDescription || "",
      type: surveyTypeFunction() || "",
    };

    // ไม่ต้องแปลงอะไรแล้ว ส่ง q ไปได้เลย!
    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      questionType: q.questionType,
      choices: q.choices || [],
      kpiType: q.kpiType || null,
    }));

    try {
      const res = await createSurvey(eventDetail, eventId, formattedQuestions);
      if (res.statusCode === 200 || res.statusCode === 201) {
        showNotification("สร้างแบบสำรวจสำเร็จเรียบร้อยแล้ว", false);
        setTimeout(() => router.back(), 1500);
      }
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการสร้างแบบสำรวจ", true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification isVisible={notification.isVisible} onClose={closeNotification} isError={notification.isError} message={notification.message} />

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-center w-14 h-14 bg-amber-100 rounded-full mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-amber-500" /></div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">ยืนยันการสร้างแบบสำรวจ</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 text-center font-medium">⚠️ เมื่ออีเว้นท์เริ่มต้นแล้ว คุณจะไม่สามารถแก้ไขแบบสำรวจนี้ได้อีก</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleConfirmSave} className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> ยืนยันสร้าง</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900"><ArrowLeft className="w-6 h-6" /></button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">สร้างแบบสำรวจ</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold inline-block">{surveyType === "pre" ? "Pre-Event Survey" : "Post-Event Survey"}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowPreview(!showPreview)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${showPreview ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                <Eye className="w-5 h-5" /> {showPreview ? "แก้ไข" : "ดูตัวอย่าง"}
              </button>

              <div className="relative group">
                <button onClick={handleSave} disabled={isCreateDisabled} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${isCreateDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}>
                  {isCreateDisabled ? <Lock className="w-5 h-5" /> : <Save className="w-5 h-5" />} บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!showPreview ? (
          <>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลแบบสำรวจ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อแบบสำรวจ <span className="text-red-500">*</span></label>
                  <input type="text" value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} disabled={isCreateDisabled} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                  <textarea value={surveyDescription} onChange={(e) => setSurveyDescription(e.target.value)} disabled={isCreateDisabled} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100" />
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  questions={question}
                  index={index}
                  surveyType={surveyType}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  disabled={isCreateDisabled}
                />
              ))}
            </div>

            {questions?.length < 10 && (
              <button onClick={handleAddQuestion} disabled={isCreateDisabled} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2 font-semibold disabled:opacity-40">
                <Plus className="w-5 h-5" /> เพิ่มคำถาม
              </button>
            )}
          </>
        ) : (
          <SurveyPreview surveyTitle={surveyTitle} surveyDescription={surveyDescription} questions={questions} surveyType={surveyType} />
        )}
      </div>
    </div>
  );
}