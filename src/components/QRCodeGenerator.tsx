
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Invoice, QRCodeConfig } from '@/types/invoice';

interface QRCodeGeneratorProps {
  invoice: Invoice;
  onQRConfigChange: (config: QRCodeConfig) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ invoice, onQRConfigChange }) => {
  const qrConfig = invoice.qrCode || {
    enabled: false,
    data: 'invoice-id',
    size: 128,
    position: 'bottom-right'
  };

  const generateQRData = (): string => {
    switch (qrConfig.data) {
      case 'invoice-id':
        return `Invoice: ${invoice.id}`;
      case 'payment-link':
        return `Payment for Invoice ${invoice.id} - Amount: ${invoice.currency}${invoice.total.toFixed(2)}`;
      case 'full-invoice':
        return JSON.stringify({
          id: invoice.id,
          date: invoice.date,
          total: invoice.total,
          currency: invoice.currency,
          business: invoice.business.name,
          customer: invoice.customer.name
        });
      case 'custom':
        return qrConfig.customData || `Invoice: ${invoice.id}`;
      default:
        return `Invoice: ${invoice.id}`;
    }
  };

  const handleConfigChange = (updates: Partial<QRCodeConfig>) => {
    const newConfig = { ...qrConfig, ...updates };
    onQRConfigChange(newConfig);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          QR Code Settings
          <Switch
            checked={qrConfig.enabled}
            onCheckedChange={(enabled) => handleConfigChange({ enabled })}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrConfig.enabled && (
          <>
            <div>
              <Label>QR Code Data</Label>
              <Select
                value={qrConfig.data}
                onValueChange={(value: any) => handleConfigChange({ data: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice-id">Invoice ID Only</SelectItem>
                  <SelectItem value="payment-link">Payment Information</SelectItem>
                  <SelectItem value="full-invoice">Full Invoice Summary</SelectItem>
                  <SelectItem value="custom">Custom Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {qrConfig.data === 'custom' && (
              <div>
                <Label>Custom Data</Label>
                <Input
                  value={qrConfig.customData || ''}
                  onChange={(e) => handleConfigChange({ customData: e.target.value })}
                  placeholder="Enter custom QR code data"
                />
              </div>
            )}

            <div>
              <Label>Size</Label>
              <Select
                value={qrConfig.size.toString()}
                onValueChange={(value) => handleConfigChange({ size: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64">Small (64px)</SelectItem>
                  <SelectItem value="128">Medium (128px)</SelectItem>
                  <SelectItem value="192">Large (192px)</SelectItem>
                  <SelectItem value="256">Extra Large (256px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Position on Invoice</Label>
              <Select
                value={qrConfig.position}
                onValueChange={(value: any) => handleConfigChange({ position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* QR Code Preview */}
            <div className="flex justify-center p-4 bg-gray-50 rounded">
              <div className="text-center">
                <QRCodeSVG
                  value={generateQRData()}
                  size={Math.min(qrConfig.size, 128)}
                  level="M"
                  includeMargin={true}
                />
                <p className="text-xs text-gray-600 mt-2">Preview</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
