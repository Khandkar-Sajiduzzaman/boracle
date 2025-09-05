// ExportRoutinePNG.jsx
'use client';
import React, { useRef } from 'react';
import * as htmlToImage from 'html-to-image';
// Install with: npm install html-to-image

const ExportRoutinePNG = ({ selectedCourses }) => {
  const exportRef = useRef(null);
  
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
    if (!selectedCourses || selectedCourses.length === 0) return [];
    
    const [slotStart, slotEnd] = timeSlot.split('-');
    const slotStartMin = timeToMinutes(slotStart);
    const slotEndMin = timeToMinutes(slotEnd);
    
    return selectedCourses.filter(course => {
      const classMatch = course.sectionSchedule?.classSchedules?.some(schedule => {
        if (schedule.day !== day.toUpperCase()) return false;
        const scheduleStart = timeToMinutes(formatTime(schedule.startTime));
        return scheduleStart >= slotStartMin && scheduleStart < slotEndMin;
      });
      
      const labMatch = course.labSchedules?.some(schedule => {
        if (schedule.day !== day.toUpperCase()) return false;
        const scheduleStart = timeToMinutes(formatTime(schedule.startTime));
        return scheduleStart >= slotStartMin && scheduleStart < slotEndMin;
      });
      
      return classMatch || labMatch;
    });
  };
  
  const hasConflict = (day, timeSlot) => {
    const courses = getCoursesForSlot(day, timeSlot);
    return courses.length > 1;
  };
  
  const exportToPNG = async () => {
    if (!selectedCourses || selectedCourses.length === 0) {
      alert('Please select some courses first');
      return;
    }

    if (exportRef.current === null) {
      return;
    }

    try {
      // Temporarily make the element visible for capture
      const originalStyle = exportRef.current.style.cssText;
      exportRef.current.style.position = 'fixed';
      exportRef.current.style.left = '0';
      exportRef.current.style.top = '0';
      exportRef.current.style.zIndex = '-1';
      exportRef.current.style.visibility = 'visible';
      
      // Using html-to-image
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      
      // Restore original style
      exportRef.current.style.cssText = originalStyle;
      
      // Download the image
      const link = document.createElement('a');
      link.download = `routine-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert('Failed to export routine as PNG. Please try again.');
      
      // Restore original style on error
      if (exportRef.current) {
        exportRef.current.style.position = 'absolute';
        exportRef.current.style.left = '-9999px';
        exportRef.current.style.top = '0';
      }
    }
  };
  
  const totalCredits = selectedCourses?.reduce((sum, course) => sum + (course.courseCredit || 0), 0) || 0;
  
  return (
    <>
      {/* Export Button */}
      <button
        onClick={exportToPNG}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors text-white"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Save as PNG
      </button>

      {/* Hidden Routine Table for Export */}
      <div 
        ref={exportRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          backgroundColor: '#111827',
          padding: '24px',
          width: '1400px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#e5e7eb'
        }}
      >
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '8px' }}>
            Course Routine
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Total Credits: {totalCredits} | Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1f2937' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #374151' }}>
              <th style={{ 
                padding: '16px', 
                textAlign: 'left', 
                color: '#9ca3af', 
                fontSize: '14px',
                fontWeight: '600',
                width: '140px'
              }}>
                Time/Day
              </th>
              {days.map(day => (
                <th key={day} style={{ 
                  padding: '16px 12px', 
                  textAlign: 'center', 
                  color: '#9ca3af', 
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ 
                  padding: '16px', 
                  color: '#9ca3af', 
                  fontSize: '13px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}>
                  {timeSlot}
                </td>
                {days.map(day => {
                  const courses = getCoursesForSlot(day, timeSlot);
                  const conflict = hasConflict(day, timeSlot);
                  
                  return (
                    <td key={`${day}-${timeSlot}`} style={{ 
                      padding: '8px', 
                      borderLeft: '1px solid #374151',
                      verticalAlign: 'top',
                      minHeight: '80px'
                    }}>
                      {courses.map(course => {
                        const isLab = course.labSchedules?.some(s => 
                          s.day === day.toUpperCase() && 
                          timeToMinutes(formatTime(s.startTime)) >= timeToMinutes(timeSlot.split('-')[0]) &&
                          timeToMinutes(formatTime(s.startTime)) < timeToMinutes(timeSlot.split('-')[1])
                        );
                        
                        let bgColor = 'rgba(30, 58, 138, 0.5)';
                        let borderColor = '#2563eb';
                        if (conflict) {
                          bgColor = 'rgba(127, 29, 29, 0.5)';
                          borderColor = '#dc2626';
                        } else if (isLab) {
                          bgColor = 'rgba(88, 28, 135, 0.5)';
                          borderColor = '#9333ea';
                        }
                        
                        return (
                          <div
                            key={course.sectionId}
                            style={{
                              backgroundColor: bgColor,
                              border: `1px solid ${borderColor}`,
                              padding: '10px',
                              borderRadius: '6px',
                              marginBottom: courses.length > 1 ? '4px' : '0',
                              fontSize: '12px'
                            }}
                          >
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#ffffff' }}>
                              {course.courseCode}{isLab ? 'L' : ''}-{course.sectionName}
                            </div>
                            <div style={{ color: '#d1d5db', marginTop: '2px', fontSize: '11px' }}>
                              {course.roomName || course.roomNumber || 'TBA'}
                            </div>
                            {course.faculties && (
                              <div style={{ color: '#9ca3af', marginTop: '2px', fontSize: '11px' }}>
                                {course.faculties}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid #374151',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>
            Made with ❤️ from https://oracle.eniamza.com
          </p>
        </div>
      </div>
    </>
  );
};

export default ExportRoutinePNG;