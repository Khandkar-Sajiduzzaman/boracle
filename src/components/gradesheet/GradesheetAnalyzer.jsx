"use client";
import { useState, useRef, useCallback, useEffect, Fragment } from "react";
import { Upload, Plus, RotateCcw, Trash2, Save, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line } from 'recharts';

let pdfjsLib = null;
async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}

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

async function extractPageText(pdfDocument, pageNumber) {
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

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const fullTermName = payload[0].payload.fullTermName || label;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 shadow-2xl text-left min-w-[200px]">
        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
          {fullTermName}
        </div>
        <div className="space-y-2 mt-2">
          {payload.map((entry, index) => (
            <div key={index} className="text-sm flex justify-between items-center gap-6">
              <span className="text-gray-500 dark:text-gray-400 font-medium">{entry.name}</span>
              <span className="font-bold font-mono" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function parseGradesheet(text) {
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

function formatSemesterName(dbName) {
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

export default function GradesheetAnalyzer({ allowSave = false, savedData = null }) {
  const [courses, setCourses] = useState([]);
  const [originalCourses, setOriginalCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);
  const [newCourseInput, setNewCourseInput] = useState({ code: "", credits: "3.00", gp: "4.00" });
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [targetDegreeCredits, setTargetDegreeCredits] = useState("");
  const [targetCgpaValue, setTargetCgpaValue] = useState("");
  const [lastParsedSemester, setLastParsedSemester] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (savedData && !dataLoaded) {
      if (savedData.courses?.length > 0) {
        setCourses(savedData.courses.map((course) => ({ ...course })));
        setOriginalCourses(savedData.courses.map((course) => ({ ...course })));
      }
      if (savedData.targetDegreeCredits) setTargetDegreeCredits(savedData.targetDegreeCredits);
      if (savedData.targetCgpa) setTargetCgpaValue(savedData.targetCgpa);
      if (savedData.lastParsedSemester) setLastParsedSemester(savedData.lastParsedSemester);
      setDataLoaded(true);
    }
  }, [savedData, dataLoaded]);

  const showToastMessage = useCallback((msg, type = "success") => {
    if (type === "error") toast.error(msg);
    else toast.success(msg);
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") { 
      showToastMessage("Please select a valid PDF file.", "error"); 
      return; 
    }
    setLoading(true);
    try {
      const pdfjs = await getPdfjs();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await pdfjs.getDocument(arrayBuffer).promise;
      const parsedPages = [];
      
      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
        parsedPages.push(extractPageText(pdfDocument, pageNumber));
      }
      
      const textContents = await Promise.all(parsedPages);
      const parsedCourses = parseGradesheet(textContents.join("\n"));
      
      if (!parsedCourses.length) { 
        showToastMessage("No courses found. Is this a valid BRACU grade sheet?", "error"); 
        return; 
      }
      
      let lastSem = null;
      const coursesWithSem = parsedCourses.filter(c => c.semester && c.semester !== "Unknown Semester");
      if (coursesWithSem.length > 0) {
        lastSem = coursesWithSem[coursesWithSem.length - 1].semester;
      }
      
      setCourses(parsedCourses.map((course) => ({ ...course })));
      setOriginalCourses(parsedCourses.map((course) => ({ ...course })));
      if (lastSem) setLastParsedSemester(lastSem);
      
      showToastMessage(`Extracted ${parsedCourses.length} courses!`);
    } catch (error) { 
      console.error(error); 
      showToastMessage("Error processing PDF.", "error"); 
    } finally { 
      setLoading(false); 
    }
  }, [showToastMessage]);

  const updateGradePoints = useCallback((index, value) => {
    const parsedGradePoints = parseFloat(value);
    if (isNaN(parsedGradePoints) || parsedGradePoints < 0 || parsedGradePoints > 4) return;
    
    setCourses((prevCourses) => { 
      const updatedCourses = [...prevCourses]; 
      updatedCourses[index] = { 
        ...updatedCourses[index], 
        gradePoints: parsedGradePoints, 
        qualityPoints: updatedCourses[index].credits * parsedGradePoints 
      }; 
      return updatedCourses; 
    });
  }, []);

  const deleteCourse = useCallback((index) => {
    const courseCode = courses[index]?.courseCode;
    setCourses((prevCourses) => prevCourses.filter((_, i) => i !== index));
    showToastMessage(`Deleted ${courseCode}`);
  }, [courses, showToastMessage]);

  const resetGrades = useCallback(() => {
    if (!originalCourses.length) return;
    setCourses(originalCourses.map((course) => ({ ...course })));
    showToastMessage("Reset to original");
  }, [originalCourses, showToastMessage]);

  const addNewCourse = useCallback(() => {
    const courseCode = newCourseInput.code.trim().toUpperCase();
    const credits = parseFloat(newCourseInput.credits);
    const gradePoints = parseFloat(newCourseInput.gp);
    
    if (!/^[A-Z]{2,4}\d{3}[A-Z]?[A-Z0-9]?$/.test(courseCode)) { 
      showToastMessage("Invalid course code", "error"); 
      return; 
    }
    if (courses.some((course) => course.courseCode === courseCode)) { 
      showToastMessage("Course already exists", "error"); 
      return; 
    }
    if (isNaN(credits) || credits <= 0 || credits > 10) { 
      showToastMessage("Credits must be 0.5-10", "error"); 
      return; 
    }
    if (isNaN(gradePoints) || gradePoints < 0 || gradePoints > 4) { 
      showToastMessage("Grade points must be 0-4", "error"); 
      return; 
    }
    
    setCourses((prevCourses) => [
      ...prevCourses, 
      { 
        courseCode: courseCode, 
        credits: credits, 
        gradePoints: gradePoints, 
        qualityPoints: credits * gradePoints, 
        isManuallyAdded: true, 
        isRetake: false, 
        retakeType: null, 
        isFailed: false,
        semester: "Planned Courses"
      }
    ]);
    
    setAddingCourse(false); 
    setNewCourseInput({ code: "", credits: "3.00", gp: "4.00" }); 
    showToastMessage(`Added ${courseCode}`);
  }, [newCourseInput, courses, showToastMessage]);

  const saveGradesheet = useCallback(async () => {
    if (!courses.length) return; 
    setSaving(true);
    try {
      const currentQualityPoints = originalCourses.reduce((sum, course) => sum + course.qualityPoints, 0);
      const currentCredits = originalCourses.reduce((sum, course) => sum + course.credits, 0);
      const originalCgpa = currentCredits > 0 ? currentQualityPoints / currentCredits : 0;
      
      const response = await fetch("/api/gradesheet", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          courses, 
          originalCgpa,
          lastParsedSemester,
          targetDegreeCredits,
          targetCgpa: targetCgpaValue
        }) 
      });
      
      if (!response.ok) throw new Error(); 
      showToastMessage("Gradesheet saved!");
    } catch { 
      showToastMessage("Failed to save.", "error"); 
    } finally { 
      setSaving(false); 
    }
  }, [courses, originalCourses, lastParsedSemester, targetDegreeCredits, targetCgpaValue, showToastMessage]);

  const deleteSavedGradesheet = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/gradesheet", { method: "DELETE" });
      if (!response.ok) throw new Error(); 
      setCourses([]); 
      setOriginalCourses([]); 
      setLastParsedSemester(null);
      setTargetDegreeCredits("");
      setTargetCgpaValue("");
      showToastMessage("Gradesheet deleted.");
    } catch { 
      showToastMessage("Failed to delete.", "error"); 
    } finally { 
      setSaving(false); 
    }
  }, [showToastMessage]);

  // Calculations
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const totalQualityPoints = courses.reduce((sum, course) => sum + course.qualityPoints, 0);
  const newCgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  
  const originalTotalCredits = originalCourses.reduce((sum, course) => sum + course.credits, 0);
  const originalTotalQualityPoints = originalCourses.reduce((sum, course) => sum + course.qualityPoints, 0);
  const currentCgpa = originalTotalCredits > 0 ? originalTotalQualityPoints / originalTotalCredits : 0;

  const currentActualCgpa = currentCgpa >= 0 ? (Math.floor((currentCgpa * 1000) % 10) >= 5 ? Math.ceil(currentCgpa * 100) / 100 : Math.floor(currentCgpa * 100) / 100) : 0;
  const newActualCgpa = newCgpa >= 0 ? (Math.floor((newCgpa * 1000) % 10) >= 5 ? Math.ceil(newCgpa * 100) / 100 : Math.floor(newCgpa * 100) / 100) : 0;

  // Graduation Planner logic
  const degreeCreditsNumber = parseFloat(targetDegreeCredits) || 0;
  const targetCgpaNumber = parseFloat(targetCgpaValue) || 0;
  let remainingCredits = 0;
  let maxReachableCgpa = newCgpa;
  let requiredAverageGpa = 0;
  let isTargetImpossible = false;

  if (degreeCreditsNumber > 0) {
    remainingCredits = Math.max(0, degreeCreditsNumber - totalCredits);
    if (degreeCreditsNumber > totalCredits) {
      maxReachableCgpa = (totalQualityPoints + remainingCredits * 4.0) / degreeCreditsNumber;
      requiredAverageGpa = ((degreeCreditsNumber * targetCgpaNumber) - totalQualityPoints) / remainingCredits;
      isTargetImpossible = requiredAverageGpa > 4.0;
    }
  }

  const statisticsCards = [
    { label: "Total Courses", value: courses.length, color: "text-blue-600 dark:text-blue-400" },
    { label: "Total Credits", value: totalCredits.toFixed(1), color: "text-blue-600 dark:text-blue-400" },
    { label: "Current CGPA", value: currentActualCgpa.toFixed(2), sub: `Precise: ${currentCgpa.toFixed(4)}`, color: "text-green-600 dark:text-green-400" },
    { label: "New CGPA", value: newActualCgpa.toFixed(2), sub: `Precise: ${newCgpa.toFixed(4)}`, color: "text-purple-600 dark:text-purple-400" },
  ];

  // Group courses by semester
  const semesterGroups = [];
  courses.forEach((course, index) => {
    const sem = course.semester || "Unknown Semester";
    let group = semesterGroups.find(g => g.name === sem);
    if (!group) {
      group = { name: sem, courses: [] };
      semesterGroups.push(group);
    }
    group.courses.push({ ...course, originalIndex: index });
  });

  // Sort groups explicitly by semester number to guarantee chronological order
  semesterGroups.sort((a, b) => {
    if (a.name === "Planned Courses") return 1;
    if (b.name === "Planned Courses") return -1;
    if (a.name === "Unknown Semester") return 1;
    if (b.name === "Unknown Semester") return -1;
    
    const numA = parseInt(a.name.match(/Semester (\d+)/i)?.[1] || "0");
    const numB = parseInt(b.name.match(/Semester (\d+)/i)?.[1] || "0");
    return numA - numB;
  });

  const chartData = [];
  let cumQualityPoints = 0;
  let cumCredits = 0;

  semesterGroups.forEach((group) => {
    if (group.name === "Unknown Semester") return;
    
    let semQualityPoints = 0;
    let semCredits = 0;
    
    group.courses.forEach(course => {
      semQualityPoints += course.qualityPoints;
      semCredits += course.credits;
      
      cumQualityPoints += course.qualityPoints;
      cumCredits += course.credits;
    });
    
    const semGpa = semCredits > 0 ? semQualityPoints / semCredits : 0;
    const cumCgpa = cumCredits > 0 ? cumQualityPoints / cumCredits : 0;
    
    const formattedName = formatSemesterName(group.name);
    const shortName = formattedName.replace("Semester", "Sem").replace(" | ", "\n");
    
    chartData.push({
      name: shortName,
      fullTermName: formattedName,
      semesterGpa: parseFloat(semGpa.toFixed(2)),
      cumulativeCgpa: parseFloat(cumCgpa.toFixed(2)),
      projectedCgpa: targetCgpaNumber > 0 ? parseFloat(targetCgpaNumber.toFixed(2)) : null
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="mb-8 md:mb-12">
          <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold tracking-widest uppercase px-3.5 py-1 rounded-full mb-3">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            BRAC University
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none m-0 text-gray-900 dark:text-white">
            CGPA <span className="text-blue-600 dark:text-blue-400">Analyzer</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-2">
            Upload your grade sheet PDF to analyze your CGPA and project your graduation targets.
          </p>
        </div>

        {/* Upload Bar / Updated Banner */}
        {courses.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-5 border border-blue-200 dark:border-blue-800 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">Gradesheet Loaded</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {lastParsedSemester ? `Updated till ${formatSemesterName(lastParsedSemester)}` : "No semester data found"}
                </div>
              </div>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-semibold rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm shrink-0">
              Reupload PDF
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); e.target.value = ""; }} id="gradesheet-file-input" />
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
            className="flex items-center gap-4 p-4 md:p-5 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm cursor-pointer hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all mb-8 shadow-sm"
            role="button" tabIndex={0} id="gradesheet-upload-bar"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Upload className="w-6 h-6" />
            </div>
            <div className="flex-1 text-sm md:text-base text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Click to upload</span> or drag and drop your grade sheet PDF
            </div>
            <span className="hidden md:inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase">PDF</span>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(file); e.target.value = ""; }} id="gradesheet-file-input" />
          </div>
        )}

        {/* Graph Section */}
        {courses.length > 0 && chartData.length > 0 && !loading && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-8 p-5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Academic Trajectory
              </h3>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} />
                  <YAxis domain={[0, 4.0]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip 
                    content={<ChartTooltip />}
                    cursor={{ fill: '#3b82f6', opacity: 0.05 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                  <Bar dataKey="semesterGpa" name="Semester GPA" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Line type="monotone" dataKey="cumulativeCgpa" name="Average CGPA" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                  {targetCgpaNumber > 0 && (
                    <Line type="stepAfter" dataKey="projectedCgpa" name="Projected CGPA" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-12 text-blue-600 dark:text-blue-400 font-medium">
            <Loader2 className="w-6 h-6 animate-spin" /> Processing your grade sheet...
          </div>
        )}

        {courses.length > 0 && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
            
            {/* Left Column — Course Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 md:px-6 py-4 md:py-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Courses List <span className="ml-2 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs">{courses.length}</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Adjust grade points to see how it affects your CGPA.</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                      <th className="px-5 md:px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Course</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Credits</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Grade Pts</th>
                      <th className="px-3 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {semesterGroups.map((group) => (
                      <Fragment key={group.name}>
                        <tr className="bg-blue-50/40 dark:bg-blue-900/20 border-y border-gray-100 dark:border-gray-800">
                          <td colSpan="4" className="px-5 md:px-6 py-2.5 text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                            {formatSemesterName(group.name)}
                          </td>
                        </tr>
                        {group.courses.map((course) => (
                          <tr key={`${course.courseCode}-${course.originalIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-5 md:px-6 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-200">
                              <div className="flex items-center gap-2 flex-wrap">
                                {course.courseCode}
                                {course.isRetake && <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{course.retakeType || "RT"}</span>}
                                {course.isFailed && <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">F</span>}
                                {course.isManuallyAdded && <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Manual</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400 tabular-nums font-mono">{course.credits.toFixed(2)}</td>
                            <td className="px-4 py-3.5">
                              <input type="number" className="w-20 px-2.5 py-1.5 text-sm text-center rounded-lg border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" defaultValue={course.gradePoints.toFixed(2)} min="0" max="4" step="0.01" onBlur={(e) => updateGradePoints(course.originalIndex, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }} id={`grade-input-${course.originalIndex}`} />
                            </td>
                            <td className="px-3 py-3.5">
                              <button onClick={() => deleteCourse(course.originalIndex)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Delete" id={`del-${course.originalIndex}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                    {addingCourse && (
                      <tr className="bg-blue-50/30 dark:bg-blue-900/10 border-t border-gray-100 dark:border-gray-800">
                        <td className="px-5 md:px-6 py-3.5"><input type="text" placeholder="CSE110" value={newCourseInput.code} onChange={(e) => setNewCourseInput((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} className="w-full max-w-[110px] px-2.5 py-1.5 text-sm rounded-lg border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30" autoFocus id="new-code" /></td>
                        <td className="px-4 py-3.5"><input type="number" value={newCourseInput.credits} onChange={(e) => setNewCourseInput((prev) => ({ ...prev, credits: e.target.value }))} className="w-20 px-2.5 py-1.5 text-sm text-center rounded-lg border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30" min="0" max="10" step="0.5" id="new-cr" /></td>
                        <td className="px-4 py-3.5"><input type="number" value={newCourseInput.gp} onChange={(e) => setNewCourseInput((prev) => ({ ...prev, gp: e.target.value }))} className="w-20 px-2.5 py-1.5 text-sm text-center rounded-lg border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30" min="0" max="4" step="0.01" id="new-gp" /></td>
                        <td className="px-3 py-3.5">
                          <div className="flex gap-1.5">
                            <button onClick={addNewCourse} className="p-1.5 text-xs font-medium rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors shadow-sm" id="save-new"><CheckCircle2 className="w-4 h-4" /></button>
                            <button onClick={() => setAddingCourse(false)} className="p-1.5 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" id="cancel-new"><X className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons at Bottom */}
              <div className="px-5 md:px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex gap-3 flex-wrap">
                <button onClick={() => setAddingCourse(true)} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-500/20" id="add-course-btn">
                  <Plus className="w-4 h-4" /> Add Course
                </button>
                <button onClick={resetGrades} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-sm" id="reset-btn">
                  <RotateCcw className="w-4 h-4" /> Reset Grades
                </button>
              </div>
            </div>

            {/* Right Column — Stats & Planner */}
            <div className="flex flex-col gap-5 lg:sticky lg:top-24">
              
              {/* CGPA Stats Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Metrics</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4">
                  {statisticsCards.map((statCard) => (
                    <div key={statCard.label} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">{statCard.label}</div>
                      <div className={`text-2xl font-bold font-mono tracking-tight leading-none ${statCard.color}`}>{statCard.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graduation Planner */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10">
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wider flex items-center gap-2">
                    Graduation Planner
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-blue-200/60 mt-1">Project the GPA you need to hit your goal</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Total Degree Credits</label>
                      <input 
                        type="number" 
                        className="w-full bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/60 rounded-lg text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none font-mono focus:border-blue-500 transition-colors" 
                        placeholder="e.g. 130" 
                        value={targetDegreeCredits}
                        onChange={(e) => setTargetDegreeCredits(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Target CGPA</label>
                      <input 
                        type="number" 
                        className="w-full bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/60 rounded-lg text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none font-mono focus:border-blue-500 transition-colors" 
                        placeholder="e.g. 3.50" 
                        value={targetCgpaValue}
                        onChange={(e) => setTargetCgpaValue(e.target.value)}
                      />
                    </div>
                  </div>

                  {degreeCreditsNumber > 0 && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl p-3.5">
                        <div className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider mb-1.5 font-bold">Max Reachable</div>
                        <div className="text-gray-900 dark:text-gray-100 text-xl font-bold font-mono">{remainingCredits > 0 ? maxReachableCgpa.toFixed(2) : "—"}</div>
                        <div className="text-gray-400 dark:text-gray-500 text-[10px] mt-1 leading-snug">{remainingCredits > 0 ? `4.0 in remaining ${remainingCredits} cr.` : "No remaining credits"}</div>
                      </div>
                      
                      <div className={`rounded-xl p-3.5 border transition-colors ${
                        targetCgpaNumber > 0 && remainingCredits > 0 
                          ? (isTargetImpossible 
                              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50" 
                              : requiredAverageGpa <= 0 
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50" 
                                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50")
                          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50"
                      }`}>
                        <div className={`text-[10px] uppercase tracking-wider mb-1.5 font-bold ${
                          targetCgpaNumber > 0 && remainingCredits > 0 
                            ? (isTargetImpossible ? "text-red-600 dark:text-red-400" : requiredAverageGpa <= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400")
                            : "text-gray-500 dark:text-gray-400"
                        }`}>Required Avg. GPA</div>
                        
                        <div className={`text-xl font-bold font-mono ${
                          targetCgpaNumber > 0 && remainingCredits > 0 
                            ? (isTargetImpossible ? "text-red-700 dark:text-red-300" : requiredAverageGpa <= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300")
                            : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {targetCgpaNumber > 0 ? (remainingCredits > 0 ? (isTargetImpossible ? "N/A" : requiredAverageGpa <= 0 ? "✓" : requiredAverageGpa.toFixed(2)) : "—") : "—"}
                        </div>
                        
                        <div className={`text-[10px] mt-1 leading-snug ${
                          targetCgpaNumber > 0 && remainingCredits > 0 
                            ? (isTargetImpossible ? "text-red-500/80 dark:text-red-400/80" : requiredAverageGpa <= 0 ? "text-emerald-500/80 dark:text-emerald-400/80" : "text-blue-500/80 dark:text-blue-400/80")
                            : "text-gray-400 dark:text-gray-500"
                        }`}>
                          {targetCgpaNumber > 0 ? (remainingCredits > 0 ? (isTargetImpossible ? "Requires GPA > 4.0" : requiredAverageGpa <= 0 ? "Already guaranteed!" : `To reach target ${targetCgpaNumber.toFixed(2)}`) : "No credits left") : "To reach target"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save/Load actions */}
              {allowSave && (
                <div className="flex flex-row gap-3">
                  <button onClick={deleteSavedGradesheet} disabled={saving} className="flex-1 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50" id="del-sheet-btn">
                    Delete
                  </button>
                  <button onClick={saveGradesheet} disabled={saving || !courses.length} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-md" id="save-btn">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!courses.length && !loading && (
          <div className="text-center py-20 md:py-32 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white/30 dark:bg-gray-900/30">
            <div className="text-5xl md:text-6xl mb-4 drop-shadow-sm opacity-80">📈</div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">No Grades Yet</h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Upload your unofficial transcript PDF using the dropzone above to instantly generate your analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
