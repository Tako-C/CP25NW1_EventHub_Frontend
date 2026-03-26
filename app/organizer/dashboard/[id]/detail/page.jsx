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
} from "@ant-design/icons";
import { getData, postUserCheckInDashboard } from "@/libs/fetch";
import { FormatDate } from "@/utils/format";

// Components & Columns
import StatCard from "@/components/Dashboard/components/StatCard";
import ResponsiveTable from "@/components/Dashboard/components/ResponsiveTable";
import { participantColumns, createSurveyColumns } from "@/components/Dashboard/libs/columns";

// Analysis
import AnalysisPanel from "@/components/Dashboard/components/AnalysisPanel";

// Charts
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
  AnswerRatioChart,
  SuggestionTable,
  ChartCard,
} from "../../../../../components/Dashboard/components/DashboardCharts";

const EVENT_THEMES = {
  tech: {
    key: "tech",
    label: "Technology",
    hero: "from-slate-900 via-blue-900 to-cyan-900",
    glowA: "bg-cyan-300/30",
    glowB: "bg-blue-300/25",
    glowC: "bg-indigo-300/20",
    accentBg: "bg-indigo-100",
    accentText: "text-indigo-700",
    subtitle: "text-blue-100/95",
    chartPalette: {
      primary: ["#2563EB", "#0EA5E9", "#8B5CF6"],
      accent: [
        "#06B6D4",
        "#3B82F6",
        "#8B5CF6",
        "#22C55E",
        "#EAB308",
        "#EC4899",
        "#14B8A6",
      ],
      pieRole: ["#2563EB", "#14B8A6", "#F97316"],
      pieGender: ["#0EA5E9", "#EC4899", "#22C55E"],
      survey: ["#0EA5E9", "#6366F1", "#14B8A6"],
      checkin: ["#0F766E", "#14B8A6", "#2DD4BF"],
      surveyExhibitor: ["#F97316", "#6366F1", "#14B8A6"],
      stack: ["#2563EB", "#CBD5E1"],
    },
    satisfaction: {
      visitor: "#2563EB",
      exhibitor: "#6366F1",
    },
  },
  fashion: {
    key: "fashion",
    label: "Fashion",
    hero: "from-slate-900 via-fuchsia-900 to-rose-900",
    glowA: "bg-fuchsia-300/30",
    glowB: "bg-pink-300/25",
    glowC: "bg-rose-300/25",
    accentBg: "bg-rose-100",
    accentText: "text-rose-700",
    subtitle: "text-pink-100/95",
    chartPalette: {
      primary: ["#EC4899", "#F43F5E", "#A855F7"],
      accent: [
        "#F43F5E",
        "#EC4899",
        "#A855F7",
        "#F59E0B",
        "#14B8A6",
        "#8B5CF6",
        "#FB7185",
      ],
      pieRole: ["#EC4899", "#A855F7", "#F97316"],
      pieGender: ["#F43F5E", "#8B5CF6", "#14B8A6"],
      survey: ["#EC4899", "#A855F7", "#F97316"],
      checkin: ["#BE185D", "#DB2777", "#F472B6"],
      surveyExhibitor: ["#A855F7", "#F43F5E", "#F59E0B"],
      stack: ["#EC4899", "#E2E8F0"],
    },
    satisfaction: {
      visitor: "#EC4899",
      exhibitor: "#A855F7",
    },
  },
  business: {
    key: "business",
    label: "Business",
    hero: "from-slate-900 via-indigo-900 to-slate-800",
    glowA: "bg-violet-300/35",
    glowB: "bg-cyan-300/30",
    glowC: "bg-amber-300/20",
    accentBg: "bg-indigo-100",
    accentText: "text-indigo-700",
    subtitle: "text-violet-100/95",
    chartPalette: {
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
      checkin: ["#0F766E", "#14B8A6", "#2DD4BF"],
      surveyExhibitor: ["#F97316", "#6366F1", "#14B8A6"],
      stack: ["#2563EB", "#CBD5E1"],
    },
    satisfaction: {
      visitor: "#2563EB",
      exhibitor: "#7C3AED",
    },
  },
};

