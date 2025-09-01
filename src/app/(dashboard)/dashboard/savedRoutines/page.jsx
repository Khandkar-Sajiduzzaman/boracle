'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, Eye, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

const SavedRoutinesPage = () => {
  const { data: session } = useSession();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch saved routines
  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/routine', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch routines');
      }

      const data = await response.json();
      
      if (data.success) {
        setRoutines(data.routines || []);
      } else {
        throw new Error('Failed to fetch routines');
      }
    } catch (err) {
      console.error('Error fetching routines:', err);
      setError('Failed to load saved routines');
      showToast('Failed to load saved routines', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete routine
  const deleteRoutine = async (routineId) => {
    try {
      const response = await fetch(`/api/routine/${routineId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRoutines(prev => prev.filter(routine => routine.id !== routineId));
        showToast('Routine deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete routine');
      }
    } catch (err) {
      console.error('Error deleting routine:', err);
      showToast('Failed to delete routine', 'error');
    }
  };

  // Parse routine string to get course info
  const parseRoutineString = (routineStr) => {
    try {
      const sectionIds = JSON.parse(atob(routineStr));
      return sectionIds.length;
    } catch (err) {
      return 0;
    }
  };

  // View routine details (placeholder - you can expand this)
  const viewRoutine = (routine) => {
    try {
      const sectionIds = JSON.parse(atob(routine.routineStr));
      console.log('Routine sections:', sectionIds);
      showToast(`Routine contains ${sectionIds.length} courses`, 'success');
    } catch (err) {
      showToast('Invalid routine data', 'error');
    }
  };

  // Load routines on component mount
  useEffect(() => {
    if (session?.user?.email) {
      fetchRoutines();
    }
  }, [session]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading saved routines...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-400">Please log in to view your saved routines.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Saved Routines</h1>
              <p className="text-gray-400">Manage your saved course routines</p>
            </div>
            <button
              onClick={fetchRoutines}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Routines List */}
        {routines.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Saved Routines</h2>
            <p className="text-gray-500 mb-4">
              You haven't saved any routines yet. Create a routine in the Pre-Registration page to get started.
            </p>
            <a
              href="/dashboard/preprereg"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Build New Routine
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine, index) => (
              <div
                key={routine.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
              >
                {/* Routine Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Routine #{routine.id}</h3>
                      <p className="text-sm text-gray-400">
                        {parseRoutineString(routine.routineStr)} courses
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => viewRoutine(routine)}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => deleteRoutine(routine.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {routines.length > 0 && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{routines.length}</div>
                <div className="text-sm text-gray-400">Total Routines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {routines.reduce((sum, routine) => sum + parseRoutineString(routine.routineStr), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {routines.length > 0 ? Math.round(routines.reduce((sum, routine) => sum + parseRoutineString(routine.routineStr), 0) / routines.length) : 0}
                </div>
                <div className="text-sm text-gray-400">Avg. Courses per Routine</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRoutinesPage;
