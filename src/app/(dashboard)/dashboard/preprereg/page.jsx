'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Filter, Plus, Calendar, Clock, X, Users, BookOpen, Download, Save, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import RoutineTableGrid from '@/components/routine/RoutineTableGrid';
import ExportRoutinePNG from '@/components/routine/ExportRoutinePNG';



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
      const existsBySection = prev.find(c => c.sectionId === course.sectionId);
      const existsByCourse = prev.find(c => c.courseCode === course.courseCode);
      
      if (existsBySection) {
        // Removing course
        setCreditLimitWarning(false);
        return prev.filter(c => c.sectionId !== course.sectionId);
      } else if (existsByCourse) {
        // Same course already exists (different section) - prevent adding and show warning
        displayToast(`${course.courseCode} is already in your routine (${existsByCourse.sectionName}). Remove it first to add a different section.`, 'error');
        return prev; // Don't add the duplicate course
      } else {
        // Adding new course - check credit limit
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
          toast.type === 'success' ? 'bg-green-600 text-white' : 
          toast.type === 'info' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : toast.type === 'info' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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
                      <td className="py-3 px-2 text-sm text-gray-400 whitespace-pre-line">
                        {(course.prerequisiteCourses || 'None').replace(/OR/g, '/').replace(/AND/g, '+').replace(/\//g, '/\n')}
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
                <button
                  onClick={saveRoutine}
                  disabled={savingRoutine || !session}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {savingRoutine ? 'Saving...' : 'Save Routine'}
                </button>
                <ExportRoutinePNG selectedCourses={selectedCourses} routineRef={routineRef} displayToast={displayToast} />
                <button
                  onClick={() => setShowRoutineModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto" ref={routineRef}>
              <RoutineTableGrid 
                selectedCourses={selectedCourses} 
                onRemoveCourse={addToRoutine} 
                displayToast={displayToast}
                showRemoveButtons={true}
              />
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