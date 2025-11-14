"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import Pagination from "../../components/tables/Pagination";
import { supabase } from "../../services/supabaseClient";
import LogTable from "../../components/tables/LogTable";
import Swal from "sweetalert2";
import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function LogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchLogs = async (currentPage = 1, keyword = "", topic = "") => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("DeviceLog")
        .select(
          `
          id,
          deviceid,
          time,
          topic,
          message,
          createdat,
          Device ( nama )
        `,
          { count: "exact" }
        )
        .order("id", { ascending: false })
        .range(from, to);

      if (keyword) query = query.ilike("message", `%${keyword}%`);
      if (topic) query = query.eq("topic", topic);

      const { data, count, error } = await query;
      if (error) throw error;

      // Ambil semua topic unik (hanya 1x query ringan)
      const { data: topicData } = await supabase
        .from("DeviceLog")
        .select("topic");
      if (topicData) {
        const uniqueTopics = [...new Set(topicData.map((t) => t.topic))];
        setTopics(uniqueTopics.filter(Boolean));
      }

      setLogs(data || []);
      setTotalPages(Math.ceil((count || 0) / limit));
      setSelectedIds([]);
    } catch (err) {
      console.error("Gagal memuat log:", err);
      toast.error("Gagal memuat data log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, search, topicFilter);
  }, [page, topicFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchLogs(1, search, topicFilter);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

// Hapus terpilih
const handleDeleteSelected = async () => {
  if (selectedIds.length === 0) {
    toast.error("Pilih log yang ingin dihapus");
    return;
  }

  const result = await Swal.fire({
    title: "Konfirmasi Hapus",
    text: `Apakah kamu yakin ingin menghapus ${selectedIds.length} log terpilih?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  const { error } = await supabase.from("DeviceLog").delete().in("id", selectedIds);
  if (error) {
    toast.error("Gagal menghapus log");
  } else {
    toast.success("Log terpilih dihapus");
    fetchLogs(page, search, topicFilter);
  }
};

// Hapus berdasarkan topic
const handleDeleteByTopic = async () => {
  if (!topicFilter) {
    toast.error("Pilih topic terlebih dahulu");
    return;
  }

  const result = await Swal.fire({
    title: "Hapus Semua Log?",
    text: `Semua log dengan topic "${topicFilter}" akan dihapus permanen.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus semua!",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  const { error } = await supabase.from("DeviceLog").delete().eq("topic", topicFilter);
  if (error) {
    toast.error("Gagal menghapus log topic");
  } else {
    toast.success(`Semua log topic "${topicFilter}" dihapus`);
    fetchLogs(page, search, topicFilter);
  }
};


  return (
    <div>
      <PageMeta
        title="Log Aktivitas Device"
        description="Riwayat Log Realtime"
      />
      <PageBreadcrumb pageTitle="Log Device" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header dan Filter */}
        <div className="mx-auto w-full mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Log Aktivitas Device
          </h3>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Input Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pesan log..."
                className="h-11 w-48 sm:w-64 rounded-lg border border-gray-200 bg-transparent pl-10 pr-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
              />
            </div>

            {/* Filter Topic */}
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-800 dark:text-white/90 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
            >
              <option value="">Semua Topic</option>
              {topics.map((t, i) => (
                <option key={i} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Tombol Hapus Berdasarkan Topic */}
            {topicFilter && (
              <button
                onClick={handleDeleteByTopic}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                <TrashIcon className="w-5 h-5" />
                Hapus Topic
              </button>
            )}

            {/* Tombol Hapus Terpilih */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                <TrashIcon className="w-5 h-5" />
                Hapus Terpilih ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Tabel dan Pagination */}
        <div className="mt-4">
          <LogTable
            data={logs}
            loading={loading}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
