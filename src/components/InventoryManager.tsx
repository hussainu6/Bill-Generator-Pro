
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  PlusIcon, 
  SearchIcon, 
  AlertTriangleIcon, 
  PackageIcon, 
  TrendingUpIcon, 
  HistoryIcon,
  ScanIcon,
  FilterIcon
} from 'lucide-react';
import { ProductCatalogItem, InventoryTransaction, StockAlert, UNIT_TYPES, PRODUCT_CATEGORIES } from '@/types/invoice';
import { 
  loadProductCatalog, 
  saveProductCatalog, 
  loadInventoryTransactions, 
  saveInventoryTransactions,
  loadStockAlerts,
  saveStockAlerts
} from '@/utils/inventoryStorage';
import { useToast } from '@/hooks/use-toast';

const InventoryManager: React.FC = () => {
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockIn, setShowStockIn] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogItem | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState<Partial<ProductCatalogItem>>({
    name: '',
    description: '',
    price: 0,
    costPrice: 0,
    unit: 'pcs',
    category: '',
    stockQuantity: 0,
    minStockLevel: 10,
    supplier: '',
    barcode: ''
  });

  const [stockTransaction, setStockTransaction] = useState({
    type: 'stock-in' as 'stock-in' | 'stock-out' | 'adjustment',
    quantity: 0,
    reason: '',
    costPrice: 0,
    notes: ''
  });

  useEffect(() => {
    setProducts(loadProductCatalog());
    setTransactions(loadInventoryTransactions());
    setAlerts(loadStockAlerts());
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStock = !stockFilter || 
                        (stockFilter === 'low' && (product.stockQuantity || 0) <= (product.minStockLevel || 0)) ||
                        (stockFilter === 'out' && (product.stockQuantity || 0) === 0) ||
                        (stockFilter === 'available' && (product.stockQuantity || 0) > 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const addProduct = () => {
    if (!newProduct.name) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    const product: ProductCatalogItem = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description || '',
      price: newProduct.price || 0,
      costPrice: newProduct.costPrice || 0,
      unit: newProduct.unit || 'pcs',
      category: newProduct.category || 'Other',
      stockQuantity: newProduct.stockQuantity || 0,
      minStockLevel: newProduct.minStockLevel || 10,
      supplier: newProduct.supplier || '',
      barcode: newProduct.barcode || '',
      lastRestockedDate: new Date().toISOString()
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    saveProductCatalog(updatedProducts);
    
    // Create initial stock transaction if quantity > 0
    if (product.stockQuantity! > 0) {
      addTransaction(product.id, 'stock-in', product.stockQuantity!, 'Initial stock', product.costPrice);
    }

    setNewProduct({
      name: '', description: '', price: 0, costPrice: 0, unit: 'pcs', 
      category: '', stockQuantity: 0, minStockLevel: 10, supplier: '', barcode: ''
    });
    setShowAddProduct(false);
    
    toast({
      title: "Success",
      description: `Product "${product.name}" added successfully`
    });
  };

  const addTransaction = (productId: string, type: 'stock-in' | 'stock-out' | 'adjustment', quantity: number, reason: string, costPrice?: number) => {
    const transaction: InventoryTransaction = {
      id: Date.now().toString(),
      productId,
      type,
      quantity,
      reason,
      date: new Date().toISOString(),
      costPrice,
      notes: stockTransaction.notes
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    saveInventoryTransactions(updatedTransactions);

    // Update product stock
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        const newStock = type === 'stock-out' 
          ? Math.max(0, (product.stockQuantity || 0) - quantity)
          : (product.stockQuantity || 0) + quantity;
        
        return {
          ...product,
          stockQuantity: newStock,
          lastRestockedDate: type === 'stock-in' ? new Date().toISOString() : product.lastRestockedDate
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    saveProductCatalog(updatedProducts);
    checkStockAlerts(updatedProducts);
  };

  const checkStockAlerts = (updatedProducts: ProductCatalogItem[]) => {
    const newAlerts: StockAlert[] = [];
    
    updatedProducts.forEach(product => {
      const stock = product.stockQuantity || 0;
      const minLevel = product.minStockLevel || 0;
      
      if (stock === 0) {
        newAlerts.push({
          id: `${product.id}-out-of-stock`,
          productId: product.id,
          type: 'out-of-stock',
          threshold: 0,
          currentStock: stock,
          date: new Date().toISOString(),
          acknowledged: false
        });
      } else if (stock <= minLevel) {
        newAlerts.push({
          id: `${product.id}-low-stock`,
          productId: product.id,
          type: 'low-stock',
          threshold: minLevel,
          currentStock: stock,
          date: new Date().toISOString(),
          acknowledged: false
        });
      }
    });

    setAlerts(newAlerts);
    saveStockAlerts(newAlerts);
  };

  const handleStockTransaction = () => {
    if (!selectedProduct || stockTransaction.quantity <= 0) return;

    addTransaction(
      selectedProduct.id,
      stockTransaction.type,
      stockTransaction.quantity,
      stockTransaction.reason,
      stockTransaction.costPrice
    );

    setStockTransaction({
      type: 'stock-in',
      quantity: 0,
      reason: '',
      costPrice: 0,
      notes: ''
    });
    setSelectedProduct(null);
    setShowStockIn(false);

    toast({
      title: "Success",
      description: `Stock ${stockTransaction.type} recorded successfully`
    });
  };

  const getStockStatus = (product: ProductCatalogItem) => {
    const stock = product.stockQuantity || 0;
    const minLevel = product.minStockLevel || 0;
    
    if (stock === 0) return { status: 'Out of Stock', color: 'destructive' };
    if (stock <= minLevel) return { status: 'Low Stock', color: 'secondary' };
    return { status: 'In Stock', color: 'default' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddProduct(true)} className="gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Product
          </Button>
          <Button onClick={() => setShowStockIn(true)} variant="outline" className="gap-2">
            <PackageIcon className="w-4 h-4" />
            Stock Transaction
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangleIcon className="w-5 h-5" />
              Stock Alerts ({alerts.filter(alert => !alert.acknowledged).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.filter(alert => !alert.acknowledged).slice(0, 3).map(alert => {
                const product = products.find(p => p.id === alert.productId);
                return (
                  <div key={alert.id} className="flex items-center justify-between text-sm">
                    <span>{product?.name} - {alert.type === 'out-of-stock' ? 'Out of Stock' : `Low Stock (${alert.currentStock} remaining)`}</span>
                    <Button size="sm" variant="outline">Acknowledge</Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Stock Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stock Levels</SelectItem>
                <SelectItem value="available">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product);
              return (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <Badge variant={stockStatus.color as any}>{stockStatus.status}</Badge>
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Price: ${product.price.toFixed(2)}</div>
                      <div>Stock: {product.stockQuantity || 0} {product.unit}</div>
                      <div>Category: {product.category}</div>
                      <div>Min Level: {product.minStockLevel}</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockIn(true);
                        }}
                      >
                        Manage Stock
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="space-y-2">
            {transactions.slice(0, 20).map(transaction => {
              const product = products.find(p => p.id === transaction.productId);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{product?.name}</div>
                    <div className="text-sm text-gray-600">
                      {transaction.type} • {transaction.quantity} {product?.unit} • {transaction.reason}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{new Date(transaction.date).toLocaleDateString()}</div>
                    {transaction.costPrice && (
                      <div className="text-sm text-gray-600">${transaction.costPrice.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Stock Units</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => !a.acknowledged).length}
                </div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={newProduct.name || ''}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newProduct.category || ''}
                    onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Selling Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.price || 0}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Cost Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.costPrice || 0}
                    onChange={(e) => setNewProduct({...newProduct, costPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={newProduct.unit || 'pcs'}
                    onValueChange={(value) => setNewProduct({...newProduct, unit: value})}
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
                  <Label>Initial Stock</Label>
                  <Input
                    type="number"
                    value={newProduct.stockQuantity || 0}
                    onChange={(e) => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Min Stock Level</Label>
                  <Input
                    type="number"
                    value={newProduct.minStockLevel || 10}
                    onChange={(e) => setNewProduct({...newProduct, minStockLevel: parseInt(e.target.value) || 10})}
                  />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={newProduct.supplier || ''}
                    onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProduct.description || ''}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                <Button onClick={addProduct}>Add Product</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stock Transaction Modal */}
      {showStockIn && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Stock Transaction - {selectedProduct.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Transaction Type</Label>
                <Select
                  value={stockTransaction.type}
                  onValueChange={(value: any) => setStockTransaction({...stockTransaction, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock-in">Stock In</SelectItem>
                    <SelectItem value="stock-out">Stock Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={stockTransaction.quantity}
                  onChange={(e) => setStockTransaction({...stockTransaction, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Input
                  value={stockTransaction.reason}
                  onChange={(e) => setStockTransaction({...stockTransaction, reason: e.target.value})}
                  placeholder="Purchase, Sale, Damage, etc."
                />
              </div>
              {stockTransaction.type === 'stock-in' && (
                <div>
                  <Label>Cost Price per Unit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={stockTransaction.costPrice}
                    onChange={(e) => setStockTransaction({...stockTransaction, costPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
              )}
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={stockTransaction.notes}
                  onChange={(e) => setStockTransaction({...stockTransaction, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowStockIn(false)}>Cancel</Button>
                <Button onClick={handleStockTransaction}>Record Transaction</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
