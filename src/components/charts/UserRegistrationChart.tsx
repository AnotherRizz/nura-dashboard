import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";

export default function RegistrationStatusChart() {
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/userRegistration");
        const result = await res.json();

        // Hitung jumlah per status
        const initialCounts: { [key: string]: number } = {
          APPLIED: 0,
          VERIFIED: 0,
          INSTALLATION: 0,
          ACTIVE: 0,
          REJECTED: 0,
        };

        result.data.forEach((item: any) => {
          if (initialCounts[item.status] !== undefined) {
            initialCounts[item.status] += 1;
          }
        });

        setCounts(initialCounts);
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

const options: ApexOptions = {
  chart: {
    type: "bar",
    fontFamily: "Outfit, sans-serif",
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "50%",
      borderRadius: 6,
      borderRadiusApplication: "end",
      distributed: true, // <── penting supaya tiap bar beda warna
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: [
      "APPLIED",
      "VERIFIED",
      "INSTALLATION",
      "ACTIVE",
      "REJECTED",
    ],
  },
  colors: ["#3B82F6", "#10B981", "#FBBF24", "#6366F1", "#EF4444"], // warna per bar
  legend: { show: false },
  tooltip: {
    y: { formatter: (val: number) => `${val} user` },
  },
  grid: { yaxis: { lines: { show: true } } },
};


  const series = [
    {
      name: "Registrations",
      data: [
        counts.APPLIED || 0,
        counts.VERIFIED || 0,
        counts.INSTALLATION || 0,
        counts.ACTIVE || 0,
        counts.REJECTED || 0,
      ],
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Registrasi per Status
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Loading chart...</p>
      ) : (
        <Chart options={options} series={series} type="bar" height={250} />
      )}
    </div>
  );
}
