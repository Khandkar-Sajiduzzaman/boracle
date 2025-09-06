// ExportRoutinePNG.jsx
'use client';
import React from 'react';
import * as htmlToImage from 'html-to-image';
// Install with: npm install html-to-image
import { toast } from 'sonner';

const ExportRoutinePNG = ({ selectedCourses, routineRef, displayToast }) => {
  const exportToPNG = async () => {
    if (!selectedCourses || selectedCourses.length === 0) {
      toast.error('Please select some courses first');
      return;
    }

    if (!routineRef?.current) {
      toast.error('Routine table not found');
      return;
      return;
    }

    if (!routineRef?.current) {
      toast.error('Routine table not found');
      return;
    }

    try {
      // Using html-to-image to capture the actual visible routine table
      const dataUrl = await htmlToImage.toPng(routineRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#111827',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      
      // Download the image
      const link = document.createElement('a');
      link.download = `routine-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
      if (displayToast) {
        displayToast('Routine exported successfully!', 'success');
      }
      
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      toast.error('Failed to export routine as PNG. Please try again.');
    }
  };
  
  return (
    <button
      onClick={exportToPNG}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors text-white"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Save as PNG
    </button>
  );
};

export default ExportRoutinePNG;