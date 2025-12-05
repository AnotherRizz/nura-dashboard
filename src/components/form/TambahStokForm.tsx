"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

interface Barang {
  supplier_id: any;
  id_kategori: string;
  id: string;
  nama_barang: string;
  harga: number;
  merk: string;
  tipe: string;
  satuan: string;
  serial_number: string;
}

interface Gudang {
  id: string;
  nama_gudang: string;
}

interface Kategori {
  id: string;
  nama_kategori: string;
}

interface Supplier {
  id: string;
  nama_supplier: string;
}

interface Row {
  barangId: string;
  nama: string;
  jumlah: string;
  merk: string;
  tipe: string;
  satuan: string;

  // Gudang
  gudangId: string;
  gudangSearch: string;
  gudangNama: string;
  showGudangDropdown: boolean;

  // Barang search
  search: string;
  showDropdown: boolean;

  // NEW
  kategoriId: string;
  kategoriSearch: string;
  showKategoriDropdown: boolean;

  supplierId: string;
  supplierSearch: string;
  showSupplierDropdown: boolean;

  harga: string; // optional
}

export default function TambahStokForm() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  const initialRow = (): Row => ({
    barangId: "",
    nama: "",
    jumlah: "",
    merk: "",
    tipe: "",
    satuan: "",

    gudangId: "",
    gudangNama: "",
    gudangSearch: "",
    showGudangDropdown: false,

    search: "",
    showDropdown: false,

    kategoriId: "",
    kategoriSearch: "",
    showKategoriDropdown: false,

    supplierId: "",
    supplierSearch: "",
    showSupplierDropdown: false,

    harga: "",
  });

  const [rows, setRows] = useState<Row[]>([initialRow()]);

  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: barang } = await supabase
        .from("Barang")
        .select(
          "id,nama_barang,harga, merk, tipe, satuan, serial_number, id_kategori, supplier_id"
        )
        .order("nama_barang");

      const { data: kategori } = await supabase
        .from("Kategori")
        .select("id,nama_kategori")
        .order("nama_kategori");

      const { data: supplier } = await supabase
        .from("Supplier")
        .select("id,nama_supplier")
        .order("nama_supplier");

      const { data: gudang } = await supabase
        .from("gudang")
        .select("id,nama_gudang")
        .order("nama_gudang");

      setBarangList((barang as any) || []);
      setKategoriList((kategori as any) || []);
      setSupplierList((supplier as any) || []);
      setGudangList((gudang as any) || []);
    };

    fetchData();
  }, []);

  const updateRow = <K extends keyof Row>(
    index: number,
    field: K,
    value: Row[K]
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, initialRow()]);
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // ======================= SUBMIT =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keterangan.trim()) return toast.error("Keterangan harus diisi!");

    // validasi: setiap baris harus punya barangId atau search (nama baru), jumlah, gudangId
    for (const r of rows) {
      if ((!r.barangId && !r.search) || !r.jumlah || !r.gudangId) {
        return toast.error(
          "Semua baris harus lengkap! Pilih barang atau ketik nama baru, isi jumlah & pilih gudang."
        );
      }
    }

    setLoading(true);

    try {
      // Insert BarangMasuk
      const { data: masuk, error: masukErr } = await supabase
        .from("BarangMasuk")
        .insert({
          tanggal_masuk: new Date().toISOString(),
          keterangan,
        })
        .select()
        .single();

      if (masukErr) throw masukErr;

      // Map to track newly created barang per row index
      const createdBarangByIndex: Record<number, string> = {};

      // First: create barang baru for rows that have a typed name but no barangId
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];

        // if user already selected existing barang, skip creation
        if (r.barangId) continue;

        // try find by exact name (case insensitive) in existing barangList
        const found = barangList.find(
          (b) =>
            b.nama_barang.trim().toLowerCase() === r.search.trim().toLowerCase()
        );

        if (found) {
          // map it so we can use its id later
          createdBarangByIndex[i] = found.id;
          continue;
        }

        // create new barang
        const { data: newBarang, error: barangErr } = await supabase
          .from("Barang")
          .insert({
            nama_barang: r.search,
            id_kategori: r.kategoriId || null,
            supplier_id: r.supplierId || null,
            harga: r.harga ? Number(r.harga) : 0,
            merk: r.merk || "",
            tipe: r.tipe || "",
            satuan: r.satuan || "",
            serial_number: "",
          })
          .select()
          .single();

        if (barangErr) throw barangErr;

        // add to map and also update local barangList so UI remains consistent for subsequent operations
        createdBarangByIndex[i] = (newBarang as any).id;
        setBarangList((prev) => [...prev, newBarang as any]);
      }

      // Prepare detail insert and update stok
      const detailInsert: {
        id_barang_masuk: string;
        id_barang: string;
        jumlah: number;
        harga_masuk: number;
      }[] = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];

        const barangIdToUse = r.barangId || createdBarangByIndex[i] || "";

        // find harga: priority -> row.harga -> barangList.harga -> 0
        const barangObj = barangList.find((b) => b.id === barangIdToUse);
        const hargaPerItem = r.harga
          ? Number(r.harga)
          : barangObj
          ? barangObj.harga
          : 0;

        const jumlahInt = parseInt(r.jumlah);

        detailInsert.push({
          id_barang_masuk: (masuk as any).id,
          id_barang: barangIdToUse,
          jumlah: jumlahInt,
          harga_masuk: hargaPerItem,
        });

        // update stok_gudang
        const { data: existing } = await supabase
          .from("stok_gudang")
          .select("*")
          .eq("barang_id", barangIdToUse)
          .eq("gudang_id", r.gudangId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("stok_gudang")
            .update({ stok: (existing as any).stok + jumlahInt })
            .eq("id", (existing as any).id);
        } else {
          await supabase.from("stok_gudang").insert({
            barang_id: barangIdToUse,
            gudang_id: r.gudangId,
            stok: jumlahInt,
          });
        }
      }

      // bulk insert detail
      if (detailInsert.length > 0) {
        const { error: dtErr } = await supabase
          .from("DetailBarangMasuk")
          .insert(detailInsert);
        if (dtErr) throw dtErr;
      }

      toast.success("Stok berhasil ditambahkan!");
      navigate("/barang-masuk");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================

  return (
    <div className="grid grid-cols-1  gap-6">
      <form
        className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800"
        onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold dark:text-teal-400">
          Tambah Stok Barang (Multi)
        </h2>

        {/* ================= KETERANGAN ================= */}
        <div>
          <label className="text-sm font-semibold dark:text-white/80">
            Keterangan
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Contoh: Restock gudang utama"
          />
        </div>

        {/* ================= BARIS BARANG LOOP ================= */}
        {rows.map((row, index) => {
          const filteredBarang = barangList.filter((b) =>
            b.nama_barang.toLowerCase().includes(row.search.toLowerCase())
          );

          const filteredGudang = gudangList.filter((g) =>
            g.nama_gudang.toLowerCase().includes(row.gudangSearch.toLowerCase())
          );

          const filteredKategori = kategoriList.filter((k) =>
            k.nama_kategori
              .toLowerCase()
              .includes(row.kategoriSearch.toLowerCase())
          );

          const filteredSupplier = supplierList.filter((s) =>
            s.nama_supplier
              .toLowerCase()
              .includes(row.supplierSearch.toLowerCase())
          );

          return (
            <div
              key={index}
              className="relative p-5 rounded-xl border bg-gray-50 dark:bg-gray-900 dark:border-gray-700 shadow-sm space-y-4">
              {/* btn remove */}
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="absolute top-3 right-3 text-red-500 text-xl hover:text-red-600">
                  ✕
                </button>
              )}

              {/* ============ FIELD: BARANG SEARCH ============ */}
              <div className="relative">
                <label className="text-sm font-semibold dark:text-white/80">
                  Barang
                </label>
                <input
                  type="text"
                  value={row.search}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateRow(index, "search", val);
                    updateRow(index, "nama", "");
                    updateRow(index, "barangId", "");

                    const hasMatch = barangList.some((b) =>
                      b.nama_barang.toLowerCase().includes(val.toLowerCase())
                    );
                    updateRow(index, "showDropdown", hasMatch);
                  }}
                  className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="Cari barang atau ketik nama baru..."
                />

                {row.showDropdown && (
                  <ul className="absolute mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 w-full max-h-48 overflow-y-auto rounded shadow z-20">
                    {filteredBarang.length > 0 ? (
                      filteredBarang.map((b) => (
                        <li
                          key={b.id}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                          onClick={() => {
                            updateRow(index, "barangId", b.id);
                            updateRow(index, "nama", b.nama_barang);
                            updateRow(index, "search", b.nama_barang);
                            updateRow(index, "showDropdown", false);

                            // === AUTO FILL FIELD LAIN ===
                            updateRow(index, "merk", b.merk || "");
                            updateRow(index, "tipe", b.tipe || "");
                            updateRow(index, "satuan", b.satuan || "");
                            updateRow(
                              index,
                              "harga",
                              b.harga?.toString() || ""
                            );

                            // Jika barang punya kategori / supplier
                            if (b.id_kategori) {
                              const kat = kategoriList.find(
                                (k) => k.id === b.id_kategori
                              );
                              if (kat) {
                                updateRow(index, "kategoriId", kat.id);
                                updateRow(
                                  index,
                                  "kategoriSearch",
                                  kat.nama_kategori
                                );
                              }
                            }

                            if (b.supplier_id) {
                              const sup = supplierList.find(
                                (s) => s.id === b.supplier_id
                              );
                              if (sup) {
                                updateRow(index, "supplierId", sup.id);
                                updateRow(
                                  index,
                                  "supplierSearch",
                                  sup.nama_supplier
                                );
                              }
                            }
                          }}>
                          {b.nama_barang}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-500">
                        Tidak ditemukan — akan dibuat otomatis
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* ============ FIELD: KATEGORI - SUPPLIER - MERK - TIPE - SATUAN - HARGA ============ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Kategori */}
                <div className="relative">
                  <label className="text-sm font-semibold dark:text-white/80">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={row.kategoriSearch}
                    onChange={(e) => {
                      updateRow(index, "kategoriSearch", e.target.value);
                      updateRow(index, "showKategoriDropdown", true);
                    }}
                    placeholder="Cari kategori..."
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  {row.showKategoriDropdown && (
                    <ul className="absolute mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 w-full max-h-48 overflow-y-auto rounded shadow z-30">
                      {filteredKategori.length > 0 ? (
                        filteredKategori.map((k) => (
                          <li
                            key={k.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                            onClick={() => {
                              updateRow(index, "kategoriId", k.id);
                              updateRow(
                                index,
                                "kategoriSearch",
                                k.nama_kategori
                              );
                              updateRow(index, "showKategoriDropdown", false);
                            }}>
                            {k.nama_kategori}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-gray-500">
                          Tidak ditemukan
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Supplier */}
                <div className="relative">
                  <label className="text-sm font-semibold dark:text-white/80">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={row.supplierSearch}
                    onChange={(e) => {
                      updateRow(index, "supplierSearch", e.target.value);
                      updateRow(index, "showSupplierDropdown", true);
                    }}
                    placeholder="Cari supplier..."
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  {row.showSupplierDropdown && (
                    <ul className="absolute mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 w-full max-h-48 overflow-y-auto rounded shadow z-30">
                      {filteredSupplier.length > 0 ? (
                        filteredSupplier.map((s) => (
                          <li
                            key={s.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                            onClick={() => {
                              updateRow(index, "supplierId", s.id);
                              updateRow(
                                index,
                                "supplierSearch",
                                s.nama_supplier
                              );
                              updateRow(index, "showSupplierDropdown", false);
                            }}>
                            {s.nama_supplier}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-gray-500">
                          Tidak ditemukan
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Merk */}
                <div>
                  <label className="text-sm font-semibold dark:text-white/80">
                    Merk
                  </label>
                  <input
                    type="text"
                    value={(row as any).merk || ""}
                    onChange={(e) =>
                      updateRow(index, "merk" as any, e.target.value)
                    }
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Samsung / LG / Asus"
                  />
                </div>

                {/* Tipe */}
                <div>
                  <label className="text-sm font-semibold dark:text-white/80">
                    Tipe
                  </label>
                  <input
                    type="text"
                    value={(row as any).tipe || ""}
                    onChange={(e) =>
                      updateRow(index, "tipe" as any, e.target.value)
                    }
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="A23 / Pro Max"
                  />
                </div>

                {/* Satuan */}
                <div>
                  <label className="text-sm font-semibold dark:text-white/80">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={(row as any).satuan || ""}
                    onChange={(e) =>
                      updateRow(index, "satuan" as any, e.target.value)
                    }
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="pcs / unit / box"
                  />
                </div>

                {/* Harga */}
                <div>
                  <label className="text-sm font-semibold dark:text-white/80">
                    Harga / Item
                  </label>
                  <input
                    type="number"
                    value={row.harga}
                    onChange={(e) => updateRow(index, "harga", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="15000"
                  />
                </div>
              </div>

              {/* ============ FIELD: JUMLAH ============ */}
              <div>
                <label className="text-sm font-semibold dark:text-white/80">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={row.jumlah}
                  onChange={(e) => updateRow(index, "jumlah", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* ============ FIELD: GUDANG ============ */}
              <div className="relative">
                <label className="text-sm font-semibold dark:text-white/80">
                  Gudang
                </label>
                <input
                  type="text"
                  value={row.gudangNama || row.gudangSearch}
                  onChange={(e) => {
                    updateRow(index, "gudangSearch", e.target.value);
                    updateRow(index, "showGudangDropdown", true);
                  }}
                  placeholder="Cari gudang..."
                  className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />

                {row.showGudangDropdown && (
                  <ul className="absolute mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 w-full max-h-48 overflow-y-auto rounded shadow z-20">
                    {filteredGudang.length > 0 ? (
                      filteredGudang.map((g) => (
                        <li
                          key={g.id}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                          onClick={() => {
                            updateRow(index, "gudangId", g.id);
                            updateRow(index, "gudangNama", g.nama_gudang);
                            updateRow(index, "gudangSearch", g.nama_gudang);
                            updateRow(index, "showGudangDropdown", false);
                          }}>
                          {g.nama_gudang}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-500">
                        Gudang tidak ditemukan
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          );
        })}

        {/* ============ BUTTON: ADD ROW ============ */}
        <button
          type="button"
          onClick={addRow}
          className="px-4 py-2 bg-teal-500 text-white rounded-md shadow hover:bg-teal-600">
          + Tambah Baris
        </button>

        {/* ============ SUBMIT ============ */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Semua"}
          </button>
        </div>
      </form>

      {/* PREVIEW */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-3 dark:text-teal-400">
          Preview
        </h3>

        <p className="mb-3 dark:text-white">
          <b className="">Keterangan:</b> {keterangan || "-"}
        </p>

        {rows.map((r, i) => {
          const barang = barangList.find((b) => b.id === r.barangId);

          return (
            <div key={i} className="border-b dark:border-gray-700 pb-3 mb-3">
              <p className="dark:text-white">
                <b className="">Barang:</b> {r.nama || r.search || "-"}
              </p>
              <p className="dark:text-white">
                <b className="">Jumlah:</b> {r.jumlah || "-"}
              </p>
              <p className="dark:text-white">
                <b className="">Gudang:</b> {r.gudangNama || "-"}
              </p>
              <p className="dark:text-white">
                <b className="">Harga Per Item:</b>{" "}
                {r.harga
                  ? Number(r.harga).toLocaleString()
                  : barang
                  ? barang.harga.toLocaleString()
                  : "-"}
              </p>
              <p className="dark:text-white">
                <b className="">Total Harga:</b>{" "}
                {(
                  (r.harga ? Number(r.harga) : barang ? barang.harga : 0) *
                  (r.jumlah ? parseInt(r.jumlah) : 0)
                ).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
