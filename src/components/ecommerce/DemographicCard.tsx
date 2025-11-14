"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import CountryMap from "./CountryMap";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { BoltIcon } from "@heroicons/react/24/outline";

interface Area {
  id: number;
  nama_area: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  useEffect(() => {
    const fetchAreas = async () => {
      const { data, error } = await supabase.from("Area").select("*");
      if (error) console.error("Gagal mengambil area:", error);
      else setAreas(data || []);
    };
    fetchAreas();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Area Map Overview
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Lokasi area berdasarkan koordinat
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Map */}
      <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800 sm:px-6">
        <div
          id="mapOne"
          className="mapOne -mx-4 -my-6 h-[212px] w-[252px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap areas={areas} />
        </div>
      </div>

      {/* Daftar Area */}
      <div className="space-y-5">
        {areas.map((area) => (
          <div key={area.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <BoltIcon className="w-8 h-8 text-sky-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {area.nama_area}
                </p>
                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                  Radius {area.radius} m
                </span>
              </div>
            </div>

            <div className="flex w-full max-w-[140px] items-center gap-3">
              <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-sky-500 text-xs font-medium text-white"
                  style={{ width: `${Math.min(area.radius, 100)}%` }}
                ></div>
              </div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {area.radius}m
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
