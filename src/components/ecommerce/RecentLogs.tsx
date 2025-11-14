"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Link } from "react-router";

interface Device {
  id: number;
  nama: string;
}

interface DeviceLog {
  id: number;
  deviceid: number;
  time: string;
  topic: string;
  message: string;
  createdat: string;
  raw: {
    time?: string;
    topics?: string;
    message?: string;
    [key: string]: any;
  };
  Device?: Device;
}

// 🔹 Fungsi bantu untuk potong pesan
const truncateMessage = (text: string, limit: number = 10) => {
  if (!text) return "-";
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
};

export default function RecentLogs() {
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("DeviceLog")
        .select(
          `
          id,
          deviceid,
          time,
          topic,
          message,
          createdat,
          raw,
          Device:Device!DeviceLog_deviceid_fkey(nama)
        `
        )
        .order("createdat", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Gagal mengambil log:", error);
      } else {
        const formattedData =
          data?.map((item: any) => ({
            ...item,
            Device: item.Device || null,
          })) || [];
        setLogs(formattedData);
      }

      setLoading(false);
    };

    fetchLogs();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Device Logs
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            5 aktivitas log terakhir perangkat
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/log"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-gray-500 text-start text-theme-xs font-medium dark:text-gray-400"
              >
                Device
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-2 text-gray-500 text-start text-theme-xs font-medium dark:text-gray-400"
              >
                Message
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-gray-500 text-start text-theme-xs font-medium dark:text-gray-400"
              >
                Waktu
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Tidak ada log terbaru
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="py-3 font-medium text-gray-800 dark:text-white/90">
                    {log.Device?.nama || "-"}
                  </TableCell>
                  <TableCell className="py-3 px-2 text-gray-600 dark:text-gray-400">
                    {truncateMessage(log.message || log.raw?.message || "-", 10)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-600 dark:text-gray-400">
                    {new Date(log.createdat).toLocaleString("id-ID", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Jakarta",
                    })}{" "}
                    WIB
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
