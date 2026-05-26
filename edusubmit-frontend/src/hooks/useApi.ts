import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { mockStudentProfile, mockExams, simulateApiDelay, MockExam, MockStudentProfile } from '../services/mockData';

/**
 * Custom hook for API calls with proper error handling and loading states
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface UseApiOptions {
  autoFetch?: boolean;
}

export const useApi = <T>(url: string, options: UseApiOptions = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(options.autoFetch ?? true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use mock data for development
      await simulateApiDelay(800);
      
      if (url === '/api/student/profile') {
        setData(mockStudentProfile as T);
      } else if (url === '/api/exams/upcoming') {
        setData(mockExams as T);
      } else {
        // Try real API if available
        if (!token) {
          setError('Authentication required');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8082${url}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<T> = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.message || 'Request failed');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [url, token]);

  const postData = useCallback(async <P>(body: P): Promise<T | null> => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8082${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.message || 'Request failed');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [url, token]);

  const postFormData = useCallback(async (formData: FormData): Promise<T | null> => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8082${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.message || 'Request failed');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    if (options.autoFetch) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    postData,
    postFormData,
  };
};
