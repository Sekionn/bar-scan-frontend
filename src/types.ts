export type AuthCapabilities = {
  canUseWebData: boolean;
  canViewShops: boolean;
  canManageShops: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
  canAccessSuperUserPassword: boolean;
  canAssignShopAndRole: boolean;
};

export type UserRoleOption = {
  value: string;
  label: string;
  requiresShop: boolean;
};

export type AuthSession = {
  token: string;
  username: string;
  userId: string;
  companyId: string;
  shopId?: string;
  expiresAt: number;
  capabilities: AuthCapabilities;
  assignableRoles: UserRoleOption[];
};

export type SignupStatus = {
  signupId: string;
  paymentSessionId: string;
  paymentUrl: string;
  paymentStatus: 'PAYMENT_PENDING' | 'PAID';
  onboardingStatus: 'PENDING' | 'COMPLETED';
};

export type ContactSignupResponse = {
  signupId?: string;
  companyId?: string;
  adminUserId?: string;
  username: string;
  contactStatus: 'CONTACT_REQUESTED' | 'CREATED';
  message?: string;
};

export type CreatedUser = {
  id: string;
  username: string;
  companyId: string;
  shopId?: string;
  roleLabel: string;
};

export type Shop = {
  id: string;
  name: string;
  companyId?: string;
};

export type ProductArchiveDate = {
  date: string;
  productCount: number;
};

export type ProductArchiveQuarter = {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  productCount: number;
  dates: ProductArchiveDate[];
};

export type ProductArchiveYear = {
  year: number;
  productCount: number;
  quarters: ProductArchiveQuarter[];
};

export type ProductArchiveShop = {
  shopId: string;
  shopName: string;
  productCount: number;
  years: ProductArchiveYear[];
};

export type ProductArchive = {
  shops: ProductArchiveShop[];
};

export type QueueStatus = {
  companyId: string;
  shopId: string;
  pendingMessages: number;
  processedMessages: number;
  pendingPercentage: number;
  upToDate: boolean;
};

export type ProductArchiveItem = {
  shopId: string;
  shopName: string;
  sessionId: string;
  barcode: string;
  shelfOfOrigin: number;
  storeSegment: string;
  amountCounted: number;
  countedDate: string;
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  date: string;
};

export type ProductArchivePage = {
  products: ProductArchiveItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

