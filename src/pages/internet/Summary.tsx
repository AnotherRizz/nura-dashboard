"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FilterBar from "../../components/summary/FilterBar";
import SummaryChart from "../../components/summary/SummaryChart";
import * as XLSX from "xlsx";
import SummaryTable from "../../components/summary/SummaryTable";
import Pagination from "../../components/summary/Pagination";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface DeviceSummary {
  id: number;
  deviceid: number;
  interfaceid?: number;
  period: string;
  avgcpu: number;
  avgmem: number;
  avgrx: number;
  avgtx: number;
  maxcpu: number;
  maxmem: number;
  nama?: string;
}

interface Device {
  id: number;
  nama: string;
}

export default function Summary() {
  const [data, setData] = useState<DeviceSummary[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedInterface, setSelectedInterface] = useState<string>("");
  const [dateRange, setDateRange] = useState<Date[]>([]);
 const [, setActiveFilter] = useState<"week" | "month" | "">("month");

  const [search] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
  const [activeYear, setActiveYear] = useState<number>(
    new Date().getFullYear()
  );

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchDevices();
    filterPreset(new Date().getMonth(), new Date().getFullYear()); // set default bulan & tahun ini
  }, []);

  useEffect(() => {
    if (selectedDevice) fetchInterfaces(selectedDevice);
  }, [selectedDevice]);

  // Auto refresh summary when filter/search changes
  useEffect(() => {
    if (selectedDevice && dateRange.length === 2) {
      fetchSummary();
    }
  }, [selectedDevice, selectedInterface, dateRange, search]);

  async function fetchDevices() {
    const { data, error } = await supabase.from("Device").select("id, nama");
    if (!error && data) setDevices(data);
  }

  async function fetchInterfaces(deviceId: string) {
    const { data, error } = await supabase
      .from("DeviceInterface")
      .select("id, name")
      .eq("deviceid", Number(deviceId));

    if (!error && data) setInterfaces(data);
  }

  async function fetchSummary() {
    setLoading(true);

    let query = supabase
      .from("DeviceMetricSummary")
      .select(
        `
        *,
        device:Device!DeviceMetricSummary_deviceid_fkey(nama)
      `
      )
      .eq("deviceid", Number(selectedDevice))
      .order("period", { ascending: true });

    if (selectedInterface)
      query = query.eq("interfaceid", Number(selectedInterface));

    if (dateRange.length === 2) {
      query = query
        .gte("period", dateRange[0].toISOString())
        .lte("period", dateRange[1].toISOString());
    }

    const { data: result, error } = await query;
    if (!error && result) {
      let mapped = result.map((d: any) => ({
        ...d,
        nama: d.device?.nama || `Device ${d.deviceid}`,
      }));

      // local search
      if (search.trim()) {
        const keyword = search.toLowerCase();
        mapped = mapped.filter(
          (d: any) =>
            d.nama.toLowerCase().includes(keyword) ||
            String(d.interfaceid || "").includes(keyword)
        );
      }

      setData(mapped);
    }

    setLoading(false);
  }

  function filterPreset(month: number, year: number) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0); // akhir bulan
    end.setHours(23, 59, 59, 999);

    setActiveMonth(month);
    setActiveYear(year);
    setDateRange([start, end]);
  }

  function handleResetFilter() {
  setSelectedDevice("");
  setSelectedInterface("");
  setData([]);
  setActiveFilter("");

  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  setActiveMonth(month);
  setActiveYear(year);

  // atur ulang dateRange ke bulan & tahun ini
  filterPreset(month, year);
}


 function handleExportExcel() {
  if (!data.length) return;

  const deviceName = data[0].nama?.replace(/\s+/g, "") || "Device";

  // Ambil nama interface (kalau ada)
  const interfaceName =
    selectedInterface && interfaces.length
      ? interfaces.find((i) => i.id === Number(selectedInterface))?.name?.replace(/\s+/g, "") || `Interface${selectedInterface}`
      : "SemuaInterface";

  // Ambil nama bulan dan tahun dari filter aktif
  const monthName = new Date(activeYear, activeMonth)
    .toLocaleString("id-ID", { month: "long" });
  const yearStr = activeYear.toString();

  // Nama file gabungan
  const fileName = `${deviceName}_${interfaceName}_${monthName}_${yearStr}.xlsx`;

  // Siapkan worksheet
  const worksheet = XLSX.utils.json_to_sheet(
  data.map((d) => ({
    Tanggal: new Date(d.period).toLocaleDateString("id-ID"),
    Device: d.nama,
    Interface:
      interfaces.find((i) => Number(i.id) === Number(d.interfaceid))?.name ||
      d.interfaceid ||
      "-",
    "Avg CPU (%)": d.avgcpu.toFixed(2),
    "Avg Mem (%)": d.avgmem.toFixed(2),
    "Avg RX (MB)": (d.avgrx / 1024 / 1024).toFixed(2),
    "Avg TX (MB)": (d.avgtx / 1024 / 1024).toFixed(2),
  }))
);


  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
  XLSX.writeFile(workbook, fileName);
}


  function getFilterText() {
  if (!selectedDevice) return "";

  const deviceName =
    devices.find((d) => d.id === Number(selectedDevice))?.nama ||
    `Device ${selectedDevice}`;

  // ambil nama interface jika ada yang dipilih
  const interfaceName =
    selectedInterface && interfaces.length
      ? interfaces.find((i) => i.id === Number(selectedInterface))?.name || `Interface ${selectedInterface}`
      : "Semua Interface";

  if (dateRange.length === 2) {
    const start = dateRange[0].toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const end = dateRange[1].toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return `Menampilkan data ${deviceName}  (${interfaceName}) dari ${start} hingga ${end}`;
  }

  return `Menampilkan data ${deviceName} (${interfaceName})`;
}


  return (
    <div>
      <PageMeta
        title="Summary Device"
        description="Ringkasan performa perangkat"
      />
      <PageBreadcrumb pageTitle="Device Summary" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-sm dark:border-gray-800 dark:bg-gray-900 xl:px-10 xl:py-12">
        <FilterBar
          devices={devices}
          interfaces={interfaces}
          selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice}
          selectedInterface={selectedInterface}
          setSelectedInterface={setSelectedInterface}
          handleResetFilter={handleResetFilter}
          handleExportExcel={handleExportExcel}
          filterPreset={filterPreset}
          activeMonth={activeMonth}
          activeYear={activeYear}
        />

        {selectedDevice && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-5 text-center">
            <ChartBarIcon className="inline-block mr-1 w-5 h-5" />{" "}
            {getFilterText()}
          </p>
        )}

        {!selectedDevice ? (
          <p className="text-center text-gray-500 mt-10">
            Silakan pilih device terlebih dahulu.
          </p>
        ) : loading ? (
          <p className="text-center text-gray-500 mt-10">Memuat data...</p>
        ) : data.length > 0 ? (
          <>
            <SummaryChart data={data} />
            <SummaryTable data={paginatedData} loading={loading} />
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            Tidak ada data summary untuk periode ini.
          </p>
        )}
      </div>
    </div>
  );
}
