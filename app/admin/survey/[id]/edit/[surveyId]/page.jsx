"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Eye, Save, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getData, updateSurveyByAdmin } from "@/libs/fetch";
import QuestionEditor from "@/components/Survey/QuestionEditor";
import SurveyPreview from "@/components/Survey/SurveyPreview";
import Notification from "@/components/Notification/Notification";

export default function EditAdminSurveyPage() {
  const { id: eventId, surveyId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [originalSurveyData, setOriginalSurveyData] = useState(null);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [surveyType, setSurveyType] = useState("");

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, isError, message: msg });
    setTimeout(() => closeNotification(), 3000);
  };

  const closeNotification = () => setNotification((prev) => ({ ...prev, isVisible: false }));

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        // เรียก API ของ Admin
        const resData = await getData(`admin/events/${eventId}/surveys`);
        const formatData = resData?.data.find((item) => item.id == surveyId);
        
        if (formatData) {
          setOriginalSurveyData(formatData);
          setSurveyTitle(formatData.name);
          setSurveyDescription(formatData.description);
          setSurveyType(formatData.type);

          const mappedQuestions = formatData.questions.map((q) => ({
            id: q.id,
            questionType: q.questionType || "TEXT",
            question: q.question,
            choices: q.choices || [],
            kpiType: q.kpiType || null
          }));
          setQuestions(mappedQuestions);
        } else {
          showNotification("ไม่พบข้อมูลแบบสำรวจ", true);
        }
      } catch (error) {
        showNotification("ไม่สามารถโหลดข้อมูลแบบสำรวจได้", true);
      } finally {
        setLoading(false);
      }
    };

    if (eventId && surveyId) fetchSurveyData();
  }, [eventId, surveyId]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionType: "TEXT", question: "", choices: [] }]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };

    if (field === "questionType" && (value === "SINGLE" || value === "MULTIPLE") && newQuestions[index].choices.length === 0) {
      newQuestions[index].choices = ["", ""];
    }
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!surveyTitle.trim()) return showNotification("กรุณาระบุชื่อแบบสำรวจ", true);
    if (!surveyDescription.trim()) return showNotification("กรุณากรอกรายละเอียดของอีเว้นท์", true);
    if (questions.length === 0) return showNotification("ต้องมีคำถามอย่างน้อย 1 ข้อ", true);
    if (questions.length > 10) return showNotification("มีคำถามได้ไม่เกิน 10 ข้อ", true);

    for (let i = 0; i < questions.length; i++) {
      let q = questions[i];
      if (!q.question.trim()) return showNotification(`กรุณาระบุหัวข้อคำถามที่ ${i + 1}`, true);
      if (q.questionType === "SINGLE" || q.questionType === "MULTIPLE") {
        if (!q.choices || q.choices.length < 3) return showNotification(`คำถามที่ ${i + 1} ต้องมีอย่างน้อย 3 ตัวเลือก`, true);
        if (q.choices.length > 10) return showNotification(`คำถามที่ ${i + 1} มีตัวเลือกได้ไม่เกิน 10 ข้อ`, true);
        if (q.choices.some((choice) => !choice.trim())) return showNotification(`กรุณากรอกข้อความในทุกตัวเลือกของคำถามที่ ${i + 1}`, true);
      }
    }

    const payload = {
      ...originalSurveyData,
      name: surveyTitle,
      description: surveyDescription,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType,
        choices: q.choices || []
      }))
    };

    try {
      setSaving(true);
      // เรียก API บันทึกข้อมูลของ Admin
      await updateSurveyByAdmin(eventId, surveyId, payload);
      showNotification("บันทึกการแก้ไขแบบสำรวจสำเร็จ", false);
      setTimeout(() => router.push(`/admin/survey/${eventId}`), 1500);
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการบันทึกข้อมูล", true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Notification isVisible={notification.isVisible} onClose={closeNotification} isError={notification.isError} message={notification.message} />
      
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900"><ArrowLeft className="w-6 h-6" /></button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">แก้ไขแบบสำรวจ (Admin)</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold inline-block">
                    {surveyType?.startsWith("PRE") ? "Pre-Event Survey" : "Post-Event Survey"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setShowPreview(!showPreview)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${showPreview ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                <Eye className="w-5 h-5" /> {showPreview ? "กลับไปแก้ไข" : "ดูตัวอย่าง"}
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!showPreview ? (
          <>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลแบบสำรวจ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อแบบสำรวจ</label>
                  <input type="text" value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                  <textarea value={surveyDescription} onChange={(e) => setSurveyDescription(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  questions={question}
                  index={index}
                  surveyType={surveyType?.startsWith("PRE") ? "pre" : "post"}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>
            {questions?.length < 10 && (
              <button onClick={handleAddQuestion} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all flex items-center justify-center gap-2 font-semibold">
                <Plus className="w-5 h-5" /> เพิ่มคำถามใหม่
              </button>
            )}
          </>
        ) : (
          <SurveyPreview surveyTitle={surveyTitle} surveyDescription={surveyDescription} questions={questions} surveyType={surveyType?.startsWith("PRE") ? "pre" : "post"} />
        )}
      </div>
    </div>
  );
}