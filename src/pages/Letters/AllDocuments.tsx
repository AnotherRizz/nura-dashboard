"use client";

import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ExportTabs from "./export/components/ExportTabs";
import TabBarang from "./export//components/TabBarang";
import { TabType } from "./export/types";
import TabBarangMasuk from "./export/components/TabBarangMasuk";

export default function AllDocuments() {
  const [activeTab, setActiveTab] = useState<TabType>("barang");

  return (
    <div>
      <PageMeta title="Export Data" description="Export Semua Dokumen" />
      <PageBreadcrumb pageTitle="Export Data" />

      <div className="rounded-2xl border dark:border-slate-700 bg-white dark:bg-white/[0.03] p-6">
        <ExportTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "barang" && <TabBarang />}
        {activeTab === "masuk" && <TabBarangMasuk />}

        {activeTab === "keluar" && (
          <div className="text-center py-16 text-gray-400">
            Modul ini akan segera tersedia
          </div>
        )}
      </div>
    </div>
  );
}
