export default function SummaryCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "gray" | "green" | "red" | "blue";
}) {
  const map = {
    gray: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
    green: "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700",
    red: "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700",
    blue: "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700",
  };
  return (
    <div className={`p-5 rounded-xl border ${map[color]} shadow-sm`}>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
