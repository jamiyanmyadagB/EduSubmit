import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  MoreVertical,
  X,
  RefreshCw,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

interface Exam {
  id: string;
  title: string;
  subject: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  sections: string[];
  totalStudents: number;
  teacherName: string;
  teacherEmail: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface Conflict {
  id: string;
  type: 'section_overlap' | 'teacher_overload' | 'room_conflict' | 'time_conflict';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedExams: string[];
  affectedSections: string[];
  affectedTeachers: string[];
  suggestion: string;
  createdAt: string;
}

interface TimetableStats {
  totalExams: number;
  scheduledExams: number;
  ongoingExams: number;
  completedExams: number;
  cancelledExams: number;
  totalConflicts: number;
  highSeverityConflicts: number;
  averageExamsPerSection: number;
  mostActiveSection: string;
}

const AdminTimetableManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [filteredConflicts, setFilteredConflicts] = useState<Conflict[]>([]);
  const [stats, setStats] = useState<TimetableStats>({
    totalExams: 0,
    scheduledExams: 0,
    ongoingExams: 0,
    completedExams: 0,
    cancelledExams: 0,
    totalConflicts: 0,
    highSeverityConflicts: 0,
    averageExamsPerSection: 0,
    mostActiveSection: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'exams' | 'conflicts'>('exams');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch timetable data
    const fetchTimetableData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockExams: Exam[] = [
          {
            id: '1',
            title: 'Database Systems Midterm',
            subject: 'Database Systems',
            type: 'midterm',
            date: '2026-05-15',
            startTime: '09:00',
            endTime: '11:00',
            duration: 120,
            location: 'Lab A-101',
            sections: ['CSE-A', 'CSE-B'],
            totalStudents: 177,
            teacherName: 'Dr. Sarah Johnson',
            teacherEmail: 'sarah.johnson@lpu.in',
            status: 'scheduled',
            createdAt: '2026-05-01T10:00:00',
            updatedAt: '2026-05-01T10:00:00'
          },
          {
            id: '2',
            title: 'Web Technologies Final',
            subject: 'Web Technologies',
            type: 'final',
            date: '2026-05-18',
            startTime: '14:00',
            endTime: '17:00',
            duration: 180,
            location: 'Main Hall',
            sections: ['CSE-A'],
            totalStudents: 85,
            teacherName: 'Prof. Michael Chen',
            teacherEmail: 'michael.chen@lpu.in',
            status: 'scheduled',
            createdAt: '2026-05-02T11:00:00',
            updatedAt: '2026-05-02T11:00:00'
          },
          {
            id: '3',
            title: 'Machine Learning Quiz',
            subject: 'Machine Learning',
            type: 'quiz',
            date: '2026-05-10',
            startTime: '10:00',
            endTime: '11:00',
            duration: 60,
            location: 'Room B-205',
            sections: ['AIML-1'],
            totalStudents: 78,
            teacherName: 'Dr. Robert Wilson',
            teacherEmail: 'robert.wilson@lpu.in',
            status: 'ongoing',
            createdAt: '2026-05-03T09:00:00',
            updatedAt: '2026-05-03T09:00:00'
          },
          {
            id: '4',
            title: 'Data Structures Practical',
            subject: 'Data Structures',
            type: 'practical',
            date: '2026-05-08',
            startTime: '13:00',
            endTime: '16:00',
            duration: 180,
            location: 'Lab C-301',
            sections: ['CSE-B'],
            totalStudents: 92,
            teacherName: 'Dr. Emily Davis',
            teacherEmail: 'emily.davis@lpu.in',
            status: 'completed',
            createdAt: '2026-04-25T14:00:00',
            updatedAt: '2026-05-08T16:00:00'
          },
          {
            id: '5',
            title: 'Algorithms Test',
            subject: 'Algorithms',
            type: 'quiz',
            date: '2026-05-12',
            startTime: '09:00',
            endTime: '10:00',
            duration: 60,
            location: 'Room A-102',
            sections: ['CSE-B'],
            totalStudents: 92,
            teacherName: 'Prof. Lisa Anderson',
            teacherEmail: 'lisa.anderson@lpu.in',
            status: 'cancelled',
            createdAt: '2026-05-04T10:00:00',
            updatedAt: '2026-05-06T15:00:00'
          }
        ];

        const mockConflicts: Conflict[] = [
          {
            id: '1',
            type: 'section_overlap',
            severity: 'high',
            title: 'Section Overlap: CSE-A',
            description: 'Multiple exams scheduled for CSE-A on the same day',
            affectedExams: ['1', '2'],
            affectedSections: ['CSE-A'],
            affectedTeachers: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
            suggestion: 'Reschedule one exam to avoid student conflict',
            createdAt: '2026-05-08T08:00:00'
          },
          {
            id: '2',
            type: 'room_conflict',
            severity: 'medium',
            title: 'Room Conflict: Lab A-101',
            description: 'Two exams scheduled in the same room at overlapping times',
            affectedExams: ['1', '6'],
            affectedSections: ['CSE-A', 'AIML-1'],
            affectedTeachers: ['Dr. Sarah Johnson', 'Dr. James Miller'],
            suggestion: 'Change venue for one of the exams',
            createdAt: '2026-05-08T09:30:00'
          },
          {
            id: '3',
            type: 'teacher_overload',
            severity: 'medium',
            title: 'Teacher Overload: Dr. Emily Davis',
            description: 'Teacher has 3 exams scheduled within 24 hours',
            affectedExams: ['4', '7', '8'],
            affectedSections: ['CSE-B'],
            affectedTeachers: ['Dr. Emily Davis'],
            suggestion: 'Redistribute exams to reduce teacher workload',
            createdAt: '2026-05-08T10:15:00'
          }
        ];

        const mockStats: TimetableStats = {
          totalExams: mockExams.length,
          scheduledExams: mockExams.filter(e => e.status === 'scheduled').length,
          ongoingExams: mockExams.filter(e => e.status === 'ongoing').length,
          completedExams: mockExams.filter(e => e.status === 'completed').length,
          cancelledExams: mockExams.filter(e => e.status === 'cancelled').length,
          totalConflicts: mockConflicts.length,
          highSeverityConflicts: mockConflicts.filter(c => c.severity === 'high').length,
          averageExamsPerSection: 2.3,
          mostActiveSection: 'CSE-B'
        };

        setExams(mockExams);
        setConflicts(mockConflicts);
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    };

    fetchTimetableData();
  }, []);

  useEffect(() => {
    if (viewMode === 'exams') {
      let filtered = exams;

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(exam =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.sections.some(section => section.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(exam => exam.status === statusFilter);
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(exam => exam.type === typeFilter);
      }

      setFilteredExams(filtered);
    } else {
      let filtered = conflicts;

      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(conflict =>
          conflict.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conflict.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply severity filter
      if (severityFilter !== 'all') {
        filtered = filtered.filter(conflict => conflict.severity === severityFilter);
      }

      setFilteredConflicts(filtered);
    }
  }, [exams, conflicts, searchTerm, statusFilter, typeFilter, severityFilter, viewMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'midterm': return 'text-purple-600 bg-purple-100';
      case 'final': return 'text-red-600 bg-red-100';
      case 'quiz': return 'text-blue-600 bg-blue-100';
      case 'practical': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const openDetailsModal = (exam: Exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
  };

  const openConflictModal = (conflict: Conflict) => {
    setSelectedConflict(conflict);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage exam schedules and conflicts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduledExams}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ongoing</p>
              <p className="text-2xl font-bold text-green-600">{stats.ongoingExams}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-600">{stats.completedExams}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-gray-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelledExams}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conflicts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalConflicts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600">{stats.highSeverityConflicts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg/Section</p>
              <p className="text-2xl font-bold text-purple-600">{stats.averageExamsPerSection}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </GlassCard>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setViewMode('exams')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'exams' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Exams ({filteredExams.length})
        </button>
        <button
          onClick={() => setViewMode('conflicts')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'conflicts' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Conflicts ({filteredConflicts.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={viewMode === 'exams' ? "Search exams..." : "Search conflicts..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        {viewMode === 'exams' && (
          <>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === 'status' ? null : 'status')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 text-gray-400" />
                <span>Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              <AnimatePresence>
                {dropdownOpen === 'status' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  >
                    {['all', 'scheduled', 'ongoing', 'completed', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setDropdownOpen(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50"
                      >
                        {status === 'all' ? 'All Statuses' : status}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === 'type' ? null : 'type')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-5 h-5 text-gray-400" />
                <span>Type: {typeFilter === 'all' ? 'All' : typeFilter}</span>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              <AnimatePresence>
                {dropdownOpen === 'type' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                  >
                    {['all', 'midterm', 'final', 'quiz', 'practical'].map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setTypeFilter(type);
                          setDropdownOpen(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50"
                      >
                        {type === 'all' ? 'All Types' : type}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {viewMode === 'conflicts' && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(dropdownOpen === 'severity' ? null : 'severity')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 text-gray-400" />
              <span>Severity: {severityFilter === 'all' ? 'All' : severityFilter}</span>
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            <AnimatePresence>
              {dropdownOpen === 'severity' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                >
                  {['all', 'high', 'medium', 'low'].map(severity => (
                    <button
                      key={severity}
                      onClick={() => {
                        setSeverityFilter(severity);
                        setDropdownOpen(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50"
                    >
                      {severity === 'all' ? 'All Severities' : severity}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'exams' ? (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sections</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExams.map((exam) => (
                  <motion.tr
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(exam.type)}`}>
                        {exam.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(exam.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.startTime} - {exam.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{exam.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {exam.sections.map((section, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {section}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exam.teacherName}</div>
                        <div className="text-xs text-gray-500">{exam.teacherEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailsModal(exam)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conflict</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affected Exams</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggestion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredConflicts.map((conflict) => (
                  <motion.tr
                    key={conflict.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{conflict.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                        {conflict.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(conflict.severity)}`}>
                        {conflict.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conflict.affectedExams.length} exams
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conflict.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conflict.suggestion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openConflictModal(conflict)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && (selectedExam || selectedConflict) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedExam ? 'Exam Details' : 'Conflict Details'}
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {selectedExam ? (
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Title</span>
                          <span className="text-sm font-medium text-gray-900">{selectedExam.title}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Subject</span>
                          <span className="text-sm font-medium text-gray-900">{selectedExam.subject}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Type</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedExam.type)}`}>
                            {selectedExam.type}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Duration</span>
                          <span className="text-sm font-medium text-gray-900">{formatDuration(selectedExam.duration)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Date</span>
                          <span className="text-sm font-medium text-gray-900">{new Date(selectedExam.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Time</span>
                          <span className="text-sm font-medium text-gray-900">{selectedExam.startTime} - {selectedExam.endTime}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Location</span>
                          <span className="text-sm font-medium text-gray-900">{selectedExam.location}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExam.status)}`}>
                            {selectedExam.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">People Involved</h3>
                      <div className="space-y-3">
                        <div className="py-2 border-b border-gray-200">
                          <div className="text-sm font-medium text-gray-900 mb-1">Teacher</div>
                          <div className="text-sm text-gray-600">{selectedExam.teacherName}</div>
                          <div className="text-xs text-gray-500">{selectedExam.teacherEmail}</div>
                        </div>
                        <div className="py-2 border-b border-gray-200">
                          <div className="text-sm font-medium text-gray-900 mb-1">Sections</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedExam.sections.map((section, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Total Students</span>
                          <span className="text-sm font-medium text-gray-900">{selectedExam.totalStudents}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Created</span>
                          <span className="text-sm font-medium text-gray-900">{new Date(selectedExam.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Last Updated</span>
                          <span className="text-sm font-medium text-gray-900">{new Date(selectedExam.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Conflict Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Title</span>
                        <span className="text-sm font-medium text-gray-900">{selectedConflict!.title}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Type</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          {selectedConflict!.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Severity</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedConflict!.severity)}`}>
                          {selectedConflict!.severity}
                        </span>
                      </div>
                      <div className="py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Description</span>
                        <p className="text-sm text-gray-900 mt-1">{selectedConflict!.description}</p>
                      </div>
                      <div className="py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Suggestion</span>
                        <p className="text-sm text-gray-900 mt-1">{selectedConflict!.suggestion}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Affected Items</h3>
                    <div className="space-y-3">
                      <div className="py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Affected Exams</span>
                        <span className="text-sm font-medium text-gray-900">{selectedConflict!.affectedExams.length} exams</span>
                      </div>
                      <div className="py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Affected Sections</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedConflict!.affectedSections.map((section, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Affected Teachers</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedConflict!.affectedTeachers.map((teacher, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {teacher}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTimetableManagement;
