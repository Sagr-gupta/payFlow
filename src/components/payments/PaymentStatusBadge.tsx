import React from 'react';
import Badge from '../ui/Badge';
import { PaymentRequest } from '../../types';

interface PaymentStatusBadgeProps {
  status: PaymentRequest['status'];
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'approved':
      return <Badge variant="success">Approved</Badge>;
    case 'rejected':
      return <Badge variant="error">Rejected</Badge>;
    case 'processed':
      return <Badge variant="primary">Processed</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

export default PaymentStatusBadge;