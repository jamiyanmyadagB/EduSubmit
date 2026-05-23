import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Users,
  Search,
  Filter,
  Eye,
  MoreVertical,
  Archive,
  UserPlus
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'TEACHER';
  status: 'ACTIVE' | 'INACTIVE';
  assignedSections: number;
}

interface Section {
  id: string;
  name: string;
  description?: string;
  studentCount: number;
  teacherId?: string;
  teacherName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

const Sections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  });

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API calls to fetch sections and teachers
    const fetchData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockSections: Section[] = [
          {
            id: '1',
            name: 'CS-A',
            description: 'Computer Science Section A - Focus on algorithms and data structures',
            studentCount: 20,
            teacherId: 'teacher1',
            teacherName: 'Sarah Johnson',
            status: 'ACTIVE',
            createdAt: '2026-01-15T10:00:00',
            updatedAt: '2026-01-15T10:00:00'
          },
          {
            id: '2',
            name: 'CS-B',
            description: 'Computer Science Section B - Focus on database systems and software engineering',
            studentCount: 25,
            teacherId: 'teacher2',
            teacherName: 'Mike Wilson',
            status: 'ACTIVE',
            createdAt: '2026-01-15T10:00:00',
            updatedAt: '2026-01-15T10:00:00'
          },
          {
            id: '3',
            name: 'CS-C',
            description: 'Computer Science Section C - Focus on web development and mobile applications',
            studentCount: 7,
            teacherId: 'teacher1',
            teacherName: 'Sarah Johnson',
            status: 'ACTIVE',
            createdAt: '2026-01-15T10:00:00',
            updatedAt: '2026-01-15T10:00:00'
          },
          {
            id: '4',
            name: 'CS-D',
            description: 'Computer Science Section D - Focus on artificial intelligence and machine learning',
            studentCount: 18,
            teacherId: 'teacher3',
            teacherName: 'Alice Davis',
            status: 'ACTIVE',
            createdAt: '2026-01-15T10:00:00',
            updatedAt: '2026-01-15T10:00:00'
          },
          {
            id: '5',
            name: 'AIML-1',
            description: 'Artificial Intelligence and Machine Learning Section 1 - Advanced AI concepts and applications',
            studentCount: 12,
            teacherId: 'teacher4',
            teacherName: 'Robert Brown',
            status: 'INACTIVE',
            createdAt: '2026-01-15T10:00:00',
            updatedAt: '2026-01-15T10:00:00'
          }
        ];

        const mockTeachers: Teacher[] = [
          {
            id: 'teacher1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@lpu.in',
            phone: '+91-9876543212',
            role: 'TEACHER',
            status: 'ACTIVE',
            assignedSections: 2
          },
          {
            id: 'teacher2',
            name: 'Mike Wilson',
            email: 'mike.wilson@lpu.in',
            phone: '+91-9876543213',
            role: 'TEACHER',
            status: 'ACTIVE',
            assignedSections: 1
          },
          {
            id: 'teacher3',
            name: 'Alice Davis',
            email: 'alice.davis@lpu.in',
            phone: '+91-9876543214',
            role: 'TEACHER',
            status: 'ACTIVE',
            assignedSections: 1
          },
          {
            id: 'teacher4',
            name: 'Robert Brown',
            email: 'robert.brown@lpu.in',
            phone: '+91-9876543215',
            role: 'TEACHER',
            status: 'INACTIVE',
            assignedSections: 0
          }
        ];

        setSections(mockSections);
        setFilteredSections(mockSections);
        setTeachers(mockTeachers);
        setLoading(false);
      }, 1500);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter sections based on search and status
    let filtered = sections;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(section => section.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (section.description && section.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSections(filtered);
  }, [sections, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'ARCHIVED': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleCreateSection = () => {
    setSelectedSection(null);
    setFormData({
      name: '',
      description: '',
      status: 'ACTIVE'
    });
    setShowCreateModal(true);
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setFormData({
      name: section.name,
      description: section.description || '',
      status: section.status
    });
    setShowEditModal(true);
  };

  const handleAssignTeacher = (section: Section) => {
    setSelectedSection(section);
    setShowAssignTeacherModal(true);
  };

  const handleArchiveSection = (sectionId: string) => {
    // In real app, this would call API to archive section
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, status: 'ARCHIVED' }
        : section
    ));
  };

  const handleSaveSection = async () => {
    // Validate form
    if (!formData.name.trim()) {
      return;
    }

    try {
      // Simulate API call to save section
      setTimeout(() => {
        if (showCreateModal) {
          const newSection: Section = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            studentCount: 0,
            status: formData.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          setSections(prev => [...prev, newSection]);
          setShowCreateModal(false);
        } else if (showEditModal && selectedSection) {
          const updatedSection: Section = {
            ...selectedSection,
            name: formData.name,
            description: formData.description,
            status: formData.status,
            updatedAt: new Date().toISOString()
          };

          setSections(prev => prev.map(section =>
            section.id === selectedSection.id ? updatedSection : section
          ));
          setShowEditModal(false);
        }

        setFormData({
          name: '',
          description: '',
          status: 'ACTIVE'
        });
        setSelectedSection(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to save section:', err);
    }
  };

  const handleAssignTeacherToSection = async (teacherId: string) => {
    if (!selectedSection) return;

    try {
      // Simulate API call to assign teacher to section
      setTimeout(() => {
        const updatedSection: Section = {
          ...selectedSection,
          teacherId: teacherId,
          teacherName: teachers.find(t => t.id === teacherId)?.name
        };

        setSections(prev => prev.map(section =>
          section.id === selectedSection.id ? updatedSection : section
        ));

        // Update teacher's assigned sections count
        setTeachers(prev => prev.map(teacher =>
          teacher.id === teacherId
            ? { ...teacher, assignedSections: teacher.assignedSections + 1 }
            : teacher
        ));

        setShowAssignTeacherModal(false);
        setSelectedSection(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to assign teacher:', err);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Section Management</h1>
          <p className="text-gray-600">Create and manage academic sections and assign teachers</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections..."
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Create Button */}
          <motion.button
            onClick={handleCreateSection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Section</span>
          </motion.button>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{section.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {section.studentCount} students
                    </p>
                    {section.description && (
                      <p className="text-sm text-gray-600">
                        {section.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(section.status)}`}>
                      {section.status}
                    </span>
                    
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Teacher Assignment */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teacher:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {section.teacherName || 'Not Assigned'}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => handleAssignTeacher(section)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm">Assign Teacher</span>
                  </motion.button>
                </div>

                {/* Section Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(section.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(section.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={() => handleEditSection(section)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleArchiveSection(section.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                      <span className="text-sm">Archive</span>
                    </motion.button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => {
                        // In real app, this would navigate to section details
                        console.log('View section details:', section.name);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View Details</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSections.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'Create your first section to get started'}
          </p>
        </div>
      )}

      {/* Create/Edit Section Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {showCreateModal ? 'Create Section' : 'Edit Section'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedSection(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Section Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedSection(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleSaveSection}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{showCreateModal ? 'Create Section' : 'Save Changes'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showAssignTeacherModal && selectedSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Assign Teacher to {selectedSection.name}</h2>
                <button
                  onClick={() => {
                    setShowAssignTeacherModal(false);
                    setSelectedSection(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Select Teacher</label>
                  <select
                    onChange={(e) => handleAssignTeacherToSection(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select a teacher...</option>
                    {teachers
                      .filter(teacher => teacher.status === 'ACTIVE')
                      .map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.assignedSections} sections)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Current Teacher:</strong> {selectedSection.teacherName || 'Not Assigned'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Students:</strong> {selectedSection.studentCount}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowAssignTeacherModal(false);
                    setSelectedSection(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Sections;
