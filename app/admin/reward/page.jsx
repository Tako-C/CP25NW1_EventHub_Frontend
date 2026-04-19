"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Table, Button, Tag } from "antd";
import { Gift } from "lucide-react";
import { getDataNoToken } from "@/libs/fetch";
import { FormatDate } from "@/utils/format";
import { EventCardImage } from "@/utils/getImage";
import Notification from "@/components/Notification/Notification";

const STATUS_OPTIONS = ["ALL", "UPCOMING", "ONGOING", "FINISHED"];
const STATUS_TAG_COLOR = {
  UPCOMING: "blue",
  ONGOING: "green",
  FINISHED: "default",
};

export default function SelectEventRewardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const router = useRouter();

  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: "" });
  const close = () => setNotification((p) => ({ ...p, isVisible: false }));
  const notify = (msg, isErr = false) => {
    setNotification({ isVisible: true, message: msg, isError: isErr });
    setTimeout(close, 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getDataNoToken("events");
        if (res?.statusCode === 200) {
          setEvents(res?.data || []);
        } else {
          notify("ไม่สามารถโหลดข้อมูลอีเว้นท์ได้", true);
        }
      } catch {
        notify("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = events;
    if (statusFilter !== "ALL") list = list.filter((e) => e.eventStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.eventName?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, search, statusFilter]);

  const columns = [
    {
      title: "Event",
      key: "event",
      render: (_, r) => (
        <div className="flex items-start gap-3">
          <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <EventCardImage imageCard={r.images?.imgCard} eventName={r.eventName} />
          </div>
          <div className="min-w-0">
            {/* Full name wraps */}
            <p className="font-semibold text-slate-800 text-sm leading-snug mb-0.5">
              {r.eventName}
            </p>
            <p className="text-xs text-slate-400">{r.location || "Online"}</p>
          </div>
        </div>
      ),
    },
    {
      title: "วันที่",
      key: "date",
      width: 130,
      render: (_, r) => (
        <span className="text-sm text-slate-600">
          {r.startDate ? FormatDate(r.startDate, "custom", "DD MMM YYYY") : "TBA"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "eventStatus",
      key: "status",
      width: 110,
      render: (s) => (
        <Tag color={STATUS_TAG_COLOR[s] || "default"} className="text-xs font-medium">
          {s}
        </Tag>
      ),
    },
    {
      title: "",
      key: "action",
      width: 160,
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          icon={<Gift size={14} />}
          onClick={() => router.push(`/admin/reward/${r.id}`)}
          className="bg-amber-500 hover:bg-amber-600 border-none flex items-center gap-1"
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={close}
      />

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900 uppercase italic">Reward Management</h1>
        <p className="text-slate-400 text-sm mt-0.5">เลือกอีเว้นท์เพื่อจัดการของรางวัล</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่ออีเว้นท์..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              {s === "ALL" ? "ทั้งหมด" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false, showTotal: (t) => `ทั้งหมด ${t} รายการ` }}
            size="middle"
            onRow={(r) => ({
              onClick: () => router.push(`/admin/reward/${r.id}`),
              className: "cursor-pointer hover:bg-amber-50/40 transition-colors",
            })}
          />
        </div>
      </div>
    </div>
  );
}