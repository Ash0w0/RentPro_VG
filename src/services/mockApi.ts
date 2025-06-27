// Mock API service to simulate backend responses
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

// Mock data
const mockTenants: TenantProfile[] = [
  {
    uid: 'tenant-101',
    roomNumber: '101',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    aadhaarNumber: '1234-5678-9012',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+91 9876543211',
      relation: 'Sister'
    },
    documents: {
      aadhaar: 'https://example.com/aadhaar.pdf',
      photo: 'https://example.com/photo.jpg'
    },
    isOnboardingComplete: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    uid: 'tenant-102',
    roomNumber: '102',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+91 9876543212',
    aadhaarNumber: '2345-6789-0123',
    emergencyContact: {
      name: 'Bob Smith',
      phone: '+91 9876543213',
      relation: 'Husband'
    },
    documents: {
      aadhaar: 'https://example.com/aadhaar2.pdf',
      photo: 'https://example.com/photo2.jpg'
    },
    isOnboardingComplete: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
];

const mockRooms: Room[] = [
  {
    id: 'room-101',
    roomNumber: '101',
    floor: 1,
    type: 'single',
    rent: 8000,
    deposit: 16000,
    amenities: ['AC', 'WiFi', 'Attached Bathroom'],
    isOccupied: true,
    tenantId: 'tenant-101',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'room-102',
    roomNumber: '102',
    floor: 1,
    type: 'single',
    rent: 8500,
    deposit: 17000,
    amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Balcony'],
    isOccupied: true,
    tenantId: 'tenant-102',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'room-103',
    roomNumber: '103',
    floor: 1,
    type: 'double',
    rent: 12000,
    deposit: 24000,
    amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Balcony'],
    isOccupied: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockPayments: Payment[] = [
  {
    id: 'payment-1',
    tenantId: 'tenant-101',
    roomNumber: '101',
    amount: 8000,
    type: 'rent',
    month: '2024-01',
    status: 'verified',
    paymentMethod: 'upi',
    transactionId: 'TXN123456789',
    receiptUrl: 'https://example.com/receipt1.pdf',
    submittedAt: '2024-01-05T10:00:00Z',
    verifiedAt: '2024-01-05T11:00:00Z'
  },
  {
    id: 'payment-2',
    tenantId: 'tenant-102',
    roomNumber: '102',
    amount: 8500,
    type: 'rent',
    month: '2024-01',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN987654321',
    receiptUrl: 'https://example.com/receipt2.pdf',
    submittedAt: '2024-01-06T10:00:00Z'
  }
];

const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'service-1',
    tenantId: 'tenant-101',
    roomNumber: '101',
    type: 'maintenance',
    title: 'AC not working',
    description: 'The air conditioner in my room is not cooling properly.',
    priority: 'high',
    status: 'in-progress',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z'
  },
  {
    id: 'service-2',
    tenantId: 'tenant-102',
    roomNumber: '102',
    type: 'cleaning',
    title: 'Deep cleaning request',
    description: 'Need deep cleaning service for the room.',
    priority: 'medium',
    status: 'pending',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  }
];

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'tenant-101',
    type: 'payment',
    title: 'Payment Verified',
    message: 'Your rent payment for January 2024 has been verified.',
    read: false,
    createdAt: '2024-01-05T11:00:00Z'
  },
  {
    id: 'notif-2',
    userId: 'tenant-102',
    type: 'service',
    title: 'Service Request Update',
    message: 'Your maintenance request is now in progress.',
    read: false,
    createdAt: '2024-01-11T10:00:00Z'
  }
];

