import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PaymentRequestForm from '../components/payments/PaymentRequestForm';

const NewPaymentPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if user is not a regular user
  React.useEffect(() => {
    if (user?.role !== 'user') {
      navigate('/payments');
    }
  }, [user, navigate]);

  if (user?.role !== 'user') {
    return null;
  }

  return <PaymentRequestForm />;
};

export default NewPaymentPage;