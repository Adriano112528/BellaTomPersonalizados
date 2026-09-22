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

const formatarValor = (valor) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export default function DashboardChart() {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="bellaTomPink" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="#f472b6"
                stopOpacity={0.45}
              />

              <stop
                offset="65%"
                stopColor="#ec4899"
                stopOpacity={0.16}
              />

              <stop
                offset="100%"
                stopColor="#ec4899"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#34343d"
            strokeDasharray="4 6"
            vertical={false}
          />

          <XAxis
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#9999a8",
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#9999a8",
              fontSize: 12,
            }}
            tickFormatter={(valor) => `R$ ${valor}`}
          />

          <Tooltip
            cursor={{
              stroke: "#f472b6",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
            formatter={(valor) => [formatarValor(valor), "Vendas"]}
            labelFormatter={(label) => `Dia: ${label}`}
            contentStyle={{
              background: "rgba(29, 29, 38, 0.96)",
              border: "1px solid rgba(244, 114, 182, 0.45)",
              borderRadius: "14px",
              color: "#ffffff",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.3)",
            }}
            labelStyle={{
              color: "#f9a8d4",
              fontWeight: 700,
              marginBottom: "6px",
            }}
            itemStyle={{
              color: "#ffffff",
              fontWeight: 600,
            }}
          />

          <Area
            type="monotone"
            dataKey="vendas"
            stroke="#f472b6"
            strokeWidth={3}
            fill="url(#bellaTomPink)"
            dot={{
              r: 4,
              fill: "#f472b6",
              stroke: "#241b29",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: "#f9a8d4",
              stroke: "#f472b6",
              strokeWidth: 3,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}