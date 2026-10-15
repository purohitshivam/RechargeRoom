import { BookingRepository } from './types';
import { LocalBookingRepository } from './local';
import { SupabaseBookingRepository } from './supabase';

let repositoryInstance: BookingRepository | null = null;

export function getRepository(): BookingRepository {
  if (repositoryInstance) return repositoryInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabase =
    !!supabaseUrl &&
    (!!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (hasSupabase && !supabaseUrl.includes('your-project-id')) {
    try {
      repositoryInstance = new SupabaseBookingRepository();
      console.log('[DB] Using Supabase PostgreSQL persistent repository.');
      return repositoryInstance;
    } catch (e) {
      console.warn('[DB] Failed to initialize Supabase client, falling back to local persistent repository:', e);
    }
  }

  repositoryInstance = new LocalBookingRepository();
  console.log('[DB] Using Local persistent repository (concurrency locked).');
  return repositoryInstance;
}

export * from './types';
