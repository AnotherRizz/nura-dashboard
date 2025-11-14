import { XMarkIcon } from "@heroicons/react/24/outline";

interface Device {
  nama?: string;
}

interface Log {
  createdat: string | Date;
  Device?: Device;
  topic?: string;
  message?: string;
}

interface LogDetailSidebarProps {
  log: Log | null;
  onClose: () => void;
}

export default function LogDetailSidebar({ log, onClose }: LogDetailSidebarProps) {
  if (!log) return null;


  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Sidebar */}
      <div className="relative z-50 w-full max-w-md bg-white dark:bg-dark-900 h-full shadow-xl overflow-y-auto p-6">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Detail Log</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-800 dark:text-white/70" />
          </button>
        </div>

        <div className="space-y-3">
          <p><strong>Waktu:</strong> {new Date(log.createdat).toLocaleString("id-ID")}</p>
          <p><strong>Device:</strong> {log.Device?.nama || "-"}</p>
          <p><strong>Topic:</strong> {log.topic}</p>
          <p><strong>Pesan:</strong></p>
          <div className="rounded-lg bg-gray-100 dark:bg-white/10 p-3 whitespace-pre-wrap break-words">
            {log.message}
          </div>
        </div>
      </div>
    </div>
  );
}
