import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Pagination from "../../components/tables/Pagination";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import StokOutTable from "../../components/tables/StokOutTable";
import {
  exportAllPDF,
  exportFilteredPDF,
} from "../../services/exportStokOutPDF";

export default function StokOutIndex() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [isExporting, setIsExporting] = useState(false);

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const navigate = useNavigate();
  const limit = 10;

  const fetchData = async () => {
    setLoading(true);

    let query = supabase
      .from("barang_keluar")
      .select(
        `
        id,
        tanggal_keluar,
        pic,
        nama_project,
        lokasi,
        no_spk,
        keterangan,
        detail:detail_barang_keluar (
          jumlah,
          harga_keluar,
          barang:Barang ( nama_barang )
        )
      `,
        { count: "exact" }
      )
      .order("id", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Search
    if (debouncedSearch) {
      query = query.ilike("keterangan", `%${debouncedSearch}%`);
    }

    // Filter bulan & tahun
    if (year && month) {
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-31`;
      query = query.gte("tanggal_keluar", start).lte("tanggal_keluar", end);
    }

    // Filter tahun saja
    if (year && !month) {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      query = query.gte("tanggal_keluar", start).lte("tanggal_keluar", end);
    }

    const { data, error, count } = await query;

    if (error) console.error(error);

    const formatted = data?.map((item) => ({
      ...item,
      total_item: item.detail.reduce(
        (acc: number, d: any) => acc + d.jumlah,
        0
      ),
      total_harga: item.detail.reduce(
        (acc: number, d: any) => acc + d.harga_keluar * d.jumlah,
        0
      ),
    }));

    setData(formatted || []);
    setMeta({
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 1,
    });

    setLoading(false);
  };

  // Debounce Search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, month, year]);

  const handleExport = async () => {
    if (!data || data.length === 0) return;

    setIsExporting(true);

    try {
      const isFiltered = month || year || search;

      if (!isFiltered) {
        await exportAllPDF(data);
      } else {
        const filterName = `${year || "all-year"}-${month || "all-month"}-${
          search || "no-search"
        }`;
        await exportFilteredPDF(data, filterName);
      }
    } catch (err) {
      console.error(err);
    }

    setIsExporting(false);
  };

  return (
    <div>
      <PageMeta title="Barang Keluar" description="Data Barang Keluar" />
      <PageBreadcrumb pageTitle="Barang Keluar" />

      {/* FILTER */}

      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900">
        {/* Filter Bulan */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">
            Bulan
          </label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white/90 rounded-lg px-3 h-11 text-sm">
            <option value="">Semua Bulan</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>

        {/* Filter Tahun */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">
            Tahun
          </label>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white/90 rounded-lg px-3 h-11 text-sm">
            <option value="">Semua Tahun</option>
            {Array.from({ length: 6 }).map((_, i) => {
              const y = 2020 + i;
              return (
                <option value={y} key={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        {/* Search */}
        <div className="hidden lg:block flex-1 min-w-[250px]">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">
            Pencarian
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Data Barang keluar..."
            className="bg-gray-50 dark:bg-gray-900 border dark:text-white/90 border-gray-300 dark:border-gray-700 rounded-lg px-4 h-11 w-full"
          />
        </div>

    <div className="flex items-center gap-3">

  <Button
    size="sm"
    disabled={isExporting || !data?.length}
    className={`rounded-xl px-5 h-11 shadow-md text-white 
      ${isExporting || !data?.length ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}
    `}
    onClick={handleExport}
  >
    {isExporting ? "Memproses..." : "Export PDF"}
  </Button>

  <Button
    size="sm"
    className="bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r 
               from-blue-600 via-cyan-600 to-teal-600 
               text-white rounded-xl px-5 h-11 shadow-md"
    onClick={() => navigate("/barang-keluar/add")}
  >
    Tambah Barang Keluar
  </Button>

</div>

      </div>

      {/* TABLE */}
      <StokOutTable data={data} loading={loading} />

      {meta.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={(p: number) => setPage(p)}
        />
      )}
    </div>
  );
}
