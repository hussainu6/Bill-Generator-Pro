
import React from 'react';
import { Invoice } from '@/types/invoice';
import { calculateInvoiceTotals } from '@/utils/invoiceStorage';
import LineItemsSection from '@/components/LineItemsSection';
import BusinessSection from '@/components/BusinessSection';
import CustomerSection from '@/components/CustomerSection';
import InvoiceDetailsSection from '@/components/InvoiceDetailsSection';
import CalculationsSection from '@/components/CalculationsSection';
import AdditionalInfoSection from '@/components/AdditionalInfoSection';
import InvoiceTemplateSelector from '@/components/InvoiceTemplateSelector';

interface InvoiceBuilderProps {
  invoice: Invoice;
  onInvoiceChange: (invoice: Invoice) => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ invoice, onInvoiceChange }) => {
  const handleInvoiceUpdate = (updates: Partial<Invoice>) => {
    const updatedInvoice = calculateInvoiceTotals({ ...invoice, ...updates });
    onInvoiceChange(updatedInvoice);
  };

  return (
    <div className="space-y-6">
      {/* Invoice Details */}
      <InvoiceDetailsSection
        invoice={invoice}
        onInvoiceChange={handleInvoiceUpdate}
      />

      {/* Template Selection */}
      <InvoiceTemplateSelector
        selectedTemplate={invoice.template || 'modern'}
        onTemplateChange={(template) => handleInvoiceUpdate({ template: template as any })}
      />

      {/* Business & Customer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusinessSection
          business={invoice.business}
          onBusinessChange={(business) => handleInvoiceUpdate({ business })}
        />
        <CustomerSection
          customer={invoice.customer}
          onCustomerChange={(customer) => handleInvoiceUpdate({ customer })}
        />
      </div>

      {/* Line Items */}
      <LineItemsSection
        lineItems={invoice.lineItems}
        currency={invoice.currency}
        onLineItemsChange={(lineItems) => handleInvoiceUpdate({ lineItems })}
        onCurrencyChange={(currency) => handleInvoiceUpdate({ currency })}
      />

      {/* Calculations */}
      <CalculationsSection
        invoice={invoice}
        onInvoiceChange={handleInvoiceUpdate}
      />

      {/* Additional Information */}
      <AdditionalInfoSection
        invoice={invoice}
        onInvoiceChange={onInvoiceChange}
      />
    </div>
  );
};

export default InvoiceBuilder;
