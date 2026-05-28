// API Service for EduSubmit Platform
// Handles all API calls with proper authentication and RBAC validation

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    this.token = localStorage.getItem('edusubmit_token');
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('edusubmit_token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('edusubmit_token');
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('edusubmit_token');
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // File upload method
  private async uploadFile(file: File, endpoint: string, additionalData: Record<string, any> = {}): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const config: RequestInit = {
      method: 'POST',
      body: formData,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers = {
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request<ApiResponse<{
      user: {
        id: string;
        email: string;
        name: string;
        role: 'STUDENT' | 'TEACHER' | 'ADMIN';
      };
      token: string;
    }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
      this.removeToken();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Student endpoints
  async getStudentProfile() {
    return this.request<{
        id: string;
        name: string;
        email: string;
        studentId: string;
        section: string;
        role: string;
        avatar?: string;
      }>('/student/profile');
  }

  async getStudentAssignments() {
    return this.request<Assignments[]>('/student/assignments');
  }

  async getStudentSubmissions() {
    return this.request<Submissions[]>('/student/submissions');
  }

  async submitAssignment(assignmentId: string, file: File) {
    return this.uploadFile(file, '/student/submissions', { assignmentId });
  }

  async getStudentExams() {
    return this.request<Exams[]>('/student/exams');
  }

  async getStudentNotifications() {
    return this.request<Notifications[]>('/student/notifications');
  }

  async markStudentNotificationAsRead(notificationId: string) {
    return this.request(`/student/notifications/${notificationId}/read`, { method: 'POST' });
  }

  async deleteStudentNotification(notificationId: string) {
    return this.request(`/student/notifications/${notificationId}`, { method: 'DELETE' });
  }

  async getStudentExamTimetable() {
    return this.request<ExamSchedule[]>('/student/exam-timetable');
  }

  async addExamReminder(examId: string, reminder: string) {
    return this.request(`/student/exams/${examId}/reminder`, {
      method: 'POST',
      body: JSON.stringify({ reminder }),
    });
  }

  async getAIAssistantResponse(message: string) {
    return this.request<AIResponse>('/student/ai-assistant', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getAIResources(topic: string) {
    return this.request<AIResources[]>(`/student/ai-resources?topic=${encodeURIComponent(topic)}`);
  }

  // Profile endpoints
  async updateStudentProfile(profileData: {
    name?: string;
    phone?: string;
    bio?: string;
    avatar?: File;
  }) {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      const value = profileData[key as keyof typeof profileData];
      if (value !== undefined) {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      }
    });

    return this.uploadFile(formData as any, '/student/profile');
  }

  async changeStudentPassword(currentPassword: string, newPassword: string) {
    return this.request('/student/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Teacher endpoints (for reference)
  async getTeacherAssignments() {
    return this.request<Assignments[]>('/teacher/assignments');
  }

  async createAssignment(assignmentData: any) {
    return this.request('/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async getSubmissions(assignmentId: string) {
    return this.request<Submissions[]>(`/teacher/assignments/${assignmentId}/submissions`);
  }

  async gradeSubmission(submissionId: string, gradeData: any) {
    return this.request(`/teacher/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async getTeacherNotifications() {
    return this.request<Notifications[]>('/teacher/notifications');
  }

  // Comprehensive Teacher Dashboard Endpoints
  async getTeacherDashboardStats() {
    return this.request<{
      activeAssignments: number;
      pendingReviews: number;
      completedReviews: number;
      upcomingExams: number;
      lateSubmissions: number;
      totalStudents: number;
      averageGrade: number;
    }>('/teacher/dashboard/stats');
  }

  async getRecentSubmissions() {
    return this.request<{
      id: string;
      studentName: string;
      assignmentTitle: string;
      submittedAt: string;
      status: 'pending' | 'reviewed' | 'graded';
      aiSuspicionScore?: number;
    }[]>('/teacher/dashboard/recent-submissions');
  }

  async getUpcomingDeadlines() {
    return this.request<{
      id: string;
      title: string;
      subject: string;
      deadline: string;
      submissionsCount: number;
      totalStudents: number;
    }[]>('/teacher/dashboard/upcoming-deadlines');
  }

  async getSectionActivity() {
    return this.request<{
      sectionName: string;
      studentCount: number;
      activeAssignments: number;
      pendingSubmissions: number;
      averagePerformance: number;
    }[]>('/teacher/dashboard/section-activity');
  }

  async getAISuggestions() {
    return this.request<{
      id: string;
      type: 'deadline_alert' | 'performance_insight' | 'grading_suggestion';
      message: string;
      priority: 'high' | 'medium' | 'low';
      actionable: boolean;
    }[]>('/teacher/dashboard/ai-suggestions');
  }

  // Assignment Management Endpoints
  async updateAssignment(assignmentId: string, assignmentData: any) {
    return this.request(`/teacher/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteAssignment(assignmentId: string) {
    return this.request(`/teacher/assignments/${assignmentId}`, { method: 'DELETE' });
  }

  async archiveAssignment(assignmentId: string) {
    return this.request(`/teacher/assignments/${assignmentId}/archive`, { method: 'POST' });
  }

  async publishAssignment(assignmentId: string) {
    return this.request(`/teacher/assignments/${assignmentId}/publish`, { method: 'POST' });
  }

  async unpublishAssignment(assignmentId: string) {
    return this.request(`/teacher/assignments/${assignmentId}/unpublish`, { method: 'POST' });
  }

  async getAssignmentAnalytics(assignmentId: string) {
    return this.request<{
      totalSubmissions: number;
      onTimeSubmissions: number;
      lateSubmissions: number;
      averageGrade: number;
      averageAISuspicion: number;
      submissionTrends: Array<{
        date: string;
        count: number;
      }>;
    }>(`/teacher/assignments/${assignmentId}/analytics`);
  }

  // Submission Management Endpoints
  async getAllSubmissions(filters?: {
    assignmentId?: string;
    status?: string;
    section?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.assignmentId) params.append('assignmentId', filters.assignmentId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.section) params.append('section', filters.section);
    if (filters?.search) params.append('search', filters.search);
    
    return this.request<{
      id: string;
      assignmentId: string;
      assignmentTitle: string;
      subject: string;
      deadline: string;
      studentName: string;
      studentEmail: string;
      submittedAt: string;
      status: 'pending' | 'reviewed' | 'completed' | 'late' | 'ai-suspected' | 'resubmission_requested';
      files: Array<{
        id: string;
        name: string;
        url: string;
        size: string;
        type: string;
      }>;
      feedback?: string;
      grade?: number;
      aiSuspicionScore?: number;
      resubmissionRequested?: boolean;
      resubmissionDeadline?: string;
    }[]>(`/teacher/submissions?${params.toString()}`);
  }

  async getSubmissionDetails(submissionId: string) {
    return this.request<{
      id: string;
      assignmentId: string;
      assignmentTitle: string;
      subject: string;
      deadline: string;
      studentName: string;
      studentEmail: string;
      submittedAt: string;
      status: 'pending' | 'reviewed' | 'completed' | 'late' | 'ai-suspected' | 'resubmission_requested';
      files: Array<{
        id: string;
        name: string;
        url: string;
        size: string;
        type: string;
      }>;
      feedback?: string;
      grade?: number;
      aiSuspicionScore?: number;
      resubmissionRequested?: boolean;
      resubmissionDeadline?: string;
      submissionHistory: Array<{
        submittedAt: string;
        status: string;
        feedback?: string;
        grade?: number;
      }>;
    }>(`/teacher/submissions/${submissionId}`);
  }

  async reviewSubmission(submissionId: string, reviewData: {
    feedback: string;
    grade?: number;
    status: 'reviewed' | 'completed' | 'resubmission_requested';
    resubmissionDeadline?: string;
  }) {
    return this.request(`/teacher/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async requestResubmission(submissionId: string, data: {
    reason: string;
    resubmissionDeadline: string;
  }) {
    return this.request(`/teacher/submissions/${submissionId}/request-resubmission`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async publishGrades(assignmentId: string) {
    return this.request(`/teacher/assignments/${assignmentId}/publish-grades`, { method: 'POST' });
  }

  async downloadSubmission(submissionId: string) {
    return this.request(`/teacher/submissions/${submissionId}/download`, { method: 'GET' });
  }

  async downloadAllSubmissions(assignmentId: string) {
    return this.request(`/teacher/assignments/${assignmentId}/download-all`, { method: 'GET' });
  }

  // AI Review Assistant Endpoints
  async getAIAnalyses(filters?: {
    assignmentId?: string;
    type?: 'plagiarism' | 'quality' | 'completeness' | 'grading_suggestion';
    status?: 'processing' | 'completed' | 'error';
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.assignmentId) params.append('assignmentId', filters.assignmentId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    return this.request<{
      id: string;
      submissionId: string;
      studentName: string;
      assignmentTitle: string;
      submittedAt: string;
      analysisType: 'plagiarism' | 'quality' | 'completeness' | 'grading_suggestion';
      status: 'processing' | 'completed' | 'error';
      result?: {
        overallScore: number;
        plagiarismRisk: 'low' | 'medium' | 'high';
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        recommendedGrade: number;
        confidence: number;
        detailedAnalysis: string;
        keyInsights: string[];
      };
      processingTime?: number;
      error?: string;
    }[]>(`/teacher/ai-analyses?${params.toString()}`);
  }

  async getAIAnalysisDetails(analysisId: string) {
    return this.request<{
      id: string;
      submissionId: string;
      studentName: string;
      assignmentTitle: string;
      submittedAt: string;
      analysisType: 'plagiarism' | 'quality' | 'completeness' | 'grading_suggestion';
      status: 'processing' | 'completed' | 'error';
      result?: {
        overallScore: number;
        plagiarismRisk: 'low' | 'medium' | 'high';
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        recommendedGrade: number;
        confidence: number;
        detailedAnalysis: string;
        keyInsights: string[];
      };
      processingTime?: number;
      error?: string;
    }>(`/teacher/ai-analyses/${analysisId}`);
  }

  async runAIAnalysis(submissionId: string, analysisType: 'plagiarism' | 'quality' | 'completeness' | 'grading_suggestion') {
    return this.request(`/teacher/ai-analyses`, {
      method: 'POST',
      body: JSON.stringify({ submissionId, analysisType }),
    });
  }

  async getBatchAnalyses() {
    return this.request<{
      id: string;
      assignmentId: string;
      assignmentTitle: string;
      totalSubmissions: number;
      analyzedSubmissions: number;
      averageScore: number;
      plagiarismCases: number;
      status: 'pending' | 'processing' | 'completed';
      insights: string[];
    }[]>('/teacher/ai-batch-analyses');
  }

  async getGradingInsights() {
    return this.request<{
      id: string;
      type: 'pattern' | 'anomaly' | 'recommendation';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      actionable: boolean;
    }[]>('/teacher/grading-insights');
  }

  // Exam Timetable Management Endpoints
  async getTeacherExamTimetable() {
    return this.request<{
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
      instructions: string;
      resources: Array<{
        id: string;
        name: string;
        type: string;
        url: string;
      }>;
      status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
      createdBy: string;
      createdAt: string;
      aiSuggestions?: {
        workloadBalance: 'optimal' | 'heavy' | 'light';
        spacing: 'good' | 'tight' | 'overlapping';
        recommendations: string[];
      };
    }[]>('/teacher/exam-timetable');
  }

  async createExam(examData: {
    title: string;
    subject: string;
    type: 'midterm' | 'final' | 'quiz' | 'practical';
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    sections: string[];
    instructions: string;
    resources?: File[];
  }) {
    const formData = new FormData();
    Object.keys(examData).forEach(key => {
      const value = examData[key as keyof typeof examData];
      if (key === 'resources' && Array.isArray(value)) {
        value.forEach(file => formData.append('resources', file));
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else {
        formData.append(key, value as string);
      }
    });

    return this.uploadFile(formData as any, '/teacher/exams');
  }

  async updateExam(examId: string, examData: any) {
    return this.request(`/teacher/exams/${examId}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  async deleteExam(examId: string) {
    return this.request(`/teacher/exams/${examId}`, { method: 'DELETE' });
  }

  async getTeacherExamConflicts() {
    return this.request<{
      id: string;
      type: 'section_overlap' | 'teacher_overload' | 'room_conflict';
      severity: 'high' | 'medium' | 'low';
      description: string;
      affectedExams: string[];
      suggestion: string;
    }[]>('/teacher/exam-conflicts');
  }

  async getExamAnalytics(examId: string) {
    return this.request<{
      totalStudents: number;
      attendanceRate: number;
      averageScore: number;
      passRate: number;
      gradeDistribution: Array<{
        grade: string;
        count: number;
        percentage: number;
      }>;
    }>(`/teacher/exams/${examId}/analytics`);
  }

  // Student Management Endpoints
  async getTeacherStudents(filters?: {
    section?: string;
    status?: string;
    performance?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.section) params.append('section', filters.section);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.performance) params.append('performance', filters.performance);
    if (filters?.search) params.append('search', filters.search);
    
    return this.request<{
      id: string;
      name: string;
      email: string;
      phone: string;
      studentId: string;
      section: string;
      enrollmentDate: string;
      status: 'active' | 'inactive' | 'suspended';
      performance: {
        averageGrade: number;
        assignmentsSubmitted: number;
        assignmentsTotal: number;
        attendanceRate: number;
        lastActivity: string;
      };
      contactInfo: {
        parentName: string;
        parentPhone: string;
        address: string;
      };
      academicInfo: {
        semester: number;
        gpa: number;
        major: string;
      };
    }[]>(`/teacher/students?${params.toString()}`);
  }

  async getStudentDetails(studentId: string) {
    return this.request<{
      id: string;
      name: string;
      email: string;
      phone: string;
      studentId: string;
      section: string;
      enrollmentDate: string;
      status: 'active' | 'inactive' | 'suspended';
      performance: {
        averageGrade: number;
        assignmentsSubmitted: number;
        assignmentsTotal: number;
        attendanceRate: number;
        lastActivity: string;
      };
      contactInfo: {
        parentName: string;
        parentPhone: string;
        address: string;
      };
      academicInfo: {
        semester: number;
        gpa: number;
        major: string;
      };
      submissionHistory: Array<{
        assignmentTitle: string;
        submittedAt: string;
        grade: number;
        status: string;
      }>;
    }>(`/teacher/students/${studentId}`);
  }

  async getStudentPerformance(studentId: string) {
    return this.request<{
      overallTrend: 'improving' | 'declining' | 'stable';
      gradeHistory: Array<{
        assignmentTitle: string;
        grade: number;
        submittedAt: string;
      }>;
      subjectPerformance: Array<{
        subject: string;
        averageGrade: number;
        assignmentsCompleted: number;
      }>;
      attendanceTrend: Array<{
        month: string;
        rate: number;
      }>;
    }>(`/teacher/students/${studentId}/performance`);
  }

  async getTeacherSections() {
    return this.request<{
      id: string;
      name: string;
      studentCount: number;
      subject: string;
      averagePerformance: number;
    }[]>('/teacher/sections');
  }

  async getPerformanceInsights() {
    return this.request<{
      id: string;
      type: 'improvement' | 'concern' | 'achievement';
      title: string;
      description: string;
      affectedStudents: number;
      actionRequired: boolean;
    }[]>('/teacher/performance-insights');
  }

  // Teacher Profile Endpoints
  async getTeacherProfile() {
    return this.request<{
      id: string;
      name: string;
      email: string;
      phone: string;
      employeeId: string;
      department: string;
      designation: string;
      joinDate: string;
      specialization: string[];
      bio: string;
      profilePhoto?: string;
      officeLocation: string;
      officeHours: string;
      qualifications: Array<{
        degree: string;
        institution: string;
        year: string;
      }>;
      experience: string;
      subjects: string[];
      stats: {
        totalAssignments: number;
        totalStudents: number;
        averageGrade: number;
        totalExams: number;
      };
    }>('/teacher/profile');
  }

  async updateTeacherProfile(profileData: {
    name?: string;
    phone?: string;
    bio?: string;
    officeLocation?: string;
    officeHours?: string;
    specialization?: string[];
    profilePhoto?: File;
  }) {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      const value = profileData[key as keyof typeof profileData];
      if (value !== undefined) {
        if (key === 'profilePhoto' && value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, item));
        } else {
          formData.append(key, value as string);
        }
      }
    });

    return this.uploadFile(formData as any, '/teacher/profile');
  }

  async changeTeacherPassword(currentPassword: string, newPassword: string) {
    return this.request('/teacher/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Teacher Notification Endpoints
  async getTeacherNotificationStats() {
    return this.request<{
      total: number;
      unread: number;
      high: number;
      medium: number;
      low: number;
    }>('/teacher/notifications/stats');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/teacher/notifications/${notificationId}/read`, { method: 'POST' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/teacher/notifications/mark-all-read', { method: 'POST' });
  }

  async deleteTeacherNotification(notificationId: string) {
    return this.request(`/teacher/notifications/${notificationId}`, { method: 'DELETE' });
  }

  async clearReadNotifications() {
    return this.request('/teacher/notifications/clear-read', { method: 'DELETE' });
  }

  async getNotificationDetails(notificationId: string) {
    return this.request<{
      id: string;
      type: 'submission' | 'deadline' | 'feedback' | 'grade' | 'announcement' | 'ai_analysis' | 'system';
      title: string;
      message: string;
      priority: 'high' | 'medium' | 'low';
      isRead: boolean;
      createdAt: string;
      actionUrl?: string;
      actionText?: string;
      metadata?: {
        studentName?: string;
        assignmentTitle?: string;
        section?: string;
        grade?: number;
        aiScore?: number;
      };
    }>(`/teacher/notifications/${notificationId}`);
  }

  // Admin endpoints (for reference)
  async getAllUsers() {
    return this.request<Users[]>('/admin/users');
  }

  async createUser(userData: any) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: any) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async getSections() {
    return this.request<Sections[]>('/admin/sections');
  }

  async createSection(sectionData: any) {
    return this.request('/admin/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData),
    });
  }

  async assignUserToSection(userId: string, sectionId: string) {
    return this.request('/admin/sections/users', {
      method: 'POST',
      body: JSON.stringify({ userId, sectionId }),
    });
  }

  // Admin Dashboard Endpoints
  async getAdminDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getRecentUserActivity() {
    return this.request('/admin/dashboard/activity');
  }

  async getSectionOverview() {
    return this.request('/admin/dashboard/sections');
  }

  async getTeacherAllocationOverview() {
    return this.request('/admin/dashboard/teacher-allocations');
  }

  async getAssignmentStatistics() {
    return this.request('/admin/dashboard/assignment-stats');
  }

  async getPlatformHealthIndicators() {
    return this.request('/admin/dashboard/health');
  }

  // Enhanced User Management
  async getUsersByRole(role: string) {
    return this.request(`/admin/users?role=${role}`);
  }

  async getUsersBySection(sectionId: string) {
    return this.request(`/admin/users?section=${sectionId}`);
  }

  async bulkUpdateUsers(userIds: string[], updates: any) {
    return this.request('/admin/users/bulk', {
      method: 'PUT',
      body: JSON.stringify({ userIds, updates }),
    });
  }

  async getUserPermissions(userId: string) {
    return this.request(`/admin/users/${userId}/permissions`);
  }

  async updateUserPermissions(userId: string, permissions: string[]) {
    return this.request(`/admin/users/${userId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  }

  // Enhanced Section Management
  async getSectionDetails(sectionId: string) {
    return this.request(`/admin/sections/${sectionId}`);
  }

  async updateSection(sectionId: string, sectionData: any) {
    return this.request(`/admin/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData),
    });
  }

  async archiveSection(sectionId: string) {
    return this.request(`/admin/sections/${sectionId}/archive`, {
      method: 'POST',
    });
  }

  async activateSection(sectionId: string) {
    return this.request(`/admin/sections/${sectionId}/activate`, {
      method: 'POST',
    });
  }

  async deleteSection(sectionId: string) {
    return this.request(`/admin/sections/${sectionId}`, {
      method: 'DELETE',
    });
  }

  async getSectionStudents(sectionId: string) {
    return this.request(`/admin/sections/${sectionId}/students`);
  }

  async getSectionTeachers(sectionId: string) {
    return this.request(`/admin/sections/${sectionId}/teachers`);
  }

  // Teacher Assignment Management
  async getAdminTeacherAssignments() {
    return this.request('/admin/teacher-assignments');
  }

  async getTeacherAssignmentDetails(assignmentId: string) {
    return this.request(`/admin/teacher-assignments/${assignmentId}`);
  }

  async getTeacherAssignmentStats() {
    return this.request('/admin/teacher-assignments/stats');
  }

  async getTeacherWorkloadAnalysis() {
    return this.request('/admin/teacher-assignments/workload');
  }

  async reassignTeacher(assignmentId: string, newTeacherId: string) {
    return this.request(`/admin/teacher-assignments/${assignmentId}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ newTeacherId }),
    });
  }

  async getAssignmentDistributionBySubject() {
    return this.request('/admin/teacher-assignments/distribution/subject');
  }

  async getAssignmentDistributionBySection() {
    return this.request('/admin/teacher-assignments/distribution/section');
  }

  // Timetable Management
  async getAllExams() {
    return this.request('/admin/exams');
  }

  async getAdminExamConflicts() {
    return this.request('/admin/exams/conflicts');
  }

  async resolveExamConflict(conflictId: string, resolution: any) {
    return this.request(`/admin/exams/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  }

  async getTimetableAnalytics() {
    return this.request('/admin/timetable/analytics');
  }

  async getExamScheduleBySection(sectionId: string) {
    return this.request(`/admin/timetable/sections/${sectionId}`);
  }

  async getExamScheduleByTeacher(teacherId: string) {
    return this.request(`/admin/timetable/teachers/${teacherId}`);
  }

  async validateExamSchedule(examData: any) {
    return this.request('/admin/timetable/validate', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  // System Monitoring
  async getSystemHealth() {
    return this.request('/admin/monitoring/health');
  }

  async getServiceMetrics() {
    return this.request('/admin/monitoring/metrics');
  }

  async getPerformanceMetrics() {
    return this.request('/admin/monitoring/performance');
  }

  async getSystemAlerts() {
    return this.request('/admin/monitoring/alerts');
  }

  async resolveSystemAlert(alertId: string) {
    return this.request(`/admin/monitoring/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  }

  async getSystemLogs(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/monitoring/logs${queryString ? '?' + queryString : ''}`);
  }

  async getAuditLogs(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/monitoring/audit${queryString ? '?' + queryString : ''}`);
  }

  async exportMetrics() {
    return this.request('/admin/monitoring/export', {
      method: 'GET',
    });
  }

  // Admin Notifications
  async getAdminNotifications() {
    return this.request('/admin/notifications');
  }

  async getAdminNotificationStats() {
    return this.request('/admin/notifications/stats');
  }

  async markAdminNotificationAsRead(notificationId: string) {
    return this.request(`/admin/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllAdminNotificationsAsRead() {
    return this.request('/admin/notifications/read-all', {
      method: 'POST',
    });
  }

  async deleteAdminNotification(notificationId: string) {
    return this.request(`/admin/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async clearReadAdminNotifications() {
    return this.request('/admin/notifications/clear-read', {
      method: 'DELETE',
    });
  }

  async getAdminNotificationDetails(notificationId: string) {
    return this.request(`/admin/notifications/${notificationId}`);
  }

  async createAdminNotification(notificationData: any) {
    return this.request('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // Admin Settings
  async getSystemSettings() {
    return this.request('/admin/settings');
  }

  async updateSystemSettings(settings: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getSettingsByCategory(category: string) {
    return this.request(`/admin/settings/${category}`);
  }

  async updateSettingsByCategory(category: string, settings: any) {
    return this.request(`/admin/settings/${category}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async testEmailConfiguration() {
    return this.request('/admin/settings/test-email', {
      method: 'POST',
    });
  }

  async exportSystemSettings() {
    return this.request('/admin/settings/export');
  }

  async importSystemSettings(settingsData: any) {
    return this.request('/admin/settings/import', {
      method: 'POST',
      body: JSON.stringify(settingsData),
    });
  }

  async resetSystemSettings() {
    return this.request('/admin/settings/reset', {
      method: 'POST',
    });
  }

  // Admin Profile
  async getAdminProfile() {
    return this.request('/admin/profile');
  }

  async updateAdminProfile(profileData: any) {
    return this.request('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changeAdminPassword(passwordData: any) {
    return this.request('/admin/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async uploadAdminProfilePhoto(photoData: FormData) {
    return this.uploadFile(photoData as any, '/admin/profile/photo');
  }

  async getAdminPermissions() {
    return this.request('/admin/profile/permissions');
  }

  async getAdminActivity() {
    return this.request('/admin/profile/activity');
  }

  // Backup and Restore
  async createSystemBackup() {
    return this.request('/admin/backup/create', {
      method: 'POST',
    });
  }

  async getSystemBackups() {
    return this.request('/admin/backup/list');
  }

  async restoreSystemBackup(backupId: string) {
    return this.request(`/admin/backup/restore/${backupId}`, {
      method: 'POST',
    });
  }

  async deleteSystemBackup(backupId: string) {
    return this.request(`/admin/backup/${backupId}`, {
      method: 'DELETE',
    });
  }

  async scheduleBackup(backupConfig: any) {
    return this.request('/admin/backup/schedule', {
      method: 'POST',
      body: JSON.stringify(backupConfig),
    });
  }

  // System Maintenance
  async enableMaintenanceMode(message?: string) {
    return this.request('/admin/maintenance/enable', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async disableMaintenanceMode() {
    return this.request('/admin/maintenance/disable', {
      method: 'POST',
    });
  }

  async getMaintenanceStatus() {
    return this.request('/admin/maintenance/status');
  }

  // Advanced Analytics
  async getSystemAnalytics(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/analytics${queryString ? '?' + queryString : ''}`);
  }

  async getUserAnalytics(userId: string) {
    return this.request(`/admin/analytics/users/${userId}`);
  }

  async getSectionAnalytics(sectionId: string) {
    return this.request(`/admin/analytics/sections/${sectionId}`);
  }

  async getSystemUsageStats() {
    return this.request('/admin/analytics/usage');
  }

  async getPerformanceReport(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/analytics/performance${queryString ? '?' + queryString : ''}`);
  }

  // Security and Compliance
  async getSecurityLogs(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/security/logs${queryString ? '?' + queryString : ''}`);
  }

  async getFailedLoginAttempts() {
    return this.request('/admin/security/failed-logins');
  }

  async getSecurityAudit() {
    return this.request('/admin/security/audit');
  }

  async exportSecurityReport(params?: any) {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return this.request(`/admin/security/export${queryString ? '?' + queryString : ''}`);
  }

  async generateComplianceReport() {
    return this.request('/admin/security/compliance-report', {
      method: 'POST',
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Type definitions for better TypeScript support
interface Assignments {
  id: string;
  title: string;
  subject: string;
  description: string;
  instructions: string;
  guidelines: string;
  deadline: string;
  teacherId: string;
  teacherName: string;
  status: 'pending' | 'in-progress' | 'completed';
  submissionStatus?: 'not_submitted' | 'submitted' | 'graded';
  attachedFiles?: FileAttachment[];
}

interface Submissions {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subject: string;
  deadline: string;
  submittedAt: string;
  status: 'pending' | 'submitted' | 'late' | 'graded' | 'resubmitted';
  files: SubmissionFile[];
  feedback?: string;
  grade?: number;
  aiSuspicionScore?: number;
}

interface Exams {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number;
  location: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  teacherName: string;
  instructions?: string;
  personalReminder?: string;
}

interface Notifications {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'deadline' | 'feedback' | 'grade' | 'announcement';
  timestamp: string;
  read: boolean;
  assignmentId?: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
}

interface ExamSchedule {
  id: string;
  title: string;
  subject: string;
  date: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  location: string;
  duration: number;
}

interface AIResponse {
  message: string;
  suggestions?: string[];
  timestamp: string;
}

interface AIResources {
  id: string;
  title: string;
  type: 'article' | 'video' | 'tutorial' | 'documentation';
  url: string;
  description: string;
  relevanceScore: number;
}

interface Users {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  section: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastLogin: string;
}

interface Sections {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  students: Users[];
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  size: string;
}
