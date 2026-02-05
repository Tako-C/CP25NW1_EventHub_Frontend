import { Type, Circle, ListChecks, FileText, Star, Calendar, MessageSquare } from "lucide-react";

export default function SurveyPreview({ surveyTitle, surveyDescription, questions, eventDetail }) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const RATING_OPTIONS = [
    { value: 1, label: "ควรปรับปรุง", emoji: "😞" },
    { value: 2, label: "พอใช้", emoji: "😐" },
    { value: 3, label: "ปานกลาง", emoji: "😊" },
    { value: 4, label: "ดี", emoji: "😃" },
    { value: 5, label: "ดีเยี่ยม", emoji: "🤩" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-6 h-6" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">แบบสำรวจ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{surveyTitle || "ชื่อแบบสำรวจ"}</h2>
            <p className="text-purple-100 text-lg leading-relaxed">{surveyDescription || "คำอธิบายแบบสำรวจ..."}</p>
          </div>
        </div>

        {eventDetail && (
          <div className="px-8 py-6 bg-white border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase">START DATE</p><p className="font-medium">{formatDate(eventDetail?.startDate)}</p></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>
              <div><p className="text-xs font-bold text-gray-400 uppercase">END DATE</p><p className="font-medium">{formatDate(eventDetail?.endDate)}</p></div>
            </div>
          </div>
        )}

        <div className="px-8 py-8 space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">{i + 1}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{q.question || "คำถามใหม่"}</h3>
                  {q.required && <span className="text-xs text-red-500 font-medium">* จำเป็นต้องตอบ</span>}
                </div>
              </div>

              <div className="mt-4">
                {(q.questionType === 'text' || q.questionType === 'textarea') && (
                  <div className="flex gap-3">
                    {q.questionType === 'textarea' && <MessageSquare className="w-5 h-5 text-gray-300 mt-3" />}
                    {q.questionType === 'textarea' ? (
                      <textarea disabled className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl" rows="3" placeholder="ระบุคำตอบแบบยาว..." />
                    ) : (
                      <input disabled className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl" placeholder="พิมพ์คำตอบสั้นๆ..." />
                    )}
                  </div>
                )}

                {q.questionType === 'rating' && (
                  <div className={`grid gap-4 ${q.maxRating === 10 ? "grid-cols-5 md:grid-cols-10" : "grid-cols-5"}`}>
                    {(q.maxRating === 10 ? Array.from({ length: 10 }, (_, i) => i + 1) : RATING_OPTIONS).map((opt, idx) => (
                      <div key={idx} className="flex flex-col items-center p-3 rounded-2xl border-2 border-gray-100 bg-gray-50/50">
                        <span className="text-2xl mb-1">{opt.emoji || "⭐"}</span>
                        <span className="text-[10px] text-center text-gray-500 font-medium leading-tight">
                          {opt.label || `ระดับ ${opt}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {(q.questionType === 'multiple_choice' || q.questionType === 'checkbox') && (
                  <div className="space-y-2">
                    {q.choices?.map((choice, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <div className={`w-5 h-5 border-2 border-gray-400 ${q.questionType === 'checkbox' ? 'rounded' : 'rounded-full'}`} />
                        <span className="text-gray-700">{choice || `ตัวเลือกที่ ${idx + 1}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {questions.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>ยังไม่มีคำถามที่สร้างไว้</p>
            </div>
          )}
        </div>

        {questions.length > 0 && (
          <div className="px-8 pb-8 border-t border-gray-100 pt-6 flex justify-between items-center text-xs text-gray-400">
            <span>ทั้งหมด {questions.length} ข้อ</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Preview Mode</span>
          </div>
        )}
      </div>
    </div>
  );
}