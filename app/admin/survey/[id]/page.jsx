"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  FileText,
  Users,
  Store,
  CalendarClock,
  CalendarCheck,
  Plus,
  Loader2,
} from "lucide-react";
import { Table, Tag, Select, Button, Space, Modal, notification } from "antd";
import dayjs from "dayjs";
import {
  getDataNoToken,
  deleteSurvey,
  patchSurvey,
  getData,
  hardDeleteSurveyByAdmin,
  updateSurveyStatusByAdmin,
} from "@/libs/fetch";

const STATUS_CONFIG = {
  ACTIVE: { color: "#10b981", bg: "#ecfdf5", label: "Active" },
  INACTIVE: { color: "#94a3b8", bg: "#f8fafc", label: "Inactive" },
  DELETED: { color: "#ef4444", bg: "#fef2f2", label: "Deleted" },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "3px 10px",
        borderRadius: 99,
        border: `1.5px solid ${c.color}33`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.color,
          display: "inline-block",
        }}
      />
      {c.label}
    </span>
  );
}

function SurveyTable({
  surveys,
  surveyType,
  role,
  eventId,
  onStatusChange,
  onDelete,
  onEdit,
}) {
  const columns = [
    {
      title: "ชื่อแบบสำรวจ",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                surveyType === "pre"
                  ? "linear-gradient(135deg,#ede9fe,#dbeafe)"
                  : "linear-gradient(135deg,#dcfce7,#d1fae5)",
              color: surveyType === "pre" ? "#7c3aed" : "#059669",
              flexShrink: 0,
            }}
          >
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
              {text}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {record.questions?.length ?? 0} คำถาม · {record.points} pts
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "วันที่",
      key: "dates",
      width: 160,
      render: (_, r) => (
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
          <div>สร้าง: {dayjs(r.createdAt).format("DD/MM/YY")}</div>
          <div style={{ color: "#818cf8" }}>
            แก้ไข: {dayjs(r.updatedAt).format("DD/MM/YY")}
          </div>
        </div>
      ),
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status, record) => (
        <Select
          value={status}
          size="small"
          onChange={(val) => onStatusChange(record.id, val, surveyType, role)}
          style={{ width: 130 }}
          options={[
            { value: "ACTIVE", label: <StatusBadge status="ACTIVE" /> },
            { value: "INACTIVE", label: <StatusBadge status="INACTIVE" /> },
            { value: "DELETED", label: <StatusBadge status="DELETED" /> },
          ]}
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: 100,
      align: "right",
      render: (_, record) => (
        <Space size={8}>
          <button
            onClick={() => onEdit(record, surveyType, role)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#818cf8";
              e.currentTarget.style.color = "#6366f1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1.5px solid #fee2e2",
              background: "#fff7f7",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f87171",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff7f7";
            }}
          >
            <Trash2 size={15} />
          </button>
        </Space>
      ),
    },
  ];

  if (!surveys?.length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 0",
          color: "#cbd5e1",
          borderRadius: 16,
          border: "2px dashed #e2e8f0",
          background: "#fafafa",
        }}
      >
        <FileText size={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
        <div style={{ fontSize: 13, fontWeight: 600 }}>ยังไม่มีแบบสำรวจ</div>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={surveys}
      rowKey="id"
      pagination={false}
      size="middle"
      style={{ borderRadius: 12, overflow: "hidden" }}
    />
  );
}

