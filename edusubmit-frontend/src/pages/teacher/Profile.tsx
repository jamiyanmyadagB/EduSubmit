import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import GlassCard from '../../components/ui/GlassCard';
import { 
  User,
  Mail,
  Phone,
  Camera,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Shield,
  LogOut
} from 'lucide-react';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  department: string;
  specialization: string;
  experience: string;
  employeeId: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    department: '',
    specialization: '',
    experience: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Simulate API call to fetch teacher profile
    const fetchProfile = async () => {
      setLoading(true);
      
      setTimeout(() => {
        const mockProfile: TeacherProfile = {
          id: user?.id || 'teacher1',
          name: user?.name || 'Dr. Sarah Johnson',
          email: user?.email || 'sarah.johnson@lpu.in',
          phone: '+91-9876543210',
          avatar: 'https://example.com/avatar.jpg',
          bio: 'Experienced computer science professor with 10+ years of teaching experience. Specialized in database systems, algorithms, and software engineering. Passionate about mentoring students and conducting cutting-edge research.',
          department: 'Computer Science & Engineering',
          specialization: 'Database Systems & Algorithms',
          experience: '10+ years',
          employeeId: 'LPU2023001',
          role: 'TEACHER',
          status: 'ACTIVE',
          createdAt: '2026-01-15T10:00:00',
          lastLogin: new Date().toISOString()
        };

        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          phone: mockProfile.phone || '',
          bio: mockProfile.bio || '',
          department: mockProfile.department,
          specialization: mockProfile.specialization,
          experience: mockProfile.experience
        });
        setLoading(false);
      }, 1000);
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    // Validate form
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Simulate API call to update profile
      setTimeout(() => {
        const updatedProfile: TeacherProfile = {
          ...profile!,
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          department: formData.department,
          specialization: formData.specialization,
          experience: formData.experience,
          avatar: avatarPreview || profile?.avatar
        };

        setProfile(updatedProfile);
        setSaving(false);
        setSuccess('Profile updated successfully!');
        
        // Update auth store if name changed
        if (formData.name !== user?.name) {
          const { setUser } = useAuthStore.getState();
          setUser({ ...user!, name: formData.name });
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }, 2000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Simulate API call to change password
      setTimeout(() => {
        setSaving(false);
        setSuccess('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }, 2000);
    } catch (err) {
      setError('Failed to change password. Please try again.');
      setSaving(false);
    }
  };

  const handleLogout = () => {
    const { logout } = useAuthStore.getState();
    logout();
    // In real app, this would redirect to login page
    window.location.href = '/login';
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <motion.button
                  onClick={() => setEditing(!editing)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{editing ? 'Cancel' : 'Edit'}</span>
                </motion.button>
              </div>

              {/* Avatar */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">Profile Photo</label>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">
                      {editing && (
                        <span>Click to upload new photo</span>
                      )}
                    </div>
                    
                    {editing && (
                      <label className="relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <Camera className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editing ? formData.name : profile?.name || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editing ? formData.phone : profile?.phone || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={editing ? formData.department : profile?.department || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={editing ? formData.specialization : profile?.specialization || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={editing ? formData.experience : profile?.experience || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={editing ? formData.bio : profile?.bio || ''}
                    onChange={handleInputChange}
                    disabled={!editing}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Save Button */}
              {editing && (
                <div className="flex items-center justify-end space-x-3 mt-6">
                  {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                  )}
                  
                  {success && (
                    <p className="text-green-600 text-sm">{success}</p>
                  )}
                  
                  <motion.button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </motion.button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Account Security */}
        <GlassCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                onClick={handlePasswordChange}
                disabled={saving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>{saving ? 'Changing Password...' : 'Change Password'}</span>
              </motion.button>
            </div>

            {/* Error/Success Messages */}
            {(error || success) && (
              <div className={`mt-4 p-3 rounded-lg ${
                error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <p className={`text-sm ${error ? 'text-red-800' : 'text-green-800'}`}>
                  {error || success}
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Account Info */}
        <GlassCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Employee ID:</span>
                <span className="font-medium text-gray-900">{profile?.employeeId || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <span className="font-medium text-gray-900">{profile?.role || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <span className="font-medium text-gray-900">{profile?.department || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since:</span>
                <span className="font-medium text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login:</span>
                <span className="font-medium text-gray-900">
                  {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                <strong>Important:</strong> Some fields like Employee ID, Role, and Department can only be modified by administrators. 
                Teachers cannot modify their role permissions or access admin-level settings.
              </p>
              
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Profile;
