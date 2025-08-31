'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Filter, Plus, Calendar, Clock, X, Users, BookOpen } from 'lucide-react';

const RoutineTable = ({ selectedCourses, removeFromRoutine }) => {
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
  
  return (
    <div className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400 w-40">Time/Day</th>
            {days.map(day => (
              <th key={day} className="text-center py-3 px-2 text-sm font-medium text-gray-400">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(timeSlot => (
            <tr key={timeSlot} className="border-b border-gray-800">
              <td className="py-3 px-4 text-sm font-medium text-gray-400 whitespace-nowrap">
                {timeSlot}
              </td>
              {days.map(day => {
                const courses = getCoursesForSlot(day, timeSlot);
                const conflict = hasConflict(day, timeSlot);
                
                return (
                  <td key={`${day}-${timeSlot}`} className="p-2 border-l border-gray-800">
                    {courses.length > 0 && (
                      <div className={`min-h-[60px] ${conflict ? 'space-y-1' : ''}`}>
                        {courses.map(course => {
                          const isLab = course.labSchedules?.some(s => 
                            s.day === day.toUpperCase() && 
                            timeToMinutes(formatTime(s.startTime)) >= timeToMinutes(timeSlot.split('-')[0]) &&
                            timeToMinutes(formatTime(s.startTime)) < timeToMinutes(timeSlot.split('-')[1])
                          );
                          
                          return (
                            <div
                              key={course.sectionId}
                              className={`p-2 rounded text-xs ${
                                conflict 
                                  ? 'bg-red-900/50 border border-red-600' 
                                  : isLab 
                                    ? 'bg-purple-900/50 border border-purple-600'
                                    : 'bg-blue-900/50 border border-blue-600'
                              } hover:opacity-80 transition-opacity cursor-pointer group relative`}
                              onClick={() => removeFromRoutine(course)}
                            >
                              <div className="font-semibold">
                                {course.courseCode}{isLab && 'L'}-{course.sectionName}
                              </div>
                              <div className="text-gray-400 truncate">
                                {course.roomName || course.roomNumber || 'TBA'}
                              </div>
                              {course.faculties && (
                                <div className="text-gray-500 truncate">
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
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [displayedCourses, setDisplayedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [filters, setFilters] = useState({
    hideFilled: false,
    avoidFaculties: []
  });
  const [facultySearch, setFacultySearch] = useState('');
  const [displayCount, setDisplayCount] = useState(50);
  const observerRef = useRef();
  const lastCourseRef = useRef();

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
    if (loading) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayCount < filteredCourses.length) {
          setDisplayCount(prev => Math.min(prev + 50, filteredCourses.length));
        }
      },
      { threshold: 0.1 }
    );
    
    if (lastCourseRef.current) {
      observer.observe(lastCourseRef.current);
    }
    
    return () => {
      if (lastCourseRef.current) {
        observer.unobserve(lastCourseRef.current);
      }
    };
  }, [loading, displayCount, filteredCourses.length]);

  // Format time
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format schedule
  const formatSchedule = (schedules) => {
    if (!schedules || schedules.length === 0) return 'TBA';
    return schedules.map(s => 
      `${s.day.slice(0, 3)} ${formatTime(s.startTime)}-${formatTime(s.endTime)}`
    ).join(', ');
  };

  // Add course to routine
  const addToRoutine = (course) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c.sectionId === course.sectionId);
      if (exists) {
        return prev.filter(c => c.sectionId !== course.sectionId);
      }
      return [...prev, course];
    });
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
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-yellow-500 mb-4">Course Registration</h1>
          
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
      <div className="max-w-7xl mx-auto px-4 py-6">
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
                      ref={isLast ? lastCourseRef : null}
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
                      <td className="py-3 px-2 text-xs">
                        {formatSchedule(course.sectionSchedule?.classSchedules)}
                      </td>
                      <td className="py-3 px-2 text-xs">
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
              <div className="text-center py-4 text-gray-400">
                Loading more... ({displayCount} of {filteredCourses.length})
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
          <div className="bg-gray-900 rounded-lg p-6 max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">My Routine</h2>
                <p className="text-sm text-gray-400">Total Credits: {selectedCourses.reduce((sum, c) => sum + (c.courseCredit || 0), 0)}</p>
              </div>
              <button
                onClick={() => setShowRoutineModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <RoutineTable selectedCourses={selectedCourses} removeFromRoutine={addToRoutine} />
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