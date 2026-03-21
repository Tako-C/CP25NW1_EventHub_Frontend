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
  { value: "text", label: "ข้อความสั้น", icon: Type },
  { value: "multiple_choice", label: "เลือกตอบ (เลือกได้ 1)", icon: Circle },
  { value: "checkbox", label: "เลือกตอบ (เลือกได้หลายข้อ)", icon: ListChecks },
  // { value: "rating", label: "ให้คะแนน", icon: Star },
];

export default function QuestionEditor({
  questions,
  index,
  onUpdate,
  onDelete,
  surveyType, 
}) {
  const QuestionIcon =
    questionTypes.find((t) => t.value === questions?.questionType)?.icon ||
    Type;

  const isLockedPost = surveyType === "post" && index === 0;
  console.log(questions)
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-300 transition-all">
      <div className="flex items-start gap-4">
        {!isLockedPost && (
          <div className="cursor-move text-gray-400 hover:text-gray-600 pt-2">
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              คำถามที่ {index + 1} {isLockedPost && "(บังคับ)"}
            </span>
            <div className="relative flex-1 max-w-xs">
              <select
                value={questions?.questionType}
                disabled={isLockedPost}
                onChange={(e) =>
                  onUpdate(index, "questionType", e.target.value)
                }
                className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            onChange={(e) => onUpdate(index, "question", e.target.value)}
            placeholder={
              isLockedPost ? "ความพึงพอใจโดยรวม" : "พิมพ์คำถามของคุณที่นี่..."
            }
            className="w-full text-lg font-medium mb-3 px-0 border-0 border-b-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
          />

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
                      onUpdate(index, "choices", newOptions);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {questions.choices?.length < 10 && (
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

          {/* {questions?.questionType === "rating" && (
            <div className="mb-3">
              <span className="text-sm text-gray-500">ให้คะแนน 1-5</span>
            </div>
          )} */}
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