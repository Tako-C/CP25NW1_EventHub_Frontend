"use client";

import { useState, useEffect, useMemo } from "react"; // เพิ่ม useMemo
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Typography,
  DatePicker,
} from "antd";
import { PlusOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"; // เพิ่ม SearchOutlined
import {
  getData,
  createAccount,
  deleteAccount,
  updateStatusAccount,
} from "@/libs/fetch";

import Notification from "@/components/Notification/Notification";

const { Title } = Typography;

export default function Page() {
  const [dataSource, setDataSource] = useState([]); // เปลี่ยนเริ่มต้นเป็น array ว่าง
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(""); // เพิ่ม state สำหรับ search
  const [form] = Form.useForm();

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  // --- Search Logic ---
  const filteredData = useMemo(() => {
    if (!dataSource) return [];
    return dataSource.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      const search = searchText.toLowerCase();
      return fullName.includes(search) || email.includes(search);
    });
  }, [dataSource, searchText]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getData("admin/users");
      const data = res?.data || [];
      const sortedUser = [...data].sort((a, b) => a.id - b.id);
      setDataSource(sortedUser);
    } catch (error) {
      showNotification("ไม่สามารถดึงข้อมูลผู้ใช้ได้", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatusAccount(id, newStatus);
      showNotification(`เปลี่ยนสถานะเป็น ${newStatus} สำเร็จ`);
      await fetchData();
    } catch (error) {
      showNotification("ไม่สามารถเปลี่ยนสถานะได้", true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      showNotification("ลบผู้ใช้งานสำเร็จ");
      await fetchData();
    } catch (error) {
      showNotification("ไม่สามารถลบผู้ใช้งานได้", true);
    }
  };

  const handleAdd = async (values) => {
    try {
      const res = await createAccount(values);
      if (res?.statusCode === 201) {
        setIsModalOpen(false);
        form.resetFields();
        showNotification("สร้างบัญชีผู้ใช้ใหม่สำเร็จ");
        await fetchData();
      }
    } catch (error) {
      showNotification("ไม่สามารถสร้างบัญชีผู้ใช้ได้", true);
    }
  };

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (_, r) => `${r.firstName} ${r.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Select.Option value="ACTIVE">
            <Tag color="green">ACTIVE</Tag>
          </Select.Option>
          <Select.Option value="INACTIVE">
            <Tag color="grey">INACTIVE</Tag>
          </Select.Option>
          <Select.Option value="BAN">
            <Tag color="red">BAN</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Delete the user"
            description="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />

      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
        <Title level={3} className="!m-0">
          User Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600"
        >
          Add New User
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {/* --- ส่วนของ Input Search --- */}
        <div className="mb-4">
          <Input
            placeholder="Search by name or email..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md rounded-lg"
            allowClear
          />
        </div>

        <Table
          dataSource={filteredData} // เปลี่ยนมาใช้ข้อมูลที่ Filter แล้ว
          columns={columns}
          rowKey="id"
          bordered
          loading={loading}
          className="admin-table"
        />
      </div>

      {/* Modal Add New User คงเดิม ... */}
      <Modal
        title="Add New User Account"
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="Create"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          initialValues={{ gender: "N" }}
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please input valid email!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Date Of Birth"
            name="dateOfBirth"
            rules={[
              { required: true, message: "Please select your birthday!" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select date"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select>
              <Select.Option value="M">Male</Select.Option>
              <Select.Option value="F">Female</Select.Option>
              <Select.Option value="U">เพศที่สาม</Select.Option>
              <Select.Option value="N">ไม่ระบุ</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}