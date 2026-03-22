"use client";
import { Pie, Column, Line } from "@ant-design/plots";
import { Card, Table, Tag, Rate } from "antd";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const REGISTRATION_BY_TIME = [
  { time: "08:00", all: 12, male: 7, female: 5 },
  { time: "09:00", all: 34, male: 20, female: 14 },
  { time: "10:00", all: 58, male: 32, female: 26 },
  { time: "11:00", all: 45, male: 25, female: 20 },
  { time: "12:00", all: 20, male: 11, female: 9 },
  { time: "13:00", all: 38, male: 22, female: 16 },
  { time: "14:00", all: 62, male: 35, female: 27 },
  { time: "15:00", all: 41, male: 23, female: 18 },
  { time: "16:00", all: 27, male: 15, female: 12 },
  { time: "17:00", all: 15, male: 8, female: 7 },
];

const CHECKIN_BY_TIME = [
  { time: "08:00", all: 8, male: 5, female: 3 },
  { time: "09:00", all: 28, male: 16, female: 12 },
  { time: "10:00", all: 51, male: 29, female: 22 },
  { time: "11:00", all: 39, male: 22, female: 17 },
  { time: "12:00", all: 16, male: 9, female: 7 },
  { time: "13:00", all: 31, male: 18, female: 13 },
  { time: "14:00", all: 55, male: 31, female: 24 },
  { time: "15:00", all: 36, male: 20, female: 16 },
  { time: "16:00", all: 22, male: 12, female: 10 },
  { time: "17:00", all: 11, male: 6, female: 5 },
];

const OCCUPATION_DATA = [
  { occupation: "วิศวกร", count: 85 },
  { occupation: "นักศึกษา", count: 72 },
  { occupation: "ผู้ประกอบการ", count: 61 },
  { occupation: "นักออกแบบ", count: 48 },
  { occupation: "ที่ปรึกษา", count: 37 },
  { occupation: "นักวิจัย", count: 29 },
  { occupation: "อื่นๆ", count: 42 },
];

const PROVINCE_DATA = [
  { province: "กรุงเทพฯ", count: 180 },
  { province: "เชียงใหม่", count: 62 },
  { province: "ขอนแก่น", count: 48 },
  { province: "ชลบุรี", count: 41 },
  { province: "นครราชสีมา", count: 35 },
  { province: "สงขลา", count: 28 },
  { province: "อื่นๆ", count: 74 },
];

const ROLE_DATA = [
  { type: "Visitor", value: 215 },
  { type: "Exhibitor", value: 87 },
  { type: "Staff", value: 46 },
];

const AGE_DATA = [
  { age: "< 18", value: 12 },
  { age: "18-25", value: 68 },
  { age: "26-35", value: 94 },
  { age: "36-45", value: 71 },
  { age: "46-55", value: 45 },
  { age: "55+", value: 22 },
];

const GENDER_DATA = [
  { type: "ชาย", value: 198 },
  { type: "หญิง", value: 154 },
];

// Survey submitted over time
const VISITOR_SUBMITTED_BY_TIME = [
  { time: "09:00", all: 5, post: 3, suggestion: 2 },
  { time: "10:00", all: 18, post: 11, suggestion: 7 },
  { time: "11:00", all: 32, post: 20, suggestion: 12 },
  { time: "12:00", all: 14, post: 9, suggestion: 5 },
  { time: "13:00", all: 22, post: 14, suggestion: 8 },
  { time: "14:00", all: 41, post: 26, suggestion: 15 },
  { time: "15:00", all: 28, post: 18, suggestion: 10 },
  { time: "16:00", all: 19, post: 12, suggestion: 7 },
];

const EXHIBITOR_SUBMITTED_BY_TIME = [
  { time: "09:00", all: 3, post: 2, suggestion: 1 },
  { time: "10:00", all: 11, post: 7, suggestion: 4 },
  { time: "11:00", all: 20, post: 13, suggestion: 7 },
  { time: "12:00", all: 8, post: 5, suggestion: 3 },
  { time: "13:00", all: 15, post: 10, suggestion: 5 },
  { time: "14:00", all: 26, post: 17, suggestion: 9 },
  { time: "15:00", all: 17, post: 11, suggestion: 6 },
  { time: "16:00", all: 12, post: 8, suggestion: 4 },
];

const SATISFACTION_VISITOR = { 5: 142, 4: 98, 3: 41, 2: 18, 1: 9 };
const SATISFACTION_EXHIBITOR = { 5: 54, 4: 43, 3: 19, 2: 8, 1: 3 };

const QUESTION_ANSWER_RATIO = [
  { question: "ความพึงพอใจโดยรวม", answered: 308, total: 352 },
  { question: "คุณภาพสินค้า/บริการ", answered: 291, total: 352 },
  { question: "ความพร้อมของสถานที่", answered: 275, total: 352 },
  { question: "การให้บริการของเจ้าหน้าที่", answered: 263, total: 352 },
  { question: "ข้อเสนอแนะ", answered: 188, total: 352 },
];

