import { useState } from "react";
import { Download } from "lucide-react";
import { Dropdown } from "@/components/Dropdown";
import { DropdownItem } from "@/components/DropdownItem";

import {
  exportAllPDF,
  exportFilteredPDF,
} from "../../utils/exportStokInPDF";

export default function ExportDropdown({ data, search, month, year }) {
  const [isOpen, setIsOpen] = useState(false);

  const filterLabel = `${year || "all-year"}-${month || "all-month"}-${
    search || "no-search"
  }`;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        className="dropdown-toggle bg-green-600 text-white rounded-xl px-5 py-2 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download size={16} />
        Export PDF
      </button>

      {/* Dropdown */}
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DropdownItem
          onClick={() => {
            exportAllPDF(data);
            setIsOpen(false);
          }}
        >
          Export Semua Data
        </DropdownItem>

        <DropdownItem
          onClick={() => {
            exportFilteredPDF(data, filterLabel);
            setIsOpen(false);
          }}
        >
          Export Berdasarkan Filter
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
