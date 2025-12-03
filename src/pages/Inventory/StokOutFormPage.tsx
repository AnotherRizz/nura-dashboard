import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../services/supabaseClient";
import StokOutForm from "../../components/form/StokOutForm";

export default function StokOutFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      // Ambil barang_keluar
      const { data: keluar, error } = await supabase
        .from("barang_keluar")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Gagal memuat data");
        return;
      }

      // Ambil detail_barang_keluar + relasi barang
      const { data: detail } = await supabase
        .from("detail_barang_keluar")
        .select("*, Barang(*)")
        .eq("barang_keluar_id", id);

      setInitialData({
        tanggal_keluar: keluar.tanggal_keluar
          ? new Date(keluar.tanggal_keluar).toISOString().slice(0, 16)
          : "",
        pic: keluar.pic,
        keterangan: keluar.keterangan,
        items: detail?.map((d) => ({
          id_barang: d.id_barang,
          jumlah: d.jumlah,
          harga_keluar: d.harga_keluar,
        })),
      });
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    try {
      const payload = {
        tanggal_keluar: formData.tanggal_keluar,
        pic: formData.pic,
        keterangan: formData.keterangan,
      };

      let keluarId = id;

      if (id) {
        // 1️⃣ Update header
        await supabase.from("barang_keluar").update(payload).eq("id", id);

        // 2️⃣ Ambil detail lama
        const { data: oldDetails } = await supabase
          .from("detail_barang_keluar")
          .select("*")
          .eq("barang_keluar_id", id);

        // 3️⃣ Kembalikan stok berdasarkan detail lama
        if (oldDetails) {
          for (const old of oldDetails) {
            await supabase.rpc("restore_stok", {
              barang_id: old.id_barang,
              jumlah: old.jumlah,
            });
          }
        }

        // 4️⃣ Hapus detail lama
        await supabase
          .from("detail_barang_keluar")
          .delete()
          .eq("barang_keluar_id", id);
      } else {
        // CREATE BARU
        const { data, error } = await supabase
          .from("barang_keluar")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        keluarId = data.id;
      }

      // Insert detail + panggil RPC restore_stok
     for (const item of formData.items) {
  await supabase.from("detail_barang_keluar").insert([
    {
      barang_keluar_id: keluarId,
      id_barang: item.id_barang,
      jumlah: item.jumlah,
      harga_keluar: item.harga_keluar,
      distribusi: item.distribusi || [], // <-- ini yang hilang selama ini
    },
  ]);

  await supabase.rpc("decrease_stok_multi_gudang", {
    p_barang_id: item.id_barang,
    p_jumlah: item.jumlah,
  });
}


      toast.success("Barang Keluar berhasil disimpan");
      navigate("/barang-keluar");
    } catch (err) {
      console.log(err);
      toast.error("Gagal menyimpan data");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 dark:text-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {id ? "Edit Barang Keluar" : "Tambah Barang Keluar"}
      </h2>

      <StokOutForm
        initialValues={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/barang-keluar")}
      />
    </div>
  );
}
