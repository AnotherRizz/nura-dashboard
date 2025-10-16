"use client";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "../../services/supabaseClient";

interface Paket {
  id: string;
  nama_paket: string;
  deskripsi: string;
  speed: string;
  harga: number;
  fitur: string[]; // pastikan di Supabase disimpan sebagai array (type: text[])
}

interface UserRegistration {
  id: string;
  nama: string;
  no_wa: string;
  alamat: string;
  latitude: number | null;
  longitude: number | null;
  paketId: string;
  foto_ktp: string | null;
  createdAt: string;
  updatedAt: string;
  paket?: Paket | null;
}

interface Progress {
  id: string;
  registrationId: string;
  status: string;
  note?: string | null;
  createdAt: string;
}

export default function ShowUserRegistration() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserRegistration | null>(null);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // === Fetch Data User dari Supabase ===
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from("UserRegistration")
          .select(
            `
            id,
            nama,
            no_wa,
            alamat,
            latitude,
            longitude,
            paketId,
            foto_ktp,
            createdAt,
            updatedAt,
            paket:paketId (
              id,
              nama_paket,
              deskripsi,
              speed,
              harga,
              fitur
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) throw error;
       setUser({
  ...data,
  paket: Array.isArray(data.paket) ? data.paket[0] : data.paket,
});

      } catch (err: any) {
        console.error("Error fetching user:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  // === Fetch Progress dari Supabase ===
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("RegistrationProgress")
          .select("*")
          .eq("registrationId", id)
          .order("createdAt", { ascending: false });

        if (error) throw error;
        setProgresses(data || []);
      } catch (err: any) {
        console.error("Error fetching progress:", err.message);
      } finally {
        setLoadingProgress(false);
      }
    };

    if (id) fetchProgress();
  }, [id]);

  if (loading)
    return <p className="p-5 text-gray-500">Memuat data user...</p>;
  if (!user)
    return <p className="p-5 text-red-500">User tidak ditemukan.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {/* === Kiri: Detail User === */}
      <div className="col-span-2 p-6 mx-auto bg-white rounded-lg shadow dark:bg-gray-800">
        <Link
          to="/registrasi-user"
          className="text-sm text-blue-500 hover:underline dark:text-blue-400"
        >
          ← Kembali ke daftar
        </Link>

        <h1 className="mt-4 mb-6 flex gap-2 items-center text-2xl font-bold text-gray-800 dark:text-white">
          <UserPlusIcon className="w-6 h-6" /> Detail User Registration
        </h1>

        {/* Info User */}
        <div className="space-y-2 text-gray-700 dark:text-gray-200">
          <p>
            <span className="font-medium">Nama:</span> {user.nama}
          </p>
          <p>
            <span className="font-medium">No WA:</span> {user.no_wa}
          </p>
          <p>
            <span className="font-medium">Alamat:</span> {user.alamat}
          </p>
          <p>
            <span className="font-medium">Tanggal Daftar:</span>{" "}
            {new Date(user.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Paket Info */}
        {user.paket && (
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
              Paket Dipilih
            </h2>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <p className="text-lg font-bold">{user.paket.nama_paket}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user.paket.deskripsi}
              </p>
              <p className="mt-2">
                <span className="font-medium">Speed:</span> {user.paket.speed}
              </p>
              <p>
                <span className="font-medium">Harga:</span> Rp{" "}
                {user.paket.harga.toLocaleString("id-ID")}
              </p>
              {user.paket.fitur && (
                <ul className="mt-2 list-disc list-inside">
                  {user.paket.fitur.map((fitur, i) => (
                    <li key={i} className="text-sm">
                      {fitur}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Foto KTP */}
        {user.foto_ktp && (
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
              Foto KTP
            </h2>
            <img
              src={user.foto_ktp}
              alt="Foto KTP"
              className="object-cover w-64 border rounded-lg shadow"
            />
          </div>
        )}

        {/* Timeline Progress */}
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
            Timeline Progress
          </h2>
          {loadingProgress ? (
            <p className="text-sm text-gray-500">Memuat progress...</p>
          ) : progresses.length > 0 ? (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              <ul className="space-y-6">
                {progresses.map((p) => {
                  const statusColor =
                    p.status === "APPLIED"
                      ? "bg-yellow-500"
                      : p.status === "VERIFIED"
                      ? "bg-blue-500"
                      : p.status === "INSTALLATION"
                      ? "bg-purple-500"
                      : p.status === "ACTIVE"
                      ? "bg-green-500"
                      : p.status === "REJECTED"
                      ? "bg-red-500"
                      : "bg-gray-400";

                  return (
                    <li key={p.id} className="relative">
                      <span
                        className={`absolute -left-[14px] w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColor}`}
                      ></span>

                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm dark:text-white">
                            {p.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(p.createdAt).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {p.note && (
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            {p.note}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Belum ada progress</p>
          )}
        </div>
      </div>

      {/* === Kanan: Peta Lokasi === */}
      <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Lokasi User
        </h2>
        {user.latitude && user.longitude ? (
          <iframe
            title="User Location"
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://maps.google.com/maps?q=${user.latitude},${user.longitude}&z=15&output=embed`}
          ></iframe>
        ) : (
          <p className="text-gray-500">Koordinat tidak tersedia</p>
        )}
      </div>
    </div>
  );
}
