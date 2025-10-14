import React from "react";
import type { Device } from "../../pages/internet/Monitoring";
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  CircleStackIcon,
  ClockIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

interface Props {
  device: Device;
}

const formatPercent = (v?: number | null) =>
  v == null ? "-" : `${Number(v).toFixed(1)}%`;

const formatSpeed = (bps?: number | null) => {
  if (bps == null) return "-";
  const num = Number(bps);
  const kbps = num / 1_000;
  const mbps = num / 1_000_000;
  const gbps = num / 1_000_000_000;

  if (gbps >= 1) return `${gbps.toFixed(2)} Gbps`;
  if (mbps >= 1) return `${mbps.toFixed(2)} Mbps`;
  if (kbps >= 1) return `${kbps.toFixed(2)} Kbps`;
  return `${num.toFixed(0)} bps`;
};

// 🕒 Ubah uptime "10w5d14h52m24s" jadi "75 hari 14 jam 52 menit 24 detik"
const formatUptime = (uptime?: string | null) => {
  if (!uptime) return "-";

  const regex = /(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/;
  const match = uptime.match(regex);
  if (!match) return uptime;

  const weeks = parseInt(match[1]) || 0;
  const days = parseInt(match[2]) || 0;
  const hours = parseInt(match[3]) || 0;
  const minutes = parseInt(match[4]) || 0;
  const seconds = parseInt(match[5]) || 0;

  const totalDays = weeks * 7 + days;

  const parts = [];
  if (totalDays) parts.push(`${totalDays} hari`);
  if (hours) parts.push(`${hours} jam`);
  if (minutes) parts.push(`${minutes} menit`);
  if (!totalDays && !hours && seconds) parts.push(`${seconds} detik`);

  return parts.join(" ");
};

const CardDevice: React.FC<Props> = ({ device }) => {
  const isConnected = device.status === "terhubung";

  return (
    <div
      className={`rounded-xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md ${
        isConnected
          ? "border-green-400/60 bg-gradient-to-br from-emerald-900/80 to-emerald-800/60 dark:from-emerald-800/50 dark:to-emerald-900/30"
          : "border-red-300/60 bg-gradient-to-br from-red-900/80 to-red-800/60 dark:from-red-800/40 dark:to-red-900/30"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-50">{device.nama}</h4>
          <p className="text-xs text-gray-300">
            {device.ip}
            {device.portApi ? `:${device.portApi}` : ""}
          </p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isConnected
              ? "bg-green-200/90 text-green-800 dark:bg-green-900/40 dark:text-green-200"
              : "bg-red-200/90 text-red-800 dark:bg-red-900/40 dark:text-red-200"
          }`}
        >
          {isConnected ? "Terhubung" : "Tidak Terhubung"}
        </span>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-white/10"></div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-100">
        <div className="flex items-center gap-2">
          <CpuChipIcon className="w-5 h-5" />
          <span>CPU:</span>
          <span className="font-medium ml-auto">{formatPercent(device.lastCpu)}</span>
        </div>

        <div className="flex items-center gap-2">
          <CircleStackIcon className="w-5 h-5" />
          <span>Memory:</span>
          <span className="font-medium ml-auto">{formatPercent(device.lastMem)}</span>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <ArrowDownIcon className="text-blue-400 w-5 h-5" />
          <span>RX:</span>
          <span className="font-medium ml-auto">{formatSpeed(device.lastRx)}</span>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <ArrowUpIcon className="text-orange-400 w-5 h-5" />
          <span>TX:</span>
          <span className="font-medium ml-auto">{formatSpeed(device.lastTx)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <ArrowPathIcon className="w-5 h-5" />
          <span>Pembaruan terakhir:</span>
        </div>
        <span>
          {device.lastCheck
            ? new Date(device.lastCheck).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "-"}
        </span>
      </div>
    </div>
  );
};

export default CardDevice;
