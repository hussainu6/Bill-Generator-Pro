import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusIcon, SaveIcon, PrinterIcon, SettingsIcon, BarChart3Icon, PackageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InvoiceBuilder from '@/components/InvoiceBuilder';
import InvoicePreview from '@/components/InvoicePreview';
import InvoiceHistory from '@/components/InvoiceHistory';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SettingsPanel from '@/components/SettingsPanel';
import InventoryManager from '@/components/InventoryManager';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Invoice } from '@/types/invoice';
import { generateInvoiceId, saveInvoice, loadSettings } from '@/utils/invoiceStorage';

const IndexContent = () => {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>({
    id: generateInvoiceId(),
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    business: {
      name: '',
      address: '',
      email: '',
      phone: '',
      logo: ''
    },
    customer: {
      name: '',
      address: '',
      email: '',
      phone: ''
    },
    lineItems: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    shippingAmount: 0,
    total: 0,
    currency: '$',
    notes: ''
  });

  const [activeTab, setActiveTab] = useState('builder');
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();

  // Load default settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setCurrentInvoice(prev => ({
      ...prev,
      currency: settings.currencySymbol,
      taxRate: settings.defaultTaxRate,
      discountType: settings.defaultDiscountMode
    }));
  }, []);

  const handleSaveInvoice = () => {
    try {
      saveInvoice(currentInvoice);
      toast({
        title: "Invoice Saved",
        description: `Invoice ${currentInvoice.id} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = () => {
    setActiveTab('preview');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleNewInvoice = () => {
    const settings = loadSettings();
    setCurrentInvoice({
      ...currentInvoice,
      id: generateInvoiceId(),
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      lineItems: [],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
      notes: '',
      currency: settings.currencySymbol,
      taxRate: settings.defaultTaxRate,
      discountType: settings.defaultDiscountMode
    });
    setActiveTab('builder');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSaveInvoice();
            break;
          case 'p':
            e.preventDefault();
            handlePrintInvoice();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInvoice]);

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Bill Generator Pro
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Professional invoicing with inventory & QR codes</p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button onClick={handleNewInvoice} variant="outline" className="gap-2">
                <PlusIcon className="w-4 h-4" />
                New Invoice
              </Button>
              <Button onClick={handleSaveInvoice} className="gap-2">
                <SaveIcon className="w-4 h-4" />
                Save (Ctrl+S)
              </Button>
              <Button onClick={handlePrintInvoice} variant="outline" className="gap-2">
                <PrinterIcon className="w-4 h-4" />
                Print (Ctrl+P)
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="outline" className="gap-2">
                <SettingsIcon className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b bg-white/50 dark:bg-gray-800/50 px-6 py-4">
                <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
                  <TabsTrigger value="builder" className="gap-2">
                    Builder
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    History
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="gap-2">
                    <PackageIcon className="w-4 h-4" />
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="gap-2">
                    <BarChart3Icon className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="builder" className="p-6 m-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <InvoiceBuilder 
                      invoice={currentInvoice} 
                      onInvoiceChange={setCurrentInvoice}
                    />
                  </div>
                  <div className="space-y-6">
                    <QRCodeGenerator
                      invoice={currentInvoice}
                      onQRConfigChange={(qrCode) => setCurrentInvoice({...currentInvoice, qrCode})}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="p-6 m-0">
                <InvoicePreview invoice={currentInvoice} />
              </TabsContent>

              <TabsContent value="history" className="p-6 m-0">
                <InvoiceHistory 
                  onLoadInvoice={setCurrentInvoice}
                  onSwitchToBuilder={() => setActiveTab('builder')}
                />
              </TabsContent>

              <TabsContent value="inventory" className="p-6 m-0">
                <InventoryManager />
              </TabsContent>

              <TabsContent value="analytics" className="p-6 m-0">
                <AnalyticsDashboard />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <IndexContent />
    </ThemeProvider>
  );
};

export default Index;
