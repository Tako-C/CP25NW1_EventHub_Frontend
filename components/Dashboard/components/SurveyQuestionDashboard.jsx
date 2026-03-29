"use client";
import { useState, useMemo } from "react";
import { Column } from "@ant-design/plots";
import { Card } from "antd";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const PRE_COLORS = [
  "#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE", "#E0E7FF",
  "#4F46E5", "#7C3AED", "#A78BFA",
];
const POST_VISITOR_COLORS = [
  "#0EA5E9", "#38BDF8", "#7DD3FC", "#BAE6FD", "#0284C7",
  "#0369A1", "#06B6D4", "#22D3EE",
];
const POST_EXHIBITOR_COLORS = [
  "#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#059669",
  "#047857", "#14B8A6", "#2DD4BF",
];

// ─── MOCK DATA (replace with props/fetch as needed) ───────────────────────────
const VISITOR_PRE = [
  {
    surveyType: "PRE_VISITOR",
    questionId: 266,
    question: "ท่านทราบข่าวงานจากช่องทางใด",
    questionType: "MULTIPLE",
    answers: [
      { answer: "Facebook", count: 34 },
      { answer: "Instagram / TikTok", count: 26 },
      { answer: "Website ผู้จัดงาน", count: 19 },
      { answer: "สื่อออนไลน์อื่น ๆ", count: 7 },
      { answer: "เพื่อน/คนรู้จัก", count: 20 },
    ],
  },
  {
    surveyType: "PRE_VISITOR",
    questionId: 267,
    question: "ท่านวางแผนใช้งบประมาณในงานประมาณเท่าไร",
    questionType: "SINGLE",
    answers: [
      { answer: "1,001–2,000 บาท", count: 10 },
      { answer: "500–1,000 บาท", count: 26 },
      { answer: "ต่ำกว่า 500 บาท", count: 11 },
      { answer: "มากกว่า 2,000 บาท", count: 10 },
    ],
  },
  {
    surveyType: "PRE_VISITOR",
    questionId: 268,
    question: "ท่านเคยเข้าร่วมงานประเภทนี้มาก่อนหรือไม่",
    questionType: "SINGLE",
    answers: [
      { answer: "เคย", count: 38 },
      { answer: "ไม่เคย (ครั้งแรก)", count: 20 },
    ],
  },
  {
    surveyType: "PRE_VISITOR",
    questionId: 269,
    question: "ระดับความคาดหวังต่อการจัดงานครั้งนี้",
    questionType: "SINGLE",
    answers: [
      { answer: "ต่ำ", count: 5 },
      { answer: "ปานกลาง", count: 16 },
      { answer: "สูง", count: 24 },
      { answer: "สูงมาก", count: 13 },
    ],
  },
  {
    surveyType: "PRE_VISITOR",
    questionId: 270,
    question: "วัตถุประสงค์หลักในการมางานครั้งนี้คืออะไร",
    questionType: "MULTIPLE",
    answers: [
      { answer: "มาซื้อเสื้อผ้าร้านดัง", count: 37 },
      { answer: "มาดูดีไซด์เสื้อผ้าใหม่ ๆ /ร้านใหม่", count: 25 },
      { answer: "มาถ่ายรูป/ทำคอนเทนต์", count: 18 },
      { answer: "มาเที่ยวกับเพื่อน/ครอบครัว", count: 22 },
    ],
  },
];

