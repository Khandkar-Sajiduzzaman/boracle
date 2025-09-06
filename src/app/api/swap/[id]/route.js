// app/api/routine/[id]/route.js (App Router)
import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    // Get authenticated user session
    const session = await auth();
    console.log("Swap DELETE API accessed by:", session?.user?.email);

    console.log(session);
    
    if (!session || !session.user?.email) {
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

    // First check if swap exists and belongs to user
    const existingSwap = await sql`
      SELECT uemail FROM CourseSwap WHERE swapID = ${id}
    `;

    if (existingSwap.length === 0) {
      return NextResponse.json(
        { error: "Swap not found" },
        { status: 404 }
      );
    }

    if (existingSwap[0].uemail !== session.user.email) {
      return NextResponse.json(
        { error: "Access denied. You can only delete your own swaps." },
        { status: 403 }
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

  } catch (error) {
    console.error("Error deleting swap:", error);
    return NextResponse.json(
      { error: "Failed to delete swap" },
      { status: 500 }
    );
  }
}

// PATCH to set isDone to true
export async function PATCH(request, { params }) {
  try {
    // Get authenticated user session
    const session = await auth();
    console.log("Swap PATCH API accessed by:", session?.user?.email);
    if (!session || !session.user?.email) {
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

    // First check if swap exists and belongs to user
    const existingSwap = await sql`
      SELECT uemail FROM CourseSwap WHERE swapID = ${id}
    `;
    if (existingSwap.length === 0) {
      return NextResponse.json(
        { error: "Swap not found" },
        { status: 404 }
      );
    }

    if (existingSwap[0].uemail !== session.user.email) {
      return NextResponse.json(
        { error: "Access denied. You can only update your own swaps." },
        { status: 403 }
      );
    }

    // Update the swap to set isDone to true
    const result = await sql`
      UPDATE CourseSwap
      SET isDone = true
      WHERE swapID = ${id}
      RETURNING swapID, isDone
    `;
    return NextResponse.json({
      success: true,
      message: "Swap marked as done",
      updatedSwap: result[0]
    });

    } catch (error) {
        console.error("Error updating swap:", error);
        return NextResponse.json(
          { error: "Failed to update swap" },
          { status: 500 }
        );
    }

}
