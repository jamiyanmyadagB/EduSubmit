import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Calendar,
  BookOpen,
  BarChart3,
  MoreVertical,
  X,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

interface TeacherAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  sectionId: string;
  sectionName: string;
  subject: string;
  activeAssignments: number;
  totalStudents: number;
  pendingReviews: number;
  averageGrade: number;
  workload: 'optimal' | 'heavy' | 'light';
  lastActivity: string;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

interface Section {
  id: string;
  name: string;
  studentCount: number;
  teacherCount: number;
  averagePerformance: number;
}

interface AssignmentStats {
  total: number;
  bySubject: Array<{
    subject: string;
    count: number;
    percentage: number;
  }>;
  bySection: Array<{
    section: string;
    count: number;
    percentage: number;
  }>;
  byWorkload: Array<{
    workload: string;
    count: number;
    percentage: number;
  }>;
}

const AdminTeacherAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<TeacherAssignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats>({
    total: 0,
    bySubject: [],
    bySection: [],
    byWorkload: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [workloadFilter, setWorkloadFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch teacher assignments
    const fetchTeacherAssignments = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockAssignments: TeacherAssignment[] = [
          {
            id: '1',
            teacherId: '1',
            teacherName: 'Dr. Sarah Johnson',
            teacherEmail: 'sarah.johnson@lpu.in',
            sectionId: '1',
            sectionName: 'CSE-A',
            subject: 'Database Systems',
            activeAssignments: 8,
            totalStudents: 85,
            pendingReviews: 12,
            averageGrade: 78.5,
            workload: 'optimal',
            lastActivity: '2026-05-08T10:30:00',
            performance: 'good'
          },
          {
            id: '2',
            teacherId: '2',
            teacherName: 'Prof. Michael Chen',
            teacherEmail: 'michael.chen@lpu.in',
            sectionId: '1',
            sectionName: 'CSE-A',
            subject: 'Web Technologies',
            activeAssignments: 6,
            totalStudents: 85,
            pendingReviews: 8,
            averageGrade: 82.1,
            workload: 'light',
            lastActivity: '2026-05-08T09:15:00',
            performance: 'excellent'
          },
          {
            id: '3',
            teacherId: '3',
            teacherName: 'Dr. Emily Davis',
            teacherEmail: 'emily.davis@lpu.in',
            sectionId: '2',
            sectionName: 'CSE-B',
            subject: 'Data Structures',
            activeAssignments: 12,
            totalStudents: 92,
            pendingReviews: 18,
            averageGrade: 75.3,
            workload: 'heavy',
            lastActivity: '2026-05-08T11:45:00',
            performance: 'average'
          },
          {
            id: '4',
            teacherId: '4',
            teacherName: 'Dr. Robert Wilson',
            teacherEmail: 'robert.wilson@lpu.in',
            sectionId: '3',
            sectionName: 'AIML-1',
            subject: 'Machine Learning',
            activeAssignments: 7,
            totalStudents: 78,
            pendingReviews: 10,
            averageGrade: 85.3,
            workload: 'optimal',
            lastActivity: '2026-05-08T08:30:00',
            performance: 'excellent'
          },
          {
            id: '5',
            teacherId: '5',
            teacherName: 'Prof. Lisa Anderson',
            teacherEmail: 'lisa.anderson@lpu.in',
            sectionId: '2',
            sectionName: 'CSE-B',
            subject: 'Algorithms',
            activeAssignments: 9,
            totalStudents: 92,
            pendingReviews: 14,
            averageGrade: 79.8,
            workload: 'optimal',
            lastActivity: '2026-05-07T16:20:00',
            performance: 'good'
          }
        ];

        const mockSections: Section[] = [
          { id: '1', name: 'CSE-A', studentCount: 85, teacherCount: 3, averagePerformance: 80.3 },
          { id: '2', name: 'CSE-B', studentCount: 92, teacherCount: 4, averagePerformance: 77.6 },
          { id: '3', name: 'AIML-1', studentCount: 78, teacherCount: 2, averagePerformance: 82.5 }
        ];

        const mockStats: AssignmentStats = {
          total: mockAssignments.length,
          bySubject: [
            { subject: 'Database Systems', count: 8, percentage: 18.2 },
            { subject: 'Web Technologies', count: 6, percentage: 13.6 },
            { subject: 'Data Structures', count: 12, percentage: 27.3 },
            { subject: 'Machine Learning', count: 7, percentage: 15.9 },
            { subject: 'Algorithms', count: 9, percentage: 20.5 },
            { subject: 'Other', count: 2, percentage: 4.5 }
          ],
          bySection: [
            { section: 'CSE-A', count: 14, percentage: 31.8 },
            { section: 'CSE-B', count: 21, percentage: 47.7 },
            { section: 'AIML-1', count: 7, percentage: 15.9 },
            { section: 'Other', count: 2, percentage: 4.6 }
          ],
          byWorkload: [
            { workload: 'optimal', count: 18, percentage: 40.9 },
            { workload: 'heavy', count: 8, percentage: 18.2 },
            { workload: 'light', count: 18, percentage: 40.9 }
          ]
        };

        setAssignments(mockAssignments);
        setSections(mockSections);
        setAssignmentStats(mockStats);
        setLoading(false);
      }, 1000);
    };

    fetchTeacherAssignments();
  }, []);

  useEffect(() => {
    let filtered = assignments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.teacherEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply section filter
    if (sectionFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.sectionId === sectionFilter);
    }

    // Apply workload filter
    if (workloadFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.workload === workloadFilter);
    }

    // Apply performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.performance === performanceFilter);
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, sectionFilter, workloadFilter, performanceFilter]);

  const getWorkloadColor = (workload: string) => {
    switch (workload) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'heavy': return 'text-red-600 bg-red-100';
      case 'light': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'needs_improvement': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const openDetailsModal = (assignment: TeacherAssignment) => {
    setSelectedAssignment(assignment);
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
          <h1 className="text-3xl font-bold text-gray-900">Teacher Assignments</h1>
          <p className="text-gray-600 mt-2">Monitor teacher workload and assignment distribution</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh Data</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignmentStats.total}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Optimal Workload</p>
              <p className="text-2xl font-bold text-green-600">
                {assignmentStats.byWorkload.find(w => w.workload === 'optimal')?.count || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Heavy Workload</p>
              <p className="text-2xl font-bold text-red-600">
                {assignmentStats.byWorkload.find(w => w.workload === 'heavy')?.count || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Performance</p>
              <p className="text-2xl font-bold text-blue-600">79.8%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by teacher, section, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'section' ? null : 'section')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Section: {sectionFilter === 'all' ? 'All' : sections.find(s => s.id === sectionFilter)?.name}</span>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'section' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                <button
                  onClick={() => {
                    setSectionFilter('all');
                    setDropdownOpen(null);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  All Sections
                </button>
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSectionFilter(section.id);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    {section.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'workload' ? null : 'workload')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Workload: {workloadFilter === 'all' ? 'All' : workloadFilter}</span>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'workload' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                {['all', 'optimal', 'heavy', 'light'].map(workload => (
                  <button
                    key={workload}
                    onClick={() => {
                      setWorkloadFilter(workload);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 capitalize"
                  >
                    {workload === 'all' ? 'All Workloads' : workload}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === 'performance' ? null : 'performance')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-400" />
            <span>Performance: {performanceFilter === 'all' ? 'All' : performanceFilter.replace('_', ' ')}</span>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          <AnimatePresence>
            {dropdownOpen === 'performance' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
              >
                {['all', 'excellent', 'good', 'average', 'needs_improvement'].map(performance => (
                  <button
                    key={performance}
                    onClick={() => {
                      setPerformanceFilter(performance);
                      setDropdownOpen(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 capitalize"
                  >
                    {performance === 'all' ? 'All Performance' : performance.replace('_', ' ')}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Distribution by Subject */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Assignment Distribution by Subject</span>
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {assignmentStats.bySubject.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{subject.count} assignments</span>
                  <span className="text-xs text-gray-500">({subject.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Assignment Distribution by Section */}
        <GlassCard>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Assignment Distribution by Section</span>
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {assignmentStats.bySection.map((section, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{section.section}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{section.count} assignments</span>
                  <span className="text-xs text-gray-500">({section.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Teacher Assignments Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workload</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <motion.tr
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.teacherName}</div>
                      <div className="text-sm text-gray-500">{assignment.teacherEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.sectionName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.totalStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.activeAssignments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.pendingReviews > 15 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {assignment.pendingReviews}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.averageGrade.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(assignment.workload)}`}>
                      {assignment.workload}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(assignment.performance)}`}>
                      {assignment.performance.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDetailsModal(assignment)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === assignment.id ? null : assignment.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAssignment && (
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
                  <h2 className="text-xl font-semibold text-gray-900">Teacher Assignment Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Teacher Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Name</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.teacherName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Email</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.teacherEmail}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Subject</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.subject}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Section</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.sectionName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Total Students</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.totalStudents}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Active Assignments</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.activeAssignments}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Pending Reviews</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.pendingReviews}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Average Grade</span>
                        <span className="text-sm font-medium text-gray-900">{selectedAssignment.averageGrade.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getWorkloadColor(selectedAssignment.workload)}`}>
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Workload</p>
                    <p className={`text-lg font-bold ${getWorkloadColor(selectedAssignment.workload).split(' ')[0]}`}>
                      {selectedAssignment.workload}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getPerformanceColor(selectedAssignment.performance)}`}>
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Performance</p>
                    <p className={`text-lg font-bold ${getPerformanceColor(selectedAssignment.performance).split(' ')[0]}`}>
                      {selectedAssignment.performance.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-blue-100">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Last Activity</p>
                    <p className="text-lg font-bold text-gray-900">{formatTimeAgo(selectedAssignment.lastActivity)}</p>
                  </div>
                </div>
              </div>

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

export default AdminTeacherAssignments;
