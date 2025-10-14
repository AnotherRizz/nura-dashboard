import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import AreaTable from "../../components/tables/AreaTable";

// react-leaflet
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// leaflet icon fix
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { supabase } from "../../services/supabaseClient";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Komponen untuk auto fit map ke semua area
function FitBounds({ area }: { area: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (area.length > 0) {
      const bounds = L.latLngBounds(
        area.map((a) => [a.latitude, a.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [area, map]);

  return null;
}

export default function Summary() {
  const [area, setArea] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const fetchArea = async (currentPage = 1, keyword = "") => {
    setLoading(true);
    try {
      let query = supabase
        .from("Area")
        .select("*", { count: "exact" })
        .order("id", { ascending: true })
        .range((currentPage - 1) * limit, currentPage * limit - 1);

      if (keyword) {
        query = query.ilike("nama_area", `%${keyword}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setArea(data || []);
      setTotalPages(count ? Math.ceil(count / limit) : 1);
    } catch (err) {
      console.error("Gagal fetch area:", err);
      toast.error("Gagal memuat area");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArea(page, search);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchArea(1, search);
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div>
      <PageMeta title="Area Dashboard" description="Daftar Area" />
      <PageBreadcrumb pageTitle="Daftar Side Area" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl"></h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="hidden lg:block">
              <form>
                <div className="relative">
                  <input
                    value={search}
                    type="text"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="temukan area yang ingin anda cari..."
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800  dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
                  />

                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                    <span> ⌘ </span>
                  </button>
                </div>
              </form>
            </div>
            <Button
              size="sm"
              className="bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl "
              onClick={() => navigate("/area/add")}>
              Tambah Area
            </Button>
          </div>
        </div>

        <div className="">

          {/* TABLE */}
          <div className="mt-4">
            <AreaTable
              data={area}
              loading={loading}
              onDelete={async (id) => {
                try {
                  const { error } = await supabase
                    .from("Area")
                    .delete()
                    .eq("id", id);
                  if (error) throw error;
                  await fetchArea(page, search);
                  toast.success("Area berhasil dihapus");
                } catch {
                  toast.error("Gagal hapus area");
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
    </div>
  );
}
