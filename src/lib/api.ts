import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthConfig = (token: string | null) => {
  return token 
    ? { headers: { Authorization: `Bearer ${token}` } } 
    : {};
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  confirmPassword?: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  registrationDate: string;
  subscriptions: string[];
}

export const apiClient = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/register', data);
    return response.data;
  },
  
  getProfile: async (token: string | null): Promise<UserProfile> => {
    const config = getAuthConfig(token);
    const response = await api.get<UserProfile>('/me', config);
    return response.data;
  }
}; 