import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import adminApiService from '../../services/adminApiService';
import { AlertTriangle } from 'lucide-react';
import { 
  Users as UsersIcon,
  Plus,
  Edit3,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  Eye,
  EyeOff,
  Key,
  UserCheck,
  UserX,
  MoreVertical
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  sectionId?: string;
  sectionName?: string;
  employeeId?: string;
  createdAt: string;
  lastLogin: string;
  studentId?: string;
  teacherId?: string;
}

interface Section {
  id: string;
  name: string;
  studentCount: number;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER' | 'ADMIN',
    sectionId: '',
    employeeId: ''
  });

  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminApiService.getAllUsers(0, 50, 'createdAt', 'desc');
        setUsers(response.content);
        setFilteredUsers(response.content);
        
        // Fetch sections/departments
        try {
          const deptResponse = await adminApiService.getAllDepartments(0, 50, 'name', 'asc');
          setSections(deptResponse.content.map((dept: any) => ({
            id: dept.id,
            name: dept.name,
            studentCount: 0
          })));
        } catch (err) {
          console.error('Error fetching sections:', err);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search and filters
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (sectionFilter !== 'all') {
      filtered = filtered.filter(user => user.sectionId === sectionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.teacherId && user.teacherId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, sectionFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'TEACHER': return 'text-green-600 bg-green-50 border-green-200';
      case 'STUDENT': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50 border-green-200';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'SUSPENDED': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'STUDENT',
      sectionId: '',
      employeeId: ''
    });
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      sectionId: user.sectionId || '',
      employeeId: user.studentId || user.teacherId || ''
    });
    setShowEditModal(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const handleDisableUser = async (userId: string) => {
    try {
      await adminApiService.updateUserStatus(userId, 'INACTIVE');
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, status: 'INACTIVE' }
          : user
      ));
    } catch (err) {
      console.error('Error disabling user:', err);
      alert('Failed to disable user. Please try again.');
    }
  };

  const handleEnableUser = async (userId: string) => {
    try {
      await adminApiService.updateUserStatus(userId, 'ACTIVE');
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, status: 'ACTIVE' }
          : user
      ));
    } catch (err) {
      console.error('Error enabling user:', err);
      alert('Failed to enable user. Please try again.');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await adminApiService.updateUserStatus(userId, 'SUSPENDED');
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, status: 'SUSPENDED' }
          : user
      ));
    } catch (err) {
      console.error('Error suspending user:', err);
      alert('Failed to suspend user. Please try again.');
    }
  };

  const handleSaveUser = async () => {
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.employeeId.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email domain - only LPU emails allowed
    if (!formData.email.endsWith('@lpu.in')) {
      alert('Email must be from @lpu.in domain');
      return;
    }

    try {
      if (showCreateModal) {
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          passwordHash: 'defaultPassword123',
          sectionId: formData.sectionId || undefined,
          studentId: formData.role === 'STUDENT' ? formData.employeeId : undefined,
          teacherId: formData.role === 'TEACHER' ? formData.employeeId : undefined,
          employeeId: formData.role === 'ADMIN' ? formData.employeeId : undefined
        };
        await adminApiService.createUser(userData);
        setShowCreateModal(false);
        // Refresh users
        const response = await adminApiService.getAllUsers(0, 50, 'createdAt', 'desc');
        setUsers(response.content);
        setFilteredUsers(response.content);
      } else if (showEditModal && selectedUser) {
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          sectionId: formData.sectionId || undefined,
          studentId: formData.role === 'STUDENT' ? formData.employeeId : undefined,
          teacherId: formData.role === 'TEACHER' ? formData.employeeId : undefined,
          employeeId: formData.role === 'ADMIN' ? formData.employeeId : undefined
        };
        await adminApiService.updateUser(selectedUser.id, userData);
        setShowEditModal(false);
        // Refresh users
        const response = await adminApiService.getAllUsers(0, 50, 'createdAt', 'desc');
        setUsers(response.content);
        setFilteredUsers(response.content);
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'STUDENT',
        sectionId: '',
        employeeId: ''
      });
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to save user:', err);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUser) return;

    try {
      await adminApiService.resetUserPassword(selectedUser.id, 'temporaryPassword123');
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      alert('Password reset successfully. User will receive an email with the new temporary password.');
    } catch (err) {
      console.error('Failed to reset password:', err);
      alert('Failed to reset password. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Create and manage user accounts and permissions</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
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
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            onClick={handleCreateUser}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </motion.button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard>
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{user.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {user.studentId || user.teacherId || user.employeeId}
                    </span>
                    
                    <div className="relative">
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.sectionName && (
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.sectionName}</span>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => handleEditUser(user)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleResetPassword(user)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      <Key className="w-4 h-4" />
                      <span className="text-sm">Reset Password</span>
                    </motion.button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.status === 'ACTIVE' && (
                      <motion.button
                        onClick={() => handleDisableUser(user.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        <span className="text-sm">Disable</span>
                      </motion.button>
                    )}
                    
                    {user.status === 'INACTIVE' && (
                      <motion.button
                        onClick={() => handleEnableUser(user.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span className="text-sm">Enable</span>
                      </motion.button>
                    )}
                    
                    {user.status === 'SUSPENDED' && (
                      <motion.button
                        onClick={() => handleEnableUser(user.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span className="text-sm">Unsuspend</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search or filters' : 'No users available'}
          </p>
        </div>
      )}

      {/* Create/Edit User Modal */}
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
                  {showCreateModal ? 'Create User' : 'Edit User'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only @lpu.in emails allowed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Section</label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select Section</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {formData.role === 'STUDENT' ? 'Student ID' : formData.role === 'TEACHER' ? 'Teacher ID' : 'Employee ID'}
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleSaveUser}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>{showCreateModal ? 'Create User' : 'Save Changes'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full"
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">User</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value="temporaryPassword123"
                      readOnly
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> This will reset the user's password to a temporary password. 
                    The user will receive an email with the new temporary password and will be required to change it on first login.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 mt-6">
                <motion.button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  onClick={handleConfirmResetPassword}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>Reset Password</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Users;
