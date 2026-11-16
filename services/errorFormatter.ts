// services/errorFormatter.ts
// Centralized humanized error handling for Everything Beauty

/**
 * Transforms raw database, auth, and network errors into polished,
 * user-friendly messages while keeping raw technical details in the console.
 */
export function humanizeError(rawError: any, fallbackMessage = 'We could not complete your request. Please try again.'): string {
  if (!rawError) return fallbackMessage;

  // Always log full development error to developer console
  console.error('[Everything Beauty System Error]:', rawError);

  const message = typeof rawError === 'string'
    ? rawError
    : rawError?.message || rawError?.error_description || String(rawError);

  const lower = message.toLowerCase();

  // 1. Supabase Check / Foreign Key / DB Constraints
  if (lower.includes('check constraint') || lower.includes('violates check') || lower.includes('service_type_check')) {
    return 'Some profile details could not be verified. Please check your delivery selection and try again.';
  }
  if (lower.includes('foreign key') || lower.includes('violates foreign key')) {
    return 'The requested record is no longer available or was not found.';
  }
  if (lower.includes('duplicate key') || lower.includes('unique constraint') || lower.includes('already registered') || lower.includes('user already exists')) {
    return 'An account with this email or phone number already exists. Please sign in instead.';
  }

  // 2. Authentication Errors
  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Incorrect email or password. Please check your details and try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your email inbox to verify your account before signing in.';
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'Your password must be at least 6 characters long.';
  }
  if (lower.includes('jwt expired') || lower.includes('token is expired') || lower.includes('session_not_found') || lower.includes('refresh_token_not_found')) {
    return 'Your login session has expired. Please sign in again.';
  }
  if (lower.includes('row-level security') || lower.includes('permission denied') || lower.includes('new row violates row-level security')) {
    return 'You do not have permission to perform this action.';
  }

  // 3. Network and Connectivity
  if (lower.includes('failed to fetch') || lower.includes('networkerror') || lower.includes('network request failed')) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }

  // If the error message already looks human and doesn't leak SQL/table internals
  const looksLikeDevError = lower.includes('relation') ||
    lower.includes('column') ||
    lower.includes('syntax error') ||
    lower.includes('null value') ||
    lower.includes('pgrst') ||
    lower.includes('postgrest') ||
    lower.includes('supabase');

  if (!looksLikeDevError && message.length < 120) {
    return message;
  }

  return fallbackMessage;
}
