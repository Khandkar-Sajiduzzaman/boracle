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

    // Fetch all counts in parallel
    const [reviewCount, materialCount, swapCount, voteCount] = await Promise.all([
      // Count  reviews
      sql`SELECT COUNT(*) as count FROM reviews WHERE uEmail = ${userEmail}`,
      
      // Count materials
      sql`SELECT COUNT(*) as count FROM courseMaterials WHERE uEmail = ${userEmail}`,
      
      // Count swaps
      sql`SELECT COUNT(*) as count FROM courseSwap WHERE uEmail = ${userEmail}`,
      // Count votes
      sql`SELECT COUNT(*) as count FROM votes WHERE uEmail = ${userEmail}`
    ]);

    return Response.json({
      counts: {
        reviews: parseInt(reviewCount[0]?.count || 0),
        materials: parseInt(materialCount[0]?.count || 0),
        swaps: parseInt(swapCount[0]?.count || 0),
        votes: parseInt(voteCount[0]?.count || 0)
      }
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}