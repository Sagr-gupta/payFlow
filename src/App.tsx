import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { usePaymentStore } from './store/paymentStore';

// Layouts
import Navbar from './components/layout/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PaymentsPage from './pages/PaymentsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import ExportPage from './pages/ExportPage';
import NewPaymentPage from './pages/NewPaymentPage';
import PaymentDetailPage from './pages/PaymentDetailPage';
import SignupPage from './pages/SignupPage';

// Route protection component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [],
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
          <Route path="/payments" element={
            <ProtectedRoute>
              <PaymentsPage />
            </ProtectedRoute>
          } />
          <Route path="/payments/new" element={
            <ProtectedRoute>
              <NewPaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/payments/:id" element={
            <ProtectedRoute>
              <PaymentDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/approvals" element={
            <ProtectedRoute allowedRoles={['admin', 'accounts']}>
              <ApprovalsPage />
            </ProtectedRoute>
          } />
          <Route path="/export" element={
            <ProtectedRoute allowedRoles={['admin', 'accounts']}>
              <ExportPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { fetchPayments } = usePaymentStore();
  const { checkSession, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    checkSession();
  }, [checkSession]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [fetchPayments, isAuthenticated]);
  
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;