import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { dia: "Seg", vendas: 420 },
  { dia: "Ter", vendas: 680 },
  { dia: "Qua", vendas: 510 },
  { dia: "Qui", vendas: 980 },
  { dia: "Sex", vendas: 860 },
  { dia: "Sáb", vendas: 1230 },
  { dia: "Dom", vendas: 790 },
];

export default function DashboardChart() {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e2bc3d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#e2bc3d" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#2c2c2c"
            vertical={false}
          />

          <XAxis
            dataKey="dia"
            stroke="#888"
          />

          <YAxis
            stroke="#888"
          />

          <Tooltip
            contentStyle={{
              background: "#1d1d1d",
              border: "1px solid #333",
              borderRadius: "10px",
              color: "#fff",
            }}
          />

          <Area
            type="monotone"
            dataKey="vendas"
            stroke="#e2bc3d"
            strokeWidth={3}
            fill="url(#gold)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}