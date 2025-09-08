// API to import faculty data from CSV - admin only
import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextResponse } from "next/server";
import csv from "csv-parser";
import { Readable } from "stream";

export async function POST(request) {
  // Check if the user is authenticated and has admin role
  const session = await auth();
    console.log("Admin Import Faculty API accessed by:", session);
    console.log("User role:", session?.user?.userrole);
    if (!session || session.user?.userrole !== "admin") {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
    );
  }

    try {
        const { file } = await request.json();
        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }
        const facultyData = [];
        const stream = Readable.from([file]);
        await new Promise((resolve, reject) => {
            stream
                .pipe(csv())
                .on("data", (data) => facultyData.push(data))
                .on("end", resolve)
                .on("error", reject);
        });


        for (const faculty of facultyData) {
            const { facultyName, email, imgURL, initials } = faculty;
            if (!facultyName || !email) {
                return NextResponse.json(
                    { error: "Faculty name and email are required" },
                    { status: 400 }
                );
            }
            const result = await sql`
                INSERT INTO faculty (facultyName, email, imgURL)
                VALUES (${facultyName}, ${email}, ${imgURL || null})
                RETURNING facultyID
            `;
            const facultyID = result[0].facultyid;
            if (initials) {
                const initialsArray = initials.split(",").map(i => i.trim());
                for (const initial of initialsArray) {
                    if (initial) {
                        await sql`
                            INSERT INTO initial (facultyID, facultyInitial)
                            VALUES (${facultyID}, ${initial})
                        `;
                    }
                }
            }
        }

        return NextResponse.json(
            { message: "Faculty data imported successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error importing faculty data:", error);
        return NextResponse.json(
            { error: "Failed to import faculty data" },
            { status: 500 }
        );
    }
}