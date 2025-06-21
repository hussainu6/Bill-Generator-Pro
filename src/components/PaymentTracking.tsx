
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, TrashIcon, CreditCardIcon } from 'lucide-react';
import { Invoice, PaymentRecord, PAYMENT_METHODS } from '@/types/invoice';
import { calculateInvoiceTotals } from '@/utils/invoiceStorage';

interface PaymentTrackingProps {
  invoice: Invoice;
  onInvoiceChange: (invoice: Invoice) => void;
}

const PaymentTracking: React.FC<PaymentTrackingProps> = ({ invoice, onInvoiceChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<PaymentRecord>>({
    amount: 0,
    method: 'Cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const payments = invoice.payments || [];

  const addPayment = () => {
    if (!newPayment.amount || newPayment.amount <= 0) return;

    const payment: PaymentRecord = {
      id: Date.now().toString(),
      amount: newPayment.amount,
      method: newPayment.method || 'Cash',
      date: newPayment.date || new Date().toISOString().split('T')[0],
      notes: newPayment.notes || ''
    };

    const updatedInvoice = calculateInvoiceTotals({
      ...invoice,
      payments: [...payments, payment]
    });

    onInvoiceChange(updatedInvoice);
    setNewPayment({
      amount: 0,
      method: 'Cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddForm(false);
  };

  const removePayment = (paymentId: string) => {
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    const updatedInvoice = calculateInvoiceTotals({
      ...invoice,
      payments: updatedPayments
    });
    onInvoiceChange(updatedInvoice);
  };

  const getPaymentStatusBadge = () => {
    const totalAmount = invoice.total || 0;
    const paidAmount = invoice.amountPaid || 0;

    if (paidAmount === 0) {
      return <Badge variant="destructive">Unpaid</Badge>;
    } else if (paidAmount >= totalAmount) {
      return <Badge variant="default" className="bg-green-600">Fully Paid</Badge>;
    } else {
      return <Badge variant="secondary">Partially Paid</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h4 className="font-medium">Payment Tracking</h4>
          {getPaymentStatusBadge()}
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Payment
        </Button>
      </div>

      {/* Payment Summary */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Total Amount:</span>
          <span className="font-medium">{invoice.currency}{invoice.total?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Amount Paid:</span>
          <span className="font-medium">{invoice.currency}{invoice.amountPaid?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between text-orange-600">
          <span>Balance Remaining:</span>
          <span className="font-medium">{invoice.currency}{invoice.balanceRemaining?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {/* Add Payment Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 space-y-4 bg-white">
          <h5 className="font-medium">Add New Payment</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Amount ({invoice.currency})</Label>
              <Input
                type="number"
                step="0.01"
                value={newPayment.amount || 0}
                onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Enter payment amount"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={newPayment.method || 'Cash'}
                onValueChange={(value) => setNewPayment({ ...newPayment, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={newPayment.date || ''}
                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={newPayment.notes || ''}
                onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                placeholder="Payment notes"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addPayment} size="sm">Add Payment</Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="space-y-2">
        <h5 className="font-medium">Payment History</h5>
        {payments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CreditCardIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No payments recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map(payment => (
              <div key={payment.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{invoice.currency}{payment.amount.toFixed(2)}</span>
                    <Badge variant="outline">{payment.method}</Badge>
                    <span className="text-sm text-gray-600">{payment.date}</span>
                  </div>
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                  )}
                </div>
                <Button
                  onClick={() => removePayment(payment.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracking;
