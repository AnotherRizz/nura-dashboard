"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

interface PurchaseOrder {
  id: string;
  no_po: string;
}

interface POItem {
  id: string;
  id_barang: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  barang: {
    nama_barang: string;
    satuan: string;
  }[];
}

interface StokItem {
  id_barang: string;
  nama_barang: string;
  satuan: string;
  qty_po: number;
  qty_masuk: number | "";
  harga_masuk: number;
}

export default function StokInForm() {
  const navigate = useNavigate();

  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [poList, setPoList] = useState<PurchaseOrder[]>([]);
  const [poSearch, setPoSearch] = useState("");
  const [poId, setPoId] = useState("");
  const [showPoDropdown, setShowPoDropdown] = useState(false);
  const poRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<StokItem[]>([]);

  // ====== LOAD PO ======
  useEffect(() => {
    supabase
      .from("purchase_order")
      .select("id, no_po")
      .order("created_at", { ascending: false })
      .then(({ data }) => setPoList(data || []));
  }, []);

  // ====== LOAD DETAIL PO ======
  async function loadPoDetail(poId: string) {
    const { data, error } = await supabase
      .from("detail_purchase_order")
      .select(
        `
        id,
        id_barang,
        jumlah,
        harga_satuan,
        subtotal,
        barang:id_barang (nama_barang, satuan)
      `
      )
      .eq("purchase_order_id", poId);

    if (error) {
      toast.error("Gagal memuat detail PO");
      return;
    }

    const mapped: StokItem[] =
      data?.map((d: POItem) => ({
        id_barang: d.id_barang,
        nama_barang: d.barang?.[0]?.nama_barang || "-",
        satuan: d.barang?.[0]?.satuan || "-",
        qty_po: d.jumlah,
        qty_masuk: "",
        harga_masuk: d.harga_satuan,
      })) || [];

    setItems(mapped);
  }

  // ====== UPDATE QTY MASUK ======
  const updateQtyMasuk = (index: number, value: number | "") => {
    setItems((prev) => {
      const next = [...prev];
      next[index].qty_masuk = value;
      return next;
    });
  };

  // ====== SUBMIT ======
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!poId) return toast.error("Pilih PO terlebih dahulu!");
    if (!tanggal) return toast.error("Tanggal wajib diisi!");

    if (items.some((i) => !i.qty_masuk || Number(i.qty_masuk) <= 0)) {
      return toast.error("Qty masuk wajib diisi!");
    }

    try {
      // ====== INSERT BARANG MASUK ======
      const { data: bm, error: bmErr } = await supabase
        .from("barang_masuk")
        .insert({
          tanggal_masuk: tanggal,
          keterangan,
        })
        .select()
        .single();

      if (bmErr) throw bmErr;

      // ====== INSERT DETAIL BARANG MASUK ======
      const detailRows = items.map((i) => ({
        id_barang_masuk: bm.id,
        id_barang: i.id_barang,
        jumlah: Number(i.qty_masuk),
        harga_masuk: i.harga_masuk,
      }));

      const { error: detErr } = await supabase
        .from("detail_barang_masuk")
        .insert(detailRows);

      if (detErr) throw detErr;

      // ====== UPDATE STOK GUDANG ======
      // Jika kamu punya pilihan gudang, ganti ini dengan gudang terpilih
      const gudangDefaultId = 1;

      for (const i of items) {
        const { data: stok } = await supabase
          .from("stok_gudang")
          .select("*")
          .eq("id_barang", i.id_barang)
          .eq("gudang_id", gudangDefaultId)
          .single();

        if (stok) {
          // Update stok
          await supabase
            .from("stok_gudang")
            .update({
              stok: Number(stok.stok) + Number(i.qty_masuk),
            })
            .eq("id", stok.id);
        } else {
          // Jika stok belum ada → insert baru
          await supabase.from("stok_gudang").insert({
            id_barang: i.id_barang,
            gudang_id: gudangDefaultId,
            stok: Number(i.qty_masuk),
          });
        }
      }

      toast.success("Stok masuk berhasil disimpan!");
      navigate("/stok-masuk");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan stok masuk");
    }
  }

  // ====== CLICK OUTSIDE PO DROPDOWN ======
  useEffect(() => {
    const handler = (e: any) => {
      if (poRef.current && !poRef.current.contains(e.target)) {
        setShowPoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl">
      <h2 className="text-lg font-bold mb-4">Form Stok Masuk</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEARCH PO */}
        <div ref={poRef} className="relative">
          <label className="text-sm font-semibold">Search No PO</label>
          <input
            value={poSearch}
            onChange={(e) => {
              setPoSearch(e.target.value);
              setShowPoDropdown(true);
            }}
            onFocus={() => setShowPoDropdown(true)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Cari No PO..."
          />

          {showPoDropdown && (
            <ul className="absolute z-30 bg-white border rounded w-full max-h-48 overflow-y-auto">
              {poList
                .filter((p) =>
                  p.no_po.toLowerCase().includes(poSearch.toLowerCase())
                )
                .map((p) => (
                  <li
                    key={p.id}
                    onClick={() => {
                      setPoId(p.id);
                      setPoSearch(p.no_po);
                      setShowPoDropdown(false);
                      loadPoDetail(p.id);
                    }}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {p.no_po}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* TANGGAL */}
        <div>
          <label className="text-sm font-semibold">Tanggal Masuk</label>
          <Flatpickr
            value={tanggal}
            onChange={(d) => setTanggal(d[0].toISOString().substring(0, 10))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* KETERANGAN */}
        <div>
          <label className="text-sm font-semibold">Keterangan</label>
          <input
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* TABEL BARANG */}
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2">No</th>
              <th className="border px-2">Barang</th>
              <th className="border px-2">Satuan</th>
              <th className="border px-2">Qty PO</th>
              <th className="border px-2">Qty Masuk</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td className="border px-2 text-center">{idx + 1}</td>
                <td className="border px-2">{i.nama_barang}</td>
                <td className="border px-2 text-center">{i.satuan}</td>
                <td className="border px-2 text-center">{i.qty_po}</td>
                <td className="border px-2">
                  <input
                    type="number"
                    value={i.qty_masuk}
                    onChange={(e) =>
                      updateQtyMasuk(
                        idx,
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded">
            Simpan Stok Masuk
          </button>
        </div>
      </form>
    </div>
  );
}
