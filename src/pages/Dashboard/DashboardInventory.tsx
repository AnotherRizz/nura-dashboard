import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { CubeIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

// ---- TYPES ----
interface MetricData {
  totalBarang: number;
  totalIn: number;
  totalOut: number;
}

interface ChartRow {
  jumlah: number;
  tanggal: string;
}

interface ChartPoint {
  monthKey: string;
  monthLabel: string;
  in: number;
  out: number;
}

type TabMode = "in" | "out" | "both";

// ---- HELPERS ----
function monthKeyFromDateString(dateStr: string): string | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabelFromKey(key: string): string {
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleString("id-ID", { month: "short", year: "numeric" });
}

// =========================================
// MAIN COMPONENT
// =========================================

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="p-3 rounded-xl shadow-lg border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <p className="font-semibold mb-1">{label}</p>

      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: p.color }}></span>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardInventory() {
  const [metrics, setMetrics] = useState<MetricData>({
    totalBarang: 0,
    totalIn: 0,
    totalOut: 0,
  });

  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [activeTab, setActiveTab] = useState<TabMode>("in");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logIn, setLogIn] = useState<any[]>([]);
  const [logOut, setLogOut] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadMetrics(), loadMonthlyChart(), loadLatestLogs()]);
    } catch (e) {
      setError("Gagal memuat data dashboard.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadMetrics() {
    try {
      const respBarang = await supabase
        .from("Barang")
        .select("id", { count: "exact" });
      const respIn = await supabase
        .from("DetailBarangMasuk")
        .select("id", { count: "exact" });

      const respOut = await supabase
        .from("detail_barang_keluar")
        .select("id", { count: "exact" });

      if (respBarang.error) throw respBarang.error;
      if (respIn.error) throw respIn.error;
      if (respOut.error) throw respOut.error;

      setMetrics({
        totalBarang: respBarang.count ?? 0,
        totalIn: respIn.count ?? 0,
        totalOut: respOut.count ?? 0,
      });
    } catch (e) {
      console.error("loadMetrics error:", e);
      setError("Gagal memuat metrics.");
    }
  }

  async function fetchRows(tableName: string): Promise<ChartRow[]> {
    try {
      if (tableName === "DetailBarangMasuk") {
        const { data, error } = await supabase
          .from("DetailBarangMasuk")
          .select(
            `
            jumlah,
            BarangMasuk ( tanggal_masuk )
          `
          )
          .order("id", { ascending: true });

        if (error || !data) return [];

        return data
          .map((r: any) => ({
            jumlah: Number(r.jumlah) || 0,
            tanggal: r.BarangMasuk?.tanggal_masuk ?? "",
          }))
          .filter((r: ChartRow) => r.tanggal);
      }

      const { data, error } = await supabase
        .from(tableName)
        .select("jumlah, created_at")
        .order("created_at", { ascending: true });

      if (error || !data) return [];

      return data.map((r: any) => ({
        jumlah: Number(r.jumlah) || 0,
        tanggal: r.created_at,
      }));
    } catch (e) {
      console.error("fetchRows error:", e);
      return [];
    }
  }

  function aggregateMonthly(rows: ChartRow[]): Record<string, number> {
    const agg: Record<string, number> = {};
    for (const r of rows) {
      const key = monthKeyFromDateString(r.tanggal);
      if (!key) continue;
      agg[key] = (agg[key] || 0) + r.jumlah;
    }
    return agg;
  }

  function buildMonthsUnion(
    aggIn: Record<string, number>,
    aggOut: Record<string, number>,
    limit: number = 12
  ) {
    const keys = new Set([...Object.keys(aggIn), ...Object.keys(aggOut)]);
    if (!keys.size) {
      const now = new Date();
      const arr: string[] = [];
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        arr.push(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        );
      }
      return arr;
    }

    const arr = [...keys].sort();
    return arr.slice(-limit);
  }

  async function loadMonthlyChart() {
    const [rowsIn, rowsOut] = await Promise.all([
      fetchRows("DetailBarangMasuk"),
      fetchRows("detail_barang_keluar"),
    ]);

    const aggIn = aggregateMonthly(rowsIn);
    const aggOut = aggregateMonthly(rowsOut);

    const monthKeys = buildMonthsUnion(aggIn, aggOut, 12);

    const result: ChartPoint[] = monthKeys.map((k) => ({
      monthKey: k,
      monthLabel: monthLabelFromKey(k),
      in: aggIn[k] || 0,
      out: aggOut[k] || 0,
    }));

    setChartData(result);
  }

  async function loadLatestLogs() {
    try {
      // ---- BARANG MASUK (5 terbaru) ----
      const inResp = await supabase
        .from("DetailBarangMasuk")
        .select(
          `
        id,
        jumlah,
        harga_masuk,
        BarangMasuk ( tanggal_masuk, keterangan ),
        Barang ( nama_barang )
      `
        )
        .order("id", { ascending: false })
        .limit(5);

      if (!inResp.error && inResp.data) {
        setLogIn(
          inResp.data.map((i: any) => ({
            id: i.id,
            nama: i.Barang?.nama_barang ?? "-",
            jumlah: i.jumlah,
            tanggal: i.BarangMasuk?.tanggal_masuk ?? "-",
          }))
        );
      }

      // ---- BARANG KELUAR (5 terbaru) ----
      const outResp = await supabase
        .from("detail_barang_keluar")
        .select(
          `
    id,
    jumlah,
    harga_keluar,
    created_at,
    Barang: id_barang ( nama_barang ),
    barang_keluar: barang_keluar_id ( tanggal_keluar, keterangan )
  `
        )
        .order("id", { ascending: false })
        .limit(5);

      if (!outResp.error && outResp.data) {
        setLogOut(
          outResp.data.map((i: any) => ({
            id: i.id,
            nama: i.Barang?.nama_barang ?? "-",
            jumlah: i.jumlah,
            tanggal: i.barang_keluar?.tanggal_keluar ?? "-",
          }))
        );
      }
    } catch (e) {
      console.error("loadLatestLogs error:", e);
    }
  }

  return (
    <div className="p-6 space-y-6 text-white">
      {/* METRIC BOXES */}
      <div className="grid grid-cols-12 gap-4">
        <MetricBox
          title="Jumlah Barang"
          value={metrics.totalBarang}
          valueLabel="item terdaftar"
          subLabel=""
          color="from-blue-800 to-gray-950"
          icon={CubeIcon}
        />

        <MetricBox
          title="Total Barang Masuk"
          value={metrics.totalIn}
          valueLabel="barang masuk"
          subLabel={`${metrics.totalIn} transaksi`}
          color="from-green-800 to-gray-950"
          icon={ArrowTrendingDownIcon}
        />

        <MetricBox
          title="Total Barang Keluar"
          value={metrics.totalOut}
          valueLabel="barang keluar"
          subLabel={`${metrics.totalOut} transaksi`}
          color="from-red-800 to-gray-950"
          icon={ArrowTrendingUpIcon}
        />
      </div>

      {/* CHART */}
      <div className="dark:bg-gray-900 p-5 rounded-2xl border border-gray-700">
        <div className="flex gap-3 mb-4">
          <TabButton
            text="In & Out"
            active={activeTab === "both"}
            onClick={() => setActiveTab("both")}
          />
          <TabButton
            text="Stok Masuk"
            active={activeTab === "in"}
            onClick={() => setActiveTab("in")}
          />
          <TabButton
            text="Stok Keluar"
            active={activeTab === "out"}
            onClick={() => setActiveTab("out")}
          />

          <div className="ml-auto text-sm text-gray-400">
            {loading ? "Memuat..." : error ?? ""}
          </div>
        </div>

        <div className="h-72">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={25}>
                <defs>
                  {/* Masuk (Green) */}
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.7} />
                  </linearGradient>

                  {/* Keluar (Red) */}
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 3"
                  className="stroke-gray-300 dark:stroke-gray-600"
                />

                <XAxis
                  dataKey="monthLabel"
                  tick={{ fill: "currentColor" }}
                  className="text-gray-700 dark:text-gray-200"
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />

                <YAxis
                  tick={{ fill: "currentColor" }}
                  className="text-gray-700 dark:text-gray-200"
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend />

                {(activeTab === "in" || activeTab === "both") && (
                  <Bar
                    dataKey="in"
                    name="Masuk"
                    fill="url(#gIn)"
                    radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="in"
                      position="top"
                      className="fill-green-600 dark:fill-green-400"
                    />
                  </Bar>
                )}

                {(activeTab === "out" || activeTab === "both") && (
                  <Bar
                    dataKey="out"
                    name="Keluar"
                    fill="url(#gOut)"
                    radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="out"
                      position="top"
                      className="fill-red-600 dark:fill-red-400"
                    />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* LOG TABLE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* ==== LOG BARANG MASUK ==== */}
        <div className="dark:bg-gray-900 p-5 rounded-2xl border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl text-gray-800 dark:text-gray-100 font-semibold mb-4">
            <ArrowTrendingDownIcon className="w-6 h-6 inline-block" /> 5 Barang
            Masuk Terbaru
          </h2>

          <table className="w-full text-left text-sm">
            <thead className="text-gray-800 dark:text-gray-400 border-b border-gray-400 dark:border-gray-800">
              <tr>
                <th className="p-2">Nama Barang</th>
                <th className="p-2">Jumlah</th>
                <th className="p-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {logIn.map((row) => (
                <tr
                  key={row.id}
                  className="border-b text-gray-800 dark:text-gray-400  border-gray-400 dark:border-gray-800">
                  <td className="p-2">{row.nama}</td>
                  <td className="p-2">{row.jumlah} item</td>
                  <td className="p-2">
                    {new Date(row.tanggal).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}

              {logIn.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-gray-500 text-center">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==== LOG BARANG KELUAR ==== */}
        <div className="dark:bg-gray-900 p-5 rounded-2xl border border-gray-300 dark:border-gray-700">
          <h2 className="text-xl text-gray-800 dark:text-gray-100 font-semibold mb-4">
            <ArrowTrendingUpIcon className="w-6 h-6 inline-block" /> 5 Barang
            Keluar Terbaru
          </h2>

          <table className="w-full text-left text-sm">
            <thead className="text-gray-800 dark:text-gray-400 border-b border-gray-400 dark:border-gray-800">
              <tr>
                <th className="p-2">Nama Barang</th>
                <th className="p-2">Jumlah</th>
                <th className="p-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {logOut.map((row) => (
                <tr
                  key={row.id}
                  className="border-b text-gray-800 dark:text-gray-400  border-gray-400 dark:border-gray-800">
                  <td className="p-2">{row.nama}</td>
                  <td className="p-2">{row.jumlah} item</td>
                  <td className="p-2">
                    {new Date(row.tanggal).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}

              {logOut.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-gray-500 text-center">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================
// SUB COMPONENTS
// =========================================

// interface MetricProps {
//   title: string;
//   value: number;
//   valueLabel: string;
//   subLabel: string;
//   color: string;
// }

function MetricBox({
  title,
  value,
  valueLabel,
  subLabel,
  color,
  icon: Icon,
}: any) {
  return (
    <div
      className={`col-span-12 sm:col-span-4 
      p-6 rounded-2xl shadow-lg 
     bg-gradient-to-br ${color}
      border border-gray-200 dark:border-transparent 
      text-white
    `}>
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 flex items-center justify-center 
          rounded-xl bg-white/10">
          <Icon className="w-10 h-10 :text-white" />
        </div>
        <div>
          <p className="text-lg opacity-80">{title}</p>

          <p className="text-4xl font-bold mt-1">{value}</p>
          <p className="opacity-75">{valueLabel}</p>
          <p className="text-sm opacity-60 mt-1">{subLabel}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  text,
  active,
  onClick,
}: {
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${
        active ? "bg-indigo-600" : "bg-gray-700 hover:bg-gray-600"
      }`}>
      {text}
    </button>
  );
}
