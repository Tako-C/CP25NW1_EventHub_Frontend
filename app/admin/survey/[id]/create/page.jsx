"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Eye, Plus, Send, Edit3 } from "lucide-react";
import { Tabs } from "antd"; 
import { createSurvey, getDataNoToken, createSurveyByAdmin } from "@/libs/fetch";

import QuestionEditor from "../../components/QuestionEditor";
import SurveyPreview from "../../components/SurveyPreview";

import Notification from "@/components/Notification/Notification";

export default function CreateAdminSurveyPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const surveyType = searchParams.get("type") || "pre";
  const role = searchParams.get("role") || "visitor";

  const [surveyData, setSurveyData] = useState({
    name: "",
    description: "",
    points: 0,
    questions: [
      { question: "", questionType: "TEXT", choices: [] },
    ],
  });

  const [activeTab, setActiveTab] = useState("edit");
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState(null);

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

  const handleUpdateQuestion = (index, field, value) => {
    const newQuestions = [...surveyData.questions];
    newQuestions[index][field] = value;
    setSurveyData({ ...surveyData, questions: newQuestions });
  };

  const handleAddQuestion = () => {
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

  const handleSave = async () => {
    if (!surveyData.name) {
      showNotification("กรุณาระบุชื่อแบบสำรวจ", true);
      return;
    }

    try {
      setLoading(true);

      const eventDetail = {
        name: surveyData?.name || "",
        description: surveyData?.description || "",
        points: parseInt(surveyData?.points) || 0,
        type: surveyTypeFunction() || "",
      };

      const res = await createSurveyByAdmin(eventDetail, id, surveyData?.questions);
      
      if (res) {
        showNotification(`สร้างแบบสำรวจสำหรับ ${role} สำเร็จแล้ว!`);
        
        setTimeout(() => {
          router.push(`/admin/survey/${id}`); 
        }, 2000);
      }
    } catch (error) {
      console.error("Create survey error:", error);
      showNotification(error.message || "ไม่สามารถสร้างแบบสำรวจได้", true);
    } finally {
      setLoading(false); 
    }
  };

  const surveyTypeFunction = () => {
    if (surveyType === "pre" && role === "visitor") return "PRE_VISITOR";
    if (surveyType === "pre" && role === "exhibitor") return "PRE_EXHIBITOR";
    if (surveyType === "post" && role === "visitor") return "POST_VISITOR";
    if (surveyType === "post" && role === "exhibitor") return "POST_EXHIBITOR";
    return null;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await getDataNoToken(`/events/${id}`);
        setEventData(res);
      } catch (error) {
        console.error("Failed to fetch event:", error);
        showNotification("ไม่สามารถโหลดข้อมูลกิจกรรมได้", true);
      } finally {
        setLoading(false);
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

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
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
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-indigo-600 text-white px-10 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Send size={18} /> {loading ? "CREATING..." : "CREATE SURVEY"}
            </button>
          </div>
        </div>

        {activeTab === "edit" ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Survey Name
                  </label>
                  <input
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                    placeholder="เช่น แบบสำรวจความพึงพอใจ..."
                    value={surveyData.name}
                    onChange={(e) =>
                      setSurveyData({ ...surveyData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Reward Points
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                    value={surveyData.points}
                    onChange={(e) =>
                      setSurveyData({ ...surveyData, points: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                  placeholder="ระบุคำอธิบายสั้นๆ สำหรับผู้ทำแบบสำรวจ..."
                  value={surveyData.description}
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
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                />
              ))}

              <button
                onClick={handleAddQuestion}
                className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={24} /> ADD NEW QUESTION
              </button>
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