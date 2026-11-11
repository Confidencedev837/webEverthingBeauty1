import { Booking, BookingStatus, Agent } from '../types';

/**
 * Everything Beauty Official WhatsApp Communication System
 * Handles real-time status updates, reminders, and concierge dispatch
 * between Clients, Beauty Specialists, and the Official Marketplace Line.
 * 
 * STRICT COMPLIANCE: ZERO EMOJIS in templates, logs, or UI strings.
 */

// Official Everything Beauty concierge phone number (Nigeria format: country code without leading +)
export const OFFICIAL_EB_WHATSAPP = (import.meta.env.VITE_OFFICIAL_WHATSAPP_NUMBER as string) || '2348000000000';
export const APP_LIVE_URL = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://everything-beautyapp.vercel.app';

export interface WhatsAppNotificationPayload {
  recipientType: 'customer' | 'agent' | 'concierge';
  recipientPhone?: string;
  booking: {
    id: string;
    serviceName: string;
    customerName: string;
    agentName: string;
    date: string;
    time: string;
    address: string;
    totalAmount: number;
    status: BookingStatus | string;
  };
  customNote?: string;
}

/**
 * Normalizes phone numbers to standard international WhatsApp format without '+' or leading zero.
 * Example: '08012345678' -> '2348012345678'
 * Example: '+2348012345678' -> '2348012345678'
 */
export function formatPhoneForWhatsApp(phone?: string | null): string {
  if (!phone) return OFFICIAL_EB_WHATSAPP;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    return '234' + digitsOnly.slice(1);
  }
  if (digitsOnly.startsWith('234')) {
    return digitsOnly;
  }
  return digitsOnly || OFFICIAL_EB_WHATSAPP;
}

// Backward-compatible alias
export const formatPhoneNumberForWhatsApp = formatPhoneForWhatsApp;

/**
 * Generates an official Everything Beauty plain-text message for WhatsApp.
 * STRICT RULE: No emojis. High-clarity editorial format.
 */
