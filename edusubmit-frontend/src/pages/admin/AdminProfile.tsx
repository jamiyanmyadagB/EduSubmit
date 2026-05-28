import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  Key,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Upload,
  FileText
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useAuthStore } from '../../store/authStore';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN';
  employeeId: string;
  department: string;
  profilePhoto?: string;
  bio?: string;
  createdAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  permissions: string[];
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<AdminProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    employeeId: '',
    department: '',
    profilePhoto: '',
    bio: '',
    createdAt: '',
    lastLogin: '',
    twoFactorEnabled: false,
    permissions: []
  });

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Simulate API call to fetch admin profile
    const fetchProfile = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockProfile: AdminProfile = {
          id: 'admin-1',
          name: 'System Administrator',
          email: 'admin@lpu.in',
          phone: '+91 98765 43210',
          role: 'ADMIN',
          employeeId: 'LPUA2020001',
          department: 'IT Administration',
          profilePhoto: '',
          bio: 'System administrator responsible for managing the EduSubmit platform, user accounts, and system configuration.',
          createdAt: '2020-01-01T00:00:00',
          lastLogin: '2026-05-08T07:00:00',
          twoFactorEnabled: true,
          permissions: [
            'user_management',
            'section_management',
            'system_settings',
            'monitoring',
            'backup_restore',
            'audit_logs'
          ]
        };

        setProfile(mockProfile);
        setLoading(false);
      }, 1000);
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (field: keyof AdminProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: keyof PasswordChange, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    
    // Simulate API call to save profile
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        profilePhoto: profilePhotoPreview || prev.profilePhoto
      }));
      
      setEditMode(false);
      setSaving(false);
      setProfilePhotoPreview('');
    }, 2000);
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setChangingPassword(true);
    
    // Simulate API call to change password
    setTimeout(() => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMode(false);
      setChangingPassword(false);
      setErrors({});
    }, 2000);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ profilePhoto: 'Profile photo must be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhotoPreview(e.target?.result as string);
      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    };
    reader.readAsDataURL(file);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-2">Manage your administrator account settings</p>
        </div>
        <div className="flex items-center space-x-3">
          {!editMode && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              <span>Edit Profile</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPasswordMode(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Key className="w-5 h-5" />
            <span>Change Password</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo */}
        <div className="lg:col-span-1">
          <GlassCard>
            <div className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {profilePhotoPreview || profile.profilePhoto ? (
                      <img
                        src={profilePhotoPreview || profile.profilePhoto}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-purple-600" />
                    )}
                  </div>
                  {editMode && (
                    <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.email}</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Administrator</span>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Employee ID</span>
                    <span className="text-sm font-medium text-gray-900">{profile.employeeId}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="text-sm font-medium text-gray-900">{profile.department}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">2FA Enabled</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.twoFactorEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(profile.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profile.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profile.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profile.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => handleProfileChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profile.department}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {editMode ? (
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                    </div>
                  )}
                </div>

                {errors.profilePhoto && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{errors.profilePhoto}</span>
                  </div>
                )}
              </div>

              {editMode && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setProfilePhotoPreview('');
                      setErrors({});
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </motion.button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Permissions */}
          <GlassCard className="mt-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {permission.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {passwordMode && (
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
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                  <button
                    onClick={() => {
                      setPasswordMode(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{changingPassword ? 'Changing...' : 'Change Password'}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProfile;
