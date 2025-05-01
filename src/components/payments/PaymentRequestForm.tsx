import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePaymentStore } from '../../store/paymentStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { format } from 'date-fns';
import { Upload } from 'lucide-react';

const PaymentRequestForm: React.FC = () => {
  const { user } = useAuthStore();
  const { addPayment } = usePaymentStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    vendorName: '',
    totalOutstanding: '',
    advanceTds: '',
    paymentAmount: '',
    itemDescription: '',
    billNumber: '',
    billDate: format(new Date(), 'yyyy-MM-dd'),
    companyName: user?.company || '',
  });
  
  const [billImage, setBillImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }
    
    if (!formData.totalOutstanding.trim()) {
      newErrors.totalOutstanding = 'Total outstanding amount is required';
    } else if (isNaN(Number(formData.totalOutstanding))) {
      newErrors.totalOutstanding = 'Must be a valid number';
    }
    
    if (!formData.advanceTds.trim()) {
      newErrors.advanceTds = 'Advance/TDS is required';
    } else if (isNaN(Number(formData.advanceTds))) {
      newErrors.advanceTds = 'Must be a valid number';
    }
    
    if (!formData.paymentAmount.trim()) {
      newErrors.paymentAmount = 'Payment amount is required';
    } else if (isNaN(Number(formData.paymentAmount))) {
      newErrors.paymentAmount = 'Must be a valid number';
    }
    
    if (!formData.itemDescription.trim()) {
      newErrors.itemDescription = 'Item description is required';
    }
    
    if (!formData.billNumber.trim()) {
      newErrors.billNumber = 'Bill number is required';
    }
    
    if (!formData.billDate.trim()) {
      newErrors.billDate = 'Bill date is required';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!billImage) {
      newErrors.billImage = 'Bill image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-calculate the balance amount when related fields change
    if (['totalOutstanding', 'advanceTds', 'paymentAmount'].includes(name)) {
      const totalOutstanding = name === 'totalOutstanding' ? Number(value) : Number(formData.totalOutstanding);
      const advanceTds = name === 'advanceTds' ? Number(value) : Number(formData.advanceTds);
      const paymentAmount = name === 'paymentAmount' ? Number(value) : Number(formData.paymentAmount);
      
      // Only update if we have valid numbers
      if (!isNaN(totalOutstanding) && !isNaN(advanceTds) && !isNaN(paymentAmount)) {
        // Balance = Total - Advance - Payment
        const balanceAmount = totalOutstanding - advanceTds - paymentAmount;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillImage(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const totalOutstanding = Number(formData.totalOutstanding);
      const advanceTds = Number(formData.advanceTds);
      const paymentAmount = Number(formData.paymentAmount);
      const balanceAmount = totalOutstanding - advanceTds - paymentAmount;
      
      await addPayment({
        date: new Date().toISOString(),
        vendorName: formData.vendorName,
        totalOutstanding,
        advanceTds,
        paymentAmount,
        balanceAmount,
        itemDescription: formData.itemDescription,
        billNumber: formData.billNumber,
        billDate: new Date(formData.billDate).toISOString(),
        requestedBy: user,
        companyName: formData.companyName,
        billImage: billImage!,
      });
      
      setIsSuccess(true);
      
      // Reset form after 2 seconds and redirect
      setTimeout(() => {
        navigate('/payments');
      }, 2000);
    } catch (error) {
      console.error('Error submitting payment request:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto my-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
            <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Payment request submitted!</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your payment request has been submitted successfully and is pending approval.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => navigate('/payments')}
              variant="primary"
            >
              View Your Payments
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto my-8 animate-fade-in">
      <Card title="Submit Payment Request">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Vendor Name"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              error={errors.vendorName}
              fullWidth
              required
            />
            
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              error={errors.companyName}
              fullWidth
              required
            />
            
            <Input
              label="Total Outstanding Amount"
              name="totalOutstanding"
              type="number"
              min="0"
              step="0.01"
              value={formData.totalOutstanding}
              onChange={handleChange}
              error={errors.totalOutstanding}
              fullWidth
              required
            />
            
            <Input
              label="Advance/TDS"
              name="advanceTds"
              type="number"
              min="0"
              step="0.01"
              value={formData.advanceTds}
              onChange={handleChange}
              error={errors.advanceTds}
              fullWidth
              required
            />
            
            <Input
              label="Payment Amount"
              name="paymentAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.paymentAmount}
              onChange={handleChange}
              error={errors.paymentAmount}
              fullWidth
              required
            />
            
            <Input
              label="Balance Amount"
              type="number"
              value={
                !isNaN(Number(formData.totalOutstanding)) && 
                !isNaN(Number(formData.advanceTds)) && 
                !isNaN(Number(formData.paymentAmount))
                  ? (Number(formData.totalOutstanding) - Number(formData.advanceTds) - Number(formData.paymentAmount)).toFixed(2)
                  : ''
              }
              disabled
              fullWidth
            />
            
            <div className="md:col-span-2">
              <Input
                label="Item Description"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleChange}
                error={errors.itemDescription}
                fullWidth
                required
              />
            </div>
            
            <Input
              label="Bill Number"
              name="billNumber"
              value={formData.billNumber}
              onChange={handleChange}
              error={errors.billNumber}
              fullWidth
              required
            />
            
            <Input
              label="Bill Date"
              name="billDate"
              type="date"
              value={formData.billDate}
              onChange={handleChange}
              error={errors.billDate}
              fullWidth
              required
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="bill-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="bill-image"
                        name="bill-image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  {billImage && (
                    <p className="text-sm text-gray-500 mt-2">
                      Selected file: {billImage.name}
                    </p>
                  )}
                </div>
              </div>
              {errors.billImage && (
                <p className="mt-2 text-sm text-error-600">{errors.billImage}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/payments')}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PaymentRequestForm;