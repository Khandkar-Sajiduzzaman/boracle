'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from 'next-auth/react';
import { Calendar, User, ArrowRightLeft, Tag, CheckCircle, Trash2 } from 'lucide-react';

const SwapCard = ({ swap, courses = [], onDelete, onMarkComplete }) => {
  const { data: session } = useSession();
  
  if (!swap) return null;
  
  const formatCourse = (course) => {
    return `${course.courseCode}-[${course.sectionName}]`;
  };

  const getCourseBySection = (sectionId) => {
    return courses.find(c => c.sectionId === parseInt(sectionId));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const giveCourse = getCourseBySection(swap.getsectionid);
  const isOwner = session?.user?.email === swap.uemail;
  
  // Different card styles for owner vs others
  const getCardStyle = () => {
    if (isOwner) {
      return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-300 dark:border-green-800';
    }
    return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700';
  };

  return (
    <Card className={`transition-all hover:shadow-xl ${getCardStyle()} overflow-hidden`}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        {swap.isdone ? (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
            Active
          </Badge>
        )}
      </div>

      <CardHeader className="pb-4">
        {isOwner && (
          <div className="mb-3">
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs">
              Your Swap
            </Badge>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Offering Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Offering
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {giveCourse ? formatCourse(giveCourse) : `Section ${swap.getsectionid}`}
              </p>
              {giveCourse && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {giveCourse.faculties || 'Faculty: TBA'} • 
                  {giveCourse.capacity - giveCourse.consumedSeat} of {giveCourse.capacity} seats available
                </p>
              )}
            </div>
          </div>
          
          {/* Looking For Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Looking For
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              {swap.askingSections && swap.askingSections.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {swap.askingSections.map((sectionId) => {
                    const askCourse = getCourseBySection(sectionId);
                    return (
                      <Badge 
                        key={sectionId} 
                        variant="outline" 
                        className="bg-white dark:bg-gray-900 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400"
                      >
                        {askCourse ? formatCourse(askCourse) : `Section ${sectionId}`}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">Any section of the same course</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="border-t bg-gray-50/50 dark:bg-gray-800/50">
        {/* User Info */}
        <div className="flex items-center justify-between py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                {swap.uemail || 'Unknown user'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(swap.createdat)}
            </div>
          </div>
          
          {/* Action Buttons */}
          {isOwner && (
            <div className="flex gap-2">
              {!swap.isdone && (
                <Button 
                  size="sm"
                  onClick={() => onMarkComplete?.(swap.swapid)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              )}
              <Button 
                size="sm"
                onClick={() => onDelete?.(swap.swapid)}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapCard;