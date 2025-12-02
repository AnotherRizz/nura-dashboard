// src/pages/barang/BarangFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import BarangForm from "../../components/form/BarangForm";
import TambahStokForm from "../../components/form/TambahStokForm";
import { supabase } from "../../services/supabaseClient";
import {
  FolderPlusIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import UploadExcelBarang from "../../components/form/UploadExcelBarang";

type TabKey = "barang-baru" | "tambah-stok" | "upload-excel";

interface InitialBarangData {
  kode_barang?: string;
  nama_barang?: string;
  harga?: string;
  stok?: string;
  satuan?: string;
  id_kategori?: string;
  supplier_id?: string;
  gambar?: string | null; // path di storage atau url
  tipe?: string;
  merk?: string;
}

export default function BarangFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("barang-baru");
  const [initialData, setInitialData] = useState<InitialBarangData | undefined>(
    undefined
  );
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);

  // ambil detail barang kalau ada id (edit mode)
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setInitialData(undefined);
        return;
      }

      setLoadingInitial(true);
      try {
        const { data, error } = await supabase
          .from("Barang")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetch barang:", error);
          toast.error("Gagal memuat data barang");
          setInitialData(undefined);
          return;
        }

        setInitialData({
          kode_barang: data.kode_barang?.toString() || "",
          nama_barang: data.nama_barang || "",
          harga: data.harga?.toString() || "",
          stok: data.stok?.toString() || "",
          satuan: data.satuan || "",
          id_kategori: data.id_kategori?.toString() || "",
          supplier_id: data.supplier_id?.toString() || "",
          gambar: data.gambar || null,
          tipe: data.tipe || "",
          merk: data.merk || "",
        });
      } catch (err) {
        console.error("Unexpected error fetch barang:", err);
        setInitialData(undefined);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchData();
  }, [id]);

  // handle submit untuk add / edit barang (dipanggil oleh BarangForm)
  const handleSubmit = async (formData: any) => {
    try {
      let error = null;
      if (id) {
        // update existing barang
        const { error: updateError } = await supabase
          .from("Barang")
          .update(formData)
          .eq("id", id);
        error = updateError;
      } else {
        // insert new barang
        const { error: insertError } = await supabase
          .from("Barang")
          .insert([formData]);
        error = insertError;
      }

      if (error) throw error;

      // kembali ke list barang setelah sukses
      navigate("/barang");
    } catch (err) {
      console.error("Gagal menyimpan barang:", err);
      toast.error("Terjadi kesalahan saat menyimpan barang");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:border-gray-800 dark:bg-gray-900 rounded shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-brand-600">
          {id ? "Edit Barang" : "Tambah Barang"}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("barang-baru")}
          className={`px-4 py-2 rounded-t-lg font-semibold flex items-center ${
            activeTab === "barang-baru"
              ? "bg-white dark:bg-gray-800 text-blue-500 border-b border-blue-500"
              : " dark:bg-gray-800 dark:text-gray-300"
          }`}>
          <FolderPlusIcon className="w-5 h-5" /> Barang Baru
        </button>
        {/* <button
          type="button"
          onClick={() => setActiveTab("upload-excel")}
          className={`px-4 py-2 rounded-t-lg font-semibold flex items-center ${
            activeTab === "upload-excel"
              ? "bg-white dark:bg-gray-800 text-blue-500 border-b border-blue-500"
              : "dark:bg-gray-800 dark:text-gray-300"
          }`}>
          📄 Upload Excel
        </button> */}

        <button
          type="button"
          onClick={() => setActiveTab("tambah-stok")}
          className={`px-4 py-2 rounded-t-lg font-semibold flex items-center ${
            activeTab === "tambah-stok"
              ? "bg-white dark:bg-gray-800 text-blue-500 border-b border-blue-500"
              : " dark:bg-gray-800 dark:text-gray-300"
          }`}>
          <InboxArrowDownIcon className="w-5 h-5" /> Tambah Stok
        </button>
      </div>

      {/* Content */}
     <div>
  {activeTab === "barang-baru" ? (
    loadingInitial ? (
      <div className="p-4">Memuat data...</div>
    ) : (
      <BarangForm
        initialValues={initialData}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/barang-masuk")}
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
