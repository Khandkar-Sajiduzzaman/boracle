export const dynamic = "force-dynamic";

import GradesheetAnalyzer from "@/components/gradesheet/GradesheetAnalyzer";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Gradesheet Analyzer | Boracle",
  description:
    "Upload your BRACU grade sheet PDF to analyze your CGPA and plan course retakes. 100% client-side — your data never leaves your device.",
};

export default async function GradesheetPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard/gradesheet");
  }

  return <GradesheetAnalyzer allowSave={true} />;
}
