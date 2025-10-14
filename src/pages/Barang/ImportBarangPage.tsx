import { useDropzone } from "react-dropzone";
import { useState } from "react";
import toast from "react-hot-toast";
import { FileIcon } from "../../icons";

export default function ImportBarangPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // ✅ state loading

  // Fungsi saat file didrop / dipilih
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast.success(`File dipilih: ${acceptedFiles[0].name}`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  // Handle upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Pilih file terlebih dahulu!");
      return;
    }

    try {
      setLoading(true); // ✅ mulai loading
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/importBarang", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload gagal");

      const data = await res.json();
      toast.success(data.message || "Import berhasil!");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat import");
    } finally {
      setLoading(false); // ✅ stop loading
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-white/[0.03] rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Import Barang</h2>
      <div className=" w-full max-w-[630px] mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          Ini adalah fitur untuk mengimport data barang dari file Excel secara massal
          dengan format yang sudah ditentukan
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dropzone area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive
              ? "Lepaskan file di sini ..."
              : "Drag & Drop file Excel (.xlsx/.xls) di sini, atau klik untuk pilih"}
          </p>
          {file && (
            <p className="mt-2 text-sm text-blue-600 font-medium">
              {file.name}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading} // ✅ disable saat loading
            className="mt-4 px-4 py-2 flex items-center bg-green-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Mengupload...
              </>
            ) : (
              <>
                Upload <FileIcon />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