class MockApiService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication APIs
  async login(roomNumber: string, aadhaarNumber: string): Promise<ApiResponse<User>> {
    await this.delay();
    
    const tenant = mockTenants.find(t => 
      t.roomNumber === roomNumber && t.aadhaarNumber === aadhaarNumber
    );
    
    if (tenant) {
      const user: User = {
        uid: tenant.uid,
        email: tenant.email,
        role: 'tenant',
        roomNumber: tenant.roomNumber,
        isOnboardingComplete: tenant.isOnboardingComplete
      };
      
      // Store auth token
      localStorage.setItem('authToken', `mock-token-${tenant.uid}`);
      
      return {
        success: true,
        data: user
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  async loginOwner(email: string, password: string): Promise<ApiResponse<User>> {
    await this.delay();
    
    if (email === 'owner@example.com' && password === 'password') {
      const user: User = {
        uid: 'owner-1',
        email: 'owner@example.com',
        role: 'owner',
        isOnboardingComplete: true
      };
      
      localStorage.setItem('authToken', 'mock-token-owner-1');
      
      return {
        success: true,
        data: user
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    await this.delay(200);
    localStorage.removeItem('authToken');
    return { success: true };
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    await this.delay(200);
    return {
      success: true,
      data: { token: 'mock-refreshed-token' }
    };
  }

  // Tenant APIs
  async getTenantProfile(tenantId: string): Promise<ApiResponse<TenantProfile>> {
    await this.delay();
    const tenant = mockTenants.find(t => t.uid === tenantId);
    
    if (tenant) {
      return { success: true, data: tenant };
    }
    
    return { success: false, error: 'Tenant not found' };
  }

  async updateTenantProfile(tenantId: string, data: Partial<TenantProfile>): Promise<ApiResponse<TenantProfile>> {
    await this.delay();
    const tenantIndex = mockTenants.findIndex(t => t.uid === tenantId);
    
    if (tenantIndex !== -1) {
      mockTenants[tenantIndex] = { ...mockTenants[tenantIndex], ...data };
      return { success: true, data: mockTenants[tenantIndex] };
    }
    
    return { success: false, error: 'Tenant not found' };
  }

  async completeTenantOnboarding(tenantId: string, data: any): Promise<ApiResponse<TenantProfile>> {
    await this.delay();
    return this.updateTenantProfile(tenantId, { ...data, isOnboardingComplete: true });
  }

  async uploadTenantDocument(tenantId: string, file: File, type: string): Promise<ApiResponse<{ url: string }>> {
    await this.delay(1000);
    return {
      success: true,
      data: { url: `https://example.com/${type}-${tenantId}.pdf` }
    };
  }

  // Owner APIs
  async getAllTenants(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<TenantProfile>>> {
    await this.delay();
    return {
      success: true,
      data: {
        data: mockTenants,
        total: mockTenants.length,
        page,
        limit,
        hasMore: false
      }
    };
  }

  async getTenantById(tenantId: string): Promise<ApiResponse<TenantProfile>> {
    return this.getTenantProfile(tenantId);
  }

  async updateTenantByOwner(tenantId: string, data: Partial<TenantProfile>): Promise<ApiResponse<TenantProfile>> {
    return this.updateTenantProfile(tenantId, data);
  }

  async deleteTenant(tenantId: string): Promise<ApiResponse<void>> {
    await this.delay();
    const index = mockTenants.findIndex(t => t.uid === tenantId);
    if (index !== -1) {
      mockTenants.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: 'Tenant not found' };
  }

  // Room Management APIs
  async getAllRooms(): Promise<ApiResponse<Room[]>> {
    await this.delay();
    return { success: true, data: mockRooms };
  }

  async getRoomById(roomId: string): Promise<ApiResponse<Room>> {
    await this.delay();
    const room = mockRooms.find(r => r.id === roomId);
    if (room) {
      return { success: true, data: room };
    }
    return { success: false, error: 'Room not found' };
  }

  async createRoom(data: Omit<Room, 'id'>): Promise<ApiResponse<Room>> {
    await this.delay();
    const newRoom: Room = {
      ...data,
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockRooms.push(newRoom);
    return { success: true, data: newRoom };
  }

  async updateRoom(roomId: string, data: Partial<Room>): Promise<ApiResponse<Room>> {
    await this.delay();
    const roomIndex = mockRooms.findIndex(r => r.id === roomId);
    if (roomIndex !== -1) {
      mockRooms[roomIndex] = { ...mockRooms[roomIndex], ...data, updatedAt: new Date().toISOString() };
      return { success: true, data: mockRooms[roomIndex] };
    }
    return { success: false, error: 'Room not found' };
  }

  async deleteRoom(roomId: string): Promise<ApiResponse<void>> {
    await this.delay();
    const index = mockRooms.findIndex(r => r.id === roomId);
    if (index !== -1) {
      mockRooms.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: 'Room not found' };
  }

  async assignTenantToRoom(roomId: string, tenantId: string): Promise<ApiResponse<Room>> {
    await this.delay();
    return this.updateRoom(roomId, { tenantId, isOccupied: true });
  }

  async removeTenantFromRoom(roomId: string): Promise<ApiResponse<Room>> {
    await this.delay();
    return this.updateRoom(roomId, { tenantId: undefined, isOccupied: false });
  }

  // Payment APIs
  async submitPayment(data: Omit<Payment, 'id'>): Promise<ApiResponse<Payment>> {
    await this.delay();
    const newPayment: Payment = {
      ...data,
      id: `payment-${Date.now()}`,
      submittedAt: new Date().toISOString()
    };
    mockPayments.unshift(newPayment);
    return { success: true, data: newPayment };
  }

  async getTenantPayments(tenantId: string): Promise<ApiResponse<Payment[]>> {
    await this.delay();
    const payments = mockPayments.filter(p => p.tenantId === tenantId);
    return { success: true, data: payments };
  }

  async getAllPayments(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    await this.delay();
    return {
      success: true,
      data: {
        data: mockPayments,
        total: mockPayments.length,
        page,
        limit,
        hasMore: false
      }
    };
  }

  async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<ApiResponse<Payment>> {
    await this.delay();
    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
    if (paymentIndex !== -1) {
      mockPayments[paymentIndex] = { 
        ...mockPayments[paymentIndex], 
        status,
        verifiedAt: status === 'verified' ? new Date().toISOString() : undefined
      };
      return { success: true, data: mockPayments[paymentIndex] };
    }
    return { success: false, error: 'Payment not found' };
  }

  async verifyPayment(paymentId: string, verified: boolean): Promise<ApiResponse<Payment>> {
    const status = verified ? 'verified' : 'rejected';
    return this.updatePaymentStatus(paymentId, status);
  }

  // Service Request APIs
  async createServiceRequest(data: Omit<ServiceRequest, 'id'>): Promise<ApiResponse<ServiceRequest>> {
    await this.delay();
    const newRequest: ServiceRequest = {
      ...data,
      id: `service-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockServiceRequests.unshift(newRequest);
    return { success: true, data: newRequest };
  }

  async getTenantServiceRequests(tenantId: string): Promise<ApiResponse<ServiceRequest[]>> {
    await this.delay();
    const requests = mockServiceRequests.filter(sr => sr.tenantId === tenantId);
    return { success: true, data: requests };
  }

  async getAllServiceRequests(page = 1, limit = 20, filters?: any): Promise<ApiResponse<PaginatedResponse<ServiceRequest>>> {
    await this.delay();
    return {
      success: true,
      data: {
        data: mockServiceRequests,
        total: mockServiceRequests.length,
        page,
        limit,
        hasMore: false
      }
    };
  }

  async updateServiceRequestStatus(requestId: string, status: ServiceRequest['status']): Promise<ApiResponse<ServiceRequest>> {
    await this.delay();
    const requestIndex = mockServiceRequests.findIndex(sr => sr.id === requestId);
    if (requestIndex !== -1) {
      mockServiceRequests[requestIndex] = { 
        ...mockServiceRequests[requestIndex], 
        status,
        updatedAt: new Date().toISOString()
      };
      return { success: true, data: mockServiceRequests[requestIndex] };
    }
    return { success: false, error: 'Service request not found' };
  }

  async addServiceRequestNote(requestId: string, note: string): Promise<ApiResponse<ServiceRequest>> {
    await this.delay();
    const requestIndex = mockServiceRequests.findIndex(sr => sr.id === requestId);
    if (requestIndex !== -1) {
      const request = mockServiceRequests[requestIndex];
      request.notes = request.notes || [];
      request.notes.push({
        id: `note-${Date.now()}`,
        text: note,
        createdAt: new Date().toISOString(),
        createdBy: 'owner-1'
      });
      request.updatedAt = new Date().toISOString();
      return { success: true, data: request };
    }
    return { success: false, error: 'Service request not found' };
  }

  // Notification APIs
  async getNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    await this.delay();
    const notifications = mockNotifications.filter(n => n.userId === userId);
    return { success: true, data: notifications };
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    await this.delay();
    const notificationIndex = mockNotifications.findIndex(n => n.id === notificationId);
    if (notificationIndex !== -1) {
      mockNotifications[notificationIndex].read = true;
      return { success: true };
    }
    return { success: false, error: 'Notification not found' };
  }

  async markAllNotificationsAsRead(userId: string): Promise<ApiResponse<void>> {
    await this.delay();
    mockNotifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    return { success: true };
  }

  async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<ApiResponse<Notification>> {
    await this.delay();
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      read: false,
      createdAt: new Date().toISOString()
    };
    mockNotifications.unshift(newNotification);
    return { success: true, data: newNotification };
  }

  async sendBulkNotifications(data: {
    userIds: string[];
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<ApiResponse<void>> {
    await this.delay();
    data.userIds.forEach(userId => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}-${userId}`,
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        read: false,
        createdAt: new Date().toISOString()
      };
      mockNotifications.unshift(newNotification);
    });
    return { success: true };
  }

  // Analytics APIs
  async getDashboardStats(): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: true,
      data: {
        totalRooms: mockRooms.length,
        occupiedRooms: mockRooms.filter(r => r.isOccupied).length,
        totalTenants: mockTenants.length,
        pendingPayments: mockPayments.filter(p => p.status === 'pending').length,
        totalRevenue: mockPayments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0),
        pendingServiceRequests: mockServiceRequests.filter(sr => sr.status === 'pending').length
      }
    };
  }

  async getRevenueAnalytics(period: string): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: true,
      data: {
        period,
        totalRevenue: 50000,
        monthlyData: [
          { month: 'Jan', revenue: 25000 },
          { month: 'Feb', revenue: 25000 }
        ]
      }
    };
  }

  async getOccupancyAnalytics(period: string): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: true,
      data: {
        period,
        occupancyRate: 66.67,
        monthlyData: [
          { month: 'Jan', occupancy: 66.67 },
          { month: 'Feb', occupancy: 66.67 }
        ]
      }
    };
  }

  async getPaymentAnalytics(period: string): Promise<ApiResponse<any>> {
    await this.delay();
    return {
      success: true,
      data: {
        period,
        totalPayments: mockPayments.length,
        verifiedPayments: mockPayments.filter(p => p.status === 'verified').length,
        pendingPayments: mockPayments.filter(p => p.status === 'pending').length
      }
    };
  }

  async exportData(type: string, format: string = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    await this.delay(2000);
    return {
      success: true,
      data: { downloadUrl: `https://example.com/export-${type}.${format}` }
    };
  }

  // File Upload APIs
  async uploadFile(file: File, type: string, metadata?: any): Promise<ApiResponse<{ url: string; id: string }>> {
    await this.delay(1000);
    return {
      success: true,
      data: {
        url: `https://example.com/uploads/${file.name}`,
        id: `file-${Date.now()}`
      }
    };
  }

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    await this.delay();
    return { success: true };
  }

  // Real-time connection APIs (mock implementation)
  async subscribeToUpdates(userId: string, callback: (data: any) => void): Promise<() => void> {
    // Simulate real-time updates with periodic mock data
    const interval = setInterval(() => {
      // Randomly send mock updates
      if (Math.random() > 0.8) {
        const updateTypes = ['payment_submitted', 'service_request_created', 'notification'];
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        callback({
          type: randomType,
          data: { message: `Mock ${randomType} update` },
          timestamp: new Date().toISOString()
        });
      }
    }, 10000); // Send updates every 10 seconds

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  }
}

export const mockApiService = new MockApiService();