import { useRef } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { formatSemesterName } from "./gradesheet-utils";

export default function UploadBar({ courses, lastParsedSemester, onFileUpload }) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
    e.target.value = "";
  };

  if (courses.length > 0) {
    return (
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
        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} id="gradesheet-file-input" />
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={(e) => { e.preventDefault(); onFileUpload(e.dataTransfer.files[0]); }}
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
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} id="gradesheet-file-input" />
    </div>
  );
}
