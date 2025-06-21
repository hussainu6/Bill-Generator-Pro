
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Invoice } from '@/types/invoice';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const generateQRData = (): string => {
    if (!invoice.qrCode?.enabled) return '';
    
    switch (invoice.qrCode.data) {
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
        return invoice.qrCode.customData || `Invoice: ${invoice.id}`;
      default:
        return `Invoice: ${invoice.id}`;
    }
  };

  const QRCodeComponent = () => {
    if (!invoice.qrCode?.enabled) return null;

    const qrData = generateQRData();
    const size = invoice.qrCode.size || 128;

    return (
      <div className={`
        absolute print:relative
        ${invoice.qrCode.position === 'top-right' ? 'top-4 right-4' : ''}
        ${invoice.qrCode.position === 'bottom-right' ? 'bottom-4 right-4' : ''}
        ${invoice.qrCode.position === 'bottom-center' ? 'bottom-4 left-1/2 transform -translate-x-1/2' : ''}
      `}>
        <QRCodeSVG
          value={qrData}
          size={size}
          level="M"
          includeMargin={true}
          className="bg-white p-2 rounded shadow-sm"
        />
      </div>
    );
  };

  const getTemplateStyles = () => {
    const template = invoice.template || 'modern';
    
    switch (template) {
      case 'classic':
        return {
          cardClass: 'border-2 border-gray-400 dark:border-gray-600',
          headerClass: 'border-b-4 border-gray-800 dark:border-gray-200 pb-4 mb-6',
          titleClass: 'text-4xl font-serif text-gray-800 dark:text-gray-100',
          sectionClass: 'border border-gray-300 dark:border-gray-600 p-4 rounded'
        };
      case 'minimal':
        return {
          cardClass: 'border-none shadow-none',
          headerClass: 'border-b border-gray-200 dark:border-gray-700 pb-6 mb-8',
          titleClass: 'text-2xl font-light text-gray-700 dark:text-gray-300',
          sectionClass: ''
        };
      case 'professional':
        return {
          cardClass: 'border border-blue-200 dark:border-blue-800',
          headerClass: 'bg-blue-50 dark:bg-blue-950 p-6 -m-8 mb-8',
          titleClass: 'text-3xl font-bold text-blue-900 dark:text-blue-100',
          sectionClass: 'bg-gray-50 dark:bg-gray-900 p-4 rounded'
        };
      case 'elegant':
        return {
          cardClass: 'border border-purple-200 dark:border-purple-800 shadow-lg',
          headerClass: 'pb-6 mb-8',
          titleClass: 'text-3xl font-serif text-purple-900 dark:text-purple-100',
          sectionClass: 'border-l-4 border-purple-300 dark:border-purple-700 pl-4'
        };
      default: // modern
        return {
          cardClass: 'dark:bg-gray-900 dark:border-gray-700',
          headerClass: 'mb-8',
          titleClass: 'text-3xl font-bold text-gray-900 dark:text-gray-100',
          sectionClass: ''
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className="max-w-4xl mx-auto">
      <Card className={`print:shadow-none print:border-none relative ${styles.cardClass}`}>
        <CardContent className="p-8">
          {/* QR Code */}
          {invoice.qrCode?.enabled && invoice.qrCode.position.includes('top') && <QRCodeComponent />}

          {/* Header */}
          <div className={`flex justify-between items-start ${styles.headerClass}`}>
            <div className="flex items-start gap-4">
              {invoice.business.logo && (
                <img 
                  src={invoice.business.logo} 
                  alt="Business Logo" 
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h1 className={`${styles.titleClass} mb-2`}>INVOICE</h1>
                <p className="text-gray-600 dark:text-gray-400">#{invoice.id}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Date: {invoice.date}</p>
              {invoice.dueDate && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Due: {invoice.dueDate}</p>
              )}
            </div>
          </div>

          {/* Business and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className={styles.sectionClass}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">From:</h3>
              <div className="text-gray-700 dark:text-gray-300">
                <p className="font-medium">{invoice.business.name}</p>
                {invoice.business.address && (
                  <p className="whitespace-pre-line text-sm">{invoice.business.address}</p>
                )}
                {invoice.business.email && <p className="text-sm">{invoice.business.email}</p>}
                {invoice.business.phone && <p className="text-sm">{invoice.business.phone}</p>}
              </div>
            </div>
            <div className={styles.sectionClass}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">To:</h3>
              <div className="text-gray-700 dark:text-gray-300">
                <p className="font-medium">{invoice.customer.name}</p>
                {invoice.customer.address && (
                  <p className="whitespace-pre-line text-sm">{invoice.customer.address}</p>
                )}
                {invoice.customer.email && <p className="text-sm">{invoice.customer.email}</p>}
                {invoice.customer.phone && <p className="text-sm">{invoice.customer.phone}</p>}
              </div>
            </div>
          </div>

          {/* Line Items */}
          {invoice.lineItems.length > 0 && (
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-2 font-semibold dark:text-gray-100">Item</th>
                      <th className="text-center py-3 px-2 font-semibold dark:text-gray-100">Qty</th>
                      <th className="text-right py-3 px-2 font-semibold dark:text-gray-100">Price</th>
                      {invoice.lineItems.some(item => item.discount > 0) && (
                        <th className="text-right py-3 px-2 font-semibold dark:text-gray-100">Discount</th>
                      )}
                      <th className="text-right py-3 px-2 font-semibold dark:text-gray-100">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium dark:text-gray-100">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {item.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 dark:text-gray-100">{item.quantity} {item.unit}</td>
                        <td className="text-right py-3 px-2 dark:text-gray-100">
                          {invoice.currency}{item.price.toFixed(2)}
                        </td>
                        {invoice.lineItems.some(item => item.discount > 0) && (
                          <td className="text-right py-3 px-2 text-red-600 dark:text-red-400">
                            {item.discount > 0 ? (
                              item.discountType === 'percentage' 
                                ? `${item.discount}%` 
                                : `${invoice.currency}${item.discount.toFixed(2)}`
                            ) : '-'}
                          </td>
                        )}
                        <td className="text-right py-3 px-2 font-medium dark:text-gray-100">
                          {invoice.currency}{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between dark:text-gray-100">
                  <span>Subtotal:</span>
                  <span>{invoice.currency}{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Discount:</span>
                    <span>-{invoice.currency}{invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between dark:text-gray-100">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{invoice.currency}{invoice.taxAmount.toFixed(2)}</span>
                </div>
                {invoice.shippingAmount > 0 && (
                  <div className="flex justify-between dark:text-gray-100">
                    <span>Shipping:</span>
                    <span>{invoice.currency}{invoice.shippingAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="dark:border-gray-700" />
                <div className="flex justify-between text-lg font-bold dark:text-gray-100">
                  <span>Total:</span>
                  <span>{invoice.currency}{invoice.total.toFixed(2)}</span>
                </div>
                {(invoice.amountPaid || 0) > 0 && (
                  <>
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Amount Paid:</span>
                      <span>{invoice.currency}{(invoice.amountPaid || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-orange-600 dark:text-orange-400">
                      <span>Balance Due:</span>
                      <span>{invoice.currency}{(invoice.balanceRemaining || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="space-y-4">
            {invoice.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes:</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
            
            {invoice.terms && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Terms & Conditions:</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{invoice.terms}</p>
              </div>
            )}

            {invoice.paymentInstructions && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Payment Instructions:</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{invoice.paymentInstructions}</p>
              </div>
            )}
          </div>

          {/* QR Code for bottom positions */}
          {invoice.qrCode?.enabled && !invoice.qrCode.position.includes('top') && <QRCodeComponent />}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicePreview;
