import FeatureCards from "@/components/homepage/feature-cards";
import SignInOrDashboard from "@/components/homepage/signAndDashboard";
import Counts from "@/components/homepage/counts";
import ServiceStatus from "@/components/homepage/serviceStatus";
import FooterHome from "@/components/homepage/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)] dark:bg-slate-900">
      <main className="flex-1 flex flex-col gap-8 items-center justify-center p-8 sm:p-20">
        <h1 className="text-4xl font-bold text-center dark:text-blue-400 text-blue-900">
          BRACU O.R.A.C.L.E
        </h1>
        <h3 className="text-lg text-center">
          Euphoria for BRACU Students
        </h3>
        <SignInOrDashboard />
        <FeatureCards />
        <Counts />
        <ServiceStatus />
      </main>
      <FooterHome />
    </div>
  );
}