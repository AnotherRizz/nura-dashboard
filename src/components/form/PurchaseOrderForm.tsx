"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css";

interface Supplier {
  id: string;
  nama_supplier: string;
}
interface Gudang {
  id: string;
  nama_gudang: string;
}

interface Barang {
  id: string;
  nama_barang: string;
  harga: number;
  satuan?: string;
  merk?: string;
  tipe?: string;
  id_kategori?: string;
  supplier_id?: string;
}

type DetailItem = {
  barang_id: string;
  qty: number | "";
  harga: number | "";
  total: number;
};

export default function PurchaseOrderForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [supplierList, setSupplierList] = useState<Supplier[]>([]);
  const [barangList, setBarangList] = useState<Barang[]>([]);

  const supplierRef = useRef<HTMLDivElement>(null);
  const barangRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [gudangList, setGudangList] = useState<Gudang[]>([]);
  const [gudangSearch, setGudangSearch] = useState("");
  const [gudangDropdown, setGudangDropdown] = useState(false);
  const [gudangId, setGudangId] = useState("");
  const gudangRef = useRef<HTMLDivElement>(null);

  // header states
  const [tanggal, setTanggal] = useState(""); // format: YYYY-MM-DD
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [noPo, setNoPo] = useState("");

  // details
  const [details, setDetails] = useState<DetailItem[]>([
    { barang_id: "", qty: "", harga: "", total: 0 },
  ]);

  // per-row search & dropdown open index
  const [barangSearchArr, setBarangSearchArr] = useState<string[]>([""]);
  const [barangDropdownOpen, setBarangDropdownOpen] = useState<number | null>(
    null
  );

  const [loading, setLoading] = useState(false);

  // -----------------------
  // Load master data
  // -----------------------
  useEffect(() => {
    (async () => {
      const { data: supplier } = await supabase.from("Supplier").select("*");
      const { data: barang } = await supabase.from("Barang").select("*");
      const { data: gudang } = await supabase.from("gudang").select("*");
      setGudangList((gudang as Gudang[]) || []);

      setSupplierList((supplier as Supplier[]) || []);
      setBarangList((barang as Barang[]) || []);
    })();
  }, []);

  // keep barangSearchArr length in sync with details
  useEffect(() => {
    setBarangSearchArr((prev) => {
      const next = [...prev];
      while (next.length < details.length) next.push("");
      while (next.length > details.length) next.pop();
      return next;
    });
  }, [details.length]);

  // -----------------------
  // Load edit data
  // -----------------------
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setLoading(true);

      const { data: po, error: poErr } = await supabase
        .from("purchase_order")
        .select("*")
        .eq("id", id)
        .single();

      if (poErr || !po) {
        toast.error("PO tidak ditemukan");
        setLoading(false);
        return navigate("/purchase-order");
      }

      setKeterangan(po.keterangan || "");
      setSupplierId(po.supplier_id || "");
      setTanggal(po.tanggal ? po.tanggal.substring(0, 10) : "");

      setGudangId(po.gudang_id || "");
      const gd = gudangList.find((g) => g.id === po.gudang_id);
      if (gd) setGudangSearch(gd.nama_gudang);

      // set supplierSearch text if supplier list already loaded
      const sup = supplierList.find((s) => s.id === po.supplier_id);
      if (sup) setSupplierSearch(sup.nama_supplier);
      // if supplierList not loaded yet, the supplierSearch will be set after supplierList loads
      // load details
      const { data: det } = await supabase
        .from("detail_purchase_order")
        .select("*")
        .eq("purchase_order_id", id);

      if (det) {
        const mapped: DetailItem[] = (det as any).map((d: any) => ({
          barang_id: d.id_barang,
          qty: d.jumlah,
          harga: d.harga_satuan,
          total: Number(d.jumlah) * Number(d.harga_satuan),
        }));
        setDetails(mapped);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, supplierList]);

  // when supplierList loads after edit effect, set supplierSearch if needed
  useEffect(() => {
    if (!supplierId) return;
    const sup = supplierList.find((s) => s.id === supplierId);
    if (sup) setSupplierSearch(sup.nama_supplier);
  }, [supplierList, supplierId]);

  // -----------------------
  // Detail helpers
  // -----------------------
  const updateDetail = <K extends keyof DetailItem>(
    index: number,
    key: K,
    value: DetailItem[K]
  ) => {
    setDetails((prev) => {
      const updated = [...prev];
      // @ts-ignore
      updated[index][key] = value;

      const qty = Number(updated[index].qty) || 0;
      const harga = Number(updated[index].harga) || 0;
      updated[index].total = qty * harga;

      return updated;
    });
  };

  const addRow = () => {
    setDetails((p) => [...p, { barang_id: "", qty: "", harga: "", total: 0 }]);
    setBarangSearchArr((p) => [...p, ""]);
  };

  const removeRow = (i: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, idx) => idx !== i));
      setBarangSearchArr((prev) => prev.filter((_, idx) => idx !== i));
      if (barangDropdownOpen === i) setBarangDropdownOpen(null);
    }
  };

  // -----------------------
  // Submit
  // -----------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!supplierId) return toast.error("Supplier wajib dipilih!");
    if (!noPo) return toast.error("Nomor PO wajib diisi!");
    if (!tanggal) return toast.error("Tanggal wajib diisi!");
    if (details.some((d) => !d.barang_id))
      return toast.error("Semua barang wajib dipilih!");
    if (!gudangId) return toast.error("Gudang tujuan wajib dipilih!");

    setLoading(true);

    try {
      let poId = id;

      if (!isEdit) {
        const { data: po, error } = await supabase
          .from("purchase_order")
          .insert({
            no_po: noPo,
            tanggal,
            supplier_id: supplierId,
            gudang_id: gudangId,
            keterangan,
            status: "created",
          })

          .select()
          .single();

        if (error) throw error;
        // @ts-ignore
        poId = po.id;
      } else {
        const { error: updErr } = await supabase
          .from("purchase_order")
          .update({
            no_po: noPo,
            tanggal,
            supplier_id: supplierId,
            gudang_id: gudangId,
            keterangan,
          })

          .eq("id", id);

        if (updErr) throw updErr;

        // delete old details
        const { error: delErr } = await supabase
          .from("detail_purchase_order")
          .delete()
          .eq("purchase_order_id", id);
        if (delErr) throw delErr;
      }

      // insert details with DB column names
      const detailInsert = details.map((d) => ({
        purchase_order_id: poId,
        id_barang: d.barang_id,
        jumlah: Number(d.qty),
        harga_satuan: Number(d.harga),
      }));

      const { error: detErr } = await supabase
        .from("detail_purchase_order")
        .insert(detailInsert);

      if (detErr) throw detErr;

      toast.success(isEdit ? "PO berhasil diupdate!" : "PO berhasil dibuat!");
      navigate("/purchase-order");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan PO");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!gudangId) return;
    const gd = gudangList.find((g) => g.id === gudangId);
    if (gd) setGudangSearch(gd.nama_gudang);
  }, [gudangList, gudangId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // --- Supplier dropdown ---
      if (
        supplierRef.current &&
        !supplierRef.current.contains(e.target as Node)
      ) {
        setShowSupplierDropdown(false);
      }

      // --- Barang dropdown per baris ---
      barangRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(e.target as Node)) {
          if (barangDropdownOpen === index) {
            setBarangDropdownOpen(null);
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [barangDropdownOpen]);


  // -----------------------
  // Render
  // -----------------------
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-lg font-bold dark:text-blue-400">
          {isEdit ? "Form Edit Purchase Order" : "Form Purchase Order"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TANGGAL */}
          <div>
            <label className="font-semibold text-sm dark:text-white/80">
              Tanggal Order
            </label>

            <Flatpickr
              value={tanggal || undefined}
              onChange={(date: any) => {
                if (date && date[0]) {
                  const iso = new Date(date[0]).toISOString().substring(0, 10);
                  setTanggal(iso);
                } else {
                  setTanggal("");
                }
              }}
              options={{
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d F Y",
                allowInput: true,
              }}
              className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          {/* NOMOR PO */}
          <div>
            <label className="font-semibold text-sm dark:text-white/80">
              Nomor Surat Purchase Order (PO)
            </label>
            <input
              value={noPo}
              onChange={(e) => setNoPo(e.target.value)}
              placeholder="ex : 045/LINEA/PO/XI/2025"
              className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* SUPPLIER */}
          <div ref={supplierRef} className="relative">
            <label className="font-semibold text-sm dark:text-white/80">
              Supplier Tujuan
            </label>

            <input
              value={supplierSearch}
              onChange={(e) => {
                setSupplierSearch(e.target.value);
                setShowSupplierDropdown(true);
              }}
              onFocus={() => setShowSupplierDropdown(true)}
              placeholder="Cari supplier tujuan order..."
              className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />

            {showSupplierDropdown && (
              <ul className="absolute bg-white dark:bg-gray-800 border dark:border-gray-600 rounded w-full max-h-48 overflow-y-auto z-20">
                {supplierList
                  .filter((s) =>
                    s.nama_supplier
                      .toLowerCase()
                      .includes(supplierSearch.toLowerCase())
                  )
                  .map((s) => (
                    <li
                      key={s.id}
                      className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                      onClick={() => {
                        setSupplierId(s.id);
                        setSupplierSearch(s.nama_supplier);
                        setShowSupplierDropdown(false);
                      }}>
                      {s.nama_supplier}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          {/* GUDANG TUJUAN */}
          <div ref={gudangRef} className="relative">
            <label className="font-semibold text-sm dark:text-white/80">
              Gudang Tujuan
            </label>

            <input
              value={gudangSearch}
              onChange={(e) => {
                setGudangSearch(e.target.value);
                setGudangDropdown(true);
              }}
              onFocus={() => setGudangDropdown(true)}
              placeholder="Cari gudang tujuan..."
              className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />

            {gudangDropdown && (
              <ul className="absolute bg-white dark:bg-gray-800 border dark:border-gray-600 rounded w-full max-h-48 overflow-y-auto z-20">
                {gudangList
                  .filter((g) =>
                    g.nama_gudang
                      .toLowerCase()
                      .includes(gudangSearch.toLowerCase())
                  )
                  .map((g) => (
                    <li
                      key={g.id}
                      className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700  dark:text-white cursor-pointer"
                      onClick={() => {
                        setGudangId(g.id);
                        setGudangSearch(g.nama_gudang);
                        setGudangDropdown(false);
                      }}>
                      {g.nama_gudang}
                    </li>
                  ))}

                {gudangList.filter((g) =>
                  g.nama_gudang
                    .toLowerCase()
                    .includes(gudangSearch.toLowerCase())
                ).length === 0 && (
                  <li className="px-4 py-2 text-gray-400">
                    Gudang tidak ditemukan
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* KETERANGAN */}
          <div>
            <label className="font-semibold text-sm dark:text-white/80">
              Keterangan
            </label>
            <input
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="ex : project cctv gedung A"
              className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* DETAIL BARANG */}
        {details.map((d, index) => {
          // filter berdasarkan search khusus baris ini
          const searchText = barangSearchArr[index] || "";
          const filterBarang = barangList.filter((b) =>
            b.nama_barang.toLowerCase().includes(searchText.toLowerCase())
          );

          const barang = barangList.find((b) => b.id === d.barang_id);

          return (
            <div
              key={index}
              className="border dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 space-y-4 relative">
              {details.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="absolute right-4 top-4 text-red-500 text-lg">
                  ✕
                </button>
              )}

              {/* Pilih barang (searchable) */}
              <div
                className="relative"
                key={index}
                ref={(el) => {
                  barangRefs.current[index] = el;
                }}>
                <label className="font-semibold text-sm dark:text-white/80">
                  Barang
                </label>

                <input
                  value={
                    barang ? barang.nama_barang : barangSearchArr[index] || ""
                  }
                  onChange={(e) => {
                    // clear barang selection if user types
                    updateDetail(index, "barang_id", "");
                    setBarangSearchArr((prev) => {
                      const next = [...prev];
                      next[index] = e.target.value;
                      return next;
                    });
                    setBarangDropdownOpen(index);
                  }}
                  onFocus={() => setBarangDropdownOpen(index)}
                  placeholder="Cari barang..."
                  className="mt-1 w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />

                {/* Dropdown results */}
                {barangDropdownOpen === index && (
                  <ul className="absolute bg-white dark:bg-gray-800 border dark:border-gray-600 rounded w-full max-h-48 overflow-y-auto z-30">
                    {filterBarang.map((b) => (
                      <li
                        key={b.id}
                        className="px-4 py-2 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          updateDetail(index, "barang_id", b.id);
                          updateDetail(index, "harga", b.harga || 0);
                          setBarangSearchArr((prev) => {
                            const next = [...prev];
                            next[index] = "";
                            return next;
                          });
                          setBarangDropdownOpen(null);
                        }}>
                        <div className="flex dark:text-white justify-between">
                          <span>{b.nama_barang}</span>
                          <small className="text-gray-500">
                            {b.merk || ""}
                          </small>
                        </div>
                      </li>
                    ))}

                    {filterBarang.length === 0 && (
                      <li className="px-4 py-2 text-gray-400">
                        Barang tidak ditemukan
                      </li>
                    )}
                  </ul>
                )}

                {barang && (
                  <p className="text-xs text-gray-500 mt-1">
                    Satuan: {barang.satuan || "-"} | Merk: {barang.merk || "-"}
                  </p>
                )}
              </div>

              {/* QTY & HARGA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm dark:text-white/80">Volume</label>
                  <input
                    type="number"
                    value={d.qty}
                    onChange={(e) =>
                      updateDetail(
                        index,
                        "qty",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="Volume"
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-sm dark:text-white/80">Harga</label>
                  <input
                    type="number"
                    value={d.harga}
                    onChange={(e) =>
                      updateDetail(
                        index,
                        "harga",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="Harga"
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-sm dark:text-white/80">Total</label>
                  <input
                    disabled
                    value={d.total.toLocaleString("id-ID")}
                    className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRow}
            className="px-4 py-2 bg-teal-600 text-white rounded shadow">
            + Tambah Barang
          </button>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded shadow disabled:opacity-50">
            {loading ? "Menyimpan..." : isEdit ? "Update PO" : "Simpan PO"}
          </button>
        </div>
      </form>
    </div>
  );
}
