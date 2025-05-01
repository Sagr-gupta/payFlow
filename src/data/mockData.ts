import { User, PaymentRequest } from '../types';
import { subDays } from 'date-fns';

// Mock users for demonstration
export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    company: 'ACME Inc.'
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    company: 'ACME Inc.'
  },
  {
    id: 'user3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'accounts',
    company: 'ACME Inc.'
  }
];

// Generate mock payment requests
export const mockPayments: PaymentRequest[] = [
  {
    id: 'payment1',
    serialNumber: 1,
    date: subDays(new Date(), 5).toISOString(),
    vendorName: 'Supplier Co.',
    totalOutstanding: 5000,
    advanceTds: 500,
    paymentAmount: 4500,
    balanceAmount: 0,
    itemDescription: 'Office supplies',
    billNumber: 'INV-2023-001',
    billDate: subDays(new Date(), 15).toISOString(),
    requestedBy: mockUsers[0],
    approvedBy: null,
    companyName: 'ACME Inc.',
    status: 'pending',
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString()
  },
  {
    id: 'payment2',
    serialNumber: 2,
    date: subDays(new Date(), 10).toISOString(),
    vendorName: 'Tech Services Ltd.',
    totalOutstanding: 12000,
    advanceTds: 1200,
    paymentAmount: 10800,
    balanceAmount: 0,
    itemDescription: 'IT equipment maintenance',
    billNumber: 'INV-2023-045',
    billDate: subDays(new Date(), 25).toISOString(),
    requestedBy: mockUsers[0],
    approvedBy: mockUsers[1],
    companyName: 'ACME Inc.',
    status: 'approved',
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 8).toISOString()
  },
  {
    id: 'payment3',
    serialNumber: 3,
    date: subDays(new Date(), 15).toISOString(),
    vendorName: 'Global Logistics',
    totalOutstanding: 8500,
    advanceTds: 850,
    paymentAmount: 7650,
    balanceAmount: 0,
    itemDescription: 'Shipping services',
    billNumber: 'INV-GL-789',
    billDate: subDays(new Date(), 30).toISOString(),
    requestedBy: mockUsers[0],
    approvedBy: mockUsers[1],
    companyName: 'ACME Inc.',
    status: 'processed',
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 7).toISOString()
  },
  {
    id: 'payment4',
    serialNumber: 4,
    date: subDays(new Date(), 3).toISOString(),
    vendorName: 'Furniture Plus',
    totalOutstanding: 15000,
    advanceTds: 1500,
    paymentAmount: 13500,
    balanceAmount: 0,
    itemDescription: 'Office furniture',
    billNumber: 'INV-FP-123',
    billDate: subDays(new Date(), 10).toISOString(),
    requestedBy: mockUsers[0],
    approvedBy: null,
    companyName: 'ACME Inc.',
    status: 'pending',
    createdAt: subDays(new Date(), 3).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString()
  },
  {
    id: 'payment5',
    serialNumber: 5,
    date: subDays(new Date(), 7).toISOString(),
    vendorName: 'Marketing Experts',
    totalOutstanding: 9000,
    advanceTds: 900,
    paymentAmount: 8100,
    balanceAmount: 0,
    itemDescription: 'Digital marketing campaign',
    billNumber: 'INV-ME-456',
    billDate: subDays(new Date(), 20).toISOString(),
    requestedBy: mockUsers[0],
    approvedBy: mockUsers[1],
    companyName: 'ACME Inc.',
    status: 'rejected',
    createdAt: subDays(new Date(), 7).toISOString(),
    updatedAt: subDays(new Date(), 6).toISOString()
  }
];