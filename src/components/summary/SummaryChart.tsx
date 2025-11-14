import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

interface ChartProps {
  data: any[];
}

export default function SummaryChart({ data }: ChartProps) {
  return (
    <div className="w-full h-80 mb-10 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow-inner">
      <ResponsiveContainer>
        <BarChart
          data={data.map((d) => ({
            ...d,
            avgrx: d.avgrx / 1024 / 1024,
            avgtx: d.avgtx / 1024 / 1024,
          }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="period"
            tickFormatter={(v) => new Date(v).toLocaleDateString("id-ID")}
            stroke="#9ca3af"
          />
          <YAxis
            stroke="#9ca3af"
            tickFormatter={(val) => val.toFixed(2)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(30,41,59,0.9)",
              borderRadius: "8px",
              color: "#f9fafb",
            }}
            labelStyle={{ color: "#a5b4fc" }}
            formatter={(val: number, key: string) => {
              if (key.includes("cpu") || key.includes("mem"))
                return [`${val.toFixed(2)}%`, key];
              return [`${val.toFixed(2)} MB`, key];
            }}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("id-ID")
            }
          />
          <Legend />
          <Bar dataKey="avgcpu" fill="#6366f1" name="Avg CPU (%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avgmem" fill="#22c55e" name="Avg Mem (%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avgrx" fill="#f59e0b" name="Avg RX (MB)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avgtx" fill="#ef4444" name="Avg TX (MB)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
