import { useState, useEffect } from "react";

interface KategoriFormData {
  nama_kategori: string;
}

interface KategoriFormProps {
  initialValues?: Partial<KategoriFormData>;
  onSubmit: (formData: KategoriFormData) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function KategoriForm({
  initialValues,
  onSubmit,
  onCancel,
}: KategoriFormProps) {
  const [formData, setFormData] = useState<KategoriFormData>({
    nama_kategori: "",
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
        {/* Nama Supplier */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nama Kategori</label>
          <input
            type="text"
            name="nama_kategori"
            value={formData.nama_kategori}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nama kategori"
          />
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
