import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import KategoriForm from "../../components/form/KategoriForm";
import { supabase } from "../../services/supabaseClient";

export default function KategoriFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);

  // Fetch data kategori untuk edit
  useEffect(() => {
    const fetchKategori = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("Kategori")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetch kategori:", error);
          toast.error("Gagal memuat data kategori");
          return;
        }

        setInitialData({
          nama_kategori: data?.nama_kategori || "",
        });
      }
    };

    fetchKategori();
  }, [id]);

  // Submit form → insert/update Supabase
  const handleSubmit = async (formData: any) => {
    try {
      if (id) {
        // Update kategori
        const { error } = await supabase
          .from("Kategori")
          .update({ nama_kategori: formData.nama_kategori })
          .eq("id", id);

        if (error) throw error;
        toast.success("Kategori berhasil diperbarui!");
      } else {
        // Insert kategori baru
        const { error } = await supabase
          .from("Kategori")
          .insert([{ nama_kategori: formData.nama_kategori }]);

        if (error) throw error;
        toast.success("Kategori berhasil ditambahkan!");
      }

      navigate("/kategori");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan kategori");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {id ? "Edit Kategori" : "Tambah Kategori"}
      </h2>
      <KategoriForm
        initialValues={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/kategori")}
      />
    </div>
  );
}
