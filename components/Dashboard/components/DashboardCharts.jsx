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

// ─── HELPER: กรอง hourly slots ที่ว่างออก ────────────────────────────────────
// เก็บเฉพาะ slot ที่มีค่า > 0 และ slot ติดกัน ±1 เพื่อให้เห็น context
function filterHourlyData(hourlyStats) {
  if (!hourlyStats || !hourlyStats.length) return [];
  const allZero = hourlyStats.every((h) => h.total === 0);
  if (allZero) return hourlyStats;

  const activeIndices = new Set();
  hourlyStats.forEach((h, i) => {
    if (h.total > 0) {
      if (i > 0) activeIndices.add(i - 1);
      activeIndices.add(i);
      if (i < hourlyStats.length - 1) activeIndices.add(i + 1);
    }
  });
  return hourlyStats.filter((_, i) => activeIndices.has(i));
}

// ─── CHART COMPONENTS ─────────────────────────────────────────────────────────

// RegistrationByTimeChart
export const RegistrationByTimeChart = ({ palette, data }) => {
  const p = getPalette(palette);

  const filtered = filterHourlyData(data?.hourlyStats);
  const chartData = filtered.map((h) => ({
    time: h.hourRange,
    value: h.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      color={p.primary[0]}
      label={false}
      legend={false}
      height={240}
      xAxis={{
        label: { autoRotate: true, style: { fontSize: 11 } },
        title: { text: "ช่วงเวลา" },
      }}
      yAxis={{ title: { text: "จำนวนคน" }, minLimit: 0 }}
      tooltip={(datum) => ({
        name: datum.time,
        value: `${datum.value} คน`,
      })}
    />
  );
};

// CheckinByTimeChart
export const CheckinByTimeChart = ({ palette, data }) => {
  const p = getPalette(palette);

  const filtered = filterHourlyData(data?.hourlyStats);
  const chartData = filtered.map((h) => ({
    time: h.hourRange,
    value: h.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const checkinColor = (p.checkin || ["#0F766E"])[0];

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      color={checkinColor}
      label={false}
      legend={false}
      height={240}
      xAxis={{
        label: { autoRotate: true, style: { fontSize: 11 } },
        title: { text: "ช่วงเวลา" },
      }}
      yAxis={{ title: { text: "จำนวนคน" }, minLimit: 0 }}
      tooltip={(datum) => ({
        name: datum.time,
        value: `${datum.value} คน`,
      })}
    />
  );
};

// OccupationChart
export const OccupationChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    occupation: d.jobName,
    count: d.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

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
      tooltip={(datum) => ({
        name: datum.occupation,
        value: `${datum.count} คน`, 
      })}
    />
  );
};

// ProvinceChart
export const ProvinceChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    province: d.cityName,
    count: d.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

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
      tooltip={(datum) => ({
        name: datum.province,
        value: `${datum.count} คน`, 
      })}
    />
  );
};

// RolePieChart
export const RolePieChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    type: d.roleName,
    value: d.total,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

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
      tooltip={(datum) => ({
        name: datum.type,
        value: `${datum.value} คน (${((datum.value / total) * 100).toFixed(1)}%)`, 
      })}
    />
  );
};

// AgeChart
export const AgeChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    age: d.ageRange,
    value: d.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

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
      tooltip={(datum) => ({
        name: datum.age,
        value: `${datum.value} คน`, 
      })}
    />
  );
};

// GenderPieChart
export const GenderPieChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    type: d.genderName,
    value: d.total,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

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
      tooltip={(datum) => ({
        name: datum.type,
        value: `${datum.value} คน (${((datum.value / total) * 100).toFixed(1)}%)`, 
      })}
    />
  );
};

// VisitorSubmittedChart
export const VisitorSubmittedChart = ({ palette, data }) => {
  const p = getPalette(palette);

  const filtered = filterHourlyData(data?.hourlyPostSurveyStats);
  const chartData = filtered.map((h) => ({
    time: h.hourRange,
    value: h.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      color={(p.survey || [])[0] || "#14B8A6"}
      label={false}
      legend={false}
      height={220}
      xAxis={{ label: { autoRotate: true, style: { fontSize: 11 } } }}
      yAxis={{ minLimit: 0 }}
      tooltip={(datum) => ({
        name: datum.time,
        value: `${datum.value} คน`, 
      })}
    />
  );
};

// ExhibitorSubmittedChart
export const ExhibitorSubmittedChart = ({ palette, data }) => {
  const p = getPalette(palette);

  const filtered = filterHourlyData(data?.hourlyPostSurveyStats);
  const chartData = filtered.map((h) => ({
    time: h.hourRange,
    value: h.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const exhibitorColor = (p.surveyExhibitor || ["#F97316"])[0];

  return (
    <Column
      data={chartData}
      xField="time"
      yField="value"
      color={exhibitorColor}
      label={false}
      legend={false}
      height={220}
      xAxis={{ label: { autoRotate: true, style: { fontSize: 11 } } }}
      yAxis={{ minLimit: 0 }}
      tooltip={(datum) => ({
        name: datum.time,
        value: `${datum.value} คน`, 
      })}
    />
  );
};

// ─── SATISFACTION WIDGET ──────────────────────────────────────────────────────

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

export const AnswerRatioChart = ({ palette, data }) => {
  const p = getPalette(palette);

  if (!data || !data.length) {
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;
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

const sentimentColor = { POSITIVE: "green", NEUTRAL: "blue", NEGATIVE: "red" };

const suggestionColumns = [
  { title: "No.", dataIndex: "no", key: "no", width: 55 },
  {
    title: "Role",
    dataIndex: "responderRole",
    key: "responderRole",
    render: (r) => <Tag color={r === "VISITOR" ? "blue" : "purple"}>{r}</Tag>,
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
