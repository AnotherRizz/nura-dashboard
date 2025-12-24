import { useState, useEffect, useRef } from "react";
import { supabase } from "../../services/supabaseClient";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css"; // theme gelap
import toast from "react-hot-toast";

interface ItemType {
  jumlah_lama: number;
  id_barang: number | null;
  jumlah: number | null;
  harga_keluar: number | null;
  serial_numbers?: number[]; //
  distribusi?: {
    gudang_id: number;
    nama_gudang: string;
    jumlah: number;
  }[];
}

interface FormDataType {
  tanggal_keluar: string;
  pic: string;
  keterangan: string;
  nama_project: string;
  lokasi: string;
  no_spk: string;
  items: ItemType[];
}
interface StokGudangType {
  barang_id: number;
  stok: number;
  gudang: {
    nama_gudang: string;
  } | null;
}

export default function StokOutForm({
  initialValues,
  onSubmit,
  onCancel,
}: any) {
  const [barangList, setBarangList] = useState<any[]>([]);
  const [search, setSearch] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<boolean[]>([]);
  const [stokGudang, setStokGudang] = useState<StokGudangType[]>([]);
  const [snOptions, setSnOptions] = useState<Record<number, any[]>>({});

  const dateRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (dateRef.current) {
      flatpickr(dateRef.current, {
        dateFormat: "Y-m-d",
        allowInput: true,
        static: true,
        disableMobile: true,
        onChange: (_selectedDates, dateStr) => {
          setFormData((prev) => ({ ...prev, tanggal_keluar: dateStr }));
        },
      });
    }
  }, []);
  const [formData, setFormData] = useState<FormDataType>({
    tanggal_keluar: "",
    pic: "",
    keterangan: "",
    nama_project: "",
    lokasi: "",
    no_spk: "",
    items: initialValues?.items ?? [],
    ...initialValues,
  });

  useEffect(() => {
    if (initialValues?.items) {
      const withOld = initialValues.items.map((item: any) => ({
        ...item,
        jumlah_lama: item.jumlah, // simpan jumlah lama (penting!)
      }));

      setFormData((prev) => ({
        ...prev,
        ...initialValues,
        items: withOld,
      }));

      if (initialValues.items) {
        setSearch(
          initialValues.items.map((item: any) => {
            const barang = barangList.find((b) => b.id === item.id_barang);
            return barang ? barang.nama_barang : "";
          })
        );
        setOpenDropdown(initialValues.items.map(() => false));
      }
    }
  }, [initialValues, barangList]);

  /* ============================================================
     AMBIL STOK GUDANG
  ============================================================ */
  useEffect(() => {
    const fetchStokGudang = async () => {
      const { data } = await supabase
        .from("stok_gudang")
        .select("barang_id, stok, gudang_id, gudang(nama_gudang)");

      setStokGudang(
        (data || []).map((row: any) => ({
          barang_id: row.barang_id,
          stok: row.stok,
          gudang_id: row.gudang_id,
          gudang: Array.isArray(row.gudang) ? row.gudang[0] : row.gudang,
        }))
      );
    };

    fetchStokGudang();
  }, []);
  const fetchSerialNumbers = async (barangId: number) => {
    const { data, error } = await supabase
      .from("serial_number")
      .select(
        `
      id,
      sn,
      status,
      stok_gudang!serial_number_stok_gudang_id_fkey!inner (
        id,
        barang_id,
        gudang_id
      )
    `
      )
      .eq("status", "available")
      .eq("stok_gudang.barang_id", barangId);

    if (error) {
      console.error("SN error:", error);
      return [];
    }

    return data || [];
  };

  const loadSN = async (barangId: number, index: number) => {
    const data = await fetchSerialNumbers(barangId);
    console.log("SN loaded:", data);
    setSnOptions((prev) => ({
      ...prev,
      [index]: data,
    }));
  };

  const getRemainingStokForItem = (barangId: number, currentIndex: number) => {
    const total = getTotalStok(barangId);

    const usedByOtherRows = formData.items.reduce((sum, item, idx) => {
      if (idx === currentIndex) return sum;

      if (item.id_barang === barangId) {
        return sum + (item.jumlah ?? 0);
      }
      return sum;
    }, 0);

    const currentOld = formData.items[currentIndex]?.jumlah_lama ?? 0;

    return total - usedByOtherRows + currentOld;
  };

  const getGudangList = (barangId: number) => {
    return stokGudang
      .filter((s) => s.barang_id === barangId)
      .map(
        (s) =>
          `${s.gudang?.nama_gudang || "-"} (${s.stok} ${
            getBarang(barangId)?.satuan || ""
          })`
      )
      .join(", ");
  };

  const getStokByBarang = (barangId: number) => {
    return stokGudang.filter((s) => s.barang_id === barangId);
  };

  const getTotalStok = (barangId: number) => {
    return getStokByBarang(barangId).reduce((t, s) => t + s.stok, 0);
  };

  const generateDistribusi = (barangId: number, jumlah: number) => {
    const stokList = stokGudang
      .filter((s) => s.barang_id === barangId)
      .sort((a, b) => b.stok - a.stok); // ambil dari stok terbesar dulu

    let sisa = jumlah;
    const distribusi: any[] = [];

    stokList.forEach((s) => {
      if (sisa <= 0) return;

      const ambil = Math.min(s.stok, sisa);
      distribusi.push({
        gudang_id: (s as any).gudang_id ?? 0,
        nama_gudang: s.gudang?.nama_gudang || "-",
        jumlah: ambil,
      });

      sisa -= ambil;
    });

    return distribusi;
  };

  /* ============================================================
     AMBIL BARANG
  ============================================================ */
  useEffect(() => {
    const fetchBarang = async () => {
      const { data } = await supabase.from("Barang").select("*");
      setBarangList(data || []);
    };
    fetchBarang();
  }, []);

  const updateItem = (
    index: number,
    field: keyof ItemType | null,
    value: any
  ) => {
    const updated = [...formData.items];

    if (field === null) {
      updated[index] = value; // replace object
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setFormData({ ...formData, items: updated });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id_barang: null,
          jumlah: null,
          harga_keluar: null,
          jumlah_lama: 0,
        },
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ============================= FORM ============================= */}
      <div className="md:col-span-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();

            // 🔥 VALIDASI BARANG KOSONG
            if (formData.items.length === 0) {
              toast.error("Barang yang di pilih tidak boleh kosong!");
              return;
            }
            for (let i = 0; i < formData.items.length; i++) {
              const item = formData.items[i];

              if (item.serial_numbers?.length !== item.jumlah) {
                toast.error(
                  `Serial Number baris ${i + 1} harus dipilih sebanyak ${
                    item.jumlah
                  }`
                );
                return;
              }
            }

            for (let i = 0; i < formData.items.length; i++) {
              const item = formData.items[i];

              if (!item.id_barang) {
                toast.error(`Barang pada baris ${i + 1} belum dipilih!`);
                return;
              }

              if (!item.jumlah || item.jumlah <= 0) {
                toast.error(`Jumlah pada baris ${i + 1} tidak valid!`);
                return;
              }

              const stokTersisa = getRemainingStokForItem(item.id_barang, i);
              if (item.jumlah > stokTersisa) {
                toast.error(`Jumlah baris ${i + 1} melebihi stok tersedia!`);
                return;
              }
            }

            // Jika semua valid, baru proses data
            const fixedFormData = {
              ...formData,
              tanggal_keluar:
                formData.tanggal_keluar === "" ? null : formData.tanggal_keluar,

              items: formData.items.map((item) => {
                const barang = barangList.find((b) => b.id === item.id_barang);
                return {
                  ...item,
                  harga_keluar: item.harga_keluar ?? barang?.harga ?? 0,
                  distribusi: Array.isArray(item.distribusi)
                    ? item.distribusi
                    : [],
                };
              }),
            };

            onSubmit(fixedFormData);
          }}
          className="space-y-5">
          {/* ========================= HEADER ========================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tanggal */}
            <div className="relative z-20">
              <label className="block mb-1 font-medium">Tanggal Keluar</label>

              <input
                ref={dateRef}
                type="text"
                autoComplete="off"
                value={formData.tanggal_keluar}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_keluar: e.target.value })
                }
                className="
      w-full rounded-lg border px-3 py-2
      bg-gray-100 dark:bg-gray-800
      border-gray-300 dark:border-gray-600
      text-gray-900 dark:text-gray-200
      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
      transition
    "
                placeholder="Pilih tanggal..."
              />
            </div>

            {/* PIC */}
            <div>
              <label className="block mb-1 font-medium">
                PIC <small>(Penanggung Jawab)</small>
              </label>
              <input
                type="text"
                value={formData.pic}
                onChange={(e) =>
                  setFormData({ ...formData, pic: e.target.value })
                }
                className="
                w-full rounded-lg border px-3 py-2
                bg-gray-100 dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition
              "
              />
            </div>
            {/* Nama Project */}
            <div>
              <label className="block mb-1 font-medium">Nama Project</label>
              <input
                type="text"
                value={formData.nama_project}
                onChange={(e) =>
                  setFormData({ ...formData, nama_project: e.target.value })
                }
                className="
                w-full rounded-lg border px-3 py-2
                bg-gray-100 dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition
              "
              />
            </div>
            {/* Lokasi */}
            <div>
              <label className="block mb-1 font-medium">Lokasi</label>
              <input
                type="text"
                value={formData.lokasi}
                onChange={(e) =>
                  setFormData({ ...formData, lokasi: e.target.value })
                }
                className="
                w-full rounded-lg border px-3 py-2
                bg-gray-100 dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition
              "
              />
            </div>
            {/* No SPK */}
            <div>
              <label className="block mb-1 font-medium">No SPK</label>
              <input
                type="text"
                value={formData.no_spk}
                onChange={(e) =>
                  setFormData({ ...formData, no_spk: e.target.value })
                }
                className="
                w-full rounded-lg border px-3 py-2
                bg-gray-100 dark:bg-gray-800
                border-gray-300 dark:border-gray-600
                text-gray-900 dark:text-gray-200
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                transition
              "
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block mb-1 font-medium">Keterangan</label>
            <textarea
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              className="
              w-full rounded-lg border px-3 py-2
              bg-gray-100 dark:bg-gray-800
              border-gray-300 dark:border-gray-600
              text-gray-900 dark:text-gray-200
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              transition
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
            const totalStok = barangDipilih
              ? getTotalStok(barangDipilih.id)
              : 0;
            const jumlah = item.jumlah ?? 0;
            const selectedCount = item.serial_numbers?.length ?? 0;
            const showSN = jumlah > 0 && !!snOptions[idx];

            return (
              <div
                key={idx}
                className="
                p-4 rounded-lg border
                bg-gray-100 dark:bg-gray-800
                border-gray-300 dark:border-gray-700
              ">
                {/* Search barang */}
                <label className="font-medium text-sm">Barang</label>

                <div className="relative mt-1">
                  <input
                    type="text"
                    required
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
                    w-full border px-3 py-2 rounded-lg
                    bg-gray-100 dark:bg-gray-900
                    border-gray-300 dark:border-gray-600
                    text-gray-900 dark:text-gray-200
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    transition
                  "
                  />

                  {openDropdown[idx] && (
                    <div
                      className="
                      absolute top-full left-0 w-full max-h-52 mt-1
                      overflow-y-auto rounded-lg shadow-lg z-30
                      bg-white dark:bg-gray-900
                      border border-gray-300 dark:border-gray-700
                    ">
                      {filtered.length === 0 && (
                        <div className="p-2 text-gray-500 text-sm">
                          Tidak ditemukan
                        </div>
                      )}

                      {filtered.map((b) => {
                        const gudangList = getGudangList(b.id);

                        return (
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
                            <div className="font-medium">{b.nama_barang}</div>
                            <div className="text-sm text-gray-500">
                              Total stok: {getTotalStok(b.id)} {b.satuan}
                            </div>
                            <div className="text-sm text-gray-400">
                              {gudangList}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Jumlah */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-sm">
                      Jumlah{" "}
                      <span className="text-gray-400">
                        (Stok tersedia:{" "}
                        {getRemainingStokForItem(item.id_barang || 0, idx)})
                      </span>
                    </label>

                    <input
                      type="number"
                      value={item.jumlah ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const val = Number(raw);

                        // Biarkan user mengetik apapun dulu
                        updateItem(idx, "jumlah", raw === "" ? null : val);
                      }}
                      onBlur={() => {
                        const barangDipilih = getBarang(item.id_barang || null);
                        if (!barangDipilih) {
                          toast.error("Pilih barang terlebih dahulu!");
                          return;
                        }

                        const remainingStok = getRemainingStokForItem(
                          barangDipilih.id,
                          idx
                        );
                        const jumlahNow = item.jumlah ?? 0;

                        if (jumlahNow > remainingStok) {
                          toast.error(
                            `Jumlah tidak boleh melebihi stok tersedia (${remainingStok})`
                          );
                        }

                        const fixed = Math.min(jumlahNow, remainingStok);

                        updateItem(idx, null as any, {
                          ...item,
                          jumlah: fixed,
                          distribusi: generateDistribusi(
                            barangDipilih.id,
                            fixed
                          ),
                        });
                        if (fixed > 0) {
                          loadSN(barangDipilih.id, idx);
                        }
                      }}
                      className="
    w-full border px-3 py-2 rounded-lg
    bg-gray-100 dark:bg-gray-900
    border-gray-300 dark:border-gray-600
    text-gray-900 dark:text-gray-200
  "
                      placeholder="Jumlah"
                      disabled={totalStok === 0}
                    />

                    {totalStok === 0 && (
                      <p className="text-xs text-red-500 mt-1">Stok habis</p>
                    )}
                  </div>
                </div>
                {showSN && (
                  <div className="mt-3">
                    <label className="text-sm font-medium">
                      Pilih Serial Number ({selectedCount}/{jumlah})
                    </label>

                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {snOptions[idx].map((sn) => {
                        const checked =
                          item.serial_numbers?.includes(sn.id) ?? false;

                        return (
                          <label
                            key={sn.id}
                            className={`
              flex items-center gap-2 p-2 rounded border cursor-pointer
              ${
                checked
                  ? "bg-blue-100 dark:bg-blue-500/20 border-blue-500"
                  : "bg-white dark:bg-gray-800 border-gray-300"
              }
            `}>
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!checked && selectedCount >= jumlah}
                              onChange={() => {
                                let selected = item.serial_numbers ?? [];

                                if (checked) {
                                  selected = selected.filter(
                                    (id) => id !== sn.id
                                  );
                                } else {
                                  selected = [...selected, sn.id];
                                }

                                updateItem(idx, "serial_numbers", selected);
                              }}
                            />
                            <span>{sn.sn}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hapus */}
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg">
                  Hapus
                </button>
              </div>
            );
          })}

          {/* Tambah item */}
          <button
            type="button"
            onClick={addItem}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
            + Tambah Item
          </button>

          {/* Submit */}
          <div className="flex gap-3 justify-end mt-4">
           

            <button
              type="button"
              onClick={onCancel}
              className="bg-red-600 text-white px-4 py-2 rounded-lg">
              Batal
            </button>
             <button
              type="submit"
              className=" bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600  text-white px-4 py-2 rounded-lg">
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* ============================= SIDE NOTE ============================= */}
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 h-fit shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Catatan</h3>

        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <li>• Barang yang di ambil berdasar stok di beberapa gudang.</li>
          <li>
            • Jika barang di gudang A tidak mencukupi maka akan mengambil stok
            dari gudang lain
          </li>
          <li>• Jumlah tidak boleh melebihi stok total di semua gudang.</li>
          <li>• Klik tambah item jika ingin menambah barang lain.</li>
          <li>• Klik hapus untuk menghapus baris barang.</li>
        </ul>
      </div>
    </div>
  );
}
