import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { BoltIcon } from "../../icons";

import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../../services/supabaseClient";
// Marker default leaflet
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ----------------- Types -----------------
interface PaketDetail {
  id: number;
  nama_paket: string;
  deskripsi?: string;
  speed?: string;
  harga: number;
  fitur?: string[];
}

interface PaketArea {
  id: number;
  paketId: number;
  areaId: number;
  paket: PaketDetail;
}

interface Area {
  id: number;
  nama_area: string;
  latitude: number;
  longitude: number;
  radius?: number;
  PaketArea: PaketArea[];
}

// ----------------- Component -----------------
export default function ShowArea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [area, setArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchArea = async () => {
   try {
  const { data, error } = await supabase
    .from("Area")
    .select(`
      id,
      nama_area,
      latitude,
      longitude,
      radius,
      PaketArea (
        id,
        paketId,
        areaId,
        paket:Paket (
          id,
          nama_paket,
          deskripsi,
          speed,
          harga,
          fitur
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  // ✅ Normalisasi data agar sesuai tipe 'Area'
  const normalizedArea: Area = {
    id: data.id,
    nama_area: data.nama_area,
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius ?? null,
    PaketArea:
      Array.isArray(data.PaketArea) && data.PaketArea.length > 0
        ? data.PaketArea.map((pa: any) => ({
            id: pa.id,
            paketId: pa.paketId,
            areaId: pa.areaId,
            paket: Array.isArray(pa.paket) ? pa.paket[0] : pa.paket,
          }))
        : [], // kalau kosong, kembalikan array kosong
  };

  setArea(normalizedArea);
} catch (err) {
  console.error("❌ Gagal mengambil detail area:", err);
} finally {
  setLoading(false);
}

  };

  useEffect(() => {
    if (id) fetchArea();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!area) return <div className="p-6">Area tidak ditemukan.</div>;

  return (
    <div>
      <PageMeta
        title={`Detail Area - ${area.nama_area}`}
        description="Detail Area internet"
      />
      <PageBreadcrumb pageTitle="Detail Area" />

      <div className="min-h-screen px-4 py-10 space-y-10">
        {/* Map Lokasi Area */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg py-16 px-7 h-[500px] dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-4">
            Lokasi Area <span className="text-blue-500">{area.nama_area}</span>{" "}
            radius jangkauan {area.radius} km
          </h2>
          <MapContainer
            center={[area.latitude, area.longitude]}
            zoom={14}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "10px",
              zIndex: 0,
            }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[area.latitude, area.longitude]}
              icon={markerIcon}>
              <Popup>{area.nama_area}</Popup>
            </Marker>
            {area.radius && (
              <Circle
                center={[area.latitude, area.longitude]}
                radius={area.radius * 1000} // km → meter
                pathOptions={{
                  color: "blue",
                  fillColor: "lightblue",
                  fillOpacity: 0.3,
                }}
              />
            )}
          </MapContainer>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Detail Area */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
            <h2 className="text-2xl flex gap-1 font-bold text-gray-800 dark:text-white/90 mb-6">
              <BoltIcon /> Detail Area
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Nama Area:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {area.nama_area}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Latitude:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {area.latitude}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Longitude:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {area.longitude}
                </span>
              </div>
              {area.radius && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    Radius:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {area.radius} km
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Daftar Paket */}
          {area.PaketArea && area.PaketArea.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg p-8 dark:border-gray-800 dark:bg-gradient-to-br dark:from-sky-950 dark:to-gray-900">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-6">
                Paket di Area Ini
              </h2>
              {area.PaketArea.map((pa) => (
                <div
                  key={pa.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pa.paket.nama_paket}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {pa.paket.deskripsi}
                  </p>
                  <p className="text-gray-800 dark:text-white mt-1">
                    Kecepatan: {pa.paket.speed}
                  </p>
                  <p className="text-gray-900 dark:text-white font-bold">
                    {pa.paket.harga.toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="mt-10 flex justify-end gap-2">
          <Button
            className="rounded-xl !bg-red-500 text-white"
            onClick={() => navigate("/area")}>
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
