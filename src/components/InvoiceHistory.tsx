
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, TrashIcon, CopyIcon } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { loadInvoices, deleteInvoice, duplicateInvoice, saveInvoice } from '@/utils/invoiceStorage';
import { useToast } from '@/hooks/use-toast';

interface InvoiceHistoryProps {
  onLoadInvoice: (invoice: Invoice) => void;
  onSwitchToBuilder: () => void;
}

const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ onLoadInvoice, onSwitchToBuilder }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadInvoicesData();
  }, []);

  const loadInvoicesData = () => {
    const data = loadInvoices();
    setInvoices(data.sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime()));
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        deleteInvoice(id);
        loadInvoicesData();
        toast({
          title: "Invoice Deleted",
          description: "Invoice has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete invoice.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    try {
      const duplicated = duplicateInvoice(invoice);
      saveInvoice(duplicated);
      onLoadInvoice(duplicated);
      onSwitchToBuilder();
      toast({
        title: "Invoice Duplicated",
        description: `New invoice ${duplicated.id} created from template.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate invoice.",
        variant: "destructive",
      });
    }
  };

  const handleLoadInvoice = (invoice: Invoice) => {
    onLoadInvoice(invoice);
    onSwitchToBuilder();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search invoices by ID, customer, or business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No invoices found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleLoadInvoice(invoice)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">#{invoice.id}</h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Customer:</span> {invoice.customer.name || 'N/A'}</p>
                          <p><span className="font-medium">Date:</span> {invoice.date}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Total:</span> {invoice.currency}{invoice.total.toFixed(2)}</p>
                          <p><span className="font-medium">Items:</span> {invoice.lineItems.length}</p>
                        </div>
                        <div>
                          {invoice.updatedAt && (
                            <p><span className="font-medium">Updated:</span> {new Date(invoice.updatedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateInvoice(invoice)}
                        className="gap-1"
                      >
                        <CopyIcon className="w-4 h-4" />
                        Duplicate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-700 gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceHistory;
