import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentRequest } from '../../types';
import { format } from 'date-fns';
import PaymentStatusBadge from './PaymentStatusBadge';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface PaymentTableProps {
  payments: PaymentRequest[];
  isLoading?: boolean;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onProcess?: (id: string) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  isLoading = false,
  showActions = true,
  onApprove,
  onReject,
  onProcess,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<keyof PaymentRequest>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: keyof PaymentRequest) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredPayments = payments
    .filter(payment => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.vendorName.toLowerCase().includes(searchLower) ||
        payment.itemDescription.toLowerCase().includes(searchLower) ||
        payment.billNumber.toLowerCase().includes(searchLower) ||
        payment.requestedBy.name.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'vendorName':
          comparison = a.vendorName.localeCompare(b.vendorName);
          break;
        case 'paymentAmount':
          comparison = a.paymentAmount - b.paymentAmount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleRowClick = (payment: PaymentRequest) => {
    navigate(`/payments/${payment.id}`);
  };

  const getSortIcon = (field: keyof PaymentRequest) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 text-gray-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary-600" /> 
      : <ChevronDown className="h-4 w-4 text-primary-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (filteredPayments.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? "No payments match your search criteria" 
              : "No payments have been requested yet"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            className="max-w-xs"
          />
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredPayments.length} of {payments.length} payments</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sr. No.
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('vendorName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Vendor</span>
                  {getSortIcon('vendorName')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('paymentAmount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  {getSortIcon('paymentAmount')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Requested By
              </th>
              {showActions && (
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment, index) => (
              <tr 
                key={payment.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => handleRowClick(payment)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(payment.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.vendorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.paymentAmount.toLocaleString('en-IN', { 
                    style: 'currency', 
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <PaymentStatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {payment.requestedBy.name}
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {payment.status === 'pending' && onApprove && onReject && (
                        <>
                          <Button 
                            size="xs" 
                            variant="success"
                            onClick={() => onApprove(payment.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="xs" 
                            variant="danger"
                            onClick={() => onReject(payment.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {payment.status === 'approved' && onProcess && (
                        <Button 
                          size="xs" 
                          variant="primary"
                          onClick={() => onProcess(payment.id)}
                        >
                          Process
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PaymentTable;