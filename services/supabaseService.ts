import { supabase } from '../lib/supabase';
import {
  Service,
  Agent,
  Booking,
  Review,
  BookingStatus,
  VerificationStatus,
  ServiceGalleryItem
} from '../types';

// Helper to check if a URL points to a video
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.toLowerCase().split('?')[0];
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.ogg') || url.includes('/video/') || url.includes('video');
}

// Convert DB status string to UI BookingStatus enum
export function mapBookingStatus(status: string | null | undefined): BookingStatus {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return BookingStatus.CONFIRMED;
    case 'completed':
      return BookingStatus.COMPLETED;
    case 'cancelled':
      return BookingStatus.CANCELLED;
    case 'pending':
    default:
      return BookingStatus.PENDING;
  }
}

// Convert DB verification status string to UI VerificationStatus enum
export function mapVerificationStatus(status: string | null | undefined): VerificationStatus {
  switch (status?.toLowerCase()) {
    case 'verified':
      return VerificationStatus.VERIFIED;
    case 'rejected':
      return VerificationStatus.REJECTED;
    case 'pending':
    default:
      return VerificationStatus.PENDING;
  }
}

// ==========================================
// IN-MEMORY CACHE & CONCURRENCY SYSTEM
// ==========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // ms
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs: number = 90000): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

async function withInFlight<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const promise = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, promise);
  return promise;
}

// ==========================================
// SERVICES API (STRICT PRODUCTION)
// ==========================================

