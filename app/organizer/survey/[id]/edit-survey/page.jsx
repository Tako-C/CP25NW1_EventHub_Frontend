"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Eye, Save, Type, Loader2, Minus } from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { getDataNoToken, updateSurvey } from "@/libs/fetch";
import QuestionEditor from "../../components/QuestionEditor";
import SurveyPreview from "../../components/SurveyPreview";
import Notification from "@/components/Notification/Notification";

export default function EditSurveyPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyPoint, setSurveyPoint] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [surveyType, setSurveyType] = useState("");
  const [surveyId, setSurveyId] = useState(null);

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
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        const type = searchParams.get("type");
        const role = searchParams.get("role");
        const res = await getDataNoToken(`/events/${id}/surveys/${type}`);
        if (res.statusCode === 200) {
          const data = res.data;
          const surveyData = data?.[role];
          console.log(surveyData)
          setSurveyTitle(surveyData[0]?.name);
          setSurveyDescription(surveyData[0]?.description);
          setSurveyPoint(surveyData[0]?.points.toString());
          setSurveyType(surveyData[0]?.type);
          setSurveyId(surveyData[0]?.id);

          const mappedQuestions = surveyData[0].questions.map((q) => {
            let localType = "text";
            if (q.questionType === "SINGLE") localType = "multiple_choice";
            if (q.questionType === "MULTIPLE") localType = "checkbox";

            return {
              questionType: localType,
              question: q.question,
              choices: q.choices || [],
            };
          });
          setQuestions(mappedQuestions);
        }
      } catch (error) {
        // console.error("Fetch error:", error);
        showNotification(`${error}`, true);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSurveyData();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionType: "text",
        question: "",
        choices: [],
      },
    ]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };

    if (
      field === "questionType" &&
      (value === "multiple_choice" || value === "checkbox") &&
      newQuestions[index].choices.length === 0
    ) {
      newQuestions[index].choices = ["", ""];
    }

    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleUpdate = async () => {
    if (!surveyTitle.trim())
      return showNotification("กรุณาระบุชื่อแบบสำรวจ", true);
    if (!surveyDescription.trim())
      return showNotification("กรุณากรอกรายละเอียดของอีเว้นท์", true);
    const point = parseInt(surveyPoint);
    if (isNaN(point) || point < 0)
      return showNotification(
        "Survey Points ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0",
        true,
      );
    if (questions.length === 0)
      return showNotification("ต้องมีคำถามอย่างน้อย 1 ข้อ", true);
    if (questions.length > 10)
      return showNotification("มีคำถามได้ไม่เกิน 10 ข้อ", true);

    for (let i = 0; i < questions.length; i++) {
      let q = questions[i];
      let questionNumber = i + 1;

      if (!q.question.trim())
        return showNotification(
          `กรุณาระบุหัวข้อคำถามที่ ${questionNumber}`,
          true,
        );

      if (
        q.questionType === "multiple_choice" ||
        q.questionType === "checkbox"
      ) {
        if (!q.choices || q.choices.length < 3) {
          return showNotification(
            `คำถามที่ ${questionNumber} ต้องมีอย่างน้อย 3 ตัวเลือก`,
            true,
          );
        }
        if (q.choices.length > 10) {
          return showNotification(
            `คำถามที่ ${questionNumber} มีตัวเลือกได้ไม่เกิน 10 ข้อ`,
            true,
          );
        }
        const emptyChoice = q.choices.some((choice) => !choice.trim());
        if (emptyChoice) {
          return showNotification(
            `กรุณากรอกข้อความในทุกตัวเลือกของคำถามที่ ${questionNumber}`,
            true,
          );
        }
      }
    }

    const eventDetail = {
      name: surveyTitle || "",
      surveyId: surveyId || null,
      description: surveyDescription || "",
      points: parseInt(surveyPoint) || 0,
      type: surveyType,
    };

    const formattedQuestions = questions.map((q) => {
      let apiType = "TEXT";
      if (q.questionType === "multiple_choice" || q.questionType === "SINGLE")
        apiType = "SINGLE";
      if (q.questionType === "checkbox" || q.questionType === "MULTIPLE")
        apiType = "MULTIPLE";

      const questionObj = {
        question: q.question,
        questionType: apiType,
        choices: q.choices || [],
      };

      if (q.id) {
        questionObj.id = q.id;
      }

      return questionObj;
    });

    try {
      const res = await updateSurvey(id, eventDetail, formattedQuestions);
      if (res.statusCode === 200) {
        showNotification(`${res?.message}`, false);
        setTimeout(() => {
          router.back();
        }, 1000);
      }
    } catch (error) {
      // console.error("Update error:", error);
      showNotification(`${error}`, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const handleIncrementPoints = () => {
    const current = parseInt(surveyPoint) || 0;
    setSurveyPoint((current + 1).toString());
  };

  const handleDecrementPoints = () => {
    const current = parseInt(surveyPoint) || 0;
    if (current > 0) {
      setSurveyPoint((current - 1).toString());
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  แก้ไขแบบสำรวจ
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold inline-block">
                    {surveyType === "pre"
                      ? "Pre-Event Survey"
                      : "Post-Event Survey"}
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
                {showPreview ? "กลับไปแก้ไข" : "ดูตัวอย่าง"}
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                <Save className="w-5 h-5" />
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!showPreview ? (
          <>
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ข้อมูลแบบสำรวจ
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อแบบสำรวจ
                  </label>
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                      className="absolute left-1 z-10 w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-90 border border-transparent"
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
                      className="w-full h-12 text-center text-lg font-bold text-purple-700 bg-gray-50 border-2 border-gray-200 rounded-xl px-12 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-300"
                      placeholder="0"
                    />

                    <button
                      type="button"
                      onClick={handleIncrementPoints}
                      className="absolute right-1 z-10 w-10 h-10 flex items-center justify-center bg-white text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200 active:scale-90 border border-transparent"
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
                />
              ))}
            </div>
            {questions?.length < 10 && (
              <button
                onClick={handleAddQuestion}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                เพิ่มคำถามใหม่
              </button>
            )}
          </>
        ) : (
          <SurveyPreview
            surveyTitle={surveyTitle}
            surveyDescription={surveyDescription}
            questions={questions}
          />
        )}
      </div>
    </div>
  );
}
