export type UserRole = 'user' | 'admin' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
}

export interface Comment {
  id: string;
  paymentId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  serialNumber: number;
  date: string;
  vendorName: string;
  totalOutstanding: number;
  advanceTds: number;
  paymentAmount: number;
  balanceAmount: number;
  itemDescription: string;
  billNumber: string;
  billDate: string;
  billImage: string | null;
  requestedBy: User;
  approvedBy: User | null;
  companyName: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface FilterOptions {
  status: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  vendor: string | null;
  company: string | null;
}