export async function getServices(forceRefresh = false): Promise<{ data: Service[]; error?: string }> {
  const CACHE_KEY = 'services:all';
  if (!forceRefresh) {
    const cached = getCached<Service[]>(CACHE_KEY);
    if (cached) return { data: cached };
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      // Fire services query and reviews query in PARALLEL to avoid sequential round trips
      const [servicesRes, reviewsRes] = await Promise.all([
        supabase
          .from('services')
          .select(`
            id,
            agent_id,
            name,
            description,
            price,
            category,
            image_url,
            duration_mins,
            features,
            created_at,
            profiles:agent_id (
              id,
              full_name,
              avatar_url,
              specialization,
              location,
              verification_status
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('service_id, rating')
      ]);

      if (servicesRes.error) {
        console.error('Database query error [services]:', servicesRes.error.message);
        return { data: [], error: servicesRes.error.message };
      }

      const dbServices = servicesRes.data || [];
      if (dbServices.length === 0) {
        setCached(CACHE_KEY, [], 30000);
        return { data: [] };
      }

      const reviews = reviewsRes.data || [];
      const ratingsMap: Record<string, { total: number; count: number }> = {};
      if (reviews) {
        for (const r of reviews) {
          if (r.service_id) {
            if (!ratingsMap[r.service_id]) ratingsMap[r.service_id] = { total: 0, count: 0 };
            ratingsMap[r.service_id].total += Number(r.rating || 5);
            ratingsMap[r.service_id].count += 1;
          }
        }
      }

      const formattedServices: Service[] = dbServices.map((s: any) => {
        const agentProfile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        const images: string[] = Array.isArray(s.image_url)
          ? s.image_url.filter(Boolean)
          : (typeof s.image_url === 'string' && s.image_url.trim() ? [s.image_url] : []);

        const gallery: ServiceGalleryItem[] = images.map((imgUrl) => ({
          type: isVideoUrl(imgUrl) ? 'video' : 'image',
          url: imgUrl,
          thumbnail: isVideoUrl(imgUrl) ? '' : imgUrl
        }));

        const primaryImage = images.find(img => !isVideoUrl(img)) || images[0] || '';

        const revInfo = ratingsMap[s.id];
        const rating = revInfo && revInfo.count > 0 ? Number((revInfo.total / revInfo.count).toFixed(1)) : 0;
        const reviewCount = revInfo ? revInfo.count : 0;

        return {
          id: s.id,
          name: s.name || 'Untitled Service',
          category: s.category || 'General',
          price: Number(s.price) || 0,
          rating,
          reviewCount,
          description: s.description || '',
          image: primaryImage,
          durationMins: s.duration_mins || 0,
          features: Array.isArray(s.features) ? s.features : [],
          agentId: s.agent_id || agentProfile?.id || '',
          agentName: agentProfile?.full_name || 'Beauty Specialist',
          agentImage: agentProfile?.avatar_url || '',
          agentSpecialty: agentProfile?.specialization || s.category || 'Specialist',
          agentLocation: agentProfile?.location || 'Nigeria',
          gallery
        };
      });

      setCached(CACHE_KEY, formattedServices, 120000); // 2 minute cache
      return { data: formattedServices };
    } catch (err: any) {
      console.error('getServices exception:', err);
      return { data: [], error: err?.message || 'Failed to load services' };
    }
  });
}

export async function getServiceById(id: string, forceRefresh = false): Promise<{ data: Service | null; error?: string }> {
  const CACHE_KEY = `service:${id}`;
  if (!forceRefresh) {
    const cached = getCached<Service>(CACHE_KEY);
    if (cached) return { data: cached };
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      // Parallelize service and review queries
      const [serviceRes, reviewsRes] = await Promise.all([
        supabase
          .from('services')
          .select(`
            id,
            agent_id,
            name,
            description,
            price,
            category,
            image_url,
            duration_mins,
            features,
            created_at,
            profiles:agent_id (
              id,
              full_name,
              avatar_url,
              specialization,
              location,
              bio,
              verification_status
            )
          `)
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('reviews')
          .select('rating')
          .eq('service_id', id)
      ]);

      if (serviceRes.error) {
        console.error('Database query error [service by id]:', serviceRes.error.message);
        return { data: null, error: serviceRes.error.message };
      }

      const s = serviceRes.data;
      if (!s) {
        return { data: null };
      }

      const reviews = reviewsRes.data;
      let rating = 0;
      let reviewCount = 0;
      if (reviews && reviews.length > 0) {
        reviewCount = reviews.length;
        const sum = reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
        rating = Number((sum / reviewCount).toFixed(1));
      }

      const agentProfile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
      const images: string[] = Array.isArray(s.image_url)
        ? s.image_url.filter(Boolean)
        : (typeof s.image_url === 'string' && s.image_url.trim() ? [s.image_url] : []);

      const gallery: ServiceGalleryItem[] = images.map((imgUrl) => ({
        type: isVideoUrl(imgUrl) ? 'video' : 'image',
        url: imgUrl,
        thumbnail: isVideoUrl(imgUrl) ? '' : imgUrl
      }));

      const primaryImage = images.find(img => !isVideoUrl(img)) || images[0] || '';

      const serviceObj: Service = {
        id: s.id,
        name: s.name || 'Untitled Service',
        category: s.category || 'General',
        price: Number(s.price) || 0,
        rating,
        reviewCount,
        description: s.description || '',
        image: primaryImage,
        durationMins: s.duration_mins || 0,
        features: Array.isArray(s.features) ? s.features : [],
        agentId: s.agent_id || agentProfile?.id || '',
        agentName: agentProfile?.full_name || 'Beauty Specialist',
        agentImage: agentProfile?.avatar_url || '',
        agentSpecialty: agentProfile?.specialization || s.category || 'Specialist',
        agentLocation: agentProfile?.location || 'Nigeria',
        gallery
      };

      setCached(CACHE_KEY, serviceObj, 120000);
      return { data: serviceObj };
    } catch (err: any) {
      console.error('getServiceById exception:', err);
      return { data: null, error: err?.message || 'Failed to retrieve service' };
    }
  });
}

// ==========================================
// AGENTS API (STRICT PRODUCTION)
// ==========================================

export async function getAgents(forceRefresh = false): Promise<{ data: Agent[]; error?: string }> {
  const CACHE_KEY = 'agents:all';
  if (!forceRefresh) {
    const cached = getCached<Agent[]>(CACHE_KEY);
    if (cached) return { data: cached };
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      // Parallelize: profiles, services map, and reviews are fetched simultaneously
      const [agentsRes, servicesRes, reviewsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'agent'),
        supabase
          .from('services')
          .select('id, agent_id'),
        supabase
          .from('reviews')
          .select('service_id, rating')
      ]);

      if (agentsRes.error) {
        console.error('Database query error [agents]:', agentsRes.error.message);
        return { data: [], error: agentsRes.error.message };
      }

      const dbAgents = agentsRes.data || [];
      if (dbAgents.length === 0) {
        setCached(CACHE_KEY, [], 30000);
        return { data: [] };
      }

      const services = servicesRes.data || [];
      const allReviews = reviewsRes.data || [];

      const agentRatings: Record<string, { total: number; count: number }> = {};
      if (services.length > 0 && allReviews.length > 0) {
        const serviceToAgentMap: Record<string, string> = {};
        services.forEach(s => {
          if (s.agent_id) serviceToAgentMap[s.id] = s.agent_id;
        });

        allReviews.forEach(r => {
          const agentId = serviceToAgentMap[r.service_id];
          if (agentId) {
            if (!agentRatings[agentId]) agentRatings[agentId] = { total: 0, count: 0 };
            agentRatings[agentId].total += Number(r.rating || 5);
            agentRatings[agentId].count += 1;
          }
        });
      }

      const agents: Agent[] = dbAgents.map((a: any) => {
        const agentServiceIds = services
          .filter(s => s.agent_id === a.id)
          .map(s => s.id);

        const rawGallery = Array.isArray(a.gallery) ? a.gallery : [];
        const gallery = rawGallery.map((g: any) => ({
          type: (g?.type === 'video' || isVideoUrl(g?.url) ? 'video' : 'image') as 'image' | 'video',
          url: g?.url || '',
          thumbnail: g?.thumbnail || g?.url || ''
        }));

        const rInfo = agentRatings[a.id];
        const rating = rInfo && rInfo.count > 0 ? Number((rInfo.total / rInfo.count).toFixed(1)) : 0;
        const reviewCount = rInfo ? rInfo.count : 0;

        return {
          id: a.id,
          name: a.full_name || 'Beauty Specialist',
          specialty: a.specialization || 'Beauty Professional',
          rating,
          reviews: reviewCount,
          experience: a.years_exp || 0,
          image: a.avatar_url || '',
          banner: a.banner_url || '',
          bio: a.bio || '',
          location: a.location || 'Nigeria',
          phone: a.phone || '',
          serviceType: a.service_type || 'hybrid',
          services: agentServiceIds,
          gallery,
          verificationStatus: mapVerificationStatus(a.verification_status)
        };
      });

      setCached(CACHE_KEY, agents, 120000); // 2 minute cache
      return { data: agents };
    } catch (err: any) {
      console.error('getAgents exception:', err);
      return { data: [], error: err?.message || 'Failed to retrieve agents' };
    }
  });
}

export async function getAgentById(id: string, forceRefresh = false): Promise<{ data: Agent | null; error?: string }> {
  const CACHE_KEY = `agent:${id}`;
  if (!forceRefresh) {
    const cached = getCached<Agent>(CACHE_KEY);
    if (cached) return { data: cached };
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let a: any = null;

      if (isUuid) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) a = data;
      }

      // Fallback if not found by UUID or if passed name/slug
      if (!a) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'agent')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        a = data;
      }

      if (!a) {
        return { data: null, error: 'Specialist profile not found in database' };
      }

      // Concurrently fetch agent's services and completed bookings count
      const [servicesRes, completedRes] = await Promise.all([
        supabase
          .from('services')
          .select('id')
          .eq('agent_id', a.id),
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('agent_id', a.id)
          .eq('status', 'completed')
      ]);

      const services = servicesRes.data || [];
      const serviceIds = services.map((s: any) => s.id);

      // Compute live rating and reviews count
      let rating = 0;
      let reviewCount = 0;
      if (serviceIds.length > 0) {
        const { data: revs } = await supabase
          .from('reviews')
          .select('rating')
          .in('service_id', serviceIds);

        if (revs && revs.length > 0) {
          reviewCount = revs.length;
          const sum = revs.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
          rating = Number((sum / reviewCount).toFixed(1));
        }
      }

      const completedCount = completedRes.count || 0;
      const rawGallery = Array.isArray(a.gallery) ? a.gallery : [];
      const gallery = rawGallery.map((g: any) => ({
        type: (g?.type === 'video' || isVideoUrl(g?.url) ? 'video' : 'image') as 'image' | 'video',
        url: g?.url || '',
        thumbnail: g?.thumbnail || g?.url || ''
      }));

      const agentObj: Agent = {
        id: a.id,
        name: a.full_name || 'Beauty Specialist',
        specialty: a.specialization || 'Beauty Professional',
        rating,
        reviews: reviewCount,
        experience: a.years_exp || 0,
        image: a.avatar_url || '',
        banner: a.banner_url || '',
        bio: a.bio || '',
        location: a.location || 'Nigeria',
        phone: a.phone || '',
        serviceType: a.service_type || 'hybrid',
        services: serviceIds,
        gallery,
        verificationStatus: mapVerificationStatus(a.verification_status),
        completedBookings: completedCount
      };

      setCached(CACHE_KEY, agentObj, 120000);
      setCached(`agent:${a.id}`, agentObj, 120000);
      return { data: agentObj };
    } catch (err: any) {
      console.error('getAgentById exception:', err);
      return { data: null, error: err?.message || 'Failed to retrieve agent' };
    }
  });
}

export async function getServicesByAgentId(agentId: string, forceRefresh = false): Promise<{ data: Service[]; error?: string }> {
  const CACHE_KEY = `services:agent:${agentId}`;
  if (!forceRefresh) {
    const cached = getCached<Service[]>(CACHE_KEY);
    if (cached) return { data: cached };
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const { data: dbServices, error } = await supabase
        .from('services')
        .select(`
          id,
          agent_id,
          name,
          description,
          price,
          category,
          image_url,
          duration_mins,
          features,
          created_at,
          profiles:agent_id (
            id,
            full_name,
            avatar_url,
            specialization,
            location,
            verification_status
          )
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('getServicesByAgentId query error:', error.message);
        return { data: [], error: error.message };
      }

      if (!dbServices || dbServices.length === 0) {
        setCached(CACHE_KEY, [], 30000);
        return { data: [] };
      }

      const serviceIds = dbServices.map((s: any) => s.id);
      const { data: reviews } = await supabase
        .from('reviews')
        .select('service_id, rating')
        .in('service_id', serviceIds);

      const ratingsMap: Record<string, { total: number; count: number }> = {};
      if (reviews) {
        for (const r of reviews) {
          if (r.service_id) {
            if (!ratingsMap[r.service_id]) ratingsMap[r.service_id] = { total: 0, count: 0 };
            ratingsMap[r.service_id].total += Number(r.rating || 5);
            ratingsMap[r.service_id].count += 1;
          }
        }
      }

      const formatted: Service[] = dbServices.map((s: any) => {
        const agentProfile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        const images: string[] = Array.isArray(s.image_url)
          ? s.image_url.filter(Boolean)
          : (typeof s.image_url === 'string' && s.image_url.trim() ? [s.image_url] : []);

        const gallery: ServiceGalleryItem[] = images.map((imgUrl) => ({
          type: isVideoUrl(imgUrl) ? 'video' : 'image',
          url: imgUrl,
          thumbnail: isVideoUrl(imgUrl) ? '' : imgUrl
        }));

        const primaryImage = images.find(img => !isVideoUrl(img)) || images[0] || '';
        const revInfo = ratingsMap[s.id];
        const rating = revInfo && revInfo.count > 0 ? Number((revInfo.total / revInfo.count).toFixed(1)) : 0;
        const reviewCount = revInfo ? revInfo.count : 0;

        return {
          id: s.id,
          name: s.name || 'Untitled Service',
          category: s.category || 'General',
          price: Number(s.price) || 0,
          rating,
          reviewCount,
          description: s.description || '',
          image: primaryImage,
          durationMins: s.duration_mins || 0,
          features: Array.isArray(s.features) ? s.features : [],
          agentId: s.agent_id || agentProfile?.id || '',
          agentName: agentProfile?.full_name || 'Beauty Specialist',
          agentImage: agentProfile?.avatar_url || '',
          agentSpecialty: agentProfile?.specialization || s.category || 'Specialist',
          agentLocation: agentProfile?.location || 'Nigeria',
          gallery
        };
      });

      setCached(CACHE_KEY, formatted, 120000);
      return { data: formatted };
    } catch (err: any) {
      console.error('getServicesByAgentId exception:', err);
      return { data: [], error: err?.message || 'Failed to retrieve agent services' };
    }
  });
}

