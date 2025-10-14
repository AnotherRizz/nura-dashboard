import { useState } from "react";
import { useNavigate } from "react-router";
import ActionButton from "../ui/ActionButton";
import ConfirmModal from "../ui/ConfirmModal";

interface Paket {
  id: string;
  nama_paket: string;
  deskripsi: string;
  speed: string;
  harga: number;
  fitur: string[];
  areas: string[];
}

interface PaketTableProps {
  data: Paket[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function PaketCardList({ data, onDelete, loading }: PaketTableProps) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((paket) => (
            <div
              key={paket.id}
              className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900 dark:bg-white/[0.03] p-6 shadow-md flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {paket.nama_paket}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {paket.deskripsi}
                </p>
                <div className="mt-3 text-gray-800 dark:text-white">
                  <p className="text-sm">
                    <span className="font-medium">Speed:</span> {paket.speed}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Harga:</span>{" "}
                    {paket.harga.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    /bulan
                  </p>
                  {paket.fitur.length > 0 && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Fitur:</span>{" "}
                      {paket.fitur.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Tombol aksi */}
              <div className="mt-4 flex gap-2">
                <ActionButton
                  onClick={() => navigate(`/paket/${paket.id}`)}
                  title="Detail"
                  color="brand"
                >
                  <span className="material-icons">info</span>
                </ActionButton>
                <ActionButton
                  onClick={() => navigate(`/paket/edit/${paket.id}`)}
                  title="Edit"
                  color="green"
                >
                  <span className="material-icons">edit</span>
                </ActionButton>
                <ActionButton
                  onClick={() => setDeleteId(paket.id)}
                  title="Hapus"
                  color="red"
                >
                  <span className="material-icons">delete</span>
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-600 dark:text-gray-400">
          Paket tidak ditemukan
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        open={!!deleteId}
        title="Hapus Paket"
        message="Yakin ingin menghapus paket ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId && onDelete) onDelete(deleteId);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
