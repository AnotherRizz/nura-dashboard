import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";

interface ItemType {
  id_barang: number | null;
  jumlah: number | null;
  harga_keluar: number | null;
}

interface FormDataType {
  tanggal_keluar: string;
  pic: string;
  keterangan: string;
  items: ItemType[];
}

export default function StokOutForm({
  initialValues,
  onSubmit,
  onCancel,
}: any) {
  const [barangList, setBarangList] = useState<any[]>([]);
  const [search, setSearch] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<boolean[]>([]);

  const [formData, setFormData] = useState<FormDataType>({
    tanggal_keluar: "",
    pic: "",
    keterangan: "",
    items: [],
    ...initialValues,
  });

  useEffect(() => {
    const fetchBarang = async () => {
      const { data } = await supabase.from("Barang").select("*");
      setBarangList(data || []);
    };
    fetchBarang();
  }, []);

  const updateItem = (index: number, field: keyof ItemType, value: any) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id_barang: null, jumlah: null, harga_keluar: null },
      ],
    });

    setSearch([...search, ""]);
    setOpenDropdown([...openDropdown, false]);
  };

  const removeItem = (i: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, x) => x !== i),
    });
    setSearch(search.filter((_, x) => x !== i));
    setOpenDropdown(openDropdown.filter((_, x) => x !== i));
  };

  const getBarang = (id: number | null) => barangList.find((b) => b.id === id);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        // PERBAIKAN DISINI 🔥
        const fixedFormData = {
          ...formData,
          items: formData.items.map((item) => {
            const barang = barangList.find((b) => b.id === item.id_barang);

            return {
              ...item,
              harga_keluar: item.harga_keluar ?? barang?.harga ?? 0,
            };
          }),
        };

        onSubmit(fixedFormData);
      }}
      className="space-y-4">
      {/* ========================= FORM HEADER ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative z-20">
          <label className="block mb-1 font-medium">Tanggal Keluar</label>
          <input
            type="date"
            style={{ colorScheme: "light" }}
            value={formData.tanggal_keluar}
            onChange={(e) =>
              setFormData({ ...formData, tanggal_keluar: e.target.value })
            }
            className="
      w-full rounded border px-3 py-2 
      bg-gray-100 dark:bg-gray-800 
      border-gray-300 dark:border-gray-600 
      text-gray-900 dark:text-gray-200
    "
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">PIC <small>(penanggungjawab)</small></label>
          <input
            type="text"
            value={formData.pic}
            onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
            className="
            w-full rounded border px-3 py-2 
            bg-gray-100 dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            text-gray-900 dark:text-gray-200
          "
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">Keterangan</label>
        <textarea
          value={formData.keterangan}
          onChange={(e) =>
            setFormData({ ...formData, keterangan: e.target.value })
          }
          className="
            w-full rounded border px-3 py-2 
            bg-gray-100 dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            text-gray-900 dark:text-gray-200
          "></textarea>
      </div>

      <hr className="border-gray-300 dark:border-gray-700" />

      <h3 className="text-lg font-semibold">Detail Barang Keluar</h3>

      {/* ========================= ITEMS ========================= */}

      {formData.items.map((item, idx) => {
        const barangDipilih = getBarang(item.id_barang || null);

        const filtered = barangList.filter((b) =>
          b.nama_barang
            .toLowerCase()
            .includes((search[idx] || "").toLowerCase())
        );

        return (
          <div
            key={idx}
            className="
              p-4 rounded border 
              bg-gray-100 dark:bg-gray-800/50 
              border-gray-300 dark:border-gray-700
            ">
            {/* SEARCHABLE DROPDOWN */}
            <label className="font-medium text-sm">Barang</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Cari barang..."
                value={search[idx] || ""}
                onFocus={() => {
                  const open = [...openDropdown];
                  open[idx] = true;
                  setOpenDropdown(open);
                }}
                onChange={(e) => {
                  const s = [...search];
                  s[idx] = e.target.value;
                  setSearch(s);

                  const open = [...openDropdown];
                  open[idx] = true;
                  setOpenDropdown(open);
                }}
                className="
                  w-full border px-3 py-2 rounded 
                  bg-gray-100 dark:bg-gray-900
                  border-gray-300 dark:border-gray-600
                  text-gray-900 dark:text-gray-200
                "
              />

              {/* DROPDOWN */}
              {openDropdown[idx] && (
                <div
                  className="
                  absolute top-full left-0 w-full max-h-52 mt-1
                  overflow-y-auto rounded shadow-lg z-30
                  bg-white dark:bg-gray-900
                  border border-gray-300 dark:border-gray-700
                ">
                  {filtered.length === 0 && (
                    <div className="p-2 text-gray-500 text-sm">
                      Tidak ditemukan
                    </div>
                  )}

                  {filtered.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        updateItem(idx, "id_barang", b.id);

                        const s = [...search];
                        s[idx] = b.nama_barang;
                        setSearch(s);

                        const open = [...openDropdown];
                        open[idx] = false;
                        setOpenDropdown(open);
                      }}
                      className="
                        px-3 py-2 cursor-pointer 
                        hover:bg-gray-200 dark:hover:bg-gray-700
                        text-gray-900 dark:text-gray-200
                      ">
                      {b.nama_barang} — stok: {b.stok}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HARGA DEFAULT */}
            {barangDipilih && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Harga default:{" "}
                <b>Rp {barangDipilih.harga.toLocaleString("id-ID")}</b>
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-3">
              {/* JUMALAH */}
              <div>
                <label className="block text-sm mb-1">
                  Jumlah
                  {barangDipilih && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Stok: {barangDipilih.stok})
                    </span>
                  )}
                </label>

                <input
                  type="number"
                  value={item.jumlah ?? ""}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (!barangDipilih) {
                      updateItem(idx, "jumlah", value || null);
                      return;
                    }

                    // Batasi agar tidak lebih dari stok
                    const safeValue = Math.min(value, barangDipilih.stok);

                    updateItem(idx, "jumlah", safeValue || null);
                  }}
                  className="
      w-full border px-3 py-2 rounded 
      bg-gray-100 dark:bg-gray-900
      border-gray-300 dark:border-gray-600
      text-gray-900 dark:text-gray-200
    "
                  placeholder="jumlah"
                  disabled={barangDipilih?.stok === 0}
                  min={1}
                  max={barangDipilih?.stok || undefined}
                />
                {barangDipilih?.stok === 0 && (
                  <p className="text-xs text-red-500 mt-1">Stok habis</p>
                )}
              </div>

              {/* HARGA KELUAR */}
              <div>
                <label className="block text-sm mb-1">Harga Keluar</label>
                <input
                  type="number"
                  value={item.harga_keluar ?? ""}
                  onChange={(e) =>
                    updateItem(
                      idx,
                      "harga_keluar",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="
                    w-full border px-3 py-2 rounded 
                    bg-gray-100 dark:bg-gray-900
                    border-gray-300 dark:border-gray-600
                    text-gray-900 dark:text-gray-200
                  "
                  placeholder="Opsional"
                />

                {item.harga_keluar == null && barangDipilih && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    *Harga default akan digunakan (Rp{" "}
                    {barangDipilih.harga.toLocaleString("id-ID")})
                  </p>
                )}
              </div>
            </div>

            {/* HAPUS */}
            <button
              type="button"
              className="
                mt-3 bg-red-600 hover:bg-red-700 text-white 
                px-3 py-1 rounded
              "
              onClick={() => removeItem(idx)}>
              Hapus
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="
          bg-gray-800 hover:bg-gray-700 text-white 
          px-4 py-2 rounded
        ">
        + Tambah Item
      </button>

      {/* SUBMIT */}
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Simpan
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          Batal
        </button>
      </div>
    </form>
  );
}
