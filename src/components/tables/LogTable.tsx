"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface LogItem {
  id: number;
  topic: string;
  message: string;
  createdat: string;
  Device?: { nama: string };
}

function truncateMessage(message: string, maxWords = 10) {
  if (!message) return "-";
  const words = message.split(" ");
  if (words.length <= maxWords) return message;
  return words.slice(0, maxWords).join(" ") + " ...";
}

function LogTableSkeleton() {
  return (
    <TableBody className="animate-pulse divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {[20, 30, 30, 50].map((j) => (
            <TableCell key={j} className="px-4 py-3">
              <div className="h-4 w-full max-w-[120px] rounded bg-gray-200 dark:bg-gray-700" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default function LogTable({
  data,
  loading,
  selectedIds,
  setSelectedIds,
}: {
  data: LogItem[];
  loading?: boolean;
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
}) {
  // const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.checked) {
  //     setSelectedIds(data.map((log) => log.id));
  //   } else {
  //     setSelectedIds([]);
  //   }
  // };

  const handleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white w-10"
              >
                {/* <input
                  type="checkbox"
                  checked={
                    data.length > 0 && selectedIds.length === data.length
                  }
                  onChange={handleSelectAll}
                  className="h-4 w-4 accent-brand-500 cursor-pointer"
                /> */}
                <div className="h-4 w-4"></div>
              </TableCell>
              {["Waktu", "Device", "Topic", "Pesan"].map((head, i) => (
                <TableCell
                  key={i}
                  isHeader
                  className="px-5 py-4 text-start dark:text-white"
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          {loading ? (
            <LogTableSkeleton />
          ) : (
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length > 0 ? (
                data.map((log) => (
                  <TableRow
                    key={log.id}
                    className={`hover:bg-gray-50 dark:hover:bg-white/[0.05] ${
                      selectedIds.includes(log.id)
                        ? "bg-red-50 dark:bg-white/[0.08]"
                        : ""
                    }`}
                  >
                    <TableCell className="px-4 py-3 text-sm dark:text-white w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(log.id)}
                        onChange={() => handleSelectRow(log.id)}
                        className="h-4 w-4 accent-brand-500 cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm dark:text-white">
                      {new Date(log.createdat).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {log.Device?.nama || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {log.topic || "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white text-sm">
                      {truncateMessage(log.message)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 dark:text-white"
                  >
                    Tidak ada log ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
}
