import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useNavigate } from "react-router";
import ActionButton from "../ui/ActionButton";

// Skeleton khusus untuk Supplier
function SupplierTableSkeleton() {
  return (
    <TableBody className="animate-pulse divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: 7 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          <TableCell className="px-4 py-3">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          </TableCell>
          <TableCell className="px-4 py-3">
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
          </TableCell>
          <TableCell className="px-4 py-3">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
          </TableCell>
          <TableCell className="px-4 py-3">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          </TableCell>
          <TableCell className="px-4 py-3">
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
          </TableCell>
          <TableCell className="flex gap-2 px-4 py-3">
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

interface Supplier {
  id: string;
  nama_supplier: string;
  nama_pt: string;
  alamat: string;
  nama_pic: string;
  telp_pic: string;
}

interface SupplierTableProps {
  data: Supplier[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function SupplierTable({
  data,
  onDelete,
  loading,
}: SupplierTableProps) {
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus supplier ini?")) {
      onDelete?.(id);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header tetap ada */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start dark:text-white">
                Nama Supplier
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start dark:text-white">
                Nama PT
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start dark:text-white">
                Alamat
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start dark:text-white">
                PIC
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start dark:text-white">
                Telp PIC
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-4 sm:px-6 text-start dark:text-white">
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>

          {loading ? (
            <SupplierTableSkeleton />
          ) : (
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length > 0 ? (
                data.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {supplier.nama_supplier}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {supplier.nama_pt}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {supplier.alamat}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {supplier.nama_pic}
                    </TableCell>
                    <TableCell className="px-4 py-3 dark:text-white">
                      {supplier.telp_pic}
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <ActionButton
                        onClick={() => navigate(`/supplier/${supplier.id}`)}
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
                        onClick={() => navigate(`/supplier/edit/${supplier.id}`)}
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

                      <ActionButton
                        onClick={() => handleDelete(supplier.id)}
                        title="Hapus"
                        color="red">
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 dark:text-white">
                    Supplier tidak ditemukan
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
