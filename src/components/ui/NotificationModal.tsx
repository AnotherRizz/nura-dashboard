import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface NotificationModalProps {
  show: boolean;
  type?: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function NotificationModal({
  show,
  type = "success",
  message,
  onClose,
}: NotificationModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center transform transition-all scale-100 animate-slideUp">
        {/* Tombol close di pojok kanan atas */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <XMarkIcon className="w-8"/>
        </button>

        {/* Ikon status */}
        <div className="flex justify-center mb-4">
          {type === "success" ? (
            <CheckCircleIcon className="w-16 h-16 text-green-500 animate-pop" />
          ) : (
            <XCircleIcon className="w-16 h-16 text-red-500 animate-pop" />
          )}
        </div>

        {/* Pesan */}
        <p className="text-gray-800 dark:text-gray-100 text-lg font-medium whitespace-pre-line">
          {message}
        </p>

        {/* Tombol OK */}
        <button
          onClick={onClose}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold shadow-md transition-transform active:scale-95 ${
            type === "success"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Oke
        </button>
      </div>

      {/* Animasi sederhana */}
      <style >{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pop {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-pop {
          animation: pop 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
