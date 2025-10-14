import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { HomeModernIcon } from "@heroicons/react/24/outline";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4">
                 <div className="flex items-center">
                <HomeModernIcon className="w-18 h-18 text-blue-600 dark:text-blue-400" />
                <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent ml-2">
                  Nura App
                </h1>
              </div>
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
                Senang melihatmu kembali!
                <br />Silakan masuk untuk melanjutkan petualangan Anda.
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
