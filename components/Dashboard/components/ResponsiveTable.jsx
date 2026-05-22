import { useState, useEffect } from "react";
import { Card, Table, Input } from "antd";
import { SearchOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

export default function ResponsiveTable({
  title,
  data,
  columns,
  loading,
  searchable = false,
  onSearch,
  searchText,
  renderMobileItem,
  compactMobile = false,
  mobilePageSize = 5,
}) {
  const [mobilePage, setMobilePage] = useState(1);

  useEffect(() => { setMobilePage(1); }, [data]);

  const totalPages = Math.ceil((data?.length ?? 0) / mobilePageSize);
  const startIndex = (mobilePage - 1) * mobilePageSize;
  const mobileItems = (data ?? []).slice(startIndex, startIndex + mobilePageSize);

  return (
    <Card
      variant="borderless"
      title={<span className="text-base md:text-lg font-semibold">{title}</span>}
      className="rounded-xl md:rounded-2xl border-2 border-[#f0f0f0] shadow-sm"
      styles={{ body: { padding: 0 } }}
    >
      <div className={compactMobile ? "p-4 md:p-6" : "p-6"}>
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

        {/* Desktop — Ant Design Table (unchanged) */}
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

        {/* ── Mobile — clean card list ── */}
        <div className="md:hidden">
          <div className="space-y-2">
            {mobileItems.length > 0 ? (
              mobileItems.map((item) => renderMobileItem(item))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                ไม่พบข้อมูล
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between px-1 py-2">
              <span className="text-xs text-gray-400">
                {startIndex + 1}–{Math.min(startIndex + mobilePageSize, data.length)}{" "}
                / {data.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMobilePage((p) => Math.max(1, p - 1))}
                  disabled={mobilePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed active:bg-gray-50"
                >
                  <LeftOutlined style={{ fontSize: 10 }} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - mobilePage) <= 1;
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`e-${idx}`} className="text-xs text-gray-300 px-0.5">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setMobilePage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          mobilePage === p
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-gray-200 text-gray-500"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setMobilePage((p) => Math.min(totalPages, p + 1))}
                  disabled={mobilePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed active:bg-gray-50"
                >
                  <RightOutlined style={{ fontSize: 10 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