// ==========================================
// BOOKINGS API (STRICT PRODUCTION)
// ==========================================

export async function getBookingsForUser(userId: string, role: 'customer' | 'agent' | 'admin', forceRefresh = false): Promise<{ data: Booking[]; error?: string }> {
  try {
    if (!userId) {
      return { data: [] };
    }

    const CACHE_KEY = `bookings:${userId}:${role}`;
    if (!forceRefresh) {
      const cached = getCached<Booking[]>(CACHE_KEY);
      if (cached) return { data: cached };
    }

    return await withInFlight(CACHE_KEY, async () => {
      let query = supabase
        .from('bookings')
        .select(`
          id,
          customer_id,
          service_id,
          agent_id,
          date,
          time,
          status,
          address,
          total_amount,
          customer_notes,
          created_at,
          services:service_id (
            id,
            name,
            price,
            image_url
          ),
          customer:customer_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          agent:agent_id (
            id,
            full_name,
            avatar_url,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'customer') {
        query = query.eq('customer_id', userId);
      } else if (role === 'agent') {
        query = query.eq('agent_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database query error [bookings]:', error.message);
        return { data: [], error: error.message };
      }

      if (!data || data.length === 0) {
        setCached(CACHE_KEY, [], 15000);
        return { data: [] };
      }

      const mappedBookings: Booking[] = data.map((b: any) => {
        const s = Array.isArray(b.services) ? b.services[0] : b.services;
        const c = Array.isArray(b.customer) ? b.customer[0] : b.customer;
        const a = Array.isArray(b.agent) ? b.agent[0] : b.agent;

        const serviceImages = Array.isArray(s?.image_url) ? s.image_url : (typeof s?.image_url === 'string' ? [s.image_url] : []);
        const primaryServiceImg = serviceImages.find((img: string) => !isVideoUrl(img)) || serviceImages[0] || '';

        return {
          id: b.id,
          serviceId: b.service_id,
          serviceName: s?.name || 'Beauty Service',
          serviceImage: primaryServiceImg,
          customerId: b.customer_id,
          customerName: c?.full_name || 'Customer',
          customerAvatar: c?.avatar_url || '',
          customerPhone: c?.phone || '',
          agentId: b.agent_id || '',
          agentName: a?.full_name || 'Agent',
          agentAvatar: a?.avatar_url || '',
          date: b.date || '',
          time: b.time || '',
          price: Number(b.total_amount || s?.price || 0),
          status: mapBookingStatus(b.status),
          address: b.address || '',
          notes: b.customer_notes || '',
          createdAt: b.created_at
        };
      });

      setCached(CACHE_KEY, mappedBookings, 30000); // 30s cache for active user bookings
      return { data: mappedBookings };
    });
  } catch (err: any) {
    console.error('getBookingsForUser exception:', err);
    return { data: [], error: err?.message || 'Failed to retrieve bookings' };
  }
}

export async function createBooking(payload: {
  customerId: string;
  agentId: string;
  serviceId: string;
  date: string;
  time: string;
  address: string;
  customerNotes?: string;
  totalAmount: number;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: payload.customerId,
        agent_id: payload.agentId,
        service_id: payload.serviceId,
        date: payload.date,
        time: payload.time,
        address: payload.address,
        customer_notes: payload.customerNotes || '',
        total_amount: payload.totalAmount,
        status: 'pending',
        payment_status: 'pending',
        currency: 'NGN'
      })
      .select()
      .single();

    if (error) {
      console.error('createBooking error:', error.message);
      return { success: false, error: error.message };
    }

    // Invalidate bookings & metrics caches
    invalidateCache('bookings:');
    invalidateCache('metrics:platform');

    return { success: true, data };
  } catch (err: any) {
    console.error('createBooking exception:', err);
    return { success: false, error: err?.message || 'Failed to create booking' };
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
  try {
    const dbStatus = status.toLowerCase();
    const { error } = await supabase
      .from('bookings')
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      console.error('updateBookingStatus error:', error.message);
      return false;
    }

    invalidateCache('bookings:');
    invalidateCache('metrics:platform');
    invalidateCache('agent:');
    return true;
  } catch (err) {
    console.error('updateBookingStatus exception:', err);
    return false;
  }
}

// ==========================================
// REVIEWS API (STRICT PRODUCTION)
// ==========================================

export async function getReviewsForService(serviceId: string, forceRefresh = false): Promise<{ data: Review[]; error?: string }> {
  const CACHE_KEY = `reviews:service:${serviceId}`;
  if (!forceRefresh) {
    const cached = getCached<Review[]>(CACHE_KEY);
    if (cached) return { data: cached };
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          customer_id,
          service_id,
          rating,
          comment,
          created_at,
          customer:customer_id (
            full_name,
            avatar_url
          )
        `)
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database query error [reviews]:', error.message);
        return { data: [], error: error.message };
      }

      if (!data || data.length === 0) {
        setCached(CACHE_KEY, [], 30000);
        return { data: [] };
      }

      const reviews: Review[] = data.map((r: any) => {
        const c = Array.isArray(r.customer) ? r.customer[0] : r.customer;
        return {
          id: r.id,
          userName: c?.full_name || 'Client',
          userAvatar: c?.avatar_url || '',
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rating: Number(r.rating) || 5,
          text: r.comment || '',
          serviceName: 'Beauty Service',
          serviceId: r.service_id,
          customerId: r.customer_id
        };
      });

      setCached(CACHE_KEY, reviews, 60000);
      return { data: reviews };
    } catch (err: any) {
      console.error('getReviewsForService exception:', err);
      return { data: [], error: err?.message || 'Failed to retrieve reviews' };
    }
  });
}

