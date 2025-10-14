interface NotificationModalProps {
  show: boolean;
  type?: "success" | "error";
  message: string;
  onClose: () => void; // fungsi ini bisa berisi navigate() dari luar
}

export default function NotificationModal({
  show,
  type = "success",
  message,
  onClose,
}: NotificationModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div
        className={`rounded-lg shadow-lg px-6 py-16 w-[500px] text-center ${
          type === "success"
            ? "bg-white dark:bg-gray-700 text-gray-800 font-bold text-2xl"
            : "bg-white text-red-700 font-bold text-2xl"
        }`}
      >
        <p className="font-medium whitespace-pre-line">{message}</p>
        <button
          onClick={onClose}
          className="mt-3 bg-blue-600 text-white px-4 py-1 rounded-xl hover:bg-blue-700 text-xl"
        >
          Oke
        </button>
      </div>
    </div>
  );
}
