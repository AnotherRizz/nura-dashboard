import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import  formatToLocalTime from "../../services/dateFormat";

export default function SidebarDetail({ log, onClose }: any) {
//   const formatTime = (time?: string) =>
//     time ? new Date(time).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-";
//   console.log(log);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[9999] p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Detail Log</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
  {[
    ["Device", log.device?.nama],
    ["IP", log.device?.ip],
    ["Interface", log.interface],
    ["Status", log.status],
    ["Start Time", log.starttime],
    ["End Time", log.endtime],
    ["Duration", log.duration],
    ["Note", log.note],
    ["Created At", formatToLocalTime(log.createdat)], // Gunakan formatToWIB untuk waktu Created At
  ].map(([label, val]) => (
    <div key={label} className="py-2 flex justify-between">
      <p className="font-medium w-1/3">{label}</p>
      <p className="text-right w-2/3 text-gray-600 dark:text-gray-400">{val || "-"}</p>
    </div>
  ))}
</div>

    </motion.div>
  );
}
