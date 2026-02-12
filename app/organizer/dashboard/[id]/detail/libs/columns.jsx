import { FormatDate } from "@/utils/format";

// Columns สำหรับ Participants
export const participantColumns = [
  { title: "No.", dataIndex: "no", key: "no", width: 60 },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  {
    title: "Registration Date",
    dataIndex: "registration_date",
    render: (date) => FormatDate(date, "datetime"),
  },
  {
    title: "Check-in Date",
    dataIndex: "check_in_at",
    render: (date) =>
      date ? (
        <span className="text-green-600 font-medium">
          {FormatDate(date, "datetime")}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
  },
];

// Columns สำหรับ Survey (ใช้ร่วมกันได้ทั้ง Visitor/Exhibitor)
export const createSurveyColumns = (badgeColor = "blue") => [
  { title: "No.", dataIndex: "no", key: "no", width: 60 },
  {
    title: "Name",
    key: "name",
    render: (_, record) => `${record.firstName} ${record.lastName}`,
  },
  {
    title: "Survey Type",
    dataIndex: "surveyType",
    render: (text) => (
      <span className={`text-xs bg-${badgeColor}-50 text-${badgeColor}-600 px-2 py-1 rounded-md`}>
        {text}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === "PENDING"
            ? "bg-orange-100 text-orange-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {status}
      </span>
    ),
  },
];