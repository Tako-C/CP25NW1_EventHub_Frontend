import { Type, Circle, ListChecks } from "lucide-react";

export default function SurveyPreview({ title, description, questions }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-2xl mx-auto shadow-sm">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">{title || "ชื่อแบบสำรวจ"}</h2>
        <p className="text-gray-600 mt-2">{description || "คำอธิบาย..."}</p>
      </div>
      <div className="space-y-8">
        {questions.map((q, i) => (
          <div key={i} className="space-y-3">
            <h3 className="text-lg font-semibold">{i + 1}. {q.question || "คำถามใหม่"}</h3>
            {/* Render inputs based on q.questionType (text/radio/checkbox) */}
            {q.questionType === 'text' && <input disabled className="w-full p-3 bg-gray-50 border rounded-lg" placeholder="คำตอบของคุณ" />}
            {/* ... render choices for other types ... */}
          </div>
        ))}
      </div>
    </div>
  );
}