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

export default function PurchaseOrderTable({ data, loading }: any) {
  const navigate = useNavigate();

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                No
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                No PO
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Tanggal
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-4 text-start dark:text-white sm:px-6">
                Supplier
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
                  colSpan={8}
                  className="text-center py-5 dark:text-white/80">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item: any, index: number) => (
                <TableRow key={item.id}>
                  {/* No */}
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {index + 1}
                  </TableCell>

                  {/* No PO */}
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.no_po}
                  </TableCell>

                  {/* Tanggal */}
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {formatTanggal(item.tanggal)}
                  </TableCell>

                  {/* Supplier */}
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.supplier?.nama_supplier || "-"}
                  </TableCell>

                  {/* Total Item */}
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.total_item}
                  </TableCell>

                  {/* Total Harga */}
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    {item.total_harga.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    })}
                  </TableCell>


                  {/* Aksi */}
                  <TableCell className="px-4 py-3 dark:text-white/80">
                    <ActionButton
                      onClick={() => navigate(`/purchase-order/${item.id}`)}
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
