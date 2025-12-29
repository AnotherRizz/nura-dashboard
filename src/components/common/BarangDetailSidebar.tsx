// components/barang/BarangDetailSidebar.tsx
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";

interface BarangDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  barang: any | null;
}

const DetailItem = ({ label, value }: any) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-base text-gray-900 dark:text-white font-medium">
      {value || "-"}
    </p>
  </div>
);

export default function BarangDetailSidebar({
  open,
  onClose,
  barang,
}: BarangDetailSidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            className="fixed top-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 
                       h-full z-99 shadow-xl border-l border-gray-200 dark:border-gray-800 
                       p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Detail Barang
            </h2>

            {barang && (
              <div className="space-y-4">
                {barang.gambar && (
                  <img
                    src={`https://fffzifpspmyhehqhrbtm.supabase.co/storage/v1/object/public/barang-images/${barang.gambar}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}

                <DetailItem label="Kode Barang" value={barang.kode_barang} />
                <DetailItem label="Nama Barang" value={barang.nama_barang} />
                <DetailItem
                  label="Kategori"
                  value={barang.kategori?.nama_kategori}
                />
                <DetailItem
                  label="Supplier"
                  value={barang.supplier?.nama_supplier}
                />
                <DetailItem
                  label="Gudang"
                  value={
                    barang.gudang_list && barang.gudang_list.length > 0
                      ? barang.gudang_list
                          .map((g: any) => g.gudang?.nama_gudang)
                          .filter(Boolean)
                          .join(", ")
                      : "-"
                  }
                />

                <DetailItem label="Stok" value={barang.stok} />
                {barang.serial_numbers && barang.serial_numbers.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Serial Number</p>
                    <div className="flex flex-wrap gap-2">
                      {barang.serial_numbers.map((sn: any) => {
                        const isAvailable = sn.status === "available";

                        return (
                          <span
                            key={sn.id}
                            className={`
        px-2 py-1 text-xs rounded-full
        ${
          isAvailable
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
        }
      `}>
                            {sn.sn} 
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <DetailItem
                  label="Harga"
                  value={
                    barang.harga
                      ? barang.harga.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      : "-"
                  }
                />
                <DetailItem label="Merk" value={barang.merk} />
                <DetailItem label="Tipe" value={barang.tipe} />
                <DetailItem label="Satuan" value={barang.satuan} />
              </div>
            )}
            <Link
              to={`/barang/edit/${barang.id}`}
              onClick={onClose}
              className="mt-6 w-full inline-block  text-center py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">
              Edit
            </Link>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">
              Tutup
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
