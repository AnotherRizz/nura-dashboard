"use client";

import { TabType } from "../types";

interface ExportTabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function ExportTabs({
  activeTab,
  onChange,
}: ExportTabsProps) {
  const tabs = [
    { key: "barang", label: "Barang" },
    { key: "masuk", label: "Barang Masuk" },
    { key: "keluar", label: "Barang Keluar" },
  ];

  return (
    <div className="flex gap-2 border-b dark:border-slate-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
     
          onClick={() => onChange(tab.key as TabType)}
          className={`px-4 py-2 rounded-t-xl text-sm font-medium
            ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
