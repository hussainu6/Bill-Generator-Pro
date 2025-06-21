
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Party } from '@/types/invoice';

interface CustomerSectionProps {
  customer: Party;
  onCustomerChange: (customer: Party) => void;
}

const CustomerSection: React.FC<CustomerSectionProps> = ({ customer, onCustomerChange }) => {
  const handleChange = (field: keyof Party, value: string) => {
    onCustomerChange({ ...customer, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={customer.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
        <div>
          <Label htmlFor="customerEmail">Email</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customer.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="customer@example.com"
          />
        </div>
        <div>
          <Label htmlFor="customerPhone">Phone</Label>
          <Input
            id="customerPhone"
            value={customer.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="customerAddress">Address</Label>
          <Textarea
            id="customerAddress"
            value={customer.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter customer address"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerSection;
