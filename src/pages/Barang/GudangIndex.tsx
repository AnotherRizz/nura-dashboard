import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import GudangTable from "../../components/tables/GudangTable";
import GudangSidebarForm from "../../components/common/GudangSidebarForm";
import { supabase } from "../../services/supabaseClient";

export default function GudangIndex() {
  const [gudang, setGudang] = useState<any[]>([]);
  const [search, ] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchGudang = async (currentPage = 1, keyword = "") => {
    setLoading(true);
    try {
      const limit = 10;
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from("gudang").select("*", { count: "exact" });

      if (keyword) query = query.ilike("nama_gudang", `%${keyword}%`);
      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      setGudang(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat gudang");
    } finally {
      setLoading(false);
    }
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

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between mb-6">
          <h3 className="font-semibold text-2xl dark:text-white/90">
            Daftar Gudang
          </h3>

          <Button
            size="sm"
            className="bg-blue-500 rounded-xl"
            onClick={() => {
              setEditData(null);
              setSidebarOpen(true);
            }}
          >
            Tambah Gudang
          </Button>
        </div>

        <GudangTable
          data={gudang}
          loading={loading}
          onEdit={(item) => {
            setEditData(item);
            setSidebarOpen(true);
          }}
          onDelete={async (id) => {
            try {
              const { error } = await supabase.from("gudang").delete().eq("id", id);
              if (error) throw error;

              fetchGudang(page, search);
              toast.success("Gudang berhasil dihapus");
            } catch {
              toast.error("Gagal menghapus");
            }
          }}
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
