"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Gift, Calendar, MapPin } from "lucide-react";
import { Table, Button, Input, Card, Tag, Spin } from "antd";
import { getDataNoToken } from "@/libs/fetch"; 
import dayjs from "dayjs";

export default function SelectEventRewardPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getDataNoToken("events"); 
        setEvents(res?.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
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
          className="bg-amber-500 hover:bg-amber-600 h-10 px-6 rounded-xl font-black border-none shadow-lg shadow-amber-100"
        >
          Manage Rewards
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Reward Management</h1>
            <p className="text-slate-500 font-medium">เลือกอีเว้นท์เพื่อจัดการของรางวัล</p>
          </div>
          <Input
            prefix={<Search className="text-slate-400 mr-2" size={20} />}
            placeholder="ค้นหาชื่ออีเว้นท์..."
            className="w-80 h-12 rounded-2xl border-slate-200"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Card className="rounded-[2.5rem] shadow-xl border-none overflow-hidden">
          <Table columns={columns} dataSource={filteredEvents} rowKey="id" loading={loading} />
        </Card>
      </div>
    </div>
  );
}