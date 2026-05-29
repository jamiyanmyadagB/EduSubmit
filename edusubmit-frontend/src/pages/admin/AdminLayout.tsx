import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Monitor,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'sections', label: 'Sections', icon: BookOpen, path: '/admin/sections' },
    { id: 'teacher-assignments', label: 'Teacher Assignments', icon: Calendar, path: '/admin/teacher-assignments' },
    { id: 'timetable', label: 'Timetable', icon: Calendar, path: '/admin/timetable' },
    { id: 'monitoring', label: 'System Monitoring', icon: Monitor, path: '/admin/monitoring' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications', badge: 3 },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'profile', label: 'Profile', icon: User, path: '/admin/profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: -280, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? 'open' : 'closed'}
        className="fixed left-0 top-0 min-h-screen w-72 bg-gradient-to-b from-purple-600 to-indigo-700 text-white z-50 lg:translate-x-0 lg:static"
      >
        <div className="flex flex-col min-h-screen">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">EduSubmit</h1>
                  <p className="text-xs text-purple-200">Admin Portal</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-white/20 text-white shadow-lg' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-purple-200 truncate">{user?.email || 'admin@lpu.in'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      <div className="lg:ml-72">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
                  <Menu className="w-6 h-6" />
                </button>
                <div className="hidden lg:block">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {navItems.find(item => item.path === location.pathname)?.label || 'Admin Dashboard'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-700">System Healthy</span>
                </div>

                <Link to="/admin/notifications" className="relative p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                <div className="relative">
                  <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center space-x-2 p-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50"
                      >
                        <Link to="/admin/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link to="/admin/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <hr className="my-1" />
                        <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
