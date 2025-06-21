export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  discountType: 'percentage' | 'flat';
  total: number;
  tags?: string[];
  internalNotes?: string;
  productId?: string; // Link to inventory product
}

export interface Party {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  category?: string;
  stockQuantity?: number;
  tags?: string[];
  minStockLevel?: number; // Low stock warning threshold
  supplier?: string;
  barcode?: string;
  lastRestockedDate?: string;
  costPrice?: number; // For profit calculations
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: string;
  date: string;
  notes?: string;
}

export interface InvoiceTask {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface QRCodeConfig {
  enabled: boolean;
  data: 'invoice-id' | 'payment-link' | 'full-invoice' | 'custom';
  customData?: string;
  size: number;
  position: 'top-right' | 'bottom-right' | 'bottom-center';
}

export interface Invoice {
  id: string;
  date: string;
  dueDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'unpaid' | 'overdue';
  business: Party;
  customer: Party;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  paymentInstructions?: string;
  internalNotes?: string;
  tasks?: InvoiceTask[];
  payments?: PaymentRecord[];
  amountPaid?: number;
  balanceRemaining?: number;
  createdAt?: string;
  updatedAt?: string;
  qrCode?: QRCodeConfig;
  template?: 'modern' | 'classic' | 'minimal' | 'professional' | 'elegant';
}

export interface AppSettings {
  currencySymbol: string;
  decimalPrecision: number;
  invoicePrefix: string;
  defaultTaxRate: number;
  defaultDiscountMode: 'percentage' | 'flat';
  printLayout: 'modern' | 'classic' | 'compact';
  theme: 'light' | 'dark' | 'system';
  qrCodeSettings: QRCodeConfig;
  lowStockWarnings: boolean;
  autoDeductInventory: boolean;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  type: 'stock-in' | 'stock-out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  costPrice?: number;
  reference?: string; // Invoice ID for stock-out
  notes?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  type: 'low-stock' | 'out-of-stock';
  threshold: number;
  currentStock: number;
  date: string;
  acknowledged: boolean;
}

export const UNIT_TYPES = [
  'pcs', 'hours', 'kg', 'liters', 'meters', 'boxes', 'sets', 'units', 'days', 'months', 'yards', 'feet', 'dozen'
];

export const PAYMENT_METHODS = [
  'Cash', 'Bank Transfer', 'Credit Card', 'UPI', 'PayPal', 'Stripe', 'Check', 'Other'
];

export const ITEM_TAGS = [
  'urgent', 'returnable', 'fragile', 'custom', 'bulk', 'promotional', 'seasonal', 'digital', 'service'
];

export const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing', 'Food & Beverage', 'Health & Beauty', 'Home & Garden', 'Books', 'Sports', 'Tools', 'Services', 'Other'
];

export const INVOICE_TEMPLATES = [
  'modern', 'classic', 'minimal', 'professional', 'elegant'
];
