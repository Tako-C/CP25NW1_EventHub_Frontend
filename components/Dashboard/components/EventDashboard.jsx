"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  BulbOutlined,
  SmileOutlined,
  CrownOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { getData, postUserCheckInDashboard } from "@/libs/fetch";
import { FormatDate } from "@/utils/format";

import StatCard from "@/components/Dashboard/components/StatCard";
import ResponsiveTable from "@/components/Dashboard/components/ResponsiveTable";
import {
  participantColumns,
  createSurveyColumns,
} from "@/components/Dashboard/libs/columns";
import AnalysisPanel from "@/components/Dashboard/components/AnalysisPanel";
import SurveyQuestionDashboard from "@/components/Dashboard/components/SurveyQuestionDashboard";

import {
  RegistrationByTimeChart,
  CheckinByTimeChart,
  OccupationChart,
  ProvinceChart,
  RolePieChart,
  AgeChart,
  GenderPieChart,
  VisitorSubmittedChart,
  ExhibitorSubmittedChart,
  SatisfactionWidget,
  SuggestionTable,
  SentimentDonutChart,
  ChartCard,
  PreSurveySubmittedChart,
} from "@/components/Dashboard/components/DashboardCharts";

// ─── Theme definitions (unchanged) ───────────────────────────────────────────
const EVENT_THEMES = {
  tech: {
    key: "tech", label: "Technology",
    hero: "from-slate-900 via-blue-900 to-cyan-900",
    glowA: "bg-cyan-300/30", glowB: "bg-blue-300/25", glowC: "bg-indigo-300/20",
    accentBg: "bg-indigo-100", accentText: "text-indigo-700",
    subtitle: "text-blue-100/95", mobileAccent: "#2563EB",
    chartPalette: {
      primary: ["#2563EB","#0EA5E9","#8B5CF6"],
      accent: ["#06B6D4","#3B82F6","#8B5CF6","#22C55E","#EAB308","#EC4899","#14B8A6"],
      pieRole: ["#2563EB","#14B8A6","#F97316"],
      pieGender: ["#0EA5E9","#EC4899","#22C55E"],
      survey: ["#0EA5E9","#6366F1","#14B8A6"],
      checkin: ["#0F766E","#14B8A6","#2DD4BF"],
      surveyExhibitor: ["#F97316","#6366F1","#14B8A6"],
      stack: ["#2563EB","#CBD5E1"],
    },
    satisfaction: { visitor: "#2563EB", exhibitor: "#6366F1" },
  },
  fashion: {
    key: "fashion", label: "Fashion",
    hero: "from-slate-900 via-fuchsia-900 to-rose-900",
    glowA: "bg-fuchsia-300/30", glowB: "bg-pink-300/25", glowC: "bg-rose-300/25",
    accentBg: "bg-rose-100", accentText: "text-rose-700",
    subtitle: "text-pink-100/95", mobileAccent: "#EC4899",
    chartPalette: {
      primary: ["#EC4899","#F43F5E","#A855F7"],
      accent: ["#F43F5E","#EC4899","#A855F7","#F59E0B","#14B8A6","#8B5CF6","#FB7185"],
      pieRole: ["#EC4899","#A855F7","#F97316"],
      pieGender: ["#F43F5E","#8B5CF6","#14B8A6"],
      survey: ["#EC4899","#A855F7","#F97316"],
      checkin: ["#BE185D","#DB2777","#F472B6"],
      surveyExhibitor: ["#A855F7","#F43F5E","#F59E0B"],
      stack: ["#EC4899","#E2E8F0"],
    },
    satisfaction: { visitor: "#EC4899", exhibitor: "#A855F7" },
  },
  business: {
    key: "business", label: "Business",
    hero: "from-slate-900 via-indigo-900 to-slate-800",
    glowA: "bg-violet-300/35", glowB: "bg-cyan-300/30", glowC: "bg-amber-300/20",
    accentBg: "bg-indigo-100", accentText: "text-indigo-700",
    subtitle: "text-violet-100/95", mobileAccent: "#6366F1",
    chartPalette: {
      primary: ["#2563EB","#0EA5E9","#8B5CF6"],
      accent: ["#F97316","#14B8A6","#A855F7","#EC4899","#22C55E","#EAB308","#3B82F6"],
      pieRole: ["#2563EB","#9333EA","#F97316"],
      pieGender: ["#0EA5E9","#F43F5E","#14B8A6"],
      survey: ["#14B8A6","#6366F1","#F97316"],
      checkin: ["#0F766E","#14B8A6","#2DD4BF"],
      surveyExhibitor: ["#F97316","#6366F1","#14B8A6"],
      stack: ["#2563EB","#CBD5E1"],
    },
    satisfaction: { visitor: "#2563EB", exhibitor: "#7C3AED" },
  },
};

