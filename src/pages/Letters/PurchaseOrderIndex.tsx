import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Pagination from "../../components/tables/Pagination";
import { supabase } from "../../services/supabaseClient";
import { useNavigate } from "react-router";
import PurchaseOrderTable from "../../components/tables/PurchaseOrderTable";
// import { exportPurchaseOrderPDF } from "../../services/exportPurchaseOrderPDF";

export default function PurchaseOrderIndex() {
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

  const limit = 10;
  const navigate = useNavigate();

  // -------------------------------------------------
  // FETCH DATA
  // -------------------------------------------------
  const fetchData = async () => {
    setLoading(true);

    let query = supabase
      .from("purchase_order")
      .select(
        `
        id,
        no_po,
        tanggal,
        supplier:Supplier (
          id,
          nama_supplier
        ),
        detail:detail_purchase_order (
          id_barang,
          jumlah,
          harga_satuan,
          subtotal,
          barang:Barang ( nama_barang )
        ),
        keterangan,
        status
      `,
        { count: "exact" }
      )
      .order("id", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Search by no_po / keterangan
    if (debouncedSearch) {
      query = query.or(
        `no_po.ilike.%${debouncedSearch}%,keterangan.ilike.%${debouncedSearch}%`
      );
    }

    // Filter by year & month
    if (year && month) {
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-31`;
      query = query.gte("tanggal", start).lte("tanggal", end);
    }

    // Filter only by year
    if (year && !month) {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      query = query.gte("tanggal", start).lte("tanggal", end);
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
        (acc: number, d: any) => acc + d.subtotal,
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

  // -------------------------------------------------
  // DEBOUNCE INPUT SEARCH
  // -------------------------------------------------
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // Trigger fetch on page, search, month, year changes
  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, month, year]);

  return (
    <div>
      <PageMeta title="Purchase Order" description="Data Purchase Order" />
      <PageBreadcrumb pageTitle="Purchase Order" />

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900">

        {/* Filter bulan */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">Bulan</label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="border dark:bg-gray-900 dark:text-white/90 border-gray-300 rounded-lg px-3 h-11 text-sm"
          >
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

        {/* Filter tahun */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">Tahun</label>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="border dark:bg-gray-900 dark:text-white/90 border-gray-300 rounded-lg px-3 h-11 text-sm"
          >
            <option value="">Semua Tahun</option>
            {Array.from({ length: 6 }).map((_, i) => {
              const y = 2020 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs text-gray-600 dark:text-gray-300 mb-1">Pencarian</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No PO / Keterangan..."
            className="w-full h-11 px-4 rounded-lg border dark:bg-gray-900 dark:text-white/90 border-gray-300"
          />
        </div>


        {/* Add PO */}
        <Button
          size="sm"
          className="bg-blue-500 dark:bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 mt-4 text-white rounded-xl px-5 h-11"
          onClick={() => navigate("/purchase-order/add")}
        >
          Tambah PO
        </Button>
      </div>

      {/* TABLE */}
      <div>
        <PurchaseOrderTable data={data} loading={loading} />

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
