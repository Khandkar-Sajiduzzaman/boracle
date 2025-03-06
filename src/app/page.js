import Image from "next/image";
import SignIn from "../components/buttons/sign-in";
import SignOut from "../components/buttons/sign-out"; 
import { ModeToggle } from "@/components/light-toggle";
import FeatureCards from "@/components/homepage/feature-cards";
// get session
import { auth } from "@/auth"
export default async function Home() {
  const session = await auth()
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] dark:bg-slate-900">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-4xl font-bold text-center dark:text-blue-400 text-blue-900">
          BRACU O.R.A.C.L.E
        </h1>
        <h3 className="text-lg text-center">
          Euphoria for BRACU Students
        </h3>
        <FeatureCards />
        <SignIn />
        {session?.user ? <SignOut /> : null}
        
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <ModeToggle />
      </footer>
    </div>
  );
}