export async function createReview(payload: {
  customerId: string;
  serviceId: string;
  rating: number;
  comment: string;
  bookingId?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('reviews').insert({
      customer_id: payload.customerId,
      service_id: payload.serviceId,
      rating: payload.rating,
      comment: payload.comment,
      booking_id: payload.bookingId || null
    });

    if (error) {
      console.error('createReview error:', error.message);
      return false;
    }

    invalidateCache('reviews:');
    invalidateCache('services:');
    invalidateCache('agents:');
    invalidateCache('agent:');
    invalidateCache('metrics:platform');
    return true;
  } catch (err) {
    console.error('createReview exception:', err);
    return false;
  }
}

// ==========================================
// AGENT / ADMIN ACTIONS (STRICT PRODUCTION)
// ==========================================

export async function createService(payload: {
  agentId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  durationMins?: number;
  imageUrl?: string[];
  features?: string[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert({
        agent_id: payload.agentId,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        category: payload.category,
        duration_mins: payload.durationMins || 60,
        image_url: payload.imageUrl || [],
        features: payload.features || []
      })
      .select()
      .single();

    if (error) {
      console.error('createService error:', error.message);
      return { success: false, error: error.message };
    }

    invalidateCache('services:');
    invalidateCache('agents:');
    invalidateCache('agent:');
    invalidateCache('metrics:platform');

    return { success: true, data };
  } catch (err: any) {
    console.error('createService exception:', err);
    return { success: false, error: err?.message || 'Failed to create service' };
  }
}

export async function updateAgentProfile(
  userId: string,
  updates: {
    fullName?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    specialization?: string;
    location?: string;
    yearsExp?: number;
    serviceType?: string;
    bio?: string;
    phone?: string;
    gallery?: Array<{ type: 'image' | 'video'; url: string; thumbnail?: string }>;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
    if (updates.specialization !== undefined) dbUpdates.specialization = updates.specialization;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.yearsExp !== undefined) dbUpdates.years_exp = updates.yearsExp;
    if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.gallery !== undefined) dbUpdates.gallery = updates.gallery;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('updateAgentProfile error:', error.message);
      return { success: false, error: error.message };
    }

    invalidateCache('agents:');
    invalidateCache(`agent:${userId}`);

    return { success: true, data };
  } catch (err: any) {
    console.error('updateAgentProfile exception:', err);
    return { success: false, error: err?.message || 'Failed to update profile' };
  }
}

