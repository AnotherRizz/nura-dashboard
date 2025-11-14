import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface FilterBarProps {
  devices: { id: number; nama: string }[];
  interfaces: { id: number; name: string }[];
  selectedDevice: string;
  setSelectedDevice: (val: string) => void;
  selectedInterface: string;
  setSelectedInterface: (val: string) => void;
  handleResetFilter: () => void;
  handleExportExcel: () => void;
  filterPreset: (month: number, year: number) => void;
  activeMonth: number;
  activeYear: number;
}

export default function FilterBar({
  devices,
  interfaces,
  selectedDevice,
  setSelectedDevice,
  selectedInterface,
  setSelectedInterface,
  handleResetFilter,
  handleExportExcel,
  filterPreset,
  activeMonth,
  activeYear,
}: FilterBarProps) {
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(0, i).toLocaleString("id-ID", { month: "long" }),
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Dropdown Device */}
        <select
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          <option value="">Pilih Device</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama || `Device ${d.id}`}
            </option>
          ))}
        </select>

        {/* Dropdown Interface */}
        <select
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
          value={selectedInterface}
          onChange={(e) => setSelectedInterface(e.target.value)}
          disabled={!selectedDevice}
        >
          <option value="">Semua Interface</option>
          {interfaces.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name || `Interface ${i.id}`}
            </option>
          ))}
        </select>

        {/* Dropdown Bulan */}
        <select
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
          value={activeMonth}
          onChange={(e) => filterPreset(Number(e.target.value), activeYear)}
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Dropdown Tahun */}
        <select
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
          value={activeYear}
          onChange={(e) => filterPreset(activeMonth, Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Tombol Reset */}
        <button
          onClick={handleResetFilter}
          className="px-4 py-2 rounded-lg bg-gray-500 text-white text-sm hover:bg-gray-600 transition"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={handleExportExcel}
        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition"
      >
        Export Excel
      </button>
    </div>
  );
}
