import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  Users, 
  DoorOpen, 
  CreditCard, 
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import AppLayout from '../../components/layouts/AppLayout';
import PrivateRoute from '../../components/auth/PrivateRoute';

function OwnerDashboardPage() {
  const { tenants, rooms, payments, serviceRequests, loading } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  // Calculate dashboard statistics
  const stats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(room => room.isOccupied).length,
    totalTenants: tenants.length,
    activeTenants: tenants.filter(tenant => tenant.status === 'active').length,
    totalRevenue: payments.filter(p => p.status === 'verified').reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'overdue').length,
    activeServiceRequests: serviceRequests.filter(sr => sr.status === 'pending' || sr.status === 'in-progress').length,
    completedServiceRequests: serviceRequests.filter(sr => sr.status === 'completed').length,
  };

  const occupancyRate = stats.totalRooms > 0 ? (stats.occupiedRooms / stats.totalRooms) * 100 : 0;
  const collectionRate = payments.length > 0 ? (payments.filter(p => p.status === 'verified').length / payments.length) * 100 : 0;

  // Recent activities
  const recentPayments = payments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const recentServiceRequests = serviceRequests
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
      case 'active':
        return 'text-success-600 bg-success-100';
      case 'pending':
      case 'in-progress':
        return 'text-warning-600 bg-warning-100';
      case 'overdue':
      case 'rejected':
        return 'text-error-600 bg-error-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading.tenants || loading.rooms || loading.payments || loading.serviceRequests) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Overview of your property management
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              className="form-input"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-success-500 mr-1" />
                  <span className="text-sm text-success-600">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <IndianRupee size={24} className="text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-600">{stats.occupiedRooms}/{stats.totalRooms} rooms</span>
                </div>
              </div>
              <div className="p-3 bg-secondary-100 rounded-full">
                <DoorOpen size={24} className="text-secondary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTenants}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-600">of {stats.totalTenants} total</span>
                </div>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Users size={24} className="text-success-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{collectionRate.toFixed(1)}%</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-success-500 mr-1" />
                  <span className="text-sm text-success-600">+5.2%</span>
                </div>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <TrendingUp size={24} className="text-warning-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
              <CreditCard size={20} className="text-gray-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
                  {stats.pendingPayments}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="px-2 py-1 text-xs font-medium bg-error-100 text-error-800 rounded-full">
                  {stats.overduePayments}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verified</span>
                <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                  {payments.filter(p => p.status === 'verified').length}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Requests</h3>
              <HelpCircle size={20} className="text-gray-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active</span>
                <span className="px-2 py-1 text-xs font-medium bg-warning-100 text-warning-800 rounded-full">
                  {stats.activeServiceRequests}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                  {stats.completedServiceRequests}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total</span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {serviceRequests.length}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
              <AlertTriangle size={20} className="text-warning-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center p-2 bg-warning-50 rounded-lg">
                <AlertTriangle size={16} className="text-warning-600 mr-2" />
                <span className="text-sm text-warning-700">
                  {stats.overduePayments} overdue payments
                </span>
              </div>
              <div className="flex items-center p-2 bg-primary-50 rounded-lg">
                <Clock size={16} className="text-primary-600 mr-2" />
                <span className="text-sm text-primary-700">
                  {stats.pendingPayments} pending reviews
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
              <a href="/owner/payments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </a>
            </div>
            
            <div className="space-y-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <CreditCard size={16} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Room {payment.roomNumber}</p>
                        <p className="text-xs text-gray-500">{format(new Date(payment.date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent payments</p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Service Requests</h3>
              <a href="/owner/service-requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </a>
            </div>
            
            <div className="space-y-3">
              {recentServiceRequests.length > 0 ? (
                recentServiceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                        <HelpCircle size={16} className="text-secondary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Room {request.roomNumber}</p>
                        <p className="text-xs text-gray-500">{request.type} - {format(new Date(request.dateCreated), 'MMM dd')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent service requests</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function OwnerDashboard() {
  return (
    <PrivateRoute allowedRoles={['owner']}>
      <OwnerDashboardPage />
    </PrivateRoute>
  );
}