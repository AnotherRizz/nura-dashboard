import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Pagination from "../../components/tables/Pagination";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import StokInTable from "../../components/tables/StokInTable";
import {
  exportFilteredPDF,
} from "../../services/exportStokInPDF";

export default function StokInIndex() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

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
      .from("BarangMasuk")
      .select(
        `
        id,
        tanggal_masuk,
        keterangan,
        detail:DetailBarangMasuk (
          jumlah,
          harga_masuk,
          barang:Barang ( nama_barang )
        )
      `,
        { count: "exact" }
      )
      .order("id", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // 🔍 Search filter
    if (debouncedSearch) {
      query = query.ilike("keterangan", `%${debouncedSearch}%`);
    }

    // 🔥 Filter bulan + tahun
    if (year && month) {
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-31`;
      query = query.gte("tanggal_masuk", start).lte("tanggal_masuk", end);
    }

    // 🔥 Filter hanya tahun (tanpa bulan)
    if (year && !month) {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      query = query.gte("tanggal_masuk", start).lte("tanggal_masuk", end);
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
        (acc: number, d: any) => acc + d.harga_masuk * d.jumlah,
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

  // ⏳ Debounce Search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(t);
  }, [search]);

  // 🚀 Trigger fetch setiap page, search, bulan, atau tahun berubah
  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, month, year]);

  return (
    <div>
      <PageMeta title="Barang Masuk" description="Data Barang Masuk" />
      <PageBreadcrumb pageTitle="Barang Masuk" />

      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900  ">
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
            className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white/90
                 rounded-lg px-3 h-11 text-sm focus:border-blue-500 focus:ring-2 
                 focus:ring-blue-400/30 transition">
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
            className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white/90
                 rounded-lg px-3 h-11 text-sm focus:border-blue-500 focus:ring-2 
                 focus:ring-blue-400/30 transition">
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

        {/* Search Bar */}
        <div className="hidden lg:block flex-1 min-w-[250px]">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">
            Pencarian
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20">
                <path d="M3.04175..."></path>
              </svg>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Data Barang Masuk..."
              className="dark:bg-dark-900 bg-gray-50 border dark:bg-gray-900 dark:text-white/90 border-gray-300 dark:border-gray-700 
                   h-11 w-full rounded-lg py-2.5 pl-12 pr-14 text-sm 
                   shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 
                   transition"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-3">

          {/* Export Filter */}
          <Button
            size="sm"
            className="bg-red-600 text-white rounded-xl px-5"
            onClick={() =>
              exportFilteredPDF(
                data,
                `${year || "all-year"}-${month || "all-month"}-${
                  search || "no-search"
                }`
              )
            }>
            Export PDF
          </Button>
        </div>

        {/* Button */}
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 
               text-white rounded-xl px-5 h-11 mt-2 shadow-md"
          onClick={() => navigate("/barang-masuk/add")}>
          Tambah Barang Masuk
        </Button>
      </div>

      <div className="">
        <StokInTable data={data} loading={loading} />

        {meta.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onPageChange={(p: number) => setPage(p)}
          />
        )}
      </div>
    </div>
  );
}
