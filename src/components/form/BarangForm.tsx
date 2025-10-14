import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";

interface Kategori {
  id: string;
  nama_kategori: string;
}

interface Supplier {
  id: string;
  nama_supplier: string;
}

interface BarangFormData {
  kode_barang: string;
  nama_barang: string;
  harga: string;
  stok: string;
  satuan: string;
  id_kategori: string;
  supplier_id: string;
  gambar?: File | null;
  tipe?: string;
  merk?: string;
}

interface BarangFormProps {
  initialValues?: any;
  onSubmit: (formData: any) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

export default function BarangForm({
  initialValues,
  onSubmit,
  onCancel,
}: BarangFormProps) {
  const [formData, setFormData] = useState<BarangFormData>({
    kode_barang: "",
    nama_barang: "",
    harga: "",
    stok: "",
    satuan: "",
    id_kategori: "",
    supplier_id: "",
    gambar: null,
    tipe: "",
    merk: "",
    ...initialValues,
  });

  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [uploading, setUploading] = useState(false);

  // 🔍 State tambahan untuk dropdown kategori & supplier
  const [searchKategori, setSearchKategori] = useState("");
  const [filteredKategori, setFilteredKategori] = useState<Kategori[]>([]);
  const [showKategoriDropdown, setShowKategoriDropdown] = useState(false);

  const [searchSupplier, setSearchSupplier] = useState("");
  const [filteredSupplier, setFilteredSupplier] = useState<Supplier[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // 🔹 ambil kategori & supplier
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [{ data: kategoriData }, { data: supplierData }] =
          await Promise.all([
            supabase.from("Kategori").select("id, nama_kategori"),
            supabase.from("Supplier").select("id, nama_supplier"),
          ]);

        setKategoriList(kategoriData || []);
        setSupplierList(supplierData || []);
        setFilteredKategori(kategoriData || []);
        setFilteredSupplier(supplierData || []);
      } catch (err) {
        console.error("Gagal ambil kategori/supplier", err);
      }
    };
    fetchDropdownData();
  }, []);

  // sync initialValues
  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        gambar: null, // reset supaya bisa upload baru
      }));
    }
  }, [initialValues]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "gambar" && files) {
      setFormData({ ...formData, gambar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 🔹 convert URL → path relatif
  const normalizePath = (urlOrPath: string) => {
    if (!urlOrPath) return null;
    return urlOrPath.includes("/object/public/barang-images/")
      ? urlOrPath.split("/object/public/barang-images/")[1]
      : urlOrPath;
  };

  // 🔹 hapus file lama dari storage
  const deleteOldImage = async (oldPath: string) => {
    if (!oldPath) return;
    const { error } = await supabase.storage
      .from("barang-images")
      .remove([oldPath]);
    if (error) console.error("Gagal hapus gambar lama:", error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    // simpan path lama (kalau ada)
    let imagePath: string | null = initialValues?.gambar || null;

    try {
      // kalau user upload gambar baru
      if (formData.gambar instanceof File) {
        // hapus dulu file lama
        if (initialValues?.gambar) {
          const oldPath = normalizePath(initialValues.gambar);
          if (oldPath) await deleteOldImage(oldPath);
        }

        // upload baru
        const fileExt = formData.gambar.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `barang/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("barang-images")
          .upload(filePath, formData.gambar, { upsert: false });

        if (uploadError) throw uploadError;

        imagePath = filePath; // ⬅ simpan PATH ke DB
      }

      // kirim payload ke parent
      const payload = {
        ...formData,
        gambar: imagePath, // path saja
      };

      // biar File object nggak ikut
      delete (payload as any).gambar;

      await onSubmit({ ...payload, gambar: imagePath });
    } catch (err) {
      console.error("Gagal submit form:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kode Barang */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Kode Barang</label>
          <input
            type="text"
            name="kode_barang"
            value={formData.kode_barang}
            onChange={handleChange}
            className="w-full rounded dark:border-gray-600 dark:text-white border px-3 py-2"
          />
        </div>

        {/* Nama Barang */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Nama Barang</label>
          <input
            type="text"
            name="nama_barang"
            value={formData.nama_barang}
            onChange={handleChange}
            className="w-full rounded dark:border-gray-600 dark:text-white border px-3 py-2"
          />
        </div>

        {/* Harga */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Harga</label>
          <input
            type="number"
            name="harga"
            value={formData.harga}
            onChange={handleChange}
            className="w-full rounded dark:border-gray-600 dark:text-white border px-3 py-2"
          />
        </div>

        {/* Stok */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Stok</label>
          <input
            type="number"
            name="stok"
            value={formData.stok}
            onChange={handleChange}
            className="w-full rounded dark:border-gray-600 dark:text-white border px-3 py-2"
          />
        </div>

        {/* Satuan */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Satuan</label>
          <input
            type="text"
            name="satuan"
            value={formData.satuan}
            onChange={handleChange}
            className="w-full rounded dark:border-gray-600 dark:text-white border px-3 py-2"
          />
        </div>

        {/* 🔍 Searchable Dropdown Kategori */}
        <div className="relative">
          <label className="block mb-1 text-sm font-medium dark:text-white">Kategori</label>
          <input
            type="text"
            value={
              formData.id_kategori
                ? kategoriList.find((k) => k.id === formData.id_kategori)
                    ?.nama_kategori || ""
                : searchKategori
            }
            onChange={(e) => {
              const value = e.target.value;
              setSearchKategori(value);
              setFormData({ ...formData, id_kategori: "" });
              setFilteredKategori(
                kategoriList.filter((k) =>
                  k.nama_kategori.toLowerCase().includes(value.toLowerCase())
                )
              );
              setShowKategoriDropdown(true);
            }}
            onFocus={() => setShowKategoriDropdown(true)}
            placeholder="Cari kategori..."
            className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:text-white"
          />
          {showKategoriDropdown && (
            <ul className="absolute z-10 bg-white dark:bg-gray-700 w-full border rounded mt-1 max-h-48 overflow-y-auto shadow">
              {filteredKategori.length > 0 ? (
                filteredKategori.map((k) => (
                  <li
                    key={k.id}
                    onClick={() => {
                      setFormData({ ...formData, id_kategori: k.id });
                      setSearchKategori(k.nama_kategori);
                      setShowKategoriDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    {k.nama_kategori}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-400 text-sm">
                  Kategori tidak ditemukan
                </li>
              )}
            </ul>
          )}
        </div>

        {/* 🔍 Searchable Dropdown Supplier */}
        <div className="relative">
          <label className="block mb-1 text-sm font-medium dark:text-white">Supplier</label>
          <input
            type="text"
            value={
              formData.supplier_id
                ? supplierList.find((s) => s.id === formData.supplier_id)
                    ?.nama_supplier || ""
                : searchSupplier
            }
            onChange={(e) => {
              const value = e.target.value;
              setSearchSupplier(value);
              setFormData({ ...formData, supplier_id: "" });
              setFilteredSupplier(
                supplierList.filter((s) =>
                  s.nama_supplier.toLowerCase().includes(value.toLowerCase())
                )
              );
              setShowSupplierDropdown(true);
            }}
            onFocus={() => setShowSupplierDropdown(true)}
            placeholder="Cari supplier..."
            className="w-full rounded border px-3 py-2 dark:border-gray-600 dark:text-white"
          />
          {showSupplierDropdown && (
            <ul className="absolute z-10 bg-white dark:bg-gray-700 w-full border rounded mt-1 max-h-48 overflow-y-auto shadow">
              {filteredSupplier.length > 0 ? (
                filteredSupplier.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => {
                      setFormData({ ...formData, supplier_id: s.id });
                      setSearchSupplier(s.nama_supplier);
                      setShowSupplierDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    {s.nama_supplier}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-400 text-sm">
                  Supplier tidak ditemukan
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Merk */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Merk</label>
          <input
            type="text"
            name="merk"
            value={formData.merk}
            onChange={handleChange}
            className="w-full rounded dark:border-gray-600 dark:text-white border px-3 py-2"
          />
        </div>

        {/* Tipe */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Tipe</label>
          <input
            type="text"
            name="tipe"
            value={formData.tipe}
            onChange={handleChange}
            className="w-full rounded dark:border-gray-600 dark:text-white border px-3 py-2"
          />
        </div>

        {/* Upload Gambar */}
        <div>
          <label className="block mb-1 text-sm font-medium dark:text-white">Upload Gambar</label>
          <input
            type="file"
            name="gambar"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
          {(initialValues?.gambar || formData.gambar) && (
            <img
              src={
                formData.gambar instanceof File
                  ? URL.createObjectURL(formData.gambar)
                  : initialValues?.gambar
                  ? supabase.storage
                      .from("barang-images")
                      .getPublicUrl(initialValues.gambar).data.publicUrl
                  : ""
              }
              alt="Preview"
              className="mt-2 w-24 h-24 object-cover rounded border"
            />
          )}
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {uploading ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-gray-800 text-white px-4 py-2 hover:bg-gray-700"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
