import {
  ExclamationTriangleIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function CardSummary({ total, offline, solved }: any) {
  type CardColor = "yellow" | "red" | "emerald";

  const colors = {
    yellow: {
      light: "from-yellow-700 via-yellow-400 to-yellow-100 border-yellow-100",
      dark: "dark:from-yellow-400/20 dark:via-yellow-500/10 dark:to-yellow-500/0 dark:border-yellow-900",
    },
    red: {
      light: "from-red-700 via-red-400 to-red-100 border-red-100",
      dark: "dark:from-red-400/20 dark:via-red-500/10 dark:to-red-500/0 dark:border-red-400/50",
    },
    emerald: {
      light:
        "from-emerald-700 via-emerald-400 to-emerald-100 border-emerald-100",
      dark: "dark:from-emerald-400/20 dark:via-emerald-500/10 dark:to-emerald-500/0 dark:border-emerald-400/50",
    },
  } as const;

  const cards: {
    title: string;
    value: number;
    color: CardColor;
    icon: React.ReactNode;
  }[] = [
    {
      title: "Total Gangguan",
      value: total,
      color: "yellow",
      icon: (
        <ExclamationTriangleIcon className="h-7 w-7 text-yellow-200 dark:text-yellow-400" />
      ),
    },
    {
      title: "Offline",
      value: offline,
      color: "red",
      icon: <NoSymbolIcon className="h-7 w-7 text-red-200 dark:text-red-400" />,
    },
    {
      title: "Solved",
      value: solved,
      color: "emerald",
      icon: (
        <CheckCircleIcon className="h-7 w-7 text-emerald-200 dark:text-emerald-400" />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {cards.map((c) => (
        <div
          key={c.title}
          className={`
    group rounded-2xl border backdrop-blur-md p-5 bg-gradient-to-br
    ${colors[c.color].light}
    ${colors[c.color].dark}
    transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1
  `}>
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center 
              rounded-xl bg-white/10 dark:bg-white/5 
              border border-white/40 dark:border-white/10 
              shadow-sm group-hover:scale-110 transition">
              {c.icon}
            </div>

            <div>
              <p className="text-sm text-gray-100 dark:text-gray-400">
                {c.title}
              </p>
              <p className="text-3xl font-semibold text-white">
                {c.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
