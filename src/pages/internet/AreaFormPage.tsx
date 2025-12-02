import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AreaForm from "../../components/form/internet/AreaForm";
import { supabase } from "../../services/supabaseClient";

export default function AreaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [paketList, setPaketList] = useState<
    { id: number; nama_paket: string }[]
  >([]);

  // Ambil data area jika edit
  useEffect(() => {
    const fetchArea = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("Area")
          .select(
            `
  id,
  nama_area,
  latitude,
  longitude,
  radius,
  boundary,
  PaketArea ( paketId )
`
          )

          .eq("id", id)
          .single();

        if (error) throw error;

        setInitialData({
          nama_area: data.nama_area || "",
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          radius: data.radius?.toString() || "",
          boundary: data.boundary || null,
          paketIds: data.PaketArea?.map((p) => p.paketId) || [],
        });
      } catch (err) {
        console.error("Gagal fetch area:", err);
        toast.error("Gagal memuat data area");
      }
    };

    fetchArea();
  }, [id]);

  // Ambil daftar paket untuk dropdown
  useEffect(() => {
    const fetchPaket = async () => {
      try {
        const { data, error } = await supabase
          .from("Paket")
          .select("id, nama_paket")
          .order("id", { ascending: true });

        if (error) throw error;
        setPaketList(data || []);
      } catch {
        setPaketList([]);
      }
    };

    fetchPaket();
  }, []);

  const handleSubmit = async (formData: any) => {
    try {
      if (id) {
        // UPDATE
        await toast.promise(
          (async () => {
            const { error: areaError } = await supabase
              .from("Area")
              .update({
                nama_area: formData.nama_area,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                radius: Number(formData.radius),
              })
              .eq("id", id);

            if (areaError) throw areaError;

            // Hapus relasi lama
            await supabase.from("PaketArea").delete().eq("areaId", id);

            // Insert relasi baru
            if (formData.paketIds?.length > 0) {
              const paketAreas = formData.paketIds.map((paketId: number) => ({
                paketId,
                areaId: Number(id),
              }));
              await supabase.from("PaketArea").insert(paketAreas);
            }
          })(),
          {
            loading: "Menyimpan...",
            success: "Area berhasil diperbarui!",
            error: "Gagal menyimpan area.",
          }
        );
      } else {
        // CREATE
        await toast.promise(
          (async () => {
            const { data: newArea, error: areaError } = await supabase
              .from("Area")
              .insert({
                nama_area: formData.nama_area,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                radius: Number(formData.radius),
              })
              .select()
              .single();

            if (areaError) throw areaError;

            // Tambah relasi PaketArea jika ada paket dipilih
            if (formData.paketIds?.length > 0) {
              const paketAreas = formData.paketIds.map((paketId: number) => ({
                paketId,
                areaId: newArea.id,
              }));
              await supabase.from("PaketArea").insert(paketAreas);
            }
          })(),
          {
            loading: "Menyimpan...",
            success: "Area berhasil ditambahkan!",
            error: "Gagal menyimpan area.",
          }
        );
      }

      navigate("/area");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan area");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {id ? "Edit Area" : "Tambah Area"}
      </h2>
      <AreaForm
        paketList={paketList}
        initialValues={initialData || undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/area")}
      />
    </div>
  );
}
