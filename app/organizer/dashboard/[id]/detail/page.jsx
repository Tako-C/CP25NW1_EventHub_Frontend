"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { UserOutlined, MailOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getData, postUserCheckIn } from "@/libs/fetch";
import { FormatDate } from "@/utils/format";

// Imports Components & Columns
import StatCard from "./components/StatCard";
import ResponsiveTable from "./components/ResponsiveTable";
import { participantColumns, createSurveyColumns } from "./libs/columns"; // สมมติว่าแยกไฟล์

export default function ExhibitionDashboard() {
  const { id } = useParams();
  
  // State
  const [loading, setLoading] = useState(false);
  const [participants, setParticipant] = useState([]);
  const [title, setTitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [surveyVisitor, setSurveyVisitor] = useState([]);
  const [surveyExhibitor, setSurveyExhibitor] = useState([]);

  // Derived State (คำนวณค่าจาก State)
  const totalCheckedIn = participants.filter((item) => item.status === "check_in").length;
  const filteredParticipants = participants.filter((item) =>
    String(item.name || "").toLowerCase().includes(searchText.toLowerCase())
  );
  
  const visitorSubmitted = surveyVisitor.filter((s) => s.status === "SUBMITTED").length;
  const exhibitorSubmitted = surveyExhibitor.filter((s) => s.status === "SUBMITTED").length;

  // Fetch Logic (Version แก้ไข Pre+Post รวมกัน)
const fetchData = async () => {
    setLoading(true);
    try {
      // --- Step 1: ยิง Request ข้อมูลหลักพร้อมกัน (Parallel) ---
      // ยิง Profile และ Event Info พร้อมกันเลย ไม่ต้องรอ
      const [resProfile, eventRes] = await Promise.all([
        getData("users/me/profile"),
        getData(`events/${id}`)
      ]);

      setTitle(eventRes?.data?.eventName);

      // --- Step 2: เตรียมยิง Request ย่อยพร้อมกัน ---
      // สร้าง Promise Array ไว้รอรันพร้อมกัน
      const promises = [];

      // 2.1: Check-in (อันนี้ต้องรอ Profile ID ก่อน ถึงจะทำได้)
      const checkInPromise = postUserCheckIn("list/check-in", id, resProfile?.data?.id);
      promises.push(checkInPromise);

      // 2.2: ฟังก์ชันสำหรับเตรียมดึง Survey (ปรับให้คืนค่า Promise แทนการ await ทันที)
      const getSurveyData = async (type) => {
        const isPre = type === "Pre";
        if (!eventRes?.data?.[isPre ? "hasPreSurvey" : "hasPostSurvey"]) return [];

        const endpoint = isPre ? "pre" : "post";
        // ดึง Config ก่อน
        const surveyConfig = await getData(`events/${id}/surveys/${endpoint}`);
        const visitorId = surveyConfig.data?.visitor?.id;
        const exhibitorId = surveyConfig.data?.exhibitor?.id;

        // ยิงดึง Visitor และ Exhibitor พร้อมกัน (Parallel ในระดับย่อย)
        const [visRes, exRes] = await Promise.all([
          visitorId ? getData(`events/${id}/surveys/${visitorId}/submission-status`) : Promise.resolve(null),
          exhibitorId ? getData(`events/${id}/surveys/${exhibitorId}/submission-status`) : Promise.resolve(null)
        ]);

        let results = [];

        // Map Visitor
        if (Array.isArray(visRes)) {
          results.push(...visRes.map((item, idx) => ({
            ...item,
            key: `${type.toLowerCase()}-vis-${item.memberEventId || idx}`,
            surveyType: `${type}-Survey`,
            role: 'VISITOR' // แปะ Role ไว้เผื่อ filter ง่ายๆ
          })));
        }

        // Map Exhibitor
        if (Array.isArray(exRes)) {
          results.push(...exRes.map((item, idx) => ({
            ...item,
            key: `${type.toLowerCase()}-ex-${idx}`,
            surveyType: `${type}-Survey`,
            role: 'EXHIBITOR'
          })));
        }

        return results;
      };

      // สั่งให้ดึง Pre และ Post พร้อมกัน
      const preSurveyPromise = getSurveyData("Pre");
      const postSurveyPromise = getSurveyData("Post");
      
      // --- Step 3: รอทุกอย่างเสร็จพร้อมกัน ---
      const [resListUser, preSurveyData, postSurveyData] = await Promise.all([
        checkInPromise,
        preSurveyPromise,
        postSurveyPromise
      ]);

      // --- Step 4: รวมข้อมูลและ Set State ---
      // รวม Survey ทั้งหมด
      const allSurveys = [...preSurveyData, ...postSurveyData];
      
      // แยก Visitor / Exhibitor จากข้อมูลที่รวมมา
      const allVisitors = allSurveys.filter(s => s.role === 'VISITOR');
      const allExhibitors = allSurveys.filter(s => s.role === 'EXHIBITOR');

      setSurveyVisitor(allVisitors.map((item, index) => ({ ...item, no: index + 1 })));
      setSurveyExhibitor(allExhibitors.map((item, index) => ({ ...item, no: index + 1 })));

      // Set Participants
      if (Array.isArray(resListUser?.data)) {
        setParticipant(
          resListUser.data.map((item, index) => ({ ...item, key: index, no: index + 1 }))
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

  // Mobile Render Functions (ส่งเข้าไปใน ResponsiveTable)
  const renderParticipantMobile = (item) => (
    <div key={item.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-3">
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
    <div key={item.key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-800">
          {item.firstName} {item.lastName}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
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

      {/* --- Section 1: Participant Check-in --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Registration" value={participants.length} valueColor="text-[#6366F1]" />
        <StatCard title="Total Checked-in" value={totalCheckedIn} valueColor="text-[#6366F1]" />
      </div>

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

      {/* --- Section 2: Visitor Survey --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-6">
        <StatCard title="Total Survey Visitor" value={surveyVisitor.length} valueColor="text-blue-600" />
        <StatCard title="Visitor Submitted" value={visitorSubmitted} valueColor="text-green-500" />
      </div>

      <ResponsiveTable
        title="Visitor Survey Status"
        data={surveyVisitor}
        columns={createSurveyColumns("blue")}
        loading={loading}
        renderMobileItem={renderSurveyMobile}
      />

      {/* --- Section 3: Exhibitor Survey --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-6">
        <StatCard title="Total Survey Exhibitor" value={surveyExhibitor.length} valueColor="text-purple-600" />
        <StatCard title="Exhibitor Submitted" value={exhibitorSubmitted} valueColor="text-green-500" />
      </div>

      <ResponsiveTable
        title="Exhibitor Survey Status"
        data={surveyExhibitor}
        columns={createSurveyColumns("purple")}
        loading={loading}
        renderMobileItem={renderSurveyMobile}
      />
    </div>
  );
}