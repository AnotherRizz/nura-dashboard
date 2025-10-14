import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import useUserRole from "../hooks/useUserRole";

const LayoutContent: React.FC<{ role: string | null }> = ({ role }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar + backdrop */}
      <div>
        <AppSidebar role={role} /> {/* ✅ role dikirim ke sidebar */}
        <Backdrop />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { role, loading } = useUserRole(); // ✅ dipindah ke sini

  // 🌀 Fullscreen loading saat role belum didapat
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-sm font-medium">Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <LayoutContent role={role} /> {/* ✅ kirim role ke layout */}
    </SidebarProvider>
  );
};

export default AppLayout;
