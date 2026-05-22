"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Card, Button, Spin, Drawer, Tag } from "antd";
import {
  RobotOutlined,
  ReloadOutlined,
  CloseOutlined,
  HistoryOutlined,
  CalendarOutlined,
  RightOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getDataNoToken, getData } from "@/libs/fetch";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function isValidMetrics(payload) {
  return (
    payload &&
    typeof payload === "object" &&
    (Number.isFinite(Number(payload.check_in_rate)) ||
      Number.isFinite(Number(payload.survey_rate)))
  );
}

function parseAiResult(raw) {
  if (typeof raw !== "string") return { metrics: null, markdown: "" };
  const text = raw.trim();
  if (!text) return { metrics: null, markdown: "" };

  const segments = text.split(/\r?\n---\r?\n/);
  if (segments.length > 1) {
    const [firstBlock, ...rest] = segments;
    let metrics = null;
    try {
      const parsed = JSON.parse(firstBlock.trim());
      if (isValidMetrics(parsed)) metrics = parsed;
    } catch { /* keep null */ }
    const markdown = rest.join("\n---\n").trim();
    return { metrics, markdown: markdown || text };
  }

  try {
    const parsed = JSON.parse(text);
    if (isValidMetrics(parsed)) return { metrics: parsed, markdown: "" };
    if (typeof parsed?.analysis === "string")
      return { metrics: null, markdown: parsed.analysis };
  } catch { /* plain text */ }

  return { metrics: null, markdown: text };
}

function formatDateTime(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRateBadgeColor(rate) {
  if (rate >= 70) return "success";
  if (rate >= 40) return "warning";
  return "error";
}

// ─── RESPONSIVE DRAWER HOOK ───────────────────────────────────────────────────

function useDrawerConfig() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  // antd Drawer deprecated width/height — use size + rootStyle/style instead
  return isMobile
    ? { placement: "bottom", size: "default", rootStyle: { height: "85vh" } }
    : { placement: "right", size: "large", rootStyle: {} };
}

// ─── HISTORY DRAWER ITEM ──────────────────────────────────────────────────────

