import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  FileText, 
  Clock, 
  HelpCircle, 
  CreditCard,
  ChevronLeft,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';

const TenantSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  
  const isActive = (path: string) => {
    if (path === '/tenant') {
      return router.pathname === '/tenant';
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
          href="/tenant"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/tenant') && router.pathname === '/tenant'
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Home size={20} />
          {!collapsed && <span className="ml-3 font-medium">Dashboard</span>}
        </Link>
        
        <Link 
          href="/tenant/service-request"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/tenant/service-request')
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <HelpCircle size={20} />
          {!collapsed && <span className="ml-3 font-medium">Service Requests</span>}
        </Link>
        
        <Link 
          href="/tenant/payment-history"
          className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg ${
            isActive('/tenant/payment-history')
              ? 'bg-primary-50 text-primary-600' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <CreditCard size={20} />
          {!collapsed && <span className="ml-3 font-medium">Payment History</span>}
        </Link>
        
        {/* Example of a disabled link */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-4'} py-3 rounded-lg text-gray-400 cursor-not-allowed`}>
          <FileText size={20} />
          {!collapsed && <span className="ml-3 font-medium">Documents</span>}
        </div>
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

export default TenantSidebar;