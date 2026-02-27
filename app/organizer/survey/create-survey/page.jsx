"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Eye, Save, Minus, AlertTriangle, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSurvey, getDataNoToken } from "@/libs/fetch";
import QuestionEditor from "../components/QuestionEditor";
import SurveyPreview from "../components/SurveyPreview";
import Notification from "@/components/Notification/Notification";

// statuses that lock survey creation
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
  const [surveyPoint, setSurveyPoint] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [questions, setQuestions] = useState([
    { questionType: "text", question: "", choices: [] },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  // Fetch event data to get eventStatus
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
  const isCreateDisabled =
    eventLoading || (eventStatus !== null && DISABLED_STATUSES.includes(eventStatus));

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionType: "text", question: "", choices: [] }]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    if (field === "questionType" && (value === "multiple_choice" || value === "checkbox")) {
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

  // Step 1: Validate then show confirmation modal
  const handleSave = () => {
    if (isCreateDisabled) return;

    if (!surveyTitle.trim()) return showNotification("กรุณาระบุชื่อแบบสำรวจ", true);
    if (!surveyDescription.trim()) return showNotification("กรุณากรอกรายละเอียดของอีเว้นท์", true);
    const point = parseInt(surveyPoint);
    if (isNaN(point) || point < 0)
      return showNotification("Survey Points ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0", true);
    if (questions.length === 0) return showNotification("ต้องมีคำถามอย่างน้อย 1 ข้อ", true);
    if (questions.length > 10) return showNotification("มีคำถามได้ไม่เกิน 10 ข้อ", true);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionNumber = i + 1;
      if (!q.question.trim())
        return showNotification(`กรุณาระบุหัวข้อคำถามที่ ${questionNumber}`, true);
      if (q.questionType === "multiple_choice" || q.questionType === "checkbox") {
        if (!q.choices || q.choices.length < 3)
          return showNotification(`คำถามที่ ${questionNumber} ต้องมีอย่างน้อย 3 ตัวเลือก`, true);
        if (q.choices.length > 10)
          return showNotification(`คำถามที่ ${questionNumber} มีตัวเลือกได้ไม่เกิน 10 ข้อ`, true);
        if (q.choices.some((c) => !c.trim()))
          return showNotification(
            `กรุณากรอกข้อความในทุกตัวเลือกของคำถามที่ ${questionNumber}`,
            true,
          );
      }
    }

    setShowConfirmModal(true);
  };

  // Step 2: Actually create the survey after user confirms
  const handleConfirmSave = async () => {
    setShowConfirmModal(false);

    const eventDetail = {
      name: surveyTitle || "",
      description: surveyDescription || "",
      points: parseInt(surveyPoint) || 0,
      type: surveyTypeFunction() || "",
    };

    const formattedQuestions = questions.map((q) => {
      let apiType = "TEXT";
      if (q.questionType === "multiple_choice") apiType = "SINGLE";
      if (q.questionType === "checkbox") apiType = "MULTIPLE";
      return { question: q.question, questionType: apiType, choices: q.choices || [] };
    });

    try {
      const res = await createSurvey(eventDetail, eventId, formattedQuestions);
      if (res.statusCode === 200 || res.statusCode === 201) {
        showNotification(`${res?.message}`, false);
        setTimeout(() => router.back(), 1000);
      }
    } catch (error) {
      showNotification(`${error}`, true);
    }
  };

  const handleIncrementPoints = () => {
    const current = parseInt(surveyPoint) || 0;
    setSurveyPoint((current + 1).toString());
  };

  const handleDecrementPoints = () => {
    const current = parseInt(surveyPoint) || 0;
    if (current > 0) setSurveyPoint((current - 1).toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Notification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        isError={notification.isError}
        message={notification.message}
      />

      {/* Confirmation Modal */}
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
              คุณกำลังจะสร้างแบบสำรวจ
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
                  {surveyTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">จำนวนคำถาม</span>
                <span className="font-semibold text-gray-900">{questions.length} ข้อ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">คะแนนที่ได้รับ</span>
                <span className="font-semibold text-purple-600">{surveyPoint || 0} แต้ม</span>
              </div>
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">สร้างแบบสำรวจ</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold inline-block">
                    {surveyType === "pre" ? "Pre-Event Survey" : "Post-Event Survey"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  showPreview
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Eye className="w-5 h-5" />
                {showPreview ? "แก้ไข" : "ดูตัวอย่าง"}
              </button>

              {/* Save button — disabled when event is ACTIVE or INACTIVE (or still loading) */}
              <div className="relative group">
                <button
                  onClick={handleSave}
                  disabled={isCreateDisabled}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
                    isCreateDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isCreateDisabled ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  บันทึก
                </button>

                {/* Tooltip — only show when we know the status (not loading) */}
                {!eventLoading && isCreateDisabled && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-xs rounded-xl px-3 py-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="absolute -top-1.5 right-6 w-3 h-3 bg-gray-800 rotate-45" />
                    <p className="font-semibold mb-1">ไม่สามารถสร้างแบบสำรวจได้</p>
                    <p className="text-gray-300 leading-relaxed">
                      อีเว้นท์มีสถานะ{" "}
                      <span className="text-yellow-300 font-semibold">
                        {STATUS_LABEL[eventStatus] ?? eventStatus}
                      </span>{" "}
                      — สามารถสร้างได้เฉพาะเมื่ออีเว้นท์ยังไม่ Active หรือ Inactive เท่านั้น
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disabled banner — shown after event data loaded */}
      {!eventLoading && isCreateDisabled && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <Lock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                ไม่สามารถสร้างแบบสำรวจได้ในขณะนี้
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                อีเว้นท์นี้มีสถานะเป็น{" "}
                <span className="font-bold">{STATUS_LABEL[eventStatus] ?? eventStatus}</span>{" "}
                — การสร้างหรือแก้ไขแบบสำรวจจะถูกล็อกในระหว่างที่อีเว้นท์ Active หรือ Inactive
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!showPreview ? (
          <>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลแบบสำรวจ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อแบบสำรวจ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    disabled={isCreateDisabled}
                    placeholder="เช่น แบบสำรวจความคิดเห็นก่อนเข้าร่วมงาน"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    disabled={isCreateDisabled}
                    placeholder="อธิบายวัตถุประสงค์ของแบบสำรวจ"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Survey Points
                  </label>
                  <div className="relative flex items-center w-full max-w-[200px] group">
                    <button
                      type="button"
                      onClick={handleDecrementPoints}
                      disabled={isCreateDisabled}
                      className="absolute left-1 z-10 w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-90 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={surveyPoint}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        setSurveyPoint(val);
                      }}
                      disabled={isCreateDisabled}
                      className="w-full h-12 text-center text-lg font-bold text-purple-700 bg-gray-50 border-2 border-gray-200 rounded-xl px-12 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={handleIncrementPoints}
                      disabled={isCreateDisabled}
                      className="absolute right-1 z-10 w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200 active:scale-90 border border-transparent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    * ระบุแต้มที่ผู้ใช้จะได้รับเมื่อทำแบบสำรวจสำเร็จ
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  questions={question}
                  index={index}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  disabled={isCreateDisabled}
                />
              ))}
            </div>

            {questions?.length < 10 && (
              <button
                onClick={handleAddQuestion}
                disabled={isCreateDisabled}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600 disabled:hover:bg-transparent"
              >
                <Plus className="w-5 h-5" />
                เพิ่มคำถาม
              </button>
            )}
          </>
        ) : (
          <div className="mb-6">
            <div className="bg-purple-100 border border-purple-300 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-purple-700 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-1">ตัวอย่างหน้าแบบสำรวจ</h3>
                  <p className="text-sm text-purple-800">
                    นี่คือสิ่งที่ผู้ใช้จะเห็นเมื่อเข้ามาทำแบบสำรวจ
                  </p>
                </div>
              </div>
            </div>
            <SurveyPreview
              surveyTitle={surveyTitle}
              surveyDescription={surveyDescription}
              questions={questions}
              surveyType={surveyType}
            />
          </div>
        )}
      </div>
    </div>
  );
}