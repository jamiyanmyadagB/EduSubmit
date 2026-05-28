import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Users,
  MapPin,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MoreVertical,
  Brain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
  duration: number;
  location: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  status: 'draft' | 'published' | 'archived';
  sectionId: string;
  sectionName: string;
  instructions?: string;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: string;
  name: string;
  studentCount: number;
  teacherId: string;
}

interface AIOptimization {
  examId: string;
  type: 'deadline_spacing' | 'scheduling_conflict' | 'workload_balance';
  message: string;
  priority: 'high' | 'medium' | 'low';
  suggestedAction: string;
}

const ExamTimetable = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiOptimizations, setAIOptimizations] = useState<AIOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch exams and sections
    const fetchData = async () => {
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
            status: 'published',
            sectionId: '1',
            sectionName: 'CS-A',
            totalStudents: 20,
            instructions: 'Bring student ID card. Calculators allowed. No notes permitted.',
            createdAt: '2026-05-01T10:00:00',
            updatedAt: '2026-05-01T10:00:00'
          },
          {
            id: '2',
            title: 'Data Structures Final',
            subject: 'Data Structures',
            description: 'Final examination covering algorithms, data structures, complexity analysis, and problem-solving techniques.',
            date: '2026-05-20T14:00:00',
            duration: 180,
            location: 'Main Auditorium',
            type: 'final',
            status: 'published',
            sectionId: '2',
            sectionName: 'CS-B',
            totalStudents: 25,
            instructions: 'Student ID required. Scientific calculators allowed. Formula sheet provided.',
            createdAt: '2026-05-05T14:30:00',
            updatedAt: '2026-05-05T14:30:00'
          },
          {
            id: '3',
            title: 'Web Development Quiz',
            subject: 'Software Engineering',
            description: 'Quiz on modern web development frameworks, responsive design, and deployment strategies.',
            date: '2026-05-10T11:00:00',
            duration: 60,
            location: 'Lab 204',
            type: 'quiz',
            status: 'published',
            sectionId: '3',
            sectionName: 'CS-C',
            totalStudents: 7,
            instructions: 'Open book exam. Laptops allowed for practical exercises.',
            createdAt: '2026-05-08T16:45:00',
            updatedAt: '2026-05-08T16:45:00'
          },
          {
            id: '4',
            title: 'Algorithm Practical Exam',
            subject: 'Data Structures',
            description: 'Practical examination requiring implementation of sorting and searching algorithms.',
            date: '2026-05-25T10:00:00',
            duration: 150,
            location: 'Computer Lab 301',
            type: 'practical',
            status: 'draft',
            sectionId: '2',
            sectionName: 'CS-B',
            totalStudents: 25,
            instructions: 'Computers provided. Bring USB drive for backup.',
            createdAt: '2026-05-20T10:00:00',
            updatedAt: '2026-05-20T10:00:00'
          }
        ];

        const mockSections: Section[] = [
          { id: '1', name: 'CS-A', studentCount: 20, teacherId: user?.id || 'teacher1' },
          { id: '2', name: 'CS-B', studentCount: 25, teacherId: user?.id || 'teacher1' },
          { id: '3', name: 'CS-C', studentCount: 7, teacherId: user?.id || 'teacher1' },
          { id: '4', name: 'CS-D', studentCount: 18, teacherId: user?.id || 'teacher1' }
        ];

        const mockAIOptimizations: AIOptimization[] = [
          {
            examId: '1',
            type: 'deadline_spacing',
            message: 'Database Systems Midterm and Data Structures Final are only 5 days apart. Consider extending one deadline.',
            priority: 'medium',
            suggestedAction: 'Extend Database Systems deadline by 2 days'
          },
          {
            examId: '2',
            type: 'scheduling_conflict',
            message: 'Algorithm Practical Exam conflicts with Web Development Quiz in CS-B section.',
            priority: 'high',
            suggestedAction: 'Reschedule Algorithm Practical Exam to different day'
          },
          {
            examId: '3',
            type: 'workload_balance',
            message: 'CS-A section has 3 major exams in 2 weeks. Consider redistributing workload.',
            priority: 'medium',
            suggestedAction: 'Move one exam to following week'
          }
        ];

        setExams(mockExams);
        setSections(mockSections);
        setFilteredExams(mockExams);
        setAIOptimizations(mockAIOptimizations);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter exams based on search and filters
    let filtered = exams;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }

    if (sectionFilter !== 'all') {
      filtered = filtered.filter(exam => exam.sectionId === sectionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExams(filtered);
  }, [exams, searchTerm, statusFilter, sectionFilter]);

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'text-red-600 bg-red-50 border-red-200';
      case 'midterm': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'quiz': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'practical': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getExamStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50 border-green-200';
      case 'draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return lastDay.getDate();
  };

  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const exam = filteredExams.find(exam => {
        const examDate = new Date(exam.date);
        return examDate.getDate() === day &&
               examDate.getMonth() === month &&
               examDate.getFullYear() === year;
      });

      days.push({
        date: currentDate,
        exam: exam || null,
        isToday: isCurrentMonth && currentDate.getDate() === today.getDate()
      });
    }

    return days;
  };

  const handleCreateExam = () => {
    setSelectedExam(null);
    setShowCreateModal(true);
  };

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setShowEditModal(true);
  };

  const handleArchiveExam = (examId: string) => {
    // In real app, this would call API
    setExams(prev => prev.map(exam =>
      exam.id === examId
        ? { ...exam, status: 'archived' }
        : exam
    ));
  };

  const handleViewCalendar = () => {
    setViewMode('calendar');
  };

  const handleViewList = () => {
    setViewMode('list');
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

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
          <p className="text-gray-600">Manage exam schedules and optimize teaching workflow</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Sections</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </div>

          {/* Create Button */}
          <motion.button
            onClick={handleCreateExam}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam</span>
          </motion.button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <motion.button
            onClick={handleViewCalendar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Calendar View</span>
          </motion.button>
          
          <motion.button
            onClick={handleViewList}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">List View</span>
          </motion.button>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="mb-6">
        <GlassCard>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">AI Scheduling Assistant</h3>
            <motion.button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showAISuggestions ? 'Hide' : 'Show'} Suggestions
            </motion.button>
          </div>
          
          {showAISuggestions && (
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">AI-driven scheduling insights</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={handlePreviousMonth}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={handleNextMonth}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sat'].map((day, index) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
              
              {getCalendarDays().map((day, index) => {
                if (!day) return null;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`
                      min-h-[80px] p-2 border border-gray-200
                      ${day.isToday ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-50'}
                      ${day.exam ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => day.exam && handleEditExam(day.exam)}
                  >
                    <div className="text-sm">
                      {day.date.getDate()}
                    </div>

                    {day.exam && (
                      <div className="mt-1">
                        <div className={`text-xs font-medium ${getExamTypeColor(day.exam.type)}`}>
                          {day.exam.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {day.exam.sectionName} • {day.exam.duration}min
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">{exam.subject}</p>
                      <p className="text-xs text-gray-500">
                        Section: {exam.sectionName} • {exam.totalStudents} students
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExamStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                      
                      <div className="relative">
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {exam.description}
                </p>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {exam.duration} minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{exam.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{exam.totalStudents} students</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                {exam.instructions && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Instructions</p>
                    <p className="text-sm text-gray-700">{exam.instructions}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {exam.status === 'draft' && (
                      <motion.button
                        onClick={() => handleEditExam(exam)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </motion.button>
                    )}
                    
                    {exam.status === 'draft' && (
                      <motion.button
                        onClick={() => {
                          // In real app, this would call API to publish exam
                          setExams(prev => prev.map(e =>
                            e.id === exam.id
                              ? { ...e, status: 'published' }
                              : e
                          ));
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Publish</span>
                      </motion.button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {exam.status === 'published' && (
                      <motion.button
                        onClick={() => handleEditExam(exam)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm">Update</span>
                      </motion.button>
                    )}
                    
                    {exam.status !== 'archived' && (
                      <motion.button
                        onClick={() => handleArchiveExam(exam.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Archive</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
      </div>
      )}

      {/* Empty State */}
      {filteredExams.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'Create your first exam to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Exam Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {showCreateModal ? 'Create Exam' : 'Edit Exam'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedExam(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="text-sm text-gray-600">
                Exam creation and editing form would go here...
                <br /><br />
                This would include:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Exam title and subject selection</li>
                  <li>Date, time, and duration configuration</li>
                  <li>Location assignment</li>
                  <li>Section assignment</li>
                  <li>Instructions and requirements</li>
                  <li>Save as draft or publish</li>
                  <li>Conflict detection and AI suggestions</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ExamTimetable;
