
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Invoice } from '@/types/invoice';
import PaymentTracking from './PaymentTracking';
import TasksSection from './TasksSection';

interface AdditionalInfoSectionProps {
  invoice: Invoice;
  onInvoiceChange: (invoice: Invoice) => void;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  invoice,
  onInvoiceChange
}) => {
  const handleUpdate = (updates: Partial<Invoice>) => {
    onInvoiceChange({ ...invoice, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Notes & Terms</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="space-y-4">
            <div>
              <Label htmlFor="notes">Public Notes (Printed on invoice)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or terms..."
                value={invoice.notes || ''}
                onChange={(e) => handleUpdate({ notes: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="internalNotes">Internal Notes (Not printed)</Label>
              <Textarea
                id="internalNotes"
                placeholder="Add internal notes..."
                value={invoice.internalNotes || ''}
                onChange={(e) => handleUpdate({ internalNotes: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="Add terms and conditions..."
                value={invoice.terms || ''}
                onChange={(e) => handleUpdate({ terms: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="paymentInstructions">Payment Instructions</Label>
              <Textarea
                id="paymentInstructions"
                placeholder="Add payment instructions..."
                value={invoice.paymentInstructions || ''}
                onChange={(e) => handleUpdate({ paymentInstructions: e.target.value })}
                rows={2}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentTracking
              invoice={invoice}
              onInvoiceChange={onInvoiceChange}
            />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TasksSection
              tasks={invoice.tasks || []}
              onTasksChange={(tasks) => handleUpdate({ tasks })}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdditionalInfoSection;
