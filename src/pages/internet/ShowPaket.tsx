import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {  BoltIcon } from "../../icons";
import { supabase } from "../../services/supabaseClient";
import { MapIcon } from "@heroicons/react/24/outline";

interface Area {
  id: number;
  nama_area: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface Paket {
  id: number;
  nama_paket: string;
  deskripsi?: string;
  speed?: string;
  harga: number;
  fitur?: string[];
  PaketArea: {
    area: Area;
  }[];
}

export default function ShowPaket() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paket, setPaket] = useState<Paket | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPaket = async () => {
   try {
  const { data, error } = await supabase
    .from("Paket")
    .select(`
      id,
      nama_paket,
      deskripsi,
      speed,
      harga,
      fitur,
      PaketArea (
        area:Area (
          id,
          nama_area,
          latitude,
          longitude,
          radius
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  // ✅ Normalisasi hasil Supabase agar sesuai tipe 'Paket'
  const normalizedPaket: Paket = {
    id: data.id,
    nama_paket: data.nama_paket,
    deskripsi: data.deskripsi ?? "",
    speed: data.speed ?? "",
    harga: data.harga ?? 0,
    fitur: Array.isArray(data.fitur) ? data.fitur : [],
    PaketArea:
      Array.isArray(data.PaketArea) && data.PaketArea.length > 0
        ? data.PaketArea.map((pa: any) => ({
            area: Array.isArray(pa.area) ? pa.area[0] : pa.area,
          }))
        : [],
  };

  setPaket(normalizedPaket);
} catch (err) {
  console.error("❌ Gagal mengambil detail paket:", err);
} finally {
  setLoading(false);
}

  };

  useEffect(() => {
    fetchPaket();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!paket) return <div className="p-6">Paket tidak ditemukan.</div>;

  return (
    <div>
      <PageMeta
        title={`Detail Paket - ${paket.nama_paket}`}
        description="Detail paket internet"
      />
      <PageBreadcrumb pageTitle="Detail Paket" />

      <div className="min-h-screen px-4 py-10 space-y-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Detail Paket */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
            <h2 className="text-2xl flex gap-1 font-bold text-gray-800 dark:text-white/90 mb-6">
              <BoltIcon /> Detail Paket
            </h2>

            <div className="space-y-4 ">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Nama Paket:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {paket.nama_paket}
                </span>
              </div>
              {paket.deskripsi && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Deskripsi:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {paket.deskripsi}
                  </span>
                </div>
              )}
              {paket.speed && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Kecepatan:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {paket.speed}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Harga:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {paket.harga.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Fitur Paket */}
          {paket.fitur && paket.fitur.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
              <h2 className="text-2xl flex gap-1 font-bold text-gray-800 dark:text-white/90 mb-6">
                Fitur Paket Internet
              </h2>
              <ul className="list-disc pl-6 space-y-1 text-gray-800 dark:text-white">
                {paket.fitur.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Area Cakupan */}
        {paket.PaketArea && paket.PaketArea.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
            <h2 className="text-2xl flex gap-1 font-bold text-gray-800 dark:text-white/90 mb-6">
              <MapIcon className="w-6 h-6" /> Area Cakupan
            </h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-800 dark:text-white">
              {paket.PaketArea.map((pa) => (
                <li key={pa.area.id}>{pa.area.nama_area}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="mt-10 flex justify-end gap-2">
          <Button
            className="rounded-xl !bg-red-500 text-white"
            onClick={() => navigate("/paket")}
          >
            Kembali
          </Button>
          <Button
            className="rounded-xl"
            onClick={() => navigate(`/paket/edit/${paket.id}`)}
          >
            Edit Paket
          </Button>
        </div>
      </div>
    </div>
  );
}
