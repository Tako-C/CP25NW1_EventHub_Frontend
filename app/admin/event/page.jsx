"use client";
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Modal,
  Image,
  Select,
  notification,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  getData,
  getImage,
  updateEvent,
  hardDeleteEvent,
  updateEventAdmin,
} from "@/libs/fetch";

function TableImage({ imagePath }) {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    if (!imagePath) return;
    const fetchImg = async () => {
      try {
        let cleanPath = imagePath.startsWith("/")
          ? imagePath.substring(1)
          : imagePath;
        const finalPath = cleanPath.startsWith("upload/events/")
          ? cleanPath
          : `upload/events/${cleanPath}`;
        const res = await getImage(finalPath);
        setImgUrl(res);
      } catch (err) {
        console.error("Table image load failed", err);
      }
    };
    fetchImg();
  }, [imagePath]);

  return imgUrl ? (
    <Image
      width={60}
      src={imgUrl}
      className="rounded shadow-sm"
      preview={false}
    />
  ) : (
    <div className="w-[60px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">
      No Pic
    </div>
  );
}

export default function EventsManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getData("admin/events");
      setData(res?.data);
    } catch (error) {
      message.error("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (value, record) => {
    const now = dayjs();
    const endDate = dayjs(record.endDate);

    if (now.isAfter(endDate) && (value === "UPCOMING" || value === "ONGOING")) {
      notification.warning({
        message: "ไม่สามารถเปลี่ยนสถานะได้",
        description: "กิจกรรมสิ้นสุดแล้ว กรุณาแก้ไขวันสิ้นสุดก่อนเปลี่ยนสถานะ",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("status", value);

      console.log(record.id)
      await updateEventAdmin(record.id, formData);

      message.success(`อัปเดตสถานะเป็น ${value} สำเร็จ`);
      fetchData();
    } catch (error) {
      console.error("Update status error:", error);
      message.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setLoading(false);
    }
  };

  const confirmHardDelete = (record) => {
    Modal.confirm({
      title: `คุณแน่ใจหรือไม่ที่จะลบอีเว้นท์ "${record.eventName}"?`,
      icon: <ExclamationCircleFilled style={{ color: "#ff4d4f" }} />,
      content: (
        <div className="mt-2">
          <p className="text-red-500 font-bold">
            คำเตือน: การลบนี้เป็นแบบถาวร (Hard Delete)
          </p>
          <ul className="list-disc ml-4 text-gray-600 text-xs">
            <li>ข้อมูลผู้ลงทะเบียนจะถูกลบทั้งหมด</li>
            <li>ผลการตอบ Survey จะถูกลบทั้งหมด</li>
            <li>ข้อมูล Reward จะถูกลบทั้งหมด</li>
          </ul>
        </div>
      ),
      okText: "ยืนยันการลบถาวร",
      okType: "danger",
      cancelText: "ยกเลิก",
      async onOk() {
        try {
          await hardDeleteEvent(record.id);
          notification.success({ message: "ลบข้อมูลสำเร็จ" });
          fetchData();
        } catch (error) {
          message.error("ไม่สามารถลบข้อมูลได้");
        }
      },
    });
  };

  const columns = [
    {
      title: "Preview",
      key: "preview",
      width: 100,
      render: (_, record) => <TableImage imagePath={record.images?.imgCard} />,
    },
    { title: "Event Name", dataIndex: "eventName", key: "eventName" },
    {
      title: "Status",
      dataIndex: "eventStatus",
      width: 180,
      render: (s, record) => (
        <Select
          value={s}
          onChange={(val) => handleUpdateStatus(val, record)}
          style={{ width: 140 }}
          loading={loading}
        >
          <Select.Option value="UPCOMING">UPCOMING</Select.Option>
          <Select.Option value="ONGOING">ONGOING</Select.Option>
          <Select.Option value="FINISHED">FINISHED</Select.Option>
          <Select.Option value="DELETED">DELETED</Select.Option>
        </Select>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/event/${record.id}/edit`)}
            title="Edit Details"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmHardDelete(record)}
            title="Hard Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen mt-20">
      <Card
        title={<span className="text-xl font-bold">Event Management</span>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/admin/event/create")}
            className="bg-blue-600"
          >
            Create Event
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
}