// Uploads a file to the public `media` storage bucket and returns its public URL.
// Storing base64 data URLs in the profiles row is what broke banner/avatar loading.
export async function uploadMedia(
  userId: string,
  file: File,
  folder: 'avatars' | 'banners' | 'gallery'
): Promise<{ url?: string; error?: string }> {
  try {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (err: any) {
    return { error: err?.message || 'Upload failed' };
  }
}

export async function updateAgentVerification(agentId: string, status: 'verified' | 'rejected'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ verification_status: status, updated_at: new Date().toISOString() })
      .eq('id', agentId);

    if (error) {
      console.error('updateAgentVerification error:', error.message);
      return false;
    }

    invalidateCache('agents:');
    invalidateCache(`agent:${agentId}`);
    return true;
  } catch (err) {
    console.error('updateAgentVerification exception:', err);
    return false;
  }
}

// ==========================================
// PLATFORM METRICS API (FOR PRODUCTION HOME / DASHBOARD)
// ==========================================

export interface PlatformMetrics {
  totalAgents: number;
  totalServices: number;
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
}

export async function getPlatformMetrics(forceRefresh = false): Promise<PlatformMetrics> {
  const CACHE_KEY = 'metrics:platform';
  if (!forceRefresh) {
    const cached = getCached<PlatformMetrics>(CACHE_KEY);
    if (cached) return cached;
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const [agentsRes, servicesRes, bookingsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_type', 'agent'),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id, status'),
        supabase.from('reviews').select('rating')
      ]);

      const totalAgents = agentsRes.count || 0;
      const totalServices = servicesRes.count || 0;
      const bookingsData = bookingsRes.data || [];
      const totalBookings = bookingsData.length;
      const completedBookings = bookingsData.filter(b => b.status === 'completed').length;

      const reviewsData = reviewsRes.data || [];
      let averageRating = 0;
      if (reviewsData.length > 0) {
        const sum = reviewsData.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
        averageRating = Number((sum / reviewsData.length).toFixed(1));
      }

      const metrics: PlatformMetrics = {
        totalAgents,
        totalServices,
        totalBookings,
        completedBookings,
        averageRating
      };

      setCached(CACHE_KEY, metrics, 60000);
      return metrics;
    } catch (err) {
      console.error('getPlatformMetrics exception:', err);
      return {
        totalAgents: 0,
        totalServices: 0,
        totalBookings: 0,
        completedBookings: 0,
        averageRating: 0
      };
    }
  });
}

