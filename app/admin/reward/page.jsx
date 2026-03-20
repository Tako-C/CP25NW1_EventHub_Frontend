"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Gift, Calendar, MapPin } from "lucide-react";
import { Table, Button, Input, Card, Tag } from "antd";
import { getDataNoToken } from "@/libs/fetch"; 
import dayjs from "dayjs";

import Notification from "@/components/Notification/Notification";

export default function SelectEventRewardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isErr = false) => {
    setNotification({
      isVisible: true,
      message: msg,
      isError: isErr,
    });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await getDataNoToken("events"); 
        if (res?.statusCode === 200) {
          setEvents(res?.data || []);
        } else {
          // showNotification(res?.message || "ไม่สามารถโหลดข้อมูลอีเว้นท์ได้", true);
          showNotification("ไม่สามารถโหลดข้อมูลอีเว้นท์ได้", true);
        }
      } catch (err) { 
        console.error(err);
        showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", true);
      } finally { 
        setLoading(false); 
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.eventName.toLowerCase().includes(searchText.toLowerCase())
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
            <MapPin size={12} /> {record.location || "Online"}
          </span>
        </div>
      ),
    },
    {
      title: "EVENT DATE",
      key: "date",
      render: (_, record) => (
        <div className="text-slate-600 font-bold text-sm">
          <Calendar size={14} className="inline mr-2 text-amber-500" />
          {dayjs(record.startDate).format("DD MMM YYYY")}
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "eventStatus",
      render: (status) => (
        <Tag color={status === "ONGOING" ? "green" : "blue"} className="font-black rounded-lg uppercase">
          {status}
        </Tag>
      ),
    },
    {
      title: "ACTION",
      align: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Gift size={16} />}
          onClick={() => router.push(`/admin/reward/${record.id}`)}
          className="bg-amber-500 hover:bg-amber-600 h-10 px-6 rounded-xl font-black border-none shadow-lg shadow-amber-100 transition-all active:scale-95"
        >
          Manage Rewards
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Reward Management</h1>
            <p className="text-slate-500 font-medium">เลือกอีเว้นท์เพื่อจัดการของรางวัลในระบบ</p>
          </div>
          <Input
            prefix={<Search className="text-slate-400 mr-2" size={20} />}
            placeholder="ค้นหาชื่ออีเว้นท์..."
            className="w-full md:w-80 h-12 rounded-2xl border-slate-200 shadow-sm focus:border-amber-400"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Card className="rounded-[2.5rem] shadow-xl border-none overflow-hidden bg-white/80 backdrop-blur-sm">
          <Table 
            columns={columns} 
            dataSource={filteredEvents} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 7 }}
            className="reward-admin-table"
          />
        </Card>
      </div>
    </div>
  );
}