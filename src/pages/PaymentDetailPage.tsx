import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePaymentStore } from '../store/paymentStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, FileCheck, FileX, Download, Image } from 'lucide-react';
import PaymentStatusBadge from '../components/payments/PaymentStatusBadge';
import { format } from 'date-fns';
import PaymentComments from '../components/payments/PaymentComments';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    payments, 
    approvePayment, 
    rejectPayment,
    markAsProcessed
  } = usePaymentStore();
  
  const payment = useMemo(() => {
    return payments.find(p => p.id === id);
  }, [payments, id]);
  
  if (!payment) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-6">
            <h1 className="text-xl font-medium text-gray-900 mb-2">Payment not found</h1>
            <p className="text-gray-500 mb-4">The requested payment could not be found.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/payments')}
              icon={<ArrowLeft className="h-5 w-5" />}
            >
              Back to Payments
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  const handleApprove = async () => {
    if (!user) return;
    await approvePayment(payment.id, user);
  };
  
  const handleReject = async () => {
    if (!user) return;
    await rejectPayment(payment.id, user);
  };
  
  const handleProcess = async () => {
    await markAsProcessed(payment.id);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="h-5 w-5" />}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 ml-2">
          Payment Details
        </h1>
      </div>
      
      <Card className="animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {payment.vendorName}
              </h2>
              <div className="ml-3">
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Bill #{payment.billNumber} • {format(new Date(payment.date), 'dd MMM yyyy')}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {payment.paymentAmount.toLocaleString('en-IN', { 
                style: 'currency', 
                currency: 'INR',
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-sm text-gray-500">
              {payment.companyName}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Outstanding:</span>
                <span className="text-sm font-medium">
                  {payment.totalOutstanding.toLocaleString('en-IN', { 
                    style: 'currency', 
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Advance/TDS:</span>
                <span className="text-sm font-medium">
                  {payment.advanceTds.toLocaleString('en-IN', { 
                    style: 'currency', 
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Payment Amount:</span>
                <span className="text-sm font-medium">
                  {payment.paymentAmount.toLocaleString('en-IN', { 
                    style: 'currency', 
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-1">
                <span className="text-sm text-gray-500">Balance Amount:</span>
                <span className="text-sm font-medium">
                  {payment.balanceAmount.toLocaleString('en-IN', { 
                    style: 'currency', 
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bill Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Bill Number:</span>
                <span className="text-sm font-medium">{payment.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Bill Date:</span>
                <span className="text-sm font-medium">
                  {format(new Date(payment.billDate), 'dd MMM yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Item Description:</span>
                <span className="text-sm font-medium">{payment.itemDescription}</span>
              </div>
            </div>

            {payment.billImage && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Bill Image</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <a 
                    href={payment.billImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors duration-150">
                      <Image className="h-8 w-8 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">View Bill Image</span>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Requested By</h3>
              <p className="text-sm mt-1">{payment.requestedBy.name}</p>
              <p className="text-xs text-gray-500">{payment.requestedBy.email}</p>
            </div>
            
            {payment.approvedBy && (
              <div className="text-right">
                <h3 className="text-sm font-medium text-gray-500">Approved By</h3>
                <p className="text-sm mt-1">{payment.approvedBy.name}</p>
                <p className="text-xs text-gray-500">{payment.approvedBy.email}</p>
              </div>
            )}
          </div>
          
          {/* Admin actions */}
          {user?.role === 'admin' && payment.status === 'pending' && (
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                icon={<FileX className="h-5 w-5" />}
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button
                variant="success"
                icon={<FileCheck className="h-5 w-5" />}
                onClick={handleApprove}
              >
                Approve
              </Button>
            </div>
          )}
          
          {/* Accounts actions */}
          {user?.role === 'accounts' && payment.status === 'approved' && (
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="primary"
                icon={<Download className="h-5 w-5" />}
                onClick={handleProcess}
              >
                Mark as Processed
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {user && (
        <PaymentComments
          paymentId={payment.id}
          comments={payment.comments}
          currentUser={user}
          isAdmin={user.role === 'admin'}
        />
      )}
    </div>
  );
};

export default PaymentDetailPage;