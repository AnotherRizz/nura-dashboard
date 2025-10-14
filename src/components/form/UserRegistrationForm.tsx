import { useEffect, useState } from "react";

interface Paket {
  id: string;
  nama_paket: string;
  harga: number;
}

interface UserRegistrationFormProps {
  initialValues?: {
    nama: string;
    no_wa: string;
    alamat: string;
    detailAlamat?: string;
    paketId?: string;
    foto_ktp?: string;
    latitude?: string;
    longitude?: string;
  };
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function UserRegistrationForm({
  initialValues,
  onSubmit,
  onCancel,
}: UserRegistrationFormProps) {
  const [nama, setNama] = useState(initialValues?.nama || "");
  const [noWa, setNoWa] = useState(initialValues?.no_wa || "");
  const [alamat, setAlamat] = useState(initialValues?.alamat || "");
  const [detailAlamat, setDetailAlamat] = useState(
    initialValues?.detailAlamat || ""
  );
  const [paketId, setPaketId] = useState(initialValues?.paketId || "");
  const [fotoKtp, setFotoKtp] = useState(initialValues?.foto_ktp || "");
  const [latitude, setLatitude] = useState(initialValues?.latitude || "");
  const [longitude, setLongitude] = useState(initialValues?.longitude || "");

  const [paketList, setPaketList] = useState<Paket[]>([]);

  useEffect(() => {
    fetch("/api/paket")
      .then((res) => res.json())
      .then((res) => setPaketList(res.data || []))
      .catch(() => alert("Gagal memuat data paket"));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      nama,
      no_wa: noWa,
      alamat,
      detailAlamat,
      paketId,
      foto_ktp: fotoKtp,
      latitude,
      longitude,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama */}
        <div>
          <label className="block text-sm mb-1">Nama</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 dark:bg-gray-700/40 dark:border-gray-700"
          />
        </div>

        {/* No WA */}
        <div>
          <label className="block text-sm mb-1">No WA</label>
          <input
            type="text"
            value={noWa}
            onChange={(e) => setNoWa(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 dark:bg-gray-700/40 dark:border-gray-700"
          />
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-sm mb-1">Alamat</label>
          <textarea
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 dark:bg-gray-700/40 dark:border-gray-700"
          />
        </div>

        {/* Detail Alamat */}
        <div>
          <label className="block text-sm mb-1">Detail Alamat</label>
          <input
            type="text"
            value={detailAlamat}
            onChange={(e) => setDetailAlamat(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700/40 dark:border-gray-700"
          />
        </div>

        {/* Paket */}
        <div>
          <label className="block text-sm mb-1">Paket</label>
          <select
            value={paketId}
            onChange={(e) => setPaketId(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 dark:bg-gray-700/90 dark:border-gray-700">
            <option value="">-- Pilih Paket --</option>
            {paketList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_paket} - Rp{p.harga.toLocaleString("id-ID")}
              </option>
            ))}
          </select>
        </div>

        {/* Foto KTP */}
        <div>
          <label className="block text-sm mb-1">Foto KTP (URL / Base64)</label>
          <input
            type="text"
            value={fotoKtp}
            onChange={(e) => setFotoKtp(e.target.value)}
            placeholder="https://example.com/ktp.jpg"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700/40 dark:border-gray-700"
          />
          {fotoKtp && (
            <img
              src={fotoKtp}
              alt="Foto KTP"
              className="mt-2 w-32 h-auto rounded"
            />
          )}
        </div>

        {/* Latitude & Longitude */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Latitude</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700/40 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Longitude</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full border rounded px-3 py-2 dark:bg-gray-700/40 dark:border-gray-700"
            />
          </div>
        </div>
      </div>
      {/* Action */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-2xl dark:border-gray-700 text-white bg-gray-800 dark:bg-gray-800">
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-2 border rounded-2xl dark:border-gray-700 bg-blue-600 text-white">
          Simpan
        </button>
      </div>
    </form>
  );
}
