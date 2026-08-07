/**
 * Authentication Service for Viral Blueprint
 * 
 * This service provides authentication functionality with clear labeling
 * for when the backend service is not connected.
 * 
 * SECURITY WARNING:
 * ⚠️  AWAITING BACKEND CONNECTION - This implementation is UI-only.
 * 
 * What this means:
 * - This is NOT secure authentication
 * - No passwords should be stored or validated here
 * - No real user sessions are created
 * - All "login" functionality is a demonstration of the interface
 * 
 * When connecting to a real backend:
 * 1. Replace all functions with actual API calls to your auth provider
 * 2. Use server-side authentication (OAuth, JWT, or session-based)
 * 3. Store tokens in httpOnly cookies, NOT localStorage
 * 4. Never handle passwords client-side
 * 5. Keep API keys server-side only
 * 
 * Recommended backend services:
 * - Firebase Auth
 * - Auth0
 * - Supabase Auth
 * - Clerk
 * - Custom Node.js backend with bcrypt + session/JWT
 */

'use client';

import {
  UserAccount,
  RegisterData,
  LoginData,
  PasswordResetRequest,
  PasswordResetData,
  AuthState,
  AUTH_STORAGE_KEYS,
  validateEmail,
  validatePassword
} from '@/types/auth';

// Backend connection status
export const AUTH_BACKEND_STATUS = {
  CONNECTED: false, // Set to true when backend is connected
  PROVIDER: null as string | null, // e.g., 'firebase', 'auth0', 'supabase'
  LAST_CHECK: null as Date | null
};

// Demo mode - when backend is not connected
const DEMO_MODE = true;

