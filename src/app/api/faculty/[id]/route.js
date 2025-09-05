// app/api/dashboard/route.js (App Router)
import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request, { params }) {
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

    // fetch faculty information based on id passed in the [id] route. extract params as in Next 15+
    const { id } = await params;

    let faculty = await sql`SELECT * FROM faculty WHERE facultyID = ${id}`;
    let initials = await sql`SELECT facultyInitial FROM initial WHERE facultyID = ${id}`;
    let facultyInitials = []

    if (faculty.length === 0) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

        initials.forEach(element => {
        console.log("Initial:", element);
        facultyInitials.push(element.facultyinitial);
    });

    console.log("Initials:", facultyInitials);

    if (facultyInitials.length > 0) {
      faculty[0].initials = facultyInitials;
    }

    return NextResponse.json(faculty[0]);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}