"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  UserOutlined,
  MailOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getData, postUserCheckInDashboard } from "@/libs/fetch";
import { FormatDate } from "@/utils/format";

// Components & Columns
import StatCard from "./components/StatCard";
import ResponsiveTable from "./components/ResponsiveTable";
import { participantColumns, createSurveyColumns } from "./libs/columns";

// Analysis
import AnalysisPanel from "./components/AnalysisPanel";

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
} from "./components/DashboardCharts";

export default function ExhibitionDashboard() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [participants, setParticipant] = useState([]);
  const [title, setTitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [surveyVisitor, setSurveyVisitor] = useState([]);
  const [surveyExhibitor, setSurveyExhibitor] = useState([]);

  const totalCheckedIn = participants.filter(
    (item) => String(item.status || "").toUpperCase() === "CHECK_IN",
  ).length;
  const filteredParticipants = participants.filter((item) =>
    String(item.name || "")
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  );
  const visitorSubmitted = surveyVisitor.filter(
    (s) => s.status === "SUBMITTED",
  ).length;
  const exhibitorSubmitted = surveyExhibitor.filter(
    (s) => s.status === "SUBMITTED",
  ).length;
  const checkInRate = participants.length
    ? (totalCheckedIn / participants.length) * 100
    : 0;
  const visitorSubmitRate = surveyVisitor.length
    ? (visitorSubmitted / surveyVisitor.length) * 100
    : 0;
  const exhibitorSubmitRate = surveyExhibitor.length
    ? (exhibitorSubmitted / surveyExhibitor.length) * 100
    : 0;
  const totalSurvey = surveyVisitor.length + surveyExhibitor.length;
  const totalSubmitted = visitorSubmitted + exhibitorSubmitted;
  const overallSurveyRate = totalSurvey
    ? (totalSubmitted / totalSurvey) * 100
    : 0;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProfile, eventRes] = await Promise.all([
        getData("users/me/profile"),
        getData(`events/${id}`),
      ]);
      setTitle(eventRes?.data?.eventName);

      const getSurveyData = async (type) => {
        const isPre = type === "Pre";
        if (!eventRes?.data?.[isPre ? "hasPreSurvey" : "hasPostSurvey"])
          return [];
        const endpoint = isPre ? "pre" : "post";
        const surveyConfig = await getData(`events/${id}/surveys/${endpoint}`);
        const activeVisitor = surveyConfig.data?.visitor?.find(
          (v) => v.status === "ACTIVE",
        );
        const activeExhibitor = surveyConfig.data?.exhibitor?.find(
          (e) => e.status === "ACTIVE",
        );
        const visitorId = activeVisitor?.id;
        const exhibitorId = activeExhibitor?.id;
        const [visRes, exRes] = await Promise.all([
          visitorId
            ? getData(
                `events/${id}/surveys/${visitorId}/submission-status/visitor`,
              )
            : Promise.resolve(null),
          exhibitorId
            ? getData(
                `events/${id}/surveys/${exhibitorId}/submission-status/exhibitor`,
              )
            : Promise.resolve(null),
        ]);
        let results = [];
        if (Array.isArray(visRes))
          results.push(
            ...visRes.map((item, idx) => ({
              ...item,
              key: `${type.toLowerCase()}-vis-${item.memberEventId || idx}`,
              surveyType: `${type}-Survey`,
              role: "VISITOR",
            })),
          );
        if (Array.isArray(exRes))
          results.push(
            ...exRes.map((item, idx) => ({
              ...item,
              key: `${type.toLowerCase()}-ex-${idx}`,
              surveyType: `${type}-Survey`,
              role: "EXHIBITOR",
            })),
          );
        return results;
      };

      const checkInPromise = postUserCheckInDashboard("list/check-in", id);
      const [resListUser, preSurveyData, postSurveyData] = await Promise.all([
        checkInPromise,
        getSurveyData("Pre"),
        getSurveyData("Post"),
      ]);

      const allSurveys = [...preSurveyData, ...postSurveyData];
      const allVisitors = allSurveys.filter((s) => s.role === "VISITOR");
      const allExhibitors = allSurveys.filter((s) => s.role === "EXHIBITOR");
      setSurveyVisitor(
        allVisitors.map((item, index) => ({ ...item, no: index + 1 })),
      );
      setSurveyExhibitor(
        allExhibitors.map((item, index) => ({ ...item, no: index + 1 })),
      );
      if (Array.isArray(resListUser?.data)) {
        setParticipant(
          resListUser.data.map((item, index) => ({
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
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#7C3AED] mb-6">
        {title || "Exhibition Name"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* ══════════════════════════════════════════════════
          SECTION 1: Participant Check-in
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Registration"
          value={participants.length}
          valueColor="text-[#6366F1]"
        />
        <StatCard
          title="Total Checked-in"
          value={totalCheckedIn}
          valueColor="text-[#6366F1]"
        />
      </div>

      {/* Registration by Time Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Total Registration — แบ่งตามช่วงเวลา">
          <RegistrationByTimeChart />
        </ChartCard>
        <ChartCard title="Total Checked-in — แบ่งตามช่วงเวลา">
          <CheckinByTimeChart />
        </ChartCard>
      </div>

      {/* Participants Table */}
      <ResponsiveTable
        title="Participants"
        data={filteredParticipants}
        columns={participantColumns}
        loading={loading}
        searchable={true}
        searchText={searchText}
        onSearch={(e) => setSearchText(e.target.value)}
        renderMobileItem={renderParticipantMobile}
      />

      {/* Occupation / Province / Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <ChartCard title="ช่วงอาชีพที่เข้าร่วม">
          <OccupationChart />
        </ChartCard>
        <ChartCard title="กลุ่มจังหวัดที่เข้าร่วม">
          <ProvinceChart />
        </ChartCard>
      </div>

      {/* Role Pie / Age / Gender */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
        <ChartCard title="สัดส่วน Staff / Visitor / Exhibitor">
          <RolePieChart />
        </ChartCard>
        <ChartCard title="ช่วงอายุ">
          <AgeChart />
        </ChartCard>
        <ChartCard title="ช่วงเพศ">
          <GenderPieChart />
        </ChartCard>
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 2: Visitor Survey
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-4">
        <StatCard
          title="Total Survey Visitor"
          value={surveyVisitor.length}
          valueColor="text-blue-600"
        />
        <StatCard
          title="Visitor Submitted"
          value={visitorSubmitted}
          valueColor="text-green-500"
        />
      </div>

      <ChartCard
        title="Visitor Submitted — แบ่งตามประเภทและช่วงเวลา"
        className="mb-4"
      >
        <VisitorSubmittedChart />
      </ChartCard>

      <ResponsiveTable
        title="Visitor Survey Status"
        data={surveyVisitor}
        columns={createSurveyColumns("blue")}
        loading={loading}
        renderMobileItem={renderSurveyMobile}
      />

      {/* ══════════════════════════════════════════════════
          SECTION 3: Exhibitor Survey
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-4">
        <StatCard
          title="Total Survey Exhibitor"
          value={surveyExhibitor.length}
          valueColor="text-purple-600"
        />
        <StatCard
          title="Exhibitor Submitted"
          value={exhibitorSubmitted}
          valueColor="text-green-500"
        />
      </div>

      <ChartCard
        title="Exhibitor Submitted — แบ่งตามประเภทและช่วงเวลา"
        className="mb-4"
      >
        <ExhibitorSubmittedChart />
      </ChartCard>

      <ResponsiveTable
        title="Exhibitor Survey Status"
        data={surveyExhibitor}
        columns={createSurveyColumns("purple")}
        loading={loading}
        renderMobileItem={renderSurveyMobile}
      />

      {/* ══════════════════════════════════════════════════
          SECTION 4: Satisfaction
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <SatisfactionWidget
          title="ความพึงพอใจ Visitor"
          data={{ 5: 142, 4: 98, 3: 41, 2: 18, 1: 9 }}
          color="#3B82F6"
        />
        <SatisfactionWidget
          title="ความพึงพอใจ Exhibitor"
          data={{ 5: 54, 4: 43, 3: 19, 2: 8, 1: 3 }}
          color="#7C3AED"
        />
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 5: Answer Ratio per Question
      ══════════════════════════════════════════════════ */}
      <ChartCard title="สัดส่วนคำตอบที่ตอบมาในแต่ละคำถาม" className="mt-6">
        <AnswerRatioChart />
      </ChartCard>

      {/* ══════════════════════════════════════════════════
          SECTION 6: Suggestion Table
      ══════════════════════════════════════════════════ */}
      <div className="mt-6">
        <SuggestionTable />
      </div>

      {/* ══════════════════════════════════════════════════
          SECTION 7: AI Analysis
      ══════════════════════════════════════════════════ */}
      <AnalysisPanel eventId={id} eventData={{ eventName: title }} />
    </div>
  );
}

function CardKpi({ label, value, tone = "blue" }) {
  const toneMap = {
    blue: {
      badge: "bg-blue-100 text-blue-700",
      value: "text-blue-600",
      border: "border-blue-100",
    },
    teal: {
      badge: "bg-teal-100 text-teal-700",
      value: "text-teal-600",
      border: "border-teal-100",
    },
    violet: {
      badge: "bg-violet-100 text-violet-700",
      value: "text-violet-600",
      border: "border-violet-100",
    },
    amber: {
      badge: "bg-amber-100 text-amber-700",
      value: "text-amber-600",
      border: "border-amber-100",
    },
  };

  const theme = toneMap[tone] || toneMap.blue;

  return (
    <div
      className={`bg-white border-2 ${theme.border} rounded-xl shadow-sm p-4`}
    >
      <span
        className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}
      >
        Insight KPI
      </span>
      <div className="mt-3 text-sm text-gray-500 font-medium">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${theme.value}`}>{value}</div>
    </div>
  );
}