// Generate a demo user ID
function generateDemoUserId(): string {
  return `demo_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get current auth state from storage (UI state only)
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, isLoading: false, user: null, error: null };
  }
  
  // Check if there's a stored auth token (demo mode)
  const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
  const storedEmail = localStorage.getItem(AUTH_STORAGE_KEYS.USER_EMAIL);
  
  if (storedToken && storedEmail && DEMO_MODE) {
    // Demo mode - return a mock authenticated state
    return {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'demo-user',
        email: storedEmail,
        name: storedEmail.split('@')[0],
        createdAt: new Date(),
        emailVerified: false,
        lastLoginAt: new Date()
      },
      error: null
    };
  }
  
  return { isAuthenticated: false, isLoading: false, user: null, error: null };
}

// Validate registration data
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateRegistrationData(data: RegisterData): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }
  
  // Confirm password
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Terms acceptance
  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the Terms of Service and Privacy Policy';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validate login data
export function validateLoginData(data: LoginData): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validate password reset data
export function validatePasswordResetData(data: PasswordResetData): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.token) {
    errors.token = 'Invalid reset token';
  }
  
  const passwordValidation = validatePassword(data.newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.errors[0];
  }
  
  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Register new user
export async function register(data: RegisterData): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  // Validate data
  const validation = validateRegistrationData(data);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }
  
  if (DEMO_MODE) {
    // Demo mode - create mock user
    const demoUser: UserAccount = {
      id: generateDemoUserId(),
      email: data.email,
      name: data.name,
      createdAt: new Date(),
      emailVerified: false,
      lastLoginAt: null
    };
    
    // Store demo token (NOT SECURE - demonstration only)
    localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, `demo_token_${demoUser.id}`);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_EMAIL, demoUser.email);
    
    return { success: true, user: demoUser };
  }
  
  // Real backend connection would go here
  // Example:
  // const response = await fetch('/api/auth/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: data.email, name: data.name })
  // });
  
  return { 
    success: false, 
    error: 'Backend authentication not connected. Please deploy the backend service.' 
  };
}

// Login user
export async function login(data: LoginData): Promise<{ success: boolean; error?: string; user?: UserAccount }> {
  // Validate data
  const validation = validateLoginData(data);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }
  
  if (DEMO_MODE) {
    // Demo mode - accept any valid email format with any password
    const demoUser: UserAccount = {
      id: generateDemoUserId(),
      email: data.email,
      name: data.email.split('@')[0],
      createdAt: new Date(),
      emailVerified: true,
      lastLoginAt: new Date()
    };
    
    // Store token if remember me is checked (NOT SECURE - demonstration only)
    if (data.rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, `demo_token_${demoUser.id}`);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER_EMAIL, demoUser.email);
      localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, `demo_token_${demoUser.id}`);
      sessionStorage.setItem(AUTH_STORAGE_KEYS.USER_EMAIL, demoUser.email);
    }
    
    return { success: true, user: demoUser };
  }
  
  // Real backend connection would go here
  // Example:
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: data.email, password: data.password })
  // });
  
  return { 
    success: false, 
    error: 'Backend authentication not connected. Please deploy the backend service.' 
  };
}

// Logout user
export async function logout(): Promise<{ success: boolean }> {
  if (typeof window === 'undefined') {
    return { success: false };
  }
  
  // Clear all auth storage
  localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER_EMAIL);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
  sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER_EMAIL);
  
  return { success: true };
}

// Request password reset
export async function requestPasswordReset(data: PasswordResetRequest): Promise<{ success: boolean; error?: string }> {
  if (!validateEmail(data.email)) {
    return { success: false, error: 'Please enter a valid email address' };
  }
  
  if (DEMO_MODE) {
    // Demo mode - store pending reset
    localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_RESET, data.email);
    
    // In production, this would send an actual email
    console.log(`[DEMO] Password reset requested for: ${data.email}`);
    console.log('[DEMO] In production, an email would be sent with a reset link.');
    
    return { success: true };
  }
  
  // Real backend connection would go here
  return { 
    success: false, 
    error: 'Backend authentication not connected. Please deploy the backend service.' 
  };
}

// Reset password with token
export async function resetPassword(data: PasswordResetData): Promise<{ success: boolean; error?: string }> {
  const validation = validatePasswordResetData(data);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }
  
  if (DEMO_MODE) {
    // Demo mode - just clear the pending reset
    localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_RESET);
    
    console.log(`[DEMO] Password reset completed with token: ${data.token}`);
    console.log('[DEMO] In production, the token would be validated server-side.');
    
    return { success: true };
  }
  
  // Real backend connection would go here
  return { 
    success: false, 
    error: 'Backend authentication not connected. Please deploy the backend service.' 
  };
}

// Verify email (placeholder for when backend is connected)
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  if (DEMO_MODE) {
    console.log(`[DEMO] Email verification with token: ${token}`);
    return { success: true };
  }
  
  // Real backend connection would go here
  return { 
    success: false, 
    error: 'Backend authentication not connected.' 
  };
}

// Check if user has pending password reset
export function hasPendingPasswordReset(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_RESET) !== null;
}

// Get pending reset email
export function getPendingResetEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_RESET);
}

// Clear pending reset
export function clearPendingReset(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_RESET);
}

// Delete account (placeholder)
export async function deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  if (DEMO_MODE) {
    console.log(`[DEMO] Account deletion requested for user: ${userId}`);
    
    // Clear all auth storage
    await logout();
    
    // In production, this would:
    // 1. Verify the user's identity
    // 2. Delete all user data from the database
    // 3. Delete any associated files or assets
    // 4. Cancel any active subscriptions
    // 5. Send a confirmation email
    
    return { success: true };
  }
  
  // Real backend connection would go here
  return { 
    success: false, 
    error: 'Backend authentication not connected.' 
  };
}

// Export auth status for UI display
export function getAuthStatusMessage(): string {
  if (AUTH_BACKEND_STATUS.CONNECTED) {
    return `Authenticated via ${AUTH_BACKEND_STATUS.PROVIDER}`;
  }
  return 'Authentication interface ready — backend connection pending';
}
