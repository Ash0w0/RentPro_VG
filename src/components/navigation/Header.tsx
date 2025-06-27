import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, NotificationPanel } from '../../contexts/NotificationContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Menu, 
  Bell, 
  LogOut, 
  User, 
  Settings, 
  ChevronDown,
  HelpCircle,
  CreditCard,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    // Navigate to profile page based on user role
    if (user?.role === 'tenant') {
      router.push('/tenant/profile');
    } else {
      router.push('/owner/profile');
    }
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    // Navigate to settings page based on user role
    if (user?.role === 'tenant') {
      router.push('/tenant/settings');
    } else {
      router.push('/owner/settings');
    }
  };
  
  return (
    <>
      <header className="bg-white border-b border-gray-200 z-10 relative">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu size={24} />
          </button>
          
          {/* Page title - could be dynamic based on current route */}
          <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
            {user?.role === 'tenant' ? 'Tenant Dashboard' : 'Owner Dashboard'}
          </h1>
          
          {/* Right section with notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User menu */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                  {user?.displayName?.[0] || user?.role?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user?.displayName || (user?.role === 'tenant' ? `Room ${user?.roomNumber}` : 'Owner')}
                </span>
                <ChevronDown size={16} className="text-gray-500 hidden md:block" />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.role === 'tenant' ? `Room ${user?.roomNumber}` : 'Property Owner'}
                      </p>
                    </div>
                    <button 
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </button>
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div 
              className="md:hidden bg-white border-b border-gray-200"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="px-4 py-3 space-y-1">
                {user?.role === 'tenant' ? (
                  <>
                    <Link href="/tenant" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <User size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <Link href="/tenant/service-request" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <HelpCircle size={16} className="mr-2" />
                      Service Requests
                    </Link>
                    <Link href="/tenant/payment-history" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <CreditCard size={16} className="mr-2" />
                      Payment History
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/owner" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <User size={16} className="mr-2" />
                      Dashboard
                    </Link>
                    <Link href="/owner/rooms" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Rooms
                    </Link>
                    <Link href="/owner/tenants" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <User size={16} className="mr-2" />
                      Tenants
                    </Link>
                    <Link href="/owner/service-requests" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <HelpCircle size={16} className="mr-2" />
                      Service Requests
                    </Link>
                    <Link href="/owner/analytics" className="block py-2 px-3 rounded-md hover:bg-gray-100 flex items-center">
                      <FileText size={16} className="mr-2" />
                      Analytics
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Header;