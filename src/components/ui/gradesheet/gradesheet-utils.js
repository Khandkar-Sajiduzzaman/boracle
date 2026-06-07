const SKIP_PATTERNS = ["CUMULATIVE", "Credits Attempted", "Course No", "Course Title", "GRADE SHEET", "Student ID", "BRAC University", "PROGRAM:", "Page ", "UNOFFICIAL COPY", "GPA ", "CGPA "];
const PREP_COURSES = ["MAT091", "MAT092", "ENG091"];
const shouldSkipLine = (line) => SKIP_PATTERNS.some((pattern) => line.includes(pattern));
const isPrepCourse = (courseCode) => PREP_COURSES.includes(courseCode);
const isValidCourse = (credits, gradePoints) => credits >= 0 && credits <= 10 && gradePoints >= 0 && gradePoints <= 4.0;

function getStandardCredits(courseCode) {
  if (/^(CSE|EEE|ECE)\d{3}$/.test(courseCode)) return 3;
  if (/^(CSE|EEE|ECE)\d{3}L$/.test(courseCode)) return 1;
  if (/^MAT\d{3}$/.test(courseCode)) return 3;
  if (/^(PHY|CHE)\d{3}$/.test(courseCode)) return 3;
  if (/^(PHY|CHE)\d{3}L$/.test(courseCode)) return 1;
  return 3;
}

function handleDuplicateCourse(courseMap, courseData) {
  const courseCode = courseData.courseCode;
  if (courseMap.has(courseCode)) {
    const existingCourse = courseMap.get(courseCode);
    if (courseData.isRetake && !existingCourse.isRetake) {
      courseMap.delete(courseCode);
      courseMap.set(courseCode, courseData);
    } else if (existingCourse.isRetake && courseData.isRetake && courseData.gradePoints > existingCourse.gradePoints) {
      courseMap.delete(courseCode);
      courseMap.set(courseCode, courseData);
    }
  } else {
    courseMap.set(courseCode, courseData);
  }
}

export async function extractPageText(pdfDocument, pageNumber) {
  const page = await pdfDocument.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const lineMap = new Map();
  
  for (const item of textContent.items) {
    const yPosition = Math.round(item.transform[5]);
    if (!lineMap.has(yPosition)) lineMap.set(yPosition, []);
    lineMap.get(yPosition).push({ text: item.str, x: item.transform[4] });
  }
  
  return Array.from(lineMap.entries())
    .sort((lineA, lineB) => lineB[0] - lineA[0])
    .map(([, items]) => items.sort((itemA, itemB) => itemA.x - itemB.x).map((item) => item.text).join(" ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export function parseGradesheet(text) {
  const courseCodePattern = /^([A-Z]{2,4}\d{3}[A-Z]?[A-Z0-9]?)/;
  const numberPattern = /\d+\.\d+/g;
  const rpPattern = /\b(RP|\(RP\)|\( RP \))\b/i;
  const rtPattern = /\b(RT|\(RT\)|\( RT \))\b/i;
  const semesterPattern = /^SEMESTER:\s*(.*)/i;
  
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line && !shouldSkipLine(line));
  const courseMap = new Map();
  
  let currentSemester = "Unknown Semester";
  let semesterCount = 0;
  
  for (const line of lines) {
    const semMatch = line.match(semesterPattern);
    if (semMatch) {
      semesterCount++;
      currentSemester = `Semester ${semesterCount} | ${semMatch[1].trim()}`;
      continue;
    }
    
    const match = line.match(courseCodePattern);
    if (!match) continue;
    
    const courseCode = match[1];
    const isRp = rpPattern.test(line);
    const isRt = rtPattern.test(line);
    const isRetakeCourse = isRp || isRt;
    
    const numbers = line.match(numberPattern);
    if (!numbers || numbers.length < 2) continue;
    
    let credits = parseFloat(numbers[0]);
    const gradePoints = parseFloat(numbers[numbers.length - 1]);
    const isFailed = credits === 0 && gradePoints === 0;
    const isPrep = isPrepCourse(courseCode);
    
    if (isFailed && !isPrep) credits = getStandardCredits(courseCode);
    
    if (isValidCourse(credits, gradePoints)) {
      handleDuplicateCourse(courseMap, { 
        courseCode: courseCode, 
        credits: credits, 
        gradePoints: gradePoints, 
        qualityPoints: credits * gradePoints, 
        isRetake: isRetakeCourse, 
        retakeType: isRetakeCourse ? (isRp && isRt ? "RP/RT" : isRp ? "RP" : "RT") : null, 
        isFailed: isFailed && !isPrep,
        semester: currentSemester
      });
    }
  }
  return Array.from(courseMap.values());
}

export function formatSemesterName(dbName) {
  if (!dbName) return "";
  const parts = dbName.split(" | ");
  if (parts.length === 2) {
    const sem = parts[1];
    const match = sem.match(/([A-Za-z]+)(\d+)/);
    if (match) {
      const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      const yearStr = match[2];
      const year = yearStr.length === 2 ? "20" + yearStr : yearStr;
      return `${parts[0]} | ${name} ${year}`;
    }
  }
  return dbName;
}

let pdfjsLib = null;
export async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}
