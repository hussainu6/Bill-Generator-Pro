import { Invoice, ProductCatalogItem, AppSettings } from '@/types/invoice';

const INVOICES_KEY = 'bill_generator_invoices';
const PRODUCTS_KEY = 'bill_generator_products';
const SETTINGS_KEY = 'bill_generator_settings';

export const generateInvoiceId = (): string => {
  const settings = loadSettings();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${settings.invoicePrefix}${timestamp}-${random}`;
};

export const loadInvoices = (): Invoice[] => {
  try {
    const data = localStorage.getItem(INVOICES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
};

export const saveInvoice = (invoice: Invoice): void => {
  try {
    const invoices = loadInvoices();
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    
    const updatedInvoice = {
      ...invoice,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      invoices[existingIndex] = updatedInvoice;
    } else {
      updatedInvoice.createdAt = new Date().toISOString();
      invoices.push(updatedInvoice);
    }

    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw new Error('Failed to save invoice');
  }
};

export const deleteInvoice = (id: string): void => {
  try {
    const invoices = loadInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to delete invoice');
  }
};

export const duplicateInvoice = (invoice: Invoice): Invoice => {
  return {
    ...invoice,
    id: generateInvoiceId(),
    date: new Date().toISOString().split('T')[0],
    status: 'draft' as const,
    createdAt: undefined,
    updatedAt: undefined
  };
};

export const loadProductCatalog = (): ProductCatalogItem[] => {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading product catalog:', error);
    return [];
  }
};

export const saveProductCatalog = (products: ProductCatalogItem[]): void => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving product catalog:', error);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      currencySymbol: '$',
      decimalPrecision: 2,
      invoicePrefix: 'INV-',
      defaultTaxRate: 0,
      defaultDiscountMode: 'percentage',
      printLayout: 'modern',
      theme: 'system',
      qrCodeSettings: {
        enabled: false,
        data: 'invoice-id',
        size: 128,
        position: 'bottom-right'
      },
      lowStockWarnings: true,
      autoDeductInventory: false
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      currencySymbol: '$',
      decimalPrecision: 2,
      invoicePrefix: 'INV-',
      defaultTaxRate: 0,
      defaultDiscountMode: 'percentage',
      printLayout: 'modern',
      theme: 'system',
      qrCodeSettings: {
        enabled: false,
        data: 'invoice-id',
        size: 128,
        position: 'bottom-right'
      },
      lowStockWarnings: true,
      autoDeductInventory: false
    };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const checkStockAvailability = (productId: string, requestedQuantity: number): boolean => {
  const products = loadProductCatalog();
  const product = products.find(p => p.id === productId);
  
  if (!product || product.stockQuantity === undefined) return false;
  return product.stockQuantity < requestedQuantity;
};

export const updateProductStock = (productId: string, quantityUsed: number): void => {
  const products = loadProductCatalog();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex >= 0 && products[productIndex].stockQuantity !== undefined) {
    products[productIndex].stockQuantity = Math.max(0, products[productIndex].stockQuantity! - quantityUsed);
    saveProductCatalog(products);
  }
};

export const calculateLineItemTotal = (item: any): number => {
  const baseTotal = item.quantity * item.price;
  if (item.discountType === 'percentage') {
    return baseTotal - (baseTotal * item.discount / 100);
  } else {
    return Math.max(0, baseTotal - item.discount);
  }
};

export const calculateInvoiceTotals = (invoice: Invoice): Invoice => {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);
  
  let discountAmount = 0;
  if (invoice.discountType === 'percentage') {
    discountAmount = subtotal * invoice.discountValue / 100;
  } else {
    discountAmount = invoice.discountValue;
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * invoice.taxRate / 100;
  const total = taxableAmount + taxAmount + invoice.shippingAmount;

  const amountPaid = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const balanceRemaining = Math.max(0, total - amountPaid);

  return {
    ...invoice,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    amountPaid,
    balanceRemaining
  };
};