const VISITOR_POST = [
  {
    surveyType: "POST_VISITOR",
    questionId: 261,
    question: "โดยรวมแล้วท่านพึงพอใจกับงานครั้งนี้ในระดับใด",
    questionType: "SINGLE",
    answers: [
      { answer: "1", count: 1 },
      { answer: "3", count: 2 },
      { answer: "4", count: 5 },
      { answer: "5", count: 5 },
    ],
  },
  {
    surveyType: "POST_VISITOR",
    questionId: 262,
    question: "สิ่งที่ท่านชื่นชอบในงานครั้งนี้",
    questionType: "SINGLE",
    answers: [
      { answer: "กิจกรรมบนเวที/ดนตรี", count: 4 },
      { answer: "ความสะดวกในการเดินทาง", count: 1 },
      { answer: "ความหลากหลายของร้านเสื้อผ้า", count: 5 },
      { answer: "บรรยากาศและการตกแต่ง", count: 1 },
    ],
  },
  {
    surveyType: "POST_VISITOR",
    questionId: 263,
    question: "ปัญหาที่พบภายในงาน",
    questionType: "MULTIPLE",
    answers: [
      { answer: "คนเยอะ/แออัด", count: 5 },
      { answer: "คิวรอนาน", count: 3 },
      { answer: "ที่นั่งไม่เพียงพอ", count: 6 },
      { answer: "ไม่มีปัญหา", count: 4 },
    ],
  },
  {
    surveyType: "POST_VISITOR",
    questionId: 264,
    question: "ท่านมีแนวโน้มจะกลับมาอีกในปีหน้าหรือไม่",
    questionType: "SINGLE",
    answers: [
      { answer: "มีแนวโน้ม", count: 1 },
      { answer: "สูง", count: 6 },
      { answer: "แน่นอน", count: 4 },
    ],
  },
  {
    surveyType: "POST_VISITOR",
    questionId: 341,
    question: "ท่านเคยมาร่วมกิจกรรมนี้ในปีที่ผ่านมาหรือไม่",
    questionType: "SINGLE",
    answers: [
      { answer: "เคยมา 1 ครั้ง", count: 1 },
      { answer: "เคยมา 2 ครั้งขึ้นไป", count: 5 },
      { answer: "ไม่เคย (ครั้งแรก)", count: 5 },
    ],
  },
];

const EXHIBITOR_POST = [
  {
    surveyType: "POST_EXHIBITOR",
    questionId: 360,
    question: "ท่านเคยมาร่วมกิจกรรมนี้ในปีที่ผ่านมาหรือไม่",
    questionType: "SINGLE",
    answers: [{ answer: "ไม่เคย (ครั้งแรก)", count: 3 }],
  },
  {
    surveyType: "POST_EXHIBITOR",
    questionId: 362,
    question: "โดยรวมแล้วท่านพึงพอใจกับงานครั้งนี้ในระดับใด",
    questionType: "SINGLE",
    answers: [
      { answer: "4", count: 2 },
      { answer: "5", count: 2 },
    ],
  },
  {
    surveyType: "POST_EXHIBITOR",
    questionId: 363,
    question: "ปัญหาที่พบระหว่างการออกบูธ",
    questionType: "MULTIPLE",
    answers: [
      { answer: "คนเยอะ/แออัด", count: 1 },
      { answer: "ไม่มีปัญหา", count: 2 },
    ],
  },
  {
    surveyType: "POST_EXHIBITOR",
    questionId: 364,
    question: "ท่านมีแนวโน้มจะกลับมาอีกในปีหน้าหรือไม่",
    questionType: "SINGLE",
    answers: [{ answer: "แน่นอน", count: 3 }],
  },
  {
    surveyType: "POST_EXHIBITOR",
    questionId: 368,
    question: "ยอดขายเมื่อเทียบกับความคาดหวังของท่าน",
    questionType: "SINGLE",
    answers: [{ answer: "ใกล้เคียงที่คาด", count: 3 }],
  },
  {
    surveyType: "POST_EXHIBITOR",
    questionId: 369,
    question: "ปริมาณผู้เข้าชมงานเป็นไปตามที่ท่านคาดหวังหรือไม่",
    questionType: "SINGLE",
    answers: [{ answer: "มากกว่าที่คาด", count: 3 }],
  },
  {
    surveyType: "POST_EXHIBITOR",
    questionId: 370,
    question: "ปัจจัยที่ทำให้บูธของท่านประสบความสำเร็จ",
    questionType: "MULTIPLE",
    answers: [{ answer: "คุณภาพผู้เข้าชม", count: 3 }],
  },
];

