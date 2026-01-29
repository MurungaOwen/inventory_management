export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  supplier?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  currentStock: number;
  reorderThreshold: number;
  lastRestocked?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Mobile Money';
  cashierId: string;
  items: SaleItem[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'SYSTEM' | 'SALE';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'Owner' | 'Manager' | 'Cashier';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
