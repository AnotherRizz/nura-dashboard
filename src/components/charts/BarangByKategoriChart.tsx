import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BarangByKategoriChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:5000/api/barang"); // pakai URL backend
        const json = await res.json();
        const barang = json.data; // ambil array dari `data`

        // Group by kategori
        const kategoriCount: Record<string, number> = {};
        barang.forEach((item: any) => {
          const namaKategori = item.kategori?.nama_kategori || "Tanpa Kategori";
          kategoriCount[namaKategori] = (kategoriCount[namaKategori] || 0) + 1;
        });

        setLabels(Object.keys(kategoriCount));
        setSeries(Object.values(kategoriCount));
      } catch (err) {
        console.error("Gagal fetch barang:", err);
      }
    }

    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels: labels,
    legend: {
      position: "bottom",
      fontSize: "14px",
      labels: {
        colors: "#374151",
      },
    },
    colors: [
      "#3B82F6", // biru
      "#10B981", // hijau
      "#F59E0B", // kuning
      "#EF4444", // merah
      "#8B5CF6", // ungu
      "#14B8A6", // teal
    ],
    tooltip: {
      y: {
        formatter: (val: number) => `${val} barang`,
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Barang per Kategori
      </h3>
      <Chart options={options} series={series} type="donut" height={300} />
    </div>
  );
}
