import { create } from 'zustand';
import { PaymentRequest, FilterOptions, User } from '../types';
import { supabase } from '../lib/supabase';

interface PaymentState {
  payments: PaymentRequest[];
  filteredPayments: PaymentRequest[];
  filterOptions: FilterOptions;
  isLoading: boolean;
  
  fetchPayments: () => Promise<void>;
  addPayment: (payment: Omit<PaymentRequest, 'id' | 'serialNumber' | 'status' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'billImage' | 'comments'> & { billImage?: File }) => Promise<PaymentRequest>;
  approvePayment: (id: string, approver: User) => Promise<void>;
  rejectPayment: (id: string, approver: User) => Promise<void>;
  markAsProcessed: (id: string) => Promise<void>;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  applyFilters: () => void;
  addComment: (paymentId: string, content: string, user: User) => Promise<void>;
  sendForReview: (paymentId: string, comment: string, user: User) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  filteredPayments: [],
  isLoading: false,
  filterOptions: {
    status: [],
    dateRange: {
      start: null,
      end: null,
    },
    vendor: null,
    company: null,
  },
  
  fetchPayments: async () => {
    set({ isLoading: true });
    
    try {
      // Test Supabase connection first
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Not authenticated');
      }

      if (!session?.session) {
        console.error('No active session found');
        throw new Error('No active session');
      }

      // Get current user's role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user role:', userError);
        throw userError;
      }

      console.log('Current user role:', userData?.role);

