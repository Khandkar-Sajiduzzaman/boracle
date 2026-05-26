import { db } from "@/lib/db"
import { services } from "@/lib/db/schema"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const servicesList = await db.select().from(services)
        return NextResponse.json({ success: true, servicesList })
    } catch (error) {
        console.error("Failed to fetch services:", error)
        return NextResponse.json(
            { error: "Failed to fetch services data" },
            { status: 500 }
        )
    }
}
