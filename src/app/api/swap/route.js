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
    let swaps = []

    for (const element of swapRequest){
        let askingSections = await sql`SELECT askSectionID FROM askSectionID WHERE swapID = ${element.swapid}`;
        element.askingSections = askingSections.map(item => item.asksectionid);
        swaps.push(element);
    }

    console.log("Swap Requests:", swaps);

    return NextResponse.json(swaps,{status:200});
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function POST(request) {
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
    //Fetching the Swap request 
    const uEmail = session.user.email;
    const {givingSection,askingSection}= await request.json();

    // save to database
    let createSwap = await sql `INSERT INTO courseSwap (getSectionID,uEmail) 
                                VALUES (${givingSection}, ${uEmail})
                                RETURNING swapID`;

                                
    for (const element of askingSection){
        await sql `INSERT INTO askSectionID (swapID, askSectionID) 
                 VALUES (${createSwap[0].swapid}, ${element})
                 RETURNING swapID`;
    };
   

    return NextResponse.json({success: true, swapId: createSwap[0].swapid},{status:200});
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
