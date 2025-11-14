"use client";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { supabase } from "../../services/supabaseClient";

// interface DeviceStatusLog {
//   id: number;
//   deviceid: number;
//   status: string;
//   note: string;
//   duration: string;
//   interface: string;
//   createdat: string;
//   device?: {
//     nama: string;
//   };
// }

export default function GangguanChart() {
  const [chartData, setChartData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGangguan = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("DeviceStatusLog")
          .select("id, deviceid, interface, status, device:Device!fk_device(nama)")
          .neq("status", "online")
          .order("createdat", { ascending: false });

        if (error) throw error;

        const counts: { [key: string]: number } = {};
        (data || []).forEach((log: any) => {
          const key = `${log.device?.nama || "Unknown"} (${
            log.interface || "-"
          })`;
          counts[key] = (counts[key] || 0) + 1;
        });

        setChartData(counts);
      } catch (err) {
        console.error("Gagal ambil data gangguan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGangguan();
  }, []);

  const categories = Object.keys(chartData);
  const values = Object.values(chartData);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 6,
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#6b7280",
          fontSize: "12px",
        },
      },
    },
    colors: [
      "#EF4444", // merah untuk gangguan
      "#F59E0B", // kuning
      "#3B82F6", // biru
      "#10B981", // hijau
      "#6366F1", // ungu
      "#E11D48", // merah tua
    ],
    tooltip: {
      y: { formatter: (val: number) => `${val} gangguan` },
    },
    grid: { borderColor: "#E5E7EB" },
    legend: { show: false },
  };

  const series = [
    {
      name: "Jumlah Gangguan",
      data: values,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Statistik Gangguan per Device & Interface
      </h3>

      {loading ? (
        <p className="text-sm text-gray-500">Memuat data chart...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-500">Tidak ada data gangguan</p>
      ) : (
        <Chart options={options} series={series} type="bar" height={300} />
      )}
    </div>
  );
}