// ─── QUESTION TAB BAR ─────────────────────────────────────────────────────────
function QuestionTabBar({ questions, activeId, onSelect, accentColor, bgActive, borderActive }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      {questions.map((q, i) => {
        const isActive = q.questionId === activeId;
        return (
          <button
            key={q.questionId}
            onClick={() => onSelect(q.questionId)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border
              ${isActive
                ? `text-white shadow-md ${bgActive} ${borderActive}`
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }
            `}
          >
            Q{i + 1}
          </button>
        );
      })}
    </div>
  );
}

// ─── BAR CHART for a question ─────────────────────────────────────────────────
function QuestionBarChart({ question, colors }) {
  if (!question) return null;

  const total = question.answers.reduce((s, a) => s + a.count, 0);
  const chartData = question.answers.map((a) => ({
    answer: a.answer.length > 18 ? a.answer.slice(0, 16) + "…" : a.answer,
    fullAnswer: a.answer,
    count: a.count,
    pct: total > 0 ? ((a.count / total) * 100).toFixed(1) : 0,
  }));

  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div>
      {/* Question text */}
      <div className="mb-4 px-1">
        <p className="text-sm font-semibold text-slate-700 leading-relaxed">
          {question.question}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400">
            {question.questionType === "MULTIPLE" ? "เลือกได้หลายข้อ" : "เลือกคำตอบเดียว"}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-medium text-slate-500">
            ผู้ตอบทั้งหมด {total} ครั้ง
          </span>
        </div>
      </div>

      {/* Bar rows */}
      <div className="space-y-2.5">
        {chartData.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-600 font-medium truncate max-w-[60%]" title={item.fullAnswer}>
                {item.fullAnswer}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{item.count}</span>
                <span className="text-xs text-slate-400">({item.pct}%)</span>
              </div>
            </div>
            <div className="h-7 bg-slate-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                style={{
                  width: `${Math.max((item.count / maxVal) * 100, 4)}%`,
                  backgroundColor: colors[i % colors.length],
                }}
              >
                {(item.count / maxVal) > 0.25 && (
                  <span className="text-xs font-bold text-white">{item.count}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION PANEL ────────────────────────────────────────────────────────────
function SurveySection({ title, questions, colors, bgActive, borderActive, badgeClass }) {
  const [activeId, setActiveId] = useState(questions[0]?.questionId ?? null);
  const activeQ = questions.find((q) => q.questionId === activeId);

  if (!questions.length) return null;

  return (
    <Card
      variant="borderless"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
      styles={{ body: { padding: "20px 20px 24px" } }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {title}
        </span>
        <span className="text-xs text-slate-400">{questions.length} คำถาม</span>
      </div>

      {/* Tab bar */}
      <QuestionTabBar
        questions={questions}
        activeId={activeId}
        onSelect={setActiveId}
        bgActive={bgActive}
        borderActive={borderActive}
      />

      {/* Divider */}
      <div className="border-t border-slate-100 my-4" />

      {/* Chart */}
      <QuestionBarChart question={activeQ} colors={colors} />
    </Card>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// Props: visitorPreData, visitorPostData, exhibitorPostData
// Falls back to built-in mock data if no props provided.
export default function SurveyQuestionDashboard({
  visitorPreData = VISITOR_PRE,
  visitorPostData = VISITOR_POST,
  exhibitorPostData = EXHIBITOR_POST,
}) {
  // Top-level Pre / Post filter
  const [phase, setPhase] = useState("PRE"); // "PRE" | "POST"
  // Post sub-filter
  const [postFilter, setPostFilter] = useState("VISITOR"); // "VISITOR" | "EXHIBITOR"

  return (
    <div className="space-y-5">
      {/* ── Phase filter ── */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          ประเภทแบบสอบถาม
        </span>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { key: "PRE", label: "Pre Survey" },
            { key: "POST", label: "Post Survey" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPhase(key)}
              className={`
                px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                ${phase === key
                  ? "bg-white shadow text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Post sub-filter */}
        {phase === "POST" && (
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl ml-1">
            {[
              { key: "VISITOR", label: "Visitor" },
              { key: "EXHIBITOR", label: "Exhibitor" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPostFilter(key)}
                className={`
                  px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                  ${postFilter === key
                    ? key === "VISITOR"
                      ? "bg-sky-500 text-white shadow"
                      : "bg-emerald-500 text-white shadow"
                    : "text-slate-500 hover:text-slate-700"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {phase === "PRE" && (
        <SurveySection
          title="Pre Survey — Visitor"
          questions={visitorPreData}
          colors={PRE_COLORS}
          bgActive="bg-indigo-500"
          borderActive="border-indigo-500"
          badgeClass="bg-indigo-50 text-indigo-600 border border-indigo-200"
        />
      )}

      {phase === "POST" && postFilter === "VISITOR" && (
        <SurveySection
          title="Post Survey — Visitor"
          questions={visitorPostData}
          colors={POST_VISITOR_COLORS}
          bgActive="bg-sky-500"
          borderActive="border-sky-500"
          badgeClass="bg-sky-50 text-sky-600 border border-sky-200"
        />
      )}

      {phase === "POST" && postFilter === "EXHIBITOR" && (
        <SurveySection
          title="Post Survey — Exhibitor"
          questions={exhibitorPostData}
          colors={POST_EXHIBITOR_COLORS}
          bgActive="bg-emerald-500"
          borderActive="border-emerald-500"
          badgeClass="bg-emerald-50 text-emerald-600 border border-emerald-200"
        />
      )}
    </div>
  );
}