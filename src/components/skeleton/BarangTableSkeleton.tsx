// src/components/skeleton/BarangTableSkeleton.tsx
import { TableRow, TableCell } from "../ui/table";

export default function BarangTableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className="animate-pulse">
          {/* Kode Barang */}
          <TableCell className="px-4 py-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </TableCell>

          {/* Nama Barang */}
          <TableCell className="px-4 py-3">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </TableCell>

          {/* Kategori */}
          <TableCell className="px-4 py-3">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </TableCell>

          {/* Supplier */}
          <TableCell className="px-4 py-3">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </TableCell>

          {/* Stok */}
          <TableCell className="px-4 py-3">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </TableCell>

          {/* Harga */}
          <TableCell className="px-4 py-3">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </TableCell>

          {/* Aksi */}
          <TableCell className="px-4 py-3 flex gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
