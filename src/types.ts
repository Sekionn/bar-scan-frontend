export type Role = 'ROLE_SUPER_ADMIN' | 'ROLE_MANAGER' | 'ROLE_ADMIN' | 'ROLE_USER';

export type AuthSession = {
  token: string;
  username: string;
  userId: string;
  companyId: string;
  role: Role;
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

export type Product = {
  companyId: string;
  shopId: string;
  productId: string;
  barcode: string;
  shelfOfOrigin: number;
  storeSegment: string;
  amountCounted: number;
  countedDate: string;
  countedQuarter: string;
};

export type CreatedUser = {
  id: string;
  username: string;
  companyId: string;
  shopId?: string;
  role: Role;
};

export type Shop = {
  id: string;
  name: string;
  companyId?: string;
};
