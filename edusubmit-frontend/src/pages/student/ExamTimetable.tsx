import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Calendar,
  Clock,
  MapPin,
  Bell,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
  duration: number; // in minutes
  location: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  teacherName: string;
  instructions?: string;
  personalReminder?: string;
}

const ExamTimetable = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API call to fetch exams
    const fetchExams = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockExams: Exam[] = [
          {
            id: '1',
            title: 'Database Systems Midterm',
            subject: 'Computer Science',
            description: 'Comprehensive exam covering database design, SQL, normalization, and transaction management.',
            date: '2026-05-15T09:00:00',
            duration: 120,
            location: 'Room 301, CS Building',
            type: 'midterm',
            teacherName: 'Dr. Smith',
            instructions: 'Bring student ID card. Calculators allowed. No notes permitted.',
            personalReminder: 'Review Chapter 5-7, practice SQL queries'
          },
          {
            id: '2',
            title: 'Data Structures Final',
            subject: 'Mathematics',
            description: 'Final examination covering algorithms, data structures, complexity analysis, and problem-solving techniques.',
            date: '2026-05-20T14:00:00',
            duration: 180,
            location: 'Main Auditorium',
            type: 'final',
            teacherName: 'Prof. Johnson',
            instructions: 'Student ID required. Scientific calculators allowed. Formula sheet provided.',
            personalReminder: 'Practice recursion problems, review Big-O notation'
          },
          {
            id: '3',
            title: 'Web Development Quiz',
            subject: 'Software Engineering',
            description: 'Quiz on modern web development frameworks, responsive design, and deployment strategies.',
            date: '2026-05-08T11:00:00',
            duration: 60,
            location: 'Lab 204',
            type: 'quiz',
            teacherName: 'Dr. Brown',
            instructions: 'Open book exam. Laptops allowed for practical exercises.',
            personalReminder: 'Review React components, practice CSS Grid'
          },
          {
            id: '4',
            title: 'Algorithm Practical Exam',
            subject: 'Data Structures',
            description: 'Practical implementation of sorting and searching algorithms with performance analysis.',
            date: '2026-05-25T10:00:00',
            duration: 150,
            location: 'Computer Lab 301',
            type: 'practical',
            teacherName: 'Prof. Johnson',
            instructions: 'Computers provided. Bring USB drive for backup. No internet access.',
            personalReminder: 'Practice quicksort, mergesort, and binary search'
          }
        ];

        setExams(mockExams);
        setLoading(false);
      }, 1000);
    };

    fetchExams();
  }, []);

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'bg-red-100 text-red-700 border-red-200';
      case 'midterm': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'quiz': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'practical': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getExamStatus = (examDate: string) => {
    const now = new Date();
    const examDateTime = new Date(examDate);
    const diffTime = examDateTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'completed', color: 'text-gray-600', text: 'Completed' };
    if (diffDays <= 1) return { status: 'urgent', color: 'text-red-600', text: 'Tomorrow' };
    if (diffDays <= 7) return { status: 'soon', color: 'text-orange-600', text: `${diffDays} Days` };
    return { status: 'future', color: 'text-blue-600', text: `${diffDays} Days` };
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getExamsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return exams.filter(exam => exam.date.startsWith(dateStr));
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  const handleReminderClick = (exam: Exam) => {
    setSelectedExam(exam);
    setReminderText(exam.personalReminder || '');
    setShowReminderModal(true);
  };

  const handleSaveReminder = () => {
    if (selectedExam) {
      // In real app, this would save to API
      console.log('Saving reminder for exam:', selectedExam.id, 'Reminder:', reminderText);
      
      // Update local state
      setExams(prev => prev.map(exam => 
        exam.id === selectedExam.id 
          ? { ...exam, personalReminder: reminderText }
          : exam
      ));
      
      setShowReminderModal(false);
      setSelectedExam(null);
      setReminderText('');
    }
  };

  const filterExams = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return exams.filter(exam => new Date(exam.date) >= now);
      case 'past':
        return exams.filter(exam => new Date(exam.date) < now);
      default:
        return exams;
    }
  };

  const filteredExams = filterExams();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Timetable</h1>
          <p className="text-gray-600">View your upcoming exam schedule</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'upcoming' | 'past')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Exams</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <GlassCard>
          <div className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <motion.button
                onClick={handlePreviousMonth}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <h2 className="text-xl font-bold text-gray-900">
                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              
              <motion.button
                onClick={handleNextMonth}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {/* Empty Cells */}
              {Array.from({ length: getFirstDayOfMonth(selectedMonth) }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2"></div>
              ))}
              
              {/* Calendar Days */}
              {Array.from({ length: getDaysInMonth(selectedMonth) }).map((_, index) => {
                const currentDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), index + 1);
                const dayExams = getExamsForDate(currentDate);
                const isToday = currentDate.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index + 1}
                    className={`
                      p-2 border border-gray-200 min-h-[80px]
                      ${isToday ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {index + 1}
                    </div>
                    
                    {dayExams.map((exam, examIndex) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: examIndex * 0.1 }}
                        className="text-xs"
                      >
                        <div
                          className={`p-1 rounded text-white text-center mb-1 cursor-pointer ${getExamTypeColor(exam.type)}`}
                          onClick={() => setSelectedExam(exam)}
                        >
                          <p className="font-medium truncate">{exam.title}</p>
                          <p className="text-xs opacity-90">{exam.subject}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredExams.map((exam, index) => {
            const examStatus = getExamStatus(exam.date);
            
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExamTypeColor(exam.type)}`}>
                            {exam.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">{exam.subject}</p>
                        <p className="text-sm text-gray-500">by {exam.teacherName}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-sm font-medium ${examStatus.color}`}>
                          {examStatus.text}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {exam.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(exam.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-medium text-gray-900">
                            {new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium text-gray-900">{exam.location}</p>
                        </div>
                      </div>
                    </div>

                    {exam.instructions && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Instructions:</p>
                        <p className="text-sm text-gray-700">{exam.instructions}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{exam.duration} minutes</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {exam.personalReminder && (
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Bell className="w-4 h-4" />
                            <span>Personal reminder set</span>
                          </div>
                        )}
                        
                        <motion.button
                          onClick={() => handleReminderClick(exam)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="text-sm">
                            {exam.personalReminder ? 'Edit Reminder' : 'Add Reminder'}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredExams.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
          <p className="text-gray-600">
            {filter === 'upcoming' ? 'No upcoming exams scheduled' : 
             filter === 'past' ? 'No past exams to display' : 
             'No exams scheduled for this period'}
          </p>
        </div>
      )}

      {/* Exam Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedExam.title}</h2>
                  <p className="text-gray-600">{selectedExam.subject}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedExam(null);
                    setShowReminderModal(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Exam Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedExam.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedExam.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{selectedExam.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{selectedExam.location}</p>
                  </div>
                </div>

                {selectedExam.instructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Instructions</p>
                    <p className="text-gray-700">{selectedExam.instructions}</p>
                  </div>
                )}

                {selectedExam.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Description</p>
                    <p className="text-gray-700">{selectedExam.description}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add Reminder - {selectedExam.title}
                </h3>
                <p className="text-sm text-gray-600">{selectedExam.subject}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Personal Reminder Notes
                </label>
                <textarea
                  value={reminderText}
                  onChange={(e) => setReminderText(e.target.value)}
                  placeholder="Add your personal study notes, reminders, or preparation tasks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <motion.button
                  onClick={() => {
                    setShowReminderModal(false);
                    setSelectedExam(null);
                    setReminderText('');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleSaveReminder}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Reminder
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExamTimetable;
