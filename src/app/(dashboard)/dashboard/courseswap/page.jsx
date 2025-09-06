'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import CreateSwapModal from '@/components/course-swap/CreateSwapModal';
import SwapCard from '@/components/course-swap/SwapCard';
import SwapFilter from '@/components/course-swap/SwapFilter';

const CourseSwapPage = () => {
  const [courses, setCourses] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [filteredSwaps, setFilteredSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://usis-cdn.eniamza.com/connect.json');
        const data = await response.json();
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/swap');
      if (response.ok) {
        const data = await response.json();
        setSwaps(data || []);
        setFilteredSwaps(data || []);
      }
    } catch (error) {
      console.error('Error fetching swaps:', error);
      setSwaps([]);
      setFilteredSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (selectedCourseIds) => {
    setSelectedFilters(selectedCourseIds);
    
    if (selectedCourseIds.length === 0) {
      setFilteredSwaps(swaps);
    } else {
      const filtered = swaps.filter(swap => {
        const relatedSections = [
          swap.getsectionid,
          ...(swap.askingSections || [])
        ];
        return relatedSections.some(sectionId => 
          selectedCourseIds.includes(sectionId)
        );
      });
      setFilteredSwaps(filtered);
    }
  };

  const handleDeleteSwap = async (swapId) => {
    if (!confirm('Are you sure you want to delete this swap request?')) return;
    
    try {
      const response = await fetch(`/api/swap/${swapId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchSwaps();
      }
    } catch (error) {
      console.error('Error deleting swap:', error);
    }
  };

  const handleMarkComplete = async (swapId) => {
    if (!confirm('Mark this swap as completed?')) return;
    
    try {
      const response = await fetch(`/api/swap/${swapId}/complete`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        fetchSwaps();
      }
    } catch (error) {
      console.error('Error marking swap as complete:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Swap Arena
            </h1>
          </div>
          
          <div className="flex gap-3">
            {swaps.length > 0 && (
              <SwapFilter 
                courses={courses}
                swaps={swaps}
                onFilterChange={handleFilterChange}
              />
            )}
            <CreateSwapModal 
              courses={courses} 
              onSwapCreated={fetchSwaps}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading swaps...</p>
          </div>
        ) : filteredSwaps.length === 0 ? (
          <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur border-0 shadow-xl">
            <CardContent className="text-center py-16">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <ArrowLeftRight className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedFilters.length > 0 ? 'No matching swaps found' : 'No swap requests available'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedFilters.length > 0 
                  ? 'Try adjusting your filters or create a new swap request'
                  : 'Be the first to create a swap request!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSwaps.map((swap) => (
              <SwapCard 
                key={swap.swapid} 
                swap={swap} 
                courses={courses}
                onDelete={handleDeleteSwap}
                onMarkComplete={handleMarkComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSwapPage;