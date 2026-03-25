"use client";
import { Pie, Column } from "@ant-design/plots";
import { Card, Table, Tag, Rate } from "antd";

const PALETTE = {
  primary: ["#2563EB", "#0EA5E9", "#8B5CF6"],
  accent: [
    "#F97316",
    "#14B8A6",
    "#A855F7",
    "#EC4899",
    "#22C55E",
    "#EAB308",
    "#3B82F6",
  ],
  pieRole: ["#2563EB", "#9333EA", "#F97316"],
  pieGender: ["#0EA5E9", "#F43F5E", "#14B8A6"],
  survey: ["#14B8A6", "#6366F1", "#F97316"],
};

const getPalette = (palette) => ({ ...PALETTE, ...(palette || {}) });

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────

// RegistrationByTimeChart
// data: { hourlyStats: [{hourRange, total}] }
// from API: dashboard/events/${id}/registrations
export const RegistrationByTimeChart = ({ palette, data }) => {
  const p = getPalette(palette);

  const chartData = (data?.hourlyStats || []).map((h) => ({
    time: h.hourRange,
    value: h.total,
    type: "ทั้งหมด",
  }));

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      seriesField="type"
      color={p.primary}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={260}
      xAxis={{
        label: { autoRotate: true, style: { fontSize: 10 } },
        title: { text: "ช่วงเวลา" },
      }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

// CheckinByTimeChart
// data: { hourlyStats: [{hourRange, total}] }
// from API: dashboard/events/${id}/check-ins
export const CheckinByTimeChart = ({ palette, data }) => {
  const p = getPalette(palette);

  const chartData = (data?.hourlyStats || []).map((h) => ({
    time: h.hourRange,
    value: h.total,
    type: "ทั้งหมด",
  }));

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      seriesField="type"
      color={p.checkin || ["#0F766E", "#14B8A6", "#2DD4BF"]}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={260}
      xAxis={{
        label: { autoRotate: true, style: { fontSize: 10 } },
        title: { text: "ช่วงเวลา" },
      }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

// OccupationChart
// data: [{jobName, total}]
// from API: dashboard/events/${id}/jobs
export const OccupationChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    occupation: d.jobName,
    count: d.total,
  }));

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Column
      data={chartData}
      xField="occupation"
      yField="count"
      colorField="occupation"
      color={p.accent}
      legend={false}
      label={{ position: "top", style: { fill: "#555", fontSize: 11 } }}
      height={260}
      xAxis={{
        label: { autoRotate: true, style: { fontSize: 10 } },
        title: { text: "อาชีพ" },
      }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

// ProvinceChart
// data: [{cityName, total}]
// from API: dashboard/events/${id}/cities
export const ProvinceChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    province: d.cityName,
    count: d.total,
  }));

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Column
      data={chartData}
      xField="province"
      yField="count"
      colorField="province"
      color={p.accent}
      legend={false}
      label={{ position: "top", style: { fill: "#555", fontSize: 11 } }}
      height={260}
      xAxis={{
        label: { autoRotate: true, style: { fontSize: 10 } },
        title: { text: "จังหวัด" },
      }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

// RolePieChart
// data: [{roleName, total, percentage}]
// from API: dashboard/events/${id}/roles
export const RolePieChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    type: d.roleName,
    value: d.total,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Pie
      data={chartData}
      angleField="value"
      colorField="type"
      color={p.pieRole}
      radius={0.8}
      label={{
        position: "outside",
        text: (item) =>
          `${item.type}: ${((item.value / total) * 100).toFixed(1)}%`,
      }}
      legend={{ position: "bottom" }}
      height={280}
    />
  );
};

// AgeChart
// data: [{ageRange, total}]
// from API: dashboard/events/${id}/ages
export const AgeChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    age: d.ageRange,
    value: d.total,
  }));

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Column
      data={chartData}
      xField="age"
      yField="value"
      colorField="age"
      color={p.accent}
      legend={false}
      label={{ position: "top", style: { fill: "#555", fontSize: 11 } }}
      height={240}
      xAxis={{ title: { text: "ช่วงอายุ" } }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

// GenderPieChart
// data: [{genderName, total}]
// from API: dashboard/events/${id}/genders
export const GenderPieChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    type: d.genderName,
    value: d.total,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Pie
      data={chartData}
      angleField="value"
      colorField="type"
      color={p.pieGender}
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

// VisitorSubmittedChart
// data: { hourlyPostSurveyStats: [{hourRange, total}] }
// from API: dashboard/events/${id}/surveys/visitor/stats
export const VisitorSubmittedChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data?.hourlyPostSurveyStats || []).map((h) => ({
    time: h.hourRange,
    value: h.total,
    type: "Post Survey",
  }));

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      seriesField="type"
      color={p.survey}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={240}
      xAxis={{ label: { autoRotate: true, style: { fontSize: 10 } } }}
    />
  );
};

// ExhibitorSubmittedChart
// data: { hourlyPostSurveyStats: [{hourRange, total}] }
// from API: dashboard/events/${id}/surveys/exhibitor/stats
export const ExhibitorSubmittedChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data?.hourlyPostSurveyStats || []).map((h) => ({
    time: h.hourRange,
    value: h.total,
    type: "Post Survey",
  }));

  if (!chartData.length)
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      seriesField="type"
      color={p.surveyExhibitor || ["#F97316", "#6366F1", "#14B8A6"]}
      isGroup
      label={false}
      legend={{ position: "top-right" }}
      height={240}
      xAxis={{ label: { autoRotate: true, style: { fontSize: 10 } } }}
    />
  );
};

