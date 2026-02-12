import { Card, Table, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export default function ResponsiveTable({
  title,
  data,
  columns,
  loading,
  searchable = false,
  onSearch,
  searchText,
  renderMobileItem, // ฟังก์ชันสำหรับ render หน้าจอมือถือ
}) {
  return (
    <Card
      variant="borderless"
      title={<span className="text-lg font-semibold">{title}</span>}
      className="rounded-xl border-2 border-[#f0f0f0] shadow-sm"
      styles={{ body: { padding: "24px" } }}
    >
      {searchable && (
        <div className="mb-4">
          <Input
            placeholder="Search name..."
            prefix={<SearchOutlined />}
            className="w-full md:w-[250px] rounded-full"
            onChange={onSearch}
            value={searchText}
            size="large"
          />
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          bordered
          loading={loading}
          rowKey="key"
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {data && data.length > 0 ? (
          data.map((item) => renderMobileItem(item))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No data found
          </div>
        )}
      </div>
    </Card>
  );
}