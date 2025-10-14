import { useState, useEffect } from "react";

interface SupplierFormData {
  nama_supplier: string;
  nama_pt: string;
  alamat: string;
  nama_pic: string;
  telp_pic: string;
}

interface SupplierFormProps {
  initialValues?: Partial<SupplierFormData>;
  onSubmit: (formData: SupplierFormData) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function SupplierForm({
  initialValues,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    nama_supplier: "",
    nama_pt: "",
    alamat: "",
    nama_pic: "",
    telp_pic: "",
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
          <label className="block mb-1 text-sm font-medium">Nama Supplier</label>
          <input
            type="text"
            name="nama_supplier"
            value={formData.nama_supplier}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nama supplier"
          />
        </div>

        {/* Nama PT */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nama PT</label>
          <input
            type="text"
            name="nama_pt"
            value={formData.nama_pt}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nama PT"
          />
        </div>

        {/* Alamat */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium">Alamat</label>
          <textarea
            name="alamat"
            value={formData.alamat}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan alamat supplier"
          />
        </div>

        {/* PIC */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nama PIC</label>
          <input
            type="text"
            name="nama_pic"
            value={formData.nama_pic}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nama PIC"
          />
        </div>

        {/* Telepon PIC */}
        <div>
          <label className="block mb-1 text-sm font-medium">Telp PIC</label>
          <input
            type="text"
            name="telp_pic"
            value={formData.telp_pic}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 dark:border-gray-600"
            placeholder="Masukkan nomor telp PIC"
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
