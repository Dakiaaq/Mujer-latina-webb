export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type UserRole = 'customer' | 'admin' | 'operator';

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  parentId?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  costPrice?: number;
  stock: number;
  stockThreshold: number;
  brand?: string;
  supplier?: string;
  unitMeasure?: string;
  batchNumber?: string;
  expirationDate?: string;
  storageLocation?: string;
  imageUrl: string;
  galleryUrls: string[];
  description: string;
  specifications?: string;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingData {
  fullName: string;
  phone: string;
  email?: string;
  department: string;
  city: string;
  address: string;
  documentId?: string;
  additionalInfo?: string;
  saveToProfile?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string; // e.g. '#ORD-2026-0842'
  id_usuario?: string | null;
  userId?: string | null;
  customer: string;
  phone: string;
  email?: string;
  city: string;
  department: string;
  address: string;
  additionalInfo?: string;
  documentId?: string;
  date: string;
  time: string;
  createdAt?: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  carrier?: string;
  tracking?: string;
  receiptUrl?: string;
  receiptBank?: string;
  receiptRef?: string;
  receiptVerified?: boolean;
  items: OrderItem[];
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  department: string;
  address?: string;
  avatarUrl?: string;
  ordersCount: number;
  totalSpent: number;
  qualifyingOrdersCount?: number;
  accumulatedCredit?: number;
  createdAt: string;
  status?: 'active' | 'inactive';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status?: 'active' | 'inactive';
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  documentId?: string;
  department?: string;
  city?: string;
  address?: string;
  avatarUrl?: string;
  memberSince: string;
  createdAt?: string;
}

export interface RegisterData {
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  department?: string;
  city?: string;
  address?: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export type ActiveAppView = 
  | 'home' 
  | 'catalog' 
  | 'product_detail' 
  | 'cart' 
  | 'wishlist' 
  | 'about' 
  | 'auth' 
  | 'profile' 
  | 'admin_dashboard' 
  | 'admin_inventory' 
  | 'admin_orders' 
  | 'admin_customers' 
  | 'admin_settings' 
  | 'docs';

export interface AdminBusinessSettings {
  businessName: string;
  businessAddress: string;
  whatsappNumber: string;
  isWhatsappLinked: boolean;
  stockAlerts: boolean;
  newOrdersEmail: boolean;
  customerSupport: boolean;
}

export interface AdminProfileData {
  fullName: string;
  email: string;
  avatarUrl: string;
  role: string;
  phone?: string;
}

export interface StoreSettings {
  storeName: string;
  storeSlogan: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  supportEmail: string;
  supportPhone: string;
  storeAddress: string;
  storeCity: string;
  storeDepartment: string;
  businessHours: string;
  standardShippingFee: number;
  freeShippingThreshold: number;
  bannerEnabled: boolean;
  bannerText: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
}
