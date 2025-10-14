import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../services/supabaseClient";
interface Area {
  id: string;
  nama_area: string;
}

interface DeviceFormData {
  nama: string;
  no_sn: string;
  ip: string;
  portApi: string;
  username: string;
  password: string;
  status: string;
  areaId: string;
}

interface DeviceFormProps {
  initialValues?: Partial<DeviceFormData>;
  onSubmit: (formData: DeviceFormData) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function DeviceForm({
  initialValues,
  onSubmit,
  onCancel,
}: DeviceFormProps) {
  const [formData, setFormData] = useState<DeviceFormData>({
    nama: "",
    no_sn: "",
    ip: "",
    portApi: "8728",
    username: "",
    password: "",
    status: "nonaktif",
    areaId: "",
    ...initialValues,
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // update form jika initialValues berubah
  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({ ...prev, ...initialValues }));
    }
  }, [initialValues]);

  // Ambil data area dari Supabase
  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      try {
        const { data, error } = await supabase
          .from("Area")
          .select("id, nama_area")
          .order("nama_area", { ascending: true });
        if (error) throw error;
        setAreas(data || []);
      } catch (err) {
        console.error("Gagal memuat area dari Supabase", err);
      } finally {
        setLoadingAreas(false);
      }
    };

    fetchAreas();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama || !formData.no_sn || !formData.areaId) {
      return alert("Nama, Nomor Seri, dan Area wajib diisi");
    }

    onSubmit({
      ...formData,
      areaId: String(formData.areaId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Device */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nama Device</label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nama device"
          />
        </div>

        {/* Nomor Seri */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nomor Seri</label>
          <input
            type="text"
            name="no_sn"
            value={formData.no_sn}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nomor seri device"
          />
        </div>

        {/* IP Address */}
        <div>
          <label className="block mb-1 text-sm font-medium">IP Address</label>
          <input
            type="text"
            name="ip"
            value={formData.ip}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="contoh: 192.168.88.1"
          />
        </div>

        {/* Port API */}
        <div>
          <label className="block mb-1 text-sm font-medium">Port API</label>
          <input
            type="number"
            name="portApi"
            value={formData.portApi}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="8728"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block mb-1 text-sm font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="admin"
            autoComplete="off"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 pr-10 dark:border-gray-600"
              placeholder="••••••••"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
            >
              {showPassword ? (
                <EyeIcon className="h-5 w-5" />
              ) : (
                <EyeSlashIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
          >
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        {/* Area */}
        <div>
          <label className="block mb-1 text-sm font-medium">Area</label>
          {loadingAreas ? (
            <div className="text-gray-500 text-sm">Memuat area...</div>
          ) : (
            <select
              name="areaId"
              value={formData.areaId}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 dark:border-gray-600"
            >
              <option value="">-- Pilih Area --</option>
              {areas.map((a) => (
                <option key={String(a.id)} value={String(a.id)}>
                  {a.nama_area}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-red-500 text-white px-4 py-2 hover:bg-red-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
