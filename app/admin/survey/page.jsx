"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ClipboardList, Calendar, MapPin } from "lucide-react";
import { Table, Button, Input, Card, Space, Tag, Spin } from "antd";
import { getData } from "@/libs/fetch";
import dayjs from "dayjs";

export default function SelectEventSurveyPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getData("admin/events");
        setEvents(res?.data || []);
      } catch (err) {
        console.error("Fetch events failed");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // กรองข้อมูลตามการ Search เหมือนในไฟล์ UserEventPage
  const filteredEvents = events.filter(event =>
    event.eventName.toLowerCase().includes(searchText.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "EVENT NAME",
      dataIndex: "eventName",
      key: "eventName",
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-800 text-base">{text}</span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin size={12} /> {record.location || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "EVENT DATE",
      key: "date",
      render: (_, record) => (
        <div className="text-slate-600 font-bold text-sm">
          <Calendar size={14} className="inline mr-2 text-indigo-500" />
          {dayjs(record.startDate).format("DD MMM YYYY")}
        </div>
      ),
    },
    // {
    //   title: "STATUS",
    //   dataIndex: "eventStatus",
    //   key: "status",
    //   render: (status) => (
    //     <Tag color={status === "ONGOING" ? "green" : status === "FINISHED" ? "volcano" : "blue"} className="font-black rounded-lg uppercase px-3">
    //       {status}
    //     </Tag>
    //   ),
    // },
    {
      title: "ACTION",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<ClipboardList size={16} />}
          onClick={() => router.push(`/admin/survey/${record.id}`)}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 rounded-xl font-black flex items-center gap-2 border-none shadow-lg shadow-indigo-100"
        >
          Manage Surveys
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Survey Management</h1>
            <p className="text-slate-500 font-medium">เลือกอีเว้นท์จากรายการเพื่อจัดการแบบสำรวจ</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Input
              prefix={<Search className="text-slate-400 mr-2" size={20} />}
              placeholder="ค้นหาชื่ออีเว้นท์..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-12 rounded-2xl border-slate-200 shadow-sm font-medium focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Table Section อิงตาม UserEventPage */}
        <Card className="rounded-[2.5rem] shadow-xl border-none overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredEvents}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 6,
              className: "px-8 py-4",
            }}
            className="custom-admin-table"
            // เมื่อคลิกที่แถวให้พาไปหน้าจัดการ Survey เลย
            onRow={(record) => ({
              onClick: () => router.push(`/admin/survey/${record.id}`),
              className: "cursor-pointer",
            })}
          />
        </Card>
      </div>
    </div>
  );
}