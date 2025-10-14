import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function DeviceChart() {
  const [options] = useState<ApexOptions>({
    chart: {
      id: "device-chart",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth", // ✅ sudah valid karena ApexOptions tahu tipenya
      width: 3,
    },
    colors: ["#4f46e5"],
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: ["#60a5fa"],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  });

  const [series] = useState([
    {
      name: "Device Active",
      data: [30, 45, 35, 50, 49, 60],
    },
  ]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Statistik Device</h2>
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
}
