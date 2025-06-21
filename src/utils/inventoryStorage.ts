
import { InventoryTransaction, StockAlert, ProductCatalogItem } from '@/types/invoice';

const INVENTORY_TRANSACTIONS_KEY = 'bill_generator_inventory_transactions';
const STOCK_ALERTS_KEY = 'bill_generator_stock_alerts';
const PRODUCTS_KEY = 'bill_generator_products';

export const loadInventoryTransactions = (): InventoryTransaction[] => {
  try {
    const data = localStorage.getItem(INVENTORY_TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading inventory transactions:', error);
    return [];
  }
};

export const saveInventoryTransactions = (transactions: InventoryTransaction[]): void => {
  try {
    localStorage.setItem(INVENTORY_TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving inventory transactions:', error);
  }
};

export const loadStockAlerts = (): StockAlert[] => {
  try {
    const data = localStorage.getItem(STOCK_ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading stock alerts:', error);
    return [];
  }
};

export const saveStockAlerts = (alerts: StockAlert[]): void => {
  try {
    localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Error saving stock alerts:', error);
  }
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

export const getProductTransactions = (productId: string): InventoryTransaction[] => {
  const transactions = loadInventoryTransactions();
  return transactions.filter(t => t.productId === productId);
};

export const getStockMovementSummary = (productId: string) => {
  const transactions = getProductTransactions(productId);
  const stockIn = transactions
    .filter(t => t.type === 'stock-in')
    .reduce((sum, t) => sum + t.quantity, 0);
  const stockOut = transactions
    .filter(t => t.type === 'stock-out')
    .reduce((sum, t) => sum + t.quantity, 0);
  const adjustments = transactions
    .filter(t => t.type === 'adjustment')
    .reduce((sum, t) => sum + t.quantity, 0);

  return { stockIn, stockOut, adjustments, totalMovement: stockIn - stockOut + adjustments };
};
