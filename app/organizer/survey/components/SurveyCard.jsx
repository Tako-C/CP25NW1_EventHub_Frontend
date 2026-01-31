import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  FileText,
  User,
  Store,
} from "lucide-react";

function FormatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SurveyCard({
  survey,
  type,
  userType,
  onCreate,
  onEdit,
  onView,
  onDelete,
}) {
  const typeColors = {
    pre: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-700",
    },
    post: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
      badge: "bg-green-100 text-green-700",
    },
  };

  const userTypeConfig = {
    visitor: {
      label: "Visitor",
      labelTh: "ผู้เข้าชม",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    exhibitor: {
      label: "Exhibitor",
      labelTh: "ผู้ออกบูธ",
      icon: Store,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  };

  const colors = typeColors[type];
  const userConfig = userTypeConfig[userType];
  const UserIcon = userConfig.icon;

  if (!survey) {
    return (
      <div
        className={`${colors.bg} ${colors.border} border-2 border-dashed rounded-2xl p-6 text-center`}
      >
        <div
          className={`inline-flex items-center justify-center w-14 h-14 ${colors.badge} rounded-full mb-3`}
        >
          <UserIcon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <span
            className={`px-2 py-1 ${userConfig.bgColor} ${userConfig.borderColor} border rounded-lg text-sm`}
          >
            {userConfig.label}
          </span>
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          ยังไม่ได้สร้างแบบสำรวจสำหรับ{userConfig.labelTh}
        </p>
        <button
          onClick={onCreate}
          className={`${colors.text} border-2 ${colors.border} px-5 py-2.5 rounded-xl font-semibold hover:bg-white transition-all flex items-center gap-2 mx-auto text-sm`}
        >
          <Plus className="w-4 h-4" /> สร้าง Survey
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border-2 ${colors.border} rounded-2xl p-5 hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`${userConfig.bgColor} ${userConfig.color} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}
            >
              <UserIcon className="w-3.5 h-3.5" /> {userConfig.label}
            </span>
            <span
              className={`${survey.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"} px-3 py-1 rounded-full text-xs font-semibold`}
            >
              {survey.status === "ACTIVE" ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {survey.name}
          </h3>
          <p className="text-gray-600 text-xs">{survey.description}</p>
        </div>
      </div>

      <div className="mb-4 mt-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            {/* จำนวนคำถาม */}
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg p-1.5 shadow-sm">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">จำนวนคำถาม</div>
                <div className="text-lg font-bold text-gray-900">
                  {survey.questions?.length || 0}{" "}
                  <span className="text-sm font-normal text-gray-500">ข้อ</span>
                </div>
              </div>
            </div>

            <div className="h-10 w-px bg-purple-200"></div>

            <div className="flex items-center gap-2">
              <div className="bg-white rounded-lg p-1.5 shadow-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600">สร้างเมื่อ</div>
                <div className="text-sm font-bold text-gray-900">
                  {FormatDate(survey.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-3 space-y-1">
        <div>
          แก้ไขล่าสุด: {FormatDate(survey.updatedAt || survey.createdAt)}
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        {/* <button
          onClick={onView}
          className="flex-1 bg-gray-900 text-white px-3 py-2 rounded-xl font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5 text-sm"
        >
          <Eye className="w-3.5 h-3.5" /> ผลลัพธ์
        </button> */}
        <button
          onClick={onEdit}
          className="flex-1 border-2 border-gray-300 text-gray-700 px-3 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 text-sm"
        >
          <Edit3 className="w-3.5 h-3.5" /> แก้ไข
        </button>
        <button
          onClick={() => onDelete(survey.id)}
          className="border-2 border-red-200 text-red-600 px-3 py-2 rounded-xl font-semibold hover:bg-red-50 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}