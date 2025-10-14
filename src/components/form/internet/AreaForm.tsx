import { useState, useEffect } from "react";
import MultiSelect from "../MultiSelect";
import MapPicker from "../../ui/MapPicker";

interface AreaFormData {
  nama_area: string;
  latitude: string;
  longitude: string;
  radius: string;
  paketIds: number[];
}

interface AreaFormProps {
  initialValues?: Partial<AreaFormData>;
  paketList?: { id: string | number; nama_paket: string }[];
  onSubmit: (formData: AreaFormData) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function AreaForm({
  initialValues,
  paketList = [],
  onSubmit,
  onCancel,
}: AreaFormProps) {
  const [formData, setFormData] = useState<AreaFormData>({
    nama_area: "",
    latitude: "",
    longitude: "",
    radius: "5",
    paketIds: [],
    ...initialValues,
  });

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Area */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nama Area</label>
          <input
            type="text"
            name="nama_area"
            value={formData.nama_area}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nama area"
          />
        </div>

        {/* Latitude */}
        <div>
          <label className="block mb-1 text-sm font-medium">Latitude</label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan latitude"
          />
        </div>

        {/* Longitude */}
        <div>
          <label className="block mb-1 text-sm font-medium">Longitude</label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan longitude"
          />
        </div>

        {/* Radius */}
        <div>
          <label className="block mb-1 text-sm font-medium">Radius (Km)</label>
          <input
            type="number"
            step="any"
            name="radius"
            value={formData.radius}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan radius area dalam km"
          />
        </div>

        {/* Pilih Paket */}
        <div>
          <MultiSelect
            label="Pilih Paket (bisa lebih dari 1)"
            options={paketList.map((p) => ({
              value: p.id.toString(),
              text: p.nama_paket, // ganti dari p.nama jadi p.nama_paket
            }))}
            defaultSelected={formData.paketIds.map((id) => id.toString())}
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                paketIds: selected.map((id) => Number(id)),
              }))
            }
          />
        </div>
        {/* Map Picker */}
        <div className="">
          <label className="block mb-1 text-sm font-medium">
            Pilih Lokasi di Peta
          </label>
          <MapPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={(lat, lng) =>
              setFormData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
              }))
            }
          />
        </div>
      </div>
      {/* Tombol Aksi */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-red-500 text-white px-4 py-2 hover:bg-red-600">
          Batal
        </button>
      </div>
    </form>
  );
}
