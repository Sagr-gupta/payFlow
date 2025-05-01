import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkSession } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      await checkSession();
      navigate('/dashboard');
    };

    handleAuthCallback();
  }, [checkSession, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback; 