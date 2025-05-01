import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Wallet, Mail, Lock } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  
  const { login, resendConfirmationEmail } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setShowResendButton(true);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('confirm your account')) {
        setShowResendButton(true);
      }
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await resendConfirmationEmail(email);
      
      if (success) {
        setError('Confirmation email has been resent. Please check your inbox.');
        setShowResendButton(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation email.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Wallet className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to PayFlow
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Payment approval management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <Input
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Input
                label="Password"
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                placeholder="Enter your password"
              />
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>

            {showResendButton && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendConfirmation}
                  isLoading={isLoading}
                >
                  Resend confirmation email
                </Button>
              </div>
            )}
            
            <div className="text-sm text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  className="text-primary-600 hover:text-primary-500"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;