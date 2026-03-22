import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/3D/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';
import AnimatedChart from '../components/charts/AnimatedChart';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Calendar,
  Clock,
  BookOpen,
  Star
} from 'lucide-react';

interface ProgressData {
  name: string;
  value: number;
  assignments: number;
  averageGrade: number;
}

interface SubjectPerformance {
  subject: string;
  grade: number;
  assignments: number;
  improvement: number;
}

const StudentProgress = () => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching progress data
    setTimeout(() => {
      setProgressData([
        { name: 'Jan', value: 78, assignments: 3, averageGrade: 78 },
        { name: 'Feb', value: 82, assignments: 4, averageGrade: 82 },
        { name: 'Mar', value: 85, assignments: 5, averageGrade: 85 },
        { name: 'Apr', value: 88, assignments: 3, averageGrade: 88 },
        { name: 'May', value: 91, assignments: 4, averageGrade: 91 },
        { name: 'Jun', value: 93, assignments: 6, averageGrade: 93 }
      ]);

      setSubjectPerformance([
        { subject: 'Mathematics', grade: 92, assignments: 8, improvement: 15 },
        { subject: 'Computer Science', grade: 88, assignments: 12, improvement: 22 },
        { subject: 'Physics', grade: 85, assignments: 6, improvement: 8 },
        { subject: 'Chemistry', grade: 79, assignments: 5, improvement: -5 },
        { subject: 'English', grade: 94, assignments: 4, improvement: 12 }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const overallStats = {
    totalAssignments: progressData.reduce((acc, curr) => acc + curr.assignments, 0),
    averageGrade: progressData.length > 0 
      ? progressData.reduce((acc, curr) => acc + curr.averageGrade, 0) / progressData.length 
      : 0,
    improvement: progressData.length > 1 
      ? progressData[progressData.length - 1].averageGrade - progressData[0].averageGrade 
      : 0
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full z-10"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Your Progress</h1>
          <p className="text-gray-300">Track your academic performance and improvement over time</p>
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Assignments</p>
                  <p className="text-3xl font-bold text-white">{overallStats.totalAssignments}</p>
                </div>
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Average Grade</p>
                  <p className="text-3xl font-bold text-white">{overallStats.averageGrade.toFixed(1)}%</p>
                </div>
                <Award className="w-10 h-10 text-green-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Improvement</p>
                  <p className={`text-3xl font-bold ${overallStats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {overallStats.improvement >= 0 ? '+' : ''}{overallStats.improvement.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-400" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Study Streak</p>
                  <p className="text-3xl font-bold text-white">15 days</p>
                </div>
                <Target className="w-10 h-10 text-yellow-400" />
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <motion.div variants={itemVariants}>
            <AnimatedChart
              data={progressData}
              type="area"
              title="Grade Progress Over Time"
              color="#3b82f6"
              height={350}
              dataKey="averageGrade"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedChart
              data={progressData}
              type="bar"
              title="Assignments Completed"
              color="#10b981"
              height={350}
              dataKey="assignments"
            />
          </motion.div>
        </motion.div>

        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6" />
              Subject Performance
            </h2>
            
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <motion.div
                  key={subject.subject}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{subject.subject}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-300 text-sm">{subject.assignments} assignments</span>
                        <span className={`text-sm font-medium ${
                          subject.improvement >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {subject.improvement >= 0 ? '+' : ''}{subject.improvement}%
                        </span>
                        <span className="text-xl font-bold text-white">{subject.grade}%</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.grade}%` }}
                        transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                        className={`h-3 rounded-full ${
                          subject.grade >= 90 ? 'bg-green-500' : 
                          subject.grade >= 80 ? 'bg-blue-500' : 
                          subject.grade >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Recent Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Perfect Score', description: '100% in Mathematics', icon: '🏆', color: 'text-yellow-400' },
                { title: 'Consistency King', description: '30-day study streak', icon: '🔥', color: 'text-red-400' },
                { title: 'Quick Learner', description: 'Completed 5 assignments this week', icon: '⚡', color: 'text-blue-400' }
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-white/10 to-white/5 rounded-lg text-center"
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h3 className={`font-semibold ${achievement.color} mb-1`}>{achievement.title}</h3>
                  <p className="text-gray-300 text-sm">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProgress;