export function buildWhatsAppMessage(
  type: 'BOOKING_CREATED_CLIENT' | 'BOOKING_CREATED_AGENT' | 'STATUS_CONFIRMED' | 'STATUS_IN_PROGRESS' | 'STATUS_COMPLETED' | 'STATUS_CANCELLED' | 'REMINDER_24H' | 'REMINDER_2H' | 'DIRECT_CHAT',
  data: {
    bookingId?: string;
    customerName?: string;
    agentName?: string;
    serviceName?: string;
    date?: string;
    time?: string;
    address?: string;
    totalAmount?: number;
    senderName?: string;
  }
): string {
  const reference = data.bookingId ? `[REF: #${data.bookingId.slice(0, 8).toUpperCase()}]` : '';
  const currencyFormatted = data.totalAmount ? `NGN ${data.totalAmount.toLocaleString()}` : '';

  switch (type) {
    case 'BOOKING_CREATED_CLIENT':
      return [
        'EVERYTHING BEAUTY APPOINTMENT ACKNOWLEDGEMENT',
        reference,
        '',
        `Dear ${data.customerName || 'Client'},`,
        `Your on-demand appointment request for ${data.serviceName} with specialist ${data.agentName} has been received.`,
        '',
        `Date: ${data.date}`,
        `Time: ${data.time}`,
        `Location: ${data.address}`,
        currencyFormatted ? `Total Amount: ${currencyFormatted}` : '',
        '',
        'Status: PENDING SPECIALIST CONFIRMATION',
        'You will receive an automatic status alert the moment your specialist confirms the slot.',
        '',
        `Secure In-App Chat: ${APP_LIVE_URL}/#/customer/dashboard`,
        '',
        `Everything Beauty Marketplace | ${APP_LIVE_URL}`
      ].filter(Boolean).join('\n');

    case 'BOOKING_CREATED_AGENT':
      return [
        'EVERYTHING BEAUTY SPECIALIST DISPATCH ALERT',
        reference,
        '',
        `Hello ${data.agentName || 'Specialist'},`,
        `You have a new on-demand service appointment request from ${data.customerName || 'a client'}.`,
        '',
        `Service: ${data.serviceName}`,
        `Scheduled Date: ${data.date}`,
        `Scheduled Time: ${data.time}`,
        `Service Location: ${data.address}`,
        currencyFormatted ? `Booking Value: ${currencyFormatted}` : '',
        '',
        'Action Required: Please open your specialist dashboard to review and confirm or reschedule.',
        `Dashboard: ${APP_LIVE_URL}/#/agent/dashboard`,
        '',
        'Everything Beauty Marketplace | Where Beauty Comes to You'
      ].filter(Boolean).join('\n');

    case 'STATUS_CONFIRMED':
      return [
        'EVERYTHING BEAUTY APPOINTMENT CONFIRMED',
        reference,
        '',
        `Dear ${data.customerName || 'Client'},`,
        `Your appointment for ${data.serviceName} has been confirmed by specialist ${data.agentName}.`,
        '',
        `Date: ${data.date}`,
        `Time: ${data.time}`,
        `Address: ${data.address}`,
        '',
        'Your specialist is scheduled to arrive at your designated address at the appointed time.',
        `To message your specialist securely, open in-app chat: ${APP_LIVE_URL}/#/customer/dashboard`,
        '',
        'Direct Support: Reply to this message to reach Everything Beauty Concierge.',
        '',
        'Everything Beauty Marketplace | Verified Beauty Professionals'
      ].join('\n');

    case 'STATUS_IN_PROGRESS':
      return [
        'EVERYTHING BEAUTY SPECIALIST STATUS UPDATE',
        reference,
        '',
        `Dear ${data.customerName || 'Client'},`,
        `Specialist ${data.agentName} has updated the appointment status for ${data.serviceName} to: IN PROGRESS / EN ROUTE.`,
        '',
        `Date: ${data.date}`,
        `Location: ${data.address}`,
        '',
        'Please ensure you or your representative are available at the destination.',
        'Everything Beauty Marketplace'
      ].join('\n');

    case 'STATUS_COMPLETED':
      return [
        'EVERYTHING BEAUTY APPOINTMENT COMPLETED',
        reference,
        '',
        `Dear ${data.customerName || 'Client'},`,
        `Your service session for ${data.serviceName} with ${data.agentName} has been marked as COMPLETED.`,
        '',
        'Thank you for booking through Everything Beauty.',
        'Please take 30 seconds to rate your specialist and share your verified review:',
        `${APP_LIVE_URL}/#/customer/dashboard`,
        '',
        `Everything Beauty Marketplace | ${APP_LIVE_URL}`
      ].join('\n');

    case 'STATUS_CANCELLED':
      return [
        'EVERYTHING BEAUTY APPOINTMENT CANCELLATION NOTICE',
        reference,
        '',
        `Notice regarding booking for ${data.serviceName} on ${data.date} at ${data.time}:`,
        'This appointment has been CANCELLED.',
        '',
        'If this was in error or you wish to reschedule with an alternative verified specialist, please visit:',
        `${APP_LIVE_URL}/#/services`,
        '',
        'Everything Beauty Support | Official WhatsApp Line'
      ].join('\n');

    case 'REMINDER_24H':
      return [
        'EVERYTHING BEAUTY 24-HOUR APPOINTMENT REMINDER',
        reference,
        '',
        `Reminder for ${data.customerName || 'Client'}:`,
        `You have an upcoming appointment for ${data.serviceName} scheduled with ${data.agentName} tomorrow.`,
        '',
        `Date: ${data.date}`,
        `Time: ${data.time}`,
        `Location: ${data.address}`,
        '',
        'Everything Beauty Concierge is standing by if you need any adjustments.',
        APP_LIVE_URL
      ].join('\n');

    case 'REMINDER_2H':
      return [
        'EVERYTHING BEAUTY 2-HOUR APPOINTMENT REMINDER',
        reference,
        '',
        `Upcoming Appointment Alert:`,
        `Your service session for ${data.serviceName} with ${data.agentName} commences in 2 hours.`,
        '',
        `Time: ${data.time}`,
        `Location: ${data.address}`,
        '',
        'Please prepare the designated work space for your specialist.',
        'Everything Beauty Marketplace'
      ].join('\n');

    case 'DIRECT_CHAT':
    default:
      return [
        'EVERYTHING BEAUTY CLIENT INQUIRY',
        reference,
        '',
        `Hello ${data.agentName || 'Specialist'},`,
        `I am reaching out regarding the ${data.serviceName || 'beauty service'} appointment on ${data.date || 'the scheduled date'}.`,
        '',
        `From: ${data.senderName || 'Client'}`
      ].join('\n');
  }
}

/**
 * Creates a standard universal WhatsApp Click-to-Chat URL.
 * Works seamlessly across iOS Safari, Android Chrome, WhatsApp Web, and Desktop App.
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Opens a WhatsApp chat in a new secure browser window / app deeplink.
 */
