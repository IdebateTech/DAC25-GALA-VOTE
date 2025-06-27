import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dreamers-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dreamers-auth-token');
      localStorage.removeItem('dreamers-user-data');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_award: boolean;
  display_order: number;
  nominees: Nominee[];
}

export interface Nominee {
  id: number;
  category_id: string;
  name: string;
  description?: string;
  photo_url?: string;
  display_order: number;
}

export interface VoteStats {
  [categoryId: string]: {
    category_title: string;
    nominees: {
      nominee_id: number;
      nominee_name: string;
      vote_count: number;
    }[];
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemStats {
  total_users: number;
  total_categories: number;
  total_nominees: number;
  total_votes: number;
  unique_voters: number;
  top_categories: Array<{
    title: string;
    vote_count: number;
  }>;
  daily_votes: Array<{
    date: string;
    count: number;
  }>;
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { username, password }),
  
  refreshToken: () =>
    api.post<ApiResponse<{ token: string }>>('/auth/refresh'),
  
  logout: () =>
    api.post<ApiResponse>('/auth/logout'),
};

// Categories API
export const categoriesApi = {
  getAll: () =>
    api.get<ApiResponse<Category[]>>('/categories'),
  
  create: (category: Omit<Category, 'nominees'>) =>
    api.post<ApiResponse<Category>>('/categories', category),
  
  update: (id: string, updates: Partial<Category>) =>
    api.put<ApiResponse>(`/categories/${id}`, updates),
  
  delete: (id: string) =>
    api.delete<ApiResponse>(`/categories/${id}`),
  
  addNominee: (categoryId: string, nominee: Omit<Nominee, 'id' | 'category_id'>) =>
    api.post<ApiResponse<Nominee>>(`/categories/${categoryId}/nominees`, nominee),
  
  updateNominee: (categoryId: string, nomineeId: number, updates: Partial<Nominee>) =>
    api.put<ApiResponse>(`/categories/${categoryId}/nominees/${nomineeId}`, updates),
  
  deleteNominee: (categoryId: string, nomineeId: number) =>
    api.delete<ApiResponse>(`/categories/${categoryId}/nominees/${nomineeId}`),
};

// Voting API
export const votingApi = {
  castVote: (sessionId: string, categoryId: string, nomineeId: number) =>
    api.post<ApiResponse>('/vote', { sessionId, categoryId, nomineeId }),
  
  getStats: () =>
    api.get<ApiResponse<VoteStats>>('/votes/stats'),
  
  getUserVotes: (sessionId: string) =>
    api.get<ApiResponse<{ [categoryId: string]: { nominee_id: number; nominee_name: string } }>>(`/votes/user/${sessionId}`),
};

// File upload API
export const fileApi = {
  uploadNomineePhoto: (file: File, nomineeId: number) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('nomineeId', nomineeId.toString());
    
    return api.post<ApiResponse<{ photo_url: string }>>('/upload/nominee-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteNomineePhoto: (filename: string) =>
    api.delete<ApiResponse>(`/upload/nominee-photo/${filename}`),
};

// Admin API
export const adminApi = {
  getUsers: () =>
    api.get<ApiResponse<User[]>>('/admin/users'),
  
  createUser: (user: { username: string; email: string; password: string; role?: string }) =>
    api.post<ApiResponse<User>>('/admin/users', user),
  
  updateUser: (id: number, updates: Partial<User>) =>
    api.put<ApiResponse>(`/admin/users/${id}`, updates),
  
  deleteUser: (id: number) =>
    api.delete<ApiResponse>(`/admin/users/${id}`),
  
  getSystemStats: () =>
    api.get<ApiResponse<SystemStats>>('/admin/system-stats'),
  
  createBackup: () =>
    api.post<ApiResponse<any>>('/admin/backup'),
};

export default api;