// ─── MobileCollapsible ────────────────────────────────────────────────────────
// Wraps any mobile-only content with a tap-to-open/close header + smooth animation
function MobileCollapsible({ icon, title, theme, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? "auto" : "0px");

  // Measure and animate height
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (open) {
      // Expand: set to scrollHeight, then switch to "auto" so it grows naturally
      setHeight(`${el.scrollHeight}px`);
      const t = setTimeout(() => setHeight("auto"), 320);
      return () => clearTimeout(t);
    } else {
      // Collapse: pin to current height first, then animate to 0
      setHeight(`${el.scrollHeight}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight("0px"));
      });
    }
  }, [open]);

  return (
    // Only visible on mobile — desktop ignores this wrapper
    <div className="sm:hidden">
      {/* Tap header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm active:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-base flex-shrink-0 ${theme?.accentBg || "bg-indigo-100"} ${theme?.accentText || "text-indigo-700"}`}
          >
            {icon}
          </span>
          <span className="text-base font-black text-slate-800 text-left leading-tight">
            {title}
          </span>
        </div>
        <span
          className={`flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <DownOutlined style={{ fontSize: 11 }} />
        </span>
      </button>

      {/* Animated content */}
      <div
        ref={contentRef}
        style={{
          height,
          overflow: "hidden",
          transition: "height 320ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="pt-3 space-y-3">{children}</div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EventDashboard({ mode = "organizer" }) {
  const { id } = useParams();
  const isAdmin = mode === "admin";

  const [loading, setLoading] = useState(false);
  const [participants, setParticipant] = useState([]);
  const [title, setTitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [eventMeta, setEventMeta] = useState({ eventType: "", eventDetail: "", eventName: "" });

  const [registrationData, setRegistrationData] = useState(null);
  const [checkinData, setCheckinData] = useState(null);
  const [visitorSurveyStats, setVisitorSurveyStats] = useState(null);
  const [exhibitorSurveyStats, setExhibitorSurveyStats] = useState(null);
  const [visitorSurveyStatus, setVisitorSurveyStatus] = useState([]);
  const [exhibitorSurveyStatus, setExhibitorSurveyStatus] = useState([]);
  const [visitorSatisfaction, setVisitorSatisfaction] = useState([]);
  const [exhibitorSatisfaction, setExhibitorSatisfaction] = useState([]);
  const [textResponses, setTextResponses] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [preSurveyHourly, setPreSurveyHourly] = useState([]);
  const [visitorQuestions, setVisitorQuestions] = useState([]);
  const [exhibitorQuestions, setExhibitorQuestions] = useState([]);
  const [kpiData, setKpiData] = useState(null);

  const totalParticipants = registrationData?.totalParticipants ?? participants.length;
  const totalCheckedIn = checkinData?.totalCheckin ?? 0;
  const noShow = Math.max(totalParticipants - totalCheckedIn, 0);

  const totalVisitorSurvey = visitorSurveyStats?.visitorSubPreSurvey;
  const visitorSubmitted = visitorSurveyStats?.visitorSubPostSurvey;
  const totalExhibitorSurvey = exhibitorSurveyStats?.exhibitorSubPreSurvey;
  const exhibitorSubmitted = exhibitorSurveyStats?.exhibitorSubPostSurvey;

  const engagement = kpiData?.data?.engagement;
  const operational = kpiData?.data?.operational;

  const checkInRate = engagement?.totalRegistered
    ? (engagement.totalCheckedIn / engagement.totalRegistered) * 100 : 0;

  const totalSurveySum = (operational?.totalPostSurvey ?? 0) + (operational?.totalPreSurvey ?? 0);
  const visitorSubSum = (operational?.visitorSubPostSurvey ?? 0) + (operational?.visitorSubPreSurvey ?? 0);
  const visitorSubmitRate = totalSurveySum ? (visitorSubSum / totalSurveySum) * 100 : 0;
  const exhibitorSubSum = (operational?.exhibitorSubPostSurvey ?? 0) + (operational?.exhibitorSubPreSurvey ?? 0);
  const exhibitorSubmitRate = totalSurveySum ? (exhibitorSubSum / totalSurveySum) * 100 : 0;
  const submitCompletion = operational?.surveyCompletionRate ?? 0;

  const surveyVisitorTable = useMemo(
    () => visitorSurveyStatus.map((item, i) => ({ ...item, key: `vis-${i}`, no: i + 1, surveyType: "Post-Survey", status: item.postSurveyDone ? "SUBMITTED" : "PENDING" })),
    [visitorSurveyStatus],
  );
  const surveyExhibitorTable = useMemo(
    () => exhibitorSurveyStatus.map((item, i) => ({ ...item, key: `ex-${i}`, no: i + 1, surveyType: "Post-Survey", status: item.postSurveyDone ? "SUBMITTED" : "PENDING" })),
    [exhibitorSurveyStatus],
  );

  const filteredParticipants = participants.filter((item) =>
    String(item.name || "").toLowerCase().includes(searchText.toLowerCase()),
  );

  const activeTheme = useMemo(() => {
    const src = `${eventMeta.eventName} ${eventMeta.eventType} ${eventMeta.eventDetail}`.toLowerCase();
    if (/(fashion|style|runway|beauty|boutique|catwalk|design)/.test(src)) return EVENT_THEMES.fashion;
    if (/(tech|technology|software|digital|ai|innovation|developer|it|cyber)/.test(src)) return EVENT_THEMES.tech;
    return EVENT_THEMES.business;
  }, [eventMeta]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const eventRes = isAdmin
        ? await getData(`admin/events/${id}`)
        : (await Promise.all([getData("users/me/profile"), getData(`events/${id}`)]))[1];

      const testData = await getData(`/ai/analysis/${id}`);

      setTitle(eventRes?.data?.eventName);
      setEventMeta({
        eventName: eventRes?.data?.eventName || "",
        eventType: extractText(eventRes?.data?.eventType || eventRes?.data?.type || eventRes?.data?.eventCategory || ""),
        eventDetail: extractText(eventRes?.data?.eventDetail || eventRes?.data?.description || ""),
      });

      const [
        regRes, checkinRes, visitorStatsRes, exhibitorStatsRes,
        visitorStatusRes, exhibitorStatusRes, visitorSatRes, exhibitorSatRes,
        textRes, jobRes, genderRes, cityRes, ageRes, roleRes, checkInListRes,
      ] = await Promise.allSettled([
        getData(`dashboard/events/${id}/registrations`),
        getData(`dashboard/events/${id}/check-ins`),
        getData(`dashboard/events/${id}/surveys/visitor/stats`),
        getData(`dashboard/events/${id}/surveys/exhibitor/stats`),
        getData(`dashboard/events/${id}/surveys/visitor/status`),
        getData(`dashboard/events/${id}/surveys/exhibitor/status`),
        getData(`dashboard/events/${id}/surveys/visitor/satisfaction`),
        getData(`dashboard/events/${id}/surveys/exhibitor/satisfaction`),
        getData(`dashboard/events/${id}/surveys/text-responses`),
        getData(`dashboard/events/${id}/jobs`),
        getData(`dashboard/events/${id}/genders`),
        getData(`dashboard/events/${id}/cities`),
        getData(`dashboard/events/${id}/ages`),
        getData(`dashboard/events/${id}/roles`),
        postUserCheckInDashboard("list/check-in", id),
      ]);

      const kpiRes = await getData(`ai/kpi/events/${id}`);
      if (kpiRes) setKpiData(kpiRes);

      const testSurveyVisitor = await getData(`dashboard/events/${id}/surveys/visitor/questions`);
      const testSurveyExhibitor = await getData(`dashboard/events/${id}/surveys/exhibitor/questions`);
      if (testSurveyVisitor?.data) setVisitorQuestions(testSurveyVisitor.data);
      if (testSurveyExhibitor?.data) setExhibitorQuestions(testSurveyExhibitor.data);

      if (regRes.status === "fulfilled") setRegistrationData(regRes.value?.data ?? null);
      if (checkinRes.status === "fulfilled") setCheckinData(checkinRes.value?.data ?? null);
      if (visitorStatsRes.status === "fulfilled") setVisitorSurveyStats(visitorStatsRes.value?.data ?? null);
      if (exhibitorStatsRes.status === "fulfilled") setExhibitorSurveyStats(exhibitorStatsRes.value?.data ?? null);
      if (visitorStatusRes.status === "fulfilled") setVisitorSurveyStatus(visitorStatusRes.value?.data ?? []);
      if (exhibitorStatusRes.status === "fulfilled") setExhibitorSurveyStatus(exhibitorStatusRes.value?.data ?? []);
      if (visitorSatRes.status === "fulfilled") setVisitorSatisfaction(visitorSatRes.value?.data ?? []);
      if (exhibitorSatRes.status === "fulfilled") setExhibitorSatisfaction(exhibitorSatRes.value?.data ?? []);
      if (textRes.status === "fulfilled") setTextResponses(textRes.value?.data ?? []);
      if (jobRes.status === "fulfilled") setJobData(jobRes.value?.data ?? []);
      if (genderRes.status === "fulfilled") setGenderData(genderRes.value?.data ?? []);
      if (cityRes.status === "fulfilled") setCityData(cityRes.value?.data ?? []);
      if (ageRes.status === "fulfilled") setAgeData(ageRes.value?.data ?? []);
      if (roleRes.status === "fulfilled") setRoleData(roleRes.value?.data ?? []);

      if (checkInListRes.status === "fulfilled" && Array.isArray(checkInListRes.value?.data)) {
        const list = checkInListRes.value.data;
        setParticipant(list.map((item, i) => ({ ...item, key: i, no: i + 1 })));
        const hourBuckets = Array.from({ length: 24 }, (_, h) => {
          const start = String(h).padStart(2, "0");
          const end = String((h + 1) % 24).padStart(2, "0");
          return { hourRange: `${start}.00 - ${end}.00`, total: 0 };
        });
        list.forEach((item) => {
          const date = item.registration_date || item.createdAt;
          if (!date) return;
          const localDate = new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000);
          const hour = localDate.getUTCHours();
          if (hour >= 0 && hour < 24) hourBuckets[hour].total++;
        });
        setPreSurveyHourly(hourBuckets);
      } else {
        setParticipant([]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // ─── Mobile card renderers ────────────────────────────────────────────────
  const renderParticipantMobile = (item) => (
    <div key={item.key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: activeTheme.mobileAccent }}>
            {(item.name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate leading-tight">{item.name}</p>
            <p className="text-slate-400 text-xs truncate mt-0.5">{item.email}</p>
          </div>
        </div>
        <span className="flex-shrink-0 text-[10px] font-mono text-slate-300 mt-1">#{item.no}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">ลงทะเบียน</p>
          <p className="text-xs text-slate-600">{FormatDate(item.registration_date, "datetime")}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">เช็กอิน</p>
          {item.check_in_at ? (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircleOutlined style={{ fontSize: 10 }} />
              {FormatDate(item.check_in_at, "datetime")}
            </p>
          ) : (
            <p className="text-xs text-slate-300">—</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSurveyMobile = (item) => (
    <div key={item.key} className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">{item.firstName} {item.lastName}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{item.surveyType}</p>
      </div>
      <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${item.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
        {item.status}
      </span>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      {/* Background glows */}
      <div className={`pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${activeTheme.glowA}`} />
      <div className={`pointer-events-none absolute top-80 -left-20 h-64 w-64 rounded-full blur-3xl ${activeTheme.glowB}`} />
      <div className={`pointer-events-none absolute bottom-20 right-0 h-72 w-72 rounded-full blur-3xl ${activeTheme.glowC}`} />

      <div className="relative max-w-7xl mx-auto p-3 md:p-6 lg:p-8 space-y-3 md:space-y-6">

        {/* ═══════════════════════════════════════════
            HERO HEADER
        ═══════════════════════════════════════════ */}
        <RevealSection order={0}>
          {/* PC/Tablet hero — unchanged */}
          <section className={`hidden sm:block rounded-3xl border border-white/70 bg-gradient-to-br ${activeTheme.hero} text-white shadow-2xl p-5 md:p-8`}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                    <RiseOutlined /> EVENT PERFORMANCE CENTER
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300 tracking-wide">
                      <CrownOutlined /> ADMIN VIEW
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-2xl md:text-4xl font-black leading-tight">{title || "Exhibition Name"}</h1>
                <p className={`mt-2 text-sm md:text-base max-w-2xl ${activeTheme.subtitle}`}>
                  ภาพรวมเชิงกลยุทธ์ของผู้เข้าร่วมงาน, การเช็กอิน, การตอบแบบสอบถาม และผลวิเคราะห์จาก AI ในหน้าเดียว
                </p>
              </div>
            </div>
          </section>

          {/* Mobile hero — compact */}
          <section className={`sm:hidden rounded-2xl bg-gradient-to-br ${activeTheme.hero} text-white shadow-xl overflow-hidden`}>
            <div className="px-4 pt-4 pb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
                  <RiseOutlined style={{ fontSize: 9 }} /> Performance
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/40 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                    <CrownOutlined style={{ fontSize: 9 }} /> Admin
                  </span>
                )}
              </div>
              <h1 className="text-lg font-black leading-snug text-white">{title || "Exhibition Name"}</h1>
            </div>
          </section>
        </RevealSection>

        {/* ═══════════════════════════════════════════
            KPI STRIP
        ═══════════════════════════════════════════ */}
        <RevealSection order={1}>
          {/* PC/Tablet KPI — unchanged */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <CardKpi label="Check-in Rate" value={`${checkInRate.toFixed(2)}%`} tone="blue" />
            <CardKpi label="Visitor Submit Rate" value={`${visitorSubmitRate.toFixed(2)}%`} tone="teal" />
            <CardKpi label="Exhibitor Submit Rate" value={`${exhibitorSubmitRate.toFixed(2)}%`} tone="violet" />
            <CardKpi label="Survey Completion" value={`${submitCompletion.toFixed(2)}%`} tone="amber" />
          </div>

          {/* Mobile KPI — 2x2 grid */}
          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            {[
              { label: "Check-in Rate", value: `${checkInRate.toFixed(1)}%`, color: "#2563EB", bg: "#EFF6FF" },
              { label: "Visitor Submit", value: `${visitorSubmitRate.toFixed(1)}%`, color: "#0F766E", bg: "#F0FDFA" },
              { label: "Exhibitor Submit", value: `${exhibitorSubmitRate.toFixed(1)}%`, color: "#7C3AED", bg: "#F5F3FF" },
              { label: "Completion", value: `${submitCompletion.toFixed(1)}%`, color: "#B45309", bg: "#FFFBEB" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl px-4 py-3" style={{ background: kpi.bg }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: kpi.color, opacity: 0.7 }}>{kpi.label}</p>
                <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ═══════════════════════════════════════════
            SECTION 1 — Participants & Check-in
        ═══════════════════════════════════════════ */}

        {/* PC/Tablet heading — static */}
        <RevealSection order={2}>
          <div className="hidden sm:block">
            <SectionHeading icon={<TeamOutlined />} title="Participants and Check-in" subtitle="ติดตามเส้นทางผู้เข้าร่วมตั้งแต่ลงทะเบียนจนถึงเช็กอิน" theme={activeTheme} />
          </div>
        </RevealSection>

        {/* PC/Tablet content */}
        <RevealSection order={3}>
          <div className="hidden sm:grid sm:grid-cols-3 gap-3 md:gap-4">
            <StatCard title="Total Registration" value={totalParticipants} valueColor="text-[#2563EB]" />
            <StatCard title="Total Checked-in" value={totalCheckedIn} valueColor="text-[#0F766E]" />
            <StatCard title="Not Checked-in" value={noShow} valueColor="text-[#DC2626]" />
          </div>
        </RevealSection>

        <RevealSection order={4}>
          <div className="hidden sm:grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
            <ChartCard title="Total Registration — แบ่งตามช่วงเวลา">
              <RegistrationByTimeChart palette={activeTheme.chartPalette} data={registrationData} />
            </ChartCard>
            <ChartCard title="Total Checked-in — แบ่งตามช่วงเวลา">
              <CheckinByTimeChart palette={activeTheme.chartPalette} data={checkinData} />
            </ChartCard>
          </div>
        </RevealSection>

        <RevealSection order={5}>
          <div className="hidden sm:block">
            <ResponsiveTable
              title="Participants"
              data={filteredParticipants}
              columns={participantColumns}
              loading={loading}
              searchable={true}
              searchText={searchText}
              onSearch={(e) => setSearchText(e.target.value)}
              renderMobileItem={renderParticipantMobile}
              compactMobile={true}
            />
          </div>
        </RevealSection>

        {/* ── Mobile collapsible — Participants ── */}
        <RevealSection order={3}>
          <MobileCollapsible icon={<TeamOutlined />} title="Participants and Check-in" theme={activeTheme} defaultOpen={true}>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "ลงทะเบียน", value: totalParticipants, color: "#2563EB", bg: "#EFF6FF" },
                { label: "เช็กอินแล้ว", value: totalCheckedIn, color: "#0F766E", bg: "#F0FDFA" },
                { label: "ยังไม่เช็กอิน", value: noShow, color: "#DC2626", bg: "#FEF2F2" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.bg }}>
                  <p className="text-[9px] font-bold uppercase tracking-wide mb-1 opacity-60" style={{ color: s.color }}>{s.label}</p>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value ?? "—"}</p>
                </div>
              ))}
            </div>
            {/* Charts */}
            <ChartCard title="Registration — ตามช่วงเวลา">
              <RegistrationByTimeChart palette={activeTheme.chartPalette} data={registrationData} />
            </ChartCard>
            <ChartCard title="Check-in — ตามช่วงเวลา">
              <CheckinByTimeChart palette={activeTheme.chartPalette} data={checkinData} />
            </ChartCard>
            {/* Table */}
            <ResponsiveTable
              title="Participants"
              data={filteredParticipants}
              columns={participantColumns}
              loading={loading}
              searchable={true}
              searchText={searchText}
              onSearch={(e) => setSearchText(e.target.value)}
              renderMobileItem={renderParticipantMobile}
              compactMobile={true}
            />
          </MobileCollapsible>
        </RevealSection>

        {/* ═══════════════════════════════════════════
            SECTION 2 — Demographics
        ═══════════════════════════════════════════ */}

        {/* PC/Tablet */}
        <RevealSection order={6}>
          <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 items-start">
            <ChartCard title="ช่วงอาชีพที่เข้าร่วม" className="self-start">
              <OccupationChart palette={activeTheme.chartPalette} data={jobData} />
            </ChartCard>
            <ChartCard title="กลุ่มจังหวัดที่เข้าร่วม" className="self-start">
              <ProvinceChart palette={activeTheme.chartPalette} data={cityData} />
            </ChartCard>
            <ChartCard title="สัดส่วน Staff / Visitor / Exhibitor" className="self-start">
              <RolePieChart palette={activeTheme.chartPalette} data={roleData} />
            </ChartCard>
          </div>
        </RevealSection>

        <RevealSection order={7}>
          <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 items-start">
            <ChartCard title="ช่วงอายุ" className="self-start">
              <AgeChart palette={activeTheme.chartPalette} data={ageData} />
            </ChartCard>
            <ChartCard title="ช่วงเพศ" className="self-start">
              <GenderPieChart palette={activeTheme.chartPalette} data={genderData} />
            </ChartCard>
          </div>
        </RevealSection>

        {/* Mobile collapsible — Demographics */}
        <RevealSection order={6}>
          <MobileCollapsible icon={<TeamOutlined />} title="Demographics" theme={activeTheme} defaultOpen={false}>
            <ChartCard title="ช่วงอาชีพที่เข้าร่วม">
              <OccupationChart palette={activeTheme.chartPalette} data={jobData} />
            </ChartCard>
            <ChartCard title="กลุ่มจังหวัดที่เข้าร่วม">
              <ProvinceChart palette={activeTheme.chartPalette} data={cityData} />
            </ChartCard>
            <ChartCard title="Staff / Visitor / Exhibitor">
              <RolePieChart palette={activeTheme.chartPalette} data={roleData} />
            </ChartCard>
            <ChartCard title="ช่วงอายุ">
              <AgeChart palette={activeTheme.chartPalette} data={ageData} />
            </ChartCard>
            <ChartCard title="ช่วงเพศ">
              <GenderPieChart palette={activeTheme.chartPalette} data={genderData} />
            </ChartCard>
          </MobileCollapsible>
        </RevealSection>

        {/* ═══════════════════════════════════════════
            SECTION 3 — Survey Progress
        ═══════════════════════════════════════════ */}

        {/* PC/Tablet heading */}
        <RevealSection order={8}>
          <div className="hidden sm:block">
            <SectionHeading icon={<FileTextOutlined />} title="Survey Progress" subtitle="เจาะลึกสถานะการส่งแบบสอบถามของ Visitor และ Exhibitor" theme={activeTheme} />
          </div>
        </RevealSection>

        {/* PC/Tablet content */}
        <RevealSection order={9}>
          <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <StatCard title="Total Survey Visitor" value={totalVisitorSurvey} valueColor="text-[#2563EB]" />
                <StatCard title="Visitor Submitted" value={visitorSubmitted} valueColor="text-[#16A34A]" />
              </div>
              <ChartCard title="Visitor Submitted — แบ่งตามช่วงเวลา">
                <VisitorSubmittedChart palette={activeTheme.chartPalette} data={visitorSurveyStats} />
              </ChartCard>
              <div className="pt-4">
                <ResponsiveTable title="Visitor Survey Status" data={surveyVisitorTable} columns={createSurveyColumns("blue")} loading={loading} renderMobileItem={renderSurveyMobile} compactMobile={true} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <StatCard title="Total Survey Exhibitor" value={totalExhibitorSurvey} valueColor="text-[#7C3AED]" />
                <StatCard title="Exhibitor Submitted" value={exhibitorSubmitted} valueColor="text-[#16A34A]" />
              </div>
              <ChartCard title="Exhibitor Submitted — แบ่งตามช่วงเวลา">
                <ExhibitorSubmittedChart palette={activeTheme.chartPalette} data={exhibitorSurveyStats} />
              </ChartCard>
              <div className="pt-4">
                <ResponsiveTable title="Exhibitor Survey Status" data={surveyExhibitorTable} columns={createSurveyColumns("purple")} loading={loading} renderMobileItem={renderSurveyMobile} compactMobile={true} />
              </div>
            </div>
          </div>
        </RevealSection>

        {/* PC/Tablet — Survey question breakdown */}
        <RevealSection order={9}>
          <div className="hidden sm:block">
            <SurveyQuestionDashboard
              visitorPreData={visitorQuestions.filter((q) => q.surveyType === "PRE_VISITOR")}
              visitorPostData={visitorQuestions.filter((q) => q.surveyType === "POST_VISITOR")}
              exhibitorPostData={exhibitorQuestions.filter((q) => q.surveyType === "POST_EXHIBITOR")}
            />
          </div>
        </RevealSection>

        {/* Mobile collapsible — Survey Progress */}
        <RevealSection order={8}>
          <MobileCollapsible icon={<FileTextOutlined />} title="Survey Progress" theme={activeTheme} defaultOpen={false}>
            <MobileSurveySection
              visitorSurveyStats={visitorSurveyStats}
              exhibitorSurveyStats={exhibitorSurveyStats}
              totalVisitorSurvey={totalVisitorSurvey}
              visitorSubmitted={visitorSubmitted}
              totalExhibitorSurvey={totalExhibitorSurvey}
              exhibitorSubmitted={exhibitorSubmitted}
              surveyVisitorTable={surveyVisitorTable}
              surveyExhibitorTable={surveyExhibitorTable}
              loading={loading}
              palette={activeTheme.chartPalette}
              renderSurveyMobile={renderSurveyMobile}
            />
            <SurveyQuestionDashboard
              visitorPreData={visitorQuestions.filter((q) => q.surveyType === "PRE_VISITOR")}
              visitorPostData={visitorQuestions.filter((q) => q.surveyType === "POST_VISITOR")}
              exhibitorPostData={exhibitorQuestions.filter((q) => q.surveyType === "POST_EXHIBITOR")}
            />
          </MobileCollapsible>
        </RevealSection>

        {/* ═══════════════════════════════════════════
            SECTION 4 — Satisfaction
        ═══════════════════════════════════════════ */}

        {/* PC/Tablet heading */}
        <RevealSection order={10}>
          <div className="hidden sm:block">
            <SectionHeading icon={<SmileOutlined />} title="Satisfaction and Answers" subtitle="วัดคุณภาพประสบการณ์ผ่านคะแนนความพึงพอใจและอัตราการตอบคำถาม" theme={activeTheme} />
          </div>
        </RevealSection>

        {/* PC/Tablet content */}
        <RevealSection order={11}>
          <div className="hidden sm:grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
            <SatisfactionWidget title="ความพึงพอใจ Visitor" data={visitorSatisfaction} color={activeTheme.satisfaction.visitor} />
            <SatisfactionWidget title="ความพึงพอใจ Exhibitor" data={exhibitorSatisfaction} color={activeTheme.satisfaction.exhibitor} />
          </div>
        </RevealSection>

        {/* Mobile collapsible — Satisfaction */}
        <RevealSection order={10}>
          <MobileCollapsible icon={<SmileOutlined />} title="Satisfaction and Answers" theme={activeTheme} defaultOpen={false}>
            <SatisfactionWidget title="ความพึงพอใจ Visitor" data={visitorSatisfaction} color={activeTheme.satisfaction.visitor} />
            <SatisfactionWidget title="ความพึงพอใจ Exhibitor" data={exhibitorSatisfaction} color={activeTheme.satisfaction.exhibitor} />
          </MobileCollapsible>
        </RevealSection>

        {/* ═══════════════════════════════════════════
            SECTION 5 — Suggestion & AI
        ═══════════════════════════════════════════ */}

        {/* PC/Tablet heading */}
        <RevealSection order={12}>
          <div className="hidden sm:block">
            <SectionHeading icon={<BulbOutlined />} title="Suggestion and AI Intelligence" subtitle="อ่านเสียงของผู้เข้าร่วมงานและให้ AI สรุปเป็น actionable insight" theme={activeTheme} />
          </div>
        </RevealSection>

        {/* PC/Tablet content */}
        <RevealSection order={13}>
          <div className="hidden sm:grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 items-start">
            <ChartCard title="Sentiment Overview — บทสรุปความรู้สึกผู้ตอบ">
              <SentimentDonutChart data={textResponses} />
            </ChartCard>
            <ChartCard title="คำแนะนำแยกตาม Keyword & Sentiment" className="self-start">
              <p className="text-sm text-slate-500 leading-relaxed">ใช้ตัวกรองด้านล่างเพื่อเจาะลึกแต่ละหมวด keyword และ sentiment</p>
            </ChartCard>
          </div>
        </RevealSection>

        <RevealSection order={14}>
          <div className="hidden sm:block">
            <SuggestionTable data={textResponses} />
          </div>
        </RevealSection>

        <RevealSection order={15}>
          <div className="hidden sm:block">
            <AnalysisPanel eventId={id} eventData={{ eventName: title }} />
          </div>
        </RevealSection>

        {/* Mobile collapsible — Suggestion & AI */}
        <RevealSection order={12}>
          <MobileCollapsible icon={<BulbOutlined />} title="Suggestion & AI Intelligence" theme={activeTheme} defaultOpen={false}>
            <ChartCard title="Sentiment Overview">
              <SentimentDonutChart data={textResponses} />
            </ChartCard>
            <SuggestionTable data={textResponses} />
            <AnalysisPanel eventId={id} eventData={{ eventName: title }} />
          </MobileCollapsible>
        </RevealSection>

      </div>
    </div>
  );
}

// ─── Mobile Survey tab switcher ───────────────────────────────────────────────
function MobileSurveySection({
  visitorSurveyStats, exhibitorSurveyStats,
  totalVisitorSurvey, visitorSubmitted,
  totalExhibitorSurvey, exhibitorSubmitted,
  surveyVisitorTable, surveyExhibitorTable,
  loading, palette, renderSurveyMobile,
}) {
  const [tab, setTab] = useState("visitor");
  const isVisitor = tab === "visitor";

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="grid grid-cols-2 bg-white rounded-2xl border border-slate-100 p-1 shadow-sm gap-1">
        {["visitor", "exhibitor"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? "bg-slate-800 text-white shadow-sm" : "text-slate-400"}`}
          >
            {t === "visitor" ? "Visitor" : "Exhibitor"}
          </button>
        ))}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-400 mb-1">Total Survey</p>
          <p className="text-2xl font-black text-blue-700">{isVisitor ? (totalVisitorSurvey ?? "—") : (totalExhibitorSurvey ?? "—")}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 mb-1">Submitted</p>
          <p className="text-2xl font-black text-emerald-700">{isVisitor ? (visitorSubmitted ?? "—") : (exhibitorSubmitted ?? "—")}</p>
        </div>
      </div>
      {/* Chart */}
      <ChartCard title={`${isVisitor ? "Visitor" : "Exhibitor"} Submitted — ตามช่วงเวลา`}>
        {isVisitor
          ? <VisitorSubmittedChart palette={palette} data={visitorSurveyStats} />
          : <ExhibitorSubmittedChart palette={palette} data={exhibitorSurveyStats} />
        }
      </ChartCard>
      {/* Table */}
      <ResponsiveTable
        title={`${isVisitor ? "Visitor" : "Exhibitor"} Survey Status`}
        data={isVisitor ? surveyVisitorTable : surveyExhibitorTable}
        columns={createSurveyColumns(isVisitor ? "blue" : "purple")}
        loading={loading}
        renderMobileItem={renderSurveyMobile}
        compactMobile={true}
      />
    </div>
  );
}

