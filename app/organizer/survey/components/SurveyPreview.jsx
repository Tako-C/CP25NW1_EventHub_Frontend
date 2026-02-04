import { Type, Circle, ListChecks, FileText, Star, Calendar } from "lucide-react";

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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        {/* Event Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-6 h-6" />
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                แบบสำรวจ
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              {surveyTitle || "ชื่อแบบสำรวจ"}
            </h2>
            <p className="text-purple-100 text-lg leading-relaxed">
              {surveyDescription || "คำอธิบายแบบสำรวจจะแสดงที่นี่..."}
            </p>
          </div>
        </div>

        {/* Event Dates Section */}
        {eventDetail && (
          <div className="px-8 py-6 bg-white border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    START DATE
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {formatDate(eventDetail?.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    END DATE
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {formatDate(eventDetail?.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Section */}
        <div className="px-8 py-8">
          <div className="space-y-6">
          {questions.map((q, i) => (
            <div 
              key={i} 
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {q.question || "คำถามใหม่"}
                  </h3>
                  {q.required && (
                    <span className="inline-block mt-1 text-xs text-red-500 font-medium">
                      * จำเป็นต้องตอบ
                    </span>
                  )}
                </div>
                
                {/* Question Type Icon */}
                <div className="flex-shrink-0">
                  {q.questionType === 'text' && (
                    <div className="p-2 bg-blue-50 rounded-lg" title="คำตอบสั้น">
                      <Type className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  {q.questionType === 'multiple_choice' && (
                    <div className="p-2 bg-purple-50 rounded-lg" title="เลือกคำตอบเดียว">
                      <Circle className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  {q.questionType === 'checkbox' && (
                    <div className="p-2 bg-green-50 rounded-lg" title="เลือกได้หลายคำตอบ">
                      <ListChecks className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Answer Area */}
              <div className="mt-4">
                {q.questionType === 'text' && (
                  <div className="relative">
                    <input 
                      disabled 
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-500 focus:border-purple-400 focus:bg-white transition-all" 
                      placeholder="พิมพ์คำตอบของคุณที่นี่..." 
                    />
                  </div>
                )}

                {q.questionType === 'multiple_choice' && (
                  <div className="space-y-2">
                    {q.choices?.map((choice, idx) => (
                      <label 
                        key={idx} 
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer group"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-gray-400 group-hover:border-purple-500 flex-shrink-0 transition-colors" />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                          {choice || `ตัวเลือกที่ ${idx + 1}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {q.questionType === 'checkbox' && (
                  <div className="space-y-2">
                    {q.choices?.map((choice, idx) => (
                      <label 
                        key={idx} 
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer group"
                      >
                        <div className="w-5 h-5 rounded border-2 border-gray-400 group-hover:border-green-500 flex-shrink-0 transition-colors" />
                        <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                          {choice || `ตัวเลือกที่ ${idx + 1}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {questions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">ยังไม่มีคำถาม</p>
              <p className="text-gray-400 text-sm mt-1">เพิ่มคำถามเพื่อดูตัวอย่าง</p>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        {questions.length > 0 && (
          <div className="px-8 pb-8">
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>จำนวนคำถามทั้งหมด: {questions.length} ข้อ</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Preview Mode
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}