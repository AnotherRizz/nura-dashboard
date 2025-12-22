// src/pages/barang/BarangFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import BarangForm from "../../components/form/BarangForm";
import TambahStokForm from "../../components/form/TambahStokForm";
import { supabase } from "../../services/supabaseClient";
// import {
//   FolderPlusIcon,
//   InboxArrowDownIcon,
// } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import UploadExcelBarang from "../../components/form/UploadExcelBarang";

type TabKey = "barang-baru" | "tambah-stok" | "upload-excel";

interface InitialBarangData {
  kode_barang?: string;
  nama_barang?: string;
  harga?: string;
  satuan?: string;
  id_kategori?: string;
  supplier_id?: string;
  gambar?: string | null;
  tipe?: string;
  merk?: string;

  // tambahan dari stok_gudang
  stok?: string;
  gudang_id?: string;
}

export default function BarangFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [activeTab, _setActiveTab] = useState<TabKey>("barang-baru");
  const [initialData, setInitialData] = useState<InitialBarangData | undefined>(undefined);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);

  // ================================
  //      LOAD DATA BARANG + STOK
  // ================================
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setInitialData(undefined);
        return;
      }

      setLoadingInitial(true);

      try {
        // ambil barang
        const { data: barang, error: errBarang } = await supabase
          .from("Barang")
          .select("*")
          .eq("id", id)
          .single();

        if (errBarang) throw errBarang;

        // ambil stok dari stok_gudang
        const { data: stok,  } = await supabase
          .from("stok_gudang")
          .select("stok, gudang_id")
          .eq("barang_id", id)
          .maybeSingle();

        setInitialData({
          kode_barang: barang.kode_barang || "",
          nama_barang: barang.nama_barang || "",
          harga: barang.harga?.toString() || "",
          satuan: barang.satuan || "",
          id_kategori: barang.id_kategori?.toString() || "",
          supplier_id: barang.supplier_id?.toString() || "",
          gambar: barang.gambar || null,
          tipe: barang.tipe || "",
          merk: barang.merk || "",

          // data stok_gudang
          stok: stok?.stok?.toString() || "0",
          gudang_id: stok?.gudang_id || "",
        });
      } catch (err) {
        console.error("Error loading barang:", err);
        toast.error("Gagal memuat data barang");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchData();
  }, [id]);

  // =======================================
  //        SUBMIT BARANG + STOK GUDANG
  // =======================================
  const handleSubmit = async (formData: any) => {
    try {
      let barangId = id;
      const stok = Number(formData.stok);
      const gudang_id = formData.gudang_id;
      delete formData.stok;
      delete formData.gudang_id;
      if (id) {
        const { error: updateError } = await supabase
          .from("Barang")
          .update(formData)
          .eq("id", id);

        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("Barang")
          .insert([formData])
          .select("id")
          .single();

        if (insertError) throw insertError;

        barangId = inserted.id;
      }

      const { data: existing } = await supabase
        .from("stok_gudang")
        .select("id")
        .eq("barang_id", barangId)
        .maybeSingle();

      if (existing) {
        // update stok existing
        await supabase
          .from("stok_gudang")
          .update({
            stok,
            gudang_id,
          })
          .eq("id", existing.id);
      } else {
        // insert stok baru
        await supabase.from("stok_gudang").insert([
          {
            barang_id: barangId,
            stok,
            gudang_id,
          },
        ]);
      }

      toast.success("Barang berhasil disimpan");
      navigate("/barang");
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:border-gray-800 dark:bg-gray-900 rounded shadow">

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-brand-600">
          {id ? "Edit Barang" : "Tambah Barang"}
        </h1>
      </div>

     

      <div>
        {activeTab === "barang-baru" ? (
          loadingInitial ? (
            <div className="p-4">Memuat data...</div>
          ) : (
            <BarangForm
              initialValues={initialData}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/barang")}
            />
          )
        ) : activeTab === "tambah-stok" ? (
          <TambahStokForm />
        ) : (
          <UploadExcelBarang />
        )}
      </div>
    </div>
  );
}
