
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Party } from '@/types/invoice';
import LogoUpload from './LogoUpload';

interface BusinessSectionProps {
  business: Party;
  onBusinessChange: (business: Party) => void;
}

const BusinessSection: React.FC<BusinessSectionProps> = ({ business, onBusinessChange }) => {
  const handleChange = (field: keyof Party, value: string | undefined) => {
    onBusinessChange({ ...business, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Business</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={business.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter your business name"
              />
            </div>
            <div>
              <Label htmlFor="businessEmail">Email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={business.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="business@example.com"
              />
            </div>
            <div>
              <Label htmlFor="businessPhone">Phone</Label>
              <Input
                id="businessPhone"
                value={business.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="space-y-4">
            <LogoUpload
              logo={business.logo}
              onLogoChange={(logo) => handleChange('logo', logo)}
              label="Business Logo"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="businessAddress">Address</Label>
          <Textarea
            id="businessAddress"
            value={business.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Enter your business address"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessSection;
