"use client";
import { Pie, Column } from "@ant-design/plots";
import { Card, Table, Tag, Rate, Select } from "antd";
import { useState } from "react";

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

// ─── STANDARD KEYWORDS ────────────────────────────────────────────────────────
export const STANDARD_KEYWORDS = [
  // Venue & Facilities
  "สถานที่ (Venue)",
  "การเดินทาง (Accessibility)",
  "ที่จอดรถ (Parking)",
  "ห้องน้ำ (Restroom)",
  "แอร์/อุณหภูมิ (Temperature)",
  "ความสะอาด (Cleanliness)",
  "ป้ายบอกทาง (Signage)",
  // Technology & Infrastructure
  "อินเทอร์เน็ต (WiFi)",
  "ระบบลงทะเบียน (Registration)",
  "แอปพลิเคชัน (Mobile App)",
  "ระบบจองคิว (Queue System)",
  "ระบบเสียง/ภาพ (AV System)",
  // Staff & Service
  "เจ้าหน้าที่ (Staff)",
  "วิทยากร (Speaker)",
  "พิธีกร (MC)",
  "การบริการ (Service)",
  "ความรวดเร็ว (Efficiency)",
  // Content & Activities
  "เนื้อหา (Content)",
  "เวิร์กชอป (Workshop)",
  "บูธแสดงสินค้า (Exhibitor)",
  "ของสมนาคุณ (Giveaway)",
  "ระยะเวลา (Timing)",
  // Catering
  "อาหาร (Food)",
  "เครื่องดื่ม (Beverage)",
  "ความหลากหลาย (Variety)",
];

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

// RegistrationByTimeChart — สีฟ้า (Registration)
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
    <>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: "#BFD3F2" }}
        />
        <span className="text-sm font-semibold text-slate-600">
          จำนวนคนลงทะเบียน (คน)
        </span>
      </div>
      <Column
        data={chartData}
        xField="time"
        yField="value"
        style={{
          fill: "#BFD3F2",
        }}
        label={{
          position: "inside",
          style: { fill: "#1E40AF", fontSize: 13, fontWeight: 600 },
        }}
        legend={false}
        height={240}
        xAxis={{
          label: { autoRotate: true, style: { fontSize: 12, fill: "#475569" } },
          title: { text: "ช่วงเวลา", style: { fontSize: 13, fontWeight: 600 } },
        }}
        yAxis={{
          title: { text: "จำนวนคน", style: { fontSize: 13, fontWeight: 600 } },
          minLimit: 0,
        }}
        tooltip={(datum) => ({ name: "ลงทะเบียน", value: `${datum.value} คน` })}
      />
    </>
  );
};

// CheckinByTimeChart — สีเขียวน้ำทะเล (Check-in) แตกต่างจาก Registration
export const CheckinByTimeChart = ({ palette, data }) => {
  const p = getPalette(palette);

  const filtered = filterHourlyData(data?.hourlyStats);
  const chartData = filtered.map((h) => ({
    time: h.hourRange,
    value: h.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const checkinColor = "#B2E3DF"; 
  const darkTeal = "#0F766E"; 

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: checkinColor }}
        />
        <span className="text-sm font-semibold text-slate-600">
          จำนวนคน Check-in (คน)
        </span>
      </div>
      <Column
        data={chartData}
        xField="time"
        yField="value"
        color={checkinColor}
        style={{
          fill: checkinColor,
          stroke: checkinColor,
        }}
        label={{
          position: "inside", 
          style: { 
            fill: darkTeal, 
            fontSize: 12, 
            fontWeight: 700 
          },
        }}
        legend={false}
        height={240}
        xAxis={{
          label: { autoRotate: true, style: { fontSize: 12, fill: "#475569" } },
          title: { text: "ช่วงเวลา", style: { fontSize: 13, fontWeight: 600 } },
        }}
        yAxis={{
          title: { text: "จำนวนคน", style: { fontSize: 13, fontWeight: 600 } },
          minLimit: 0,
        }}
        tooltip={(datum) => ({ name: "Check-in", value: `${datum.value} คน` })}
      />
    </>
  );
};

