import { Platform } from 'react-native';

// Prioridade: env explícita → web (mesma origem, a API serve o web) →
// nativo (localhost em dev). Mesma origem evita CORS e funciona atrás
// de qualquer túnel/host sem rebuild.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  (Platform.OS === 'web' ? '' : 'http://localhost:3000');

let authToken: string | null = null;
export function setApiToken(token: string | null) {
  authToken = token;
}
export function getApiToken(): string | null {
  return authToken;
}
export const API_BASE_URL = BASE_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Sem conexão com o servidor. Verifique a API.');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error ?? 'Erro na requisição',
      data?.details
    );
  }
  return data as T;
}

// ---- Tipos compartilhados com a API ----

export type NucleoType =
  | 'FULLON'
  | 'PROGRESSIVO'
  | 'DARK_FOREST'
  | 'TECHNO'
  | 'FAROFEIRO'
  | 'MISTICO';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  gender: 'MASCULINE' | 'FEMININE';
  nucleoType: NucleoType | null;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: { accessToken: string; refreshToken: string };
}

export interface OnboardingQuestion {
  id: string;
  text: string;
  options: { id: string; label: string }[];
}

export interface RegisterPayload {
  username: string;
  name: string;
  email: string;
  password: string;
  gender: 'MASCULINE' | 'FEMININE';
  birthDate: string;
  inviteCode?: string;
}

export interface ArvorePerson {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  gender: 'MASCULINE' | 'FEMININE';
}

export interface ArvoreResponse {
  superior: ArvorePerson | null;
  superiorTerm: 'DRÜN' | 'RHÄN';
  thrans: ArvorePerson[];
  thranCount: number;
  message: string | null;
}

export interface InviteResponse {
  code: string;
  link: string;
  message: string;
}

export interface UserSelo {
  id: string;
  earnedAt: string;
  selo: {
    name: string;
    emoji: string;
    description: string | null;
    type: 'EVENT' | 'CONNECTOR' | 'ACHIEVEMENT' | 'SPECIAL';
    imageUrl: string | null;
  };
}

export interface ConfirmSuperiorResponse {
  superior: ArvorePerson;
  superiorTerm: 'DRÜN' | 'RHÄN';
  inviterSelosAwarded: string[];
  message: string;
}

export interface EventListItem {
  id: string;
  name: string;
  date: string;
  endDate: string | null;
  styles: string[];
  coverImageUrl: string | null;
  venue: { name: string; city: string; state: string };
  organizer: string;
  checkinCount: number;
}

export interface EventDetail {
  id: string;
  name: string;
  description: string | null;
  date: string;
  endDate: string | null;
  styles: string[];
  capacity: number | null;
  isPublished: boolean;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  organizer: { companyName: string | null; user: { name: string } };
  lineup: { order: number; startTime: string | null; dj: { artistName: string } }[];
  tickets: { id: string; name: string; price: number; quantity: number; sold: number }[];
  _count: { checkins: number };
}

export interface CheckinResult {
  alreadyCheckedIn: boolean;
  checkedInAt: string;
  event: { id: string; name: string };
  eventSelo: { name: string; emoji: string } | null;
  superiorLinked: {
    superior: ArvorePerson;
    superiorTerm: 'DRÜN' | 'RHÄN';
    inviterSelosAwarded: string[];
  } | null;
}

export interface PurchaseResult {
  paymentId: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  method: 'PIX' | 'CARD';
  amount: number;
  provider: 'STRIPE' | 'SANDBOX';
  clientSecret: string | null;
  event: { id: string; name: string };
  ticketType: { id: string; name: string };
  pix: { code: string; qrString: string; expiresInSec: number } | null;
}

export interface MyTicket {
  id: string;
  qrCode: string;
  status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED';
  purchasedAt: string;
  checkedInAt: string | null;
  ticketType: {
    name: string;
    price: number;
    event: {
      id: string;
      name: string;
      date: string;
      venue: { name: string; city: string; state: string };
    };
  };
  promoter: { id: string; user: { name: string } } | null;
}

export type TicketCheckinResult = CheckinResult & {
  alreadyUsed: boolean;
  ticketId: string;
};

export interface NfcPerson {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  nucleoType: NucleoType | null;
}

export interface NfcConnection {
  id: string;
  otherUser: NfcPerson | null;
  role: 'INITIATED' | 'RECEIVED';
  state: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  connectedAt: string;
  canRegretUntil: string | null;
}

