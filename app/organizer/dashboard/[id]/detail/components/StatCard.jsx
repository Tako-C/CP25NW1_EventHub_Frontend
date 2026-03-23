import { Card } from "antd";

export default function StatCard({
  title,
  value,
  valueColor = "text-blue-600",
}) {
  return (
    <Card
      variant="borderless"
      className="rounded-2xl border border-slate-200 bg-white/95 shadow-sm"
      styles={{ body: { padding: "18px 18px 16px" } }}
    >
      <div className="text-xs uppercase tracking-wide font-bold text-slate-400 mb-2">
        Dashboard Metric
      </div>
      <div className="font-extrabold text-base md:text-lg text-slate-700 leading-snug">
        {title}
      </div>
      <div
        className={`text-4xl md:text-5xl font-black text-right mt-3 ${valueColor}`}
      >
        {value}
      </div>
    </Card>
  );
}
