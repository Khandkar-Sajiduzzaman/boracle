export const dynamic = "force-dynamic";

import GradesheetAnalyzer from "@/components/gradesheet/GradesheetAnalyzer";

export const metadata = {
  title: "Gradesheet Analyzer | Boracle",
  description:
    "Upload your BRACU grade sheet PDF to analyze your CGPA and plan course retakes. 100% client-side — your data never leaves your device.",
};

export default function GradesheetPage() {
  return <GradesheetAnalyzer allowSave={false} />;
}
