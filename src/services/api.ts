// Centralized API service for backend communication
import { APP_CONFIG, ERROR_MESSAGES } from '../config/constants';
import { logger } from '../utils/logger';
import { mockApiService } from './mockApi';
import { 
  User, 
  TenantProfile, 
  Room, 
  Payment, 
  ServiceRequest, 
  Notification 
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private useMockApi: boolean;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
    this.timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000');
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    // Use mock API if no backend is available or in development mode
    this.useMockApi = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Use mock API if configured
    if (this.useMockApi) {
      logger.debug('Using mock API service');
      return this.delegateToMockApi(endpoint, options);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      logger.debug(`API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug(`API Response: ${url}`, data);
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error(`API Error: ${url}`, error);
      
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.network);
      }
      
      // Fallback to mock API if real API fails
      logger.warn('Real API failed, falling back to mock API');
      this.useMockApi = true;
      return this.delegateToMockApi(endpoint, options);
    }
  }

  private async delegateToMockApi<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : undefined;

    // Route to appropriate mock API method based on endpoint and method
    try {
      if (endpoint === '/auth/tenant/login' && method === 'POST') {
        return await mockApiService.login(body.roomNumber, body.aadhaarNumber) as ApiResponse<T>;
      }
      
      if (endpoint === '/auth/owner/login' && method === 'POST') {
        return await mockApiService.loginOwner(body.email, body.password) as ApiResponse<T>;
      }
      
      if (endpoint === '/auth/logout' && method === 'POST') {
        return await mockApiService.logout() as ApiResponse<T>;
      }
      
      if (endpoint === '/auth/refresh' && method === 'POST') {
        return await mockApiService.refreshToken() as ApiResponse<T>;
      }
      
      if (endpoint.startsWith('/tenants/') && endpoint.endsWith('/notifications')) {
        const tenantId = endpoint.split('/')[2];
        return await mockApiService.getNotifications(tenantId) as ApiResponse<T>;
      }
      
      if (endpoint.startsWith('/tenants/') && !endpoint.includes('/')) {
        const tenantId = endpoint.split('/')[2];
        if (method === 'GET') {
          return await mockApiService.getTenantProfile(tenantId) as ApiResponse<T>;
        }
        if (method === 'PUT') {
          return await mockApiService.updateTenantProfile(tenantId, body) as ApiResponse<T>;
        }
      }
      
      if (endpoint.startsWith('/tenants/') && endpoint.endsWith('/payments')) {
        const tenantId = endpoint.split('/')[2];
        return await mockApiService.getTenantPayments(tenantId) as ApiResponse<T>;
      }
      
      if (endpoint.startsWith('/tenants/') && endpoint.endsWith('/service-requests')) {
        const tenantId = endpoint.split('/')[2];
        return await mockApiService.getTenantServiceRequests(tenantId) as ApiResponse<T>;
      }
      
      if (endpoint === '/owner/tenants' && method === 'GET') {
        return await mockApiService.getAllTenants() as ApiResponse<T>;
      }
      
      if (endpoint === '/owner/rooms' && method === 'GET') {
        return await mockApiService.getAllRooms() as ApiResponse<T>;
      }
      
      if (endpoint === '/owner/payments' && method === 'GET') {
        return await mockApiService.getAllPayments() as ApiResponse<T>;
      }
      
      if (endpoint === '/owner/service-requests' && method === 'GET') {
        return await mockApiService.getAllServiceRequests() as ApiResponse<T>;
      }
      
      if (endpoint === '/payments' && method === 'POST') {
        return await mockApiService.submitPayment(body) as ApiResponse<T>;
      }
      
      if (endpoint === '/service-requests' && method === 'POST') {
        return await mockApiService.createServiceRequest(body) as ApiResponse<T>;
      }
      
      // Default fallback
      logger.warn(`No mock implementation for ${method} ${endpoint}`);
      return {
        success: true,
        data: [] as any
      } as ApiResponse<T>;
      
    } catch (error) {
      logger.error('Mock API error', error);
      return {
        success: false,
        error: 'Mock API error'
      } as ApiResponse<T>;
    }
  }

  private async retryRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.request<T>(endpoint, options);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retryAttempts) {
          logger.warn(`API retry attempt ${attempt} failed, retrying...`, error);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw lastError!;
  }

  // Authentication APIs
  async login(roomNumber: string, aadhaarNumber: string): Promise<ApiResponse<User>> {
    return this.retryRequest('/auth/tenant/login', {
      method: 'POST',
      body: JSON.stringify({ roomNumber, aadhaarNumber }),
    });
  }

  async loginOwner(email: string, password: string): Promise<ApiResponse<User>> {
    return this.retryRequest('/auth/owner/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.retryRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.retryRequest('/auth/refresh', {
      method: 'POST',
    });
  }

  // Tenant APIs
  async getTenantProfile(tenantId: string): Promise<ApiResponse<TenantProfile>> {
    return this.retryRequest(`/tenants/${tenantId}`);
  }

  async updateTenantProfile(tenantId: string, data: Partial<TenantProfile>): Promise<ApiResponse<TenantProfile>> {
    return this.retryRequest(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeTenantOnboarding(tenantId: string, data: any): Promise<ApiResponse<TenantProfile>> {
    return this.retryRequest(`/tenants/${tenantId}/onboarding`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadTenantDocument(tenantId: string, file: File, type: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.retryRequest(`/tenants/${tenantId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Owner APIs - Full access to all data
  async getAllTenants(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<TenantProfile>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    return this.retryRequest(`/owner/tenants?${params}`);
  }

  async getTenantById(tenantId: string): Promise<ApiResponse<TenantProfile>> {
    return this.retryRequest(`/owner/tenants/${tenantId}`);
  }

  async updateTenantByOwner(tenantId: string, data: Partial<TenantProfile>): Promise<ApiResponse<TenantProfile>> {
    return this.retryRequest(`/owner/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTenant(tenantId: string): Promise<ApiResponse<void>> {
    return this.retryRequest(`/owner/tenants/${tenantId}`, {
      method: 'DELETE',
    });
  }

  // Room Management APIs
  async getAllRooms(): Promise<ApiResponse<Room[]>> {
    return this.retryRequest('/owner/rooms');
  }

  async getRoomById(roomId: string): Promise<ApiResponse<Room>> {
    return this.retryRequest(`/owner/rooms/${roomId}`);
  }

  async createRoom(data: Omit<Room, 'id'>): Promise<ApiResponse<Room>> {
    return this.retryRequest('/owner/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoom(roomId: string, data: Partial<Room>): Promise<ApiResponse<Room>> {
    return this.retryRequest(`/owner/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(roomId: string): Promise<ApiResponse<void>> {
    return this.retryRequest(`/owner/rooms/${roomId}`, {
      method: 'DELETE',
    });
  }

  async assignTenantToRoom(roomId: string, tenantId: string): Promise<ApiResponse<Room>> {
    return this.retryRequest(`/owner/rooms/${roomId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
    });
  }

  async removeTenantFromRoom(roomId: string): Promise<ApiResponse<Room>> {
    return this.retryRequest(`/owner/rooms/${roomId}/remove-tenant`, {
      method: 'POST',
    });
  }

  // Payment APIs
  async submitPayment(data: Omit<Payment, 'id'>): Promise<ApiResponse<Payment>> {
    return this.retryRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTenantPayments(tenantId: string): Promise<ApiResponse<Payment[]>> {
    return this.retryRequest(`/tenants/${tenantId}/payments`);
  }

  async getAllPayments(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    return this.retryRequest(`/owner/payments?${params}`);
  }

  async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<ApiResponse<Payment>> {
    return this.retryRequest(`/owner/payments/${paymentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async verifyPayment(paymentId: string, verified: boolean): Promise<ApiResponse<Payment>> {
    return this.retryRequest(`/owner/payments/${paymentId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verified }),
    });
  }

  // Service Request APIs
  async createServiceRequest(data: Omit<ServiceRequest, 'id'>): Promise<ApiResponse<ServiceRequest>> {
    return this.retryRequest('/service-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTenantServiceRequests(tenantId: string): Promise<ApiResponse<ServiceRequest[]>> {
    return this.retryRequest(`/tenants/${tenantId}/service-requests`);
  }

  async getAllServiceRequests(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<ServiceRequest>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    
    return this.retryRequest(`/owner/service-requests?${params}`);
  }

  async updateServiceRequestStatus(requestId: string, status: ServiceRequest['status']): Promise<ApiResponse<ServiceRequest>> {
    return this.retryRequest(`/owner/service-requests/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async addServiceRequestNote(requestId: string, note: string): Promise<ApiResponse<ServiceRequest>> {
    return this.retryRequest(`/owner/service-requests/${requestId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  // Notification APIs
  async getNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    return this.retryRequest(`/users/${userId}/notifications`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.retryRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<ApiResponse<void>> {
    return this.retryRequest(`/users/${userId}/notifications/read-all`, {
      method: 'PUT',
    });
  }

  async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<ApiResponse<Notification>> {
    return this.retryRequest('/owner/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendBulkNotifications(data: {
    userIds: string[];
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<ApiResponse<void>> {
    return this.retryRequest('/owner/notifications/send-bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics APIs
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.retryRequest('/owner/analytics/dashboard');
  }

  async getRevenueAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.retryRequest(`/owner/analytics/revenue?period=${period}`);
  }

  async getOccupancyAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.retryRequest(`/owner/analytics/occupancy?period=${period}`);
  }

  async getPaymentAnalytics(period: string): Promise<ApiResponse<any>> {
    return this.retryRequest(`/owner/analytics/payments?period=${period}`);
  }

  async exportData(type: string, format: string = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.retryRequest(`/owner/export/${type}?format=${format}`, {
      method: 'POST',
    });
  }

  // File Upload APIs
  async uploadFile(file: File, type: string, metadata?: any): Promise<ApiResponse<{ url: string; id: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return this.retryRequest('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    return this.retryRequest(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Real-time connection APIs
  async subscribeToUpdates(userId: string, callback: (data: any) => void): Promise<() => void> {
    if (this.useMockApi) {
      return mockApiService.subscribeToUpdates(userId, callback);
    }

    // WebSocket connection for real-time updates
    const wsUrl = this.baseUrl.replace('http', 'ws') + `/ws/${userId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      logger.info('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        logger.error('WebSocket message parse error', error);
      }
    };

    ws.onerror = (error) => {
      logger.error('WebSocket error', error);
    };

    ws.onclose = () => {
      logger.info('WebSocket disconnected');
    };

    // Return cleanup function
    return () => {
      ws.close();
    };
  }
}

export const apiService = new ApiService();
export default apiService;