// ==========================================
// SOCIAL API (FOLLOWS & LIKES)
// Uses existing tables: follows(follower_id, following_id) and favorites(customer_id, service_id)
// ==========================================

export interface SocialUser {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  userType: string;
}

function toSocialUser(p: any): SocialUser {
  const name = p?.full_name || 'Member';
  return {
    id: p?.id,
    name,
    handle: '@' + name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18),
    bio: p?.bio || p?.specialization || '',
    avatar: p?.avatar_url || '',
    userType: p?.user_type || 'customer'
  };
}

export async function getFollowCounts(agentId: string, forceRefresh = false): Promise<{ followers: number; following: number }> {
  const CACHE_KEY = `social:counts:${agentId}`;
  if (!forceRefresh) {
    const cached = getCached<{ followers: number; following: number }>(CACHE_KEY);
    if (cached) return cached;
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const [f1, f2] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', agentId),
        supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', agentId)
      ]);
      const res = { followers: f1.count || 0, following: f2.count || 0 };
      setCached(CACHE_KEY, res, 45000);
      return res;
    } catch {
      return { followers: 0, following: 0 };
    }
  });
}

export async function getFollowers(agentId: string, forceRefresh = false): Promise<SocialUser[]> {
  const CACHE_KEY = `social:followers:${agentId}`;
  if (!forceRefresh) {
    const cached = getCached<SocialUser[]>(CACHE_KEY);
    if (cached) return cached;
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const { data: rows } = await supabase.from('follows').select('follower_id').eq('following_id', agentId);
      const ids = (rows || []).map((r: any) => r.follower_id);
      if (ids.length === 0) {
        setCached(CACHE_KEY, [], 30000);
        return [];
      }
      const { data } = await supabase.from('profiles').select('id, full_name, bio, specialization, avatar_url, user_type').in('id', ids);
      const res = (data || []).map(toSocialUser);
      setCached(CACHE_KEY, res, 45000);
      return res;
    } catch {
      return [];
    }
  });
}

