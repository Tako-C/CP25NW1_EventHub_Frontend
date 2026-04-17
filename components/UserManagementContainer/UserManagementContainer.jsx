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
  Upload,
  Steps,
  Alert,
  Badge,
  Divider,
  Tooltip,
} from "antd";
import {
  TeamOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  FileExcelOutlined,
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx-js-style";
import {
  getData,
  getDataNoToken,
  postAddUserToEvent,
  updateUserRoleInEvent,
  removeUserFromEvent,
  importUsersToEvent,
} from "@/libs/fetch";

import Notification from "@/components/Notification/Notification";

const { Title, Text } = Typography;

/** * Constants & Helpers 
 * (แยกไว้ด้านนอกเพื่อความเป็นระเบียบและไม่ถูกประกาศซ้ำเมื่อ Re-render)
 */
const ROLE_PRIORITY = {
  ORGANIZER: 1,
  STAFF: 2,
  EXHIBITOR: 3,
  VISITOR: 4,
};

const GENDER_MAP = { male: "M", female: "F", m: "M", f: "F", u: "U", n: "N" };

const normalizeGender = (val) => {
  if (!val) return "N";
  return GENDER_MAP[String(val).toLowerCase().trim()] ?? "N";
};

const formatDateOfBirth = (val) => {
  if (!val) return null;
  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }
  const d = new Date(val);
  return !isNaN(d)
    ? d.toISOString().split("T")[0]
    : String(val).split("T")[0] ?? null;
};

const validateRow = (row) => {
  const errors = [];
  if (!row.firstName) errors.push("First Name ว่าง");
  if (!row.lastName) errors.push("Last Name ว่าง");
  if (!row.email) {
    errors.push("Email ว่าง");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push("Email ไม่ถูกต้อง");
  }
  if (!row.dateOfBirth) errors.push("Date of Birth ว่าง");
  return errors;
};