function HistoryItem({ item, isActive, onClick }) {
  const checkIn = Number(item.checkInRate ?? 0);
  const survey = Number(item.surveyRate ?? 0);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 hover:shadow-sm ${
        isActive
          ? "border-purple-400 bg-purple-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <CalendarOutlined />
            <span>{formatDateTime(item.createdAt)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Tag color={getRateBadgeColor(checkIn)} className="text-xs font-semibold rounded-full">
              Check-in {checkIn.toFixed(1)}%
            </Tag>
            <Tag color={getRateBadgeColor(survey)} className="text-xs font-semibold rounded-full">
              Survey {survey.toFixed(1)}%
            </Tag>
          </div>
        </div>
        <RightOutlined
          className={`mt-1 text-xs shrink-0 transition-colors ${
            isActive ? "text-purple-500" : "text-gray-300"
          }`}
        />
      </div>
    </button>
  );
}

// ─── RESULT MARKDOWN VIEW ─────────────────────────────────────────────────────

function ResultView({ rawResult, fromHistory, historyDate, onReanalyze, onClear }) {
  const parsed = useMemo(() => parseAiResult(rawResult), [rawResult]);
  return (
    <Card
      variant="borderless"
      className="rounded-xl border-2 border-purple-100 shadow-sm"
      title={
        <div className="flex items-center gap-2 text-base font-semibold text-[#7C3AED]">
          <RobotOutlined />
          {fromHistory ? (
            <span>
              ผลการวิเคราะห์&nbsp;
              <span className="text-sm font-normal text-gray-400">
                ({formatDateTime(historyDate)})
              </span>
            </span>
          ) : (
            "ผลการวิเคราะห์ประสิทธิภาพงาน"
          )}
        </div>
      }
      extra={
        <div className="flex items-center gap-2">
          <Button size="small" icon={<ReloadOutlined />} onClick={onReanalyze} className="text-gray-500">
            วิเคราะห์ใหม่
          </Button>
          <Button size="small" icon={<CloseOutlined />} onClick={onClear} className="text-gray-400" />
        </div>
      }
      styles={{ body: { padding: "16px 24px 24px" } }}
    >
      {parsed.metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {Number.isFinite(Number(parsed.metrics.check_in_rate)) && (
            <MetricCard label="Check-in Rate" value={`${Number(parsed.metrics.check_in_rate).toFixed(2)}%`} tone="blue" />
          )}
          {Number.isFinite(Number(parsed.metrics.survey_rate)) && (
            <MetricCard label="Survey Rate" value={`${Number(parsed.metrics.survey_rate).toFixed(2)}%`} tone="green" />
          )}
        </div>
      )}

      <div className="rounded-xl border border-purple-100 bg-white/70 overflow-x-auto">
        <div className="px-4 py-4 text-gray-700 leading-7">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold text-[#6D28D9] mt-5 mb-3 border-b border-purple-100 pb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-base font-semibold text-gray-900 mt-4 mb-2">{children}</h3>,
              p: ({ children }) => <p className="text-sm text-gray-700 mb-3">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">{children}</ol>,
              li: ({ children }) => <li className="text-gray-700">{children}</li>,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-purple-50 text-gray-700">{children}</thead>,
              th: ({ children }) => <th className="text-left px-3 py-2 border border-gray-200 font-semibold whitespace-nowrap">{children}</th>,
              td: ({ children }) => <td className="px-3 py-2 border border-gray-200 align-top">{children}</td>,
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
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AnalysisPanel({ eventId, eventData }) {
  // ── New analysis state ──
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // ── History state ──
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeHistoryItem, setActiveHistoryItem] = useState(null);

  // ── Responsive drawer config ──
  const drawerConfig = useDrawerConfig();

  // ─── Load history via GET /ai/analysis/:id ────────────────────────────────
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getData(`/ai/analysis/${eventId}`);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setHistory(sorted);
    } catch (err) {
      console.error("History load error:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ─── Trigger new analysis via GET /ai/summary/:id ────────────────────────
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveHistoryItem(null);

    try {
      const res = await getDataNoToken(`ai/summary/${eventId}`);
      setResult(typeof res === "string" ? res : JSON.stringify(res));
      await loadHistory();
    } catch (err) {
      console.error("Analysis error:", err);
      setError("เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // ─── Pick a history item to view ─────────────────────────────────────────
  const handleSelectHistory = (item) => {
    setActiveHistoryItem(item);
    setResult(null);
    setError(null);
    setDrawerOpen(false);
  };

  const handleClear = () => {
    setResult(null);
    setActiveHistoryItem(null);
    setError(null);
  };

  const hasHistory = history.length > 0;
  const displayedRaw = result ?? activeHistoryItem?.rawJsonResult ?? null;
  const isShowingResult = !!displayedRaw && !loading;

  return (
    <div className="mt-8 mb-4">

      {/* ─── Action row: always visible unless loading ─── */}
      {!loading && (
        <div
          className={`flex flex-col sm:flex-row items-center gap-3 ${
            isShowingResult ? "justify-start mb-4" : "justify-center"
          }`}
        >
          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            className="group flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)" }}
          >
            <RobotOutlined className="text-xl group-hover:animate-spin" />
            วิเคราะห์ประสิทธิภาพงาน (AI Analysis)
          </button>

          {/* History button — only if history exists */}
          {hasHistory && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold border-2 border-purple-200 text-purple-700 bg-white shadow-sm transition-all duration-200 hover:scale-105 hover:border-purple-400 hover:shadow-md active:scale-95"
            >
              <HistoryOutlined className="text-base" />
              ประวัติการวิเคราะห์
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                {history.length}
              </span>
            </button>
          )}
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
            <p className="text-gray-400 text-sm">AI กำลังวิเคราะห์ข้อมูลงาน...</p>
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
            <Button onClick={handleAnalyze} icon={<ReloadOutlined />} size="small">
              ลองอีกครั้ง
            </Button>
          </div>
        </Card>
      )}

      {/* ─── Result view (new analysis OR selected history item) ─── */}
      {isShowingResult && (
        <ResultView
          rawResult={displayedRaw}
          fromHistory={!!activeHistoryItem}
          historyDate={activeHistoryItem?.createdAt}
          onReanalyze={handleAnalyze}
          onClear={handleClear}
        />
      )}

      {/* ─── History Drawer — responsive placement + size ─── */}
      <Drawer
        title={
          <div className="flex items-center gap-2 text-[#7C3AED] font-bold">
            <HistoryOutlined />
            ประวัติการวิเคราะห์ AI
            <span className="ml-1 text-sm font-normal text-gray-400">
              ({history.length} รายการ)
            </span>
          </div>
        }
        placement={drawerConfig.placement}
        size={drawerConfig.size}
        rootStyle={drawerConfig.rootStyle}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          body: { padding: "16px", background: "#faf5ff", overflowY: "auto" },
          header: { background: "#f5f0ff", borderBottom: "1px solid #ede9fe" },
          wrapper: { maxWidth: "100vw", maxHeight: "100dvh" },
        }}
        footer={
          <div className="flex justify-center py-1">
            <button
              onClick={() => { setDrawerOpen(false); handleAnalyze(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white shadow transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)" }}
            >
              <RobotOutlined />
              วิเคราะห์ใหม่
            </button>
          </div>
        }
      >
        {historyLoading ? (
          <div className="flex justify-center py-12">
            <Spin />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <RobotOutlined className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">ยังไม่มีประวัติการวิเคราะห์</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                isActive={item.id === activeHistoryItem?.id}
                onClick={() => handleSelectHistory(item)}
              />
            ))}
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, tone = "blue" }) {
  const toneClass = {
    blue: { wrap: "border-blue-100 bg-blue-50/50", value: "text-blue-600" },
    green: { wrap: "border-emerald-100 bg-emerald-50/50", value: "text-emerald-600" },
  };
  const selected = toneClass[tone] || toneClass.blue;
  return (
    <div className={`rounded-lg border px-4 py-3 ${selected.wrap}`}>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${selected.value}`}>{value}</div>
    </div>
  );
}