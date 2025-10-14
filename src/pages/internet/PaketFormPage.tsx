import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PaketForm from "../../components/form/internet/PaketForm";
import { supabase } from "../../services/supabaseClient";

export default function PaketFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);

  // fetch data paket jika mode edit
  useEffect(() => {
    const fetchPaket = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("Paket")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Gagal fetch paket:", error);
          toast.error("Gagal memuat data paket");
          return;
        }

        setInitialData({
          nama_paket: data?.nama_paket || "",
          deskripsi: data?.deskripsi || "",
          speed: data?.speed || "",
          harga: data?.harga?.toString() || "",
          fitur: data?.fitur || [],
        });
      }
    };

    fetchPaket();
  }, [id]);

  // simpan paket ke Supabase
  const handleSubmit = async (formData: any) => {
    try {
      if (id) {
        // update
        const { error } = await supabase
          .from("Paket")
          .update({
            nama_paket: formData.nama_paket,
            deskripsi: formData.deskripsi,
            speed: formData.speed,
            harga: Number(formData.harga),
            fitur: formData.fitur,
          })
          .eq("id", id);

        if (error) throw error;
      } else {
        // insert baru
        const { error } = await supabase.from("Paket").insert([
          {
            nama_paket: formData.nama_paket,
            deskripsi: formData.deskripsi,
            speed: formData.speed,
            harga: Number(formData.harga),
            fitur: formData.fitur,
          },
        ]);

        if (error) throw error;
      }

      toast.success("Paket berhasil disimpan!");
      navigate("/paket");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan paket");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {id ? "Edit Paket" : "Tambah Paket"}
      </h2>
      <PaketForm
        initialValues={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/paket")}
      />
    </div>
  );
}
