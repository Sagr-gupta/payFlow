import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePaymentStore } from '../store/paymentStore';
import PaymentTable from '../components/payments/PaymentTable';
import Button from '../components/ui/Button';
import { PlusCircle, Filter, X, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import { exportPaymentsToExcel } from '../utils/exportUtils';

const PaymentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { payments, filteredPayments, filterOptions, setFilterOptions } = usePaymentStore();
  const navigate = useNavigate();
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Debug logs
  console.log('User role:', user?.role);
  console.log('All payments:', payments);
  console.log('Filtered payments:', filteredPayments);
  console.log('Filter options:', filterOptions);
  
  // Get payments based on user role
  const userPayments = user?.role === 'user'
    ? payments.filter(p => p.requestedBy.id === user.id)
    : payments; // Admin and accounts see all payments
  
  const userFilteredPayments = user?.role === 'user'
    ? filteredPayments.filter(p => p.requestedBy.id === user.id)
    : filteredPayments; // Admin and accounts see all filtered payments
  
  // Debug logs for filtered results
  console.log('User payments:', userPayments);
  console.log('User filtered payments:', userFilteredPayments);
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'processed', label: 'Processed' }
  ];
  
  const handleStatusFilterChange = (status: string) => {
    const newStatusFilters = filterOptions.status.includes(status)
      ? filterOptions.status.filter(s => s !== status)
      : [...filterOptions.status, status];
    
    setFilterOptions({ status: newStatusFilters });
  };
  
  const clearFilters = () => {
    setFilterOptions({
      status: [],
      dateRange: { start: null, end: null },
      vendor: null,
      company: null
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Requests</h1>
          <p className="text-sm text-gray-500">
            {user?.role === 'user' ? 'Manage your payment requests' : 'View all payment requests'}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            icon={<Filter className="h-5 w-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {(user?.role === 'admin' || user?.role === 'accounts') && (
            <Button
              variant="outline"
              icon={<Download className="h-5 w-5" />}
              onClick={() => exportPaymentsToExcel(userFilteredPayments)}
            >
              Export to Excel
            </Button>
          )}
          
          {user?.role === 'user' && (
            <Button
              icon={<PlusCircle className="h-5 w-5" />}
              onClick={() => navigate('/payments/new')}
            >
              New Request
            </Button>
          )}
        </div>
      </div>
      
      {showFilters && (
        <Card className="mb-6 animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setShowFilters(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusFilterChange(option.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filterOptions.status.includes(option.value)
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <PaymentTable payments={userFilteredPayments} showActions={user?.role !== 'user'} />
    </div>
  );
};

export default PaymentsPage;