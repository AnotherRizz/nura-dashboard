import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import RecentLogs from "../../components/ecommerce/RecentLogs";
import GangguanChart from "../../components/charts/GangguanChart";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard Nura-App"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 ">
          <EcommerceMetrics />

        </div>
        <div className="col-span-12 xl:col-span-7">
          <GangguanChart/>
        </div> 
        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentLogs />
        </div>
      </div>
    </>
  );
}
