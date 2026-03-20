"use client";
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Modal,
  Image,
  Select,
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
  hardDeleteEvent,
  updateEventAdmin,
} from "@/libs/fetch";

import Notification from "@/components/Notification/Notification";

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

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getData("admin/events");
      setData(res?.data);
    } catch (error) {
      showNotification("ไม่สามารถดึงข้อมูลได้", true);
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
      showNotification("ไม่สามารถเปลี่ยนสถานะได้: กิจกรรมสิ้นสุดแล้ว กรุณาแก้ไขวันสิ้นสุดก่อน", true);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("status", value);

      await updateEventAdmin(record.id, formData);
      showNotification(`อัปเดตสถานะเป็น ${value} สำเร็จ`, false);
      fetchData();
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการอัปเดตสถานะ", true);
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
          showNotification("ลบข้อมูลสำเร็จถาวร", false);
          fetchData();
        } catch (error) {
          showNotification("ไม่สามารถลบข้อมูลได้", true);
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
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />

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