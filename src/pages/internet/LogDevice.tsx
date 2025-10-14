import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";

interface Device {
  id: string;
  name: string;
  ip: string;
  type: string;
  polling: boolean;
}

interface DeviceStat {
  id: string;
  deviceId: string;
  checkTime: string;
  uptime: string | null;
  cpu: number | null;
  mem: number | null;
  rx: number | null;
  tx: number | null;
}

export default function LogDevice() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [logs, setLogs] = useState<DeviceStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [deviceDetail, setDeviceDetail] = useState<Device | null>(null);

  // Fetch list device untuk dropdown
  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/device?limit=100");
      const result = await res.json();
      setDevices(result?.data || []);
    } catch (err) {
      console.error("Gagal fetch devices:", err);
      toast.error("Gagal memuat daftar device");
    }
  };

  // Fetch log per device
  const fetchLogs = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/device/${id}/stats`);
      if (!res.ok) throw new Error("Gagal ambil log");
      const data = await res.json();
      setLogs(data);
      setDeviceDetail(devices.find((d) => d.id === id) || null);
    } catch (err) {
      console.error("Error fetch logs:", err);
      toast.error("Gagal memuat log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchLogs(selectedDevice);
      const interval = setInterval(() => fetchLogs(selectedDevice), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedDevice]);

  return (
    <div>
      <PageMeta title="Log Device" description="Histori Device" />
      <PageBreadcrumb pageTitle="Log Device" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Dropdown pilih device */}
        <div className="mb-6 flex items-center gap-4">
          <label htmlFor="deviceSelect" className="text-sm font-medium text-gray-700 dark:text-white/80">
            Pilih Device:
          </label>
          <select
            id="deviceSelect"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">-- pilih device --</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.ip})
              </option>
            ))}
          </select>
        </div>

        {/* Card detail device */}
        {deviceDetail && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              {deviceDetail.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-white/70">
              IP: {deviceDetail.ip} <br />
              Tipe: {deviceDetail.type} <br />
              Status Polling:{" "}
              <span
                className={`font-medium ${
                  deviceDetail.polling ? "text-green-600" : "text-red-600"
                }`}
              >
                {deviceDetail.polling ? "Aktif" : "Mati"}
              </span>
            </p>
          </div>
        )}

        {/* Table log */}
        {selectedDevice ? (
          loading ? (
            <p className="text-gray-500">Loading data...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">Belum ada log untuk device ini.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">Waktu</th>
                    <th className="px-3 py-2">Uptime</th>
                    <th className="px-3 py-2">CPU (%)</th>
                    <th className="px-3 py-2">Memory (%)</th>
                    <th className="px-3 py-2">RX (KB)</th>
                    <th className="px-3 py-2">TX (KB)</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {new Date(log.checkTime).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{log.uptime || "-"}</td>
                      <td className="px-3 py-2">{log.cpu ?? "-"}</td>
                      <td className="px-3 py-2">{log.mem ?? "-"}</td>
                      <td className="px-3 py-2">{log.rx?.toFixed(2)}</td>
                      <td className="px-3 py-2">{log.tx?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <p className="text-gray-500">Silakan pilih device terlebih dahulu.</p>
        )}
      </div>
    </div>
  );
}
