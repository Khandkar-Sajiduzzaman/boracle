import { useEffect, useRef, useState } from "react";

export default function GraduationPlanner({
  targetDegreeCredits, setTargetDegreeCredits,
  targetCgpaValue, setTargetCgpaValue,
  degreeCreditsNumber, targetCgpaNumber,
  remainingCredits, maxReachableCgpa,
  requiredAverageGpa, isTargetImpossible,
  gpaTolerance,
}) {
  const [isCgpaFlashActive, setIsCgpaFlashActive] = useState(false);
  const [isDegreeCreditsFlashActive, setIsDegreeCreditsFlashActive] = useState(false);
  const flashTimeoutRef = useRef(null);
  const cgpaInputRef = useRef(null);
  const degreeInputRef = useRef(null);

  const clampTargetCgpa = (value) => {
    if (value === "") return "";

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return value;

    return String(Math.min(4, Math.max(0, numericValue)));
  };

  const clampTargetDegreeCredits = (value) => {
    if (value === "") return "";

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return value;

    return String(Math.max(0, numericValue));
  };

  const flashCgpaLimit = () => {
    setIsCgpaFlashActive(true);

    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }

    flashTimeoutRef.current = setTimeout(() => {
      setIsCgpaFlashActive(false);
      flashTimeoutRef.current = null;
    }, 180);
  };

  const flashDegreeCreditsLimit = () => {
    setIsDegreeCreditsFlashActive(true);

    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }

    flashTimeoutRef.current = setTimeout(() => {
      setIsDegreeCreditsFlashActive(false);
      flashTimeoutRef.current = null;
    }, 180);
  };

  useEffect(() => () => {
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
    }
  }, []);

  const handleTargetCgpaChange = (value) => {
    if (value === "") {
      setTargetCgpaValue("");
      return;
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && (numericValue < 0 || numericValue > 4)) {
      flashCgpaLimit();
    }

    setTargetCgpaValue(clampTargetCgpa(value));
  };

  const handleTargetCgpaKeyDown = (event) => {
    const currentValue = Number(targetCgpaValue);
    const isAtLowerLimit = !Number.isNaN(currentValue) && currentValue <= 0;
    const isAtUpperLimit = !Number.isNaN(currentValue) && currentValue >= 4;

    if ((event.key === "ArrowDown" && isAtLowerLimit) || (event.key === "ArrowUp" && isAtUpperLimit)) {
      event.preventDefault();
      flashCgpaLimit();
    }
  };

  const handleTargetDegreeCreditsChange = (value) => {
    if (value === "") {
      setTargetDegreeCredits("");
      return;
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && numericValue < 0) {
      flashDegreeCreditsLimit();
    }

    setTargetDegreeCredits(clampTargetDegreeCredits(value));
  };

  const handleTargetDegreeCreditsKeyDown = (event) => {
    const currentValue = Number(targetDegreeCredits);
    const isAtLowerLimit = !Number.isNaN(currentValue) && currentValue <= 0;

    if (event.key === "ArrowDown" && isAtLowerLimit) {
      event.preventDefault();
      flashDegreeCreditsLimit();
    }
  };

  const handleCgpaPointerDown = (e) => {
    if (!cgpaInputRef.current || typeof e.clientX !== 'number') return;
    const rect = cgpaInputRef.current.getBoundingClientRect();
    const spinnerZone = 28; // px from right edge to detect native spinner click
    if (e.clientX >= rect.right - spinnerZone) {
      const midY = rect.top + rect.height / 2;
      const isUp = e.clientY < midY;
      const current = Number(targetCgpaValue);
      if (!Number.isNaN(current) && ((isUp && current >= 4) || (!isUp && current <= 0))) {
        flashCgpaLimit();
      }
    }
  };

  const handleDegreePointerDown = (e) => {
    if (!degreeInputRef.current || typeof e.clientX !== 'number') return;
    const rect = degreeInputRef.current.getBoundingClientRect();
    const spinnerZone = 28;
    if (e.clientX >= rect.right - spinnerZone) {
      const midY = rect.top + rect.height / 2;
      const isUp = e.clientY < midY;
      const current = Number(targetDegreeCredits);
      if (!Number.isNaN(current) && (!isUp && current <= 0)) {
        // clicking down on spinner at lower limit
        flashDegreeCreditsLimit();
      }
    }
  };

  return (
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
              ref={degreeInputRef}
              type="number" 
              min="0"
              className={`w-full border rounded-lg text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none font-mono transition-all focus:border-blue-500 ${
                isDegreeCreditsFlashActive
                  ? "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-500 shadow-[0_0_0_3px_rgba(248,113,113,0.18)]"
                  : "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/60 dark:border-blue-800/60"
              }`} 
              placeholder="e.g. 130" 
              value={targetDegreeCredits}
              onChange={(e) => handleTargetDegreeCreditsChange(e.target.value)}
              onKeyDown={handleTargetDegreeCreditsKeyDown}
              onPointerDown={handleDegreePointerDown}
              onBlur={(e) => setTargetDegreeCredits(clampTargetDegreeCredits(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Target CGPA</label>
            <input 
              ref={cgpaInputRef}
              type="number" 
              min="0"
              max="4"
              step="0.1"
              className={`w-full border rounded-lg text-gray-900 dark:text-gray-100 text-sm px-3 py-2 outline-none font-mono transition-all focus:border-blue-500 ${
                isCgpaFlashActive
                  ? "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-500 shadow-[0_0_0_3px_rgba(248,113,113,0.18)]"
                  : "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200/60 dark:border-blue-800/60"
              }`} 
              placeholder="e.g. 3.50" 
              value={targetCgpaValue}
              onChange={(e) => handleTargetCgpaChange(e.target.value)}
              onKeyDown={handleTargetCgpaKeyDown}
              onPointerDown={handleCgpaPointerDown}
              onBlur={(e) => setTargetCgpaValue(clampTargetCgpa(e.target.value))}
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

        {/* GPA Tolerance Breakdown */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Grade Tolerance</div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700/50"></div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3 leading-relaxed">
            {gpaTolerance.length > 0
              ? <>Max non-4.0 courses you can afford (assuming 3-credit courses) and still reach <span className="font-bold text-blue-600 dark:text-blue-400">{targetCgpaNumber.toFixed(2)}</span> CGPA</>
              : "Fill up Total Degree Credits and Target CGPA above to see how many non-4.0 grades you can afford."
            }
          </p>
          {gpaTolerance.length > 0 && (
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
              {gpaTolerance.map(({ grade, count, fourCount }) => {
                const severity = grade >= 3.0 ? 'green' : grade >= 2.0 ? 'amber' : 'red';
                const colors = {
                  green: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-700/50', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' },
                  amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-300 dark:border-amber-700/50', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200' },
                  red: { bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-300 dark:border-red-700/50', badge: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' },
                }[severity];

                return (
                  <div key={grade} className={`flex items-center gap-2 p-2.5 rounded-lg border ${colors.bg} ${colors.border} transition-all hover:scale-[1.01]`}>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-[11px] font-bold font-mono shrink-0">
                        {fourCount} <span className="text-[9px] font-semibold">× 4.0</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 text-[10px] font-medium">and</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono shrink-0 ${colors.badge}`}>
                        {count} <span className="text-[9px] font-semibold">× {grade.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
