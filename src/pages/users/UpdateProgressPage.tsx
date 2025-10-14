import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function UpdateProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (id) {
      fetch(`/api/userRegistration?id=${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Gagal fetch registrasi");
          return res.json();
        })
        .then((data) => {
          setStatus(data.status || "");
        })
        .catch(() => alert("Gagal memuat data registrasi"));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `/api/userRegistration/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, note }),
        }
      );

      if (!response.ok) throw new Error("Gagal update status");

      alert("Progress berhasil diperbarui");
      navigate("/registrations");
    } catch (err) {
      alert("Terjadi kesalahan saat update progress");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 dark:text-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Update Progress</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700"
            required
          >
            <option value="">-- Pilih Status --</option>
            <option value="APPLIED">Applied</option>
            <option value="PENDING">Pending</option>
            <option value="PROSES">Proses</option>
            <option value="SELESAI">Selesai</option>
            <option value="BATAL">Batal</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Catatan</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded px-3 py-2 dark:bg-gray-700"
            rows={3}
            placeholder="Tambahkan catatan opsional"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/registrations")}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
