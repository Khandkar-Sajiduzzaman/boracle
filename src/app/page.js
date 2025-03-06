import Image from "next/image";
import SignIn from "./utils/sign-in";
import SignOut from "./utils/sign-out"; 

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <h1 className="text-4xl font-bold text-center text-red-500">
          BRACU O.R.A.C.L.E
        </h1>
        <h3 className="text-lg text-center">
          Euphoria for BRACU Students
        </h3>
        <SignIn />
        <SignOut />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
