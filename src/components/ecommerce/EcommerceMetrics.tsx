"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import useUserRole from "../../hooks/useUserRole";

import {
  ArchiveBoxArrowDownIcon,
  ServerStackIcon,
  MapIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function EcommerceMetrics() {
  const { role, loading } = useUserRole();

  // NOC
  const [totalBarang, setTotalBarang] = useState<number>(0);
  const [totalDevice, setTotalDevice] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);

  // ADMIN / USER
  const [applied, setApplied] = useState<number>(0);
  const [active, setActive] = useState<number>(0);
  const [rejected, setRejected] = useState<number>(0);

  useEffect(() => {
    if (loading) return;

    const fetchData = async () => {
      try {
        // ================================
        // ROLE: NOC
        // ================================
        if (role === "noc") {
          const { count: countBarang } = await supabase
            .from("Barang")
            .select("*", { count: "exact", head: true });

          const { count: countDevice } = await supabase
            .from("Device")
            .select("*", { count: "exact", head: true });

          const { count: countArea } = await supabase
            .from("Area")
            .select("*", { count: "exact", head: true });

          setTotalBarang(countBarang ?? 0);
          setTotalDevice(countDevice ?? 0);
          setTotalArea(countArea ?? 0);
        }

        // ================================
        // ROLE: ADMIN / USER
        // ================================
        if (role === "admin" || role === "user") {
          const { data, error } = await supabase
            .from("UserRegistration")
            .select("status");

          if (error) throw error;

          setApplied(data.filter((r) => r.status === "APPLIED").length);
          setActive(data.filter((r) => r.status === "ACTIVE").length);
          setRejected(data.filter((r) => r.status === "REJECTED").length);
        }
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      }
    };

    fetchData();
  }, [role, loading]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {/* ============================= NOC VIEW ============================= */}
      {role === "noc" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          <Card
            icon={ArchiveBoxArrowDownIcon}
            title="Jumlah Barang"
            value={totalBarang}
            suffix="item"
            color="sky"
          />

          <Card
            icon={ServerStackIcon}
            title="Device Aktif"
            value={totalDevice}
            suffix="device"
            color="emerald"
          />

          <Card
            icon={MapIcon}
            title="Total Area"
            value={totalArea}
            suffix="lokasi"
            color="orange"
          />
        </div>
      )}

      {/* ========================= ADMIN / USER VIEW ========================= */}
      {(role === "admin" || role === "user") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          <Card
            icon={UserGroupIcon}
            title="Total Applied"
            value={applied}
            suffix="user"
            color="blue"
          />

          <Card
            icon={UserGroupIcon}
            title="Active User"
            value={active}
            suffix="user"
            color="green"
          />

          <Card
            icon={UserGroupIcon}
            title="Rejected"
            value={rejected}
            suffix="user"
            color="red"
          />
        </div>
      )}
    </>
  );
}

/* ===================================================== */
/*     CARD COMPONENT (GRADIENT FIXED)                   */
/* ===================================================== */
interface CardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: number;
  suffix: string;
  color: "sky" | "emerald" | "orange" | "blue" | "green" | "red";
}

function Card({ icon: Icon, title, value, suffix, color }: CardProps) {
  const colorMap = {
    sky: {
      bg: "bg-sky-100",
      gradient: "dark:bg-gradient-to-br dark:from-sky-900 dark:to-gray-900",
      icon: "text-sky-700",
    },
    emerald: {
      bg: "bg-emerald-100",
      gradient: "dark:bg-gradient-to-br dark:from-emerald-900 dark:to-gray-900",
      icon: "text-emerald-700",
    },
    orange: {
      bg: "bg-orange-100",
      gradient: "dark:bg-gradient-to-br dark:from-orange-900 dark:to-gray-900",
      icon: "text-orange-700",
    },
    // ADMIN / USER COLORS
    blue: {
      bg: "bg-blue-100",
      gradient: "dark:bg-gradient-to-br dark:from-blue-900 dark:to-gray-900",
      icon: "text-blue-700",
    },
    green: {
      bg: "bg-green-100",
      gradient: "dark:bg-gradient-to-br dark:from-green-900 dark:to-gray-900",
      icon: "text-green-700",
    },
    red: {
      bg: "bg-red-100",
      gradient: "dark:bg-gradient-to-br dark:from-red-900 dark:to-gray-900",
      icon: "text-red-700",
    },
  };

  const styles = colorMap[color];

  return (
    <div
      className={`group flex items-center gap-4 rounded-2xl border border-gray-200 
        bg-white p-5 shadow-sm transition-all hover:shadow-md 
        dark:border-gray-700 ${styles.gradient} md:p-6`}
    >
      <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${styles.bg} dark:bg-white/10`}>
        <Icon className={`w-8 h-8 ${styles.icon} dark:text-white`} />
      </div>

      <div>
        <span className="text-sm text-gray-500 dark:text-gray-300">{title}</span>
        <h4 className="mt-1 font-bold text-gray-800 dark:text-white text-3xl">
          {value.toLocaleString()}
          <small className="ml-1 text-sm text-gray-500">{suffix}</small>
        </h4>
      </div>
    </div>
  );
}

