// app/api/dashboard/route.js (App Router)
import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get authenticated user session
    const session = await auth();
    console.log("Dashboard API accessed by:", session?.user?.email);
    if (!session || !session.user?.email) {

          return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
    }

    const userEmail = 'alice.wong@g.bracu.ac.bd';

    // Fetch recent activities and post status from the tables reviews and courseMaterials
    const [recentReviews, recentMaterials] = await Promise.all([
      sql`SELECT * FROM reviews WHERE uEmail = ${userEmail} ORDER BY createdAt DESC LIMIT 5`,
      sql`SELECT * FROM courseMaterials WHERE uEmail = ${userEmail} ORDER BY createdAt DESC LIMIT 5`
    ]);

    return Response.json({
      recentActivities: {
        reviews: recentReviews,
        materials: recentMaterials
      }
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}