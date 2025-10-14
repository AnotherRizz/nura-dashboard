import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SupplierForm from "../../components/form/SupplierForm";
import { supabase } from "../../services/supabaseClient";

export default function SupplierFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);

  // Fetch data untuk edit
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("Supplier")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Gagal fetch supplier:", error.message);
        toast.error("Gagal memuat data supplier");
        return;
      }

      if (data) {
        setInitialData({
          nama_supplier: data.nama_supplier || "",
          nama_pt: data.nama_pt || "",
          alamat: data.alamat || "",
          nama_pic: data.nama_pic || "",
          telp_pic: data.telp_pic || "",
        });
      }
    };

    fetchSupplier();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    try {
      if (id) {
        // UPDATE supplier
        const { error } = await supabase
          .from("Supplier")
          .update(formData)
          .eq("id", id);

        if (error) throw error;

        toast.success("Supplier berhasil diperbarui!");
      } else {
        // INSERT supplier baru
        const { error } = await supabase.from("Supplier").insert([formData]);

        if (error) throw error;

        toast.success("Supplier berhasil ditambahkan!");
      }

      navigate("/supplier");
    } catch (err: any) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan supplier");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {id ? "Edit Supplier" : "Tambah Supplier"}
      </h2>
      <SupplierForm
        initialValues={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/supplier")}
      />
    </div>
  );
}
