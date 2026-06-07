// app/api/gradesheet/route.js - Gradesheet CRUD (user-scoped)
import { auth } from "@/auth";
import { db, eq, getCurrentEpoch } from "@/lib/db";
import { gradesheet } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .select()
      .from(gradesheet)
      .where(eq(gradesheet.email, session.user.email));

    if (result.length === 0) {
      return NextResponse.json({ error: "No gradesheet found" }, { status: 404 });
    }

    return NextResponse.json({
      courses: JSON.parse(result[0].courses),
      originalCgpa: result[0].originalCgpa,
      lastParsedSemester: result[0].lastParsedSemester,
      targetDegreeCredits: result[0].targetDegreeCredits,
      targetCgpa: result[0].targetCgpa,
      updatedAt: result[0].updatedAt,
    });
  } catch (error) {
    console.error("Gradesheet GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courses, originalCgpa, lastParsedSemester, targetDegreeCredits, targetCgpa } = body;

    if (!courses || !Array.isArray(courses)) {
      return NextResponse.json({ error: "Invalid courses data" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(gradesheet)
      .where(eq(gradesheet.email, session.user.email));

    if (existing.length > 0) {
      await db
        .update(gradesheet)
        .set({
          courses: JSON.stringify(courses),
          originalCgpa: originalCgpa?.toString() || null,
          lastParsedSemester: lastParsedSemester || null,
          targetDegreeCredits: targetDegreeCredits?.toString() || null,
          targetCgpa: targetCgpa?.toString() || null,
          updatedAt: getCurrentEpoch(),
        })
        .where(eq(gradesheet.email, session.user.email));
    } else {
      await db.insert(gradesheet).values({
        email: session.user.email,
        courses: JSON.stringify(courses),
        originalCgpa: originalCgpa?.toString() || null,
        lastParsedSemester: lastParsedSemester || null,
        targetDegreeCredits: targetDegreeCredits?.toString() || null,
        targetCgpa: targetCgpa?.toString() || null,
        updatedAt: getCurrentEpoch(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gradesheet POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .delete(gradesheet)
      .where(eq(gradesheet.email, session.user.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gradesheet DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
