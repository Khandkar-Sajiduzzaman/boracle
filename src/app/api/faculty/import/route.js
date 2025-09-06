import { auth } from "@/auth";
import { sql } from "@/lib/pgdb";
import { NextResponse } from "next/server";

// function to parse CSV
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

export async function POST(request) {
  try {
    // Check if user is logged in and is admin
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    
    if (session.user.userrole !== 'admin') {
      return NextResponse.json({ error: "Only admins can import data" }, { status: 403 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    
    // Parse CSV data
    const facultyData = parseCSV(fileContent);
    
    if (facultyData.length === 0) {
      return NextResponse.json({ error: "No data found in CSV" }, { status: 400 });
    }

    // Check if required columns exist
    const firstRow = facultyData[0];
    if (!firstRow.facultyName || !firstRow.email) {
      return NextResponse.json({ error: "CSV must have facultyName and email columns" }, { status: 400 });
    }

    // Import each faculty member
    let importedCount = 0;
    const errors = [];
    
    for (let i = 0; i < facultyData.length; i++) {
      const row = facultyData[i];
      
      // Skip empty rows
      if (!row.facultyName && !row.email) continue;
      
      try {
        // Insert or update faculty in database
        await sql`
          INSERT INTO faculty (facultyName, email, imgURL)
          VALUES (${row.facultyName}, ${row.email}, ${row.imgURL || null})
          ON CONFLICT (email) DO UPDATE SET
            facultyName = EXCLUDED.facultyName,
            imgURL = EXCLUDED.imgURL
        `;
        
        importedCount++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: `Imported ${importedCount} faculty members`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
