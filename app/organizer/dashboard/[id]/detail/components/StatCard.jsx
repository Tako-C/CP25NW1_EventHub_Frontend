import { Card } from "antd";

export default function StatCard({ title, value, valueColor = "text-blue-600" }) {
  return (
    <Card variant="borderless" className="rounded-xl border-2 border-[#f0f0f0] shadow-sm">
      <div className="font-bold text-base md:text-lg mb-4 text-gray-700">
        {title}
      </div>
      <div className={`text-4xl md:text-5xl font-bold text-right ${valueColor}`}>
        {value}
      </div>
    </Card>
  );
}