// ─── SATISFACTION WIDGET ──────────────────────────────────────────────────────
// data: [{answer, count, percentage}]  (answer = "1".."5")
// from API: dashboard/events/${id}/surveys/visitor/satisfaction  (or /exhibitor/satisfaction)

const SatisfactionBar = ({ level, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1 w-20 shrink-0">
        <Rate
          disabled
          defaultValue={level}
          count={level}
          style={{ fontSize: 11, color }}
        />
      </div>
      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-12 text-right font-semibold text-gray-700">
        {count} คน
      </span>
    </div>
  );
};

export const SatisfactionWidget = ({ data, title, color = "#6366F1" }) => {
  // data: [{answer: "5", count: 4}, ...]  → convert to map {5: 4, ...}
  const dataMap = {};
  (data || []).forEach((d) => {
    dataMap[Number(d.answer)] = d.count;
  });

  const total = Object.values(dataMap).reduce((a, b) => a + b, 0);
  const avg =
    total > 0
      ? (
          Object.entries(dataMap).reduce(
            (sum, [k, v]) => sum + Number(k) * v,
            0,
          ) / total
        ).toFixed(2)
      : "0.00";

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
          <SatisfactionBar
            key={lvl}
            level={lvl}
            count={dataMap[lvl] || 0}
            total={total}
            color={color}
          />
        ))}
      </div>
      <div className="mt-3 text-right text-xs text-gray-400">
        จากทั้งหมด {total} คน
      </div>
    </Card>
  );
};

// ─── ANSWER RATIO WIDGET ──────────────────────────────────────────────────────
// data: [{question, answered, total}]  — wire up when endpoint available
export const AnswerRatioChart = ({ palette, data }) => {
  const p = getPalette(palette);

  if (!data || !data.length) {
    return (
      <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>
    );
  }

  const chartData = data
    .map((q) => ({
      question: q.question,
      value: q.answered,
      type: "ตอบแล้ว",
    }))
    .concat(
      data.map((q) => ({
        question: q.question,
        value: q.total - q.answered,
        type: "ยังไม่ตอบ",
      })),
    );

  return (
    <Column
      data={chartData}
      xField="question"
      yField="value"
      seriesField="type"
      color={p.stack || ["#2563EB", "#CBD5E1"]}
      isStack
      label={false}
      legend={{ position: "top-right" }}
      height={260}
      xAxis={{ label: { style: { fontSize: 11 } } }}
      yAxis={{ title: { text: "จำนวนคน" } }}
    />
  );
};

// ─── SUGGESTION TABLE ─────────────────────────────────────────────────────────
// data: [{responderRole, answer, surveysType, keyword, sentiment}]
// from API: dashboard/events/${id}/surveys/text-responses

const sentimentColor = { POSITIVE: "green", NEUTRAL: "blue", NEGATIVE: "red" };

const suggestionColumns = [
  { title: "No.", dataIndex: "no", key: "no", width: 55 },
  {
    title: "Role",
    dataIndex: "responderRole",
    key: "responderRole",
    render: (r) => (
      <Tag color={r === "VISITOR" ? "blue" : "purple"}>{r}</Tag>
    ),
  },
  { title: "Feedback", dataIndex: "answer", key: "answer" },
  {
    title: "Survey Type",
    dataIndex: "surveysType",
    key: "surveysType",
    render: (t) => (
      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
        {t}
      </span>
    ),
  },
  {
    title: "Keyword",
    dataIndex: "keyword",
    key: "keyword",
    render: (k) =>
      k ? <Tag>{k}</Tag> : <span className="text-gray-300">-</span>,
  },
  {
    title: "Sentiment",
    dataIndex: "sentiment",
    key: "sentiment",
    render: (s) =>
      s ? (
        <Tag color={sentimentColor[s]}>{s}</Tag>
      ) : (
        <span className="text-gray-300">-</span>
      ),
  },
];

export const SuggestionTable = ({ data }) => {
  const tableData = (data || []).map((item, idx) => ({
    ...item,
    key: idx,
    no: idx + 1,
  }));

  return (
    <Card
      variant="borderless"
      title={
        <span className="text-lg font-extrabold text-slate-800">
          ตารางแสดงคำตอบข้อเสนอแนะ
        </span>
      }
      className="rounded-2xl border border-slate-200 bg-white/95 shadow-sm"
      styles={{ body: { padding: "24px" } }}
    >
      <Table
        columns={suggestionColumns}
        dataSource={tableData}
        pagination={{ pageSize: 10 }}
        bordered
        rowKey="key"
        size="small"
      />
    </Card>
  );
};

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────

export const ChartCard = ({ title, children, className = "" }) => (
  <Card
    variant="borderless"
    title={
      <span className="text-base font-extrabold text-slate-800">{title}</span>
    }
    className={`h-fit rounded-2xl border border-slate-200 bg-white/95 shadow-sm ${className}`}
    styles={{ body: { padding: "20px" } }}
  >
    {children}
  </Card>
);