const SUGGESTION_DATA = [
  { key: 1, no: 1, eventId: 1, role: "VISITOR", answerId: 308, feedback: "ดีมาก", type: "POST_VISITOR", keyword: null, sentiment: null },
  { key: 2, no: 2, eventId: 1, role: "VISITOR", answerId: 296, feedback: "มาซื้อเสื้อผ้าจำนวนมาก", type: "POST_VISITOR", keyword: null, sentiment: null },
  { key: 3, no: 3, eventId: 1, role: "VISITOR", answerId: 241, feedback: "สินค้าหลากหลาย ราคาสมเหตุสมผล", type: "POST_VISITOR", keyword: "ราคา", sentiment: "POSITIVE" },
  { key: 4, no: 4, eventId: 1, role: "EXHIBITOR", answerId: 189, feedback: "ต้องการพื้นที่มากขึ้น", type: "POST_EXHIBITOR", keyword: "พื้นที่", sentiment: "NEUTRAL" },
  { key: 5, no: 5, eventId: 1, role: "VISITOR", answerId: 177, feedback: "แสงไฟในงานดีมาก บรรยากาศสวย", type: "POST_VISITOR", keyword: "บรรยากาศ", sentiment: "POSITIVE" },
];

// ─── HELPER: Multi-series bar chart data transformer ─────────────────────────
const toMultiSeries = (data, timeKey, series) =>
  series.flatMap((s) =>
    data.map((d) => ({ time: d[timeKey], value: d[s.key], type: s.label }))
  );

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────

