import { PaymentRequest } from '../types';
import * as XLSX from 'xlsx';

export const exportPaymentsToExcel = (payments: PaymentRequest[]) => {
  // Prepare the data for Excel
  const excelData = payments.map(payment => ({
    'Sr. No.': payment.serialNumber,
    'Date': new Date(payment.date).toLocaleDateString(),
    'Vendor Name': payment.vendorName,
    'Total Outstanding': payment.totalOutstanding,
    'Advance/TDS': payment.advanceTds,
    'Payment Amount': payment.paymentAmount,
    'Balance Amount': payment.balanceAmount,
    'Item Description': payment.itemDescription,
    'Bill Number': payment.billNumber,
    'Bill Date': new Date(payment.billDate).toLocaleDateString(),
    'Requested By': payment.requestedBy.name,
    'Requested By Email': payment.requestedBy.email,
    'Approved By': payment.approvedBy?.name || 'N/A',
    'Approved By Email': payment.approvedBy?.email || 'N/A',
    'Company Name': payment.companyName,
    'Status': payment.status,
    'Created At': new Date(payment.createdAt).toLocaleString(),
    'Updated At': new Date(payment.updatedAt).toLocaleString()
  }));

  // Create a new workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Requests');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a blob and download link
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payment_requests_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}; 