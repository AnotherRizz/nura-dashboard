"use client";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "../../services/supabaseClient";
import { exportCSV } from "../../services/exportCSV";
import { exportPDF } from "../../services/exportPDF";
import CardSummary from "../../components/trouble/CardSummary";
import FilterBar from "../../components/trouble/FilterBar";
import TroubleTable from "../../components/trouble/TroubleTable";
import SidebarDetail from "../../components/trouble/SidebarDetail";
import { format, toZonedTime } from "date-fns-tz";
import ExportPreviewModal from "../../components/trouble/ExportPreviewModal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export interface Device {
  nama?: string;
  ip?: string;
}

export interface DeviceStatusLog {
  id: string;
  deviceid: string;
  status: "online" | "offline" | "solved" | "gangguan";
  note?: string;
  duration?: string;
  interface?: string;
  starttime?: string;
  endtime?: string;
  createdat: string;
  device?: Device;
}

function formatToWIB(dateString: string | null | undefined) {
  if (!dateString) return "-";
  try {
    const utcDate = new Date(dateString);
    const wibDate = toZonedTime(utcDate, "Asia/Jakarta");
    return format(wibDate, "dd/MM/yyyy, HH:mm");
  } catch (err) {
    console.error("❌ formatToWIB error:", err, dateString);
    return "-";
  }
}

export default function TroubleDevice() {
  const [logs, setLogs] = useState<DeviceStatusLog[]>([]);
  const [filtered, setFiltered] = useState<DeviceStatusLog[]>([]);
  const [monthFilter, setMonthFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");
  const [interfaceFilter, setInterfaceFilter] = useState("All");
  const [devices, setDevices] = useState<string[]>([]);
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<DeviceStatusLog | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exportType, setExportType] = useState<"csv" | "pdf" | null>(null);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("DeviceStatusLog")
        .select("*, device:Device!DeviceStatusLog_deviceid_fkey(nama, ip)")
        .order("createdat", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((log) => ({
        ...log,
        starttime: formatToWIB(log.starttime),
        endtime: formatToWIB(log.endtime),
        createdat: formatToWIB(log.createdat),
      }));

      setLogs(formatted);
      setFiltered(formatted);

      const uniqueInterfaces = Array.from(
        new Set((formatted || []).map((l) => l.interface).filter(Boolean))
      ) as string[];
      setInterfaces(uniqueInterfaces);

      const uniqueDevices = Array.from(
        new Set((formatted || []).map((l) => l.device?.nama).filter(Boolean))
      ) as string[];
      setDevices(uniqueDevices);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 🔄 Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("device-status-log-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "DeviceStatusLog" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newLog = payload.new as DeviceStatusLog;
            const { data: dev } = await supabase
              .from("Device")
              .select("nama, ip")
              .eq("id", newLog.deviceid)
              .single();
            newLog.device = dev || {};
            newLog.starttime = formatToWIB(newLog.starttime);
            newLog.endtime = formatToWIB(newLog.endtime);
            newLog.createdat = formatToWIB(newLog.createdat);
            setLogs((prev) => [newLog, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as DeviceStatusLog;
            updated.starttime = formatToWIB(updated.starttime);
            updated.endtime = formatToWIB(updated.endtime);
            updated.createdat = formatToWIB(updated.createdat);
            setLogs((prev) =>
              prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
            );
          }
          if (payload.eventType === "DELETE") {
            setLogs((prev) => prev.filter((l) => l.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🔍 Filtering
  useEffect(() => {
    let data = [...logs];

    if (monthFilter !== "All") {
      data = data.filter((l) => {
        const d = new Date(
          l.createdat.split(",")[0].split("/").reverse().join("-")
        );
        return d.getMonth() + 1 === Number(monthFilter);
      });
    }

    if (yearFilter !== "All") {
      data = data.filter((l) => {
        const d = new Date(
          l.createdat.split(",")[0].split("/").reverse().join("-")
        );
        return d.getFullYear() === Number(yearFilter);
      });
    }

    if (deviceFilter !== "All")
      data = data.filter((l) => l.device?.nama === deviceFilter);

    if (interfaceFilter !== "All")
      data = data.filter((l) => l.interface === interfaceFilter);

    if (search.trim()) {
      data = data.filter((l) =>
        l.device?.nama?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [monthFilter, yearFilter, deviceFilter, interfaceFilter, search, logs]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedLogs = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReset = () => {
    setMonthFilter("All");
    setYearFilter("All");
    setDeviceFilter("All");
    setInterfaceFilter("All");
    setSearch("");
  };
  const handlePreview = (type: "csv" | "pdf") => {
    setExportType(type);
    setShowPreview(true);
  };

  const handleConfirmExport = () => {
    if (exportType === "csv") exportCSV(filtered);
    else if (exportType === "pdf") exportPDF(filtered);
    setShowPreview(false);
  };

  const total = logs.length;
  const totalOffline = logs.filter((l) => l.status === "offline").length;
  const totalSolved = logs.filter((l) => l.status === "solved").length;

  return (
    <>
     <PageMeta
        title="Trouble Device"
        description="Ringkasan performa perangkat"
      />
      <PageBreadcrumb pageTitle="Device Trouble" />
    <div className="relative p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 transition-all">
      <AnimatePresence>
        {selectedLog && (
          <SidebarDetail
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
        {showPreview && (
          <ExportPreviewModal
            open={showPreview}
            onClose={() => setShowPreview(false)}
            onConfirm={handleConfirmExport}
            data={filtered}
          />
        )}
      </AnimatePresence>

      <CardSummary total={total} offline={totalOffline} solved={totalSolved} />
      <FilterBar
        search={search}
        setSearch={setSearch}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        deviceFilter={deviceFilter}
        setDeviceFilter={setDeviceFilter}
        devices={devices}
        interfaceFilter={interfaceFilter}
        setInterfaceFilter={setInterfaceFilter}
        interfaces={interfaces}
        onExportCSV={() => handlePreview("csv")}
        onExportPDF={() => handlePreview("pdf")}
        onReset={handleReset}
      />
      <TroubleTable
        loading={loading}
        paginatedLogs={paginatedLogs}
        setSelectedLog={setSelectedLog}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
      <AnimatePresence>
        {selectedLog && (
          <SidebarDetail
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
