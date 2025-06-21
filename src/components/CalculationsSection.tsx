
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Invoice } from '@/types/invoice';

interface CalculationsSectionProps {
  invoice: Invoice;
  onInvoiceChange: (updates: Partial<Invoice>) => void;
}

const CalculationsSection: React.FC<CalculationsSectionProps> = ({
  invoice,
  onInvoiceChange
}) => {
  const convertNumberToWords = (num: number): string => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'million', 'billion'];

    if (num === 0) return 'zero';

    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    let result = '';
    let thousandIndex = 0;
    
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        result = convertHundreds(chunk) + thousands[thousandIndex] + ' ' + result;
      }
      num = Math.floor(num / 1000);
      thousandIndex++;
    }

    return result.trim() + ' only';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={invoice.taxRate}
              onChange={(e) => onInvoiceChange({ taxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="discountType">Discount Type</Label>
            <Select value={invoice.discountType} onValueChange={(value: any) => onInvoiceChange({ discountType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="flat">Flat Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discountValue">
              Discount {invoice.discountType === 'percentage' ? '(%)' : `(${invoice.currency})`}
            </Label>
            <Input
              id="discountValue"
              type="number"
              min="0"
              step="0.01"
              value={invoice.discountValue}
              onChange={(e) => onInvoiceChange({ discountValue: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="shipping">Shipping ({invoice.currency})</Label>
            <Input
              id="shipping"
              type="number"
              min="0"
              step="0.01"
              value={invoice.shippingAmount}
              onChange={(e) => onInvoiceChange({ shippingAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">{invoice.currency}{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span>-{invoice.currency}{invoice.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tax ({invoice.taxRate}%):</span>
            <span>{invoice.currency}{invoice.taxAmount.toFixed(2)}</span>
          </div>
          {invoice.shippingAmount > 0 && (
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{invoice.currency}{invoice.shippingAmount.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{invoice.currency}{invoice.total.toFixed(2)}</span>
          </div>
          <div className="text-sm text-slate-600 capitalize">
            Amount in words: {convertNumberToWords(Math.floor(invoice.total))}
          </div>
          {invoice.amountPaid && invoice.amountPaid > 0 && (
            <>
              <div className="flex justify-between text-green-600">
                <span>Amount Paid:</span>
                <span>{invoice.currency}{invoice.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-orange-600 font-medium">
                <span>Balance Remaining:</span>
                <span>{invoice.currency}{(invoice.balanceRemaining || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationsSection;
