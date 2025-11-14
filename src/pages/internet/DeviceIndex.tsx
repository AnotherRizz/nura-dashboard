import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import DeviceTable from "../../components/tables/DeviceTable";
import { supabase } from "../../services/supabaseClient";

export default function DeviceIndex() {
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchDevices = async (currentPage = 1, keyword = "") => {
    setLoading(true);
    try {
      const limit = 10;
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("Device")
        .select(
          `
    id,
    nama,
    no_sn,
    status,
    createdAt,
    area:Area ( nama_area )
  `,
          { count: "exact" }
        )
        .range(from, to)
        .order("id", { ascending: false });

      if (keyword) {
        query = query.ilike("nama_device", `%${keyword}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setDevices(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
    } catch (err) {
      console.error("Gagal fetch device:", err);
      toast.error("Gagal memuat data device");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices(page, search);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchDevices(1, search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <PageMeta title="Device Dashboard" description="Daftar Device" />
      <PageBreadcrumb pageTitle="Daftar Device" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Daftar Device
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden lg:block">
              <form>
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
                      />
                    </svg>
                  </span>
                  <input
                    value={search}
                    type="text"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="temukan device yang ingin anda cari..."
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800  dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  />
                </div>
              </form>
            </div>

            <Button
              size="sm"
              className="bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl "
              onClick={() => navigate("/device/add")}>
              Tambah Device
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <DeviceTable
            data={devices}
            loading={loading}
            onDelete={async (id) => {
              try {
                const { error } = await supabase
                  .from("Device")
                  .delete()
                  .eq("id", id);
                if (error) throw error;
                await fetchDevices(page, search);
                toast.success("Device berhasil dihapus");
              } catch {
                toast.error("Gagal hapus device");
              }
            }}
          />

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
