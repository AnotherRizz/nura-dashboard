"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { PurchaseOrderPDF } from "../../services/purchaseOrderPdf";
import type { PurchaseOrderPDFProps } from "../../services/purchaseOrderPdf";

interface Props extends PurchaseOrderPDFProps {
  onClose: () => void;
}

export default function PurchaseOrderPreview({
  onClose,
  ...props
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-5xl h-[90%] rounded shadow-lg relative">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="font-semibold text-sm">
            Preview Purchase Order
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded"
          >
            Tutup
          </button>
        </div>

        {/* PDF */}
        <PDFViewer
          width="100%"
          height="100%"
          style={{ border: "none" }}
        >
          <PurchaseOrderPDF {...props} />
        </PDFViewer>
      </div>
    </div>
  );
}