export default function ExhibitionDashboard() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [participants, setParticipant] = useState([]);
  const [title, setTitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [eventMeta, setEventMeta] = useState({
    eventType: "",
    eventDetail: "",
    eventName: "",
  });

  // ─── Dashboard API state ───────────────────────────────────────────────────
  const [registrationData, setRegistrationData] = useState(null);   // dashboard/events/${id}/registrations
  const [checkinData, setCheckinData] = useState(null);             // dashboard/events/${id}/check-ins
  const [visitorSurveyStats, setVisitorSurveyStats] = useState(null); // dashboard/events/${id}/surveys/visitor/stats
  const [exhibitorSurveyStats, setExhibitorSurveyStats] = useState(null); // dashboard/events/${id}/surveys/exhibitor/stats
  const [visitorSurveyStatus, setVisitorSurveyStatus] = useState([]); // dashboard/events/${id}/surveys/visitor/status
  const [exhibitorSurveyStatus, setExhibitorSurveyStatus] = useState([]); // dashboard/events/${id}/surveys/exhibitor/status
  const [visitorSatisfaction, setVisitorSatisfaction] = useState([]); // dashboard/events/${id}/surveys/visitor/satisfaction
  const [exhibitorSatisfaction, setExhibitorSatisfaction] = useState([]); // dashboard/events/${id}/surveys/exhibitor/satisfaction
  const [textResponses, setTextResponses] = useState([]);           // dashboard/events/${id}/surveys/text-responses
  const [jobData, setJobData] = useState([]);                       // dashboard/events/${id}/jobs
  const [genderData, setGenderData] = useState([]);                 // dashboard/events/${id}/genders
  const [cityData, setCityData] = useState([]);                     // dashboard/events/${id}/cities
  const [ageData, setAgeData] = useState([]);                       // dashboard/events/${id}/ages
  const [roleData, setRoleData] = useState([]);                     // dashboard/events/${id}/roles

  // ─── Derived stats ────────────────────────────────────────────────────────
  const totalParticipants = registrationData?.totalParticipants ?? participants.length;
  const totalCheckedIn = checkinData?.totalCheckin ?? 0;
  const totalRegistration = registrationData?.totalRegistration ?? 0;
  const noShow = Math.max(totalParticipants - totalCheckedIn, 0);

  // Visitor survey counts from stats API
  const totalVisitorSurvey = visitorSurveyStats?.totalPreSurvey ?? visitorSurveyStatus.length;
  const visitorSubmitted =
    visitorSurveyStats?.totalBothSurveys ??
    visitorSurveyStatus.filter((s) => s.postSurveyDone).length;

  // Exhibitor survey counts from stats API
  const totalExhibitorSurvey = exhibitorSurveyStats?.totalPreSurvey ?? exhibitorSurveyStatus.length;
  const exhibitorSubmitted =
    exhibitorSurveyStats?.totalBothSurveys ??
    exhibitorSurveyStatus.filter((s) => s.postSurveyDone).length;

  const checkInRate = totalParticipants
    ? (totalCheckedIn / totalParticipants) * 100
    : 0;
  const visitorSubmitRate = totalVisitorSurvey
    ? (visitorSubmitted / totalVisitorSurvey) * 100
    : 0;
  const exhibitorSubmitRate = totalExhibitorSurvey
    ? (exhibitorSubmitted / totalExhibitorSurvey) * 100
    : 0;
  const totalSurvey = totalVisitorSurvey + totalExhibitorSurvey;
  const totalSubmitted = visitorSubmitted + exhibitorSubmitted;
  const overallSurveyRate = totalSurvey
    ? (totalSubmitted / totalSurvey) * 100
    : 0;

  // Survey status table data (transform to match existing table format)
  const surveyVisitorTable = useMemo(
    () =>
      visitorSurveyStatus.map((item, index) => ({
        ...item,
        key: `vis-${index}`,
        no: index + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        surveyType: "Post-Survey",
        status: item.postSurveyDone ? "SUBMITTED" : "PENDING",
      })),
    [visitorSurveyStatus],
  );

  const surveyExhibitorTable = useMemo(
    () =>
      exhibitorSurveyStatus.map((item, index) => ({
        ...item,
        key: `ex-${index}`,
        no: index + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        surveyType: "Post-Survey",
        status: item.postSurveyDone ? "SUBMITTED" : "PENDING",
      })),
    [exhibitorSurveyStatus],
  );

  const filteredParticipants = participants.filter((item) =>
    String(item.name || "")
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  );

  const activeTheme = useMemo(() => {
    const source =
      `${eventMeta.eventName} ${eventMeta.eventType} ${eventMeta.eventDetail}`.toLowerCase();

    if (/(fashion|style|runway|beauty|boutique|catwalk|design)/.test(source)) {
      return EVENT_THEMES.fashion;
    }
    if (
      /(tech|technology|software|digital|ai|innovation|developer|it|cyber)/.test(
        source,
      )
    ) {
      return EVENT_THEMES.tech;
    }
    return EVENT_THEMES.business;
  }, [eventMeta]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [, eventRes] = await Promise.all([
        getData("users/me/profile"),
        getData(`events/${id}`),
      ]);
      setTitle(eventRes?.data?.eventName);

      const eventTypeText =
        extractText(eventRes?.data?.eventType) ||
        extractText(eventRes?.data?.type) ||
        extractText(eventRes?.data?.eventCategory) ||
        extractText(eventRes?.data?.eventTypeName) ||
        "";
      const eventDetailText =
        extractText(eventRes?.data?.eventDetail) ||
        extractText(eventRes?.data?.description) ||
        "";
      setEventMeta({
        eventName: eventRes?.data?.eventName || "",
        eventType: eventTypeText,
        eventDetail: eventDetailText,
      });

      // ─── Fetch all dashboard APIs in parallel ───────────────────────────
      const [
        regRes,
        checkinRes,
        visitorStatsRes,
        exhibitorStatsRes,
        visitorStatusRes,
        exhibitorStatusRes,
        visitorSatisfactionRes,
        exhibitorSatisfactionRes,
        textRes,
        jobRes,
        genderRes,
        cityRes,
        ageRes,
        roleRes,
        checkInListRes,
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

      // ─── Set state from settled results ──────────────────────────────────
      if (regRes.status === "fulfilled")
        setRegistrationData(regRes.value?.data ?? null);

      if (checkinRes.status === "fulfilled")
        setCheckinData(checkinRes.value?.data ?? null);

      if (visitorStatsRes.status === "fulfilled")
        setVisitorSurveyStats(visitorStatsRes.value?.data ?? null);

      if (exhibitorStatsRes.status === "fulfilled")
        setExhibitorSurveyStats(exhibitorStatsRes.value?.data ?? null);

      if (visitorStatusRes.status === "fulfilled")
        setVisitorSurveyStatus(visitorStatusRes.value?.data ?? []);

      if (exhibitorStatusRes.status === "fulfilled")
        setExhibitorSurveyStatus(exhibitorStatusRes.value?.data ?? []);

      if (visitorSatisfactionRes.status === "fulfilled")
        setVisitorSatisfaction(visitorSatisfactionRes.value?.data ?? []);

      if (exhibitorSatisfactionRes.status === "fulfilled")
        setExhibitorSatisfaction(exhibitorSatisfactionRes.value?.data ?? []);

      if (textRes.status === "fulfilled")
        setTextResponses(textRes.value?.data ?? []);

      if (jobRes.status === "fulfilled")
        setJobData(jobRes.value?.data ?? []);

      if (genderRes.status === "fulfilled")
        setGenderData(genderRes.value?.data ?? []);

      if (cityRes.status === "fulfilled")
        setCityData(cityRes.value?.data ?? []);

      if (ageRes.status === "fulfilled")
        setAgeData(ageRes.value?.data ?? []);

      if (roleRes.status === "fulfilled")
        setRoleData(roleRes.value?.data ?? []);

      // ─── Participant list (check-in list) ─────────────────────────────
      if (
        checkInListRes.status === "fulfilled" &&
        Array.isArray(checkInListRes.value?.data)
      ) {
        setParticipant(
          checkInListRes.value.data.map((item, index) => ({
            ...item,
            key: index,
            no: index + 1,
          })),
        );
      } else {
        setParticipant([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const renderParticipantMobile = (item) => (
    <div
      key={item.key}
      className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <UserOutlined className="text-purple-500" /> {item.name}
          </h3>
          <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
            <MailOutlined /> {item.email}
          </p>
        </div>
        <span className="text-gray-400 text-xs font-mono">#{item.no}</span>
      </div>
      <div className="border-t border-gray-200 pt-3 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Registered:</span>
          <span>{FormatDate(item.registration_date, "datetime")}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Check-in:</span>
          {item.check_in_at ? (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircleOutlined /> {FormatDate(item.check_in_at, "datetime")}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </div>
    </div>
  );

  const renderSurveyMobile = (item) => (
    <div
      key={item.key}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-800">
          {item.firstName} {item.lastName}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}
        >
          {item.status}
        </span>
      </div>
      <div className="text-xs text-gray-500">{item.surveyType}</div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div
        className={`pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${activeTheme.glowA}`}
      />
      <div
        className={`pointer-events-none absolute top-80 -left-20 h-64 w-64 rounded-full blur-3xl ${activeTheme.glowB}`}
      />
      <div
        className={`pointer-events-none absolute bottom-20 right-0 h-72 w-72 rounded-full blur-3xl ${activeTheme.glowC}`}
      />

      <div className="relative max-w-7xl mx-auto p-3 md:p-6 lg:p-8 space-y-5 md:space-y-6">
        <RevealSection order={0}>
          <section
            className={`rounded-3xl border border-white/70 bg-gradient-to-br ${activeTheme.hero} text-white shadow-2xl p-4 sm:p-5 md:p-8`}
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                  <RiseOutlined />
                  EVENT PERFORMANCE CENTER
                </span>
                <h1 className="mt-2 md:mt-3 text-xl sm:text-2xl md:text-4xl font-black leading-tight">
                  {title || "Exhibition Name"}
                </h1>
                <p
                  className={`hidden sm:block mt-2 text-sm md:text-base max-w-2xl ${activeTheme.subtitle}`}
                >
                  ภาพรวมเชิงกลยุทธ์ของผู้เข้าร่วมงาน, การเช็กอิน,
                  การตอบแบบสอบถาม และผลวิเคราะห์จาก AI ในหน้าเดียว
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:min-w-[260px]">
                <BadgePill label="Participants" value={totalParticipants} />
                <BadgePill label="Checked-in" value={totalCheckedIn} />
                <BadgePill label="Visitor Submit" value={visitorSubmitted} />
                <BadgePill
                  label="Exhibitor Submit"
                  value={exhibitorSubmitted}
                />
              </div>
            </div>
          </section>
        </RevealSection>

        <RevealSection order={1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <CardKpi
              label="Check-in Rate"
              value={`${checkInRate.toFixed(2)}%`}
              tone="blue"
            />
            <CardKpi
              label="Visitor Submit Rate"
              value={`${visitorSubmitRate.toFixed(2)}%`}
              tone="teal"
            />
            <CardKpi
              label="Exhibitor Submit Rate"
              value={`${exhibitorSubmitRate.toFixed(2)}%`}
              tone="violet"
            />
            <CardKpi
              label="Survey Completion"
              value={`${overallSurveyRate.toFixed(2)}%`}
              tone="amber"
            />
          </div>
        </RevealSection>

        <RevealSection order={2}>
          <SectionHeading
            icon={<TeamOutlined />}
            title="Participants and Check-in"
            subtitle="ติดตามเส้นทางผู้เข้าร่วมตั้งแต่ลงทะเบียนจนถึงเช็กอิน"
            theme={activeTheme}
          />
        </RevealSection>

        <RevealSection order={3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <StatCard
              title="Total Registration"
              value={totalParticipants}
              valueColor="text-[#2563EB]"
            />
            <StatCard
              title="Total Checked-in"
              value={totalCheckedIn}
              valueColor="text-[#0F766E]"
            />
            <StatCard
              title="No-show"
              value={noShow}
              valueColor="text-[#DC2626]"
            />
          </div>
        </RevealSection>

        <RevealSection order={4}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
            <ChartCard title="Total Registration — แบ่งตามช่วงเวลา">
              <RegistrationByTimeChart
                palette={activeTheme.chartPalette}
                data={registrationData}
              />
            </ChartCard>
            <ChartCard title="Total Checked-in — แบ่งตามช่วงเวลา">
              <CheckinByTimeChart
                palette={activeTheme.chartPalette}
                data={checkinData}
              />
            </ChartCard>
          </div>
        </RevealSection>

        <RevealSection order={5}>
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
        </RevealSection>

        <RevealSection order={6}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 items-start">
            <ChartCard title="ช่วงอาชีพที่เข้าร่วม" className="self-start">
              <OccupationChart
                palette={activeTheme.chartPalette}
                data={jobData}
              />
            </ChartCard>
            <ChartCard title="กลุ่มจังหวัดที่เข้าร่วม" className="self-start">
              <ProvinceChart
                palette={activeTheme.chartPalette}
                data={cityData}
              />
            </ChartCard>
            <ChartCard
              title="สัดส่วน Staff / Visitor / Exhibitor"
              className="self-start"
            >
              <RolePieChart
                palette={activeTheme.chartPalette}
                data={roleData}
              />
            </ChartCard>
          </div>
        </RevealSection>

        <RevealSection order={7}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 items-start">
            <ChartCard title="ช่วงอายุ" className="self-start">
              <AgeChart palette={activeTheme.chartPalette} data={ageData} />
            </ChartCard>
            <ChartCard title="ช่วงเพศ" className="self-start">
              <GenderPieChart
                palette={activeTheme.chartPalette}
                data={genderData}
              />
            </ChartCard>
          </div>
        </RevealSection>

        <RevealSection order={8}>
          <SectionHeading
            icon={<FileTextOutlined />}
            title="Survey Progress"
            subtitle="เจาะลึกสถานะการส่งแบบสอบถามของ Visitor และ Exhibitor"
            theme={activeTheme}
          />
        </RevealSection>

        <RevealSection order={9}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
            {/* Visitor side */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <StatCard
                  title="Total Survey Visitor"
                  value={totalVisitorSurvey}
                  valueColor="text-[#2563EB]"
                />
                <StatCard
                  title="Visitor Submitted"
                  value={visitorSubmitted}
                  valueColor="text-[#16A34A]"
                />
              </div>

              <ChartCard title="Visitor Submitted — แบ่งตามช่วงเวลา">
                <VisitorSubmittedChart
                  palette={activeTheme.chartPalette}
                  data={visitorSurveyStats}
                />
              </ChartCard>

              <div className="pt-4 md:pt-4">
                <ResponsiveTable
                  title="Visitor Survey Status"
                  data={surveyVisitorTable}
                  columns={createSurveyColumns("blue")}
                  loading={loading}
                  renderMobileItem={renderSurveyMobile}
                  compactMobile={true}
                />
              </div>
            </div>

            {/* Exhibitor side */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <StatCard
                  title="Total Survey Exhibitor"
                  value={totalExhibitorSurvey}
                  valueColor="text-[#7C3AED]"
                />
                <StatCard
                  title="Exhibitor Submitted"
                  value={exhibitorSubmitted}
                  valueColor="text-[#16A34A]"
                />
              </div>

              <ChartCard title="Exhibitor Submitted — แบ่งตามช่วงเวลา">
                <ExhibitorSubmittedChart
                  palette={activeTheme.chartPalette}
                  data={exhibitorSurveyStats}
                />
              </ChartCard>

              <div className="pt-4 md:pt-4">
                <ResponsiveTable
                  title="Exhibitor Survey Status"
                  data={surveyExhibitorTable}
                  columns={createSurveyColumns("purple")}
                  loading={loading}
                  renderMobileItem={renderSurveyMobile}
                  compactMobile={true}
                />
              </div>
            </div>
          </div>
        </RevealSection>

        <RevealSection order={10}>
          <SectionHeading
            icon={<SmileOutlined />}
            title="Satisfaction and Answers"
            subtitle="วัดคุณภาพประสบการณ์ผ่านคะแนนความพึงพอใจและอัตราการตอบคำถาม"
            theme={activeTheme}
          />
        </RevealSection>

        <RevealSection order={11}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
            <SatisfactionWidget
              title="ความพึงพอใจ Visitor"
              data={visitorSatisfaction}
              color={activeTheme.satisfaction.visitor}
            />
            <SatisfactionWidget
              title="ความพึงพอใจ Exhibitor"
              data={exhibitorSatisfaction}
              color={activeTheme.satisfaction.exhibitor}
            />
          </div>
        </RevealSection>

        {/* <RevealSection order={12}>
          <ChartCard title="สัดส่วนคำตอบที่ตอบมาในแต่ละคำถาม">
            <AnswerRatioChart
              palette={activeTheme.chartPalette}
              data={null}
            />
          </ChartCard>
        </RevealSection> */}

        <RevealSection order={13}>
          <SectionHeading
            icon={<BulbOutlined />}
            title="Suggestion and AI Intelligence"
            subtitle="อ่านเสียงของผู้เข้าร่วมงานและให้ AI สรุปเป็น actionable insight"
            theme={activeTheme}
          />
        </RevealSection>

        <RevealSection order={14}>
          <SuggestionTable data={textResponses} />
        </RevealSection>

        <RevealSection order={15}>
          <AnalysisPanel eventId={id} eventData={{ eventName: title }} />
        </RevealSection>
      </div>
    </div>
  );
}

function CardKpi({ label, value, tone = "blue" }) {
  const toneMap = {
    blue: {
      badge: "bg-blue-100 text-blue-700",
      value: "text-blue-700",
      border: "border-blue-200",
      glow: "from-blue-500/15 to-cyan-400/5",
    },
    teal: {
      badge: "bg-teal-100 text-teal-700",
      value: "text-teal-700",
      border: "border-teal-200",
      glow: "from-teal-500/15 to-emerald-400/5",
    },
    violet: {
      badge: "bg-violet-100 text-violet-700",
      value: "text-violet-700",
      border: "border-violet-200",
      glow: "from-violet-500/15 to-indigo-400/5",
    },
    amber: {
      badge: "bg-amber-100 text-amber-700",
      value: "text-amber-700",
      border: "border-amber-200",
      glow: "from-amber-500/15 to-orange-400/5",
    },
  };

  const theme = toneMap[tone] || toneMap.blue;

  return (
    <div
      className={`relative overflow-hidden bg-white border ${theme.border} rounded-2xl shadow-sm p-4`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.glow}`}
      />
      <span
        className={`relative inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full ${theme.badge}`}
      >
        Insight KPI
      </span>
      <div className="relative mt-3 text-sm text-gray-500 font-semibold">
        {label}
      </div>
      <div
        className={`relative mt-1 text-3xl font-black tracking-tight ${theme.value}`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, subtitle, theme }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-sm px-4 py-3 shadow-sm ">
      <div className="flex items-center gap-3">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl text-base ${theme?.accentBg || "bg-indigo-100"} ${theme?.accentText || "text-indigo-700"}`}
        >
          {icon}
        </span>
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-800">
            {title}
          </h2>
          <p className="hidden sm:block text-sm text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function BadgePill({ label, value }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-wide text-violet-100/80 font-bold">
        {label}
      </div>
      <div className="text-base sm:text-lg font-black text-white mt-0.5">
        {value}
      </div>
    </div>
  );
}

function extractText(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    return Object.values(value)
      .filter((v) => typeof v === "string" || typeof v === "number")
      .join(" ");
  }
  return "";
}

function RevealSection({ children, order = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
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