export async function getFollowing(userId: string, forceRefresh = false): Promise<SocialUser[]> {
  const CACHE_KEY = `social:following:${userId}`;
  if (!forceRefresh) {
    const cached = getCached<SocialUser[]>(CACHE_KEY);
    if (cached) return cached;
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const { data: rows } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
      const ids = (rows || []).map((r: any) => r.following_id);
      if (ids.length === 0) {
        setCached(CACHE_KEY, [], 30000);
        return [];
      }
      const { data } = await supabase.from('profiles').select('id, full_name, bio, specialization, avatar_url, user_type').in('id', ids);
      const res = (data || []).map(toSocialUser);
      setCached(CACHE_KEY, res, 45000);
      return res;
    } catch {
      return [];
    }
  });
}

export async function getMyFollowingIds(userId: string, forceRefresh = false): Promise<string[]> {
  const CACHE_KEY = `social:my_following:${userId}`;
  if (!forceRefresh) {
    const cached = getCached<string[]>(CACHE_KEY);
    if (cached) return cached;
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const { data } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
      const res = (data || []).map((r: any) => r.following_id);
      setCached(CACHE_KEY, res, 45000);
      return res;
    } catch {
      return [];
    }
  });
}

export async function setFollow(followerId: string, agentId: string, follow: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = follow
      ? await supabase.from('follows').insert({ follower_id: followerId, following_id: agentId })
      : await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', agentId);
    if (error) return { success: false, error: error.message };

    invalidateCache('social:');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Follow action failed' };
  }
}

export async function getLikedServiceIds(userId: string, forceRefresh = false): Promise<string[]> {
  const CACHE_KEY = `likes:${userId}`;
  if (!forceRefresh) {
    const cached = getCached<string[]>(CACHE_KEY);
    if (cached) return cached;
  }

  return withInFlight(CACHE_KEY, async () => {
    try {
      const { data } = await supabase.from('favorites').select('service_id').eq('customer_id', userId);
      const res = (data || []).map((r: any) => r.service_id);
      setCached(CACHE_KEY, res, 45000);
      return res;
    } catch {
      return [];
    }
  });
}

export async function setServiceLike(userId: string, serviceId: string, like: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = like
      ? await supabase.from('favorites').insert({ customer_id: userId, service_id: serviceId })
      : await supabase.from('favorites').delete().eq('customer_id', userId).eq('service_id', serviceId);
    if (error) return { success: false, error: error.message };

    invalidateCache(`likes:${userId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Like action failed' };
  }
}
