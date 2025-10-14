// src/pages/monitoring/Monitoring.tsx
import React, { useEffect, useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { supabase } from "../../services/supabaseClient";
import toast from "react-hot-toast";
import DeviceSkeleton from "../../components/skeleton/DeviceSkeleton";
import CardDevice from "../../components/ecommerce/CardDevice";
import TrafficChart from "../../components/ecommerce/TrafficChart";

export interface Device {
  id: string;
  nama: string;
  no_sn?: string;
  ip: string;
  portApi?: number;
  username?: string;
  password?: string;
  metode?: string;
  status?: string;
  areaId?: string;
  lastCheck?: string | null;
  lastUptime?: string | null;
  lastCpu?: number | null;
  lastMem?: number | null;
  lastRx?: number | null;
  lastTx?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

const Monitoring: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const devicesRef = useRef<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"card" | "chart">("card"); // default card

  const POLL_INTERVAL = 2000;

  const fetchDevices = async (keyword = "") => {
    setLoading(true);
    try {
      let query = supabase.from("Device").select("*").order("id", { ascending: false });
      if (keyword && keyword.trim().length > 0) query = query.ilike("nama", `%${keyword}%`);

      const { data, error } = await query;
      if (error) throw error;

      const list = data ?? [];
      setDevices(list);
      devicesRef.current = list;
    } catch (err: any) {
      console.error("Gagal fetch device:", err);
      toast.error("Gagal memuat data device");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchDevices(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchDevices("");
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(async () => {
      if (!devicesRef.current.length) return;

      const promises = devicesRef.current.map(async (d) => {
        try {
          const ip = encodeURIComponent(d.ip);
          const port = d.portApi ?? 8728;
          const user = encodeURIComponent(d.username ?? "admin");
          const pass = encodeURIComponent(d.password ?? "");

          const res = await fetch(
            `http://localhost:5000/api/realtime/${ip}?user=${user}&pass=${pass}&port=${port}`,
            { method: "GET", cache: "no-store" }
          );
          const json = await res.json();

          if (!res.ok || json?.error) return { id: d.id, connected: false };

          return {
            id: d.id,
            connected: true,
            lastCpu: Number(json.cpu) || 0,
            lastMem: Number(json.mem) || 0,
            lastRx: Number(json.rx) || 0,
            lastTx: Number(json.tx) || 0,
            lastUptime: json.uptime ?? d.lastUptime,
            lastCheck: json.time ?? new Date().toISOString(),
          };
        } catch {
          return { id: d.id, connected: false };
        }
      });

      const results = await Promise.all(promises);
      if (!mounted) return;

      const map = new Map(results.map((r) => [r.id, r]));

      setDevices((prev) =>
        prev.map((p) => {
          const u = map.get(p.id);
          if (!u) return p;
          return u.connected
            ? { ...p, status: "terhubung", ...u }
            : { ...p, status: "tidak_terhubung" };
        })
      );

      devicesRef.current = devicesRef.current.map((p) => {
        const u = map.get(p.id);
        if (!u) return p;
        return u.connected
          ? { ...p, status: "terhubung", ...u }
          : { ...p, status: "tidak_terhubung" };
      });
    }, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div>
      <PageMeta title="Monitoring Dashboard" description="Monitoring semua device Mikrotik" />
      <PageBreadcrumb pageTitle="Monitoring Dashboard" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-800 text-2xl dark:text-white/90">
            Monitoring Device (Realtime)
          </h3>

          <div className="hidden lg:flex items-center gap-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                viewMode === "card" ? "bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl text-white" : "bg-gray-100 dark:bg-gray-800/90 text-gray-400"
              }`}
              onClick={() => setViewMode("card")}
            >
              Card
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                viewMode === "chart" ? "bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl text-white" : "bg-gray-100 dark:bg-gray-800/90 text-gray-400"
              }`}
              onClick={() => setViewMode("chart")}
            >
              Chart
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            value={search}
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Temukan area yang ingin anda cari..."
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-4 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800  dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        {loading ? (
          <DeviceSkeleton count={6} />
        ) : devices.length === 0 ? (
          <div className="p-6 text-center text-gray-600">Tidak ada device.</div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((d) => (
              <CardDevice key={d.id} device={d} />
            ))}
          </div>
        ) : (
          <TrafficChart  />
        )}
      </div>
    </div>
  );
};

export default Monitoring;
