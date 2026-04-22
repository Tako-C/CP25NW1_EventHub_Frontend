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
  const isOrganizer = baseBreadcrumb === "Organizer";

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
    if (!isOrganizer) {
      fetchAllUsers();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
if (isOrganizer) {
  const res = await getData("users/me/registered-events");
  if (res?.statusCode === 200 && Array.isArray(res?.data)) {
    const organizerEvents = res.data.filter(
      (e) => e.eventRole === "ORGANIZER"
    );
    console.log(organizerEvents)
    const detailedEvents = await Promise.all(
      organizerEvents.map(async (registeredEvent) => {
        const [eventRes, usersRes] = await Promise.all([
          getData(`events/${registeredEvent.eventId}`),
          getData(`admin/events/${registeredEvent.eventId}/users`),
        ]);
        const participantCount = Array.isArray(usersRes?.data)
          ? usersRes.data.length
          : 0;
        if (eventRes?.statusCode === 200) {
          return {
            ...registeredEvent,
            ...eventRes.data,
            eventRole: registeredEvent.eventRole, // ป้องกัน eventRole ถูก overwrite
            key: registeredEvent.eventId,
            id: registeredEvent.eventId,
            name: eventRes.data.eventName,
            date: eventRes.data.startDate?.split("T")[0] ?? "-",
            participantCount,
          };
        }
        return {
          ...registeredEvent,
          key: registeredEvent.eventId,
          id: registeredEvent.eventId,
          name: registeredEvent.eventName ?? "-",
          date: registeredEvent.startDate?.split("T")[0] ?? "-",
          participantCount,
        };
      })
    );
    setEvents(detailedEvents);
  }
      } else {
        const test = await getDataNoToken("events");
        console.log(test);
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
    const alreadyInEvent = eventUsers.find(
      (u) => (u.userId || u.id) === values.userId
    );
    if (alreadyInEvent) {
      showNotification(
        `เคยเพิ่ม user ${alreadyInEvent.email} แล้ว`,
        true
      );
      return;
    }

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
      fill: { fgColor: { rgb: "16a34a" } },
    };
    ["STAFF", "EXHIBITOR"].forEach((sheetName) => {
      const ws = XLSX.utils.aoa_to_sheet(headerData);
      ws["!cols"] = colsConfig;
      ["A1", "B1", "C1", "D1", "E1"].forEach((cell) => {
        if (ws[cell]) ws[cell].s = headerStyle;
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

  const resetImport = () => {
    setImportStep(0);
    setParsedRows([]);
    setSelectedFile(null);
    setFileName("");
    setImportResult(null);
  };

  const handleConfirmImport = async () => {
    // --- Duplicate Email Check against existing event users ---
    const existingEmails = new Set(
      eventUsers.map((u) => (u.email || "").toLowerCase().trim())
    );
    const validRows = parsedRows.filter((r) => r._errors.length === 0);
    const duplicateRows = validRows.filter((r) =>
      existingEmails.has((r.email || "").toLowerCase().trim())
    );

    if (duplicateRows.length > 0) {
      const emails = duplicateRows.map((r) => r.email).join(", ");
      showNotification(
        `พบ ${duplicateRows.length} คนที่เคยเพิ่มแล้วในอีเว้นท์นี้: ${emails}`,
        true
      );
      return;
    }

    setImportLoading(true);
    try {
      const res = await importUsersToEvent(selectedEvent.id, selectedFile);
      setImportResult({
        success: res?.successCount ?? validRows.length,
        failed: parsedRows.filter((r) => r._errors.length > 0).length,
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
      render: (count) => (
        <Tag color="blue" className="px-3 rounded-full">
          {count} คน
        </Tag>
      ),
    },
    {
      title: "จัดการ",
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
        <Popconfirm
          title="ยืนยันการนำออก"
          onConfirm={() => handleRemoveUser(record.userId)}
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const validRows = parsedRows.filter((r) => r._errors.length === 0);
  const invalidRows = parsedRows.filter((r) => r._errors.length > 0);

  const previewColumns = [
    {
      title: "Sheet",
      dataIndex: "role",
      render: (role) => (
        <Tag color={role === "STAFF" ? "blue" : "purple"}>{role}</Tag>
      ),
    },
    { title: "First Name", dataIndex: "firstName" },
    { title: "Last Name", dataIndex: "lastName" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Status",
      render: (_, r) =>
        r._errors.length === 0 ? (
          <CheckCircleOutlined style={{ color: "#22c55e" }} />
        ) : (
          <Tooltip title={r._errors.join(", ")}>
            <CloseCircleOutlined style={{ color: "#ef4444" }} />
          </Tooltip>
        ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Notification {...notification} onClose={closeNotification} style={{ zIndex: 9999 }} />

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
                icon={<DownloadOutlined />}
                onClick={() => downloadTemplate(selectedEvent.name)}
              >
                Download Template
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => setImportOpen(true)}
                className="bg-green-600 border-green-600"
              >
                Import Excel
              </Button>
              {/* ซ่อน Add User สำหรับ Organizer เพราะไม่มีสิทธิ์ดึง admin/users */}
              {!isOrganizer && (
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  onClick={() => setIsAddUserModalOpen(true)}
                >
                  Add User
                </Button>
              )}
            </Space>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {!selectedEvent ? (
          <Table
            dataSource={events}
            columns={eventColumns}
            rowKey="id"
            loading={loading}
          />
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

      {/* Add User Modal (Admin only) */}
      {!isOrganizer && (
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
                placeholder="ค้นหาชื่อ หรืออีเมล"
                options={allUsers.map((u) => ({
                  value: u.id || u.userId,
                  label: `${u.firstName} ${u.lastName} (${u.email})`,
                }))}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      )}

      {/* Import Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileExcelOutlined style={{ color: "#16a34a" }} />
            <span>Import Users via Excel</span>
          </div>
        }
        open={importOpen}
        onCancel={() => {
          setImportOpen(false);
          resetImport();
        }}
        width={820}
        footer={
          importStep === 0
            ? null
            : importStep === 1
            ? (
              <div className="flex justify-between items-center">
                <Button onClick={resetImport}>← เปลี่ยนไฟล์</Button>
                <Space>
                  <Button onClick={() => { setImportOpen(false); resetImport(); }}>
                    ยกเลิก
                  </Button>
                  <Button
                    type="primary"
                    loading={importLoading}
                    disabled={validRows.length === 0}
                    onClick={handleConfirmImport}
                    className="bg-green-600 border-green-600"
                  >
                    ส่งไฟล์เพื่อ Import
                  </Button>
                </Space>
              </div>
            )
            : (
              <Button type="primary" onClick={() => { setImportOpen(false); resetImport(); }}>
                เสร็จสิ้น
              </Button>
            )
        }
      >
        <Steps
          current={importStep}
          size="small"
          className="mb-6"
          items={[
            { title: "อัปโหลดไฟล์", icon: <UploadOutlined /> },
            { title: "ตรวจสอบข้อมูล", icon: <WarningOutlined /> },
            { title: "สำเร็จ", icon: <CheckCircleOutlined /> },
          ]}
        />

        {importStep === 0 && (
          <Upload.Dragger
            accept=".xlsx"
            showUploadList={false}
            beforeUpload={handleFileUpload}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 40, color: "#16a34a" }} />
            </p>
            <p className="ant-upload-text">คลิกหรือลากไฟล์ .xlsx มาวางที่นี่</p>
            <p className="ant-upload-hint text-gray-400">รองรับเฉพาะ .xlsx</p>
          </Upload.Dragger>
        )}

        {importStep === 1 && (
          <div>
            <div className="flex items-center gap-4 mb-3 flex-wrap">
              <Text type="secondary" className="text-sm">
                ไฟล์: <strong>{fileName}</strong>
              </Text>
              <Space>
                <Badge
                  count={validRows.length}
                  style={{ backgroundColor: "#22c55e" }}
                  showZero
                >
                  <Tag color="green" className="mr-2">
                    พร้อม import
                  </Tag>
                </Badge>
                {invalidRows.length > 0 && (
                  <Badge
                    count={invalidRows.length}
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    <Tag color="red" className="mr-2">
                      มีข้อผิดพลาด
                    </Tag>
                  </Badge>
                )}
              </Space>
            </div>

            {invalidRows.length > 0 && (
              <Alert
                className="mb-3"
                type="warning"
                showIcon
                message={`พบ ${invalidRows.length} แถวที่มีข้อผิดพลาด`}
                description={
                  <ul className="mt-1 text-sm space-y-0.5 max-h-24 overflow-y-auto">
                    {invalidRows.map((r) => (
                      <li key={`${r.role}-${r._rowIndex}`}>
                        แถว {r._rowIndex} ({r.role}): {r._errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                }
              />
            )}

            <Table
              dataSource={parsedRows}
              columns={previewColumns}
              rowKey={(r) => `${r.role}-${r._rowIndex}`}
              size="small"
              pagination={{ pageSize: 8, size: "small" }}
              scroll={{ x: 700 }}
              rowClassName={(r) => (r._errors.length > 0 ? "bg-red-50" : "")}
              bordered
            />
          </div>
        )}

        {importStep === 2 && importResult && (
          <div className="py-4 text-center">
            <CheckCircleOutlined style={{ fontSize: 52, color: "#22c55e" }} />
            <Title level={4} className="mt-4 !mb-1">
              Import เสร็จสิ้น
            </Title>
            <Text type="secondary">ผลลัพธ์การนำเข้าข้อมูลจากไฟล์</Text>
            <Divider />
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {importResult.success}
                </div>
                <div className="text-sm text-gray-500 mt-1">นำเข้าสำเร็จ</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-400">
                  {importResult.total}
                </div>
                <div className="text-sm text-gray-500 mt-1">ทั้งหมด</div>
              </div>
              {importResult.failed > 0 && (
                <div>
                  <div className="text-3xl font-bold text-red-500">
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">พบข้อผิดพลาด</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}