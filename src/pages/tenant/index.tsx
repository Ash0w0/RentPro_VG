import TenantDashboardPage from '../../components/pages/TenantDashboardPage';
import AppLayout from '../../components/layouts/AppLayout';
import PrivateRoute from '../../components/auth/PrivateRoute';

export default function TenantDashboard() {
  return (
    <PrivateRoute allowedRoles={['tenant']}>
      <AppLayout>
        <TenantDashboardPage />
      </AppLayout>
    </PrivateRoute>
  );
}