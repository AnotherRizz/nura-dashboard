import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DeviceForm from "../../components/form/internet/DeviceForm";
import { supabase } from "../../services/supabaseClient";

export default function DeviceFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDevice = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("Device")
          .select("*, DeviceInterface(id, name, type, mac, status, comment)")
          .eq("id", id)
          .single();
        if (error) throw error;

        setInitialData({
          nama: data.nama || "",
          no_sn: data.no_sn || "",
          ip: data.ip || "",
          portApi: data.portApi?.toString() || "8728",
          username: data.username || "",
          password: data.password || "",
          status: data.status || "nonaktif",
          areaId: data.areaId?.toString() || "",
          interfaces: data.DeviceInterface || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data device");
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    try {
      const payload = {
        nama: formData.nama,
        no_sn: formData.no_sn,
        ip: formData.ip,
        portApi: Number(formData.portApi),
        username: formData.username,
        metode: "api",
        status: formData.status,
        areaId: Number(formData.areaId),
        ...(formData.password ? { password: formData.password } : {}),
      };

      await toast.promise(
        (async () => {
          let deviceId = id;
          if (id) {
            const { error } = await supabase
              .from("Device")
              .update(payload)
              .eq("id", id);
            if (error) throw error;
          } else {
            const { data, error } = await supabase
              .from("Device")
              .insert(payload)
              .select("id")
              .single();
            if (error) throw error;
            deviceId = data.id;
          }

          // Bersihkan interface lama
          await supabase
            .from("DeviceInterface")
            .delete()
            .eq("deviceid", deviceId);

          // Simpan interface baru
          const interfacesPayload = formData.interfaces
            .filter((e: any) => e.name.trim() !== "")
            .map((e: any) => ({
              deviceid: deviceId,
              name: e.name,
              type: e.type || "ether",
              mac: e.mac || null,
              status: e.status || "nonaktif",
              comment: e.comment || null,
            }));

          if (interfacesPayload.length > 0) {
            const { error } = await supabase
              .from("DeviceInterface")
              .insert(interfacesPayload);
            if (error) throw error;
          }
        })(),
        {
          loading: id ? "Menyimpan perubahan..." : "Menambahkan device...",
          success: id
            ? "Device berhasil diperbarui!"
            : "Device berhasil ditambahkan!",
          error: "Gagal menyimpan device.",
        }
      );

      navigate("/device");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan ke Supabase");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 dark:text-white rounded shadow-md">
      <h2 className="text-xl text-blue-800 font-semibold mb-4">
        {id ? "Edit Device" : "Tambah Device"}
      </h2>
      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">Memuat data...</p>
      ) : (
        <DeviceForm
          initialValues={initialData || undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/device")}
        />
      )}
    </div>
  );
}
