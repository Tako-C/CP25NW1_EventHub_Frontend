import {
  GripVertical,
  ChevronDown,
  Trash2,
  Plus,
  Type,
  Circle,
  ListChecks,
  Star,
} from "lucide-react";

const questionTypes = [
  { value: "TEXT", label: "ข้อความสั้น", icon: Type },
  { value: "SINGLE", label: "เลือกตอบ (เลือกได้ 1)", icon: Circle },
  { value: "MULTIPLE", label: "เลือกตอบ (เลือกได้หลายข้อ)", icon: ListChecks },
  // { value: "RATING", label: "ให้คะแนน", icon: Star },
];

export default function QuestionEditor({
  questions,
  index,
  onUpdate,
  onDelete,
  surveyType,
}) {
  // 1. ปรับ Logic ล็อค 2 ข้อแรกสำหรับ Post Survey
  // หรือล็อคจากตัวแปร KPI_TYPE โดยตรงเพื่อให้ชัวร์ว่าข้อที่มี KPI จะแก้ไม่ได้
  const isLockedPost = (surveyType === "post" && (index === 0 || index === 1)) || !!questions?.kpiType;

  return (
    <div className={`bg-white rounded-xl border-2 p-6 transition-all ${isLockedPost ? "border-indigo-100 bg-slate-50/50" : "border-gray-200 hover:border-purple-300"}`}>
      <div className="flex items-start gap-4">
        {!isLockedPost && (
          <div className="cursor-move text-gray-400 hover:text-gray-600 pt-2">
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isLockedPost ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"}`}>
              คำถามที่ {index + 1} {isLockedPost && "(ระบบบังคับ)"}
            </span>
            <div className="relative flex-1 max-w-xs">
              <select
                value={questions?.questionType}
                disabled={isLockedPost} // ล็อคประเภทคำถาม
                onChange={(e) => onUpdate(index, "questionType", e.target.value)}
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

          <input
            type="text"
            value={questions?.question}
            readOnly={isLockedPost} // ล็อคห้ามแก้หัวข้อ
            onChange={(e) => onUpdate(index, "question", e.target.value)}
            placeholder={
              index === 0 && surveyType === "post" ? "ความพึงพอใจโดยรวม" : 
              index === 1 && surveyType === "post" ? "ท่านเคยเข้าร่วมงานนี้มาก่อนหรือไม่?" : "พิมพ์คำถามของคุณที่นี่..."
            }
            className={`w-full text-lg font-medium mb-3 px-0 border-0 border-b-2 focus:outline-none transition-colors ${isLockedPost ? "border-transparent text-indigo-900 bg-transparent" : "border-gray-200 focus:border-purple-500"}`}
          />

          {(questions?.questionType === "SINGLE" ||
            questions?.questionType === "MULTIPLE") && (
            <div className="space-y-2 mb-3">
              {questions.choices?.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    readOnly={isLockedPost} // ล็อคห้ามแก้ Choice
                    onChange={(e) => {
                      const newOptions = [...questions.choices];
                      newOptions[optIndex] = e.target.value;
                      onUpdate(index, "choices", newOptions);
                    }}
                    placeholder={`ตัวเลือกที่ ${optIndex + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-white"
                  />
                  {!isLockedPost && (
                    <button
                      onClick={() => {
                        const newOptions = questions.choices.filter(
                          (_, i) => i !== optIndex
                        );
                        onUpdate(index, "choices", newOptions);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {/* ซ่อนปุ่มเพิ่มตัวเลือกถ้าถูกล็อค */}
              {!isLockedPost && questions.choices?.length < 10 && (
                <button
                  onClick={() => {
                    onUpdate(index, "choices", [
                      ...(questions.choices || []),
                      "",
                    ]);
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มตัวเลือก
                </button>
              )}
            </div>
          )}
        </div>

        {!isLockedPost && (
          <button
            onClick={() => onDelete(index)}
            className="text-gray-400 hover:text-red-500 transition-colors pt-2"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}