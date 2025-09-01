'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Filter, Plus, Calendar, Clock, X, Users, BookOpen, Download, Save, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useSession } from 'next-auth/react';

const RoutineTable = ({ selectedCourses, removeFromRoutine, displayToast }) => {
  const routineRef = useRef(null);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, showLeft: false });
  
  const timeSlots = [
    '08:00 AM-09:20 AM',
    '09:30 AM-10:50 AM',
    '11:00 AM-12:20 PM',
    '12:30 PM-01:50 PM',
    '02:00 PM-03:20 PM',
    '03:30 PM-04:50 PM',
    '05:00 PM-06:20 PM'
  ];
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Parse time to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
    return totalMinutes;
  };
  
  // Format time from 24h to 12h
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  // Get courses for a specific time slot and day
  const getCoursesForSlot = (day, timeSlot) => {
    const [slotStart, slotEnd] = timeSlot.split('-');
    const slotStartMin = timeToMinutes(slotStart);
    const slotEndMin = timeToMinutes(slotEnd);
    
    return selectedCourses.filter(course => {
      // Check class schedules
      const classMatch = course.sectionSchedule?.classSchedules?.some(schedule => {
        if (schedule.day !== day.toUpperCase()) return false;
        const scheduleStart = timeToMinutes(formatTime(schedule.startTime));
        const scheduleEnd = timeToMinutes(formatTime(schedule.endTime));
        return scheduleStart >= slotStartMin && scheduleStart < slotEndMin;
      });
      
      // Check lab schedules
      const labMatch = course.labSchedules?.some(schedule => {
        if (schedule.day !== day.toUpperCase()) return false;
        const scheduleStart = timeToMinutes(formatTime(schedule.startTime));
        const scheduleEnd = timeToMinutes(formatTime(schedule.endTime));
        return scheduleStart >= slotStartMin && scheduleStart < slotEndMin;
      });
      
      return classMatch || labMatch;
    });
  };
  
  // Check for time conflicts
  const hasConflict = (day, timeSlot) => {
    const courses = getCoursesForSlot(day, timeSlot);
    return courses.length > 1;
  };
  
  // Export to PNG with clean DOM approach
  const exportToPNG = async () => {
    try {
      if (!routineRef.current) {
        displayToast('Routine table not found. Please try again.', 'error');
        return;
      }

      // Create a clean version of the routine table without Tailwind classes
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        background-color: rgb(17, 24, 39);
        color: rgb(229, 231, 235);
        padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
        width: 1200px;
        position: absolute;
        top: -9999px;
        left: -9999px;
      `;

      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        color: rgb(229, 231, 235);
      `;

      // Create header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.borderBottom = '1px solid rgb(55, 65, 81)';

      const timeHeader = document.createElement('th');
      timeHeader.textContent = 'Time/Day';
      timeHeader.style.cssText = `
        text-align: left;
        padding: 16px;
        font-size: 16px;
        font-weight: 500;
        color: rgb(156, 163, 175);
        width: 176px;
      `;
      headerRow.appendChild(timeHeader);

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.cssText = `
          text-align: center;
          padding: 16px 12px;
          font-size: 16px;
          font-weight: 500;
          color: rgb(156, 163, 175);
        `;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create body
      const tbody = document.createElement('tbody');
      const timeSlots = [
        '08:00 AM-09:20 AM',
        '09:30 AM-10:50 AM',
        '11:00 AM-12:20 PM',
        '12:30 PM-01:50 PM',
        '02:00 PM-03:20 PM',
        '03:30 PM-04:50 PM',
        '05:00 PM-06:20 PM'
      ];

      timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgb(31, 41, 55)';

        const timeCell = document.createElement('td');
        timeCell.textContent = timeSlot;
        timeCell.style.cssText = `
          padding: 16px;
          font-size: 16px;
          font-weight: 500;
          color: rgb(156, 163, 175);
          white-space: nowrap;
        `;
        row.appendChild(timeCell);

        days.forEach(day => {
          const cell = document.createElement('td');
          cell.style.cssText = `
            padding: 8px;
            border-left: 1px solid rgb(31, 41, 55);
            min-height: 80px;
            vertical-align: top;
          `;

          // Get courses for this slot (reuse existing logic)
          const courses = getCoursesForSlot(day, timeSlot);
          const conflict = courses.length > 1;

          courses.forEach(course => {
            const isLab = course.labSchedules?.some(s => 
              s.day === day.toUpperCase() && 
              timeToMinutes(formatTime(s.startTime)) >= timeToMinutes(timeSlot.split('-')[0]) &&
              timeToMinutes(formatTime(s.startTime)) < timeToMinutes(timeSlot.split('-')[1])
            );

            const courseDiv = document.createElement('div');
            courseDiv.style.cssText = `
              padding: 12px;
              border-radius: 4px;
              font-size: 14px;
              margin-bottom: 4px;
              border: 1px solid;
              ${conflict 
                ? 'background-color: rgba(127, 29, 29, 0.5); border-color: rgb(220, 38, 38);' 
                : isLab 
                  ? 'background-color: rgba(88, 28, 135, 0.5); border-color: rgb(147, 51, 234);'
                  : 'background-color: rgba(30, 58, 138, 0.5); border-color: rgb(37, 99, 235);'
              }
            `;

            const courseCode = document.createElement('div');
            courseCode.textContent = `${course.courseCode}${isLab ? 'L' : ''}-${course.sectionName}`;
            courseCode.style.cssText = 'font-weight: 600; font-size: 16px;';
            courseDiv.appendChild(courseCode);

            const room = document.createElement('div');
            room.textContent = course.roomName || course.roomNumber || 'TBA';
            room.style.cssText = 'color: rgb(156, 163, 175); margin-top: 2px;';
            courseDiv.appendChild(room);

            if (course.faculties) {
              const faculty = document.createElement('div');
              faculty.textContent = course.faculties;
              faculty.style.cssText = 'color: rgb(107, 114, 128); margin-top: 2px;';
              courseDiv.appendChild(faculty);
            }

            cell.appendChild(courseDiv);
          });

          row.appendChild(cell);
        });

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      exportContainer.appendChild(table);

      // Add footer
      const footer = document.createElement('div');
      footer.style.cssText = `
        margin-top: 16px;
        text-align: center;
        border-top: 1px solid rgb(55, 65, 81);
        padding-top: 16px;
        font-size: 14px;
        color: rgb(107, 114, 128);
      `;
      footer.textContent = 'Made with ❤️ from https://oracle.eniamza.com';
      exportContainer.appendChild(footer);

      document.body.appendChild(exportContainer);

      try {
        const canvas = await html2canvas(exportContainer, {
          backgroundColor: '#111827',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false
        });
        
        const link = document.createElement('a');
        link.download = `my-routine-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } finally {
        document.body.removeChild(exportContainer);
      }
      
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      displayToast('Failed to export as PNG. Please try again.', 'error');
    }
  };
  
  return (
    <div className="w-full">
      <div ref={routineRef} className="bg-gray-900 p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-4 text-base font-medium text-gray-400 w-44">Time/Day</th>
              {days.map(day => (
                <th key={day} className="text-center py-4 px-3 text-base font-medium text-gray-400">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot} className="border-b border-gray-800">
                <td className="py-4 px-4 text-base font-medium text-gray-400 whitespace-nowrap">
                  {timeSlot}
                </td>
                {days.map(day => {
                  const courses = getCoursesForSlot(day, timeSlot);
                  const conflict = hasConflict(day, timeSlot);
                  
                  return (
                    <td key={`${day}-${timeSlot}`} className="p-2 border-l border-gray-800 relative">
                      {courses.length > 0 && (
                        <div className={`min-h-[80px] ${conflict ? 'space-y-1' : ''}`}>
                          {courses.map(course => {
                            const isLab = course.labSchedules?.some(s => 
                              s.day === day.toUpperCase() && 
                              timeToMinutes(formatTime(s.startTime)) >= timeToMinutes(timeSlot.split('-')[0]) &&
                              timeToMinutes(formatTime(s.startTime)) < timeToMinutes(timeSlot.split('-')[1])
                            );
                            
                            return (
                              <div
                                key={course.sectionId}
                                className={`p-3 rounded text-sm ${
                                  conflict 
                                    ? 'bg-red-900/50 border border-red-600' 
                                    : isLab 
                                      ? 'bg-purple-900/50 border border-purple-600'
                                      : 'bg-blue-900/50 border border-blue-600'
                                } hover:opacity-80 transition-opacity cursor-pointer group relative`}
                                onClick={() => removeFromRoutine(course)}
                                onMouseEnter={(e) => {
                                  setHoveredCourse(course);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const viewportWidth = window.innerWidth;
                                  const tooltipWidth = 384; // w-96 = 384px
                                  
                                  // Position tooltip on left if it would go outside viewport
                                  const shouldShowLeft = rect.right + tooltipWidth + 10 > viewportWidth;
                                  
                                  setTooltipPosition({ 
                                    x: shouldShowLeft ? rect.left - tooltipWidth - 10 : rect.right + 10, 
                                    y: rect.top,
                                    showLeft: shouldShowLeft
                                  });
                                }}
                                onMouseLeave={() => setHoveredCourse(null)}
                              >
                                <div className="font-semibold text-base">
                                  {course.courseCode}{isLab && 'L'}-{course.sectionName}-{course.roomName || course.roomNumber || 'TBA'}
                                </div>
                                {course.faculties && (
                                  <div className="text-gray-500 truncate text-sm mt-1">
                                    {course.faculties}
                                  </div>
                                )}
                                <button className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-3 h-3 text-red-400" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Single global tooltip */}
        {hoveredCourse && (
          <div 
            className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl w-96 pointer-events-none"
            style={{ 
              left: `${Math.max(10, Math.min(tooltipPosition.x, window.innerWidth - 394))}px`, 
              top: `${tooltipPosition.y}px`,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="space-y-2 text-sm">
              <div className="font-bold text-lg">{hoveredCourse.courseCode}-{hoveredCourse.sectionName}</div>
              <div><span className="text-gray-400">Credits:</span> {hoveredCourse.courseCredit}</div>
              <div><span className="text-gray-400">Faculty:</span> {hoveredCourse.faculties || 'TBA'}</div>
              <div><span className="text-gray-400">Type:</span> {hoveredCourse.sectionType}</div>
              <div><span className="text-gray-400">Capacity:</span> {hoveredCourse.capacity} (Filled: {hoveredCourse.consumedSeat})</div>
              <div><span className="text-gray-400">Prerequisites:</span> {hoveredCourse.prerequisiteCourses || 'None'}</div>
              <div><span className="text-gray-400">Room:</span> {hoveredCourse.roomName || 'TBA'}</div>
              {hoveredCourse.labCourseCode && (
                <div><span className="text-gray-400">Lab:</span> {hoveredCourse.labCourseCode} - {hoveredCourse.labRoomName}</div>
              )}
              <div><span className="text-gray-400">Mid Exam:</span> {hoveredCourse.sectionSchedule?.midExamDetail || 'TBA'}</div>
              <div><span className="text-gray-400">Final Exam:</span> {hoveredCourse.sectionSchedule?.finalExamDetail || 'TBA'}</div>
              <div><span className="text-gray-400">Class Period:</span> {hoveredCourse.sectionSchedule?.classStartDate} to {hoveredCourse.sectionSchedule?.classEndDate}</div>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-center text-sm text-gray-500">
          Made with ❤️ from https://oracle.eniamza.com
        </div>
      </div>
      
      {selectedCourses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No courses selected. Add courses from the list to see them in your routine.
        </div>
      )}
      
      {selectedCourses.length > 0 && (
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-900/50 border border-blue-600 rounded"></div>
            <span className="text-gray-400">Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-900/50 border border-purple-600 rounded"></div>
            <span className="text-gray-400">Lab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-900/50 border border-red-600 rounded"></div>
            <span className="text-gray-400">Conflict</span>
          </div>
        </div>
      )}
    </div>
  );
};


const PreRegistrationPage = () => {
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [creditLimitWarning, setCreditLimitWarning] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [filters, setFilters] = useState({
    hideFilled: false,
    avoidFaculties: []
  });
  const [facultySearch, setFacultySearch] = useState('');
  const [displayCount, setDisplayCount] = useState(50);
  const observerRef = useRef();
  const lastCourseRef = useRef();
  const routineRef = useRef(null);

  // Show toast notification
  const displayToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Calculate total credits
  const totalCredits = useMemo(() => {
    return selectedCourses.reduce((sum, course) => sum + (course.courseCredit || 0), 0);
  }, [selectedCourses]);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://usis-cdn.eniamza.com/connect.json');
        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...courses];
    
    // Apply search
    if (debouncedSearchTerm) {
      filtered = filtered.filter(course => 
        course.courseCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        course.faculties?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        course.sectionName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.hideFilled) {
      filtered = filtered.filter(course => 
        course.capacity > course.consumedSeat
      );
    }
    
    if (filters.avoidFaculties.length > 0) {
      filtered = filtered.filter(course => 
        !filters.avoidFaculties.some(faculty => 
          course.faculties?.toLowerCase().includes(faculty.toLowerCase())
        )
      );
    }
    
    setFilteredCourses(filtered);
    setDisplayCount(50);
  }, [debouncedSearchTerm, courses, filters]);

  // Update displayed courses when filtered courses or display count changes
  useEffect(() => {
    setDisplayedCourses(filteredCourses.slice(0, displayCount));
  }, [filteredCourses, displayCount]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || displayCount >= filteredCourses.length) return;
    
    const currentRef = lastCourseRef.current;
    
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && displayCount < filteredCourses.length) {
          console.log('Loading more courses...', { current: displayCount, total: filteredCourses.length });
          setDisplayCount(prev => {
            const newCount = Math.min(prev + 50, filteredCourses.length);
            console.log('New display count:', newCount);
            return newCount;
          });
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [loading, displayCount, filteredCourses.length, displayedCourses]);

  // Format time
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format schedule with newlines
  const formatSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return 'TBA';
    return schedules.map(s => 
      `${s.day.slice(0, 3)} ${formatTime(s.startTime)}-${formatTime(s.endTime)}`
    ).join('\n');
  };

  // Add course to routine
  const addToRoutine = (course) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c.sectionId === course.sectionId);
      
      if (exists) {
        // Removing course
        setCreditLimitWarning(false);
        return prev.filter(c => c.sectionId !== course.sectionId);
      } else {
        // Adding course - check credit limit
        const newTotalCredits = prev.reduce((sum, c) => sum + (c.courseCredit || 0), 0) + (course.courseCredit || 0);
        
        if (newTotalCredits > 15) {
          setCreditLimitWarning(true);
          setTimeout(() => setCreditLimitWarning(false), 3000);
          return prev; // Don't add if it exceeds 15 credits
        }
        
        return [...prev, course];
      }
    });
  };

  // Save routine to database
  const saveRoutine = async () => {
    if (!session?.user?.email) {
      displayToast('Please login to save your routine', 'error');
      return;
    }

    if (selectedCourses.length === 0) {
      displayToast('Please select some courses first', 'error');
      return;
    }

    setSavingRoutine(true);
    
    try {
      // Extract section IDs and encode as base64
      const sectionIds = selectedCourses.map(course => course.sectionId);
      const routineStr = btoa(JSON.stringify(sectionIds));
      
      const response = await fetch('/api/routine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineStr,
          email: session.user.email
        }),
      });

      if (response.ok) {
        displayToast('Routine saved successfully!', 'success');
      } else {
        throw new Error('Failed to save routine');
      }
    } catch (error) {
      console.error('Error saving routine:', error);
      displayToast('Failed to save routine. Please try again.', 'error');
    } finally {
      setSavingRoutine(false);
    }
  };

  // Export to PNG with clean DOM approach
  const exportToPNG = async () => {
    try {
      if (selectedCourses.length === 0) {
        displayToast('Please select some courses first', 'error');
        return;
      }

      // Helper functions (reuse from RoutineTable)
      const timeSlots = [
        '08:00 AM-09:20 AM',
        '09:30 AM-10:50 AM',
        '11:00 AM-12:20 PM',
        '12:30 PM-01:50 PM',
        '02:00 PM-03:20 PM',
        '03:30 PM-04:50 PM',
        '05:00 PM-06:20 PM'
      ];
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const timeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes;
        if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
        if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
        return totalMinutes;
      };
      
      const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };
      
      const getCoursesForSlot = (day, timeSlot) => {
        const [slotStart, slotEnd] = timeSlot.split('-');
        const slotStartMin = timeToMinutes(slotStart);
        const slotEndMin = timeToMinutes(slotEnd);
        
        return selectedCourses.filter(course => {
          const classMatch = course.sectionSchedule?.classSchedules?.some(schedule => {
            if (schedule.day !== day.toUpperCase()) return false;
            const scheduleStart = timeToMinutes(formatTime(schedule.startTime));
            const scheduleEnd = timeToMinutes(formatTime(schedule.endTime));
            return scheduleStart >= slotStartMin && scheduleStart < slotEndMin;
          });
          
          const labMatch = course.labSchedules?.some(schedule => {
            if (schedule.day !== day.toUpperCase()) return false;
            const scheduleStart = timeToMinutes(formatTime(schedule.startTime));
            const scheduleEnd = timeToMinutes(formatTime(schedule.endTime));
            return scheduleStart >= slotStartMin && scheduleStart < slotEndMin;
          });
          
          return classMatch || labMatch;
        });
      };

      // Create a clean version of the routine table without Tailwind classes
      const exportContainer = document.createElement('div');
      exportContainer.style.cssText = `
        background-color: rgb(17, 24, 39);
        color: rgb(229, 231, 235);
        padding: 16px;
        font-family: system-ui, -apple-system, sans-serif;
        width: 1200px;
        position: absolute;
        top: -9999px;
        left: -9999px;
      `;

      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        color: rgb(229, 231, 235);
      `;

      // Create header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.borderBottom = '1px solid rgb(55, 65, 81)';

      const timeHeader = document.createElement('th');
      timeHeader.textContent = 'Time/Day';
      timeHeader.style.cssText = `
        text-align: left;
        padding: 16px;
        font-size: 16px;
        font-weight: 500;
        color: rgb(156, 163, 175);
        width: 176px;
      `;
      headerRow.appendChild(timeHeader);

      days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.cssText = `
          text-align: center;
          padding: 16px 12px;
          font-size: 16px;
          font-weight: 500;
          color: rgb(156, 163, 175);
        `;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create body
      const tbody = document.createElement('tbody');

      timeSlots.forEach(timeSlot => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgb(31, 41, 55)';

        const timeCell = document.createElement('td');
        timeCell.textContent = timeSlot;
        timeCell.style.cssText = `
          padding: 16px;
          font-size: 16px;
          font-weight: 500;
          color: rgb(156, 163, 175);
          white-space: nowrap;
        `;
        row.appendChild(timeCell);

        days.forEach(day => {
          const cell = document.createElement('td');
          cell.style.cssText = `
            padding: 8px;
            border-left: 1px solid rgb(31, 41, 55);
            min-height: 80px;
            vertical-align: top;
          `;

          const courses = getCoursesForSlot(day, timeSlot);
          const conflict = courses.length > 1;

          courses.forEach(course => {
            const isLab = course.labSchedules?.some(s => 
              s.day === day.toUpperCase() && 
              timeToMinutes(formatTime(s.startTime)) >= timeToMinutes(timeSlot.split('-')[0]) &&
              timeToMinutes(formatTime(s.startTime)) < timeToMinutes(timeSlot.split('-')[1])
            );

            const courseDiv = document.createElement('div');
            courseDiv.style.cssText = `
              padding: 12px;
              border-radius: 4px;
              font-size: 14px;
              margin-bottom: 4px;
              border: 1px solid;
              ${conflict 
                ? 'background-color: rgba(127, 29, 29, 0.5); border-color: rgb(220, 38, 38);' 
                : isLab 
                  ? 'background-color: rgba(88, 28, 135, 0.5); border-color: rgb(147, 51, 234);'
                  : 'background-color: rgba(30, 58, 138, 0.5); border-color: rgb(37, 99, 235);'
              }
            `;

            const courseCode = document.createElement('div');
            courseCode.textContent = `${course.courseCode}${isLab ? 'L' : ''}-${course.sectionName}`;
            courseCode.style.cssText = 'font-weight: 600; font-size: 16px;';
            courseDiv.appendChild(courseCode);

            const room = document.createElement('div');
            room.textContent = course.roomName || course.roomNumber || 'TBA';
            room.style.cssText = 'color: rgb(156, 163, 175); margin-top: 2px;';
            courseDiv.appendChild(room);

            if (course.faculties) {
              const faculty = document.createElement('div');
              faculty.textContent = course.faculties;
              faculty.style.cssText = 'color: rgb(107, 114, 128); margin-top: 2px;';
              courseDiv.appendChild(faculty);
            }

            cell.appendChild(courseDiv);
          });

          row.appendChild(cell);
        });

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      exportContainer.appendChild(table);

      // Add footer
      const footer = document.createElement('div');
      footer.style.cssText = `
        margin-top: 16px;
        text-align: center;
        border-top: 1px solid rgb(55, 65, 81);
        padding-top: 16px;
        font-size: 14px;
        color: rgb(107, 114, 128);
      `;
      footer.textContent = 'Made with ❤️ from https://oracle.eniamza.com';
      exportContainer.appendChild(footer);

      document.body.appendChild(exportContainer);

      try {
        const canvas = await html2canvas(exportContainer, {
          backgroundColor: '#111827',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false
        });
        
        const link = document.createElement('a');
        link.download = `my-routine-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } finally {
        document.body.removeChild(exportContainer);
      }
      
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      displayToast('Failed to export as PNG. Please try again.', 'error');
    }
  };

  // Remove faculty from avoid list
  const removeFaculty = (faculty) => {
    setFilters(prev => ({
      ...prev,
      avoidFaculties: prev.avoidFaculties.filter(f => f !== faculty)
    }));
  };

  // Add faculty to avoid list
  const addFacultyToAvoid = (e) => {
    if (e.key === 'Enter' && facultySearch.trim()) {
      setFilters(prev => ({
        ...prev,
        avoidFaculties: [...prev.avoidFaculties, facultySearch.trim()]
      }));
      setFacultySearch('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}

      {/* Credit Limit Warning */}
      {creditLimitWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Cannot add more than 15 credits!
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          {/* <h1 className="text-2xl font-bold text-white-500 mb-4 text-center">Build Routines with Confidence</h1> */}
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter Course Code or Faculty Initial... e.g - CSE or FLA"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Course Code</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Fac. Init.</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Prereq</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">Seat Cap.</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">Booked</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">Available</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Class Schedule</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Lab Schedule</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">Exam Day</th>
                  <th className="text-center py-3 px-2 text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedCourses.map((course, index) => {
                  const isLast = index === displayedCourses.length - 1;
                  const isSelected = selectedCourses.find(c => c.sectionId === course.sectionId);
                  const availableSeats = course.capacity - course.consumedSeat;
                  
                  return (
                    <tr 
                      key={course.sectionId}
                      ref={isLast && displayCount < filteredCourses.length ? lastCourseRef : null}
                      className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-green-900/20' : ''}`}
                    >
                      <td className="py-3 px-2 text-sm font-medium">
                        {course.courseCode}-[{course.sectionName}]
                      </td>
                      <td className="py-3 px-2 text-sm">{course.faculties || 'TBA'}</td>
                      <td className="py-3 px-2 text-sm text-gray-400">
                        {course.prerequisiteCourses || 'None'}
                      </td>
                      <td className="py-3 px-2 text-sm text-center">{course.capacity}</td>
                      <td className="py-3 px-2 text-sm text-center">{course.consumedSeat}</td>
                      <td className="py-3 px-2 text-sm text-center">
                        <span className={`font-medium ${availableSeats > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {availableSeats}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs whitespace-pre-line">
                        {formatSchedule(course.sectionSchedule?.classSchedules)}
                      </td>
                      <td className="py-3 px-2 text-xs whitespace-pre-line">
                        {course.labSchedules?.length > 0 ? formatSchedule(course.labSchedules) : 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {course.sectionSchedule?.finalExamDetail || 'TBA'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => addToRoutine(course)}
                          className={`p-2 rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {displayCount < filteredCourses.length && (
              <div className="text-center py-4">
                <div className="text-gray-400 mb-4">
                  Showing {displayCount} of {filteredCourses.length} courses
                </div>
                <button
                  onClick={() => setDisplayCount(prev => Math.min(prev + 50, filteredCourses.length))}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Load More ({Math.min(50, filteredCourses.length - displayCount)} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            
            <div className="space-y-4">
              {/* Hide Filled Sections */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hideFilled}
                  onChange={(e) => setFilters(prev => ({ ...prev, hideFilled: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span>Hide Filled Sections</span>
              </label>
              
              {/* Avoid Faculties */}
              <div>
                <label className="block text-sm font-medium mb-2">Avoid Faculties</label>
                <input
                  type="text"
                  placeholder="Type faculty initial and press Enter"
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  onKeyDown={addFacultyToAvoid}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.avoidFaculties.map(faculty => (
                    <span
                      key={faculty}
                      className="px-3 py-1 bg-red-600/20 border border-red-600 rounded-full text-sm flex items-center gap-2"
                    >
                      {faculty}
                      <button
                        onClick={() => removeFaculty(faculty)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setFilters({ hideFilled: false, avoidFaculties: [] });
                  setShowFilterModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine Modal */}
      {showRoutineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">My Routine</h2>
                <p className="text-sm text-gray-400">
                  Total Credits: <span className={`font-bold ${totalCredits > 15 ? 'text-red-400' : 'text-green-400'}`}>
                    {totalCredits}/15
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                {/* <button
                  onClick={exportToPNG}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Save as PNG
                </button> */}
                <button
                  onClick={saveRoutine}
                  disabled={savingRoutine || !session}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {savingRoutine ? 'Saving...' : 'Save Routine'}
                </button>
                <button
                  onClick={() => setShowRoutineModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto" ref={routineRef}>
              <RoutineTable selectedCourses={selectedCourses} removeFromRoutine={addToRoutine} displayToast={displayToast} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Routine Button */}
      <button
        onClick={() => setShowRoutineModal(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all hover:scale-110 z-40"
      >
        <div className="relative">
          <Calendar className="w-6 h-6" />
          {selectedCourses.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedCourses.length}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export default PreRegistrationPage;