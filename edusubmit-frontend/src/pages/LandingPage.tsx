import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Laptop } from 'lucide-react';

const LandingPage = () => {
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
        <div className="flex items-center space-x-4">
          <Link 
            to="/select-role"
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/select-role"
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-12 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Submit assignments. On time. Stress-free.
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                For students, faculty, and administrators. All in one secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/select-role"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link 
                  to="/select-role"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl flex items-center justify-center">
                  <Laptop className="w-32 h-32 md:w-40 md:h-40 text-green-600" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
