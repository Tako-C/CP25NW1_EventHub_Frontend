"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  Type,
  ListChecks,
  Circle,
  Star,
  MessageSquare,
  Calendar,
  Hash,
  Mail,
  Phone,
  ChevronDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

// Question Types
// const questionTypes = [
//   { value: 'text', label: 'ข้อความสั้น', icon: Type },
//   { value: 'textarea', label: 'ข้อความยาว', icon: MessageSquare },
//   { value: 'multiple_choice', label: 'เลือกตอบ (เลือกได้ 1)', icon: Circle },
//   { value: 'checkbox', label: 'เลือกตอบ (เลือกได้หลายข้อ)', icon: ListChecks },
//   { value: 'rating', label: 'ให้คะแนน', icon: Star },
//   { value: 'number', label: 'ตัวเลข', icon: Hash },
//   { value: 'email', label: 'อีเมล', icon: Mail },
//   { value: 'phone', label: 'เบอร์โทรศัพท์', icon: Phone },
//   { value: 'date', label: 'วันที่', icon: Calendar }
// ];

const questionTypes = [
  { value: "text", label: "ข้อความสั้น", icon: Type },
  { value: "multiple_choice", label: "เลือกตอบ (เลือกได้ 1)", icon: Circle },
  { value: "checkbox", label: "เลือกตอบ (เลือกได้หลายข้อ)", icon: ListChecks },
];

// Question Editor Component
function QuestionEditor({ questions, index, onUpdate, onDelete }) {
  const QuestionIcon =
    questionTypes.find((t) => t.value === questions?.questionType)?.icon || Type;
    console.log(questions)

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 transition-all">
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div className="cursor-move text-gray-400 hover:text-gray-600 pt-2">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Question Number & Type */}
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              คำถามที่ {index + 1}
            </span>
            <div className="relative flex-1 max-w-xs">
              <select
                value={questions?.questionType}
                onChange={(e) => onUpdate(index, "questionType", e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Question Text */}
          <input
            type="text"
            value={questions?.question}
            onChange={(e) => onUpdate(index, "question", e.target.value)}
            placeholder="พิมพ์คำถามของคุณที่นี่..."
            className="w-full text-lg font-medium mb-3 px-0 border-0 border-b-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
          />

          {/* Options for Multiple Choice / Checkbox */}
          {(questions?.questionType === "multiple_choice" ||
            questions?.questionType === "checkbox") && (
            <div className="space-y-2 mb-3">
              {questions.choices?.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...questions.choices];
                      newOptions[optIndex] = e.target.value;
                      // onUpdate(index, "options", newOptions);
                      onUpdate(index, "choices", newOptions);
                    }}
                    placeholder={`ตัวเลือกที่ ${optIndex + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => {
                      const newOptions = questions.choices.filter(
                        (_, i) => i !== optIndex,
                      );
                      // onUpdate(index, "options", newOptions);
                      onUpdate(index, "choices", newOptions);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  // onUpdate(index, "options", [...(question.choices || []), ""]);
                  onUpdate(index, "choices", [...(questions.choices || []), ""]);
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                เพิ่มตัวเลือก
              </button>
            </div>
          )}

          {/* Rating Scale */}
          {questions?.questionType === "rating" && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">ระดับคะแนน:</span>
              <select
                value={questions.maxRating || 5}
                onChange={(e) =>
                  onUpdate(index, "maxRating", parseInt(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="5">1-5</option>
                <option value="10">1-10</option>
              </select>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${index}`}
              checked={questions?.required}
              onChange={(e) => onUpdate(index, "required", e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label
              htmlFor={`required-${index}`}
              className="text-sm text-gray-600"
            >
              คำถามบังคับ
            </label>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(index)}
          className="text-gray-400 hover:text-red-500 transition-colors pt-2"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Live Preview Component
function SurveyPreview({ surveyTitle, surveyDescription, questions }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {surveyTitle || "ชื่อแบบสำรวจ"}
        </h2>
        <p className="text-gray-600">
          {surveyDescription || "คำอธิบายแบบสำรวจ"}
        </p>
      </div>

      <div className="space-y-8">
        {questions.map((question, index) => {
          const QuestionIcon =
            questionTypes.find((t) => t.value === question.questionType)?.icon || Type;

          return (
            <div
              key={index}
              className="border-b border-gray-200 pb-6 last:border-0"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-purple-100 rounded-lg p-2">
                  <QuestionIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {question.text || `คำถามที่ ${index + 1}`}
                    {question?.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                </div>
              </div>

              {/* Render different input types */}
              <div className="ml-14">
                {question.questionType === "text" && (
                  <input
                    type="text"
                    placeholder="คำตอบของคุณ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                )}

                {question.questionType === "textarea" && (
                  <textarea
                    placeholder="คำตอบของคุณ"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                )}

                {question.questionType === "multiple_choice" && (
                  <div className="space-y-2">
                    {question.choices?.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`q${index}`}
                          className="text-purple-600"
                          disabled
                        />
                        <span className="text-gray-700">
                          {option || `ตัวเลือกที่ ${optIndex + 1}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {question.questionType === "checkbox" && (
                  <div className="space-y-2">
                    {question.choices?.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-purple-600"
                          disabled
                        />
                        <span className="text-gray-700">
                          {option || `ตัวเลือกที่ ${optIndex + 1}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {question.questionType === "rating" && (
                  <div className="flex gap-2">
                    {[...Array(question.maxRating || 5)].map((_, i) => (
                      <button
                        key={i}
                        className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors font-semibold"
                        disabled
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                {question.questionType === "number" && (
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                )}

                {question.questionType === "email" && (
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                )}

                {question.questionType === "phone" && (
                  <input
                    type="tel"
                    placeholder="0812345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                )}

                {question.questionType === "date" && (
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button className="w-full mt-8 bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
        ส่งคำตอบ
      </button>
    </div>
  );
}

// Main Component
export default function CreateSurveyPage() {
  const searchParams = useSearchParams();
  const surveyType = searchParams.get("type");
  const role = searchParams.get("role");
  const eventId = parseInt(searchParams.get("eventId"));

  // const [surveyType, setSurveyType] = useState("pre");
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
    console.log(field)
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };

    // Initialize options for multiple choice/checkbox
    if (
      field === "type" &&
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

  const handleSave = () => {
    console.log("Save survey:", {
      type: surveyType,
      role: role,
      type1: surveyTypeFunction(),
      title: surveyTitle,
      description: surveyDescription,
      points: parseInt(surveyPoint) || 0,
      eventId,
      questions,
    });
    alert("บันทึกแบบสำรวจเรียบร้อย!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!showPreview ? (
          <>
            {/* Survey Info */}
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

            {/* Questions */}
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

            {/* Add Question Button */}
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
            {/* Preview Section */}
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
