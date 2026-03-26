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
  compactMobile = false,
}) {
  const bodyClass = compactMobile ? "p-4 md:p-6" : "p-6";

  return (
    <Card
      variant="borderless"
      title={
        <span className="text-base md:text-lg font-semibold">{title}</span>
      }
      className="rounded-xl md:rounded-2xl border-2 border-[#f0f0f0] shadow-sm"
      styles={{ body: { padding: 0 } }}
    >
      <div className={bodyClass}>
        {searchable && (
          <div className="mb-3 md:mb-4">
            <Input
              placeholder="Search name..."
              prefix={<SearchOutlined />}
              className="w-full md:w-[250px] rounded-full"
              onChange={onSearch}
              value={searchText}
              size={compactMobile ? "middle" : "large"}
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
        <div
          className={`md:hidden ${compactMobile ? "space-y-3" : "space-y-4"}`}
        >
          {data && data.length > 0 ? (
            data.map((item) => renderMobileItem(item))
          ) : (
            <div className="text-center py-8 text-gray-400">No data found</div>
          )}
        </div>
      </div>
    </Card>
  );
}
