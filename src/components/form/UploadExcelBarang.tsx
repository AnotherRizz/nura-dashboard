import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { supabase } from "../../services/supabaseClient";

export default function UploadExcelBarang() {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [insertData, setInsertData] = useState<any[]>([]);

  const handleFile = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return toast.error("File tidak ditemukan");

    setLoading(true);
    setPreviewData([]);
    setInsertData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (!rows.length) {
        toast.error("File kosong atau format salah");
        setLoading(false);
        return;
      }

      const mapped = rows.map((r: any) => ({
        kode_barang: r.kode_barang || "",
        nama_barang: r.nama_barang || "",
        harga: r.harga ? Number(r.harga) : 0,
        stok: r.stok ? Number(r.stok) : 0,
        satuan: r.satuan || "",
        tipe: r.tipe || "",
        merk: r.merk || "",
        id_kategori: r.id_kategori ? Number(r.id_kategori) : null,
        supplier_id: r.supplier_id ? Number(r.supplier_id) : null,
      }));

      setPreviewData(rows);
      setInsertData(mapped);
      toast.success("File berhasil diproses, silakan review sebelum submit.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membaca file. Pastikan format sesuai template.");
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!insertData.length)
      return toast.error("Tidak ada data yang bisa disimpan.");

    setLoading(true);

    try {
      const { error } = await supabase.from("Barang").insert(insertData);

      if (error) throw error;

      toast.success("Data berhasil disimpan ke database!");
      setPreviewData([]);
      setInsertData([]);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan ke database.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Upload Data Barang via Excel
      </h2>

      {/* Format info */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
        <strong>Format kolom Excel yang dibutuhkan:</strong>
        <ul className="list-disc ml-6 mt-1">
          <li>kode_barang</li>
          <li>nama_barang</li>
          <li>harga</li>
          <li>stok</li>
          <li>satuan</li>
          <li>tipe</li>
          <li>merk</li>
          <li>id_kategori</li>
          <li>supplier_id</li>
        </ul>
      </div>

      {/* File input */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          className="block w-full border p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"
        />
      </div>

      {loading && (
        <p className="mt-2 text-blue-500 text-sm">Memproses...</p>
      )}

      {/* Preview Table */}
      {previewData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Preview Data ({previewData.length} baris)
          </h3>

          <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key} className="px-3 py-2 border dark:border-gray-700">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 dark:text-gray-200">
                {previewData.slice(0, 15).map((row, i) => (
                  <tr key={i} className="border-t dark:border-gray-700">
                    {Object.values(row).map((val: any, idx) => (
                      <td key={idx} className="px-3 py-1 border dark:border-gray-700">
                        {val?.toString() || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewData.length > 15 && (
            <p className="text-sm text-gray-500 mt-1">
              Ditampilkan 15 dari {previewData.length} baris...
            </p>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 
            text-white rounded-lg shadow-sm transition dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? "Menyimpan..." : "Submit ke Database"}
          </button>
        </div>
      )}
    </div>
  );
}
