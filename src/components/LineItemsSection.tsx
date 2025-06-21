
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, TrashIcon, GripVerticalIcon, PackageIcon } from 'lucide-react';
import { LineItem, ProductCatalogItem, UNIT_TYPES, ITEM_TAGS } from '@/types/invoice';
import { calculateLineItemTotal, checkStockAvailability } from '@/utils/invoiceStorage';
import ProductCatalog from './ProductCatalog';

interface LineItemsSectionProps {
  lineItems: LineItem[];
  currency: string;
  onLineItemsChange: (lineItems: LineItem[]) => void;
  onCurrencyChange: (currency: string) => void;
}

const LineItemsSection: React.FC<LineItemsSectionProps> = ({
  lineItems,
  currency,
  onLineItemsChange,
  onCurrencyChange
}) => {
  const [showCatalog, setShowCatalog] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      price: 0,
      discount: 0,
      discountType: 'percentage',
      total: 0,
      tags: [],
      internalNotes: ''
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const addFromCatalog = (product: ProductCatalogItem) => {
    const stockWarning = checkStockAvailability(product.id, 1);
    
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: product.name,
      description: product.description || '',
      quantity: 1,
      unit: product.unit,
      price: product.price,
      discount: 0,
      discountType: 'percentage',
      total: product.price,
      tags: product.tags || [],
      internalNotes: stockWarning ? 'Warning: Low stock' : ''
    };
    onLineItemsChange([...lineItems, newItem]);
    setShowCatalog(false);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    const updatedItems = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        updatedItem.total = calculateLineItemTotal(updatedItem);
        return updatedItem;
      }
      return item;
    });
    onLineItemsChange(updatedItems);
  };

  const removeLineItem = (id: string) => {
    onLineItemsChange(lineItems.filter(item => item.id !== id));
  };

  const toggleTag = (itemId: string, tag: string) => {
    const item = lineItems.find(i => i.id === itemId);
    if (!item) return;

    const currentTags = item.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    updateLineItem(itemId, { tags: updatedTags });
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = lineItems.findIndex(item => item.id === draggedItem);
    const targetIndex = lineItems.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...lineItems];
    const [draggedItemData] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemData);

    onLineItemsChange(newItems);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      {showCatalog && (
        <ProductCatalog onSelectProduct={addFromCatalog} />
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="currency">Currency:</Label>
                <Select value={currency} onValueChange={onCurrencyChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$</SelectItem>
                    <SelectItem value="€">€</SelectItem>
                    <SelectItem value="£">£</SelectItem>
                    <SelectItem value="₹">₹</SelectItem>
                    <SelectItem value="₿">₿</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowCatalog(!showCatalog)} variant="outline" size="sm" className="gap-2">
                <PackageIcon className="w-4 h-4" />
                Catalog
              </Button>
              <Button onClick={addLineItem} size="sm" className="gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No items added yet. Click "Add Item" or select from "Catalog" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-4 bg-white relative"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVerticalIcon className="w-4 h-4 text-gray-400 cursor-grab" />
                      <span className="font-medium text-sm text-slate-600">Item {index + 1}</span>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => removeLineItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Product/Service Name</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateLineItem(item.id, { name: e.target.value })}
                        placeholder="Enter product or service name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description (Optional)</Label>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                        placeholder="Enter description"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Select 
                        value={item.unit} 
                        onValueChange={(value) => updateLineItem(item.id, { unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_TYPES.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Price ({currency})</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateLineItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Discount Type</Label>
                      <Select 
                        value={item.discountType} 
                        onValueChange={(value: any) => updateLineItem(item.id, { discountType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="flat">{currency}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Discount</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => updateLineItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Total ({currency})</Label>
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ITEM_TAGS.map(tag => (
                          <Badge
                            key={tag}
                            variant={item.tags?.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTag(item.id, tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Internal Notes (Not printed)</Label>
                      <Textarea
                        value={item.internalNotes || ''}
                        onChange={(e) => updateLineItem(item.id, { internalNotes: e.target.value })}
                        placeholder="Add internal notes..."
                        rows={2}
                      />
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

export default LineItemsSection;
