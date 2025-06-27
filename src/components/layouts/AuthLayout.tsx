import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect if auth state is fully initialized and user is authenticated
    if (initialized && !loading && user) {
      const redirectPath = user.role === 'tenant' ? '/tenant' : '/owner';
      router.replace(redirectPath);
    }
  }, [initialized, user, loading, router]);
  
  // Don't render anything until auth state is initialized or if user is authenticated
  if (!initialized || loading || user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-primary-600 text-white text-center">
            <div className="flex justify-center mb-3">
              <Building size={40} />
            </div>
            <h1 className="text-2xl font-bold">RentPro</h1>
            <p className="text-primary-100 mt-1">Property Management Simplified</p>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}