"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowDownRightIcon,
} from "@heroicons/react/24/outline";

interface Device {
  nama?: string;
  ip?: string;
}

interface DeviceStatusLog {
  id: string;
  deviceid: string;
  status: "online" | "offline" | "solved" | "gangguan";
  note?: string;
  duration?: string;
  interface?: string;
  starttime?: string;
  endtime?: string;
  createdat: string;
  device?: Device;
}

interface ExportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: DeviceStatusLog[];
}

export default function ExportPreviewModal({
  open,
  onClose,
  onConfirm,
  data,
}: ExportPreviewModalProps) {
  if (!open) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-700 border-green-300";
      case "offline":
        return "bg-red-100 text-red-700 border-red-300";
      case "gangguan":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "solved":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-[95%] max-w-4xl border border-gray-200 dark:border-gray-700"
        >
          {/* Tombol close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <WifiIcon className="w-5 h-5 text-blue-500" />
              Preview Data Export
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Berikut pratinjau sebagian data yang akan diekspor (maks. 10 data
              ditampilkan)
            </p>
          </div>

          {/* Tabel Preview */}
          <div className="max-h-80 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                <tr className="text-left text-gray-700 dark:text-gray-300">
                  <th className="px-3 py-2 border-b">No</th>
                  <th className="px-3 py-2 border-b">Device</th>
                  <th className="px-3 py-2 border-b">IP</th>
                  <th className="px-3 py-2 border-b">Status</th>
                  <th className="px-3 py-2 border-b">Interface</th>
                  <th className="px-3 py-2 border-b">Durasi</th>
                  <th className="px-3 py-2 border-b">Mulai</th>
                  <th className="px-3 py-2 border-b">Selesai</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.slice(0, 10).map((d, i) => (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-3 py-2 border-b text-center text-gray-500">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 border-b font-medium">
                        {d.device?.nama || "-"}
                      </td>
                      <td className="px-3 py-2 border-b text-gray-500">
                        {d.device?.ip || "-"}
                      </td>
                      <td className="px-3 py-2 border-b">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                            d.status
                          )}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-b text-gray-600">
                        {d.interface || "-"}
                      </td>
                      <td className="px-3 py-2 border-b text-gray-600">
                        {d.duration || "-"}
                      </td>
                      <td className="px-3 py-2 border-b text-gray-600">
                        {d.starttime
                          ? new Date(d.starttime).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 border-b text-gray-600">
                        {d.endtime
                          ? new Date(d.endtime).toLocaleString("id-ID")
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 inline mr-2 text-yellow-500" />
                      Tidak ada data untuk ditampilkan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tombol aksi */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 transition"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              <ArrowDownRightIcon className="w-5 h-5 inline mr-2" />
              Lanjutkan Export
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
