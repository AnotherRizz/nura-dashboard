import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface CpuStatCardProps {
  cpu: number | null;
}

export default function CpuStatCard({ cpu }: CpuStatCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -120,
        endAngle: 120,
        hollow: {
          margin: 0,
          size: "65%",
          background: "transparent",
        },
        track: {
          background: "#e5e7eb",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            show: true,
            offsetY: -10,
            color: "#6b7280",
            fontSize: "14px",
            fontWeight: 500,
          },
          value: {
            show: true,
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        shadeIntensity: 0.4,
        gradientToColors: ["#f43f5e"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    colors: ["#ec4899"],
    stroke: {
      lineCap: "round",
    },
    labels: ["CPU Usage"],
  };

  // ambil dari props, default 0
  const series = [cpu ?? 0];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-6 mb-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          CPU Usage
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Refresh
            </DropdownItem>
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View Detail
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <Chart options={options} series={series} type="radialBar" height={250} />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          CPU Load saat ini
        </p>
      </div>
    </div>
  );
}
