"use client";
import { useState } from "react";
import { Card, Button, Spin } from "antd";
import { RobotOutlined, ReloadOutlined, CloseOutlined } from "@ant-design/icons";
import { getData, getDataNoToken } from "@/libs/fetch";

// ─── MOCK RESPONSE (ปิดไว้ ใช้ตอน API จริงยังไม่พร้อม) ──────────────────────
const MOCK_ANALYSIS = `
## 1. ภาพรวมงาน (Overview)
- งานมีผู้ลงทะเบียนทั้งสิ้น **1,200 คน** โดยมีผู้ Check-in จริง **980 คน** คิดเป็น **81.7%** ของผู้ลงทะเบียนทั้งหมด ซึ่งถือว่าอยู่ในระดับดี
- มีผู้ให้ Feedback กลับมาทั้งสิ้น **250 คน** คิดเป็น **25.5%** ของผู้เข้าร่วมงาน ซึ่งแสดงให้เห็นถึงความสนใจในการมีส่วนร่วมของผู้เข้าร่วมงาน
- กลุ่มเป้าหมายหลักคือเจ้าของธุรกิจร้านอาหาร ซึ่งมีความสำคัญต่อการพัฒนานวัตกรรมในอุตสาหกรรมอาหาร

## 2. จุดแข็งและปัจจัยความสำเร็จ (Core Strengths)
- สรุปสิ่งที่ทำได้ดีเยี่ยม ได้แก่ ระบบเข้าถึงที่รวดเร็วและเสถียรภาพของเทคโนโลยี WiFi ในฮอลล์ ซึ่งช่วยให้การสาธิตระบบ POS ของผู้จัดบูทเป็นไปอย่างราบรื่น
- แนวทางการรักษามาตรฐานนี้ไว้สำหรับงานในอนาคตควรนำการพัฒนาระบบเทคโนโลยีและการบริการที่ตอบสนองความต้องการของผู้เข้าร่วมงาน

## 3. ประเด็นที่ต้องปรับปรุงเร่งด่วน (Critical Issues)
- วิเคราะห์ช่องว่างความพึงพอใจ: ปัจจุบัน Gap อยู่ที่ 1.2 สถานะคือ สภาวะขาดสมดุลเชิงกลยุทธ์ (Strategic Imbalance) โดยที่ Visitor ได้คะแนน **4.5** ในขณะที่ Exhibitor ได้คะแนน **3.3**
- *ค่าอธิบายเชิงกลยุทธ์*: สภาวะสมดุลเชิงกลยุทธ์มาถึงหมายความว่าทรัพยากรหรือการบริหารจัดการเอนเอียงไปดูแลโจทย์กลุ่มหนึ่งมากเกินไป จนทำให้อีกกลุ่มเสียประโยชน์
- วิเคราะห์ความย้อนแย้งในหมวดหมู่ **"Catering"** ซึ่งมีการรับรู้ถึงความแออัดและผลที่น่าพึงพอใจ ส่งผลกระทบต่อการเจรจาธุรกิจทั้ง Visitor และ Exhibitor
- การที่ระบบลงทะเบียนรวดเร็วให้ผู้เข้าร่วมงานเข้างานได้ทันทีแต่กลับสอลล์พร้อมกัน ส่งผลให้พื้นที่ส่วนกลางไม่สามารถรองรับได้ทัน

## 4. ข้อเสนอแนะเชิงกลยุทธ์ (Future Action Plan)
- แนวทางแก้ไขปัญหาเชิงเทคนิคและโลจิสติกส์:
  1. เพิ่มจำนวนจุดบริการในพื้นที่รับประทานอาหารเพื่อรองรับผู้เข้าร่วมงานในช่วงเวลาพักเที่ยง
  2. จัดเตรียมไฟให้เพียงพอเพื่อให้ผู้เข้าร่วมงานสามารถสาธิตเครื่องจักรได้อย่างมีประสิทธิภาพ
- กลยุทธ์การรักษาฐานผู้เข้าร่วมเดิม: สร้างความสัมพันธ์ที่ดีกับ Exhibitor โดยการจัดกิจกรรม Networking ที่เอื้อต่อการสร้างความร่วมมือ
- กลยุทธ์สร้างคุณค่าร่วม: การแก้ไขปัญหานี้ช่วยเพิ่มโอกาสในการปิดขายให้ Exhibitor และเพิ่มความประทับใจให้ Visitor พร้อมกัน
- แผนการกู้คืนความมั่นใจ: จัดทำแบบสอบถามหลังงานเพื่อรับฟังความคิดเห็นและปรับปรุงการจัดงานในอนาคต

เรามุ่งมั่นที่จะพัฒนางานในอนาคตให้มีคุณภาพและประสิทธิภาพยิ่งขึ้น เพื่อสร้างความพึงพอใจให้กับทุกฝ่ายที่เกี่ยวข้อง
`;

// ─── SIMPLE MARKDOWN RENDERER ─────────────────────────────────────────────────
function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

function renderMarkdown(text) {
  const lines = text.trim().split("\n");
  const elements = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-sm font-bold text-[#7C3AED] mt-5 mb-2 pb-1 border-b border-purple-100">
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.match(/^\s{2}\d+\.\s/)) {
      // indented numbered list (sub-item)
      elements.push(
        <div key={key++} className="flex gap-2 ml-8 mb-1 text-sm text-gray-700">
          <span className="text-purple-300 shrink-0 font-bold">{line.match(/\d+/)[0]}.</span>
          <span>{parseBold(line.replace(/^\s+\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={key++} className="flex gap-2 ml-4 mb-1 text-sm text-gray-700">
          <span className="text-purple-400 font-bold shrink-0">{line.match(/^\d+/)[0]}.</span>
          <span>{parseBold(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <div key={key++} className="flex gap-2 ml-2 mb-1.5 text-sm text-gray-700">
          <span className="text-purple-300 shrink-0 mt-0.5">•</span>
          <span className="leading-relaxed">{parseBold(line.replace("- ", ""))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-1" />);
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-600 mb-1 leading-relaxed italic">
          {parseBold(line)}
        </p>
      );
    }
  }

  return elements;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AnalysisPanel({ eventId, eventData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)" }}
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
          <div>{renderMarkdown(result)}</div>
        </Card>
      )}
    </div>
  );
}