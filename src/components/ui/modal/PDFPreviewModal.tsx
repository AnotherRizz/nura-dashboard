import Button from "../button/Button";

export default function PDFPreviewModal({ open, onClose, blob, onDownload }:any ){
  if (!open) return null;

  const url = URL.createObjectURL(blob);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
      <div className="bg-white rounded-xl w-[80%] h-[85%] p-4 shadow-xl">
        <h2 className="font-semibold text-xl mb-4">Preview PDF</h2>

        <iframe
          src={url}
          className="w-full h-[75%] border rounded"
          title="Preview"
        />

        <div className="flex justify-end mt-4 gap-2">
          <Button className="!bg-gray-600 text-white" onClick={onClose}>
            Tutup
          </Button>
          <Button className="!bg-blue-600 text-white" onClick={onDownload}>
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