export const RegistrationByTimeChart = () => {
  const data = toMultiSeries(REGISTRATION_BY_TIME, "time", [
    { key: "all", label: "ทั้งหมด" },
    { key: "male", label: "ชาย" },
    { key: "female", label: "หญิง" },
  ]);
  return (
    <Column
      data={data}
      xField="time"
      yField="value"
      seriesField="type"
      color={["#6366F1", "#3B82F6", "#EC4899"]}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={260}
      xAxis={{ title: { text: "ช่วงเวลา" } }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

export const CheckinByTimeChart = () => {
  const data = toMultiSeries(CHECKIN_BY_TIME, "time", [
    { key: "all", label: "ทั้งหมด" },
    { key: "male", label: "ชาย" },
    { key: "female", label: "หญิง" },
  ]);
  return (
    <Column
      data={data}
      xField="time"
      yField="value"
      seriesField="type"
      color={["#7C3AED", "#6366F1", "#A78BFA"]}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={260}
      xAxis={{ title: { text: "ช่วงเวลา" } }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

export const OccupationChart = () => (
  <Column
    data={OCCUPATION_DATA}
    xField="occupation"
    yField="count"
    color="#6366F1"
    label={{ position: "top", style: { fill: "#555", fontSize: 11 } }}
    height={260}
    xAxis={{ title: { text: "อาชีพ" } }}
    yAxis={{ title: { text: "จำนวนคน" } }}
  />
);

export const ProvinceChart = () => (
  <Column
    data={PROVINCE_DATA}
    xField="province"
    yField="count"
    color="#7C3AED"
    label={{ position: "top", style: { fill: "#555", fontSize: 11 } }}
    height={260}
    xAxis={{ title: { text: "จังหวัด" } }}
    yAxis={{ title: { text: "จำนวนคน" } }}
  />
);

export const RolePieChart = () => {
  const total = ROLE_DATA.reduce((s, d) => s + d.value, 0);
  return (
    <Pie
      data={ROLE_DATA}
      angleField="value"
      colorField="type"
      color={["#6366F1", "#A855F7", "#EC4899"]}
      radius={0.8}
      label={{
        position: "outside",
        text: (item) => `${item.type}: ${((item.value / total) * 100).toFixed(1)}%`,
      }}
      legend={{ position: "bottom" }}
      height={280}
    />
  );
};

export const AgeChart = () => (
  <Column
    data={AGE_DATA}
    xField="age"
    yField="value"
    color="#A855F7"
    label={{ position: "top", style: { fill: "#555", fontSize: 11 } }}
    height={240}
    xAxis={{ title: { text: "ช่วงอายุ" } }}
    yAxis={{ title: { text: "จำนวนคน" } }}
  />
);

export const GenderPieChart = () => {
  const total = GENDER_DATA.reduce((s, d) => s + d.value, 0);
  return (
    <Pie
      data={GENDER_DATA}
      angleField="value"
      colorField="type"
      color={["#4F46E5", "#10B981"]}
      radius={0.8}
      label={{
        position: "inside",
        text: (item) => `${((item.value / total) * 100).toFixed(1)}%`,
        style: { fontSize: 16, fontWeight: "bold", fill: "#fff" },
      }}
      legend={{ position: "bottom" }}
      height={240}
    />
  );
};

export const VisitorSubmittedChart = () => {
  const data = toMultiSeries(VISITOR_SUBMITTED_BY_TIME, "time", [
    { key: "all", label: "ทั้งหมด" },
    { key: "post", label: "Post Visitor" },
    { key: "suggestion", label: "Suggestion" },
  ]);
  return (
    <Column
      data={data}
      xField="time"
      yField="value"
      seriesField="type"
      color={["#3B82F6", "#6366F1", "#A78BFA"]}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={240}
    />
  );
};

export const ExhibitorSubmittedChart = () => {
  const data = toMultiSeries(EXHIBITOR_SUBMITTED_BY_TIME, "time", [
    { key: "all", label: "ทั้งหมด" },
    { key: "post", label: "Post Exhibitor" },
    { key: "suggestion", label: "Suggestion" },
  ]);
  return (
    <Column
      data={data}
      xField="time"
      yField="value"
      seriesField="type"
      color={["#7C3AED", "#A855F7", "#C084FC"]}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={240}
    />
  );
};

// ─── SATISFACTION WIDGET ──────────────────────────────────────────────────────

const SatisfactionBar = ({ level, count, total, color }) => {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1 w-20 shrink-0">
        <Rate disabled defaultValue={level} count={level} style={{ fontSize: 11, color }} />
      </div>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-12 text-right font-semibold text-gray-700">{count} คน</span>
    </div>
  );
};

export const SatisfactionWidget = ({ data, title, color = "#6366F1" }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const avg = (
    Object.entries(data).reduce((sum, [k, v]) => sum + Number(k) * v, 0) / total
  ).toFixed(2);

  return (
    <Card
      variant="borderless"
      title={<span className="text-base font-semibold">{title}</span>}
      className="rounded-xl border-2 border-[#f0f0f0] shadow-sm"
      extra={
        <span className="text-2xl font-bold" style={{ color }}>
          ⭐ {avg}
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        {[5, 4, 3, 2, 1].map((lvl) => (
          <SatisfactionBar key={lvl} level={lvl} count={data[lvl]} total={total} color={color} />
        ))}
      </div>
      <div className="mt-3 text-right text-xs text-gray-400">จากทั้งหมด {total} คน</div>
    </Card>
  );
};

// ─── ANSWER RATIO WIDGET ──────────────────────────────────────────────────────

export const AnswerRatioChart = () => {
  const data = QUESTION_ANSWER_RATIO.map((q) => ({
    question: q.question,
    value: q.answered,
    type: "ตอบแล้ว",
  })).concat(
    QUESTION_ANSWER_RATIO.map((q) => ({
      question: q.question,
      value: q.total - q.answered,
      type: "ยังไม่ตอบ",
    }))
  );

  return (
    <Column
      data={data}
      xField="question"
      yField="value"
      seriesField="type"
      color={["#6366F1", "#E5E7EB"]}
      isStack
      label={false}
      legend={{ position: "top-right" }}
      height={260}
      xAxis={{ label: { style: { fontSize: 11 } } }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

// ─── SUGGESTION TABLE ────────────────────────────────────────────────────────

const sentimentColor = { POSITIVE: "green", NEUTRAL: "blue", NEGATIVE: "red" };

const suggestionColumns = [
  { title: "No.", dataIndex: "no", key: "no", width: 55 },
  { title: "Role", dataIndex: "role", key: "role", render: (r) => <Tag color={r === "VISITOR" ? "blue" : "purple"}>{r}</Tag> },
  { title: "Feedback", dataIndex: "feedback", key: "feedback" },
  { title: "Survey Type", dataIndex: "type", key: "type", render: (t) => <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{t}</span> },
  {
    title: "Keyword", dataIndex: "keyword", key: "keyword",
    render: (k) => k ? <Tag>{k}</Tag> : <span className="text-gray-300">-</span>,
  },
  {
    title: "Sentiment", dataIndex: "sentiment", key: "sentiment",
    render: (s) => s ? <Tag color={sentimentColor[s]}>{s}</Tag> : <span className="text-gray-300">-</span>,
  },
];

export const SuggestionTable = () => (
  <Card
    variant="borderless"
    title={<span className="text-lg font-semibold">ตารางแสดงคำตอบข้อเสนอแนะ</span>}
    className="rounded-xl border-2 border-[#f0f0f0] shadow-sm"
    styles={{ body: { padding: "24px" } }}
  >
    <Table
      columns={suggestionColumns}
      dataSource={SUGGESTION_DATA}
      pagination={{ pageSize: 10 }}
      bordered
      rowKey="key"
      size="small"
    />
  </Card>
);

// ─── SECTION WRAPPER ────────────────────────────────────────────────────────

export const ChartCard = ({ title, children, className = "" }) => (
  <Card
    variant="borderless"
    title={<span className="text-base font-semibold">{title}</span>}
    className={`rounded-xl border-2 border-[#f0f0f0] shadow-sm ${className}`}
    styles={{ body: { padding: "20px" } }}
  >
    {children}
  </Card>
);