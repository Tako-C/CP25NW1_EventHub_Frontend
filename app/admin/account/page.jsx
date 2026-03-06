"use client";

import { useState, useEffect } from "react";
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
  message,
  Typography,
  DatePicker,
} from "antd";
import { PlusOutlined, DeleteOutlined, SwapOutlined } from "@ant-design/icons";
import {
  getData,
  createAccount,
  deleteAccount,
  updateStatusAccount,
} from "@/libs/fetch";

const { Title } = Typography;

export default function Page() {
  const [dataSource, setDataSource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateStatusAccount(item.id, newStatus);
      await fetchData();
    } catch (error) {
      message.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccount(id);
      await fetchData();
    } catch (error) {
      message.error(error.message || "Failed to delete user");
    }
  };

  const handleAdd = async (values) => {
    try {
      const res = await createAccount(values);
      if (res?.statusCode === 201) {
        setIsModalOpen(false);
        form.resetFields();
        await fetchData();
      }
    } catch (error) {
      message.error(error.message || "Failed to add user");
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
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "grey"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            size="small"
            icon={<SwapOutlined />}
            onClick={() => toggleStatus(record)}
          >
            Toggle Status
          </Button>

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getData("admin/users");
    console.log(res);
    setDataSource(res?.data);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-20">
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
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          bordered
          className="admin-table"
        />
      </div>

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
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input password",
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
