import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
} from "../ui/table";
import BarangTableSkeleton from "../skeleton/BarangTableSkeleton";
import { useNavigate } from "react-router";
import ActionButton from "../ui/ActionButton";

export default function StokOutTable({ data, loading }: any) {
  const navigate = useNavigate();
  const formatTanggalWaktu = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                No SPK
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Tanggal
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                PIC
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Nama Project
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Lokasi
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Total Item
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Total Harga
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                {""}
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <BarangTableSkeleton />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-5 dark:text-white/80">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                     {item.no_spk}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {formatTanggalWaktu(item.tanggal_keluar)}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.pic}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.nama_project}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.lokasi}
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.total_item}
                  </TableCell>
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.total_harga.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell className="px-4 py-3 flex gap-2 dark:text-white/80">
                    <ActionButton
                      onClick={() => navigate(`/barang-keluar/${item.id}`)}
                      title="Detail"
                      color="brand">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-7">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                        />
                      </svg>
                    </ActionButton>
                    <ActionButton
                      onClick={() => navigate(`/barang-keluar/edit/${item.id}`)}
                      title="Edit"
                      color="green">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </ActionButton>
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
