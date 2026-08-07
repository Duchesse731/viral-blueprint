/**
 * Authentication Types for Viral Blueprint
 * 
 * This module defines the type interfaces for authentication functionality.
 * 
 * SECURITY NOTE:
 * These types are prepared for secure authentication with a real backend.
 * - Passwords must NEVER be stored in plain text
 * - Authentication must be handled server-side
 * - Session tokens must be stored securely (httpOnly cookies)
 * - API credentials must remain server-side
 * 
 * AWAITING BACKEND CONNECTION:
 * The current implementation is a UI-only interface that clearly indicates
 * when the backend authentication service is not connected.
 */

import { CreatorProfile } from './index';

// User account interface
export interface UserAccount {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  emailVerified: boolean;
  lastLoginAt: Date | null;
}

// Registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Login data
export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Password reset request
export interface PasswordResetRequest {
  email: string;
}

// Password reset (with token)
export interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Auth state
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserAccount | null;
  error: string | null;
}

// Auth session
export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
  refreshToken?: string;
}

// Password validation
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

// Password strength rules
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIRE_UPPERCASE = true;
export const PASSWORD_REQUIRE_LOWERCASE = true;
export const PASSWORD_REQUIRE_NUMBER = true;
export const PASSWORD_REQUIRE_SPECIAL = true;

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Validation functions
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  
  if (PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (password.length >= 12) strength = 'strong';
  else if (password.length >= PASSWORD_MIN_LENGTH) strength = 'medium';
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

// Password strength score (0-100)
export function getPasswordStrengthScore(password: string): number {
  if (!password) return 0;
  
  let score = 0;
  
  // Length score
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  
  return Math.min(100, score);
}

// Storage keys for auth (NOT for sensitive data - these are for UI state only)
export const AUTH_STORAGE_KEYS = {
  AUTH_TOKEN: 'viral-blueprint-auth-token',
  USER_EMAIL: 'viral-blueprint-user-email',
  REMEMBER_ME: 'viral-blueprint-remember-me',
  PENDING_RESET: 'viral-blueprint-pending-reset'
};

// IMPORTANT: These keys are for UI state only. In production:
// - Auth tokens MUST be stored in httpOnly cookies
// - Never store passwords in localStorage
// - User ID should be validated server-side on each request

// Account data structure (prepared for backend storage)
export interface UserData {
  user: UserAccount;
  profile: CreatorProfile | null;
  freePlan: {
    totalAnalyses: number;
    usedAnalyses: number;
  };
  subscription: {
    planId: string | null;
    isActive: boolean;
    expiresAt: Date | null;
  } | null;
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
