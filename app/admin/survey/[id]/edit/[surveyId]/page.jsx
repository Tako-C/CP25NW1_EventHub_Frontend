"use client"
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Plus, Edit3 } from "lucide-react";
import { Tabs, Modal } from "antd";
import { useParams, useRouter } from "next/navigation";
import { getData, updateSurveyByAdmin } from "@/libs/fetch"; 
import QuestionEditor from "../../../components/QuestionEditor";
import SurveyPreview from "../../../components/SurveyPreview";

import Notification from "@/components/Notification/Notification";

export default function EditAdminSurveyPage() {
  const { id: eventId, surveyId } = useParams();
  const router = useRouter();
  const [surveyData, setSurveyData] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (message, isError = false) => {
    setNotification({
      isVisible: true,
      message: message,
      isError: isError,
    });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const resData = await getData(`admin/events/${eventId}/surveys`);
        const formatData = resData?.data.find((item) => item.id == surveyId);
        setSurveyData(formatData);
      } catch (error) {
        showNotification("ไม่สามารถโหลดข้อมูลแบบสำรวจได้", true);
      }
    };
    if (eventId) fetchSurveyData();
  }, [eventId, surveyId]);

  const handleUpdateQuestion = (index, field, value) => {
    const updatedQuestions = [...surveyData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setSurveyData({ ...surveyData, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (index) => {
    if (surveyData.questions.length <= 1) {
      showNotification("ต้องมีอย่างน้อย 1 คำถาม", true);
      return;
    }
    const updatedQuestions = surveyData.questions.filter((_, i) => i !== index);
    setSurveyData({ ...surveyData, questions: updatedQuestions });
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: "คำถามใหม่",
      questionType: "SINGLE",
      choices: ["ตัวเลือกที่ 1"],
    };
    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, newQuestion],
    });
  };

  const handleSave = async () => {
    if (!surveyData.name) {
      showNotification("กรุณาระบุชื่อแบบสำรวจ", true);
      return;
    }

    try {
      setLoading(true);
      await updateSurveyByAdmin(eventId, surveyId, surveyData);
      
      showNotification("บันทึกการเปลี่ยนแปลงสำเร็จ ข้อมูลแบบสำรวจถูกอัปเดตแล้ว");
      
      setTimeout(() => {
        router.back(); 
      }, 2000);
    } catch (error) {
      // showNotification(error.message || "เกิดข้อผิดพลาดในการบันทึก", true);
      showNotification("เกิดข้อผิดพลาดในการบันทึก", true);
    } finally {
      setLoading(false);
    }
  };

  if (!surveyData) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => router.back()}
            className="font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={18} /> Cancel Changes
          </button>

          <div className="flex gap-4 items-center">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: "edit", label: <span className="font-bold"><Edit3 size={16} className="inline mr-2" />Editor</span> },
                { key: "preview", label: <span className="font-bold"><Eye size={16} className="inline mr-2" />Preview</span> },
              ]}
              className="mb-0 custom-tabs"
            />
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:bg-slate-300"
            >
              <Save size={18} /> {loading ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </div>

        {activeTab === "edit" ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Survey Name</label>
                  <input
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                    value={surveyData?.name}
                    onChange={(e) => setSurveyData({ ...surveyData, name: e.target.value })}
                  />
                </div>
                {/* <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Reward Points</label>
                  <input
                    type="number"
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                    value={surveyData?.points}
                    onChange={(e) => setSurveyData({ ...surveyData, points: e.target.value })}
                  />
                </div> */}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Description</label>
                <textarea
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                  value={surveyData?.description}
                  onChange={(e) => setSurveyData({ ...surveyData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-800">
                Questions ({surveyData?.questions?.length || 0})
              </h3>
              {surveyData?.questions?.map((q, idx) => (
                <QuestionEditor
                  key={idx}
                  index={idx}
                  questions={q}
                  onUpdate={handleUpdateQuestion} 
                  onDelete={handleDeleteQuestion} 
                />
              ))}
              <button 
                onClick={handleAddQuestion}
                className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add New Question
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <SurveyPreview
              surveyTitle={surveyData?.name}
              surveyDescription={surveyData?.description}
              questions={surveyData?.questions}
              surveyType={surveyData?.type?.startsWith("PRE") ? "pre" : "post"}
            />
          </div>
        )}
      </div>
    </div>
  );
}