export type ProductCategory =
  | 'TICKET'
  | 'CLOTHING'
  | 'ACCESSORY'
  | 'EQUIPMENT'
  | 'OTHER';

export interface StoreProduct {
  id: string;
  sellerId: string;
  eventId: string | null;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  stock: number;
  category: ProductCategory;
  isActive: boolean;
  seller: { id: string; username: string; name: string } | null;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface StoreOrder {
  id: string;
  buyerId: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  commission: number;
  sellerPayout: number;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; images: string[]; eventId: string | null };
  }[];
  seller?: { name: string } | null;
  buyer?: { name: string } | null;
  role?: 'BUYER' | 'SELLER';
}

export interface CreateOrderResult {
  order: StoreOrder;
  payment: { paymentId: string; amount: number; method: string; status: string };
  commission: number;
  sellerPayout: number;
  sellerId: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: ProductCategory;
}

export type NotificationType =
  | 'THRAN'
  | 'SELO'
  | 'NFC'
  | 'ORDER'
  | 'EVENT'
  | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ReviewAggregate {
  average: number;
  count: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface EventReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { name: string } | null;
}

export interface EventReviews {
  organizerUserId: string;
  aggregate: ReviewAggregate;
  reviews: EventReview[];
}

export interface EventPhoto {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
  photographer: string;
  taggedPeople: string[];
}

export type PhotoTagStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TaggedPhoto {
  tagId: string;
  status: PhotoTagStatus;
  photo: {
    id: string;
    imageUrl: string;
    thumbnailUrl: string | null;
    createdAt: string;
    eventName: string;
  };
}

export interface DJListItem {
  id: string;
  artistName: string;
  style: string[];
  bpm: number | null;
  country: string | null;
  rankScore: number;
  position: number;
  user: { name: string; username: string };
  followerCount: number;
  lineupCount: number;
  isFollowing: boolean;
}

export interface DJProfile {
  id: string;
  artistName: string;
  bio: string | null;
  style: string[];
  bpm: number | null;
  country: string | null;
  rankScore: number;
  user: { name: string; username: string };
  followerCount: number;
  isFollowing: boolean;
  lineup: {
    order: number;
    startTime: string | null;
    event: { id: string; name: string; date: string };
  }[];
  tipCount: number;
  tipNetTotal: number;
  reviewCount: number;
  reviewAverage: number;
}

export interface MyDJ {
  id: string;
  artistName: string;
  bio: string | null;
  style: string[];
  bpm: number | null;
  country: string | null;
}

export interface CreateDJPayload {
  artistName: string;
  bio?: string;
  style: string[];
  bpm?: number;
  country?: string;
}

export interface TipSent {
  id: string;
  amount: number;
  netAmount: number;
  status: 'PENDING' | 'PAID';
  message: string | null;
  createdAt: string;
  djName: string;
}

export interface TipReceived {
  id: string;
  amount: number;
  netAmount: number;
  status: 'PENDING' | 'PAID';
  message: string | null;
  createdAt: string;
  fromName: string;
}

export interface SendTipResult {
  tip: { id: string; status: string };
  payment: { paymentId: string; amount: number; method: string; status: string };
  commission: number;
  netAmount: number;
  artistName: string;
}

export type LedgerType = 'SALE' | 'TIP' | 'TICKET' | 'WITHDRAWAL';

export interface WalletEntry {
  id: string;
  type: LedgerType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface WalletData {
  available: number;
  totalEarned: number;
  totalWithdrawn: number;
  entries: WalletEntry[];
}

export type TimelineType =
  | 'CHECKIN'
  | 'SELO'
  | 'NFC'
  | 'TIP_SENT'
  | 'TIP_RECEIVED'
  | 'ORDER'
  | 'PHOTO';

export interface TimelineItem {
  id: string;
  type: TimelineType;
  icon: string;
  title: string;
  subtitle?: string;
  at: string;
}

export interface SearchResults {
  query: string;
  events: { id: string; name: string; date: string; city: string; state: string }[];
  djs: { id: string; artistName: string; style: string[]; rankScore: number }[];
  products: { id: string; name: string; price: number }[];
}

export type JobRole =
  | 'DJ'
  | 'PHOTOGRAPHER'
  | 'VIDEOGRAPHER'
  | 'SOUND_TECH'
  | 'LIGHT_TECH'
  | 'BARTENDER'
  | 'SECURITY'
  | 'STRUCTURE'
  | 'FREELANCER';

export type JobStatus = 'OPEN' | 'FILLED' | 'CLOSED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface JobListItem {
  id: string;
  role: JobRole;
  title: string;
  budget: number | null;
  event: { id: string; name: string; date: string };
  applicationCount: number;
}

