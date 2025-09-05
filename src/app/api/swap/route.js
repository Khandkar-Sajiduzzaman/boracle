// app/api/routine/route.js (App Router)
import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get authenticated user session
    const session = await auth();
    console.log("Routine List API accessed by:", session?.user?.email);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );

    }

   // fetch all course swap information 

    let swapRequest = await sql`SELECT * FROM CourseSwap`
    return NextResponse.json(swapRequest[0],{status:200});
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
