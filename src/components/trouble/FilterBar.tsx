import { ArrowPathRoundedSquareIcon, FolderArrowDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function FilterBar({
  search, setSearch,
  monthFilter, setMonthFilter,
  yearFilter, setYearFilter,
  deviceFilter, setDeviceFilter,
  devices,
  interfaceFilter, setInterfaceFilter,
  interfaces,
  onExportCSV, onExportPDF, onReset
}: any) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { label: "Semua Bulan", value: "All" },
    { label: "Januari", value: "1" },
    { label: "Februari", value: "2" },
    { label: "Maret", value: "3" },
    { label: "April", value: "4" },
    { label: "Mei", value: "5" },
    { label: "Juni", value: "6" },
    { label: "Juli", value: "7" },
    { label: "Agustus", value: "8" },
    { label: "September", value: "9" },
    { label: "Oktober", value: "10" },
    { label: "November", value: "11" },
    { label: "Desember", value: "12" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-6 py-2 bg-gray-100/50 text-gray-500 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-800 rounded-md text-sm"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-6 py-2 bg-gray-100/50 text-gray-500 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-800 rounded-md text-sm"
        >
          <option value="All">Semua Tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="px-6 py-2 bg-gray-100/50 text-gray-500 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-800 rounded-md text-sm"
        >
          <option value="All">Semua Device</option>
          {devices.map((dev: string) => (
            <option key={dev} value={dev}>{dev}</option>
          ))}
        </select>

        <select
          value={interfaceFilter}
          onChange={(e) => setInterfaceFilter(e.target.value)}
          className="px-6 py-2 bg-gray-100/50 text-gray-500 dark:bg-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-800 rounded-md text-sm"
        >
          <option value="All">Semua Interface</option>
          {interfaces.map((iface: string) => (
            <option key={iface} value={iface}>{iface}</option>
          ))}
        </select>
          <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-white rounded-md text-sm hover:bg-gray-300 transition"
        >
          <ArrowPathRoundedSquareIcon className="h-4 w-4 text-gray-800 dark:text-white font-bold" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-40 py-2 bg-gray-100/70 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
          />
        </div>

      

        <button
          onClick={onExportCSV}
          className="px-4 py-2 flex gap-1 items-center bg-green-600 text-white rounded-md text-xs font-bold hover:bg-green-700 transition"
        ><FolderArrowDownIcon className="h-5 w-5 " />
           CSV
        </button>

        <button
          onClick={onExportPDF}
          className="px-4 py-2 flex gap-1 items-center bg-red-600 text-white rounded-md text-xs font-bold hover:bg-red-700 transition"
        ><FolderArrowDownIcon className="h-5 w-5 " />PDF
        </button>
      </div>
    </div>
  );
}