function RoleSection({
  title,
  icon: Icon,
  color,
  accentColor,
  surveys,
  surveyType,
  role,
  eventId,
  onStatusChange,
  onDelete,
  onEdit,
  onCreate,
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: `1.5px solid ${color}22`,
        background: "#fff",
        overflow: "hidden",
        boxShadow: `0 4px 24px ${color}0d`,
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${color}0a, ${accentColor}08)`,
          borderBottom: `1.5px solid ${color}18`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            <Icon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>
              {title}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              {surveys?.length ?? 0} แบบสำรวจ
            </div>
          </div>
        </div>
        <button
          onClick={onCreate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 12,
            background: `linear-gradient(135deg, ${color}, ${accentColor})`,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            boxShadow: `0 4px 12px ${color}40`,
            transition: "opacity .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={14} /> เพิ่มแบบสำรวจ
        </button>
      </div>

      <div style={{ padding: "16px 24px 20px" }}>
        <SurveyTable
          surveys={surveys}
          surveyType={surveyType}
          role={role}
          eventId={eventId}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}

export default function EventSurveyManager() {
  const { id } = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("pre");
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState({
    pre: { visitor: [], exhibitor: [] },
    post: { visitor: [], exhibitor: [] },
  });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getData(`admin/events/${id}/surveys`);
      const allSurveys = res?.data || [];

      const mappedSurveys = {
        pre: { visitor: [], exhibitor: [] },
        post: { visitor: [], exhibitor: [] },
      };

      allSurveys.forEach((survey) => {
        switch (survey.type) {
          case "PRE_VISITOR":
            mappedSurveys.pre.visitor.push(survey);
            break;
          case "PRE_EXHIBITOR":
            mappedSurveys.pre.exhibitor.push(survey);
            break;
          case "POST_VISITOR":
            mappedSurveys.post.visitor.push(survey);
            break;
          case "POST_EXHIBITOR":
            mappedSurveys.post.exhibitor.push(survey);
            break;
          default:
            break;
        }
      });
      setSurveys(mappedSurveys);
    } catch (e) {
      notification.error({ message: `โหลดข้อมูลล้มเหลว: ${e}` });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (surveyId, newStatus, type, role) => {
    try {
      await updateSurveyStatusByAdmin(id, surveyId, newStatus);

      setSurveys((prev) => {
        const updatedList = prev[type][role].map((s) =>
          s.id === surveyId ? { ...s, status: newStatus } : s,
        );

        const filteredList =
          newStatus === "DELETED"
            ? updatedList.filter((s) => s.id !== surveyId)
            : updatedList;

        return {
          ...prev,
          [type]: {
            ...prev[type],
            [role]: filteredList,
          },
        };
      });

      notification.success({
        message: "อัปเดตสถานะสำเร็จ",
        description: newStatus === "DELETED" ? "ลบแบบสำรวจเรียบร้อยแล้ว" : "",
      });
    } catch (e) {
      notification.error({
        message: "อัปเดตสถานะล้มเหลว",
        description: e.message,
      });
    }
  };

  const handleDelete = (surveyId) => {
    Modal.confirm({
      title: "ยืนยันการลบถาวร?",
      content: "ข้อมูลแบบสำรวจนี้จะถูกลบออกจากระบบทันทีและไม่สามารถกู้คืนได้",
      okText: "ลบถาวร",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          await hardDeleteSurveyByAdmin(id, surveyId);

          setSurveys((prev) => {
            const next = { ...prev };
            ["pre", "post"].forEach((t) =>
              ["visitor", "exhibitor"].forEach((r) => {
                next[t][r] = next[t][r].filter((s) => s.id !== surveyId);
              }),
            );
            return next;
          });

          notification.success({
            message: "ลบแบบสำรวจสำเร็จ",
            description: "แบบสำรวจถูกลบออกจากระบบถาวรเรียบร้อยแล้ว",
          });
        } catch (e) {
          notification.error({
            message: "ไม่สามารถลบข้อมูลได้",
            description: e.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
          });
        }
      },
    });
  };

  const handleEdit = (record, type, role) => {
    // router.push(`/admin/survey/${id}/edit?type=${type}&role=${role}`);
    router.push(`/admin/survey/${id}/edit/${record.id}`);
  };

  const tabs = [
    {
      key: "pre",
      label: "Pre-Event Survey",
      icon: CalendarClock,
      color: "#6366f1",
      accent: "#818cf8",
      desc: "แบบสำรวจก่อนเริ่มงาน",
    },
    {
      key: "post",
      label: "Post-Event Survey",
      icon: CalendarCheck,
      color: "#059669",
      accent: "#10b981",
      desc: "แบบสำรวจหลังจบงาน",
    },
  ];

  const activeTabConfig = tabs.find((t) => t.key === activeTab);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px 32px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <button
          onClick={() => router.push("/admin/survey")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#94a3b8",
            fontWeight: 600,
            fontSize: 13,
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: 20,
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#6366f1")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <ArrowLeft size={15} /> กลับไปหน้า Events
        </button>

        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Manage Surveys
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>
            จัดการแบบสำรวจ Pre / Post สำหรับ Visitor และ Exhibitor
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 28,
            background: "#f1f5f9",
            padding: 6,
            borderRadius: 16,
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  transition: "all .2s cubic-bezier(.34,1.56,.64,1)",
                  background: isActive ? "#fff" : "transparent",
                  color: isActive ? tab.color : "#94a3b8",
                  boxShadow: isActive
                    ? `0 2px 12px ${tab.color}20, 0 1px 3px #0001`
                    : "none",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                <Icon size={16} />
                {tab.label}
                {(() => {
                  const count =
                    (surveys[tab.key]?.visitor?.length ?? 0) +
                    (surveys[tab.key]?.exhibitor?.length ?? 0);
                  return count > 0 ? (
                    <span
                      style={{
                        background: isActive ? `${tab.color}18` : "#e2e8f0",
                        color: isActive ? tab.color : "#94a3b8",
                        borderRadius: 99,
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "1px 8px",
                      }}
                    >
                      {count}
                    </span>
                  ) : null;
                })()}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "80px 0",
            }}
          >
            <Loader2
              size={32}
              style={{ color: "#818cf8", animation: "spin 1s linear infinite" }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <RoleSection
              title="Visitor · ผู้เข้าชม"
              icon={Users}
              color="#6366f1"
              accentColor="#818cf8"
              surveys={surveys[activeTab]?.visitor ?? []}
              surveyType={activeTab}
              role="visitor"
              eventId={id}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onCreate={() =>
                router.push(
                  `/admin/survey/${id}/create?role=visitor&type=${activeTab}`,
                )
              }
            />

            <RoleSection
              title="Exhibitor · ผู้ออกบูธ"
              icon={Store}
              color="#f59e0b"
              accentColor="#fbbf24"
              surveys={surveys[activeTab]?.exhibitor ?? []}
              surveyType={activeTab}
              role="exhibitor"
              eventId={id}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onCreate={() =>
                router.push(
                  `/admin/survey/${id}/create?role=exhibitor&type=${activeTab}`,
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
