'use client';

import { UserAccount, RegisterData, LoginData, PasswordResetRequest, PasswordResetData, AuthState, validateEmail, validatePassword } from '@/types/auth';
import { supabase } from '@/services/supabaseClient';

export const AUTH_BACKEND_STATUS = { CONNECTED: true, PROVIDER: 'Supabase', LAST_CHECK: new Date() };
export interface ValidationResult { isValid: boolean; errors: Record<string, string>; }
type AccountUsage = { free_credits_total: number; free_credits_used: number };

function mapUser(user: { id: string; email?: string; created_at: string; last_sign_in_at?: string; email_confirmed_at?: string; user_metadata?: Record<string, unknown> }): UserAccount {
  const name = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : (user.email?.split('@')[0] || 'Creator');
  return { id: user.id, email: user.email || '', name, createdAt: new Date(user.created_at), emailVerified: Boolean(user.email_confirmed_at), lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null };
}

export async function getAuthState(): Promise<AuthState> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { isAuthenticated: false, isLoading: false, user: null, error: null };
  const { data: membership } = await supabase.from('viral_blueprint_accounts').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (!membership) {
    await supabase.auth.signOut();
    return { isAuthenticated: false, isLoading: false, user: null, error: 'This account does not have Viral Blueprint access.' };
  }
  return { isAuthenticated: true, isLoading: false, user: mapUser(data.user), error: null };
}

export function validateRegistrationData(data: RegisterData): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Name is required'; else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!data.email.trim()) errors.email = 'Email is required'; else if (!validateEmail(data.email)) errors.email = 'Please enter a valid email address';
  const passwordResult = validatePassword(data.password); if (!passwordResult.isValid) errors.password = passwordResult.errors[0];
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!data.acceptTerms) errors.acceptTerms = 'You must accept the Terms of Service and Privacy Policy';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateLoginData(data: LoginData): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.email.trim()) errors.email = 'Email is required'; else if (!validateEmail(data.email)) errors.email = 'Please enter a valid email address';
  if (!data.password) errors.password = 'Password is required';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validatePasswordResetData(data: PasswordResetData): ValidationResult {
  const errors: Record<string, string> = {};
  const passwordResult = validatePassword(data.newPassword); if (!passwordResult.isValid) errors.newPassword = passwordResult.errors[0];
  if (data.newPassword !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export async function register(data: RegisterData): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const validation = validateRegistrationData(data);
  if (!validation.isValid) return { success: false, error: Object.values(validation.errors)[0] };
  const { data: result, error } = await supabase.auth.signUp({ email: data.email.trim().toLowerCase(), password: data.password, options: { data: { full_name: data.name.trim(), app_id: 'viral-blueprint' }, emailRedirectTo: `${window.location.origin}/` } });
  if (error) return { success: false, error: error.message };
  if (!result.session || !result.user) return { success: false, error: 'Account created. Check your email to verify it, then log in.' };
  return { success: true, user: mapUser(result.user) };
}

export async function login(data: LoginData): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const validation = validateLoginData(data);
  if (!validation.isValid) return { success: false, error: Object.values(validation.errors)[0] };
  const { data: result, error } = await supabase.auth.signInWithPassword({ email: data.email.trim().toLowerCase(), password: data.password });
  if (error || !result.user) return { success: false, error: error?.message || 'Login failed.' };
  const { data: membership } = await supabase.from('viral_blueprint_accounts').select('user_id').eq('user_id', result.user.id).maybeSingle();
  if (!membership) { await supabase.auth.signOut(); return { success: false, error: 'This account does not have Viral Blueprint access.' }; }
  return { success: true, user: mapUser(result.user) };
}

export async function logout(): Promise<{ success: boolean }> { const { error } = await supabase.auth.signOut(); return { success: !error }; }

export async function requestPasswordReset(data: PasswordResetRequest): Promise<{ success: boolean; error?: string }> {
  if (!validateEmail(data.email)) return { success: false, error: 'Please enter a valid email address' };
  const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/` });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
  const validation = validatePasswordResetData(data);
  if (!validation.isValid) return { success: false, error: Object.values(validation.errors)[0] };
  const { error } = await supabase.auth.updateUser({ password: data.newPassword });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function verifyEmail(): Promise<{ success: boolean; error?: string }> { const { data, error } = await supabase.auth.getUser(); return error || !data.user ? { success: false, error: error?.message || 'Email verification failed.' } : { success: true }; }
export function hasPendingPasswordReset(): boolean { return false; }
export function getPendingResetEmail(): string | null { return null; }
export function clearPendingReset(): void {}
export async function deleteAccount(_userId?: string): Promise<{ success: boolean; error?: string }> { return { success: false, error: 'Secure account deletion is being connected next.' }; }

export async function getAccountRemainingAnalyses(): Promise<number> {
  const { data, error } = await supabase.from('viral_blueprint_accounts').select('free_credits_total, free_credits_used').single<AccountUsage>();
  if (error || !data) return 0;
  return Math.max(0, data.free_credits_total - data.free_credits_used);
}

export async function consumeAccountAnalysis(): Promise<boolean> { const { data, error } = await supabase.rpc('consume_viral_blueprint_credit'); return !error && data === true; }
export function getAuthStatusMessage(): string { return 'Secure accounts powered by Supabase'; }
