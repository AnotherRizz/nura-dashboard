import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BarangTable from "../../components/tables/BarangTable";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router";
import Pagination from "../../components/tables/Pagination";
import { supabase } from "../../services/supabaseClient";

export default function BarangIndex() {
  const [dataBarang, setDataBarang] = useState<any[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("Barang")
        .select(
          `
    id,
    kode_barang,
    nama_barang,
    stok,
    harga,
    merk,
    tipe,
    satuan,
    gambar,
    kategori:id_kategori ( nama_kategori ),
    supplier:supplier_id ( nama_supplier )
  `,
          { count: "exact" }
        )
        .order("id", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // filter search
      if (debouncedSearch) {
        query = query.ilike("nama_barang", `%${debouncedSearch}%`);
      }

      const { data, error, count } = await query;
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      const formatted = data?.map((item: any) => {
        return {
          id: item.id,
          kode_barang: item.kode_barang,
          nama_barang: item.nama_barang,
          stok: item.stok,
          harga: item.harga,
          merk: item.merk,
          tipe: item.tipe,
          satuan: item.satuan,
          gambar: item.gambar,
          kategori: item.kategori,
          supplier: item.supplier,
        };
      });
      setDataBarang(formatted || []);
      setMeta({
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 1,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui."
      );
    } finally {
      setLoading(false);
    }
  };

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <PageMeta
        title="Barang Dashboard"
        description="Halaman dashboard barang"
      />
      <PageBreadcrumb pageTitle="Halaman Barang" />
      <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base md:w-2/3 mb-5">
        Halaman ini menampilkan daftar lengkap barang yang tersimpan dalam
        sistem, termasuk informasi seperti kode barang, nama, kategori, stok,
        harga, dan supplier.
      </p>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
           
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden lg:block">
              <form>
                <div className="relative">
                  <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                    {/* icon search */}
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
                    value={searchTerm}
                    type="text"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="temukan barang yang ingin anda cari..."
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  />
                </div>
              </form>
            </div>
            <Button
              size="sm"
              className="bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl "
              onClick={() => navigate("/barang/add")}>
              Tambah Barang
            </Button>
          </div>
        </div>

        <BarangTable
          data={dataBarang}
          loading={loading}
          onDelete={async (id: string) => {
            try {
              const { error } = await supabase
                .from("Barang")
                .delete()
                .eq("id", id);
              if (error) throw error;
              fetchData();
            } catch {
              alert("Terjadi kesalahan saat menghapus barang");
            }
          }}
        />

        {meta && meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onPageChange={(newPage: number) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
}