export interface JobDetail {
  id: string;
  role: JobRole;
  title: string;
  description: string | null;
  budget: number | null;
  status: JobStatus;
  event: { id: string; name: string };
  isOrganizer: boolean;
  hiredUserId: string | null;
  applications?: {
    id: string;
    userId: string;
    applicant: { name: string; username: string };
    message: string | null;
    status: ApplicationStatus;
  }[];
  myApplicationStatus?: ApplicationStatus | null;
}

// ---- Endpoints ----

export const api = {
  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: payload }),

  login: (identifier: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    }),

  getQuestions: () =>
    request<{ total: number; questions: OnboardingQuestion[] }>(
      '/onboarding/questions'
    ),

  completeOnboarding: (answers: { questionId: string; optionId: string }[]) =>
    request<{ nucleoType: NucleoType; scores: Record<string, number> }>(
      '/onboarding/complete',
      { method: 'POST', body: { answers }, auth: true }
    ),

  me: () => request<AuthUser & { onboarding: unknown }>('/users/me', { auth: true }),

  createInvite: () =>
    request<InviteResponse>('/users/me/invite', { method: 'POST', auth: true }),

  getArvore: () => request<ArvoreResponse>('/users/me/arvore', { auth: true }),

  confirmSuperior: (inviteCode: string) =>
    request<ConfirmSuperiorResponse>('/arvore/confirm-superior', {
      method: 'POST',
      body: { inviteCode },
      auth: true,
    }),

  getSelos: () =>
    request<{ total: number; selos: UserSelo[] }>('/selos/mine', { auth: true }),

  listEvents: (scope: 'upcoming' | 'past' | 'all' = 'upcoming') =>
    request<{ events: EventListItem[] }>(`/events?scope=${scope}`),

  getEvent: (id: string) => request<EventDetail>(`/events/${id}`),

  getEventCheckins: (id: string) =>
    request<{
      eventId: string;
      total: number;
      checkins: {
        checkedAt: string;
        user: {
          id: string;
          username: string;
          name: string;
          avatarUrl: string | null;
          nucleoType: NucleoType | null;
        };
      }[];
    }>(`/events/${id}/checkins`),

  checkin: (id: string) =>
    request<CheckinResult>(`/events/${id}/checkin`, { method: 'POST', auth: true }),

  purchase: (
    ticketTypeId: string,
    quantity: number,
    method: 'PIX' | 'CARD',
    promoterCode?: string
  ) =>
    request<PurchaseResult>('/tickets/purchase', {
      method: 'POST',
      body: { ticketTypeId, quantity, method, promoterCode },
      auth: true,
    }),

  confirmPayment: (paymentId: string) =>
    request<{
      status: string;
      alreadyConfirmed: boolean;
      tickets: { id: string; qrCode: string; status: string }[];
    }>('/payments/confirm', { method: 'POST', body: { paymentId }, auth: true }),

  myTickets: () =>
    request<{ total: number; tickets: MyTicket[] }>('/tickets/mine', { auth: true }),

  ticketCheckin: (qrCode: string) =>
    request<TicketCheckinResult>('/tickets/checkin', {
      method: 'POST',
      body: { qrCode },
      auth: true,
    }),

  nfcToken: () =>
    request<{ token: string; expiresInSec: number }>('/nfc/token', {
      method: 'POST',
      auth: true,
    }),

  nfcConnect: (token: string) =>
    request<{ connection: NfcConnection; seloAwarded: boolean }>('/nfc/connect', {
      method: 'POST',
      body: { token },
      auth: true,
    }),

  nfcConnections: () =>
    request<{ total: number; connections: NfcConnection[] }>('/nfc/connections', {
      auth: true,
    }),

  nfcAccept: (id: string) =>
    request<NfcConnection>(`/nfc/accept/${id}`, { method: 'POST', auth: true }),

  nfcReject: (id: string) =>
    request<{ id: string; state: 'REJECTED' }>(`/nfc/reject/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  storeProducts: (category?: ProductCategory) =>
    request<{ products: StoreProduct[] }>(
      `/store/products${category ? `?category=${category}` : ''}`
    ),

  storeProduct: (id: string) => request<StoreProduct>(`/store/products/${id}`),

  createStoreProduct: (payload: CreateProductPayload) =>
    request<StoreProduct>('/store/products', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  createStoreOrder: (items: { productId: string; quantity: number }[]) =>
    request<CreateOrderResult>('/store/orders', {
      method: 'POST',
      body: { items },
      auth: true,
    }),

  myStoreOrders: () =>
    request<{ orders: StoreOrder[] }>('/store/orders', { auth: true }),

  myStoreSales: () =>
    request<{ orders: StoreOrder[] }>('/store/orders/sales', { auth: true }),

  payStoreOrder: (id: string) =>
    request<{ orderId: string; status: string; escrow: string }>(
      `/store/orders/${id}/pay`,
      { method: 'POST', auth: true }
    ),

  confirmStoreOrder: (id: string) =>
    request<{ orderId: string; status: string; sellerPayout: number; commission: number }>(
      `/store/orders/${id}/confirm`,
      { method: 'POST', auth: true }
    ),

  disputeStoreOrder: (id: string) =>
    request<{ orderId: string; status: string; note: string }>(
      `/store/orders/${id}/dispute`,
      { method: 'POST', auth: true }
    ),

  notifications: (unreadOnly = false) =>
    request<{
      unreadCount: number;
      total: number;
      notifications: AppNotification[];
    }>(`/notifications${unreadOnly ? '?unread=true' : ''}`, { auth: true }),

  markNotificationRead: (id: string) =>
    request<{ id: string; read: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
      auth: true,
    }),

  markAllNotificationsRead: () =>
    request<{ updated: number }>('/notifications/read-all', {
      method: 'POST',
      auth: true,
    }),

  eventReviews: (eventId: string) =>
    request<EventReviews>(`/events/${eventId}/reviews`),

  reviewOrganizer: (
    eventId: string,
    payload: { rating: number; comment?: string; anonymous: boolean }
  ) =>
    request<{ review: { id: string; rating: number }; aggregate: ReviewAggregate }>(
      `/events/${eventId}/review`,
      { method: 'POST', body: payload, auth: true }
    ),

  reviewDJ: (
    djId: string,
    payload: { rating: number; comment?: string; anonymous: boolean }
  ) =>
    request<{ review: { id: string; rating: number }; aggregate: ReviewAggregate }>(
      `/djs/${djId}/review`,
      { method: 'POST', body: payload, auth: true }
    ),

  djReviews: (djId: string) =>
    request<{ aggregate: ReviewAggregate; reviews: EventReview[] }>(
      `/djs/${djId}/reviews`
    ),

  reviewPhotographer: (
    photoId: string,
    payload: { rating: number; comment?: string; anonymous: boolean }
  ) =>
    request<{ review: { id: string; rating: number }; aggregate: ReviewAggregate }>(
      `/photos/${photoId}/review`,
      { method: 'POST', body: payload, auth: true }
    ),

  photographerReviews: (photoId: string) =>
    request<{
      photographer: { name: string };
      aggregate: ReviewAggregate;
      reviews: EventReview[];
    }>(`/photos/${photoId}/reviews`),

  enrollPromoter: (
    eventId: string,
    payload: { username: string; commission?: number }
  ) =>
    request<{ promoterId: string; code: string }>(
      `/events/${eventId}/promoters`,
      { method: 'POST', body: payload, auth: true }
    ),

  myPromoter: () =>
    request<{
      isPromoter: boolean;
      totalSales: number;
      code: string | null;
      events: {
        eventId: string;
        eventName: string;
        date: string;
        commission: number;
      }[];
    }>('/promoters/me', { auth: true }),

  reviewPromoter: (
    promoterId: string,
    payload: { rating: number; comment?: string; anonymous: boolean }
  ) =>
    request<{ review: { id: string; rating: number }; aggregate: ReviewAggregate }>(
      `/promoters/${promoterId}/review`,
      { method: 'POST', body: payload, auth: true }
    ),

  eventPhotos: (eventId: string) =>
    request<{ photos: EventPhoto[] }>(`/events/${eventId}/photos`),

  uploadPhoto: (
    eventId: string,
    payload: { imageUrl: string; isPublic: boolean; tagUserIds?: string[] }
  ) =>
    request<{ photo: { id: string }; taggedCount: number }>(
      `/events/${eventId}/photos`,
      { method: 'POST', body: payload, auth: true }
    ),

  taggedPhotos: () =>
    request<{ total: number; tags: TaggedPhoto[] }>('/photos/tagged', {
      auth: true,
    }),

  approvePhotoTag: (id: string) =>
    request<{ tagId: string; status: PhotoTagStatus }>(
      `/photos/tags/${id}/approve`,
      { method: 'POST', auth: true }
    ),

  rejectPhotoTag: (id: string) =>
    request<{ tagId: string; status: PhotoTagStatus }>(
      `/photos/tags/${id}/reject`,
      { method: 'POST', auth: true }
    ),

  djs: (q?: string) =>
    request<{ djs: DJListItem[] }>(
      `/djs${q ? `?q=${encodeURIComponent(q)}` : ''}`,
      { auth: true }
    ),

  dj: (id: string) => request<DJProfile>(`/djs/${id}`, { auth: true }),

  myDJ: () => request<{ dj: MyDJ | null }>('/djs/me', { auth: true }),

  becomeDJ: (payload: CreateDJPayload) =>
    request<{ id: string }>('/djs', { method: 'POST', body: payload, auth: true }),

  followDJ: (id: string) =>
    request<{ djId: string; following: boolean; rankScore: number }>(
      `/djs/${id}/follow`,
      { method: 'POST', auth: true }
    ),

  unfollowDJ: (id: string) =>
    request<{ djId: string; following: boolean; rankScore: number }>(
      `/djs/${id}/follow`,
      { method: 'DELETE', auth: true }
    ),

  addLineup: (
    eventId: string,
    payload: { djId: string; order: number; startTime?: string }
  ) =>
    request<{ id: string }>(`/events/${eventId}/lineup`, {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  sendTip: (
    djId: string,
    payload: { amount: number; message?: string; eventId?: string }
  ) =>
    request<SendTipResult>(`/djs/${djId}/tip`, {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  payTip: (id: string) =>
    request<{ tipId: string; status: string; netAmount: number }>(
      `/tips/${id}/pay`,
      { method: 'POST', auth: true }
    ),

  myTips: () =>
    request<{ sent: TipSent[]; received: TipReceived[] }>('/tips/mine', {
      auth: true,
    }),

  wallet: () => request<WalletData>('/wallet', { auth: true }),

  withdraw: (amount: number) =>
    request<{ withdrawalId: string; amount: number; available: number }>(
      '/wallet/withdraw',
      { method: 'POST', body: { amount }, auth: true }
    ),

  timeline: () =>
    request<{ total: number; items: TimelineItem[] }>('/timeline', {
      auth: true,
    }),

  search: (q: string) =>
    request<SearchResults>(`/search?q=${encodeURIComponent(q)}`),

  openJobs: () => request<{ jobs: JobListItem[] }>('/jobs/open', { auth: true }),

  eventJobs: (eventId: string) =>
    request<{
      jobs: {
        id: string;
        role: JobRole;
        title: string;
        budget: number | null;
        status: JobStatus;
        applicationCount: number;
      }[];
    }>(`/events/${eventId}/jobs`),

  job: (jobId: string) =>
    request<JobDetail>(`/jobs/${jobId}`, { auth: true }),

  postJob: (
    eventId: string,
    payload: {
      role: JobRole;
      title: string;
      description?: string;
      budget?: number;
    }
  ) =>
    request<{ id: string }>(`/events/${eventId}/jobs`, {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  applyJob: (jobId: string, message?: string) =>
    request<{ id: string }>(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: { message },
      auth: true,
    }),

  acceptApplication: (applicationId: string) =>
    request<{ jobId: string; hiredUserId: string; status: string }>(
      `/jobs/applications/${applicationId}/accept`,
      { method: 'POST', auth: true }
    ),

  reviewFreelancer: (
    jobId: string,
    payload: { rating: number; comment?: string; anonymous: boolean }
  ) =>
    request<{ review: { id: string; rating: number }; aggregate: ReviewAggregate }>(
      `/jobs/${jobId}/review`,
      { method: 'POST', body: payload, auth: true }
    ),
};
