// Admin API Service for EduSubmit Platform
// Handles all admin-specific API calls with proper authentication

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

class AdminApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:8080/api/admin';
    this.token = localStorage.getItem('edusubmit_token');
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add admin ID from user store
    const userId = localStorage.getItem('edusubmit_user_id');
    if (userId) {
      headers['X-Admin-Id'] = userId;
    }

    const userName = localStorage.getItem('edusubmit_user_name');
    if (userName) {
      headers['X-Admin-Name'] = userName;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || errorData.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  // Dashboard Endpoints
  async getDashboardStats() {
    return this.request<{
      totalStudents: number;
      totalTeachers: number;
      totalAdmins: number;
      activeUsers: number;
      inactiveUsers: number;
      suspendedUsers: number;
      systemHealth: string;
      uptime: number;
      storageUsage: { used: number; total: number; percentage: number };
      recentActivities: any[];
    }>('/dashboard/stats');
  }

  async getUserStatistics() {
    return this.request<{
      totalUsers: number;
      totalStudents: number;
      totalTeachers: number;
      totalAdmins: number;
      activeUsers: number;
      inactiveUsers: number;
      suspendedUsers: number;
    }>('/dashboard/user-stats');
  }

  async getSystemHealth() {
    return this.request<{
      uptime: number;
      totalMemory: number;
      usedMemory: number;
      freeMemory: number;
      availableProcessors: number;
      systemLoadAverage: number;
      apiStatus: string;
      databaseStatus: string;
      redisStatus: string;
      storageUsage: { used: number; total: number; percentage: number };
    }>('/system/health');
  }

  // User Management Endpoints
  async getAllUsers(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    return this.request<PaginatedResponse<any>>(
      `/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async searchUsers(keyword: string) {
    return this.request<any[]>(`/users/search?keyword=${encodeURIComponent(keyword)}`);
  }

  async getUsersByRole(role: 'STUDENT' | 'TEACHER' | 'ADMIN') {
    return this.request<any[]>(`/users/role/${role}`);
  }

  async getUsersByStatus(status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
    return this.request<any[]>(`/users/status/${status}`);
  }

  async createUser(userData: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
    return this.request<any>(`/users/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  async updateUserRole(id: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN') {
    return this.request<any>(`/users/${id}/role?role=${role}`, {
      method: 'PATCH',
    });
  }

  async resetUserPassword(id: string, newPassword: string) {
    return this.request<{ message: string }>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  // Activity Logs Endpoints
  async getAllActivityLogs(page = 0, size = 20, sortBy = 'createdAt', sortDir = 'desc') {
    return this.request<PaginatedResponse<any>>(
      `/activity-logs?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  async getRecentActivityLogs(limit = 10) {
    return this.request<any[]>(`/activity-logs/recent?limit=${limit}`);
  }

  async getActivityLogsByUserId(userId: string) {
    return this.request<any[]>(`/activity-logs/user/${userId}`);
  }

  async getActivityLogsByEntity(entityType: string, entityId: string) {
    return this.request<any[]>(`/activity-logs/entity/${entityType}/${entityId}`);
  }

  async getActivityLogsByDateRange(startDate: string, endDate: string) {
    return this.request<any[]>(
      `/activity-logs/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
  }

  async searchActivityLogs(keyword: string) {
    return this.request<any[]>(`/activity-logs/search?keyword=${encodeURIComponent(keyword)}`);
  }

  async getActivityLogsBySeverity(severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL') {
    return this.request<any[]>(`/activity-logs/severity/${severity}`);
  }

  // Department Management Endpoints
  async getAllDepartments(page = 0, size = 10, sortBy = 'name', sortDir = 'asc') {
    return this.request<PaginatedResponse<any>>(
      `/departments?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  async getDepartmentById(id: string) {
    return this.request<any>(`/departments/${id}`);
  }

  async getDepartmentByCode(code: string) {
    return this.request<any>(`/departments/code/${code}`);
  }

  async getDepartmentsByStatus(status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
    return this.request<any[]>(`/departments/status/${status}`);
  }

  async searchDepartments(keyword: string) {
    return this.request<any[]>(`/departments/search?keyword=${encodeURIComponent(keyword)}`);
  }

  async createDepartment(departmentData: any) {
    return this.request<any>('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  }

  async updateDepartment(id: string, departmentData: any) {
    return this.request<any>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData),
    });
  }

  async deleteDepartment(id: string) {
    return this.request<{ message: string }>(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // Announcement Management Endpoints
  async getAllAnnouncements(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    return this.request<PaginatedResponse<any>>(
      `/announcements?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  async getActiveAnnouncements() {
    return this.request<any[]>('/announcements/active');
  }

  async getAnnouncementById(id: string) {
    return this.request<any>(`/announcements/${id}`);
  }

  async getAnnouncementsByType(type: 'GENERAL' | 'URGENT' | 'MAINTENANCE' | 'FEATURE' | 'SECURITY') {
    return this.request<any[]>(`/announcements/type/${type}`);
  }

  async getAnnouncementsByPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    return this.request<any[]>(`/announcements/priority/${priority}`);
  }

  async searchAnnouncements(keyword: string) {
    return this.request<any[]>(`/announcements/search?keyword=${encodeURIComponent(keyword)}`);
  }

  async createAnnouncement(announcementData: any) {
    return this.request<any>('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  }

  async updateAnnouncement(id: string, announcementData: any) {
    return this.request<any>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  }

  async deleteAnnouncement(id: string) {
    return this.request<{ message: string }>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleAnnouncementStatus(id: string) {
    return this.request<any>(`/announcements/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Plagiarism Report Endpoints
  async getAllPlagiarismReports(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    return this.request<PaginatedResponse<any>>(
      `/plagiarism-reports?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
  }

  async getPlagiarismReportById(id: string) {
    return this.request<any>(`/plagiarism-reports/${id}`);
  }

  async getReportsByStatus(status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED' | 'CONFIRMED') {
    return this.request<any[]>(`/plagiarism-reports/status/${status}`);
  }

  async getReportsBySeverity(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    return this.request<any[]>(`/plagiarism-reports/severity/${severity}`);
  }

  async getReportsByStudent(studentId: string) {
    return this.request<any[]>(`/plagiarism-reports/student/${studentId}`);
  }

  async getReportsByAssignment(assignmentId: string) {
    return this.request<any[]>(`/plagiarism-reports/assignment/${assignmentId}`);
  }

  async getHighSimilarityReports(threshold = 70.0) {
    return this.request<any[]>(`/plagiarism-reports/high-similarity?threshold=${threshold}`);
  }

  async searchReportsByStudent(keyword: string) {
    return this.request<any[]>(`/plagiarism-reports/search?keyword=${encodeURIComponent(keyword)}`);
  }

  async createPlagiarismReport(reportData: any) {
    return this.request<any>('/plagiarism-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async reviewReport(id: string, reviewData: { status: string; reviewNotes: string }) {
    return this.request<any>(`/plagiarism-reports/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReport(id: string) {
    return this.request<{ message: string }>(`/plagiarism-reports/${id}`, {
      method: 'DELETE',
    });
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;
