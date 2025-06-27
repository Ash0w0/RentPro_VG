import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Users, 
  HelpCircle,
  BarChart3,
  DoorOpen,
  ChevronLeft,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';

const OwnerSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  
  const isActive = (path: string) => {
    if (path === '/owner') {
      return router.pathname === '/owner';
    }
    return router.pathname.startsWith(path);
  };
  
  return (
    <motion.aside 
      className={`bg-white border-r border-gray-200 h-screen sticky top-0 ${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300 hidden md:block z-20`}
      animate={{ width: collapsed ? 80 : 256 }}
    >
      {/* Logo & Brand */}
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'px-6'} border-b border-gray-200`}>
        {collapsed ? (
          <Building className="text-primary-600" size={28} />
        ) : (
          <div className="flex items-center">
            <Building className="text-primary-600 mr-3" size={24} />
            <span className="text-xl font-bold text-gray-900">RentPro</span>
          </div>
        )}
      </div>
      
      {/* Navigation Links */}
      <nav className="mt-6 px-3 space-y-1">
        <Link 
          href="/owner"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/owner') && router.pathname === '/owner'
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Home size={20} />
          {!collapsed && <span className="ml-3 font-medium">Dashboard</span>}
        </Link>
        
        <Link 
          href="/owner/rooms"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/owner/rooms')
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <DoorOpen size={20} />
          {!collapsed && <span className="ml-3 font-medium">Rooms</span>}
        </Link>
        
        <Link 
          href="/owner/tenants"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/owner/tenants')
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Users size={20} />
          {!collapsed && <span className="ml-3 font-medium">Tenants</span>}
        </Link>
        
        <Link 
          href="/owner/service-requests"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/owner/service-requests')
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <HelpCircle size={20} />
          {!collapsed && <span className="ml-3 font-medium">Service Requests</span>}
        </Link>
        
        <Link 
          href="/owner/analytics"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/owner/analytics')
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BarChart3 size={20} />
          {!collapsed && <span className="ml-3 font-medium">Analytics</span>}
        </Link>
      </nav>
      
      {/* Collapse button */}
      <div className="absolute bottom-4 w-full flex justify-center">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft 
            size={20} 
            className={`text-gray-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>
    </motion.aside>
  );
};

export default OwnerSidebar;