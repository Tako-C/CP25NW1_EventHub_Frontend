"use client";
import { useState, useEffect, useMemo } from "react";
import { Table, Button, Space, Modal, Image, Select, Tag } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { FormatDate } from "@/utils/format";
import { getData, getImage, hardDeleteEvent, updateEventAdmin } from "@/libs/fetch";
import { Search, X, SlidersHorizontal } from "lucide-react";
import Notification from "@/components/Notification/Notification";

const STATUS_OPTIONS = ["ALL", "UPCOMING", "ONGOING", "FINISHED", "DELETED"];

const STATUS_TAG_COLOR = {
  UPCOMING: "blue",
  ONGOING: "green",
  FINISHED: "default",
  DELETED: "red",
};

function TableImage({ imagePath }) {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    if (!imagePath) return;
    (async () => {
      try {
        let p = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
        if (!p.startsWith("upload/events/")) p = `upload/events/${p}`;
        setImgUrl(await getImage(p));
      } catch {}
    })();
  }, [imagePath]);

  return imgUrl ? (
    <Image width={56} height={40} src={imgUrl} className="rounded object-cover" preview={false} />
  ) : (
    <div className="w-14 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400">
      No Pic
    </div>
  );
}

export default function EventsManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const router = useRouter();

  const [notification, setNotification] = useState({ isVisible: false, isError: false, message: "" });
  const close = () => setNotification((p) => ({ ...p, isVisible: false }));
  const notify = (msg, isErr = false) => {
    setNotification({ isVisible: true, message: msg, isError: isErr });
    setTimeout(close, 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getData("admin/events");
      setData(res?.data || []);
    } catch {
      notify("ไม่สามารถดึงข้อมูลได้", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let list = data;
    if (statusFilter !== "ALL") list = list.filter((e) => e.eventStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.eventName?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, statusFilter]);

  const handleUpdateStatus = async (value, record) => {
    const now = FormatDate(new Date(), "default");
    const endDate = FormatDate(record.endDate, "default");
    if (now.isAfter(endDate) && (value === "UPCOMING" || value === "ONGOING")) {
      notify("ไม่สามารถเปลี่ยนสถานะได้: กิจกรรมสิ้นสุดแล้ว กรุณาแก้ไขวันสิ้นสุดก่อน", true);
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("status", value);
      await updateEventAdmin(record.id, fd);
      notify(`อัปเดตสถานะเป็น ${value} สำเร็จ`);
      fetchData();
    } catch {
      notify("เกิดข้อผิดพลาดในการอัปเดตสถานะ", true);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: `ลบอีเว้นท์ "${record.eventName}"?`,
      icon: <ExclamationCircleFilled style={{ color: "#ff4d4f" }} />,
      content: (
        <div className="mt-2 space-y-1">
          <p className="text-red-500 font-bold text-sm">คำเตือน: การลบนี้เป็นแบบถาวร</p>
          <ul className="list-disc ml-4 text-gray-500 text-xs space-y-0.5">
            <li>ข้อมูลผู้ลงทะเบียนจะถูกลบทั้งหมด</li>
            <li>ผลการตอบ Survey จะถูกลบทั้งหมด</li>
            <li>ข้อมูล Reward จะถูกลบทั้งหมด</li>
          </ul>
        </div>
      ),
      okText: "ยืนยันการลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      async onOk() {
        try {
          await hardDeleteEvent(record.id);
          notify("ลบข้อมูลสำเร็จ");
          fetchData();
        } catch {
          notify("ไม่สามารถลบข้อมูลได้", true);
        }
      },
    });
  };

  const columns = [
    {
      title: "Event",
      key: "event",
      render: (_, r) => (
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0">
            <TableImage imagePath={r.images?.imgCard} />
          </div>
          <div className="min-w-0">
            {/* Full name, wraps — no truncation */}
            <p className="font-semibold text-gray-900 text-sm leading-snug mb-0.5">
              {r.eventName}
            </p>
            <p className="text-xs text-gray-400">{r.location || "Online"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {r.startDate ? FormatDate(r.startDate, "custom", "DD MMM YYYY") : "TBA"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "eventStatus",
      key: "status",
      width: 160,
      render: (s, record) => (
        <Select
          value={s}
          onChange={(val) => handleUpdateStatus(val, record)}
          size="small"
          style={{ width: 140 }}
          onClick={(e) => e.stopPropagation()}
        >
          {["UPCOMING", "ONGOING", "FINISHED", "DELETED"].map((v) => (
            <Select.Option key={v} value={v}>
              <Tag color={STATUS_TAG_COLOR[v]} className="text-xs">{v}</Tag>
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/event/${record.id}/edit`)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
          />
        </Space>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Event Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {filtered.length} / {data.length} events
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/admin/event/create")}
          className="bg-blue-600 self-start sm:self-auto"
        >
          Create Event
        </Button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ Event หรือสถานที่..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {s === "ALL" ? "ทั้งหมด" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table — horizontally scrollable on mobile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `ทั้งหมด ${t} รายการ` }}
            size="middle"
            className="admin-event-table"
          />
        </div>
      </div>
    </div>
  );
}