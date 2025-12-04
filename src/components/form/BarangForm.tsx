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

interface Gudang {
  id: string;
  nama_gudang: string;
}

interface BarangFormData {
  kode_barang: string;
  nama_barang: string;
  harga: string;
  satuan: string;
  id_kategori: string;
  supplier_id: string;
  gambar?: File | null;
  tipe?: string;
  merk?: string;

  // 🔥 FIELD BARU
  stok: string;
  gudang_id: string;
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
    satuan: "",
    id_kategori: "",
    supplier_id: "",
    gambar: null,
    tipe: "",
    merk: "",
    stok: "", // 🔥 Baru
    gudang_id: "", // 🔥 Baru
    ...initialValues,
  });

  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [gudangList, setGudangList] = useState<Gudang[]>([]);

  const [filteredKategori, setFilteredKategori] = useState<Kategori[]>([]);
  const [filteredSupplier, setFilteredSupplier] = useState<Supplier[]>([]);
  const [filteredGudang, setFilteredGudang] = useState<Gudang[]>([]);

  const [uploading, setUploading] = useState(false);

  const [searchKategori, setSearchKategori] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchGudang, setSearchGudang] = useState("");

  const [showKategoriDropdown, setShowKategoriDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showGudangDropdown, setShowGudangDropdown] = useState(false);

  // ---------------- FETCH DROPDOWNS ----------------
  useEffect(() => {
    const fetchDropdown = async () => {
      const [
        { data: kategoriData },
        { data: supplierData },
        { data: gudangData },
      ] = await Promise.all([
        supabase.from("Kategori").select("id, nama_kategori"),
        supabase.from("Supplier").select("id, nama_supplier"),
        supabase.from("gudang").select("id, nama_gudang"), // 🔥 Gudang
      ]);

      setKategoriList(kategoriData || []);
      setSupplierList(supplierData || []);
      setGudangList(gudangData || []);

      setFilteredKategori(kategoriData || []);
      setFilteredSupplier(supplierData || []);
      setFilteredGudang(gudangData || []);
    };
    fetchDropdown();
  }, []);

  // ---------------- UPDATE INITIAL VALUES ----------------
  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        stok: initialValues.stok || "",
        gudang_id: initialValues.gudang_id || "",
        gambar: null,
      }));
    }
  }, [initialValues]);

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleChange = (e: any) => {
    const { name, value, files } = e.target;

    if (name === "gambar" && files) {
      setFormData({ ...formData, gambar: files[0] });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // ---------------- SUBMIT FORM ----------------
 const handleSubmit = async (e : React.FormEvent) => {
  e.preventDefault();
  setUploading(true);

  try {
    let imagePath = initialValues?.gambar || null;

    if (formData.gambar instanceof File) {
      const fileExt = formData.gambar.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `barang/${fileName}`;

      const { error } = await supabase.storage
        .from("barang-images")
        .upload(filePath, formData.gambar);

      if (error) throw error;
      imagePath = filePath;
    }

    await onSubmit({
      ...formData,
      gambar: imagePath,
    });

  } catch (err) {
    console.error("Submit barang error:", err);
  }

  setUploading(false);
};

  const inputBase =
    "w-full px-3 py-2 rounded border bg-white dark:bg-gray-800 " +
    "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

  // ---------------- VIEW ----------------
  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* kode barang */}
        <div>
          <label className="text-sm dark:text-white">Kode Barang</label>
          <input
            name="kode_barang"
            value={formData.kode_barang}
            onChange={handleChange}
            autoComplete="off"
            className={inputBase}
          />
        </div>

        {/* nama barang */}
        <div>
          <label className="text-sm dark:text-white">Nama Barang</label>
          <input
            name="nama_barang"
            value={formData.nama_barang}
            onChange={handleChange}
            autoComplete="off"
            className={inputBase}
          />
        </div>

        {/* harga */}
        <div>
          <label className="text-sm dark:text-white">Harga</label>
          <input
            type="number"
            name="harga"
            value={formData.harga}
            onChange={handleChange}
            autoComplete="off"
            className={inputBase}
          />
        </div>

        {/* satuan */}
        <div>
          <label className="text-sm dark:text-white">Satuan</label>
          <input
            name="satuan"
            value={formData.satuan}
            onChange={handleChange}
            autoComplete="off"
            className={inputBase}
          />
        </div>

        {/* stok awal */}
        <div>
          <label className="text-sm dark:text-white">Stok Awal</label>
          <input
            type="number"
            name="stok"
            value={formData.stok}
            onChange={handleChange}
            autoComplete="off"
            className={inputBase}
            placeholder="Isi stok awal"
          />
        </div>

        {/* gudang */}
        <div className="relative">
          <label className="text-sm dark:text-white">Gudang</label>
          <input
            autoComplete="off"
            value={
              formData.gudang_id
                ? gudangList.find((g) => g.id === formData.gudang_id)
                    ?.nama_gudang || ""
                : searchGudang
            }
            onChange={(e) => {
              const val = e.target.value;
              setSearchGudang(val);
              setFormData({ ...formData, gudang_id: "" });
              setFilteredGudang(
                gudangList.filter((g) =>
                  g.nama_gudang.toLowerCase().includes(val.toLowerCase())
                )
              );
              setShowGudangDropdown(true);
            }}
            onFocus={() => setShowGudangDropdown(true)}
            placeholder="Cari gudang..."
            className={inputBase}
          />

          {showGudangDropdown && (
            <ul
              className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto 
                       bg-white dark:bg-gray-800 border 
                       border-gray-300 dark:border-gray-600 rounded shadow">
              {filteredGudang.map((g) => (
                <li
                  key={g.id}
                  onClick={() => {
                    setFormData({ ...formData, gudang_id: g.id });
                    setSearchGudang(g.nama_gudang);
                    setShowGudangDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:text-white dark:hover:bg-gray-700">
                  {g.nama_gudang}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* kategori */}
        <div className="relative">
          <label className="text-sm dark:text-white">Kategori</label>
          <input
            autoComplete="off"
            value={
              formData.id_kategori
                ? kategoriList.find((k) => k.id === formData.id_kategori)
                    ?.nama_kategori || ""
                : searchKategori
            }
            onChange={(e) => {
              const val = e.target.value;
              setSearchKategori(val);
              setFormData({ ...formData, id_kategori: "" });
              setFilteredKategori(
                kategoriList.filter((k) =>
                  k.nama_kategori.toLowerCase().includes(val.toLowerCase())
                )
              );
              setShowKategoriDropdown(true);
            }}
            onFocus={() => setShowKategoriDropdown(true)}
            className={inputBase}
          />

          {showKategoriDropdown && (
            <ul
              className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto 
                       bg-white dark:bg-gray-800 border 
                       border-gray-300 dark:border-gray-600 rounded shadow">
              {filteredKategori.map((k) => (
                <li
                  key={k.id}
                  onClick={() => {
                    setFormData({ ...formData, id_kategori: k.id });
                    setSearchKategori(k.nama_kategori);
                    setShowKategoriDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:text-white dark:hover:bg-gray-700">
                  {k.nama_kategori}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* supplier */}
        <div className="relative">
          <label className="text-sm dark:text-white">Supplier</label>
          <input
            autoComplete="off"
            value={
              formData.supplier_id
                ? supplierList.find((s) => s.id === formData.supplier_id)
                    ?.nama_supplier || ""
                : searchSupplier
            }
            onChange={(e) => {
              const val = e.target.value;
              setSearchSupplier(val);
              setFormData({ ...formData, supplier_id: "" });
              setFilteredSupplier(
                supplierList.filter((s) =>
                  s.nama_supplier.toLowerCase().includes(val.toLowerCase())
                )
              );
              setShowSupplierDropdown(true);
            }}
            onFocus={() => setShowSupplierDropdown(true)}
            className={inputBase}
          />

          {showSupplierDropdown && (
            <ul
              className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto 
                       bg-white dark:bg-gray-800 border 
                       border-gray-300 dark:border-gray-600 rounded shadow">
              {filteredSupplier.map((s) => (
                <li
                  key={s.id}
                  onClick={() => {
                    setFormData({ ...formData, supplier_id: s.id });
                    setSearchSupplier(s.nama_supplier);
                    setShowSupplierDropdown(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100 dark:text-white dark:hover:bg-gray-700">
                  {s.nama_supplier}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* merk */}
        <div>
          <label className="text-sm dark:text-white">Merk</label>
          <input
            name="merk"
            autoComplete="off"
            value={formData.merk}
            onChange={handleChange}
            className={inputBase}
          />
        </div>

        {/* tipe */}
        <div>
          <label className="text-sm dark:text-white">Tipe</label>
          <input
            name="tipe"
            autoComplete="off"
            value={formData.tipe}
            onChange={handleChange}
            className={inputBase}
          />
        </div>

        {/* gambar */}
        <div>
          <label className="text-sm dark:text-white">Upload Gambar</label>
          <input
            type="file"
            name="gambar"
            accept="image/*"
            autoComplete="off"
            onChange={handleChange}
            className="block w-full text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* tombol */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded transition">
          {uploading ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition">
          Batal
        </button>
      </div>
    </form>
  );
}
