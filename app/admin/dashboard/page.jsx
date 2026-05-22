"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BarChart2, Calendar, MapPin, TrendingUp, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, Button, Card, Tag } from "antd";
import { getData } from "@/libs/fetch";
import { FormatDate } from "@/utils/format";
import Notification from "@/components/Notification/Notification";

export default function AdminDashboardList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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

  // Reset page when search changes
  const handleSearch = (val) => { setSearchText(val); setCurrentPage(1); };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  // Status badge helper
  const statusConfig = {
    PUBLISHED: { color: "green", label: "Published" },
    DRAFT: { color: "default", label: "Draft" },
    ONGOING: { color: "blue", label: "Ongoing" },
    ENDED: { color: "volcano", label: "Ended" },
  };

  // ─── Desktop table columns ────────────────────────────────────────────────
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
          {FormatDate(record.startDate, "custom", "DD MMM YYYY")}
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
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, isVisible: false }))}
      />

      <div className="max-w-6xl mx-auto">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Admin Portal</p>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
              Analytics Dashboard
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              เลือกอีเว้นท์เพื่อดูสถิติและข้อมูลเชิงลึก
            </p>
          </div>

          {/* Stats pills */}
          <div className="flex gap-2 flex-wrap">
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
        <div className="mb-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 px-4 py-2.5 max-w-sm">
            <Search className="text-slate-400 flex-shrink-0" size={16} />
            <input
              type="text"
              placeholder="ค้นหาชื่ออีเว้นท์ หรือสถานที่..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full text-sm text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* ─── Desktop Table ─── */}
        <div className="hidden md:block">
          <Card className="rounded-[1.75rem] shadow-xl border-none overflow-hidden">
            <Table
              columns={columns}
              dataSource={filteredEvents}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: itemsPerPage, showSizeChanger: false }}
              onRow={(record) => ({
                onClick: () => router.push(`/admin/dashboard/${record.id}/detail`),
                className: "cursor-pointer hover:bg-slate-50 transition-colors",
              })}
              locale={{ emptyText: <div className="py-12 text-slate-400 text-sm">ไม่พบอีเว้นท์</div> }}
            />
          </Card>
        </div>

        {/* ─── Mobile Cards ─── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">กำลังโหลด...</div>
          ) : currentItems.length > 0 ? (
            currentItems.map((item) => {
              const cfg = statusConfig[item.eventStatus] || { color: "default", label: item.eventStatus };
              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 cursor-pointer"
                  onClick={() => router.push(`/admin/dashboard/${item.id}/detail`)}
                >
                  {/* Top row: status badge + date */}
                  <div className="flex items-center justify-between mb-2">
                    <Tag color={cfg.color} className="font-semibold text-xs rounded-full m-0">
                      {cfg.label}
                    </Tag>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={11} className="flex-shrink-0" />
                      <span>{FormatDate(item.startDate, "custom", "DD MMM YYYY")}</span>
                    </div>
                  </div>

                  {/* Event name */}
                  <h3 className="text-base font-black text-slate-900 mb-2 line-clamp-2 leading-snug">
                    {item.eventName}
                  </h3>

                  {/* Location + CTA */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-sm text-slate-500 min-w-0">
                      <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">{item.location || "N/A"}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/dashboard/${item.id}/detail`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex-shrink-0 shadow-sm active:bg-indigo-700"
                    >
                      <BarChart2 size={12} />
                      Dashboard
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
              ไม่พบอีเว้นท์
            </div>
          )}
        </div>

        {/* ─── Mobile Pagination ─── */}
        {totalPages > 1 && (
          <div className="md:hidden mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="text-sm text-slate-500 order-2 sm:order-1">
              แสดง{" "}
              <span className="font-semibold text-slate-800">
                {Math.min(startIndex + 1, filteredEvents.length)}–{Math.min(startIndex + itemsPerPage, filteredEvents.length)}
              </span>{" "}
              จาก <span className="font-semibold text-slate-800">{filteredEvents.length}</span>
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                      currentPage === i + 1
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}