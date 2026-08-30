'use client';

import type { User } from '@supabase/supabase-js';
import { AuthState, LoginData, PasswordResetData, PasswordResetRequest, RegisterData, UserAccount, validateEmail, validatePassword } from '@/types/auth';
import { getSupabaseClient, isSupabaseConfigured } from '@/services/supabaseClient';

export const AUTH_BACKEND_STATUS = { CONNECTED: isSupabaseConfigured(), PROVIDER: 'Supabase', LAST_CHECK: new Date() };
export interface ValidationResult { isValid: boolean; errors: Record<string, string>; }
const configurationError = () => 'Secure sign-in is temporarily unavailable. Please try again later.';

function mapUser(user: User): UserAccount {
  const fullName = user.user_metadata?.full_name;
  return {
    id: user.id,
    email: user.email || '',
    name: typeof fullName === 'string' && fullName.trim() ? fullName.trim() : (user.email?.split('@')[0] || 'Creator'),
    createdAt: new Date(user.created_at),
    emailVerified: Boolean(user.email_confirmed_at),
    lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
  };
}

export async function getAuthState(): Promise<AuthState> {
  const supabase = getSupabaseClient();
  if (!supabase) return { isAuthenticated: false, isLoading: false, user: null, error: configurationError() };
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { isAuthenticated: false, isLoading: false, user: null, error: null };
  const { data: remaining, error: accessError } = await supabase.rpc('get_viral_blueprint_remaining_credits');
  if (accessError || typeof remaining !== 'number') {
    await supabase.auth.signOut();
    return { isAuthenticated: false, isLoading: false, user: null, error: 'This account does not have Viral Blueprint access.' };
  }
  return { isAuthenticated: true, isLoading: false, user: mapUser(data.user), error: null };
}

export function validateRegistrationData(data: RegisterData): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Name is required'; else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!data.email.trim()) errors.email = 'Email is required'; else if (!validateEmail(data.email)) errors.email = 'Please enter a valid email address';
  const password = validatePassword(data.password); if (!password.isValid) errors.password = password.errors[0];
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
  const password = validatePassword(data.newPassword); if (!password.isValid) errors.newPassword = password.errors[0];
  if (data.newPassword !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return { isValid: Object.keys(errors).length === 0, errors };
}

export async function register(data: RegisterData): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const validation = validateRegistrationData(data);
  if (!validation.isValid) return { success: false, error: Object.values(validation.errors)[0] };
  const supabase = getSupabaseClient(); if (!supabase) return { success: false, error: configurationError() };
  const { data: result, error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(), password: data.password,
    options: { data: { full_name: data.name.trim(), app_id: 'viral-blueprint' }, emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) return { success: false, error: error.message };
  if (!result.session || !result.user) return { success: false, error: 'Account created. Check your email to verify it, then log in.' };
  return { success: true, user: mapUser(result.user) };
}

export async function login(data: LoginData): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  const validation = validateLoginData(data);
  if (!validation.isValid) return { success: false, error: Object.values(validation.errors)[0] };
  const supabase = getSupabaseClient(); if (!supabase) return { success: false, error: configurationError() };
  const { data: result, error } = await supabase.auth.signInWithPassword({ email: data.email.trim().toLowerCase(), password: data.password });
  if (error || !result.user) return { success: false, error: error?.message || 'Login failed.' };
  const { data: remaining, error: accessError } = await supabase.rpc('get_viral_blueprint_remaining_credits');
  if (accessError || typeof remaining !== 'number') {
    await supabase.auth.signOut();
    return { success: false, error: 'This account does not have Viral Blueprint access.' };
  }
  return { success: true, user: mapUser(result.user) };
}

export async function logout(): Promise<{ success: boolean }> {
  const supabase = getSupabaseClient(); if (!supabase) return { success: true };
  const { error } = await supabase.auth.signOut(); return { success: !error };
}

export async function requestPasswordReset(data: PasswordResetRequest): Promise<{ success: boolean; error?: string }> {
  if (!validateEmail(data.email)) return { success: false, error: 'Please enter a valid email address' };
  const supabase = getSupabaseClient(); if (!supabase) return { success: false, error: configurationError() };
  const { error } = await supabase.auth.resetPasswordForEmail(data.email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/` });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
  const validation = validatePasswordResetData(data);
  if (!validation.isValid) return { success: false, error: Object.values(validation.errors)[0] };
  const supabase = getSupabaseClient(); if (!supabase) return { success: false, error: configurationError() };
  const { error } = await supabase.auth.updateUser({ password: data.newPassword });
  if (error) return { success: false, error: error.message };
  await supabase.auth.signOut();
  return { success: true };
}

export async function verifyEmail(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient(); if (!supabase) return { success: false, error: configurationError() };
  const { data, error } = await supabase.auth.getUser();
  return error || !data.user ? { success: false, error: error?.message || 'Email verification failed.' } : { success: true };
}

export function hasPendingPasswordReset(): boolean { return false; }
export function getPendingResetEmail(): string | null { return null; }
export function clearPendingReset(): void {}
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Account deletion requires identity verification and is not connected yet.' };
}

export async function getAccountRemainingAnalyses(): Promise<number> {
  const supabase = getSupabaseClient(); if (!supabase) return 0;
  const { data, error } = await supabase.rpc('get_viral_blueprint_remaining_credits');
  return error || typeof data !== 'number' ? 0 : Math.max(0, data);
}

export async function consumeAccountAnalysis(): Promise<boolean> {
  const supabase = getSupabaseClient(); if (!supabase) return false;
  const { data, error } = await supabase.rpc('consume_viral_blueprint_credit');
  return !error && data === true;
}

export function getAuthStatusMessage(): string {
  return isSupabaseConfigured() ? 'Secure accounts powered by Supabase' : 'Secure account connection is being configured';
}
