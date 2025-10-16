import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { supabase } from "../../services/supabaseClient";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { BoltIcon } from "../../icons";
import { ChartBarIcon, ServerIcon, UsersIcon } from "@heroicons/react/24/outline";
import CpuStatCard from "../../components/ecommerce/CpuStatCard";
import DeviceSkeleton from "../../components/skeleton/DeviceSkeleton";
import toast from "react-hot-toast";

interface Area {
  id: string;
  nama_area: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface Device {
  id: string;
  nama: string;
  no_sn: string;
  ip: string;
  portApi: number;
  username: string;
  password: string;
  metode: string;
  status: string;
  areaId: string;
  lastCheck?: string | null;
  lastUptime?: string | null;
  lastCpu?: number | null;
  lastMem?: number | null;
  lastRx?: number | null;
  lastTx?: number | null;
  createdAt: string;
  updatedAt: string;
  area?: Area;
}

interface MikrotikDetail {
  interfaces: { name: string; type: string; running: boolean; rx: number; tx: number }[];
  pppUsers: { name: string; address: string; uptime: string; callerId: string; service: string }[];
}

export default function ShowDevice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [detail, setDetail] = useState<MikrotikDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const formatPercent = (v?: number | null) => (v == null ? "-" : `${v.toFixed(1)}%`);
  const formatSpeed = (bps?: number | null) => {
    if (bps == null) return "-";
    const kbps = bps / 1_000;
    const mbps = bps / 1_000_000;
    if (mbps >= 1) return `${mbps.toFixed(2)} Mbps`;
    if (kbps >= 1) return `${kbps.toFixed(2)} Kbps`;
    return `${bps.toFixed(0)} bps`;
  };
  const formatUptime = (uptime?: string | null) => uptime || "-";
  const formatLastCheck = (date?: string | null) =>
    !date
      ? "-"
      : new Date(date).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "medium",
        });

  const fetchDevice = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Device")
        .select(
          `
          *,
          area:areaId (
            id, nama_area, latitude, longitude, radius
          )
        `
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      setDevice(data as Device);
    } catch (err) {
      console.error("❌ Gagal mengambil device:", err);
      toast.error("Gagal memuat data device");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevice();
  }, [id]);

  useEffect(() => {
    if (!device?.ip) return;

    const fetchRealtimeAndDetail = async () => {
      try {
        const realtimeRes = await fetch(
          `http://localhost:5000/api/realtime/${device.ip}?user=${device.username}&pass=${device.password}&port=${device.portApi}`
        );
        const realtime = await realtimeRes.json();
        if (realtime && !realtime.error) {
          setDevice((prev) =>
            prev
              ? {
                  ...prev,
                  lastCpu: realtime.cpu,
                  lastMem: realtime.mem,
                  lastRx: realtime.rx,
                  lastTx: realtime.tx,
                  lastUptime: realtime.uptime,
                  lastCheck: realtime.time,
                }
              : prev
          );
        }

        const detailRes = await fetch(
          `http://localhost:5000/api/detail/${device.ip}?user=${device.username}&pass=${device.password}&port=${device.portApi}`
        );
        const detailData = await detailRes.json();
        if (detailData && detailData.success) setDetail(detailData);
      } catch (err) {
        console.error("⚠️ Gagal ambil data detail:", err);
      }
    };

    fetchRealtimeAndDetail();
    const interval = setInterval(fetchRealtimeAndDetail, 2000);
    return () => clearInterval(interval);
  }, [device?.ip]);

  if (loading) return <div className="p-6"><DeviceSkeleton /></div>;
  if (!device) return <div className="p-6 text-gray-500 dark:text-gray-400">Device tidak ditemukan.</div>;

  return (
    <div className="min-h-screen px-4 py-10 space-y-10 bg-gray-50 dark:bg-gray-950 transition-colors">
      <PageMeta title={`Detail Device - ${device.nama}`} description="Detail perangkat jaringan" />
      <PageBreadcrumb pageTitle="Detail Device" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Detail Device --- */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-8 dark:border-gray-800 dark:bg-gray-900/80">
          <h2 className="text-2xl flex items-center gap-2 font-bold text-gray-800 dark:text-white mb-6">
            <BoltIcon /> Detail Perangkat
          </h2>

          <div className="space-y-4 text-sm">
            {[
              ["Nama Device", device.nama],
              ["Nomor Seri", device.no_sn],
              ["IP Address", device.ip],
              ["Port API", device.portApi],
              ["Username", device.username],
              ["Metode", device.metode],
            ].map(([label, value]) => (
              <InfoItem key={label} label={label} value={String(value)} />
            ))}

            <div className="flex justify-between">
              <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  device.status === "aktif"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {device.status}
              </span>
            </div>
          </div>
        </div>

        {/* --- Statistik --- */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-8 dark:border-gray-800 dark:bg-gray-900/80">
          <h2 className="text-2xl flex gap-2 items-center font-bold text-gray-800 dark:text-white mb-8">
            <ChartBarIcon className="w-5 h-5" /> Statistik Terakhir
          </h2>

          <CpuStatCard cpu={device.lastCpu ?? 0} />

          <div className="mt-6 grid gap-4">
            <InfoRow label="Last Check" value={formatLastCheck(device.lastCheck)} color="red" />
            <InfoRow label="Uptime" value={formatUptime(device.lastUptime)} color="green" />
            <InfoRow label="CPU" value={formatPercent(device.lastCpu)} color="rose" percent={device.lastCpu} />
            <InfoRow label="Memory" value={formatPercent(device.lastMem)} color="blue" percent={device.lastMem} />
            <InfoRow label="RX" value={formatSpeed(device.lastRx)} color="amber" />
            <InfoRow label="TX" value={formatSpeed(device.lastTx)} color="orange" />
          </div>
        </div>
      </div>

      {/* --- Interface & PPP Users --- */}
      {detail && (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-8 dark:border-gray-800 dark:bg-gray-900/80">
            <h2 className="text-xl flex items-center gap-2 font-bold mb-4 text-gray-800 dark:text-white">
              <ServerIcon className="w-5 h-5" /> Interface Aktif
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">Tipe</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">RX</th>
                    <th className="py-2 px-3">TX</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.interfaces.map((i) => (
                    <tr
                      key={i.name}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:text-gray-200 transition"
                    >
                      <td className="py-2 px-3">{i.name}</td>
                      <td className="py-2 px-3">{i.type}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            i.running
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {i.running ? "Running" : "Down"}
                        </span>
                      </td>
                      <td className="py-2 px-3">{formatSpeed(i.rx * 8)}</td>
                      <td className="py-2 px-3">{formatSpeed(i.tx * 8)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-8 dark:border-gray-800 dark:bg-gray-900/80">
            <h2 className="text-xl flex items-center gap-2 font-bold mb-4 text-gray-800 dark:text-white">
              <UsersIcon className="w-5 h-5" /> Pengguna Aktif (PPPoE)
            </h2>

            {detail.pppUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada pengguna aktif.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">Address</th>
                      <th className="py-2 px-3">Caller ID</th>
                      <th className="py-2 px-3">Service</th>
                      <th className="py-2 px-3">Uptime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.pppUsers.map((u) => (
                      <tr
                        key={u.name}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:text-gray-300 transition"
                      >
                        <td className="py-2 px-3">{u.name}</td>
                        <td className="py-2 px-3">{u.address}</td>
                        <td className="py-2 px-3">{u.callerId}</td>
                        <td className="py-2 px-3">{u.service}</td>
                        <td className="py-2 px-3">{u.uptime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* --- Tombol --- */}
      <div className="mt-10 flex justify-end gap-3">
        <Button className="rounded-xl !bg-red-500 text-white" onClick={() => navigate("/device")}>
          Kembali
        </Button>
        <Button className="rounded-xl" onClick={() => navigate(`/device/edit/${device.id}`)}>
          Edit Device
        </Button>
      </div>
    </div>
  );
}

// --- Small Components ---
function InfoItem({ label, value }: { label: any; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-medium text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

function InfoRow({
  label,
  value,
  color,
  percent,
}: {
  label: string;
  value: string;
  color: string;
  percent?: number | null;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className={`font-semibold text-${color}-600 dark:text-${color}-400`}>{value}</span>
      </div>
      {percent != null && (
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-2 bg-gradient-to-r from-${color}-400 to-${color}-600 transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
