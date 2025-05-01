import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePaymentStore } from '../store/paymentStore';
import PaymentTable from '../components/payments/PaymentTable';
import { Filter, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ApprovalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    payments, 
    filteredPayments, 
    filterOptions, 
    setFilterOptions, 
    approvePayment, 
    rejectPayment,
    markAsProcessed 
  } = usePaymentStore();
  
  const [showFilters, setShowFilters] = useState(false);
  
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
  
  const handleApprove = async (id: string) => {
    if (!user) return;
    await approvePayment(id, user);
  };
  
  const handleReject = async (id: string) => {
    if (!user) return;
    await rejectPayment(id, user);
  };
  
  const handleProcess = async (id: string) => {
    await markAsProcessed(id);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Approvals</h1>
          <p className="text-sm text-gray-500">
            {user?.role === 'admin' 
              ? 'Review and approve payment requests' 
              : 'Process approved payments'}
          </p>
        </div>
        
        <Button
          variant="outline"
          icon={<Filter className="h-5 w-5" />}
          onClick={() => setShowFilters(!showFilters)}
          className="mt-4 md:mt-0"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
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
      
      <PaymentTable 
        payments={filteredPayments}
        onApprove={user?.role === 'admin' ? handleApprove : undefined}
        onReject={user?.role === 'admin' ? handleReject : undefined}
        onProcess={user?.role === 'accounts' ? handleProcess : undefined}
      />
    </div>
  );
};

export default ApprovalsPage;