
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SettingsIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import { AppSettings } from '@/types/invoice';
import { loadSettings, saveSettings, loadInvoices, saveInvoice } from '@/utils/invoiceStorage';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = React.useState<AppSettings>(loadSettings());
  const { toast } = useToast();

  const handleSettingsChange = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    });
  };

  const exportData = () => {
    const data = {
      invoices: loadInvoices(),
      settings: loadSettings(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-generator-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.invoices) {
          data.invoices.forEach((invoice: any) => saveInvoice(invoice));
        }
        
        if (data.settings) {
          saveSettings(data.settings);
          setSettings(data.settings);
        }
        
        toast({
          title: "Data Imported",
          description: "Your data has been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Application Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency & Formatting */}
        <div className="space-y-4">
          <h3 className="font-semibold">Currency & Formatting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <Input
                id="currencySymbol"
                value={settings.currencySymbol}
                onChange={(e) => handleSettingsChange({ currencySymbol: e.target.value })}
                placeholder="$"
              />
            </div>
            <div>
              <Label htmlFor="decimalPrecision">Decimal Precision</Label>
              <Select 
                value={settings.decimalPrecision.toString()} 
                onValueChange={(value) => handleSettingsChange({ decimalPrecision: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 decimals</SelectItem>
                  <SelectItem value="1">1 decimal</SelectItem>
                  <SelectItem value="2">2 decimals</SelectItem>
                  <SelectItem value="3">3 decimals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Invoice Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Invoice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                value={settings.invoicePrefix}
                onChange={(e) => handleSettingsChange({ invoicePrefix: e.target.value })}
                placeholder="INV-"
              />
            </div>
            <div>
              <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
              <Input
                id="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.defaultTaxRate}
                onChange={(e) => handleSettingsChange({ defaultTaxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultDiscountMode">Default Discount Mode</Label>
              <Select 
                value={settings.defaultDiscountMode} 
                onValueChange={(value: any) => handleSettingsChange({ defaultDiscountMode: value })}
              >
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
              <Label htmlFor="printLayout">Print Layout</Label>
              <Select 
                value={settings.printLayout} 
                onValueChange={(value: any) => handleSettingsChange({ printLayout: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Management */}
        <div className="space-y-4">
          <h3 className="font-semibold">Data Management</h3>
          <div className="flex gap-4">
            <Button onClick={exportData} variant="outline" className="gap-2">
              <DownloadIcon className="w-4 h-4" />
              Export Data
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" className="gap-2" asChild>
                <span>
                  <UploadIcon className="w-4 h-4" />
                  Import Data
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={onClose}>Close Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
