"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { submitBarangMasuk } from "../../services/tambahStokService";
import { updatePOStatus } from "../../services/poService";
import { formatRupiah, parseRupiah } from "../../services/currencyService";

interface Barang {
  id: string;
  nama_barang: string;
  harga?: number;
  merk?: string;
  tipe?: string;
  satuan?: string;
  serial_number?: string;
  id_kategori?: string;
  supplier_id?: string;
  hasSerial?: boolean;
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

  search: string;
  showDropdown: boolean;

  kategoriId: string;
  kategoriSearch: string;
  showKategoriDropdown: boolean;

  supplierId: string;
  supplierSearch: string;
  showSupplierDropdown: boolean;

  harga: string;
  serialNumbers: string[];
  hasSerial: boolean;
}

export default function TambahStokForm() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [supplierList, setSupplierList] = useState<Supplier[]>([]);

  // header gudang (dipilih sekali untuk semua baris)
  const [selectedGudangId, setSelectedGudangId] = useState<string>("");
  const [selectedGudangSearch, setSelectedGudangSearch] = useState<string>("");
  const [showGudangDropdown, setShowGudangDropdown] = useState(false);

  // PO
  const [poList, setPoList] = useState<any[]>([]);
  const [poSearch, setPoSearch] = useState("");
  const [poDropdown, setPoDropdown] = useState(false);

  const initialRow = (): Row => ({
    barangId: "",
    nama: "",
    jumlah: "",
    merk: "",
    tipe: "",
    satuan: "",

    search: "",
    showDropdown: false,

    kategoriId: "",
    kategoriSearch: "",
    showKategoriDropdown: false,

    supplierId: "",
    supplierSearch: "",
    showSupplierDropdown: false,

    harga: "",
    serialNumbers: [],
    hasSerial: false,
  });

  const [rows, setRows] = useState<Row[]>([initialRow()]);

  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barangRes, kategoriRes, supplierRes, gudangRes, poRes] =
          await Promise.all([
            supabase
              .from("Barang")
              .select(
                "id,nama_barang,harga,merk,tipe,satuan,serial_number,id_kategori,supplier_id"
              )
              .order("nama_barang"),
            supabase
              .from("Kategori")
              .select("id,nama_kategori")
              .order("nama_kategori"),
            supabase
              .from("Supplier")
              .select("id,nama_supplier")
              .order("nama_supplier"),
            supabase
              .from("gudang")
              .select("id,nama_gudang")
              .order("nama_gudang"),
            supabase
              .from("purchase_order")
              .select("id,no_po,gudang_id")
              .order("no_po"),
          ]);

        setBarangList((barangRes.data as any) || []);
        setKategoriList((kategoriRes.data as any) || []);
        setSupplierList((supplierRes.data as any) || []);
        setGudangList((gudangRes.data as any) || []);
        setPoList((poRes.data as any) || []);
      } catch (err) {
        console.error("fetch master data error", err);
        toast.error("Gagal memuat data master");
      }
    };

    fetchData();
  }, []);

  const updateRow = <K extends keyof Row>(
    index: number,
    field: K,
    value: Row[K]
  ) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const addRow = () => setRows((prev) => [...prev, initialRow()]);

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // when user selects a PO: set header gudang and populate rows from PO details
  const handleSelectPO = async (poId: string, nomorPO: string) => {
    setPoSearch(nomorPO);
    setPoDropdown(false);

    try {
      const { data: poDetail, error: poErr } = await supabase
        .from("purchase_order")
        .select("id,gudang_id,keterangan")
        .eq("id", poId)
        .single();

      if (poErr || !poDetail) throw poErr || new Error("PO not found");

      const gudangIdFromPO = poDetail.gudang_id;
      const gudangPO = gudangList.find((g) => g.id === gudangIdFromPO);
      // set header gudang
      setSelectedGudangId(gudangIdFromPO || "");
      setSelectedGudangSearch(gudangPO?.nama_gudang || "");

      // fetch details
      const { data: details, error } = await supabase
        .from("detail_purchase_order")
        .select(
          `
          id_barang,
          jumlah,
          harga_satuan,
          Barang (
            id,
            nama_barang,
            merk,
            tipe,
            satuan,
            id_kategori,
            supplier_id,
            harga
          )
        `
        )
        .eq("purchase_order_id", poId);

      if (error) throw error;
      if (!details || details.length === 0) {
        toast.error("PO tidak memiliki detail barang");
        return;
      }

      const newRows: Row[] = details.map((d: any) => ({
        barangId: d.id_barang,
        nama: d.Barang?.nama_barang || "",
        search: d.Barang?.nama_barang || "",
        jumlah: d.jumlah?.toString() || "",
        merk: d.Barang?.merk || "",
        tipe: d.Barang?.tipe || "",
        satuan: d.Barang?.satuan || "",
        harga: d.harga_satuan
          ? d.harga_satuan.toString()
          : d.Barang?.harga
          ? d.Barang.harga.toString()
          : "",

        kategoriId: d.Barang?.id_kategori || "",
        kategoriSearch:
          kategoriList.find((k) => k.id === d.Barang?.id_kategori)
            ?.nama_kategori || "",
        showKategoriDropdown: false,

        supplierId: d.Barang?.supplier_id || "",
        supplierSearch:
          supplierList.find((s) => s.id === d.Barang?.supplier_id)
            ?.nama_supplier || "",
        showSupplierDropdown: false,

        showDropdown: false,
        hasSerial: !!d.Barang?.serial_number,
        serialNumbers: Array.from({ length: d.jumlah || 0 }, () => ""),
      }));

      setRows(newRows);
      toast.success(
        "Data PO berhasil dimuat (dan gudang header otomatis terisi)"
      );
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data PO / detail");
    }
  };

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keterangan.trim()) return toast.error("Keterangan harus diisi!");
    if (!selectedGudangId) return toast.error("Pilih gudang!");

    setLoading(true);

    try {
      await submitBarangMasuk(rows, selectedGudangId, keterangan, barangList);

      if (poSearch) {
        const po = poList.find((p) => p.no_po === poSearch);
        if (po) {
          await updatePOStatus(po.id, "selesai");
        }
      }

      toast.success("Stok berhasil ditambahkan!");
      navigate("/barang-masuk");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <form
        className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800"
        onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold dark:text-teal-400">
          Tambah Stok Barang (Multi)
        </h2>

        {/* PO */}
        <div className="relative">
          <label className="text-sm font-semibold dark:text-white/80">
            Cari Nomor PO
          </label>
          <input
            type="text"
            value={poSearch}
            onChange={(e) => {
              setPoSearch(e.target.value);
              setPoDropdown(true);
            }}
            placeholder="Cari PO..."
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />

          {poDropdown && (
            <ul className="absolute mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 w-full rounded shadow max-h-60 overflow-y-auto z-30">
              {poList
                .filter((p) =>
                  p.no_po?.toLowerCase().includes(poSearch.toLowerCase())
                )
                .map((p) => (
                  <li
                    key={p.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    onClick={() => handleSelectPO(p.id, p.no_po)}>
                    <div className="font-semibold">{p.no_po}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {p.keterangan || "Tanpa keterangan"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Gudang:{" "}
                      {gudangList.find((g) => g.id === p.gudang_id)
                        ?.nama_gudang || "-"}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Keterangan */}
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

        {/* GUDANG HEADER */}
        <div className="relative">
          <label className="text-sm font-semibold dark:text-white/80">
            Pilih Gudang
          </label>
          <input
            type="text"
            value={selectedGudangSearch}
            onChange={(e) => {
              setSelectedGudangSearch(e.target.value);
              setShowGudangDropdown(true);
            }}
            placeholder="Cari gudang..."
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />

          {showGudangDropdown && (
            <ul className="absolute mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 w-full rounded shadow max-h-60 overflow-y-auto z-30">
              {gudangList
                .filter((g) =>
                  g.nama_gudang
                    .toLowerCase()
                    .includes(selectedGudangSearch.toLowerCase())
                )
                .map((g) => (
                  <li
                    key={g.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                    onClick={() => {
                      setSelectedGudangId(g.id);
                      setSelectedGudangSearch(g.nama_gudang);
                      setShowGudangDropdown(false);
                    }}>
                    {g.nama_gudang}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* BARIS BARANG */}
        {rows.map((row, index) => {
          const filteredBarang = barangList.filter((b) =>
            b.nama_barang.toLowerCase().includes(row.search.toLowerCase())
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
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="absolute top-3 right-3 text-red-500 text-xl hover:text-red-600">
                  ✕
                </button>
              )}

              {/* Barang search */}
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
                    updateRow(index, "merk", "");
                    updateRow(index, "tipe", "");
                    updateRow(index, "satuan", "");
                    updateRow(index, "kategoriId", "");
                    updateRow(index, "kategoriSearch", "");
                    updateRow(index, "supplierId", "");
                    updateRow(index, "supplierSearch", "");
                    updateRow(index, "serialNumbers", []);
                    updateRow(index, "showDropdown", true);
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

                            // auto-fill
                            updateRow(index, "merk", b.merk || "");
                            updateRow(index, "tipe", b.tipe || "");
                            updateRow(index, "satuan", b.satuan || "");
                            updateRow(
                              index,
                              "harga",
                              b.harga ? b.harga.toString() : ""
                            );
                            // kategori & supplier auto-fill
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

              {/* Kategori/Supplier/Merk/Tipe/Satuan/Harga grid */}
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
                    value={row.merk || ""}
                    onChange={(e) => updateRow(index, "merk", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="merk "
                  />
                </div>

                {/* Tipe */}
                <div>
                  <label className="text-sm font-semibold dark:text-white/80">
                    Tipe
                  </label>
                  <input
                    type="text"
                    value={row.tipe || ""}
                    onChange={(e) => updateRow(index, "tipe", e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="tipe "
                  />
                </div>

                {/* Satuan */}
                <div>
                  <label className="text-sm font-semibold dark:text-white/80">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={row.satuan || ""}
                    onChange={(e) => updateRow(index, "satuan", e.target.value)}
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
                    type="text"
                    inputMode="numeric"
                    value={formatRupiah(row.harga)}
                    onChange={(e) =>
                      updateRow(
                        index,
                        "harga",
                        parseRupiah(e.target.value).toString()
                      )
                    }
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="1.000.000"
                  />
                </div>
              </div>

              {/* Jumlah */}
              <div>
                <label className="text-sm font-semibold dark:text-white/80">
                  Jumlah
                </label>
                <input
                  type="number"
                  value={row.jumlah}
                  onChange={(e) => {
                    const jumlahVal = e.target.value;
                    updateRow(index, "jumlah", jumlahVal);

                    if (row.hasSerial) {
                      const total = parseInt(jumlahVal) || 0;
                      updateRow(
                        index,
                        "serialNumbers",
                        Array.from({ length: total }, () => "")
                      );
                    }
                  }}
                  className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.hasSerial}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    updateRow(index, "hasSerial", checked);

                    if (checked) {
                      const total = parseInt(row.jumlah) || 0;
                      updateRow(
                        index,
                        "serialNumbers",
                        Array.from({ length: total }, () => "")
                      );
                    } else {
                      updateRow(index, "serialNumbers", []);
                    }
                  }}
                />
                <label className="text-sm dark:text-white/80">add SN</label>
              </div>
              {/* Grid SN */}
              {row.hasSerial && (
                <div className="mt-3">
                  <label className="text-sm font-semibold dark:text-white/80">
                    Serial Number
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {row.serialNumbers.map((sn, snIndex) => (
                      <input
                        key={snIndex}
                        type="text"
                        value={sn}
                        placeholder={`SN ${snIndex + 1}`}
                        onChange={(e) => {
                          const newList = [...row.serialNumbers];
                          newList[snIndex] = e.target.value;
                          updateRow(index, "serialNumbers", newList);
                        }}
                        className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addRow}
          className="px-4 py-1 text-xs bg-orange-600 text-white rounded-md shadow ">
          + add row
        </button>

        <div className="flex justify-end gap-2 pt-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate("/barang-masuk")}
            className="px-5 py-2  bg-red-600 text-white rounded-lg shadow disabled:opacity-50">
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2  bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600  text-white rounded-lg shadow disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>

      {/* PREVIEW */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-3 dark:text-teal-400">
          Preview
        </h3>

        <p className="mb-3 dark:text-white">
          <b>Keterangan:</b> {keterangan || "-"}
        </p>
        <p className="mb-3 dark:text-white">
          <p className="dark:text-white">
            <b>Gudang:</b> {selectedGudangSearch || "-"}
          </p>
        </p>

        {rows.map((r, i) => {
          const barang = barangList.find((b) => b.id === r.barangId);

          return (
            <div key={i} className="border-b dark:border-gray-700 pb-3 mb-3">
              <p className="dark:text-white">
                <b>Barang:</b> {r.nama || r.search || "-"}
              </p>
              <p className="dark:text-white">
                <b>Jumlah:</b> {r.jumlah || "-"}
              </p>

              <p className="dark:text-white">
                <b>Harga Per Item:</b>{" "}
                {r.harga
                  ? Number(r.harga).toLocaleString()
                  : barang
                  ? (barang.harga || 0).toLocaleString()
                  : "-"}
              </p>
              <p className="dark:text-white">
                <b>Total Harga:</b>{" "}
                {(
                  (r.harga ? Number(r.harga) : barang ? barang.harga || 0 : 0) *
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
