import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import GudangSidebarForm from "../../components/common/GudangSidebarForm";
import { supabase } from "../../services/supabaseClient";

import { HomeModernIcon, CubeIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router";

export default function WarehouseIndex() {
  const [gudang, setGudang] = useState<any[]>([]);
  const [barangCount, setBarangCount] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const navigate = useNavigate();

  const fetchGudang = async (currentPage = 1, keyword = "") => {
    setLoading(true);
    try {
      const limit = 9;
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from("gudang").select("*", { count: "exact" });

      if (keyword) query = query.ilike("nama_gudang", `%${keyword}%`);
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      setGudang(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));

      // Ambil jumlah barang per gudang
      fetchBarangCount(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat gudang");
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangCount = async (gudangList: any[]) => {
    const result: any = {};

    for (let g of gudangList) {
      const { data, error } = await supabase
        .from("stok_gudang")
        .select("barang_id")
        .eq("gudang_id", g.id);

      if (error) {
        console.error(error);
        result[g.id] = 0;
        continue;
      }

      // ambil barang_id unik (distinct)
      const uniqueBarang = new Set(data.map((row) => row.barang_id));

      result[g.id] = uniqueBarang.size;
    }

    setBarangCount(result);
  };

  useEffect(() => {
    fetchGudang(page, search);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchGudang(1, search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <PageMeta title="Data Gudang" description="Halaman daftar gudang" />
      <PageBreadcrumb pageTitle="Gudang" />

      <div
        className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 
        dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h3 className="font-semibold text-2xl dark:text-white/90">
            Daftar Gudang
          </h3>

          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r 
               from-blue-600 via-cyan-600 to-teal-600  mt-4
               text-white rounded-xl px-5 h-11 shadow-md"
            onClick={() => {
              setEditData(null);
              setSidebarOpen(true);
            }}>
            Tambah Gudang
          </Button>
        </div>

        {/* SEARCH BAR */}
        <input
          type="text"
          placeholder="Cari nama gudang..."
          className="w-full mb-6 p-3 border rounded-xl dark:bg-white/5 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* CARD LIST */}
        {loading ? (
          <div className="text-center py-10">Memuat...</div>
        ) : gudang.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada gudang ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gudang.map((g) => (
              <div
                key={g.id}
                className="
        p-6 rounded-2xl border shadow bg-white 
        dark:border-gray-800 dark:bg-gradient-to-br 
        dark:from-blue-950 dark:to-black 
        hover:shadow-md transition cursor-pointer
        flex flex-col justify-between
        h-[300px]         /* FIXED HEIGHT */
      ">
                {/* BAGIAN ATAS */}
                <div>
                  {/* HEADER */}
                  <div className="flex items-center gap-4 mb-4">
                    <HomeModernIcon className="w-10 h-10 text-teal-500" />
                    <div className="max-w-[180px]">
                      <h4 className="text-xl font-semibold dark:text-white truncate">
                        {g.nama_gudang}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {g.lokasi || "Lokasi tidak tersedia"}
                      </p>
                    </div>
                  </div>

                  {/* JUMLAH BARANG */}
                  <div className="flex items-center gap-2 bg-teal-50 dark:bg-white/10 p-3 rounded-xl mb-3">
                    <CubeIcon className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                    <span className="text-gray-700 dark:text-gray-200">
                      <b>{barangCount[g.id] || 0}</b> jenis barang
                    </span>
                  </div>

                  {/* KETERANGAN */}
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2 text-sm">
                    {g.keterangan || "Tidak ada keterangan"}
                  </p>
                </div>

                {/* BAGIAN BAWAH */}
                <div className="flex justify-start gap-3 pt-4">
                  <Button
                    size="sm"
                    className="dark:bg-gray-700 bg-gray-600 hover:bg-gray-500 px-9 py-1 text-white rounded-lg"
                    onClick={() => navigate(`/warehouse/${g.id}`)}>
                    Detail
                  </Button>

                  <Button
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 px-7 py-1 text-white rounded-lg"
                    onClick={() => {
                      setEditData(g);
                      setSidebarOpen(true);
                    }}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* SIDEBAR FORM */}
        <GudangSidebarForm
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          editData={editData}
          onSuccess={() => {
            fetchGudang(page, search);
            setSidebarOpen(false);
          }}
        />
      </div>
    </div>
  );
}
