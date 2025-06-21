
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { ProductCatalogItem, UNIT_TYPES, ITEM_TAGS } from '@/types/invoice';
import { loadProductCatalog, saveProductCatalog } from '@/utils/invoiceStorage';

interface ProductCatalogProps {
  onSelectProduct: (product: ProductCatalogItem) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onSelectProduct }) => {
  const [products, setProducts] = useState<ProductCatalogItem[]>(loadProductCatalog());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductCatalogItem>>({
    name: '',
    description: '',
    price: 0,
    unit: 'pcs',
    stockQuantity: 0,
    tags: []
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!newProduct.name) return;

    const product: ProductCatalogItem = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description || '',
      price: newProduct.price || 0,
      unit: newProduct.unit || 'pcs',
      stockQuantity: newProduct.stockQuantity || 0,
      tags: newProduct.tags || []
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    saveProductCatalog(updatedProducts);
    setNewProduct({ name: '', description: '', price: 0, unit: 'pcs', stockQuantity: 0, tags: [] });
    setShowAddForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveProductCatalog(updatedProducts);
  };

  const toggleTag = (tag: string) => {
    const currentTags = newProduct.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setNewProduct({ ...newProduct, tags: updatedTags });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Product Catalog</CardTitle>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {showAddForm && (
          <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
            <h4 className="font-medium">Add New Product</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={newProduct.name || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newProduct.price || 0}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select
                  value={newProduct.unit || 'pcs'}
                  onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
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
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={newProduct.stockQuantity || 0}
                  onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {ITEM_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={newProduct.tags?.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProduct} size="sm">Save Product</Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredProducts.map(product => (
            <div key={product.id} className="border rounded-lg p-3 flex items-center justify-between hover:bg-slate-50">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectProduct(product)}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="outline">{product.unit}</Badge>
                  {product.stockQuantity !== undefined && (
                    <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                      Stock: {product.stockQuantity}
                    </Badge>
                  )}
                </div>
                {product.description && (
                  <p className="text-sm text-gray-600">{product.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium">${product.price.toFixed(2)}</span>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex gap-1">
                      {product.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleDeleteProduct(product.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No products found. Add some products to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCatalog;
