"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { supabase } from "../../services/supabaseClient";

interface Metric {
  id: number;
  deviceid: number;
  rxbytes: number;
  txbytes: number;
  createdat: string;
}

// interface DeviceRow {
//   id: number;
//   nama: string | null;
// }

function formatBytes(bytes: number): string {
  if (!bytes && bytes !== 0) return "-";
  if (bytes === 0) return "0 B/s";
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function localTimestamp(createdat: string): number {
  const utcDate = new Date(createdat);
  return utcDate.getTime() + utcDate.getTimezoneOffset() * -60 * 1000;
}

export default function TrafficChart() {
  const [dataByDevice, setDataByDevice] = useState<Record<string, Metric[]>>({});
  const [deviceNames, setDeviceNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"10m" | "1h" | "1d">("1d");

  // === Ambil nama device ===
  const fetchDeviceNames = async () => {
    const { data, error } = await supabase.from("Device").select("id, nama");
    if (error) {
      console.error("Error fetching device names:", error);
      return;
    }
    const mapping: Record<string, string> = {};
    data?.forEach((r) => (mapping[String(r.id)] = r.nama || `Device ${r.id}`));
    setDeviceNames(mapping);
  };

  // === Ambil data sesuai range ===
  const fetchMetrics = async () => {
  const now = new Date();
  let startTime: Date;

  switch (range) {
    case "1h":
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case "1d":
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 10 * 60 * 1000);
      break;
  }

  const { data, error, count } = await supabase
    .from("DeviceMetricRaw")
    .select("id, deviceid, rxbytes, txbytes, createdat", { count: "exact" })
    .gte("createdat", startTime.toISOString())
    .order("createdat", { ascending: true })
    .limit(2000);

  if (error) {
    console.error("Error fetching metrics:", error);
    return;
  }

  if ((count ?? 0) > 2000) {
    console.warn("⚠️ Data terlalu banyak, hanya menampilkan 2000 titik terakhir");
  }

  const grouped: Record<string, Metric[]> = {};
  data?.forEach((row) => {
    const key = String(row.deviceid);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });
  setDataByDevice(grouped);
};


  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (!mounted) return;
      setLoading(true);
      await fetchDeviceNames();
      await fetchMetrics();
      setLoading(false);
    };
    init();

    const channel = supabase
      .channel("realtime-device-metrics")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "DeviceMetricRaw" },
        (payload) => {
          const newRow = payload.new as Metric;
          setDataByDevice((prev) => {
            const key = String(newRow.deviceid);
            const updated = { ...prev };
            const arr = updated[key] ? [...updated[key], newRow] : [newRow];
            updated[key] = arr;
            const cutoff =
              range === "10m"
                ? 10 * 60 * 1000
                : range === "1h"
                ? 60 * 60 * 1000
                : 24 * 60 * 60 * 1000;
            const now = Date.now();
            updated[key] = updated[key].filter(
              (m) => now - new Date(m.createdat).getTime() <= cutoff
            );
            return updated;
          });
        }
      )
      .subscribe();

    const interval = setInterval(() => fetchMetrics(), 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [range]);

  const baseOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Outfit, sans-serif",
    },
    stroke: { curve: "smooth", width: 2.5 },
   fill: {
    type: "solid", // ganti dari gradient ke solid
    opacity: 0.5,  // atur transparansi area bawah garis
  },
    grid: {
      borderColor: "rgba(200,200,200,0.14)",
      strokeDashArray: 3,
    },
    markers: { size: 0 },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#6B7280" },
    },
    tooltip: {
      shared: true,
      x: {
        formatter: (val: number) =>
          new Date(val).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
      },
      y: { formatter: (val: number) => formatBytes(val) },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        style: { colors: "#6B7280", fontSize: "11px" },
      },
      tickAmount: 6,
    },
    yaxis: {
      labels: {
        formatter: (v: number) => formatBytes(v),
        style: { colors: "#6B7280", fontSize: "12px" },
      },
    },
  };

  return (
    <div>
      {/* OPTION JAM SELALU ADA */}
      <div className="flex justify-end mb-4">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as any)}
          className="border rounded-lg text-sm px-3 py-2 text-gray-700 bg-white dark:bg-gray-800/90 dark:text-white shadow-sm"
        >
          <option value="10m">10 Menit Terakhir</option>
          <option value="1h">1 Jam Terakhir</option>
          <option value="1d">1 Hari Terakhir</option>
        </select>
      </div>

      {/* STATUS DAN DATA */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading traffic data...</div>
      ) : Object.keys(dataByDevice).length === 0 ? (
        <div className="text-center py-10 text-gray-500">Tidak ada data terbaru.</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Object.entries(dataByDevice).map(([deviceId, metrics]) => {
            const nama = deviceNames[String(deviceId)] || `Device ${deviceId}`;
            const timesMs = metrics.map((m) => localTimestamp(m.createdat));
            const rxData = metrics.map((m) => m.rxbytes);
            const txData = metrics.map((m) => m.txbytes);
            const lastRx = rxData[rxData.length - 1] ?? 0;
            const lastTx = txData[txData.length - 1] ?? 0;

            const options: ApexOptions = {
              ...baseOptions,
              colors: ["#F25912", "#08CB00"],
            };

            const series = [
              { name: "RX", data: timesMs.map((t, i) => [t, rxData[i] ?? 0]) },
              { name: "TX", data: timesMs.map((t, i) => [t, txData[i] ?? 0]) },
            ];

            return (
              <div
                key={deviceId}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-5 dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-950 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {deviceId} - {nama}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Trafik RX / TX ({range === "10m" ? "10 menit" : range === "1h" ? "1 jam" : "1 hari"} terakhir)
                    </p>
                  </div>
                  {/* <div className="text-right">
                    <p className="text-xs text-gray-400">Current RX / TX</p>
                    <p className="font-semibold text-gray-800 dark:text-brand-700 text-sm">
                      {formatBytes(lastRx)} / {formatBytes(lastTx)}
                    </p>
                  </div> */}
                </div>

                <Chart options={options} series={series} type="area" height={300} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
