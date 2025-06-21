
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Invoice, INVOICE_TEMPLATES } from '@/types/invoice';

interface InvoiceTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const templateDescriptions = {
  modern: 'Clean design with bold headers and modern typography',
  classic: 'Traditional invoice layout with professional styling',
  minimal: 'Simple, clean design with minimal visual elements',
  professional: 'Corporate-style layout with structured sections',
  elegant: 'Sophisticated design with refined typography'
};

const InvoiceTemplateSelector: React.FC<InvoiceTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Template</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedTemplate} onValueChange={onTemplateChange}>
          {INVOICE_TEMPLATES.map((template) => (
            <div key={template} className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value={template} id={template} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={template} className="font-medium capitalize cursor-pointer">
                  {template}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {templateDescriptions[template as keyof typeof templateDescriptions]}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default InvoiceTemplateSelector;
