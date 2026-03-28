"use client";

import { useState, useEffect, useMemo } from "react"; 
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Popconfirm,
  Typography,
  Breadcrumb,
  Input, 
} from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SearchOutlined, 
} from "@ant-design/icons";
import {
  getData,
  postAddUserToEvent,
  updateUserRoleInEvent,
  removeUserFromEvent,
} from "@/libs/fetch";

import Notification from "@/components/Notification/Notification";

const { Title } = Typography;

const ROLE_PRIORITY = {
  ORGANIZER: 1,
  STAFF: 2,
  EXHIBITOR: 3,
  VISITOR: 4,
};

export default function UserEventPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventUsers, setEventUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(""); 
  const [form] = Form.useForm();

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (msg, isErr = false) => {
    setNotification({ isVisible: true, message: msg, isError: isErr });
    setTimeout(() => closeNotification(), 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    fetchData();
    fetchAllUsers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getData("events");
      const resEvent = await getData("admin/events/users");
      if (res?.data && resEvent?.data) {
        const processedEvents = res.data.map((event) => {
          const participantCount = resEvent.data.filter(
            (u) => u.eventId === event.id,
          ).length;
          return {
            ...event,
            key: event.id,
            name: event.eventName,
            date: event.startDate ? event.startDate.split("T")[0] : "-",
            participantCount: participantCount,
          };
        });
        setEvents(processedEvents);
      }
    } catch (error) {
      showNotification("ดึงข้อมูลอีเว้นท์ไม่สำเร็จ", true);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await getData("admin/users");
      if (res?.data) setAllUsers(res.data);
    } catch (error) {
      console.error("ดึงข้อมูล User ทั้งหมดไม่สำเร็จ", error);
    }
  };

  const handleManageUsers = async (eventRecord) => {
    setSelectedEvent(eventRecord);
    setSearchText(""); 
    setLoading(true);
    try {
      const res = await getData(`admin/events/${eventRecord.id}/users`);
      if (res?.data) {
        setEventUsers(res?.data);
      }
    } catch (error) {
      showNotification("ไม่สามารถดึงข้อมูลผู้ใช้งานในอีเว้นท์นี้ได้", true);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    if (!eventUsers) return [];

    return eventUsers
      .filter((user) => {
        const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        const search = searchText.toLowerCase();
        return fullName.includes(search) || email.includes(search);
      })
      .sort((a, b) => {
        const priorityA = ROLE_PRIORITY[a.eventRole] || 99;
        const priorityB = ROLE_PRIORITY[b.eventRole] || 99;
        return priorityA - priorityB;
      });
  }, [eventUsers, searchText]);

  const handleAddUser = async (values) => {
    try {
      await postAddUserToEvent(selectedEvent.id, values.userId);
      showNotification("เพิ่มผู้ใช้งานเข้าอีเว้นท์สำเร็จ");
      setIsAddUserModalOpen(false);
      form.resetFields();
      handleManageUsers(selectedEvent);
      fetchData();
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน", true);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await removeUserFromEvent(selectedEvent.id, userId);
      showNotification("เอาผู้ใช้งานออกจากอีเว้นท์แล้ว");
      handleManageUsers(selectedEvent);
      fetchData();
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการเอาผู้ใช้งานออก", true);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUserRoleInEvent(selectedEvent.id, userId, newRole);
      showNotification("อัปเดตบทบาทสำเร็จ");
      handleManageUsers(selectedEvent);
    } catch (error) {
      showNotification("เกิดข้อผิดพลาดในการอัปเดตบทบาท", true);
    }
  };

  const userColumns = [
    {
      title: "ชื่อ-นามสกุล",
      dataIndex: "name",
      key: "fullName",
      render: (_, r) => `${r.firstName || ""} ${r.lastName || ""}`,
    },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    {
      title: "บทบาท (Role)",
      dataIndex: "eventRole",
      key: "eventRole",
      render: (role, record) => (
        <Select
          value={role}
          style={{ width: 140 }}
          onChange={(value) => handleChangeRole(record.userId, value)}
        >
          <Select.Option value="ORGANIZER">Organizer</Select.Option>
          <Select.Option value="STAFF">Staff</Select.Option>
          <Select.Option value="EXHIBITOR">Exhibitor</Select.Option>
          <Select.Option value="VISITOR">Visitor</Select.Option>
        </Select>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="ยืนยันการนำออก"
          onConfirm={() => handleRemoveUser(record.userId)}
          okText="ยืนยัน"
          cancelText="ยกเลิก"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const eventColumns = [
    { title: "ชื่ออีเว้นท์", dataIndex: "name", key: "name", className: "font-medium" },
    { title: "วันที่จัดงาน", dataIndex: "date", key: "date" },
    {
      title: "ผู้เข้าร่วม",
      dataIndex: "participantCount",
      key: "participantCount",
      render: (count) => <Tag color="blue" className="px-3 rounded-full">{count} คน</Tag>,
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<TeamOutlined />}
          onClick={() => handleManageUsers(record)}
        >
          Manage Users
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />

      <div className="mb-6">
        <Breadcrumb
          className="mb-4"
          items={[
            { title: "Admin" },
            { title: "User Events" },
            ...(selectedEvent ? [{ title: selectedEvent.name }] : []),
          ]}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Title level={2} className="!m-0 text-gray-800">
            {selectedEvent ? `จัดการผู้ใช้งาน: ${selectedEvent.name}` : "รายการอีเว้นท์ทั้งหมด"}
          </Title>

          {selectedEvent && (
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedEvent(null)}>
                กลับหน้าหลัก
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-green-600"
              >
                เพิ่มคนเข้าอีเว้นท์
              </Button>
            </Space>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* 4. ส่วนของช่องค้นหา (จะแสดงเมื่อเลือก Event แล้ว) */}
        {selectedEvent && (
          <div className="mb-4">
            <Input
              placeholder="ค้นหาชื่อ หรือ อีเมล..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-md rounded-lg"
              allowClear
            />
          </div>
        )}

        {!selectedEvent ? (
          <Table 
            dataSource={events} 
            columns={eventColumns} 
            rowKey="id" 
            loading={loading}
          />
        ) : (
          <Table
            dataSource={filteredAndSortedUsers} 
            columns={userColumns}
            rowKey={(record) => record.userId || record.id}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>

      <Modal
        title="เพิ่มผู้ใช้งานเข้าอีเว้นท์"
        open={isAddUserModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddUserModalOpen(false);
          form.resetFields();
        }}
        okText="Add Member"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item
            label="เลือกผู้ใช้งาน"
            name="userId"
            rules={[{ required: true, message: "กรุณาเลือกผู้ใช้งาน" }]}
          >
            <Select
              showSearch
              placeholder="ค้นหาชื่อ, นามสกุล หรืออีเมล"
              options={allUsers.map((user) => ({
                value: user.id || user.userId,
                label: `${user.firstName || ""} ${user.lastName || ""} (${user.email})`,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}