export default function UserManagementContainer({ baseBreadcrumb = "Admin" }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventUsers, setEventUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Import States
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

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
      const test = await getDataNoToken('events');
      console.log(test)
      const res = await getData("events");
      const resEvent = await getData(`admin/events/users`);
      if (res?.data && resEvent?.data) {
        const processedEvents = res.data.map((event) => {
          const participantCount = resEvent.data.filter(
            (u) => u.eventId === event.id
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
      const res = await getData(`admin/users`);
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

  // --- Excel Logic ---

  const downloadTemplate = (eventName) => {
    const wb = XLSX.utils.book_new();
    const headerData = [["First Name", "Last Name", "Email", "Gender", "Date of Birth"]];
    const colsConfig = [{ wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "16A34A" } },
      alignment: { horizontal: "center" },
    };
    ["STAFF", "EXHIBITOR"].forEach((sheetName) => {
      const ws = XLSX.utils.aoa_to_sheet(headerData);
      ws["!cols"] = colsConfig;
      headerData[0].forEach((_, i) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
        if (ws[cellRef]) ws[cellRef].s = headerStyle;
      });
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    const safeName = (eventName || "event").replace(/[^a-zA-Z0-9ก-๙]/g, "_");
    XLSX.writeFile(wb, `Template_${safeName}.xlsx`);
  };

  const handleFileUpload = (file) => {
    setFileName(file.name);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const allRows = [];
        ["STAFF", "EXHIBITOR"].forEach((role) => {
          const sheet = wb.Sheets[role];
          if (sheet) {
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            rows.slice(1).forEach((r, i) => {
              if (r.some((cell) => String(cell).trim() !== "")) {
                const rowData = {
                  _rowIndex: i + 2,
                  firstName: String(r[0] ?? "").trim(),
                  lastName: String(r[1] ?? "").trim(),
                  email: String(r[2] ?? "").trim(),
                  gender: normalizeGender(r[3]),
                  dateOfBirth: formatDateOfBirth(r[4]),
                  role,
                };
                allRows.push({ ...rowData, _errors: validateRow(rowData) });
              }
            });
          }
        });
        if (allRows.length === 0) {
          showNotification("ไม่พบข้อมูลในไฟล์", true);
          return;
        }
        setParsedRows(allRows);
        setImportStep(1);
      } catch (err) {
        showNotification("อ่านไฟล์ล้มเหลว", true);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleConfirmImport = async () => {
    setImportLoading(true);
    try {
      const res = await importUsersToEvent(selectedEvent.id, selectedFile);
      setImportResult({
        success: res?.successCount ?? parsedRows.filter(r => r._errors.length === 0).length,
        failed: parsedRows.filter(r => r._errors.length > 0).length,
        total: parsedRows.length,
      });
      setImportStep(2);
      await handleManageUsers(selectedEvent);
      await fetchData();
    } catch (error) {
      showNotification("Import ล้มเหลว", true);
    } finally {
      setImportLoading(false);
    }
  };

  // --- UI Columns ---

  const eventColumns = [
    { title: "ชื่ออีเว้นท์", dataIndex: "name", key: "name", className: "font-medium" },
    { title: "วันที่จัดงาน", dataIndex: "date", key: "date" },
    {
      title: "ผู้เข้าร่วม",
      dataIndex: "participantCount",
      render: (count) => <Tag color="blue" className="px-3 rounded-full">{count} คน</Tag>,
    },
    {
      title: "จัดการ",
      render: (_, record) => (
        <Button type="primary" icon={<TeamOutlined />} onClick={() => handleManageUsers(record)}>
          Manage Users
        </Button>
      ),
    },
  ];

  const userColumns = [
    {
      title: "ชื่อ-นามสกุล",
      render: (_, r) => `${r.firstName || ""} ${r.lastName || ""}`,
    },
    { title: "อีเมล", dataIndex: "email", key: "email" },
    {
      title: "บทบาท (Role)",
      dataIndex: "eventRole",
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
      render: (_, record) => (
        <Popconfirm title="ยืนยันการนำออก" onConfirm={() => handleRemoveUser(record.userId)}>
          <Button type="text" danger icon={<DeleteOutlined />}>Remove</Button>
        </Popconfirm>
      ),
    },
  ];

  const previewColumns = [
    { title: "Sheet", dataIndex: "role", render: (role) => <Tag color={role === "STAFF" ? "blue" : "purple"}>{role}</Tag> },
    { title: "First Name", dataIndex: "firstName" },
    { title: "Last Name", dataIndex: "lastName" },
    { title: "Email", dataIndex: "email" },
    { title: "Status", render: (_, r) => r._errors.length === 0 ? <CheckCircleOutlined style={{ color: "#22c55e" }} /> : <CloseCircleOutlined style={{ color: "#ef4444" }} /> },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Notification {...notification} onClose={closeNotification} />

      <div className="mb-6">
        <Breadcrumb
          className="mb-4"
          items={[
            { title: baseBreadcrumb },
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
              <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedEvent(null)}>กลับหน้าหลัก</Button>
              <Button icon={<DownloadOutlined />} onClick={() => downloadTemplate(selectedEvent.name)}>Download Template</Button>
              <Button type="primary" icon={<FileExcelOutlined />} onClick={() => setImportOpen(true)} className="bg-green-600 border-green-600">Import Excel</Button>
              <Button type="primary" icon={<TeamOutlined />} onClick={() => setIsAddUserModalOpen(true)}>Add User</Button>
            </Space>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {!selectedEvent ? (
          <Table dataSource={events} columns={eventColumns} rowKey="id" loading={loading} />
        ) : (
          <>
            <Input
              placeholder="ค้นหาชื่อ หรือ อีเมล..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="max-w-md rounded-lg mb-4"
              allowClear
            />
            <Table
              dataSource={filteredAndSortedUsers}
              columns={userColumns}
              rowKey={(record) => record.userId || record.id}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </div>

      {/* --- Modals --- */}
      
      {/* Add User Modal */}
      <Modal
        title="เพิ่มผู้ใช้งานเข้าอีเว้นท์"
        open={isAddUserModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsAddUserModalOpen(false)}
        okText="Add Member"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item label="เลือกผู้ใช้งาน" name="userId" rules={[{ required: true, message: "กรุณาเลือกผู้ใช้งาน" }]}>
            <Select
              showSearch
              placeholder="ค้นหาชื่อ หรืออีเมล"
              options={allUsers.map((u) => ({ value: u.id || u.userId, label: `${u.firstName} ${u.lastName} (${u.email})` }))}
              filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Import Users via Excel"
        open={importOpen}
        onCancel={() => { setImportOpen(false); setImportStep(0); }}
        width={820}
        footer={importStep === 2 ? <Button onClick={() => setImportOpen(false)}>ปิด</Button> : null}
      >
        <Steps current={importStep} items={[{ title: "Upload" }, { title: "Preview" }, { title: "Result" }]} className="mb-6" />
        
        {importStep === 0 && (
          <Upload.Dragger accept=".xlsx" showUploadList={false} beforeUpload={handleFileUpload}>
            <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: "#16a34a" }} /></p>
            <p className="ant-upload-text">คลิกหรือลากไฟล์ .xlsx มาวางที่นี่</p>
          </Upload.Dragger>
        )}

        {importStep === 1 && (
          <>
            <Table dataSource={parsedRows} columns={previewColumns} size="small" pagination={{ pageSize: 5 }} className="mb-4" />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setImportStep(0)}>เปลี่ยนไฟล์</Button>
              <Button type="primary" loading={importLoading} onClick={handleConfirmImport} className="bg-green-600">ยืนยัน Import</Button>
            </div>
          </>
        )}

        {importStep === 2 && importResult && (
          <div className="text-center py-4">
            <CheckCircleOutlined style={{ fontSize: 48, color: "#22c55e" }} />
            <Title level={4} className="mt-4">Import สำเร็จ</Title>
            <Text>สำเร็จ: {importResult.success} | ผิดพลาด: {importResult.failed}</Text>
          </div>
        )}
      </Modal>
    </div>
  );
}