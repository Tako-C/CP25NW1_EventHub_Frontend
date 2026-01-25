"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Eye,
  Save,
  Type,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { createSurvey } from "@/libs/fetch";
import QuestionEditor from "../components/QuestionEditor";
import SurveyPreview from "../components/SurveyPreview";

export default function CreateSurveyPage() {
  const searchParams = useSearchParams();
  const surveyType = searchParams.get("type");
  const role = searchParams.get("role");
  const eventId = parseInt(searchParams.get("eventId"));
    const router = useRouter();
  

  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyPoint, setSurveyPoint] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  // const [questions, setQuestions] = useState([
  //   {
  //     type: "text",
  //     text: "",
  //     required: false,
  //     options: [],
  //   },
  // ]);
  const [questions, setQuestions] = useState([
    {
      questionType: "text",
      question: "",
      choices: [],
    },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const handleAddQuestion = () => {
    // setQuestions([
    //   ...questions,
    //   {
    //     type: "text",
    //     text: "",
    //     required: false,
    //     options: [],
    //   },
    // ]);
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
      (value === "multiple_choice" || value === "checkbox")
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

  const surveyTypeFunction = () => {
    if (surveyType === "pre" && role === "visitor") {
      return "PRE_VISITOR";
    }
    if (surveyType === "pre" && role === "exhibitor") {
      return "PRE_EXHIBITOR";
    }
    if (surveyType === "post" && role === "visitor") {
      return "POST_VISITOR";
    }
    if (surveyType === "post" && role === "exhibitor") {
      return "POST_EXHIBITOR";
    }
    return null;
  };

const handleSave = async () => {
  const eventDetail = {
    name: surveyTitle || "",
    description: surveyDescription || "",
    points: parseInt(surveyPoint) || 0,
    type: surveyTypeFunction() || "",
  };

  const formattedQuestions = questions.map((q) => {
    let apiType = "SUGGESTION"; 
    if (q.questionType === "multiple_choice") apiType = "SINGLE";
    if (q.questionType === "checkbox") apiType = "MULTIPLE"; 
    if (q.questionType === "text") apiType = "SUGGESTION";

    return {
      question: q.question,
      questionType: apiType, 
      choices: q.choices || [],
    };
  });

  try {
    const res = await createSurvey(eventDetail, eventId, formattedQuestions);
    if (res.statusCode === 200) {
      // alert("บันทึกแบบสำรวจสำเร็จ!");
      router.push(`${eventId}`)
    }
  } catch (error) {
    console.error("Error:", error);
    // alert(error.message); 
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => console.log("Go back")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  สร้างแบบสำรวจ
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
                {showPreview ? "แก้ไข" : "ดูตัวอย่าง"}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                <Save className="w-5 h-5" />
                บันทึก
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
                    ชื่อแบบสำรวจ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="เช่น แบบสำรวจความคิดเห็นก่อนเข้าร่วมงาน"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="อธิบายวัตถุประสงค์ของแบบสำรวจ"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Survey Points
                  </label>
                  <input
                    type="text"
                    value={surveyPoint}
                    onChange={(e) => setSurveyPoint(e.target.value)}
                    placeholder="กำหนดคะแนนสำหรับให้ผู้ที่ทำแบบสอบถาม"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
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

            <button
              onClick={handleAddQuestion}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              เพิ่มคำถาม
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="bg-purple-100 border border-purple-300 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-purple-700 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1">
                      ตัวอย่างหน้าแบบสำรวจ
                    </h3>
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
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
