"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BarChart2, Calendar, MapPin, TrendingUp, Activity } from "lucide-react";
import { Table, Button, Input, Card, Tag } from "antd";
import { getData } from "@/libs/fetch";
import dayjs from "dayjs";
import Notification from "@/components/Notification/Notification";

export default function AdminDashboardList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: "" });
  const showNotification = (msg, isError = false) => {
    setNotification({ isVisible: true, message: msg, isError });
    setTimeout(() => setNotification((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getData("admin/events");
        setEvents(res?.data?.filter((item) => item.eventStatus !== "DELETED") || []);
      } catch (err) {
        showNotification("ไม่สามารถดึงข้อมูลอีเว้นท์ได้", true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (e) =>
      e.eventName.toLowerCase().includes(searchText.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Status badge helper (maps eventStatus to color)
  const statusConfig = {
    PUBLISHED: { color: "green", label: "Published" },
    DRAFT: { color: "default", label: "Draft" },
    ONGOING: { color: "blue", label: "Ongoing" },
    ENDED: { color: "volcano", label: "Ended" },
  };

  const columns = [
    {
      title: "EVENT",
      dataIndex: "eventName",
      key: "eventName",
      render: (text, record) => (
        <div className="flex flex-col py-1">
          <span className="font-black text-slate-900 text-base leading-snug">{text}</span>
          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin size={11} />
            {record.location || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "DATE",
      key: "date",
      width: 160,
      render: (_, record) => (
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <Calendar size={14} className="text-indigo-400 flex-shrink-0" />
          {dayjs(record.startDate).format("DD MMM YYYY")}
        </div>
      ),
    },
    {
      title: "STATUS",
      key: "status",
      width: 120,
      render: (_, record) => {
        const cfg = statusConfig[record.eventStatus] || { color: "default", label: record.eventStatus };
        return <Tag color={cfg.color} className="font-semibold text-xs rounded-full">{cfg.label}</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      width: 160,
      align: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<BarChart2 size={15} />}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/dashboard/${record.id}/detail`);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 h-9 px-5 rounded-xl font-bold flex items-center gap-2 border-none shadow-md text-sm"
        >
          View Dashboard
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="max-w-6xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Admin Portal</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              Analytics Dashboard
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              เลือกอีเว้นท์เพื่อดูสถิติและข้อมูลเชิงลึก
            </p>
          </div>

          {/* Stats summary */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Activity size={15} className="text-indigo-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Total Events</div>
                <div className="text-lg font-black text-slate-900 leading-none mt-0.5">{events.length}</div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp size={15} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Active</div>
                <div className="text-lg font-black text-slate-900 leading-none mt-0.5">
                  {events.filter((e) => e.eventStatus === "ONGOING" || e.eventStatus === "PUBLISHED").length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Search ─── */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่ออีเว้นท์ หรือสถานที่..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
            />
          </div>
        </div>

        {/* ─── Table ─── */}
        <Card className="rounded-[1.75rem] shadow-xl border-none overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredEvents}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            onRow={(record) => ({
              onClick: () => router.push(`/admin/dashboard/${record.id}/detail`),
              className: "cursor-pointer hover:bg-slate-50 transition-colors",
            })}
            locale={{ emptyText: <div className="py-12 text-slate-400 text-sm">ไม่พบอีเว้นท์</div> }}
          />
        </Card>
      </div>
    </div>
  );
}