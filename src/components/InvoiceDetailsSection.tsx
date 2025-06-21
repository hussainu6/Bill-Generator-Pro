
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Invoice } from '@/types/invoice';

interface InvoiceDetailsSectionProps {
  invoice: Invoice;
  onInvoiceChange: (updates: Partial<Invoice>) => void;
}

const InvoiceDetailsSection: React.FC<InvoiceDetailsSectionProps> = ({ 
  invoice, 
  onInvoiceChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Invoice Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="invoiceId">Invoice ID</Label>
            <Input
              id="invoiceId"
              value={invoice.id}
              onChange={(e) => onInvoiceChange({ id: e.target.value })}
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={invoice.date}
              onChange={(e) => onInvoiceChange({ date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={invoice.dueDate || ''}
              onChange={(e) => onInvoiceChange({ dueDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={invoice.status} onValueChange={(value: any) => onInvoiceChange({ status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceDetailsSection;
