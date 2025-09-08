// API for listing all users - admin only
import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextResponse } from "next/server";

export async function GET(req) {
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

  // Fetch all users from the database
  const users = await sql`SELECT * FROM userinfo ORDER BY userName`;

  return NextResponse.json(users);
}

// API for deleting a user email sent through request body - admin only
export async function DELETE(req) {
  // Check if the user is authenticated and has admin role

    const session = await auth();
    if (!session || session.user?.userrole !== "admin") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
    );
    }

    const { email } = await req.json();
    if (!email) {
        return NextResponse.json(
            { error: "Email is required" },
            { status: 400 }
        );
    }
    // First check if user exists
    const existingUser = await sql`
      SELECT email FROM userinfo WHERE email = ${email}
    `;
    if (existingUser.length === 0) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    }
    // Delete the user
    const result = await sql`
      DELETE FROM userinfo
      WHERE email = ${email}
        RETURNING email
    `;
    return NextResponse.json({
        success: true,
        message: "User deleted successfully",
        deletedUserEmail: result[0].email
    });
}