// OccupationChart — เลขสีขาวในแท่ง
export const OccupationChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    occupation: d.jobName,
    count: d.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <Column
      data={chartData}
      xField="occupation"
      yField="count"
      colorField="occupation"
      color={p.accent}
      legend={false}
      label={{
        position: "inside",
        style: (datum) => ({
          fill: datum.count / maxVal >= 0.15 ? "#fff" : "#475569",
          fontSize: 12,
          fontWeight: 700,
        }),
      }}
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

// ProvinceChart — เลขสีขาวในแท่ง
export const ProvinceChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    province: d.cityName,
    count: d.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <Column
      data={chartData}
      xField="province"
      yField="count"
      colorField="province"
      color={p.accent}
      legend={false}
      label={{
        position: "inside",
        style: (datum) => ({
          fill: datum.count / maxVal >= 0.15 ? "#fff" : "#475569",
          fontSize: 12,
          fontWeight: 700,
        }),
      }}
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

// RolePieChart — Donut + custom legend ข้างข้าง ไม่มีปัญหา label ชนกัน
export const RolePieChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    type: d.roleName,
    value: d.total,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const colors = p.pieRole || ["#2563EB", "#9333EA", "#F97316", "#14B8A6"];

  return (
    <div className="flex flex-col gap-4">
      <Pie
        data={chartData}
        angleField="value"
        colorField="type"
        color={colors}
        innerRadius={0.6}
        radius={0.85}
        label={{
          position: "inside",
          text: (item) =>
            item.value / total >= 0.06
              ? `${((item.value / total) * 100).toFixed(1)}%`
              : "",
          style: { fontSize: 13, fontWeight: 700, fill: "#fff" },
        }}
        legend={false}
        statistic={{
          title: {
            content: "ทั้งหมด",
            style: { fontSize: 12, color: "#94A3B8" },
          },
          content: {
            content: `${total}`,
            style: { fontSize: 26, fontWeight: 900, color: "#1E293B" },
          },
        }}
        height={260}
        tooltip={(datum) => ({
          name: datum.type,
          value: `${datum.value} คน (${((datum.value / total) * 100).toFixed(1)}%)`,
        })}
      />
      {/* Custom legend แทน built-in เพื่อหลีกเลี่ยง label ชนกัน */}
      <div className="flex flex-col gap-2 px-2">
        {chartData.map((item, i) => (
          <div
            key={item.type}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="font-medium text-slate-700">{item.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{item.value} คน</span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: colors[i % colors.length] + "20",
                  color: colors[i % colors.length],
                }}
              >
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// AgeChart — เลขสีขาวในแท่ง
export const AgeChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    age: d.ageRange,
    value: d.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const maxVal = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <Column
      data={chartData}
      xField="age"
      yField="value"
      colorField="age"
      color={p.accent}
      legend={false}
      label={{
        position: "inside",
        style: (datum) => ({
          fill: datum.value / maxVal >= 0.15 ? "#fff" : "#475569",
          fontSize: 12,
          fontWeight: 700,
        }),
      }}
      height={240}
      xAxis={{ title: { text: "ช่วงอายุ" } }}
      yAxis={{ title: { text: "จำนวนคน" } }}
      tooltip={(datum) => ({ name: datum.age, value: `${datum.value} คน` })}
    />
  );
};

// GenderPieChart — Donut + custom legend ด้านล่าง
export const GenderPieChart = ({ palette, data }) => {
  const p = getPalette(palette);
  const chartData = (data || []).map((d) => ({
    type: d.genderName,
    value: d.total,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const colors = p.pieGender || ["#0EA5E9", "#F43F5E", "#14B8A6", "#A855F7"];

  return (
    <div className="flex flex-col gap-4">
      <Pie
        data={chartData}
        angleField="value"
        colorField="type"
        color={colors}
        innerRadius={0.6}
        radius={0.85}
        label={{
          position: "inside",
          text: (item) =>
            item.value / total >= 0.06
              ? `${((item.value / total) * 100).toFixed(1)}%`
              : "",
          style: { fontSize: 13, fontWeight: 700, fill: "#fff" },
        }}
        legend={false}
        statistic={{
          title: {
            content: "ทั้งหมด",
            style: { fontSize: 12, color: "#94A3B8" },
          },
          content: {
            content: `${total}`,
            style: { fontSize: 26, fontWeight: 900, color: "#1E293B" },
          },
        }}
        height={240}
        tooltip={(datum) => ({
          name: datum.type,
          value: `${datum.value} คน (${((datum.value / total) * 100).toFixed(1)}%)`,
        })}
      />
      <div className="flex flex-col gap-2 px-2">
        {chartData.map((item, i) => (
          <div
            key={item.type}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="font-medium text-slate-700">{item.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{item.value} คน</span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: colors[i % colors.length] + "20",
                  color: colors[i % colors.length],
                }}
              >
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// VisitorSubmittedChart — สีฟ้าเข้ม (Visitor)
export const VisitorSubmittedChart = ({ palette, data }) => {
  const filtered = filterHourlyData(data?.hourlyPostSurveyStats);
  const chartData = filtered.map((h) => ({
    time: h.hourRange,
    value: h.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const color = "#2563EB";

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: color }}
        />
        <span className="text-sm font-semibold text-slate-600">
          Visitor ส่งแบบสอบถาม (คน)
        </span>
      </div>
      <Column
        data={chartData}
        xField="time"
        yField="value"
        color={color}
        label={{
          position: "inside",
          style: { fill: "#fff", fontSize: 12, fontWeight: 600 },
        }}
        legend={false}
        height={220}
        xAxis={{
          label: { autoRotate: true, style: { fontSize: 12, fill: "#475569" } },
        }}
        yAxis={{
          minLimit: 0,
          title: { text: "จำนวนคน", style: { fontSize: 12 } },
        }}
        tooltip={(datum) => ({
          name: "Visitor ส่ง Survey",
          value: `${datum.value} คน`,
        })}
      />
    </>
  );
};

// ExhibitorSubmittedChart — สีส้ม (Exhibitor) แตกต่างจาก Visitor ชัดเจน
export const ExhibitorSubmittedChart = ({ palette, data }) => {
  const filtered = filterHourlyData(data?.hourlyPostSurveyStats);
  const chartData = filtered.map((h) => ({
    time: h.hourRange,
    value: h.total,
  }));

  if (!chartData.length)
    return <div className="text-center py-10 text-gray-400">ไม่มีข้อมูล</div>;

  const color = "#EA580C";

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: color }}
        />
        <span className="text-sm font-semibold text-slate-600">
          Exhibitor ส่งแบบสอบถาม (คน)
        </span>
      </div>
      <Column
        data={chartData}
        xField="time"
        yField="value"
        color={color}
        label={{
          position: "inside",
          style: { fill: color, fontSize: 12, fontWeight: 600 },
        }}
        legend={false}
        height={220}
        xAxis={{
          label: { autoRotate: true, style: { fontSize: 12, fill: "#475569" } },
        }}
        yAxis={{
          minLimit: 0,
          title: { text: "จำนวนคน", style: { fontSize: 12 } },
        }}
        tooltip={(datum) => ({
          name: "Exhibitor ส่ง Survey",
          value: `${datum.value} คน`,
        })}
      />
    </>
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

// ─── SENTIMENT DONUT CHART ────────────────────────────────────────────────────

export const SentimentDonutChart = ({ data }) => {
  const counts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  (data || []).forEach((item) => {
    if (item.sentiment && counts[item.sentiment] !== undefined) {
      counts[item.sentiment]++;
    }
  });

  const total = counts.POSITIVE + counts.NEUTRAL + counts.NEGATIVE;

  const chartData = [
    { type: "Positive 😊", value: counts.POSITIVE },
    { type: "Neutral 😐", value: counts.NEUTRAL },
    { type: "Negative 😞", value: counts.NEGATIVE },
  ].filter((d) => d.value > 0);

  if (!total)
    return (
      <div className="text-center py-10 text-gray-400">
        ไม่มีข้อมูล Sentiment
      </div>
    );

  const SENTIMENT_COLORS = ["#22C55E", "#F59E0B", "#EF4444"];

  return (
    <div>
      {/* Summary pill badges */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2">
          <span className="text-xl">😊</span>
          <div>
            <div className="text-xs font-bold text-green-600 uppercase tracking-wide">
              Positive
            </div>
            <div className="text-2xl font-black text-green-700">
              {counts.POSITIVE}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
          <span className="text-xl">😐</span>
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wide">
              Neutral
            </div>
            <div className="text-2xl font-black text-amber-700">
              {counts.NEUTRAL}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          <span className="text-xl">😞</span>
          <div>
            <div className="text-xs font-bold text-red-600 uppercase tracking-wide">
              Negative
            </div>
            <div className="text-2xl font-black text-red-700">
              {counts.NEGATIVE}
            </div>
          </div>
        </div>
      </div>

      <Pie
        data={chartData}
        angleField="value"
        colorField="type"
        color={SENTIMENT_COLORS}
        innerRadius={0.62}
        radius={0.88}
        label={{
          position: "outside",
          text: (item) =>
            `${item.type}: ${item.value} (${((item.value / total) * 100).toFixed(1)}%)`,
          style: { fontSize: 13, fontWeight: 600 },
        }}
        legend={{
          position: "bottom",
          itemName: { style: { fontSize: 14, fontWeight: 600 } },
        }}
        statistic={{
          title: {
            content: "ทั้งหมด",
            style: { fontSize: 13, color: "#64748B" },
          },
          content: {
            content: `${total}`,
            style: { fontSize: 28, fontWeight: 900, color: "#1E293B" },
          },
        }}
        height={300}
        tooltip={(datum) => ({
          name: datum.type,
          value: `${datum.value} รายการ (${((datum.value / total) * 100).toFixed(1)}%)`,
        })}
      />
    </div>
  );
};

// ─── SUGGESTION TABLE WITH KEYWORD FILTER ────────────────────────────────────

const sentimentColor = { POSITIVE: "green", NEUTRAL: "gold", NEGATIVE: "red" };

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
      k ? (
        <Tag color="geekblue">{k}</Tag>
      ) : (
        <span className="text-gray-300">-</span>
      ),
  },
  {
    title: "Sentiment",
    dataIndex: "sentiment",
    key: "sentiment",
    render: (s) =>
      s ? (
        <Tag color={sentimentColor[s]}>
          {s === "POSITIVE" ? "😊 " : s === "NEUTRAL" ? "😐 " : "😞 "}
          {s}
        </Tag>
      ) : (
        <span className="text-gray-300">-</span>
      ),
  },
];

export const SuggestionTable = ({ data }) => {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState(null);

  const filteredData = (data || []).filter((item) => {
    const keywordMatch = !selectedKeyword || item.keyword === selectedKeyword;
    const sentimentMatch =
      !selectedSentiment || item.sentiment === selectedSentiment;
    return keywordMatch && sentimentMatch;
  });

  const tableData = filteredData.map((item, idx) => ({
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
      {/* ─── Filters ─── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            กรองตาม Keyword
          </label>
          <Select
            allowClear
            placeholder="ทั้งหมด"
            value={selectedKeyword}
            onChange={setSelectedKeyword}
            style={{ width: 240 }}
            options={STANDARD_KEYWORDS.map((kw) => ({ label: kw, value: kw }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            กรองตาม Sentiment
          </label>
          <Select
            allowClear
            placeholder="ทั้งหมด"
            value={selectedSentiment}
            onChange={setSelectedSentiment}
            style={{ width: 180 }}
            options={[
              { label: "😊 Positive", value: "POSITIVE" },
              { label: "😐 Neutral", value: "NEUTRAL" },
              { label: "😞 Negative", value: "NEGATIVE" },
            ]}
          />
        </div>
        {(selectedKeyword || selectedSentiment) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedKeyword(null);
                setSelectedSentiment(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-700 underline pb-1"
            >
              ล้างตัวกรอง
            </button>
          </div>
        )}
        <div className="flex items-end ml-auto">
          <span className="text-xs text-slate-400 pb-1">
            แสดง {tableData.length} / {(data || []).length} รายการ
          </span>
        </div>
      </div>

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
