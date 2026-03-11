"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Trash2, Plus, Calendar, FileText } from "lucide-react";
import { Table, Tag, Select, Button, Space, Card, Modal, notification } from "antd";
import dayjs from "dayjs";

// --- Mock Data ---
const mockSurveys = [
  { id: 101, name: "ความคาดหวังก่อนงาน (Visitor)", targetRole: "visitor", type: "pre", createdAt: "2026-03-01T08:00:00", updatedAt: "2026-03-05T10:00:00", status: "ACTIVE", points: 50 },
  { id: 102, name: "แบบสำรวจหลังจบงาน (Visitor)", targetRole: "visitor", type: "post", createdAt: "2026-03-01T09:00:00", updatedAt: "2026-03-01T09:00:00", status: "INACTIVE", points: 100 },
  { id: 201, name: "ความพร้อมของบูธ (Exhibitor)", targetRole: "exhibitor", type: "pre", createdAt: "2026-03-02T11:00:00", updatedAt: "2026-03-04T15:30:00", status: "ACTIVE", points: 20 },
];

export default function EventSurveyManager() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(mockSurveys);

  const handleStatusChange = (surveyId, newStatus) => {
    const updatedData = data.map(s => s.id === surveyId ? { ...s, status: newStatus } : s);
    setData(updatedData);
    notification.success({ message: "อัปเดตสถานะสำเร็จ" });
  };

  const handleDelete = (surveyId) => {
    Modal.confirm({
      title: "ยืนยันการลบ?",
      content: "ข้อมูลนี้จะหายไปถาวร",
      okText: "ลบ",
      okType: "danger",
      onOk: () => {
        setData(data.filter(s => s.id !== surveyId));
        notification.success({ message: "ลบข้อมูลเรียบร้อย" });
      }
    });
  };

  const getColumns = () => [
    {
      title: "SURVEY NAME",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${record.type === 'pre' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
            <FileText size={18} />
          </div>
          <div>
            <div className="font-bold text-slate-800">{text}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{record.type}-event</div>
          </div>
        </div>
      ),
    },
    {
      title: "CREATED / UPDATED",
      key: "dates",
      render: (_, record) => (
        <div className="text-xs text-slate-500">
          <div>Created: {dayjs(record.createdAt).format("DD/MM/YYYY")}</div>
          <div className="text-indigo-400">Edited: {dayjs(record.updatedAt).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record.id, val)}
          className="w-32 font-bold"
          dropdownStyle={{ borderRadius: '12px' }}
        >
          <Select.Option value="ACTIVE"><Tag color="green">ACTIVE</Tag></Select.Option>
          <Select.Option value="INACTIVE"><Tag color="default">INACTIVE</Tag></Select.Option>
        </Select>
      ),
    },
    {
      title: "ACTION",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button 
            icon={<Edit3 size={16} />} 
            onClick={() => router.push(`/admin/survey/${id}/edit/${record.id}`)}
            className="rounded-xl border-slate-200 hover:text-indigo-600"
          />
          <Button 
            danger 
            icon={<Trash2 size={16} />} 
            onClick={() => handleDelete(record.id)}
            className="rounded-xl"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen mt-20">
      <div className="max-w-6xl mx-auto">
<header className="mb-10 flex justify-between items-end">
          <div>
            <button onClick={() => router.push('/admin/survey')} className="text-slate-400 font-bold flex items-center gap-1 mb-2 hover:text-indigo-600">
               <ArrowLeft size={16} /> Back to Events
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Surveys</h1>
          </div>
          <Space>
            {/* แก้ไขปุ่ม NEW VISITOR SURVEY ให้ลิงก์ไปหน้าสร้างพร้อมส่ง role และ type */}
            <Button 
              type="primary" 
              className="h-12 rounded-2xl bg-indigo-600 font-bold" 
              onClick={() => router.push(`/admin/survey/${id}/create?role=visitor&type=pre`)}
            >
              + NEW VISITOR SURVEY
            </Button>

            {/* แก้ไขปุ่ม NEW EXHIBITOR SURVEY ให้ลิงก์ไปหน้าสร้างพร้อมส่ง role และ type */}
            <Button 
              type="primary" 
              className="h-12 rounded-2xl bg-orange-500 font-bold border-none" 
              onClick={() => router.push(`/admin/survey/${id}/create?role=exhibitor&type=pre`)}
            >
              + NEW EXHIBITOR SURVEY
            </Button>
          </Space>
        </header>

        <section className="space-y-12">
          {/* Visitor Table */}
          <Card title={<div className="flex items-center gap-2"><Tag color="purple" className="rounded-md font-black">VISITOR</Tag> แบบสำรวจผู้เข้าชม</div>} className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <Table 
              columns={getColumns()} 
              dataSource={data.filter(s => s.targetRole === "visitor")} 
              rowKey="id" 
              pagination={false}
              className="custom-admin-table"
            />
          </Card>

          {/* Exhibitor Table */}
          <Card title={<div className="flex items-center gap-2"><Tag color="orange" className="rounded-md font-black">EXHIBITOR</Tag> แบบสำรวจผู้ออกบูธ</div>} className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <Table 
              columns={getColumns()} 
              dataSource={data.filter(s => s.targetRole === "exhibitor")} 
              rowKey="id" 
              pagination={false}
              className="custom-admin-table"
            />
          </Card>
        </section>
      </div>
    </div>
  );
}