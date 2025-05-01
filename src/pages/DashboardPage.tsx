import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePaymentStore } from '../store/paymentStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BarChart3, PlusCircle, FileCheck, FileClock, FileX, Wallet, ArrowRight, Download } from 'lucide-react';
import PaymentTable from '../components/payments/PaymentTable';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { payments } = usePaymentStore();
  const navigate = useNavigate();
  
  const stats = useMemo(() => {
    // Filter for current user's payments if role is 'user'
    const userPayments = user?.role === 'user' 
      ? payments.filter(p => p.requestedBy.id === user.id)
      : payments;
    
    const total = userPayments.length;
    const pending = userPayments.filter(p => p.status === 'pending').length;
    const approved = userPayments.filter(p => p.status === 'approved').length;
    const rejected = userPayments.filter(p => p.status === 'rejected').length;
    const processed = userPayments.filter(p => p.status === 'processed').length;
    
    const totalAmount = userPayments.reduce((sum, p) => sum + p.paymentAmount, 0);
    const pendingAmount = userPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.paymentAmount, 0);
    
    return {
      total,
      pending,
      approved,
      rejected,
      processed,
      totalAmount,
      pendingAmount
    };
  }, [payments, user]);
  
  const recentPayments = useMemo(() => {
    if (user?.role === 'user') {
      // For users, show their own recent payments
      return payments
        .filter(p => p.requestedBy.id === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    } else if (user?.role === 'admin') {
      // For admins, show recent pending payments that need approval
      return payments
        .filter(p => p.status === 'pending')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    } else {
      // For accounts, show recently approved payments that need processing
      return payments
        .filter(p => p.status === 'approved')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    }
  }, [payments, user]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.name}!
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          {(user?.role === 'admin' || user?.role === 'accounts') && (
            <Button
              variant="outline"
              icon={<Download className="h-5 w-5" />}
              onClick={() => navigate('/export')}
            >
              Export Payments
            </Button>
          )}
          
          {user?.role === 'user' && (
            <Button
              onClick={() => navigate('/payments/new')}
              icon={<PlusCircle className="h-5 w-5" />}
            >
              New Payment Request
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Wallet className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {user?.role === 'user' ? 'Your payment requests' : 'All payment requests'}
            </div>
          </div>
        </Card>
        
        <Card className="animate-fade-in delay-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <FileClock className="h-6 w-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Total: {stats.pendingAmount.toLocaleString('en-IN', { 
                style: 'currency', 
                currency: 'INR',
                maximumFractionDigits: 0 
              })}
            </div>
          </div>
        </Card>
        
        <Card className="animate-fade-in delay-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.approved}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <FileCheck className="h-6 w-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {stats.approved > 0 ? `${(stats.approved / stats.total * 100).toFixed(0)}% approval rate` : 'No approvals yet'}
            </div>
          </div>
        </Card>
        
        <Card className="animate-fade-in delay-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Activity</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.processed + stats.rejected}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              {stats.processed} processed • {stats.rejected} rejected
            </div>
          </div>
        </Card>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.role === 'user' 
              ? 'Your Recent Requests' 
              : user?.role === 'admin'
                ? 'Pending Approvals'
                : 'Ready for Processing'}
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(user?.role === 'admin' ? '/approvals' : '/payments')}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            View All
          </Button>
        </div>
        
        <PaymentTable 
          payments={recentPayments}
          showActions={false}
        />
      </div>
    </div>
  );
};

export default DashboardPage;