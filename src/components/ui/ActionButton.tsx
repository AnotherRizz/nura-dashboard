import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  title: string;
  color?: "brand" | "green" | "red"| "orange"; // variasi warna
  children: React.ReactNode; // icon / isi tombol
}

export default function ActionButton({
  onClick,
  title,
  color = "brand",
  children,
}: ActionButtonProps) {
  const colorClasses = {
    brand: "text-brand-600 hover:text-brand-800",
    green: "text-green-600 hover:text-green-800",
    red: "text-red-600 hover:text-red-800",
    orange: "text-orange-600 hover:text-orange-800",
  };

  return (
    <button
     type="button"
      onClick={onClick}
      className={`${colorClasses[color]} p-1`}
      title={title}
    >
      {children}
    </button>
  );
}
