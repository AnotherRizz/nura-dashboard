"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { supabase } from "../../services/supabaseClient";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PurchaseOrderPreview from "./purchaseOrderPreview";

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

interface DPResult {
  dpPercent: number;
}

export default function PurchaseOrderShow() {
  const printRef = useRef<HTMLDivElement>(null);

  const { id } = useParams();

  const [data, setData] = useState<any>(null);
  const [details, setDetails] = useState<Detail[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);

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
          supplier:supplier_id (nama_supplier, nama_pic),
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
  const termDP = getDPFromTerms(data.ketentuan);

  let dp = 0;
  let sisa = 0;

  if (termDP) {
    dp = Math.round((termDP.dpPercent / 100) * total);
    sisa = total - dp;
  } else {
    dp = Math.round(total * 0.1);
    sisa = total - dp;
  }

  function getDPFromTerms(terms?: string[]): DPResult | null {
    if (!Array.isArray(terms)) return null;

    const findLunas = terms.find((t) => t.toLowerCase().includes("lunas"));
    if (findLunas) {
      return { dpPercent: 100 };
    }

    for (const t of terms) {
      const match = t.match(/dp\s*([0-9]+)\s*%/i);
      if (match) {
        return { dpPercent: parseInt(match[1], 10) };
      }
    }

    return null;
  }
  const totalRows = details.length > 0 ? details.length : 1;

  return (
    <div className="p-1 max-w-4xl mx-auto ">
      <PageBreadcrumb pageTitle="Purchase Order Detail" />

      <section
        ref={printRef}
        id="po-print"
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          color: "#000",
          lineHeight: "1.35",
        }}
        className="bg-white shadow px-10 pt-20 pb-10 max-w-3xl">
        <div className="flex po-page flex-col gap-3 mt-20 text-sm mb-2">
          <div className="text-sm">
            Tangerang Selatan,{" "}
            {new Date(data.tanggal).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            <br />
            <b>
              {" "}
              No: <span className="underline">{data.no_po}</span>
            </b>
          </div>

          <div className="text-sm">
            Kepada Yth,
            <b>
              <br />
              {data.supplier.nama_supplier}
              <br />
              Up.Bpk/Ibu {data.supplier.nama_pic || "-"}
            </b>
          </div>
          <div className="text-xs">
            <b className="text-sm">Dengan hormat,</b>
            <br />
            Sehubungan dengan Pelaksanaan Pekerjaan PT. Linea Global Teknologi,
            <br />
            dengan ini kami sampaikan Purchase Order material dengan perincian
            sebagai berikut :
          </div>
        </div>

        {/* TABEL DETAIL */}
        <table className="po-table w-full border border-black border-collapse text-[12px] mt-4">
          <thead>
            <tr className="font-semibold text-center">
              <th className="border border-black w-[35px]">No</th>
              <th className="border border-black">Designator</th>
              <th className="border border-black w-[60px]">Satuan</th>
              <th className="border border-black w-[70px]">Volume</th>
              <th className="border border-black w-[110px]">
                Harga Satuan
                <br />
                Rp.
              </th>
              <th className="border border-black w-[120px]">
                Jumlah Harga
                <br />
                Rp.
              </th>
              <th className="border border-black w-[140px]">Keterangan</th>
            </tr>
          </thead>

          <tbody>
            {/* BARIS ITEM */}
            {details.map((d, i) => (
              <tr key={d.id}>
                <td className="border border-black text-center">{i + 1}</td>
                <td className="border border-black px-2">
                  {d.barang.nama_barang}
                </td>
                <td className="border border-black text-center">
                  {d.barang.satuan}
                </td>
                <td className="border border-black text-center">
                  {d.jumlah.toLocaleString("id-ID")}
                </td>
                <td className="border border-black text-right px-2">
                  {d.harga_satuan.toLocaleString("id-ID")}
                </td>
                <td className="border border-black text-right px-2">
                  {d.subtotal.toLocaleString("id-ID")}
                </td>

                {/* KETERANGAN (ROWSPAN SEKALI SAJA) */}
                {i === 0 && (
                  <td
                    rowSpan={totalRows}
                    className="border border-black align-top px-2">
                    {data.keterangan}
                  </td>
                )}
              </tr>
            ))}

            {/* JUMLAH */}
            <tr>
              <td
                colSpan={5}
                className="border border-black text-right px-2 font-semibold">
                Jumlah
              </td>
              <td className="border border-black text-right px-2 font-semibold">
                {subtotal.toLocaleString("id-ID")}
              </td>
            </tr>

            {/* PPN */}
            <tr>
              <td colSpan={5} className="border border-black text-right px-2">
                PPN 11%
              </td>
              <td className="border border-black text-right px-2">
                {ppn.toLocaleString("id-ID")}
              </td>
            </tr>

            {/* TOTAL */}
            <tr>
              <td
                colSpan={5}
                className="border border-black text-right px-2 font-semibold">
                Total
              </td>
              <td className="border border-black text-right px-2 font-semibold">
                {total.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        <div className=" grid grid-cols-5  ">
          {/* INFORMASI LAIN */}
          <div className=" text-xs col-span-3  ">
            <b>Syarat dan Ketentuan:</b>

            {Array.isArray(data.ketentuan) && data.ketentuan.length > 0 ? (
              data.ketentuan.map((item: string, idx: number) => (
                <div key={idx}>- {item}</div>
              ))
            ) : (
              <div>- Tidak ada ketentuan</div>
            )}
          </div>
          {/* DP / SISA */}
          <div className="mt-1 col-span-2 ">
            <table className="text-sm ">
              <tbody>
                {/* JENIS PEMBAYARAN */}
                <tr>
                  <td className="px-2 py-1 text-[12px]">
                    Pembayaran{" "}
                    {termDP?.dpPercent === 100
                      ? "Dibayar Lunas"
                      : termDP
                      ? `DP ${termDP.dpPercent}%`
                      : "DP 10%"}
                  </td>
                  <td className="px-2 py-1 text-[12px] text-right">
                    Rp {dp.toLocaleString("id-ID")}
                  </td>
                </tr>

                {/* SISA */}
                <tr className="font-semibold -mt-10">
                  <td className="px-2 py-1 text-[12px] -mt-7">
                    Sisa Pembayaran
                  </td>
                  <td className="px-2 py-1 text-[12px] text-right">
                    Rp {sisa.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-xs">
          <b>Contact Person:</b>
          <br />- Heri: 0812-8737-6372
          <br />- Iqbal: 0895-2009-7832
          <br />- Gita: 0881-0818-80699
        </div>
        <div className="mt-3 text-xs">
          <b>Pengiriman Material:</b>
          <br />- {data.gudang?.nama_gudang || "-"}({data.gudang?.lokasi || "-"}
          )
        </div>

        <div className="text-xs mt-3">
          Demikian Purchase Order ini Kami sampaikan, atas perhatian dan kerja
          samanya diucapkan terima.
        </div>
        <div className="text-sm mt-3">
          Hormat kami,
          <br />
          <b>PT. LINEA GLOBAL TEKNOLOGI</b>
        </div>
        <div className="text-xs mt-10">
          <br />
          <b>Bintang Aryo Dharmawan</b>
          <br />
          Direktur
        </div>
        <div className="text-xs mt-3 mb-20">
          Catatan:
          <br />
          Apabila barang yang di Order/PO tidak sesuai dengn Speck, maka akan
          dikembalikan dan biaya-biaya yang <br />
          timbul akan dibebankan kepada Pabrik
        </div>
      </section>
      <button
        onClick={() => setPreview(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded">
        Preview PDF
      </button>

      {preview && (
        <PurchaseOrderPreview
          onClose={() => setPreview(false)}
          data={data}
          details={details}
          subtotal={subtotal}
          ppn={ppn}
          total={total}
          dp={dp}
          sisa={sisa}
          termLabel={
            termDP?.dpPercent === 100
              ? "Dibayar Lunas"
              : `DP ${termDP?.dpPercent ?? 10}%`
          }
        />
      )}
    </div>
  );
}
