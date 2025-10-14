import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import KategoriTable from "../../components/tables/KategoriTable";
import { supabase } from "../../services/supabaseClient";

export default function Kategori() {
  const [kategori, setKategori] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchKategori = async (currentPage = 1, keyword = "") => {
    setLoading(true);
    try {
      const limit = 10;
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from("Kategori").select("*", { count: "exact" });

      // Search filter
      if (keyword) {
        query = query.ilike("nama_kategori", `%${keyword}%`);
      }

      // Pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setKategori(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err) {
      console.error("Gagal fetch kategori:", err);
      toast.error("Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  // ⏳ Fetch saat page berubah
  useEffect(() => {
    fetchKategori(page, search);
  }, [page]);

  // ⌛ Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1); // reset ke halaman pertama
      fetchKategori(1, search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <PageMeta
        title="Kategori Dashboard "
        description="This is React.js Kategori Dashboard page"
      />
      <PageBreadcrumb pageTitle="Kategori Page" />
      <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base md:w-2/3 mb-5">
        Halaman ini menampilkan daftar kategori barang yang ada untuk membantu
        pengelompokan produk.
      </p>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Daftar Kategori
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="hidden lg:block">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                    <svg
                      className="fill-gray-500 dark:fill-gray-400"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                        fill=""
                      />
                    </svg>
                  </span>
                  <input
                    value={search}
                    type="text"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari kategori..."
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  />
                </div>
              </form>
            </div>
            <Button
              size="sm"
                 className="bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl "
              onClick={() => navigate("/kategori/add")}>
              Tambah Kategori
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <KategoriTable
            data={kategori}
            loading={loading}
            onDelete={async (id) => {
              try {
                const { error } = await supabase
                  .from("Kategori")
                  .delete()
                  .eq("id", id);

                if (error) throw error;

                await fetchKategori(page, search);
                toast.success("Kategori berhasil dihapus");
              } catch {
                toast.error("Gagal hapus kategori");
              }
            }}
          />

          {/* Pagination tetap ditampilkan */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
}
