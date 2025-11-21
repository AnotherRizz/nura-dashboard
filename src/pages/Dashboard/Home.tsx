import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import RecentLogs from "../../components/ecommerce/RecentLogs";
import GangguanChart from "../../components/charts/GangguanChart";
import useUserRole from "../../hooks/useUserRole";

export default function Home() {
  const { role, loading } = useUserRole();

  if (loading) {
    return <div className="p-6 w-full z-[9999] min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <p className="text-3  xl text-gray-700 dark:text-white">Loading...</p>
    </div>;
  }

  // Jika tidak login
  if (!role) {
    return <div className="p-6 text-red-500">Anda belum login.</div>;
  }

  return (
    <>
      <PageMeta
        title="Dashboard Nura-App"
        description="Dashboard role-based rendering"
      />

      {role === "noc" && (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 ">
            <EcommerceMetrics />
          </div>

          <div className="col-span-12 xl:col-span-7">
            <GangguanChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <DemographicCard />
          </div>

          <div className="col-span-12 xl:col-span-7">
            <RecentLogs />
          </div>
        </div>
      )}

      {role === "user" && (
        <div className="p-6 space-y-4">
           <div className="col-span-12 ">
            <EcommerceMetrics />
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Dashboard User</h2>
          <p>Selamat datang! Anda tidak memiliki akses ke menu admin/staff.</p>
        </div>
      )}
    </>
  );
}
