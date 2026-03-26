"use client";
import { useMemo, useState } from "react";
import { Card, Button, Spin } from "antd";
import {
  RobotOutlined,
  ReloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDataNoToken } from "@/libs/fetch";

function isValidMetrics(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    (Number.isFinite(Number(payload.check_in_rate)) ||
      Number.isFinite(Number(payload.survey_rate)))
  );
}

function parseAiResult(raw) {
  if (typeof raw !== "string") {
    return { metrics: null, markdown: "" };
  }

  const text = raw.trim();
  if (!text) {
    return { metrics: null, markdown: "" };
  }

  const segments = text.split(/\r?\n---\r?\n/);
  if (segments.length > 1) {
    const [firstBlock, ...rest] = segments;
    let metrics = null;

    try {
      const parsed = JSON.parse(firstBlock.trim());
      if (isValidMetrics(parsed)) {
        metrics = parsed;
      }
    } catch {
      // Keep null and render full text fallback below.
    }

    const markdown = rest.join("\n---\n").trim();
    return { metrics, markdown: markdown || text };
  }

  try {
    const parsed = JSON.parse(text);
    if (isValidMetrics(parsed)) {
      return { metrics: parsed, markdown: "" };
    }
    if (typeof parsed?.analysis === "string") {
      return { metrics: null, markdown: parsed.analysis };
    }
  } catch {
    // This path is plain markdown/text.
  }

  return { metrics: null, markdown: text };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnalysisPanel({ eventId, eventData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const parsed = useMemo(() => parseAiResult(result), [result]);

  // const handleAnalyze = async () => {
  //   setLoading(true);
  //   setError(null);
  //   setResult(null);

  //   try {
  //     // ─── MOCK DATA (comment ออกเมื่อใช้ API จริง) ─────────────────────────
  //     await new Promise((r) => setTimeout(r, 1400));
  //     setResult(MOCK_ANALYSIS);
  //     // ──────────────────────────────────────────────────────────────────────

  //     const res = await getDataNoToken(`ai/summary/${eventId}`)
  //     console.log(res)
  //     // ─── API จริง (เปิด comment เมื่อพร้อม แล้ว comment MOCK ด้านบนออก) ──
  //     // const response = await getData(`analyze-event-performance`, {
  //     //   method: "POST",
  //     //   body: JSON.stringify({
  //     //     event_name: eventData?.eventName,
  //     //     event_type: eventData?.eventType,
  //     //     location: eventData?.location,
  //     //     event_detail: eventData?.eventDetail,
  //     //     total_registered: eventData?.totalRegistered,
  //     //     total_checked_in: eventData?.totalCheckedIn,
  //     //     total_feedback: eventData?.totalFeedback,
  //     //   }),
  //     // });
  //     // setResult(response?.data?.analysis ?? response?.data ?? "");
  //     // ──────────────────────────────────────────────────────────────────────
  //   } catch (err) {
  //     console.error("Analysis error:", err);
  //     setError("เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // เรียกใช้ getDataNoToken ซึ่งคุณได้ปรับให้รองรับการ return response.text() ไว้แล้ว
      const res = await getDataNoToken(`ai/summary/${eventId}`);

      // แสดงผลข้อมูลทั้งหมดที่ได้รับมา (Plain Text) ลงใน State โดยตรง
      // ไม่ว่าจะเป็น JSON metadata หรือเนื้อหา Markdown
      setResult(res);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="mt-8 mb-4">
      {/* ─── Trigger Button (แสดงเมื่อยังไม่มีผล) ─── */}
      {!result && !loading && (
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            className="group flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
            }}
          >
            <RobotOutlined className="text-xl group-hover:animate-spin" />
            วิเคราะห์ประสิทธิภาพงาน (AI Analysis)
          </button>
        </div>
      )}

      {/* ─── Loading ─── */}
      {loading && (
        <Card
          variant="borderless"
          className="rounded-xl border-2 border-purple-100 shadow-sm"
          styles={{ body: { padding: "48px 24px" } }}
        >
          <div className="flex flex-col items-center gap-4">
            <Spin size="large" />
            <p className="text-gray-400 text-sm">
              AI กำลังวิเคราะห์ข้อมูลงาน...
            </p>
          </div>
        </Card>
      )}

      {/* ─── Error ─── */}
      {error && !loading && (
        <Card
          variant="borderless"
          className="rounded-xl border-2 border-red-100 shadow-sm"
          styles={{ body: { padding: "32px 24px" } }}
        >
          <div className="flex flex-col items-center gap-3 text-red-400">
            <p className="text-sm">{error}</p>
            <Button
              onClick={handleAnalyze}
              icon={<ReloadOutlined />}
              size="small"
            >
              ลองอีกครั้ง
            </Button>
          </div>
        </Card>
      )}

      {/* ─── Result ─── */}
      {result && !loading && (
        <Card
          variant="borderless"
          className="rounded-xl border-2 border-purple-100 shadow-sm"
          title={
            <div className="flex items-center gap-2 text-base font-semibold text-[#7C3AED]">
              <RobotOutlined />
              ผลการวิเคราะห์ประสิทธิภาพงาน
            </div>
          }
          extra={
            <div className="flex items-center gap-2">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleAnalyze}
                className="text-gray-500"
              >
                วิเคราะห์ใหม่
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleClear}
                className="text-gray-400"
              />
            </div>
          }
          styles={{ body: { padding: "16px 24px 24px" } }}
        >
          {parsed.metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {Number.isFinite(Number(parsed.metrics.check_in_rate)) && (
                <MetricCard
                  label="Check-in Rate"
                  value={`${Number(parsed.metrics.check_in_rate).toFixed(2)}%`}
                  tone="blue"
                />
              )}
              {Number.isFinite(Number(parsed.metrics.survey_rate)) && (
                <MetricCard
                  label="Survey Rate"
                  value={`${Number(parsed.metrics.survey_rate).toFixed(2)}%`}
                  tone="green"
                />
              )}
            </div>
          )}

          <div className="rounded-xl border border-purple-100 bg-white/70 overflow-x-auto">
            <div className="px-4 py-4 text-gray-700 leading-7">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-gray-900 mt-4 mb-3">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold text-[#6D28D9] mt-5 mb-3 border-b border-purple-100 pb-1">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-gray-700 mb-3">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700">{children}</li>
                  ),
                  table: ({ children }) => (
                    <table className="w-full text-sm border-collapse mb-4 border border-gray-200 rounded-lg overflow-hidden">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-purple-50 text-gray-700">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="text-left px-3 py-2 border border-gray-200 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 border border-gray-200 align-top">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="my-4 border-purple-100" />,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-violet-300 bg-violet-50/60 px-3 py-2 rounded-r text-sm mb-3">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {parsed.markdown || "ไม่พบผลการวิเคราะห์"}
              </ReactMarkdown>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ label, value, tone = "blue" }) {
  const toneClass = {
    blue: {
      wrap: "border-blue-100 bg-blue-50/50",
      value: "text-blue-600",
    },
    green: {
      wrap: "border-emerald-100 bg-emerald-50/50",
      value: "text-emerald-600",
    },
  };

  const selected = toneClass[tone] || toneClass.blue;

  return (
    <div className={`rounded-lg border px-4 py-3 ${selected.wrap}`}>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${selected.value}`}>{value}</div>
    </div>
  );
}
