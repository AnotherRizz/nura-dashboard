import { useState } from "react";
import { useNavigate } from "react-router";
import ActionButton from "../../ui/ActionButton";
import ConfirmModal from "../../ui/ConfirmModal";

interface Device {
  id: string;
  nama: string;
  no_sn: string;
  status: string;
  area?: { nama_area: string };
  createdAt: string;
}

interface DeviceCardsProps {
  data: Device[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function DeviceCards({ data, onDelete, loading }: DeviceCardsProps) {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
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
    <>
      {data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {data.map((device) => (
            <div
              key={device.id}
              className="rounded-xl border border-gray-200 bg-gradient-to-br from-sky-900 to- p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
              <h4 className="text-lg font-semibold text-white">
                {device.nama}
              </h4>
              <p className="text-sm text-gray-200 dark:text-gray-400">
                SN: {device.no_sn}
              </p>
              <p
                className={`mt-2 inline-block rounded px-2 py-1 text-xs font-medium ${
                  device.status === "aktif"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {device.status}
              </p>
              <p className="mt-2 text-sm text-white">
                Area: {device.area?.nama_area || "-"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Dibuat: {new Date(device.createdAt).toLocaleDateString("id-ID")}
              </p>

              <div className="mt-4 flex gap-2">
                <ActionButton
                  onClick={() => navigate(`/device/${device.id}`)}
                  title="Detail"
                  color="brand"
                >
                  Detail
                </ActionButton>
                <ActionButton
                  onClick={() => navigate(`/device/edit/${device.id}`)}
                  title="Edit"
                  color="green"
                >
                  Edit
                </ActionButton>
                <ActionButton
                  onClick={() => setDeleteId(device.id)}
                  title="Hapus"
                  color="red"
                >
                  Hapus
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-white">
          Device tidak ditemukan
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Hapus Device"
        message="Yakin ingin menghapus device ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId && onDelete) onDelete(deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
}
