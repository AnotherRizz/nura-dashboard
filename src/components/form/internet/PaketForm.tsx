import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

interface PaketFormData {
  nama_paket: string;
  deskripsi: string;
  speed: string;
  harga: string;
  fitur: string[];
}

interface PaketFormProps {
  initialValues?: Partial<PaketFormData>;
  onSubmit: (formData: PaketFormData) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function PaketForm({
  initialValues,
  onSubmit,
  onCancel,
}: PaketFormProps) {
  const [formData, setFormData] = useState<PaketFormData>({
    nama_paket: "",
    deskripsi: "",
    speed: "",
    harga: "",
    fitur: [],
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

  const handleFiturChange = (index: number, value: string) => {
    const newFitur = [...formData.fitur];
    newFitur[index] = value;
    setFormData({ ...formData, fitur: newFitur });
  };

  const addFitur = () => {
    setFormData({ ...formData, fitur: [...formData.fitur, ""] });
  };

  const removeFitur = (index: number) => {
    const newFitur = formData.fitur.filter((_, i) => i !== index);
    setFormData({ ...formData, fitur: newFitur });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Paket */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nama Paket</label>
          <input
            type="text"
            name="nama_paket"
            value={formData.nama_paket}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nama paket"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block mb-1 text-sm font-medium">Deskripsi</label>
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan deskripsi paket"
          />
        </div>

        {/* Speed */}
        <div>
          <label className="block mb-1 text-sm font-medium">Speed</label>
          <input
            type="text"
            name="speed"
            value={formData.speed}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Contoh: 20 Mbps"
          />
        </div>

        {/* Harga */}
        <div>
          <label className="block mb-1 text-sm font-medium">Harga</label>
          <input
            type="number"
            name="harga"
            value={formData.harga}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan harga"
          />
        </div>

        {/* Fitur */}
        <div>
          <label className="block mb-1 text-sm font-medium">Fitur</label>
          {formData.fitur.map((f, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={f}
                onChange={(e) => handleFiturChange(i, e.target.value)}
                className="w-full rounded border px-3 py-2 dark:border-gray-600"
                placeholder={`Fitur ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeFitur(i)}
                className="px-3 py-2 bg-red-500 text-white rounded">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFitur}
            className="px-3 py-2 bg-blue-600 text-white rounded">
            <PlusCircleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Tombol Aksi */}
      <div className="flex gap-3 justify-end">
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
