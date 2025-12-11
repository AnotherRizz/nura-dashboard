"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { supabase } from "../../services/supabaseClient";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

interface Detail {
  id: string;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  barang: {
    nama_barang: string;
    satuan: string;
  };
}

export default function PurchaseOrderShow() {
  const { id } = useParams();

  const [data, setData] = useState<any>(null);
  const [details, setDetails] = useState<Detail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // GET PO HEADER
    const { data: po } = await supabase
      .from("purchase_order")
      .select(
        `
          *,
          supplier:supplier_id (nama_supplier, telp_pic),
          gudang:gudang_id (nama_gudang,lokasi)
        `
      )
      .eq("id", id)
      .single();

    // GET DETAIL + RELASI BARANG
    const { data: dtl } = await supabase
      .from("detail_purchase_order")
      .select(
        `
        id,
        jumlah,
        harga_satuan,
        subtotal,
        barang:id_barang (nama_barang, satuan)
      `
      )
      .eq("purchase_order_id", id);

    setData(po || null);
    setDetails((dtl as unknown as Detail[]) || []);
    setLoading(false);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Data PO tidak ditemukan.</div>;

  const subtotal = details.reduce((sum, d) => sum + d.subtotal, 0);
  const ppn = Math.round(subtotal * 0.11);
  const total = subtotal + ppn;
  const dp = Math.round(total * 0.1);
  const sisa = total - dp;

  return (
    <div className="p-1 max-w-4xl mx-auto ">
      <PageBreadcrumb pageTitle="Purchase Order Detail" />

      <section className="border border-gray-500 rounded shadow bg-white p-10">
        <div className="flex flex-col gap-5 text-sm mb-6">
          <div>
            Tangerang Selatan,{" "}
            {new Date(data.tanggal).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            <br />
            <b> No: <span className="underline">{data.no_po}</span></b>
          
          </div>

          <div className="">
            Kepada Yth,
            <b>
            <br />
            {data.supplier.nama_supplier}
            <br />
            Up. {data.supplier.telp_pic || "-"}</b>
          </div>
          <div className="">
            <b>Dengan hormat,</b>
            <br />
            Sehubungan dengan Pelaksanaan Pekerjaan PT. Linea Global Teknologi,
            <br />
            dengan ini kami sampaikan Purchase Order material dengan perincian
            sebagai berikut :
          </div>
        </div>

        {/* TABEL DETAIL */}
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1 w-10">No</th>
              <th className="border px-2 py-1">Designator</th>
              <th className="border px-2 py-1 w-20">Satuan</th>
              <th className="border px-2 py-1 w-20">Volume</th>
              <th className="border px-2 py-1 w-28">Harga Satuan</th>
              <th className="border px-2 py-1 w-32">Jumlah Harga</th>
              <th className="border px-2 py-1 w-40">Keterangan</th>
            </tr>
          </thead>

          <tbody>
            {details.map((d, i) => (
              <tr key={d.id}>
                <td className="border px-2 py-1 text-center">{i + 1}</td>
                <td className="border px-2 py-1">{d.barang.nama_barang}</td>
                <td className="border px-2 py-1 text-center">
                  {d.barang.satuan}
                </td>
                <td className="border px-2 py-1 text-right">
                  {d.jumlah.toLocaleString("id-ID")}
                </td>
                <td className="border px-2 py-1 text-right">
                  Rp {d.harga_satuan.toLocaleString("id-ID")}
                </td>
                <td className="border px-2 py-1 text-right">
                  Rp {d.subtotal.toLocaleString("id-ID")}
                </td>
                {/* KETERANGAN HANYA TAMPIL DI BARIS PERTAMA */}
                {i === 0 ? (
                  <td
                    className="border px-2 py-1 text-left align-top"
                    rowSpan={details.length}>
                    {data.keterangan}
                  </td>
                ) : null}
              </tr>
            ))}

            {/* RINGKASAN */}
            <tr>
              <td
                colSpan={5}
                className="border px-2 py-1 text-right font-semibold">
                Jumlah
              </td>
              <td className="border px-2 py-1 text-right">
                Rp {subtotal.toLocaleString("id-ID")}
              </td>
              <td className="border"></td>
            </tr>

            <tr>
              <td
                colSpan={5}
                className="border px-2 py-1 text-right font-semibold">
                PPN 11%
              </td>
              <td className="border px-2 py-1 text-right">
                Rp {ppn.toLocaleString("id-ID")}
              </td>
              <td className="border"></td>
            </tr>

            <tr className="bg-gray-100 font-bold">
              <td colSpan={5} className="border px-2 py-1 text-right">
                TOTAL
              </td>
              <td className="border px-2 py-1 text-right">
                Rp {total.toLocaleString("id-ID")}
              </td>
              <td className="border"></td>
            </tr>
          </tbody>
        </table>

        {/* DP / SISA */}
        <div className="flex justify-end mt-3">
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="px-2 py-1">DP 10%</td>
                <td className="px-2 py-1 text-right">
                  Rp {dp.toLocaleString("id-ID")}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1">Sisa Pembayaran</td>
                <td className="px-2 py-1 text-right font-semibold">
                  Rp {sisa.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* INFORMASI LAIN */}
        <div className="-mt-12 text-sm">
          <b>Syarat dan Ketentuan:</b>
          <br />- DP 10%
          <br />- Sisa Pembayaran 60 Hari Cover Giro
        </div>
        <div className="mt-6 text-sm">
          <b>Contact Person:</b>
          <br />- Heri: 0812-8737-6372
          <br />- Iqbal: 0895-2009-7832
          <br />- Gita: 0881-0818-80699
        </div>
        <div className="mt-6 text-sm">
          <b>Pengiriman Material:</b>
          <br />- {data.gudang?.nama_gudang || "-"}({data.gudang?.lokasi || "-"}
          )
        </div>

        <div className="text-sm mt-8">
          Demikian Purchase Order ini Kami sampaikan, atas perhatian dan kerja
          samanya diucapkan terima.
        </div>
        <div className="text-sm mt-8">
          Hormat kami,
          <br />
          <b>PT. LINEA GLOBAL TEKNOLOGI</b>
        </div>
      </section>
    </div>
  );
}