// ─── CardKpi — PC/Tablet only ─────────────────────────────────────────────────
function CardKpi({ label, value, tone = "blue" }) {
  const toneMap = {
    blue: { badge: "bg-blue-100 text-blue-700", value: "text-blue-700", border: "border-blue-200", glow: "from-blue-500/15 to-cyan-400/5" },
    teal: { badge: "bg-teal-100 text-teal-700", value: "text-teal-700", border: "border-teal-200", glow: "from-teal-500/15 to-emerald-400/5" },
    violet: { badge: "bg-violet-100 text-violet-700", value: "text-violet-700", border: "border-violet-200", glow: "from-violet-500/15 to-indigo-400/5" },
    amber: { badge: "bg-amber-100 text-amber-700", value: "text-amber-700", border: "border-amber-200", glow: "from-amber-500/15 to-orange-400/5" },
  };
  const theme = toneMap[tone] || toneMap.blue;
  return (
    <div className={`relative overflow-hidden bg-white border ${theme.border} rounded-2xl shadow-sm p-4`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`} />
      <span className={`relative inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full ${theme.badge}`}>Insight KPI</span>
      <div className="relative mt-3 text-sm text-gray-500 font-semibold">{label}</div>
      <div className={`relative mt-1 text-3xl font-black tracking-tight ${theme.value}`}>{value}</div>
    </div>
  );
}

// ─── SectionHeading — PC/Tablet only ─────────────────────────────────────────
function SectionHeading({ icon, title, subtitle, theme }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl text-base ${theme?.accentBg || "bg-indigo-100"} ${theme?.accentText || "text-indigo-700"}`}>
          {icon}
        </span>
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-800">{title}</h2>
          <p className="hidden sm:block text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function extractText(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    return Object.values(value).filter((v) => typeof v === "string" || typeof v === "number").join(" ");
  }
  return "";
}

function RevealSection({ children, order = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); observer.unobserve(e.target); } }),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(14px)",
        transition: `opacity 520ms ease-out ${order * 55}ms, transform 520ms ease-out ${order * 55}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
