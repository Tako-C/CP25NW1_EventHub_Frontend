"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  Package,
  Gift,
  Calendar,
  Tag as TagIcon,
  Search,
} from "lucide-react";
import {
  Table,
  Tag,
  Select,
  Button,
  Space,
  Card,
  Modal,
  notification,
  Input,
} from "antd";
import dayjs from "dayjs";
import { RewardImage } from "@/utils/getImage";
import {
  getDataNoToken,
  getData,
  hardDeleteRewardByAdmin,
  updateRewardByAdmin,
} from "@/libs/fetch";

export default function EventRewardTablePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchData();
    // checkUserToken();
  }, []);

  const fetchData = async () => {
    const [eventRes, rewardsRes] = await Promise.all([
      getDataNoToken(`events/${id}`),
      getData(`admin/events/${id}/rewards`),
    ]);
    console.log(eventRes);
    console.log(rewardsRes);
    setData(rewardsRes?.data);
  };

  const filteredData = data?.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleDelete = (rewardId) => {
    Modal.confirm({
      title: "ยืนยันการลบของรางวัล?",
      content:
        "นี่คือการลบแบบ Hard Delete ข้อมูลจะถูกลบออกจากระบบถาวรและไม่สามารถกู้คืนได้",
      okText: "ลบถาวร",
      okType: "danger",
      cancelText: "ยกเลิก",
      centered: true,
      onOk: async () => {
        try {
          await hardDeleteRewardByAdmin(id, rewardId);
          notification.success({
            message: "ลบสำเร็จ",
            description: "ข้อมูลรางวัลถูกลบออกจากระบบแล้ว",
          });
          fetchData(); 
        } catch (error) {
          notification.error({
            message: "ลบไม่สำเร็จ",
            description: error.message || "เกิดข้อผิดพลาดในการลบ",
          });
        }
      },
    });
  };

  const columns = [
    {
      title: "REWARD",
      key: "rewardInfo",
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
            <RewardImage
              imagePath={record.imagePath}
              rewardName={record.name}
            />
          </div>
          <div>
            <div className="font-black text-slate-800 text-base">
              {record.name}
            </div>
            <div className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">
              {record.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "REQUIREMENT",
      dataIndex: "requirementType",
      render: (type) => (
        <Tag
          color="purple"
          className="font-bold rounded-lg border-none px-3 uppercase text-[10px]"
        >
          {type.replace(/_/g, " ")}
        </Tag>
      ),
    },
    {
      title: "STOCK",
      dataIndex: "quantity",
      render: (qty) => (
        <div className="flex items-center gap-2 font-black text-slate-700">
          <Package size={14} className="text-amber-500" /> {qty}
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      render: (status, record) => (
        <Select
          value={status}
          loading={loading}
          onChange={async (val) => {
            try {
              setLoading(true);
              const formData = new FormData();
              formData.append("status", val);
              await updateRewardByAdmin(id, record.id, formData);

              setData(
                data.map((s) =>
                  s.id === record.id ? { ...s, status: val } : s,
                ),
              );
              notification.success({ message: "อัปเดตสถานะของรางวัลสำเร็จ" });
            } catch (error) {
              notification.error({
                message: "อัปเดตไม่สำเร็จ",
                description: error.message,
              });
            } finally {
              setLoading(false);
            }
          }}
          className="w-40 font-black"
        >
          <Select.Option value="ACTIVE">
            <Tag color="green" className="m-0 border-none font-black uppercase">
              ACTIVE
            </Tag>
          </Select.Option>
          <Select.Option value="INACTIVE">
            <Tag
              color="default"
              className="m-0 border-none font-black uppercase"
            >
              INACTIVE
            </Tag>
          </Select.Option>
          <Select.Option value="OUT_OF_STOCK">
            <Tag
              color="orange"
              className="m-0 border-none font-black uppercase"
            >
              OUT OF STOCK
            </Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: "ACTION",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            icon={<Edit3 size={16} />}
            onClick={() =>
              router.push(`/admin/reward/${id}/edit?rewardId=${record.id}`)
            }
            className="rounded-xl"
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
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <button
              onClick={() => router.push("/admin/reward")}
              className="text-slate-400 font-black flex items-center gap-1 mb-2 hover:text-amber-600 transition-colors uppercase text-xs"
            >
              <ArrowLeft size={16} /> Back to Events
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Reward Management
            </h1>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              prefix={<Search size={18} className="text-slate-400 mr-2" />}
              placeholder="ค้นหาของรางวัล..."
              className="h-12 rounded-2xl border-none shadow-sm font-bold md:w-64"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type="primary"
              icon={<Plus size={18} />}
              className="h-12 px-8 rounded-2xl bg-slate-900 font-black border-none shadow-lg shadow-slate-200"
              onClick={() => router.push(`/admin/reward/${id}/create`)}
            >
              CREATE REWARD
            </Button>
          </div>
        </header>

        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            className="custom-admin-table"
          />
        </Card>
      </div>
    </div>
  );
}