export function openWhatsAppChat(phone: string, text: string): void {
  const url = getWhatsAppUrl(phone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Cloud dispatch function:
 * Posts to an automated WhatsApp Business API / Webhook (e.g. Supabase Edge Function or Twilio / Meta Cloud API)
 * if configured in environment variables. Falls back gracefully without blocking.
 */
export async function sendAutomatedWhatsAppApi(payload: WhatsAppNotificationPayload): Promise<{ sent: boolean; reason?: string }> {
  const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL as string | undefined;

  if (!apiUrl) {
    // Cloud API endpoint not set; system operates in direct bridge mode
    return { sent: false, reason: 'No VITE_WHATSAPP_API_URL configured. Operating in direct WhatsApp bridge mode.' };
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_API_KEY || ''}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return { sent: false, reason: `WhatsApp Cloud API returned ${response.status}: ${errText}` };
    }

    return { sent: true };
  } catch (err: any) {
    return { sent: false, reason: err?.message || 'Network error calling WhatsApp API' };
  }
}

/**
 * Triggered when a new booking is created.
 * Dispatches automated cloud alert (if configured) and returns pre-formatted links.
 */
export async function dispatchBookingCreatedAlert(params: {
  booking: any;
  serviceName: string;
  agentName: string;
  agentPhone?: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  time: string;
  address: string;
  totalAmount: number;
}) {
  const clientText = buildWhatsAppMessage('BOOKING_CREATED_CLIENT', {
    bookingId: params.booking?.id,
    customerName: params.customerName,
    agentName: params.agentName,
    serviceName: params.serviceName,
    date: params.date,
    time: params.time,
    address: params.address,
    totalAmount: params.totalAmount
  });

  const agentText = buildWhatsAppMessage('BOOKING_CREATED_AGENT', {
    bookingId: params.booking?.id,
    customerName: params.customerName,
    agentName: params.agentName,
    serviceName: params.serviceName,
    date: params.date,
    time: params.time,
    address: params.address,
    totalAmount: params.totalAmount
  });

  // Attempt background cloud API delivery to both parties
  sendAutomatedWhatsAppApi({
    recipientType: 'customer',
    recipientPhone: params.customerPhone,
    booking: {
      id: params.booking?.id || '',
      serviceName: params.serviceName,
      customerName: params.customerName,
      agentName: params.agentName,
      date: params.date,
      time: params.time,
      address: params.address,
      totalAmount: params.totalAmount,
      status: BookingStatus.PENDING
    }
  }).catch(() => { });

  sendAutomatedWhatsAppApi({
    recipientType: 'agent',
    recipientPhone: params.agentPhone,
    booking: {
      id: params.booking?.id || '',
      serviceName: params.serviceName,
      customerName: params.customerName,
      agentName: params.agentName,
      date: params.date,
      time: params.time,
      address: params.address,
      totalAmount: params.totalAmount,
      status: BookingStatus.PENDING
    }
  }).catch(() => { });

  return {
    clientWhatsAppUrl: getWhatsAppUrl(OFFICIAL_EB_WHATSAPP, clientText),
    agentWhatsAppUrl: getWhatsAppUrl(OFFICIAL_EB_WHATSAPP, agentText),
    conciergeWhatsAppUrl: getWhatsAppUrl(OFFICIAL_EB_WHATSAPP, agentText)
  };
}

/**
 * Triggered when a booking status changes (Confirmed, In Progress, Completed, Cancelled).
 */
export async function dispatchBookingStatusUpdate(params: {
  bookingId: string;
  status: BookingStatus;
  customerName: string;
  customerPhone?: string;
  agentName: string;
  agentPhone?: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
}) {
  let templateType: 'STATUS_CONFIRMED' | 'STATUS_IN_PROGRESS' | 'STATUS_COMPLETED' | 'STATUS_CANCELLED';

  switch (params.status) {
    case BookingStatus.CONFIRMED:
      templateType = 'STATUS_CONFIRMED';
      break;
    case BookingStatus.COMPLETED:
      templateType = 'STATUS_COMPLETED';
      break;
    case BookingStatus.CANCELLED:
      templateType = 'STATUS_CANCELLED';
      break;
    default:
      templateType = 'STATUS_CONFIRMED';
      break;
  }

  const messageText = buildWhatsAppMessage(templateType, {
    bookingId: params.bookingId,
    customerName: params.customerName,
    agentName: params.agentName,
    serviceName: params.serviceName,
    date: params.date,
    time: params.time,
    address: params.address
  });

  // Background API attempt
  sendAutomatedWhatsAppApi({
    recipientType: 'customer',
    recipientPhone: params.customerPhone,
    booking: {
      id: params.bookingId,
      serviceName: params.serviceName,
      customerName: params.customerName,
      agentName: params.agentName,
      date: params.date,
      time: params.time,
      address: params.address,
      totalAmount: 0,
      status: params.status
    }
  }).catch(() => { });

  return {
    whatsappUrl: getWhatsAppUrl(OFFICIAL_EB_WHATSAPP, messageText),
    messageText
  };
}
