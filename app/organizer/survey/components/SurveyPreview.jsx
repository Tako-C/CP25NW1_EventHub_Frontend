import { Type, Circle, ListChecks } from "lucide-react";

export default function SurveyPreview({ surveyTitle, surveyDescription, questions }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-2xl mx-auto shadow-sm">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">{surveyTitle || "ชื่อแบบสำรวจ"}</h2>
        <p className="text-gray-600 mt-2">{surveyDescription || "คำอธิบาย..."}</p>
      </div>
      <div className="space-y-8">
        {questions.map((q, i) => (
          <div key={i} className="space-y-3">
            <h3 className="text-lg font-semibold">{i + 1}. {q.question || "คำถามใหม่"}</h3>
            
            {q.questionType === 'text' && (
              <input disabled className="w-full p-3 bg-gray-50 border rounded-lg" placeholder="คำตอบของคุณ" />
            )}

            {q.questionType === 'multiple_choice' && (
              <div className="space-y-2">
                {q.choices?.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    <span className="text-gray-700">{choice || `ตัวเลือกที่ ${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            )}

            {q.questionType === 'checkbox' && (
              <div className="space-y-2">
                {q.choices?.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    <div className="w-4 h-4 rounded border-2 border-gray-300" />
                    <span className="text-gray-700">{choice || `ตัวเลือกที่ ${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}