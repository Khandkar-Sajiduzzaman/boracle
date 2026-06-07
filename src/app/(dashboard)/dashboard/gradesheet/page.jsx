import { auth } from "@/auth";
import { db, eq } from "@/lib/db";
import { gradesheet } from "@/lib/db/schema";
import GradesheetAnalyzer from "@/components/gradesheet/GradesheetAnalyzer";

export default async function DashboardGradesheetPage() {
  const session = await auth();
  let savedData = null;

  if (session?.user?.email) {
    try {
      const result = await db
        .select()
        .from(gradesheet)
        .where(eq(gradesheet.email, session.user.email));

      if (result.length > 0) {
        savedData = {
          courses: JSON.parse(result[0].courses),
          lastParsedSemester: result[0].lastParsedSemester,
          targetDegreeCredits: result[0].targetDegreeCredits,
          targetCgpa: result[0].targetCgpa,
        };
      }
    } catch (err) {
      console.error("Error loading saved gradesheet:", err);
    }
  }

  return <GradesheetAnalyzer allowSave={true} savedData={savedData} />;
}
