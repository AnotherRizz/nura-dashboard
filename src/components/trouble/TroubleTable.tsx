import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { Table, TableBody, TableCell, TableHeader,TableRow } from "../ui/table";

export default function TroubleTable({
  loading, paginatedLogs, setSelectedLog, currentPage, setCurrentPage, totalPages
}: any) {
  return (
    <>
      <div className="overflow-x-auto border border-gray-300 dark:border-gray-800 rounded-xl shadow bg-gray-50 dark:bg-gray-900/60">
        <Table className="min-w-full text-sm">
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["Device", "Status", "Interface", "Duration", "Note", "Aksi"].map((h) => (
                <TableCell key={h} isHeader    className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-400">Memuat data...</TableCell></TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-6 text-gray-400">Tidak ada data</TableCell></TableRow>
            ) : (
              paginatedLogs.map((log: any) => (
                <TableRow key={log.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/70">
                  <TableCell className="px-4 py-3 dark:text-white">{log.device?.nama || "-"}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      log.status === "offline"
                        ? "bg-red-500/10 text-red-500"
                        : log.status === "solved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{log.interface || "-"}</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{log.duration || "-"}</TableCell>
                  <TableCell className="truncate max-w-[180px]">{log.note || "-"}</TableCell>
                  <TableCell>
                    <button onClick={() => setSelectedLog(log)} className="flex items-center gap-1 text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg text-sm transition">
                      <ArrowsPointingOutIcon className="h-4 w-4" /> Detail
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-md disabled:opacity-50">Prev</button>
          <span className="px-3 py-1">{currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-md disabled:opacity-50">Next</button>
        </div>
      )}
    </>
  );
}
