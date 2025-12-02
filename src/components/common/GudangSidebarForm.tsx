import { supabase } from "../../services/supabaseClient";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GudangData {
  id?: number;
  nama_gudang: string;
  lokasi?: string | null;
  keterangan?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  editData: GudangData | null;
  onSuccess: () => void;
}

export default function GudangSidebarForm({
  open,
  onClose,
  editData,
  onSuccess,
}: Props) {
  const [nama, setNama] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    if (editData) {
      setNama(editData.nama_gudang || "");
      setLokasi(editData.lokasi || "");
      setKeterangan(editData.keterangan || "");
    } else {
      setNama("");
      setLokasi("");
      setKeterangan("");
    }
  }, [editData]);

  const handleSubmit = async () => {
    if (!nama) return toast.error("Nama gudang wajib diisi");

    try {
      let res;
      if (editData?.id) {
        res = await supabase
          .from("gudang")
          .update({
            nama_gudang: nama,
            lokasi,
            keterangan,
          })
          .eq("id", editData.id);
      } else {
        res = await supabase.from("gudang").insert({
          nama_gudang: nama,
          lokasi,
          keterangan,
        });
      }

      if (res.error) throw res.error;

      toast.success(editData ? "Berhasil diperbarui" : "Berhasil ditambahkan");
      onSuccess();
    } catch {
      toast.error("Gagal menyimpan data");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP (klik di luar tutup) */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* SIDEBAR */}
          <motion.div
            className="fixed top-0 right-0 w-96 h-full bg-white dark:bg-gray-800 shadow-xl z-50"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="p-5 flex justify-between items-center border-b">
              <h2 className="text-xl font-semibold dark:text-white">
                {editData ? "Edit Gudang" : "Tambah Gudang"}
              </h2>
              <button onClick={onClose} className=" dark:text-white">✖</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="dark:text-white">Nama Gudang</label>
                <input
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                />
              </div>

              <div>
                <label className="dark:text-white">Lokasi</label>
                <input
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                />
              </div>

              <div>
                <label className="dark:text-white">Keterangan</label>
                <textarea
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>

              <button
                className="w-full bg-blue-600 text-white py-2 rounded"
                onClick={handleSubmit}
              >
                Simpan
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
