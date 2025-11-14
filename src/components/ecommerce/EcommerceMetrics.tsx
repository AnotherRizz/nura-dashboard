"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import {
  ArchiveBoxArrowDownIcon,
  ServerStackIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

export default function EcommerceMetrics() {
  const [totalBarang, setTotalBarang] = useState<number>(0);
  const [totalDevice, setTotalDevice] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: countBarang, error: barangError } = await supabase
          .from("Barang")
          .select("*", { count: "exact", head: true });
        if (barangError) throw barangError;

        const { count: countDevice, error: deviceError } = await supabase
          .from("Device")
          .select("*", { count: "exact", head: true });
        if (deviceError) throw deviceError;

        const { count: countArea, error: areaError } = await supabase
          .from("Area")
          .select("*", { count: "exact", head: true });
        if (areaError) throw areaError;

        setTotalBarang(countBarang || 0);
        setTotalDevice(countDevice || 0);
        setTotalArea(countArea || 0);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* ================= BARANG ================= */}
      <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gradient-to-br dark:from-sky-900 dark:to-gray-900 md:p-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-sky-100 dark:bg-sky-800/40">
          <ArchiveBoxArrowDownIcon className="w-8 h-8 text-sky-700 dark:text-white" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-sky-200/90">
            Jumlah Barang
          </span>
          <h4 className="mt-1 font-bold text-gray-800 dark:text-white text-3xl">
            {totalBarang.toLocaleString()}
            <small className="ml-1 text-sm text-gray-500 dark:text-sky-200/70">
              item
            </small>
          </h4>
        </div>
      </div>

      {/* ================= DEVICE ================= */}
      <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gradient-to-br dark:from-emerald-900 dark:to-gray-900 md:p-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-800/40">
          <ServerStackIcon className="w-8 h-8 text-emerald-700 dark:text-white" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-emerald-200/90">
            Device Aktif
          </span>
          <h4 className="mt-1 font-bold text-gray-800 dark:text-white text-3xl">
            {totalDevice.toLocaleString()}
            <small className="ml-1 text-sm text-gray-500 dark:text-emerald-200/70">
              device
            </small>
          </h4>
        </div>
      </div>

      {/* ================= AREA ================= */}
      <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gradient-to-br dark:from-orange-900 dark:to-gray-900 md:p-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-800/40">
          <MapIcon className="w-8 h-8 text-orange-700 dark:text-white" />
        </div>
        <div>
          <span className="text-sm text-gray-500 dark:text-orange-200/90">
            Total Area
          </span>
          <h4 className="mt-1 font-bold text-gray-800 dark:text-white text-3xl">
            {totalArea.toLocaleString()}
            <small className="ml-1 text-sm text-gray-500 dark:text-orange-200/70">
              lokasi
            </small>
          </h4>
        </div>
      </div>
    </div>
  );
}
