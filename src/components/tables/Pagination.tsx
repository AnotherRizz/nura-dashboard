import Button from "../ui/button/Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-end items-center mt-6 gap-1">
      {/* Tombol Prev */}
      <Button
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="p-2 rounded-md !bg-gray-100 dark:!bg-gray-700 dark:!text-gray-200 !text-gray-600 hover:!bg-gray-200 disabled:opacity-50 flex items-center justify-center">
        Prev
      </Button>

      {/* Nomor Halaman */}
      {getPageNumbers().map((num, idx) =>
        typeof num === "number" ? (
          <Button
            size="sm"
            onClick={() => onPageChange(num)}
            className={`h-8 w-8 rounded-md text-sm flex items-center justify-center
    ${
      num === page
        ? "!bg-brand-600 !text-white"
        : "!bg-white dark:!bg-gray-700 dark:!text-gray-200 !text-gray-700 !border !border-gray-400 hover:!bg-gray-100"
    }`}>
            {num}
          </Button>
        ) : (
          <span key={idx} className="px-2 py-1 !text-gray-400 text-sm">
            {num}
          </span>
        )
      )}

      {/* Tombol Next */}
      <Button
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="px-4 py-1 rounded-md dark:!bg-gray-700 dark:!text-gray-200 !bg-gray-100 !text-gray-600 hover:!bg-gray-200 disabled:opacity-50 flex items-center justify-center">
        Next
      </Button>
    </div>
  );
}
