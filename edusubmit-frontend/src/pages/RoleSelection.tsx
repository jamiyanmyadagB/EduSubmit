import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GraduationCap, UserCog, Shield } from 'lucide-react';

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">EduSubmit</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose your role
            </h1>
            <p className="text-lg text-gray-600">
              Please select how you want to continue.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Student Card */}
            <Link 
              to="/login/student"
              className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-600 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <GraduationCap className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Student</h2>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </Link>

            {/* Faculty Card */}
            <Link 
              to="/login/faculty"
              className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-600 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <UserCog className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Faculty</h2>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </Link>

            {/* Admin Card */}
            <Link 
              to="/login/admin"
              className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-600 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <Shield className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Admin</h2>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-gray-500">
              Not sure? Contact your administrator.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleSelection;
