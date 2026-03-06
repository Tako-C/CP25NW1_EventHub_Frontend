"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Popconfirm,
  message,
  Typography,
  Breadcrumb,
} from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  getData,
  postAddUserToEvent,
  updateUserRoleInEvent,
  removeUserFromEvent,
} from "@/libs/fetch";

const { Title } = Typography;

export default function UserEventPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventUsers, setEventUsers] = useState([]);

  const [allUsers, setAllUsers] = useState([]);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchAllUsers();
  }, []);

  const fetchData = async () => {
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
          date: event.startDate.split("T")[0],
          participantCount: participantCount,
        };
      });
      setEvents(processedEvents);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await getData("admin/users");
      if (res?.data) {
        setAllUsers(res.data);
      }
    } catch (error) {
      console.error("ดึงข้อมูล User ทั้งหมดไม่สำเร็จ", error);
    }
  };

  const handleManageUsers = async (eventRecord) => {
    setSelectedEvent(eventRecord);
    try {
      const res = await getData(`admin/events/${eventRecord.id}/users`);
      if (res?.data) {
        setEventUsers(res?.data);
      }
    } catch (error) {
      message.error("ไม่สามารถดึงข้อมูลผู้ใช้งานในอีเว้นท์นี้ได้");
      console.error(error);
    }
  };

  const handleAddUser = async (values) => {
    try {
      await postAddUserToEvent(selectedEvent.id, values.userId);

      message.success("เพิ่มผู้ใช้งานเข้าอีเว้นท์สำเร็จ");
      setIsAddUserModalOpen(false);
      form.resetFields();

      handleManageUsers(selectedEvent);
    } catch (error) {
      message.error(error.message || "เกิดข้อผิดพลาดในการเพิ่มผู้ใช้งาน");
    }
  };

const handleRemoveUser = async (userId) => {
    try {
      await removeUserFromEvent(selectedEvent.id, userId);
      handleManageUsers(selectedEvent);
    } catch (error) {
      message.error(error.message || "เกิดข้อผิดพลาดในการเอาผู้ใช้งานออก");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await updateUserRoleInEvent(selectedEvent.id, userId, newRole);
      handleManageUsers(selectedEvent);
    } catch (error) {
      message.error(error.message || "เกิดข้อผิดพลาดในการอัปเดตบทบาท");
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
          defaultValue={role}
          style={{ width: 120 }}
          onChange={(value) => handleChangeRole(record.userId, value)}
        >
          <Select.Option value="EXHIBITOR">Exhibitor</Select.Option>
          <Select.Option value="STAFF">Staff</Select.Option>
          <Select.Option value="VISITOR">Visitor</Select.Option>
        </Select>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="เอาออกจากอีเว้นท์?"
          onConfirm={() => handleRemoveUser(record.userId)}
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const eventColumns = [
    {
      title: "ชื่ออีเว้นท์",
      dataIndex: "name",
      key: "name",
      className: "font-medium",
    },
    { title: "วันที่จัดงาน", dataIndex: "date", key: "date" },
    {
      title: "ผู้เข้าร่วม",
      dataIndex: "participantCount",
      key: "participantCount",
      render: (count) => <Tag color="blue">{count} คน</Tag>,
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
      <div className="mb-6">
        <Breadcrumb
          className="mb-2"
          items={[
            { title: "Admin" },
            { title: "User Events" },
            ...(selectedEvent ? [{ title: selectedEvent.name }] : []),
          ]}
        ></Breadcrumb>

        <div className="flex justify-between items-center">
          <Title level={2} className="!m-0 text-gray-800">
            {selectedEvent
              ? `จัดการผู้ใช้งาน: ${selectedEvent.name}`
              : "รายการอีเว้นท์ทั้งหมด"}
          </Title>

          {selectedEvent && (
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setSelectedEvent(null)}
              >
                กลับหน้าหลัก
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-green-600 hover:!bg-green-500"
              >
                เพิ่มคนเข้าอีเว้นท์
              </Button>
            </Space>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {!selectedEvent ? (
          <Table dataSource={events} columns={eventColumns} rowKey="id" />
        ) : (
          <Table
            dataSource={eventUsers}
            columns={userColumns}
            rowKey={(record) => record.userId || record.id}
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
              optionFilterProp="label"
              options={allUsers.map((user) => ({
                value: user.id || user.userId,
                label: `${user.firstName || ""} ${user.lastName || ""} (${user.email})`,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
