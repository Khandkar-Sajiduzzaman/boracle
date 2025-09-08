//API for deleting swap - admin only
import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  // Check if the user is authenticated and has admin role
  const session = await auth();

  console.log("Admin Users API accessed by:", session);
  console.log("User role:", session?.user?.userrole);
  if (!session || session.user?.userrole !== "admin") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
    );
  }

  const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Swap ID is required" },
        { status: 400 }
      );
    }

    // First check if swap exists
    const existingSwap = await sql`
      SELECT uemail FROM CourseSwap WHERE swapID = ${id}
    `;
    if (existingSwap.length === 0) {
      return NextResponse.json(
        { error: "Swap not found" },
        { status: 404 }
      );
    }
    // Delete the swap
    const result = await sql`
      DELETE FROM CourseSwap
      WHERE swapID = ${id}
      RETURNING swapID
    `;
    return NextResponse.json({
      success: true,
      message: "Swap deleted successfully",
        deletedSwapId: result[0].swapid
    });
}