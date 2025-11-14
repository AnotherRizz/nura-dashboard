import { ExclamationTriangleIcon, NoSymbolIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function CardSummary({ total, offline, solved }: any) {
  const cards = [
    { title: "Total Gangguan", value: total, color: "yellow", icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" /> },
    { title: "Offline", value: offline, color: "red", icon: <NoSymbolIcon className="h-6 w-6 text-red-500" /> },
    { title: "Solved", value: solved, color: "emerald", icon: <CheckCircleIcon className="h-6 w-6 text-emerald-500" /> },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {cards.map((c) => (
        <div key={c.title} className={`flex items-center gap-4 rounded-xl border p-5 shadow-sm hover:shadow-lg transition bg-${c.color}-100/30 border-${c.color}-300 dark:bg-${c.color}-800/30`}>
          <div className="flex h-12 w-12 items-center justify-center">{c.icon}</div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.title}</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
