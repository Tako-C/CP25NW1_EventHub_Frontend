import { Calendar, FileText, CheckSquare, Shield, ScrollText, Eye } from "lucide-react";

// เพิ่ม Props surveyType เข้ามา (รับค่า 'pre' หรือ 'post')
export default function SurveyPreview({ surveyTitle, surveyDescription, questions, eventDetail, surveyType = 'pre' }) {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const mockInputs = [
    { title: "First Name / ชื่อ", required: true, type: "text" },
    { title: "Last Name / นามสกุล", required: true, type: "text" },
    { title: "Email / อีเมล", required: true, type: "email" },
  ];

  // เช็คว่าเป็นแบบสำรวจก่อนเริ่มงานใช่หรือไม่
  const isPreSurvey = surveyType === 'pre';
  
  // ลำดับข้อของคำถาม ถ้าเป็น pre เริ่มที่ 4 (เพราะ 1-3 เป็นชื่ออีเมล) ถ้าเป็น post เริ่มที่ 1
  const questionStartIndex = isPreSurvey ? 4 : 1;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-6 h-6" />
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm uppercase">
                  {surveyType} Survey Preview
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {surveyTitle || "ชื่อแบบสำรวจ"}
              </h1>
              <p className="text-purple-100 text-lg leading-relaxed max-w-2xl">
                {surveyDescription || "คำอธิบาย..."}
              </p>
            </div>
          </div>

          <div className="px-8 py-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Start Date
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
                    End Date
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {formatDate(eventDetail?.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* ข้อมูลพื้นฐาน 1-3 (แสดงเฉพาะ pre survey) */}
          {isPreSurvey && mockInputs.map((item, index) => (
            <div key={`mock-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {item.title}
                  </h3>
                  {item.required && (
                    <span className="inline-block mt-1 text-xs text-red-500 font-medium">
                      * จำเป็นต้องตอบ
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <input
                  type={item.type}
                  disabled
                  placeholder="พิมพ์คำตอบของคุณที่นี่..."
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-400 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          ))}

          {/* คำถามแบบสำรวจ */}
          {questions?.map((q, index) => (
            <div key={`q-${index}`} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {/* ลำดับข้อเปลี่ยนไปตามประเภท pre (เริ่ม 4) หรือ post (เริ่ม 1) */}
                  {index + questionStartIndex}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {q.question || "ไม่มีคำถาม"}
                  </h3>
                  {q.required && (
                    <span className="block mt-1 text-xs text-red-500 font-medium">
                      * จำเป็นต้องตอบ
                    </span>
                  )}
                  {(q.questionType === 'multiple_choice' || q.questionType === 'checkbox' || q.questionType === 'MULTIPLE') && (
                    <span className="block mt-1 text-xs text-blue-600 font-medium italic">
                      * เลือกได้หลายคำตอบ
                    </span>
                  )}
                </div>
                {(q.questionType === 'multiple_choice' || q.questionType === 'checkbox' || q.questionType === 'SINGLE' || q.questionType === 'MULTIPLE') && (
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckSquare className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {(q.questionType === 'text' || q.questionType === 'textarea' || q.questionType === 'TEXT') && (
                  <input
                    type="text"
                    disabled
                    placeholder="พิมพ์คำตอบของคุณที่นี่..."
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-400 outline-none cursor-not-allowed"
                  />
                )}

                {(q.questionType === 'multiple_choice' || q.questionType === 'checkbox' || q.questionType === 'SINGLE' || q.questionType === 'MULTIPLE') && (
                  q.choices?.map((choice, cIdx) => (
                    <label key={cIdx} className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-80 cursor-not-allowed">
                      <input
                        type={q.questionType === 'checkbox' || q.questionType === 'MULTIPLE' ? "checkbox" : "radio"}
                        disabled
                        className="w-5 h-5 rounded border-2 border-gray-400 flex-shrink-0"
                      />
                      <span className="text-gray-700">
                        {choice || `ตัวเลือกที่ ${cIdx + 1}`}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          ))}

          {/* เงื่อนไข Terms & Conditions (แสดงเฉพาะ pre survey) */}
          {isPreSurvey && (
            <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">ข้อกำหนดและเงื่อนไข</h3>
                <span className="text-xs text-red-500 font-medium">* จำเป็น</span>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <ScrollText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      นโยบายความเป็นส่วนตัวและการใช้ข้อมูล
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      ข้อมูลส่วนบุคคลของท่านจะถูกรวบรวมและใช้เพื่อวัตถุประสงค์ในการลงทะเบียน...
                    </p>
                  </div>
                  <button disabled className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg shrink-0 border border-purple-200 cursor-not-allowed opacity-70">
                    <Eye className="w-3.5 h-3.5" />
                    อ่านทั้งหมด
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-not-allowed opacity-70">
                <input type="checkbox" disabled className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 leading-relaxed">
                  ฉันได้อ่านและยอมรับข้อกำหนดและเงื่อนไข รวมถึงยินยอมให้ข้อมูลส่วนบุคคลของฉันถูกนำไปใช้ตามที่ระบุไว้
                </span>
              </label>
            </div>
          )}

          {/* ปุ่ม Submit */}
          <div className="flex justify-center pt-4 pb-8">
            <button disabled className="w-full md:w-auto bg-gray-300 text-white font-semibold py-4 px-12 md:px-24 rounded-full shadow-lg text-lg cursor-not-allowed">
              Submit
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}