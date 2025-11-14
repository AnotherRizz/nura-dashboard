import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface SummaryTableProps {
  data: any[];
  loading: boolean;
}

export default function SummaryTable({ data, loading }: SummaryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {["Tanggal", "Nama Device", "Avg CPU (%)", "Avg Mem (%)", "Avg RX (MB)", "Avg TX (MB)"].map((h) => (
                <TableCell key={h} isHeader   className="px-5 py-4 sm:px-6 text-start dark:text-white">
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : data.length ? (
              data.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="px-4 py-3 dark:text-white">{new Date(d.period).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{d.nama}</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{d.avgcpu.toFixed(2)} %</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{d.avgmem.toFixed(2)} %</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{(d.avgrx / 1024 / 1024).toFixed(2)} Mbps</TableCell>
                  <TableCell className="px-4 py-3 dark:text-white">{(d.avgtx / 1024 / 1024).toFixed(2)} Mbps</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