      console.log('Starting to fetch payments...');
      const { data: payments, error, status, statusText } = await supabase
        .from('payments')
        .select(`
          *,
          requested_by:requested_by (
            id,
            name,
            email,
            role,
            company
          ),
          approved_by:approved_by (
            id,
            name,
            email,
            role,
            company
          ),
          comments:comments (
            id,
            payment_id,
            user_id,
            user_name,
            content,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Query response:', {
        status,
        statusText,
        error,
        data: payments
      });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!payments || payments.length === 0) {
        console.log('No payments found in the database');
      } else {
        console.log(`Found ${payments.length} payments`);
        const mappedPayments: PaymentRequest[] = payments.map((p, index) => ({
          id: p.id,
          serialNumber: index + 1,
          date: p.date,
          vendorName: p.vendor_name,
          totalOutstanding: p.total_outstanding,
          advanceTds: p.advance_tds,
          paymentAmount: p.payment_amount,
          balanceAmount: p.balance_amount,
          itemDescription: p.item_description,
          billNumber: p.bill_number,
          billDate: p.bill_date,
          billImage: p.bill_image,
          requestedBy: p.requested_by as User,
          approvedBy: p.approved_by as User | null,
          companyName: p.company_name,
          status: p.status as 'pending' | 'approved' | 'rejected' | 'processed',
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          comments: p.comments.map((c: any) => ({
            id: c.id,
            paymentId: c.payment_id,
            userId: c.user_id,
            userName: c.user_name,
            content: c.content,
            createdAt: c.created_at
          }))
        }));
      
        set({ 
          payments: mappedPayments,
          isLoading: false 
        });
        get().applyFilters();
      }
    } catch (error) {
      console.error('Error in fetchPayments:', error);
      set({ isLoading: false });
    }
  },
  
  addPayment: async (paymentData) => {
    set({ isLoading: true });
    
    try {
      // Upload bill image if provided
      let billImageUrl = null;
      if (paymentData.billImage) {
        try {
          const file = paymentData.billImage;
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `bill-images/${fileName}`;

          console.log('Starting file upload...', {
            fileName,
            filePath,
            fileSize: file.size,
            fileType: file.type
          });

          // Upload the file
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bill-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Error uploading file:', {
              error: uploadError,
              message: uploadError.message
            });
            throw new Error(`Failed to upload bill image: ${uploadError.message}`);
          }

          console.log('File uploaded successfully:', uploadData);

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('bill-images')
            .getPublicUrl(filePath);

          console.log('Generated public URL:', publicUrl);

          // Get a signed URL that includes the authentication token
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('bill-images')
            .createSignedUrl(filePath, 31536000); // 1 year expiry

          if (signedUrlError) {
            console.error('Error creating signed URL:', signedUrlError);
            throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
          }

          console.log('Generated signed URL:', signedUrlData?.signedUrl);

          // Use the signed URL for the image
          billImageUrl = signedUrlData?.signedUrl || publicUrl;

          // Verify the URL is accessible
          try {
            const response = await fetch(billImageUrl);
            if (!response.ok) {
              console.error('URL verification failed:', {
                status: response.status,
                statusText: response.statusText
              });
              throw new Error('Generated URL is not accessible');
            }
          } catch (error) {
            console.error('Error verifying URL:', error instanceof Error ? error.message : 'Unknown error');
            throw new Error('Failed to verify image URL accessibility');
          }
        } catch (error) {
          console.error('Error handling bill image:', error instanceof Error ? error.message : 'Unknown error');
          throw new Error(`Failed to process bill image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      const { data, error } = await supabase
        .from('payments')
        .insert([{
          date: paymentData.date,
          vendor_name: paymentData.vendorName,
          total_outstanding: paymentData.totalOutstanding,
          advance_tds: paymentData.advanceTds,
          payment_amount: paymentData.paymentAmount,
          balance_amount: paymentData.balanceAmount,
          item_description: paymentData.itemDescription,
          bill_number: paymentData.billNumber,
          bill_date: paymentData.billDate,
          bill_image: billImageUrl,
          requested_by: paymentData.requestedBy.id,
          company_name: paymentData.companyName,
        }])
        .select()
        .single();

      if (error) throw error;

      const newPayment: PaymentRequest = {
        ...paymentData,
        id: data.id,
        serialNumber: get().payments.length + 1,
        status: 'pending' as const,
        createdAt: data.created_at,
        updatedAt: data.created_at,
        approvedBy: null,
        billImage: billImageUrl,
        comments: []
      };

      set(state => ({
        payments: [...state.payments, newPayment],
        isLoading: false
      }));
      
      get().applyFilters();
      
      return newPayment;
    } catch (error) {
      console.error('Error adding payment:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  approvePayment: async (id, approver) => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'approved',
          approved_by: approver.id,
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === id
            ? { 
                ...payment, 
                status: 'approved',
                approvedBy: approver,
                updatedAt: new Date().toISOString() 
              }
            : payment
        ),
        isLoading: false
      }));
      
      get().applyFilters();
    } catch (error) {
      console.error('Error approving payment:', error);
      set({ isLoading: false });
    }
  },
  
  rejectPayment: async (id, approver) => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'rejected',
          approved_by: approver.id,
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === id
            ? { 
                ...payment, 
                status: 'rejected',
                approvedBy: approver,
                updatedAt: new Date().toISOString() 
              }
            : payment
        ),
        isLoading: false
      }));
      
      get().applyFilters();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      set({ isLoading: false });
    }
  },
  
  markAsProcessed: async (id) => {
    set({ isLoading: true });
    
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'processed' })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === id
            ? { 
                ...payment, 
                status: 'processed',
                updatedAt: new Date().toISOString() 
              }
            : payment
        ),
        isLoading: false
      }));
      
      get().applyFilters();
    } catch (error) {
      console.error('Error marking payment as processed:', error);
      set({ isLoading: false });
    }
  },
  
  setFilterOptions: (options) => {
    set(state => ({
      filterOptions: {
        ...state.filterOptions,
        ...options
      }
    }));
    
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { payments, filterOptions } = get();
    
    let filtered = [...payments];
    
    if (filterOptions.status.length > 0) {
      console.log('Applying status filters:', filterOptions.status);
      filtered = filtered.filter(payment => 
        filterOptions.status.includes(payment.status)
      );
    }
    
    if (filterOptions.dateRange.start && filterOptions.dateRange.end) {
      console.log('Applying date range filters:', filterOptions.dateRange);
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        const startDate = new Date(filterOptions.dateRange.start!);
        const endDate = new Date(filterOptions.dateRange.end!);
        
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }
    
    if (filterOptions.vendor) {
      console.log('Applying vendor filter:', filterOptions.vendor);
      filtered = filtered.filter(payment => 
        payment.vendorName.toLowerCase().includes(filterOptions.vendor!.toLowerCase())
      );
    }
    
    if (filterOptions.company) {
      console.log('Applying company filter:', filterOptions.company);
      filtered = filtered.filter(payment => 
        payment.companyName.toLowerCase().includes(filterOptions.company!.toLowerCase())
      );
    }
    
    console.log('Filtered payments:', filtered);
    set({ filteredPayments: filtered });
  },

  addComment: async (paymentId, content, user) => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          payment_id: paymentId,
          user_id: user.id,
          user_name: user.name,
          content: content
        }])
        .select()
        .single();

      if (error) throw error;

      // Update the payment in the store with the new comment
      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === paymentId
            ? {
                ...payment,
                comments: [
                  ...payment.comments,
                  {
                    id: data.id,
                    paymentId: paymentId,
                    userId: user.id,
                    userName: user.name,
                    content: content,
                    createdAt: data.created_at
                  }
                ]
              }
            : payment
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  sendForReview: async (paymentId, comment, user) => {
    set({ isLoading: true });
    
    try {
      // First add the comment
      await get().addComment(paymentId, comment, user);

      // Then update the payment status to pending
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'pending',
          approved_by: null
        })
        .eq('id', paymentId);

      if (error) throw error;

      // Update the payment in the store
      set(state => ({
        payments: state.payments.map(payment => 
          payment.id === paymentId
            ? {
                ...payment,
                status: 'pending',
                approvedBy: null
              }
            : payment
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error sending for review:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));