'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CreatorProfile, Project, FreePlan, Platform, ContentGoal, ContentTone, AnalysisInput, AnalysisResult, ContentType, Toast as ToastType, ScoreLabel, UploadedFile } from '@/types';
import { UserAccount, RegisterData, LoginData, getPasswordStrengthScore } from '@/types/auth';
import { getProfile, saveProfile, isOnboarded, getProjects, createProject, updateProject, deleteProject, duplicateProject, getProject, saveAnalysisResult, getRemainingAnalyses, useAnalysis, exportReport } from '@/services/storeService';
import { 
  register as performRegister, 
  login as performLogin, 
  logout as performLogout,
  requestPasswordReset,
  getAuthState,
  getAuthStatusMessage,
  deleteAccount as performDeleteAccount,
  validateRegistrationData,
  validateLoginData
} from '@/services/authService';
import { analyzeContent, getScoreLabel, getScoreLabelText } from '@/services/analysisService';
import { 
  processUpload, 
  validateVideoUrl, 
  formatFileSize, 
  formatExpirationDate,
  getAllowedTypesForContentType,
  getMaxFileSize
} from '@/services/fileUploadService';
import { 
  Home, Plus, FolderOpen, FileText, User, Sparkles, 
  ChevronRight, ArrowLeft, Copy, Download, Trash2,
  Check, X, AlertTriangle, Clock, TrendingUp, Zap,
  Target, Eye, Users, ShoppingCart, MessageCircle,
  Play, Edit3, RefreshCw, Save, Settings, LogOut, LogIn,
  Upload, Link, FileCode, Camera, Video, Hash,
  Share2, Star, Award, Info, Mail, Lock, Eye as EyeIcon, EyeOff, Loader, Shield, Key, UserPlus,
  ThumbsUp, MessageSquare, Bookmark, ExternalLink,
  CreditCard, Crown, Menu, Trash
} from 'lucide-react';

// Custom social media icons
function FacebookIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function YoutubeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function TikTokIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>
  );
}

// Screen types (extended with auth screens)
type AuthScreen = 
  | 'welcome'
  | 'login' 
  | 'register'
  | 'forgot-password'
  | 'reset-password';

type MainScreen = 
  | 'onboarding'
  | 'home'
  | 'new-analysis'
  | 'analysis-progress'
  | 'viral-score'
  | 'blueprint'
  | 'script-studio'
  | 'caption-publishing'
  | 'full-report'
  | 'projects'
  | 'project-details'
  | 'plans'
  | 'settings'
  | 'account';

type Screen = AuthScreen | MainScreen;

const AUDIENCE_PRESETS = [
  'Gen Z (ages 14–29)',
  'Millennials (ages 30–45)',
  'Gen X (ages 46–61)',
  'Baby Boomers (ages 62–80)',
  'All adults',
];

function AudiencePresetButtons({ onSelect }: { onSelect: (audience: string) => void }) {
  return (
    <div className="audience-presets" aria-label="Target audience shortcuts">
      {AUDIENCE_PRESETS.map(audience => (
        <button
          key={audience}
          type="button"
          className="audience-preset"
          onClick={() => onSelect(audience)}
        >
          {audience}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// AUTH SCREENS
// ============================================================================

// Welcome Screen
function WelcomeScreen({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: () => void }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="logo-icon">
            <div className="logo-grid">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <rect x="10" y="10" width="80" height="80" fill="none" stroke="var(--color-electric-purple)" strokeWidth="1" opacity="0.3" />
                <rect x="20" y="20" width="60" height="60" fill="none" stroke="var(--color-electric-purple)" strokeWidth="1" opacity="0.4" />
                <rect x="30" y="30" width="40" height="40" fill="none" stroke="var(--color-bright-cyan)" strokeWidth="1" opacity="0.5" />
                <polygon points="40,35 40,65 65,50" fill="var(--color-electric-purple)" />
                <line x1="20" y1="20" x2="80" y2="80" stroke="var(--color-bright-cyan)" strokeWidth="0.5" opacity="0.3" />
                <line x1="80" y1="20" x2="20" y2="80" stroke="var(--color-bright-cyan)" strokeWidth="0.5" opacity="0.3" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="welcome-title">
          <span className="text-gradient">Viral Blueprint</span>
        </h1>

        <p className="welcome-subtitle">
          Evaluate and improve your content before publishing. Get practical 
          improvement blueprints based on real, explainable criteria.
        </p>

        <div className="welcome-disclaimer">
          <AlertTriangle size={18} />
          <span>
            Viral Blueprint improves content preparation but cannot guarantee 
            viral performance. Success depends on timing, audience engagement, 
            and platform algorithms.
          </span>
        </div>

        <div className="welcome-actions">
          <button className="btn btn-primary btn-lg full-width" onClick={onGetStarted}>
            <UserPlus size={20} />
            Get Started
          </button>
          <button className="btn btn-secondary btn-lg full-width" onClick={onLogin}>
            <LogIn size={20} />
            Log In
          </button>
        </div>

        <div className="auth-status-notice">
          <Shield size={16} />
          <span>{getAuthStatusMessage()}</span>
        </div>

        <div className="welcome-platforms">
          <span className="text-muted text-sm">Supports content for:</span>
          <div className="platform-icons">
            <FacebookIcon size={24} />
            <InstagramIcon size={24} />
            <YoutubeIcon size={24} />
            <TikTokIcon size={24} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .welcome-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
        }

        .welcome-content {
          max-width: 500px;
          text-align: center;
        }

        .welcome-logo {
          margin-bottom: var(--spacing-xl);
        }

        .logo-icon {
          display: inline-block;
          animation: glow 3s ease-in-out infinite;
        }

        .welcome-title {
          font-size: var(--font-size-5xl);
          margin-bottom: var(--spacing-lg);
        }

        .welcome-subtitle {
          font-size: var(--font-size-lg);
          color: var(--color-gray-300);
          margin-bottom: var(--spacing-xl);
          line-height: 1.7;
        }

        .welcome-disclaimer {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
          text-align: left;
          color: var(--color-warning-light);
          font-size: var(--font-size-sm);
        }

        .welcome-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .btn-secondary {
          background: var(--color-gray-800);
          border: 2px solid var(--color-gray-700);
          color: var(--color-white);
        }

        .btn-secondary:hover {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.1);
        }

        .auth-status-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-xl);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .welcome-platforms {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }

        .platform-icons {
          display: flex;
          gap: var(--spacing-lg);
          color: var(--color-gray-500);
        }

        @media (max-width: 640px) {
          .welcome-title {
            font-size: var(--font-size-4xl);
          }
        }
      `}</style>
    </div>
  );
}

// Log In Screen
function LoginScreen({ onLogin, onBack, onRegister, onForgotPassword }: {
  onLogin: (user: UserAccount) => void;
  onBack: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const validation = validateLoginData({ email, password, rememberMe });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setError('');
    setIsLoading(true);

    try {
      const result = await performLogin({ email, password, rememberMe });
      
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <User size={32} />
          </div>
          <h2>Welcome Back</h2>
          <p>Log in to your Viral Blueprint account</p>
        </div>

        <div className="auth-status-notice">
          <Shield size={16} />
          <span>{getAuthStatusMessage()}</span>
        </div>

        {error && (
          <div className="auth-error">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <div className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className={`form-input with-icon ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input with-icon ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-row-between">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
            <button className="link-btn" onClick={onForgotPassword}>
              Forgot Password?
            </button>
          </div>

          <button
            className="btn btn-primary btn-lg full-width"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={20} className="spinner" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Log In
              </>
            )}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button className="link-btn" onClick={onRegister}>
              Create Account
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
        }

        .back-btn {
          position: absolute;
          top: var(--spacing-lg);
          left: var(--spacing-lg);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-gray-800);
          border: 1px solid var(--color-gray-700);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .auth-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: var(--radius-full);
          color: var(--color-electric-purple);
          margin-bottom: var(--spacing-md);
        }

        .auth-header h2 {
          margin-bottom: var(--spacing-xs);
        }

        .auth-header p {
          color: var(--color-gray-400);
        }

        .auth-status-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-error);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-gray-300);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gray-500);
        }

        .input-with-icon input {
          padding-left: calc(var(--spacing-md) + 28px);
          padding-right: calc(var(--spacing-md) + 36px);
        }

        .input-with-icon input.error {
          border-color: var(--color-error);
        }

        .password-toggle {
          position: absolute;
          right: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-gray-500);
          cursor: pointer;
          padding: var(--spacing-xs);
        }

        .password-toggle:hover {
          color: var(--color-white);
        }

        .error-text {
          font-size: var(--font-size-sm);
          color: var(--color-error);
        }

        .form-row-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--color-electric-purple);
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--color-electric-purple);
          cursor: pointer;
          font-size: var(--font-size-sm);
          padding: 0;
        }

        .link-btn:hover {
          text-decoration: underline;
        }

        .auth-footer {
          margin-top: var(--spacing-xl);
          text-align: center;
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Register Screen
function RegisterScreen({ onRegister, onBack, onLogin }: {
  onRegister: (user: UserAccount) => void;
  onBack: () => void;
  onLogin: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrengthScore(password);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'var(--color-error)';
    if (passwordStrength < 70) return 'var(--color-warning-light)';
    return 'var(--color-success)';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async () => {
    const validation = validateRegistrationData({
      name,
      email,
      password,
      confirmPassword,
      acceptTerms
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setError('');
    setIsLoading(true);

    try {
      const result = await performRegister({
        name,
        email,
        password,
        confirmPassword,
        acceptTerms
      });
      
      if (result.success && result.user) {
        onRegister(result.user);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={32} />
          </div>
          <h2>Create Account</h2>
          <p>Start your content optimization journey</p>
        </div>

        <div className="auth-status-notice">
          <Shield size={16} />
          <span>{getAuthStatusMessage()}</span>
        </div>

        {error && (
          <div className="auth-error">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <div className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className={`form-input with-icon ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className={`form-input with-icon ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input with-icon ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${passwordStrength}%`,
                      backgroundColor: getStrengthColor()
                    }} 
                  />
                </div>
                <span style={{ color: getStrengthColor() }}>{getStrengthLabel()}</span>
              </div>
            )}
            {errors.password && <span className="error-text">{errors.password}</span>}
            <p className="password-hint">Min 8 characters with uppercase, lowercase, number, and special character</p>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input with-icon ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={isLoading}
              />
              <span>
                I accept the{' '}
                <button className="link-btn">Terms of Service</button>
                {' '}and{' '}
                <button className="link-btn">Privacy Policy</button>
              </span>
            </label>
            {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
          </div>

          <button
            className="btn btn-primary btn-lg full-width"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={20} className="spinner" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button className="link-btn" onClick={onLogin}>
              Log In
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
        }

        .back-btn {
          position: absolute;
          top: var(--spacing-lg);
          left: var(--spacing-lg);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-gray-800);
          border: 1px solid var(--color-gray-700);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .auth-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: var(--radius-full);
          color: var(--color-electric-purple);
          margin-bottom: var(--spacing-md);
        }

        .auth-header h2 {
          margin-bottom: var(--spacing-xs);
        }

        .auth-header p {
          color: var(--color-gray-400);
        }

        .auth-status-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-error);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-gray-300);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gray-500);
        }

        .input-with-icon input {
          padding-left: calc(var(--spacing-md) + 28px);
          padding-right: calc(var(--spacing-md) + 36px);
        }

        .input-with-icon input.error {
          border-color: var(--color-error);
        }

        .password-toggle {
          position: absolute;
          right: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-gray-500);
          cursor: pointer;
          padding: var(--spacing-xs);
        }

        .password-toggle:hover {
          color: var(--color-white);
        }

        .error-text {
          font-size: var(--font-size-sm);
          color: var(--color-error);
        }

        .password-strength {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-xs);
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: var(--color-gray-700);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .password-hint {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          margin-top: var(--spacing-xs);
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          cursor: pointer;
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          margin-top: 2px;
          accent-color: var(--color-electric-purple);
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--color-electric-purple);
          cursor: pointer;
          font-size: var(--font-size-sm);
          padding: 0;
        }

        .link-btn:hover {
          text-decoration: underline;
        }

        .auth-footer {
          margin-top: var(--spacing-xl);
          text-align: center;
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Forgot Password Screen
function ForgotPasswordScreen({ onBack, onLogin }: {
  onBack: () => void;
  onLogin: () => void;
}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await requestPasswordReset({ email });
      
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Key size={32} />
          </div>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a reset link</p>
        </div>

        {isSuccess ? (
          <div className="success-message">
            <Check size={48} />
            <h3>Check Your Email</h3>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and click the link to reset your password.
            </p>
            <p className="demo-note">
              <Info size={16} />
              Demo mode: In production, an actual email would be sent.
            </p>
            <button className="btn btn-primary btn-lg full-width" onClick={onLogin}>
              <LogIn size={20} />
              Back to Log In
            </button>
          </div>
        ) : (
          <>
            <div className="auth-status-notice">
              <Shield size={16} />
              <span>{getAuthStatusMessage()}</span>
            </div>

            {error && (
              <div className="auth-error">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <div className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="form-input with-icon"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg full-width"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={20} />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <button className="link-btn" onClick={onLogin}>
                  Log In
                </button>
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .auth-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
        }

        .back-btn {
          position: absolute;
          top: var(--spacing-lg);
          left: var(--spacing-lg);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-gray-800);
          border: 1px solid var(--color-gray-700);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .auth-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: var(--radius-full);
          color: var(--color-electric-purple);
          margin-bottom: var(--spacing-md);
        }

        .auth-header h2 {
          margin-bottom: var(--spacing-xs);
        }

        .auth-header p {
          color: var(--color-gray-400);
        }

        .auth-status-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-error);
        }

        .success-message {
          text-align: center;
        }

        .success-message :global(svg) {
          color: var(--color-success);
          margin-bottom: var(--spacing-md);
        }

        .success-message h3 {
          margin-bottom: var(--spacing-md);
        }

        .success-message p {
          color: var(--color-gray-400);
          margin-bottom: var(--spacing-md);
        }

        .demo-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-lg);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-gray-300);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gray-500);
        }

        .input-with-icon input {
          padding-left: calc(var(--spacing-md) + 28px);
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--color-electric-purple);
          cursor: pointer;
          font-size: var(--font-size-sm);
          padding: 0;
        }

        .link-btn:hover {
          text-decoration: underline;
        }

        .auth-footer {
          margin-top: var(--spacing-xl);
          text-align: center;
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Reset Password Screen
function ResetPasswordScreen({ onSuccess, onBack }: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  // In a real app, this would come from the URL
  const resetToken = 'demo-token';

  const passwordStrength = getPasswordStrengthScore(newPassword);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return 'var(--color-error)';
    if (passwordStrength < 70) return 'var(--color-warning-light)';
    return 'var(--color-success)';
  };

  const getStrengthLabel = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }

    setErrors({});
    setError('');
    setIsLoading(true);

    try {
      const result = await requestPasswordReset({ email: '' });
      
      // In demo mode, just show success
      setIsSuccess(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <Lock size={32} />
          </div>
          <h2>Set New Password</h2>
          <p>Create a new secure password for your account</p>
        </div>

        {isSuccess ? (
          <div className="success-message">
            <Check size={48} />
            <h3>Password Reset Complete</h3>
            <p>Your password has been successfully reset.</p>
            <p className="demo-note">
              <Info size={16} />
              Demo mode: In production, your password would be updated securely.
            </p>
            <button className="btn btn-primary btn-lg full-width" onClick={onSuccess}>
              <LogIn size={20} />
              Continue to Log In
            </button>
          </div>
        ) : (
          <>
            <div className="auth-status-notice">
              <Shield size={16} />
              <span>{getAuthStatusMessage()}</span>
            </div>

            {error && (
              <div className="auth-error">
                <AlertTriangle size={18} />
                {error}
              </div>
            )}

            <div className="auth-form">
              <div className="form-group">
                <label>New Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input with-icon ${errors.newPassword ? 'error' : ''}`}
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill" 
                        style={{ 
                          width: `${passwordStrength}%`,
                          backgroundColor: getStrengthColor()
                        }} 
                      />
                    </div>
                    <span style={{ color: getStrengthColor() }}>{getStrengthLabel()}</span>
                  </div>
                )}
                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                <p className="password-hint">Min 8 characters with uppercase, lowercase, number, and special character</p>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input with-icon ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button
                className="btn btn-primary btn-lg full-width"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .auth-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
        }

        .back-btn {
          position: absolute;
          top: var(--spacing-lg);
          left: var(--spacing-lg);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--color-gray-800);
          border: 1px solid var(--color-gray-700);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .auth-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: var(--radius-full);
          color: var(--color-electric-purple);
          margin-bottom: var(--spacing-md);
        }

        .auth-header h2 {
          margin-bottom: var(--spacing-xs);
        }

        .auth-header p {
          color: var(--color-gray-400);
        }

        .auth-status-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-error);
        }

        .success-message {
          text-align: center;
        }

        .success-message :global(svg) {
          color: var(--color-success);
          margin-bottom: var(--spacing-md);
        }

        .success-message h3 {
          margin-bottom: var(--spacing-md);
        }

        .success-message p {
          color: var(--color-gray-400);
          margin-bottom: var(--spacing-md);
        }

        .demo-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-lg);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-gray-300);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gray-500);
        }

        .input-with-icon input {
          padding-left: calc(var(--spacing-md) + 28px);
          padding-right: calc(var(--spacing-md) + 36px);
        }

        .input-with-icon input.error {
          border-color: var(--color-error);
        }

        .password-toggle {
          position: absolute;
          right: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-gray-500);
          cursor: pointer;
          padding: var(--spacing-xs);
        }

        .password-toggle:hover {
          color: var(--color-white);
        }

        .error-text {
          font-size: var(--font-size-sm);
          color: var(--color-error);
        }

        .password-strength {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-xs);
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: var(--color-gray-700);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .password-hint {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          margin-top: var(--spacing-xs);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Account Settings Screen
function AccountSettingsScreen({ user, onDeleteAccount, onBack }: {
  user: UserAccount;
  onDeleteAccount: () => void;
  onBack: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      onDeleteAccount();
    }
  };

  return (
    <div className="settings-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Settings
      </button>

      <div className="settings-header">
        <h2>Account Settings</h2>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="settings-card">
        <h3>Account Information</h3>
        <div className="info-row">
          <span className="info-label">Name</span>
          <span className="info-value">{user.name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value">{user.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email Verified</span>
          <span className="info-value">
            {user.emailVerified ? (
              <span className="badge success"><Check size={14} /> Verified</span>
            ) : (
              <span className="badge warning"><AlertTriangle size={14} /> Not Verified</span>
            )}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Member Since</span>
          <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="settings-card danger-zone">
        <h3>Danger Zone</h3>
        <p className="danger-description">
          Deleting your account will permanently remove all your data, including:
        </p>
        <ul>
          <li>Your profile and preferences</li>
          <li>All projects and analysis results</li>
          <li>Your subscription and billing information</li>
        </ul>
        
        {showDeleteConfirm ? (
          <div className="delete-confirm">
            <p>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              className="form-input"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <div className="delete-actions">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
              >
                <Trash size={16} />
                Delete Account Permanently
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="btn btn-outline-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash size={16} />
            Delete Account
          </button>
        )}
      </div>

      <style jsx>{`
        .settings-screen {
          max-width: 600px;
          margin: 0 auto;
          padding: var(--spacing-xl);
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .settings-header {
          margin-bottom: var(--spacing-xl);
        }

        .settings-header h2 {
          margin-bottom: var(--spacing-xs);
        }

        .settings-header p {
          color: var(--color-gray-400);
        }

        .settings-card {
          background: var(--color-gray-800);
          border: 1px solid var(--color-gray-700);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .settings-card h3 {
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-gray-700);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
        }

        .info-label {
          color: var(--color-gray-400);
        }

        .info-value {
          color: var(--color-white);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
        }

        .badge.success {
          background: rgba(34, 197, 94, 0.1);
          color: var(--color-success);
        }

        .badge.warning {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning-light);
        }

        .danger-zone {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .danger-zone h3 {
          color: var(--color-error);
        }

        .danger-description {
          color: var(--color-gray-400);
          margin-bottom: var(--spacing-md);
        }

        .danger-zone ul {
          margin-bottom: var(--spacing-lg);
          padding-left: var(--spacing-lg);
          color: var(--color-gray-400);
        }

        .danger-zone li {
          margin-bottom: var(--spacing-xs);
        }

        .btn-outline-danger {
          background: transparent;
          border: 2px solid var(--color-error);
          color: var(--color-error);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: all var(--transition-fast);
        }

        .btn-outline-danger:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .btn-danger {
          background: var(--color-error);
          border: none;
          color: white;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: all var(--transition-fast);
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-confirm {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
        }

        .delete-confirm p {
          margin-bottom: var(--spacing-md);
          color: var(--color-gray-300);
        }

        .delete-actions {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// MAIN APP SCREEN
// ============================================================================

interface AppState {
  screen: Screen;
  user: UserAccount | null;
  isAuthenticated: boolean;
  profile: CreatorProfile | null;
  projects: Project[];
  currentProject: Project | null;
  remainingAnalyses: number;
  analysisInput: Partial<AnalysisInput>;
  toast: ToastType | null;
  isProcessing: boolean;
  mobileMenuOpen: boolean;
  isDemoAnalysis: boolean;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  'youtube-shorts': 'YouTube Shorts'
};

const GOAL_LABELS: Record<ContentGoal, string> = {
  views: 'Views',
  engagement: 'Engagement',
  followers: 'Followers',
  leads: 'Leads',
  sales: 'Sales'
};

const TONE_LABELS: Record<ContentTone, string> = {
  professional: 'Professional',
  casual: 'Casual',
  humorous: 'Humorous',
  inspirational: 'Inspirational',
  educational: 'Educational',
  entertaining: 'Entertaining',
  dramatic: 'Dramatic'
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  topic: 'Topic / Idea',
  hook: 'Hook / Title',
  caption: 'Caption',
  script: 'Script',
  transcript: 'Transcript',
  image: 'Image',
  video: 'Video',
  'video-link': 'Video Link'
};

export default function App() {
  const [state, setState] = useState<AppState>({
    screen: 'welcome',
    user: null,
    isAuthenticated: false,
    profile: null,
    projects: [],
    currentProject: null,
    remainingAnalyses: 0,
    analysisInput: {},
    toast: null,
    isProcessing: false,
    mobileMenuOpen: false,
    isDemoAnalysis: false
  });

  // Load initial data and check auth state
  useEffect(() => {
    const profile = getProfile();
    const onboarded = isOnboarded();
    const projects = getProjects();
    const remaining = getRemainingAnalyses();
    const authState = getAuthState();

    if (authState.isAuthenticated && authState.user) {
      // User is authenticated - go to home or stay at current screen
      setState(prev => ({
        ...prev,
        user: authState.user,
        isAuthenticated: true,
        profile,
        projects,
        remainingAnalyses: remaining,
        // If not authenticated, show welcome; otherwise check onboarding
        screen: prev.screen === 'welcome' ? (onboarded && profile ? 'home' : 'onboarding') : prev.screen
      }));
    } else {
      // Not authenticated - show welcome screen
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        profile,
        projects,
        remainingAnalyses: remaining
      }));
    }
  }, []);

  // Handle user login
  const handleLogin = useCallback((user: UserAccount) => {
    const profile = getProfile();
    const onboarded = isOnboarded();
    
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      profile,
      // Go to onboarding if not onboarded, otherwise go to home
      screen: onboarded && profile ? 'home' : 'onboarding'
    }));
  }, []);

  // Handle user logout
  const handleLogout = useCallback(async () => {
    await performLogout();
    
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      profile: null,
      screen: 'welcome'
    }));
  }, []);

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
    if (state.user) {
      await performDeleteAccount(state.user.id);
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        profile: null,
        projects: [],
        screen: 'welcome'
      }));
    }
  }, [state.user]);

  // Show toast
  const showToast = useCallback((message: string, type: ToastType['type']) => {
    setState(prev => ({ ...prev, toast: { id: Date.now().toString(), message, type } }));
    setTimeout(() => setState(prev => ({ ...prev, toast: null })), 3000);
  }, []);

  // Navigation
  const navigate = useCallback((screen: Screen, data?: Partial<Project>) => {
    if (data && 'id' in data) {
      const project = getProject((data as Project).id);
      setState(prev => ({ ...prev, screen, currentProject: project, mobileMenuOpen: false }));
    } else {
      setState(prev => ({ ...prev, screen, currentProject: null, mobileMenuOpen: false }));
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback((profile: CreatorProfile) => {
    saveProfile(profile);
    setState(prev => ({
      ...prev,
      screen: 'home',
      profile,
      remainingAnalyses: getRemainingAnalyses()
    }));
  }, []);

  // Update profile
  const handleUpdateProfile = useCallback((updates: Partial<CreatorProfile>) => {
    if (state.profile) {
      const updated = { ...state.profile, ...updates };
      saveProfile(updated);
      setState(prev => ({ ...prev, profile: updated }));
      showToast('Profile updated successfully', 'success');
    }
  }, [state.profile, showToast]);

  // Start new analysis
  const handleStartAnalysis = useCallback((input: Partial<AnalysisInput>) => {
    setState(prev => ({ ...prev, analysisInput: input }));
    navigate('analysis-progress');
  }, [navigate]);

  // Perform analysis
  const performAnalysis = useCallback(async () => {
    const input = state.analysisInput as AnalysisInput;
    
    // Validate required fields
    const hasContent = input.content?.trim() || input.uploadedFile || input.videoLink?.trim();
    if (!hasContent || !input.targetPlatform || !input.goal) {
      showToast('Please fill in all required fields', 'error');
      navigate('new-analysis');
      return;
    }

    if (state.remainingAnalyses <= 0) {
      showToast('No analyses remaining. Please upgrade your plan.', 'error');
      navigate('plans');
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, isDemoAnalysis: true }));

    try {
      // Generate title based on content type
      let title = input.content?.substring(0, 50) || '';
      if (input.uploadedFile) {
        title = input.uploadedFile.name.substring(0, 47) + '...';
      } else if (input.videoLink) {
        title = 'Video Link Analysis';
      }
      if (!title) {
        title = 'Untitled Content';
      }
      
      // Create project
      const project = createProject({
        title,
        content: input.content || '',
        contentType: input.contentType || 'topic',
        targetPlatform: input.targetPlatform,
        goal: input.goal,
        tone: input.tone || 'casual',
        targetAudience: input.targetAudience || state.profile?.targetAudience || ''
      });

      // Perform analysis (passes full input including uploadedFile and videoLink)
      const result = await analyzeContent(input);

      // A credit is consumed only after a successful analysis. Failed or cancelled
      // requests never reduce the user's remaining total.
      useAnalysis();
      
      // Save analysis result
      const updatedProject = saveAnalysisResult(project.id, result);
      
      // Update state
      const projects = getProjects();
      const remaining = getRemainingAnalyses();
      
      setState(prev => ({
        ...prev,
        screen: 'viral-score',
        currentProject: updatedProject,
        projects,
        remainingAnalyses: remaining,
        isProcessing: false
      }));
    } catch {
      showToast('Analysis failed. Please try again.', 'error');
      setState(prev => ({ ...prev, isProcessing: false, isDemoAnalysis: false }));
    }
  }, [state.analysisInput, state.remainingAnalyses, state.profile, showToast, navigate]);

  // Cancel analysis
  const handleCancelAnalysis = useCallback(() => {
    navigate('home');
  }, [navigate]);

  // Regenerate section
  const handleRegenerateSection = useCallback((section: string) => {
    showToast(`${section} regenerated`, 'success');
  }, [showToast]);

  // Delete project
  const handleDeleteProject = useCallback((id: string) => {
    if (deleteProject(id)) {
      setState(prev => ({
        ...prev,
        projects: getProjects(),
        currentProject: null
      }));
      navigate('projects');
      showToast('Project deleted', 'success');
    }
  }, [navigate, showToast]);

  // Duplicate project
  const handleDuplicateProject = useCallback((id: string) => {
    const duplicated = duplicateProject(id);
    if (duplicated) {
      setState(prev => ({
        ...prev,
        projects: getProjects()
      }));
      showToast('Project duplicated', 'success');
    }
  }, [showToast]);

  // Export report
  const handleExportReport = useCallback(() => {
    if (!state.currentProject) return;
    const report = exportReport(state.currentProject);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viral-blueprint-report-${state.currentProject.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Report downloaded', 'success');
  }, [state.currentProject, showToast]);

  // Copy to clipboard
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  }, [showToast]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setState(prev => ({ ...prev, mobileMenuOpen: false }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render based on current screen
  const renderScreen = () => {
    // Auth screens (available without authentication)
    if (state.screen === 'welcome') {
      return (
        <WelcomeScreen 
          onGetStarted={() => navigate('register')} 
          onLogin={() => navigate('login')}
        />
      );
    }
    if (state.screen === 'login') {
      return (
        <LoginScreen 
          onLogin={handleLogin} 
          onBack={() => navigate('welcome')} 
          onRegister={() => navigate('register')}
          onForgotPassword={() => navigate('forgot-password')}
        />
      );
    }
    if (state.screen === 'register') {
      return (
        <RegisterScreen 
          onRegister={handleLogin} 
          onBack={() => navigate('welcome')} 
          onLogin={() => navigate('login')}
        />
      );
    }
    if (state.screen === 'forgot-password') {
      return (
        <ForgotPasswordScreen 
          onBack={() => navigate('login')} 
          onLogin={() => navigate('login')}
        />
      );
    }
    if (state.screen === 'reset-password') {
      return (
        <ResetPasswordScreen 
          onSuccess={() => navigate('login')} 
          onBack={() => navigate('login')}
        />
      );
    }
    
    // Protected screens (require authentication)
    if (!state.isAuthenticated) {
      return (
        <WelcomeScreen 
          onGetStarted={() => navigate('register')} 
          onLogin={() => navigate('login')}
        />
      );
    }

    switch (state.screen) {
      case 'onboarding':
        return <OnboardingScreen onComplete={completeOnboarding} onBack={() => handleLogout()} />;
      case 'home':
        return (
          <DashboardScreen 
            profile={state.profile}
            projects={state.projects}
            remainingAnalyses={state.remainingAnalyses}
            onNewAnalysis={() => navigate('new-analysis')}
            onCreateFromIdea={() => navigate('new-analysis')}
            onOpenProject={(id) => navigate('project-details', { id } as Project)}
            onNavigate={navigate}
          />
        );
      case 'new-analysis':
        return (
          <NewAnalysisScreen 
            profile={state.profile}
            onSubmit={handleStartAnalysis}
            onBack={() => navigate('home')}
          />
        );
      case 'analysis-progress':
        return (
          <AnalysisProgressScreen 
            onComplete={performAnalysis}
            onCancel={handleCancelAnalysis}
            isProcessing={state.isProcessing}
          />
        );
      case 'viral-score':
        return (
          <ViralScoreScreen 
            project={state.currentProject}
            onViewBlueprint={() => navigate('blueprint')}
            onBack={() => navigate('home')}
          />
        );
      case 'blueprint':
        return (
          <BlueprintScreen 
            project={state.currentProject}
            onRegenerate={handleRegenerateSection}
            onViewScriptStudio={() => navigate('script-studio')}
            onViewCaption={() => navigate('caption-publishing')}
            onViewFullReport={() => navigate('full-report')}
            onCopy={handleCopy}
            onBack={() => navigate('viral-score')}
          />
        );
      case 'script-studio':
        return (
          <ScriptStudioScreen 
            project={state.currentProject}
            onCopy={handleCopy}
            onSave={() => showToast('Script saved', 'success')}
            onBack={() => navigate('blueprint')}
          />
        );
      case 'caption-publishing':
        return (
          <CaptionPublishingScreen 
            project={state.currentProject}
            onCopy={handleCopy}
            onBack={() => navigate('blueprint')}
          />
        );
      case 'full-report':
        return (
          <FullReportScreen 
            project={state.currentProject}
            onExport={handleExportReport}
            onCopy={handleCopy}
            onBack={() => navigate('blueprint')}
          />
        );
      case 'projects':
        return (
          <ProjectsScreen 
            projects={state.projects}
            onOpenProject={(id) => navigate('project-details', { id } as Project)}
            onDuplicate={handleDuplicateProject}
            onDelete={handleDeleteProject}
            onNewAnalysis={() => navigate('new-analysis')}
            onBack={() => navigate('home')}
          />
        );
      case 'project-details':
        return (
          <ProjectDetailsScreen 
            project={state.currentProject}
            onBack={() => navigate('projects')}
            onDelete={handleDeleteProject}
            onDuplicate={handleDuplicateProject}
            onExport={handleExportReport}
            onCopy={handleCopy}
            onViewBlueprint={() => navigate('blueprint')}
            onViewScriptStudio={() => navigate('script-studio')}
            onViewCaption={() => navigate('caption-publishing')}
            onViewFullReport={() => navigate('full-report')}
          />
        );
      case 'plans':
        return (
          <PlansScreen 
            remainingAnalyses={state.remainingAnalyses}
            onBack={() => navigate('home')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen 
            profile={state.profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => navigate('home')}
            onSignOut={handleLogout}
            onManageAccount={() => navigate('account')}
          />
        );
      case 'account':
        return state.user ? (
          <AccountSettingsScreen 
            user={state.user}
            onDeleteAccount={handleDeleteAccount}
            onBack={() => navigate('settings')}
          />
        ) : (
          <WelcomeScreen 
            onGetStarted={() => navigate('register')} 
            onLogin={() => navigate('login')}
          />
        );
      default:
        return (
          <WelcomeScreen 
            onGetStarted={() => navigate('register')} 
            onLogin={() => navigate('login')}
          />
        );
    }
  };

  const showSidebar = ['home', 'new-analysis', 'projects', 'plans', 'settings'].includes(state.screen);
  const showMobileNav = ['home', 'projects', 'settings'].includes(state.screen);

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      {showSidebar && state.screen !== 'new-analysis' && state.screen !== 'analysis-progress' && (
        <Sidebar 
          currentScreen={state.screen}
          onNavigate={navigate}
          remainingAnalyses={state.remainingAnalyses}
        />
      )}

      {/* Main Content */}
      <main className={`main-content ${showSidebar && state.screen !== 'new-analysis' && state.screen !== 'analysis-progress' ? 'with-sidebar' : ''}`}>
        {renderScreen()}
      </main>

      {/* Mobile Bottom Navigation */}
      {showMobileNav && (
        <MobileNav 
          currentScreen={state.screen}
          onNavigate={navigate}
          remainingAnalyses={state.remainingAnalyses}
        />
      )}

      {/* Mobile Menu Overlay */}
      {state.mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setState(prev => ({ ...prev, mobileMenuOpen: false }))}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <MobileMenuContent 
              currentScreen={state.screen}
              onNavigate={(screen) => {
                setState(prev => ({ ...prev, mobileMenuOpen: false }));
                navigate(screen);
              }}
            />
          </div>
        </div>
      )}

      {/* Toast */}
      {state.toast && (
        <div className={`toast toast-${state.toast.type}`}>
          {state.toast.type === 'success' && <Check size={18} />}
          {state.toast.type === 'error' && <X size={18} />}
          {state.toast.message}
        </div>
      )}

      <style jsx global>{`
        .app-container {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          min-height: 100vh;
          padding: var(--spacing-xl);
        }

        .main-content.with-sidebar {
          margin-left: 260px;
        }

        @media (max-width: 768px) {
          .main-content {
            padding: var(--spacing-md);
            padding-bottom: 100px;
          }

          .main-content.with-sidebar {
            margin-left: 0;
          }
        }

        /* Sidebar Styles */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 260px;
          height: 100vh;
          background: var(--color-midnight-light);
          border-right: 1px solid var(--color-gray-800);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .sidebar-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--color-electric-purple) 0%, var(--color-bright-cyan) 100%);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-logo-text {
          font-size: var(--font-size-lg);
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-electric-purple) 0%, var(--color-bright-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          color: var(--color-gray-400);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
          background: transparent;
          width: 100%;
          font-size: var(--font-size-base);
          font-family: var(--font-family);
          text-align: left;
        }

        .sidebar-nav-item:hover {
          background: var(--color-gray-800);
          color: var(--color-white);
        }

        .sidebar-nav-item.active {
          background: rgba(139, 92, 246, 0.15);
          color: var(--color-electric-purple-light);
        }

        .sidebar-footer {
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-gray-800);
        }

        .sidebar-usage {
          background: var(--color-gray-800);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .sidebar-usage-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
          margin-bottom: var(--spacing-xs);
        }

        .sidebar-usage-value {
          font-size: var(--font-size-xl);
          font-weight: 700;
          color: var(--color-bright-cyan);
        }

        /* Mobile Nav */
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-midnight-light);
          border-top: 1px solid var(--color-gray-800);
          padding: var(--spacing-sm) var(--spacing-md);
          z-index: 100;
        }

        .mobile-nav-items {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm);
          color: var(--color-gray-400);
          cursor: pointer;
          border: none;
          background: transparent;
          font-size: var(--font-size-xs);
          font-family: var(--font-family);
        }

        .mobile-nav-item.active {
          color: var(--color-electric-purple-light);
        }

        .mobile-nav-item.analyze {
          background: var(--color-electric-purple);
          color: var(--color-white);
          border-radius: var(--radius-full);
          padding: var(--spacing-md) var(--spacing-lg);
          margin-top: -30px;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .mobile-nav {
            display: block;
          }
        }

        /* Mobile Menu */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 200;
        }

        .mobile-menu {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: var(--color-midnight-light);
          padding: var(--spacing-lg);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }
      `}</style>
    </div>
  );
}

// Sidebar Component
function Sidebar({ 
  currentScreen, 
  onNavigate, 
  remainingAnalyses 
}: { 
  currentScreen: Screen; 
  onNavigate: (screen: Screen) => void;
  remainingAnalyses: number;
}) {
  const navItems = [
    { id: 'home' as Screen, label: 'Home', icon: Home },
    { id: 'new-analysis' as Screen, label: 'New Analysis', icon: Plus },
    { id: 'projects' as Screen, label: 'Projects', icon: FolderOpen },
    { id: 'plans' as Screen, label: 'Plans', icon: CreditCard },
    { id: 'settings' as Screen, label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Play size={20} color="white" />
        </div>
        <span className="sidebar-logo-text">Viral Blueprint</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentScreen === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-usage">
          <div className="sidebar-usage-label">Free Analyses Remaining</div>
          <div className="sidebar-usage-value">{remainingAnalyses}</div>
        </div>
        <button 
          className="sidebar-nav-item"
          onClick={() => onNavigate('plans')}
        >
          <Crown size={20} />
          Upgrade to Pro
        </button>
      </div>
    </aside>
  );
}

// Mobile Navigation Component
function MobileNav({ 
  currentScreen, 
  onNavigate, 
  remainingAnalyses 
}: { 
  currentScreen: Screen; 
  onNavigate: (screen: Screen) => void;
  remainingAnalyses: number;
}) {
  const navItems = [
    { id: 'home' as Screen, label: 'Home', icon: Home },
    { id: 'projects' as Screen, label: 'Projects', icon: FolderOpen },
    { id: 'new-analysis' as Screen, label: 'Analyze', icon: Sparkles, isSpecial: true },
    { id: 'plans' as Screen, label: 'Plan', icon: CreditCard },
    { id: 'settings' as Screen, label: 'Profile', icon: User }
  ];

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`mobile-nav-item ${item.isSpecial ? 'analyze' : ''} ${currentScreen === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={item.isSpecial ? 24 : 20} />
            {!item.isSpecial && item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// Mobile Menu Content
function MobileMenuContent({ 
  currentScreen, 
  onNavigate 
}: { 
  currentScreen: Screen; 
  onNavigate: (screen: Screen) => void;
}) {
  const [showClose, setShowClose] = useState(false);

  const navItems = [
    { id: 'home' as Screen, label: 'Home', icon: Home },
    { id: 'new-analysis' as Screen, label: 'New Analysis', icon: Plus },
    { id: 'script-studio' as Screen, label: 'Script Studio', icon: FileCode },
    { id: 'projects' as Screen, label: 'Projects', icon: FolderOpen },
    { id: 'reports' as Screen, label: 'Reports', icon: FileText },
    { id: 'plans' as Screen, label: 'Plans', icon: CreditCard },
    { id: 'settings' as Screen, label: 'Account', icon: User }
  ];

  return (
    <>
      <div className="mobile-menu-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Play size={20} color="white" />
          </div>
          <span className="sidebar-logo-text">Viral Blueprint</span>
        </div>
        <button 
          className="btn btn-ghost"
          onClick={() => setShowClose(false)}
        >
          <X size={24} />
        </button>
      </div>

      <div className="mobile-menu-content">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${currentScreen === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

// Onboarding Screen
function OnboardingScreen({ 
  onComplete, 
  onBack 
}: { 
  onComplete: (profile: CreatorProfile) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    niche: '',
    targetAudience: '',
    preferredPlatforms: [] as Platform[],
    mainGoal: 'engagement' as ContentGoal,
    preferredTone: 'casual' as ContentTone
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const platforms: Platform[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'youtube-shorts'];
  const goals: ContentGoal[] = ['views', 'engagement', 'followers', 'leads', 'sales'];
  const tones: ContentTone[] = ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'entertaining', 'dramatic'];

  const togglePlatform = (platform: Platform) => {
    setFormData(prev => ({
      ...prev,
      preferredPlatforms: prev.preferredPlatforms.includes(platform)
        ? prev.preferredPlatforms.filter(p => p !== platform)
        : [...prev.preferredPlatforms, platform]
    }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.niche.trim()) newErrors.niche = 'Content niche is required';
    } else if (step === 2) {
      if (!formData.targetAudience.trim()) newErrors.targetAudience = 'Target audience is required';
    } else if (step === 3) {
      if (formData.preferredPlatforms.length === 0) {
        newErrors.platforms = 'Select at least one platform';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        onComplete({
          ...formData,
          notificationPreferences: { email: true, push: true }
        });
      }
    }
  };

  return (
    <div className="onboarding-screen">
      <button className="btn btn-ghost back-btn" onClick={step > 1 ? () => setStep(step - 1) : onBack}>
        <ArrowLeft size={20} />
        {step > 1 ? 'Back' : 'Cancel'}
      </button>

      <div className="onboarding-progress">
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <span className="text-sm text-muted">Step {step} of 4</span>
      </div>

      <div className="onboarding-content">
        {step === 1 && (
          <>
            <h2>Welcome! Let's get started</h2>
            <p className="text-muted mb-xl">Tell us about yourself</p>
            
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Content Niche</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Fitness, Beauty, Tech, Gaming"
                value={formData.niche}
                onChange={e => setFormData(prev => ({ ...prev, niche: e.target.value }))}
              />
              {errors.niche && <div className="form-error">{errors.niche}</div>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Who is your content for?</h2>
            <p className="text-muted mb-xl">Define your target audience</p>
            
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Young adults 18-25 interested in fitness"
                value={formData.targetAudience}
                onChange={e => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
              <AudiencePresetButtons
                onSelect={targetAudience => setFormData(prev => ({ ...prev, targetAudience }))}
              />
              {errors.targetAudience && <div className="form-error">{errors.targetAudience}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Main Content Goal</label>
              <div className="chip-grid">
                {goals.map(goal => (
                  <button
                    key={goal}
                    className={`chip chip-clickable ${formData.mainGoal === goal ? 'chip-selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, mainGoal: goal }))}
                  >
                    {GOAL_LABELS[goal]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Where do you create content?</h2>
            <p className="text-muted mb-xl">Select your preferred platforms</p>
            
            <div className="platform-grid">
              {platforms.map(platform => (
                <button
                  key={platform}
                  className={`platform-card ${formData.preferredPlatforms.includes(platform) ? 'selected' : ''}`}
                  onClick={() => togglePlatform(platform)}
                >
                  {platform === 'youtube-shorts' ? (
                    <YoutubeIcon size={32} />
                  ) : platform === 'facebook' ? (
                    <FacebookIcon size={32} />
                  ) : platform === 'instagram' ? (
                    <InstagramIcon size={32} />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      
                    </svg>
                  )}
                  <span>{PLATFORM_LABELS[platform]}</span>
                </button>
              ))}
            </div>
            {errors.platforms && <div className="form-error text-center mt-md">{errors.platforms}</div>}
          </>
        )}

        {step === 4 && (
          <>
            <h2>How do you want to sound?</h2>
            <p className="text-muted mb-xl">Choose your preferred content tone</p>
            
            <div className="tone-grid">
              {tones.map(tone => (
                <button
                  key={tone}
                  className={`tone-card ${formData.preferredTone === tone ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, preferredTone: tone }))}
                >
                  <span className="tone-label">{TONE_LABELS[tone]}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button className="btn btn-primary btn-lg mt-xl" onClick={handleNext}>
          {step === 4 ? 'Complete Setup' : 'Continue'}
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx>{`
        .onboarding-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-xl);
        }

        .back-btn {
          position: absolute;
          top: var(--spacing-lg);
          left: var(--spacing-lg);
        }

        .onboarding-progress {
          width: 100%;
          max-width: 400px;
          margin-bottom: var(--spacing-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .onboarding-content {
          width: 100%;
          max-width: 500px;
          text-align: center;
        }

        .chip-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          justify-content: center;
        }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--spacing-md);
        }

        .platform-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg);
          background: var(--color-gray-800);
          border: 2px solid var(--color-gray-700);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--color-gray-400);
        }

        .platform-card:hover {
          border-color: var(--color-gray-600);
          color: var(--color-white);
        }

        .platform-card.selected {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.1);
          color: var(--color-electric-purple-light);
        }

        .tone-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-sm);
        }

        .tone-card {
          padding: var(--spacing-md);
          background: var(--color-gray-800);
          border: 2px solid var(--color-gray-700);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tone-card:hover {
          border-color: var(--color-gray-600);
        }

        .tone-card.selected {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.1);
        }

        .tone-label {
          color: var(--color-gray-300);
          font-weight: 500;
        }

        .tone-card.selected .tone-label {
          color: var(--color-electric-purple-light);
        }
      `}</style>
    </div>
  );
}

// Dashboard Screen
function DashboardScreen({ 
  profile, 
  projects, 
  remainingAnalyses, 
  onNewAnalysis, 
  onCreateFromIdea,
  onOpenProject,
  onNavigate
}: {
  profile: CreatorProfile | null;
  projects: Project[];
  remainingAnalyses: number;
  onNewAnalysis: () => void;
  onCreateFromIdea: () => void;
  onOpenProject: (id: string) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const recentProjects = projects.slice(0, 3);
  const bestScore = projects.length > 0 
    ? Math.max(...projects.filter(p => p.analysisResult).map(p => p.analysisResult?.overallScore || 0))
    : null;

  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <div>
          <h1>Ready to build your next viral post?</h1>
          <p className="text-muted">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}!
          </p>
        </div>
      </header>

      <div className="dashboard-actions">
        <button className="action-card primary" onClick={onNewAnalysis}>
          <div className="action-icon">
            <Sparkles size={28} />
          </div>
          <div className="action-content">
            <h3>Analyze My Content</h3>
            <p>Get a detailed analysis and improvement blueprint</p>
          </div>
          <ChevronRight size={24} className="action-arrow" />
        </button>

        <button className="action-card" onClick={onCreateFromIdea}>
          <div className="action-icon secondary">
            <Zap size={28} />
          </div>
          <div className="action-content">
            <h3>Create From an Idea</h3>
            <p>Turn your rough idea into optimized content</p>
          </div>
          <ChevronRight size={24} className="action-arrow" />
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{remainingAnalyses}</div>
            <div className="stat-label">Free Analyses Remaining</div>
          </div>
        </div>

        {bestScore !== null && bestScore > 0 && (
          <div className="stat-card">
            <div className="stat-icon cyan">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value text-cyan">{bestScore}</div>
              <div className="stat-label">Best Viral Score</div>
            </div>
          </div>
        )}
      </div>

      {projects.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <button className="btn btn-ghost" onClick={() => onNavigate('projects')}>
              View All
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="projects-list">
            {recentProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => onOpenProject(project.id)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="expiration-notice">
        <Clock size={18} />
        <span>
          Creative assets are automatically deleted after 7 days. 
          Download your content before expiration.
        </span>
      </div>

      <style jsx>{`
        .dashboard-screen {
          max-width: 900px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: var(--spacing-xl);
        }

        .dashboard-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          padding: var(--spacing-lg);
          background: var(--color-gray-800);
          border: 1px solid var(--color-gray-700);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          width: 100%;
        }

        .action-card:hover {
          border-color: var(--color-electric-purple);
          transform: translateX(4px);
        }

        .action-card.primary {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .action-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-electric-purple);
          border-radius: var(--radius-md);
          color: var(--color-white);
        }

        .action-icon.secondary {
          background: var(--color-gray-700);
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          font-size: var(--font-size-lg);
          margin-bottom: var(--spacing-xs);
          color: var(--color-white);
        }

        .action-content p {
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .action-arrow {
          color: var(--color-gray-400);
          transition: color var(--transition-fast), transform var(--transition-fast);
        }

        .action-card:hover .action-arrow {
          color: var(--color-bright-cyan);
          transform: translateX(4px);
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-gray-700);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-electric-purple-light);
        }

        .stat-icon.cyan {
          background: rgba(6, 182, 212, 0.2);
          color: var(--color-bright-cyan);
        }

        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .dashboard-section {
          margin-bottom: var(--spacing-xl);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .projects-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .expiration-notice {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-warning-light);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </div>
  );
}

// Project Card
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const daysUntilExpiration = Math.ceil((new Date(project.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiration <= 2;

  return (
    <button className="project-card" onClick={onClick}>
      <div className="project-info">
        <h4>{project.title}</h4>
        <div className="project-meta">
          <span className="chip">{PLATFORM_LABELS[project.targetPlatform]}</span>
          <span className="text-sm text-muted">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="project-score">
        {project.analysisResult ? (
          <div className="score-badge" data-score={project.analysisResult.overallScore >= 70 ? 'high' : 'low'}>
            {project.analysisResult.overallScore}
          </div>
        ) : (
          <span className="badge badge-warning">Pending</span>
        )}
      </div>
      {isExpiringSoon && (
        <div className="expiration-badge">
          <Clock size={14} />
          {daysUntilExpiration} days
        </div>
      )}
    </button>
  );
}

// File Upload Component
function FileUpload({
  contentType,
  file,
  onFileSelect,
  onFileRemove,
  error
}: {
  contentType: ContentType;
  file: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
  onFileRemove: () => void;
  error?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const allowedTypes = getAllowedTypesForContentType(contentType);
  const maxSize = getMaxFileSize(contentType);
  const maxSizeFormatted = formatFileSize(maxSize);
  
  const getAcceptedTypes = () => {
    switch (contentType) {
      case 'image':
        return '.jpg,.jpeg,.png,.webp';
      case 'video':
        return '.mp4,.mov,.webm';
      case 'script':
        return '.txt,.pdf,.docx';
      case 'transcript':
        return '.txt,.pdf,.docx,.srt,.vtt';
      default:
        return '';
    }
  };
  
  const getPlaceholderText = () => {
    switch (contentType) {
      case 'image':
        return 'Drag & drop an image here, or click to select\n\nSupports: JPG, JPEG, PNG, WebP';
      case 'video':
        return 'Drag & drop a video here, or click to select\n\nSupports: MP4, MOV, WebM';
      case 'script':
        return 'Upload a script file or paste text below\n\nSupports: TXT, PDF, DOCX';
      case 'transcript':
        return 'Upload a transcript file or paste text below\n\nSupports: TXT, PDF, DOCX, SRT, VTT';
      default:
        return '';
    }
  };
  
  const handleFile = async (selectedFile: File) => {
    setLocalError(null);
    
    try {
      const processedFile = await processUpload(selectedFile, contentType);
      onFileSelect(processedFile);
    } catch (err) {
      setLocalError((err as Error).message);
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [contentType]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };
  
  const handleClick = () => {
    inputRef.current?.click();
  };
  
  const handleReplace = () => {
    onFileRemove();
    setTimeout(() => inputRef.current?.click(), 0);
  };
  
  const displayError = error || localError;
  
  // Show file preview when file is uploaded
  if (file) {
    return (
      <div className="file-preview-container">
        <div className="file-preview-card">
          {file.type === 'image' && file.dataUrl && (
            <div className="file-image-preview">
              <img src={file.dataUrl} alt={file.name} />
            </div>
          )}
          
          {file.type === 'video' && (
            <div className="file-video-preview">
              <Video size={48} />
              <video controls={false} style={{ display: 'none' }}>
                <source src={file.dataUrl} type={file.mimeType} />
              </video>
            </div>
          )}
          
          {file.type === 'document' && (
            <div className="file-document-preview">
              <FileText size={48} />
            </div>
          )}
          
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-meta">
              <span className="file-size">{formatFileSize(file.size)}</span>
              <span className="file-expiry">
                <Clock size={14} />
                Expires: {formatExpirationDate(file.expiresAt)}
              </span>
            </div>
          </div>
          
          <div className="file-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleReplace}>
              <RefreshCw size={16} />
              Replace
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onFileRemove}>
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        </div>
        
        <input
          ref={inputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
  
  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''} ${displayError ? 'error' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={getAcceptedTypes()}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        
        <div className="upload-icon">
          {contentType === 'image' ? <Camera size={48} /> : 
           contentType === 'video' ? <Video size={48} /> : 
           <Upload size={48} />}
        </div>
        
        <div className="upload-text">
          {getPlaceholderText().split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        
        <p className="upload-hint">Max file size: {maxSizeFormatted}</p>
      </div>
      
      {displayError && (
        <div className="file-upload-error">
          <AlertTriangle size={16} />
          {displayError}
        </div>
      )}
      
      <style jsx>{`
        .file-upload-container {
          width: 100%;
        }
        
        .file-upload-area {
          border: 2px dashed var(--color-gray-600);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          background: var(--color-gray-800);
        }
        
        .file-upload-area:hover {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.05);
        }
        
        .file-upload-area.dragging {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.1);
          transform: scale(1.01);
        }
        
        .file-upload-area.error {
          border-color: var(--color-error);
        }
        
        .upload-icon {
          color: var(--color-gray-500);
          margin-bottom: var(--spacing-md);
        }
        
        .file-upload-area:hover .upload-icon,
        .file-upload-area.dragging .upload-icon {
          color: var(--color-electric-purple);
        }
        
        .upload-text {
          color: var(--color-gray-300);
          margin-bottom: var(--spacing-sm);
        }
        
        .upload-text p {
          margin: 0;
          white-space: pre-line;
        }
        
        .upload-hint {
          color: var(--color-gray-500);
          font-size: var(--font-size-sm);
          margin: 0;
        }
        
        .file-upload-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-sm);
          color: var(--color-error);
          font-size: var(--font-size-sm);
        }
        
        .file-preview-container {
          width: 100%;
        }
        
        .file-preview-card {
          background: var(--color-gray-800);
          border: 2px solid var(--color-electric-purple);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .file-image-preview {
          width: 100%;
          max-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: var(--radius-md);
          background: var(--color-gray-900);
        }
        
        .file-image-preview img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
        }
        
        .file-video-preview {
          width: 100%;
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-900);
          border-radius: var(--radius-md);
          color: var(--color-gray-500);
        }
        
        .file-document-preview {
          width: 100%;
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-900);
          border-radius: var(--radius-md);
          color: var(--color-gray-500);
        }
        
        .file-info {
          text-align: center;
          width: 100%;
        }
        
        .file-name {
          font-weight: 600;
          color: var(--color-white);
          word-break: break-all;
          margin-bottom: var(--spacing-xs);
        }
        
        .file-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--spacing-md);
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }
        
        .file-expiry {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }
        
        .file-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      `}</style>
    </div>
  );
}

// Video Link Input Component
function VideoLinkInput({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  
  const handleBlur = () => {
    if (value.trim()) {
      const validation = validateVideoUrl(value);
      if (!validation.valid) {
        setLocalError(validation.error || 'Invalid URL');
      } else {
        setLocalError(null);
      }
    }
  };
  
  const displayError = error || localError;
  
  return (
    <div className="video-link-input">
      <div className="input-wrapper">
        <Link size={20} className="input-icon" />
        <input
          type="url"
          className={`form-input with-icon ${displayError ? 'error' : ''}`}
          placeholder="https://www.youtube.com/watch?v=..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
        />
      </div>
      
      {displayError && (
        <div className="link-error">
          <AlertTriangle size={16} />
          {displayError}
        </div>
      )}
      
      <p className="link-hint">
        Supported: YouTube, TikTok, Instagram, Facebook, Vimeo, Dailymotion
      </p>
      
      <style jsx>{`
        .video-link-input {
          width: 100%;
        }
        
        .input-wrapper {
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-gray-500);
        }
        
        .form-input.with-icon {
          padding-left: calc(var(--spacing-md) + 28px);
        }
        
        .form-input.with-icon.error {
          border-color: var(--color-error);
        }
        
        .link-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          margin-top: var(--spacing-sm);
          color: var(--color-error);
          font-size: var(--font-size-sm);
        }
        
        .link-hint {
          color: var(--color-gray-500);
          font-size: var(--font-size-sm);
          margin-top: var(--spacing-sm);
        }
      `}</style>
    </div>
  );
}

// New Analysis Screen
function NewAnalysisScreen({ 
  profile, 
  onSubmit, 
  onBack 
}: { 
  profile: CreatorProfile | null;
  onSubmit: (input: Partial<AnalysisInput>) => void;
  onBack: () => void;
}) {
  const [contentType, setContentType] = useState<ContentType>('topic');
  const [content, setContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [videoLink, setVideoLink] = useState('');
  const [targetPlatform, setTargetPlatform] = useState<Platform>(profile?.preferredPlatforms[0] || 'tiktok');
  const [goal, setGoal] = useState<ContentGoal>(profile?.mainGoal || 'views');
  const [tone, setTone] = useState<ContentTone>(profile?.preferredTone || 'casual');
  const [targetAudience, setTargetAudience] = useState(profile?.targetAudience || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const platforms: Platform[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'youtube-shorts'];
  const contentTypes: ContentType[] = ['topic', 'hook', 'caption', 'script', 'transcript', 'image', 'video', 'video-link'];
  const goals: ContentGoal[] = ['views', 'engagement', 'followers', 'leads', 'sales'];
  const tones: ContentTone[] = ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'entertaining', 'dramatic'];

  // Determine if we need content input
  const needsTextInput = ['topic', 'hook', 'caption', 'script', 'transcript'].includes(contentType);
  const needsFileUpload = ['script', 'transcript', 'image', 'video'].includes(contentType);
  const needsVideoLink = contentType === 'video-link';

  // Reset file and link when content type changes
  const handleContentTypeChange = (type: ContentType) => {
    setContentType(type);
    setUploadedFile(null);
    setVideoLink('');
    setErrors({});
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate based on content type
    if (needsTextInput && !content.trim()) {
      newErrors.content = 'Please enter your content';
    }
    
    if (needsFileUpload && !uploadedFile && !content.trim()) {
      newErrors.content = 'Please upload a file or enter content';
    }
    
    if (needsVideoLink && !videoLink.trim()) {
      newErrors.videoLink = 'Please enter a video URL';
    }
    
    if (needsVideoLink && videoLink.trim()) {
      const linkValidation = validateVideoUrl(videoLink);
      if (!linkValidation.valid) {
        newErrors.videoLink = linkValidation.error || 'Invalid video URL';
      }
    }
    
    if (!targetPlatform) {
      newErrors.platform = 'Please select a platform';
    }
    if (!goal) {
      newErrors.goal = 'Please select a goal';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        content,
        contentType,
        targetPlatform,
        goal,
        tone,
        targetAudience,
        uploadedFile: uploadedFile || undefined,
        videoLink: needsVideoLink ? videoLink : undefined
      });
    }
  };

  // Calculate expiration date for 7-day policy
  const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="new-analysis-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <h2 className="mb-xl">New Content Analysis</h2>

      <div className="form-section">
        <h3>What are you submitting?</h3>
        <div className="content-types-grid">
          {contentTypes.map(type => (
            <button
              key={type}
              className={`content-type-card ${contentType === type ? 'selected' : ''}`}
              onClick={() => handleContentTypeChange(type)}
            >
              {type === 'topic' && <Hash size={24} />}
              {type === 'hook' && <MessageSquare size={24} />}
              {type === 'caption' && <Edit3 size={24} />}
              {type === 'script' && <FileCode size={24} />}
              {type === 'transcript' && <FileText size={24} />}
              {type === 'image' && <Camera size={24} />}
              {type === 'video' && <Video size={24} />}
              {type === 'video-link' && <Link size={24} />}
              <span>{CONTENT_TYPE_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3>Your Content</h3>
        
        {/* Text input for text-based content types */}
        {needsTextInput && (
          <div className="content-input-section">
            <textarea
              className="form-textarea content-input"
              placeholder={
                contentType === 'topic' ? 'Enter your topic or idea...' :
                contentType === 'hook' ? 'Enter your hook or title...' :
                contentType === 'caption' ? 'Enter your caption...' :
                contentType === 'script' ? 'Paste your script here...' :
                'Paste your transcript here...'
              }
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
            />
            {errors.content && <div className="form-error">{errors.content}</div>}
          </div>
        )}
        
        {/* File upload for script/transcript */}
        {(contentType === 'script' || contentType === 'transcript') && (
          <div className="file-upload-section">
            <p className="section-label">Or upload a file:</p>
            <FileUpload
              contentType={contentType}
              file={uploadedFile}
              onFileSelect={setUploadedFile}
              onFileRemove={() => setUploadedFile(null)}
              error={errors.content}
            />
          </div>
        )}
        
        {/* File upload for image */}
        {contentType === 'image' && (
          <div className="file-upload-section">
            <FileUpload
              contentType={contentType}
              file={uploadedFile}
              onFileSelect={setUploadedFile}
              onFileRemove={() => setUploadedFile(null)}
              error={errors.content}
            />
            <p className="upload-note">
              <Info size={16} />
              Upload accepted — live media analysis requires the AI service connection.
            </p>
          </div>
        )}
        
        {/* File upload for video */}
        {contentType === 'video' && (
          <div className="file-upload-section">
            <FileUpload
              contentType={contentType}
              file={uploadedFile}
              onFileSelect={setUploadedFile}
              onFileRemove={() => setUploadedFile(null)}
              error={errors.content}
            />
            <p className="upload-note">
              <Info size={16} />
              Upload accepted — live media analysis requires the AI service connection.
            </p>
          </div>
        )}
        
        {/* Video link input */}
        {needsVideoLink && (
          <div className="video-link-section">
            <VideoLinkInput
              value={videoLink}
              onChange={setVideoLink}
              error={errors.videoLink}
            />
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Target Platform</h3>
        <div className="platform-selector">
          {platforms.map(platform => (
            <button
              key={platform}
              className={`platform-btn ${targetPlatform === platform ? 'selected' : ''}`}
              onClick={() => setTargetPlatform(platform)}
            >
              {platform === 'youtube-shorts' ? (
                <YoutubeIcon size={20} />
              ) : platform === 'facebook' ? (
                <FacebookIcon size={20} />
              ) : platform === 'instagram' ? (
                <InstagramIcon size={20} />
              ) : platform === 'tiktok' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  
                </svg>
              ) : (
                <YoutubeIcon size={20} />
              )}
              <span>{PLATFORM_LABELS[platform]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-section half">
          <h3>Primary Goal</h3>
          <div className="goal-selector">
            {goals.map(g => (
              <button
                key={g}
                className={`goal-btn ${goal === g ? 'selected' : ''}`}
                onClick={() => setGoal(g)}
              >
                {g === 'views' && <Eye size={18} />}
                {g === 'engagement' && <ThumbsUp size={18} />}
                {g === 'followers' && <Users size={18} />}
                {g === 'leads' && <Target size={18} />}
                {g === 'sales' && <ShoppingCart size={18} />}
                <span>{GOAL_LABELS[g]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section half">
          <h3>Tone</h3>
          <select
            className="form-select"
            value={tone}
            onChange={e => setTone(e.target.value as ContentTone)}
          >
            {tones.map(t => (
              <option key={t} value={t}>{TONE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Target Audience</h3>
        <input
          type="text"
          className="form-input"
          placeholder="e.g., Young adults 18-25 interested in fitness"
          value={targetAudience}
          onChange={e => setTargetAudience(e.target.value)}
        />
        <AudiencePresetButtons onSelect={setTargetAudience} />
        <p className="text-sm text-muted mt-sm">
          {profile?.targetAudience ? `Default: ${profile.targetAudience}` : 'Enter your target audience'}
        </p>
      </div>

      <div className="seven-day-notice">
        <Clock size={18} />
        <div>
          <strong>7-Day Asset Retention</strong>
          <p>Uploaded files and generated content will be automatically deleted after 7 days (expires: {formatExpirationDate(expirationDate)}). Please download your results before expiration.</p>
        </div>
      </div>

      <button className="btn btn-primary btn-lg full-width" onClick={handleSubmit}>
        <Sparkles size={20} />
        Analyze Content
      </button>

      <style jsx>{`
        .new-analysis-screen {
          max-width: 700px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .form-section {
          margin-bottom: var(--spacing-xl);
        }

        .form-section h3 {
          margin-bottom: var(--spacing-md);
          font-size: var(--font-size-lg);
        }

        .content-types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-sm);
        }

        .content-type-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--color-gray-800);
          border: 2px solid var(--color-gray-700);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        .content-type-card:hover {
          border-color: var(--color-gray-600);
        }

        .content-type-card.selected {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.1);
          color: var(--color-electric-purple-light);
        }

        .content-input {
          min-height: 200px;
        }

        .platform-selector {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .platform-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-gray-800);
          border: 2px solid var(--color-gray-700);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        .platform-btn:hover {
          border-color: var(--color-gray-600);
        }

        .platform-btn.selected {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.1);
          color: var(--color-electric-purple-light);
        }

        .form-row {
          display: flex;
          gap: var(--spacing-xl);
        }

        .form-section.half {
          flex: 1;
        }

        .goal-selector {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .goal-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--color-gray-800);
          border: 2px solid var(--color-gray-700);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        .goal-btn:hover {
          border-color: var(--color-gray-600);
        }

        .goal-btn.selected {
          border-color: var(--color-electric-purple);
          background: rgba(139, 92, 246, 0.1);
          color: var(--color-electric-purple-light);
        }

        .full-width {
          width: 100%;
        }

        .file-upload-section {
          margin-top: var(--spacing-md);
        }

        .section-label {
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-sm);
        }

        .upload-note {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .upload-note svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .video-link-section {
          margin-top: var(--spacing-sm);
        }

        .seven-day-notice {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
        }

        .seven-day-notice svg {
          flex-shrink: 0;
          color: var(--color-electric-purple);
          margin-top: 2px;
        }

        .seven-day-notice strong {
          display: block;
          color: var(--color-white);
          margin-bottom: var(--spacing-xs);
        }

        .seven-day-notice p {
          margin: 0;
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

// Analysis Progress Screen
function AnalysisProgressScreen({ 
  onComplete, 
  onCancel, 
  isProcessing 
}: { 
  onComplete: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  const [stage, setStage] = useState(0);
  const stages = [
    { label: 'Reviewing content structure...', icon: Eye },
    { label: 'Calculating category scores...', icon: TrendingUp },
    { label: 'Generating recommendations...', icon: Sparkles }
  ];

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setStage(prev => {
          if (prev < 2) {
            return prev + 1;
          }
          clearInterval(interval);
          onComplete();
          return prev;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isProcessing, onComplete]);

  return (
    <div className="progress-screen">
      <div className="progress-content">
        <div className="demo-notice">
          <Info size={16} />
          <span>Demo analysis — live AI scoring is not connected yet.</span>
        </div>

        <div className="progress-animation">
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
          <div className="progress-icon">
            <Sparkles size={40} />
          </div>
        </div>

        <h2>Analyzing Your Content</h2>
        <p className="text-muted">Please wait while we process your submission...</p>

        <div className="stages-list">
          {stages.map((s, index) => (
            <div 
              key={index} 
              className={`stage-item ${index <= stage ? 'active' : ''} ${index < stage ? 'completed' : ''}`}
            >
              <div className="stage-icon">
                {index < stage ? (
                  <Check size={18} />
                ) : (
                  <s.icon size={18} />
                )}
              </div>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary mt-xl" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <style jsx>{`
        .progress-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-content {
          text-align: center;
          max-width: 400px;
        }

        .demo-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .progress-animation {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto var(--spacing-xl);
        }

        .pulse-ring {
          position: absolute;
          inset: 0;
          border: 2px solid var(--color-electric-purple);
          border-radius: 50%;
          animation: pulse-out 2s ease-out infinite;
        }

        .pulse-ring.delay-1 {
          animation-delay: 0.5s;
        }

        .pulse-ring.delay-2 {
          animation-delay: 1s;
        }

        @keyframes pulse-out {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .progress-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: var(--color-electric-purple);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-white);
        }

        .stages-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
          text-align: left;
        }

        .stage-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: var(--color-gray-800);
          border-radius: var(--radius-md);
          color: var(--color-gray-500);
          transition: all var(--transition-base);
        }

        .stage-item.active {
          background: rgba(139, 92, 246, 0.1);
          color: var(--color-white);
        }

        .stage-item.completed {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success-light);
        }

        .stage-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gray-700);
          border-radius: 50%;
        }

        .stage-item.active .stage-icon {
          background: var(--color-electric-purple);
        }

        .stage-item.completed .stage-icon {
          background: var(--color-success);
        }
      `}</style>
    </div>
  );
}

// Viral Score Screen
function ViralScoreScreen({ 
  project, 
  onViewBlueprint, 
  onBack 
}: { 
  project: Project | null;
  onViewBlueprint: () => void;
  onBack: () => void;
}) {
  if (!project || !project.analysisResult) {
    return <div>No analysis results available</div>;
  }

  const { analysisResult } = project;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (analysisResult.overallScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-bright-cyan)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="score-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="score-header">
        <h2>Viral Score Results</h2>
        <p className="text-muted">Here's how your content measures up</p>
      </div>

      <div className="demo-notice">
        <Info size={16} />
        <span>Demo analysis — live AI scoring is not connected yet.</span>
      </div>

      <div className="score-overview">
        <div className="score-circle-large">
          <svg viewBox="0 0 180 180" className="score-svg">
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="var(--color-gray-700)"
              strokeWidth="8"
            />
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke={getScoreColor(analysisResult.overallScore)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="score-circle-text">
            <div className="score-value-large" style={{ color: getScoreColor(analysisResult.overallScore) }}>
              {analysisResult.overallScore}
            </div>
            <div className="score-label-text">{getScoreLabelText(analysisResult.overallLabel)}</div>
          </div>
        </div>
      </div>

      <div className="category-scores">
        <h3 className="mb-lg">Category Breakdown</h3>
        <div className="scores-grid">
          {analysisResult.categoryScores.map((cat, index) => (
            <div key={index} className="category-score-card">
              <div className="category-header">
                <span className="category-name">{cat.name}</span>
                <span className="category-score" style={{ color: getScoreColor(cat.score) }}>
                  {cat.score}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${cat.score}%`,
                    background: getScoreColor(cat.score)
                  }}
                />
              </div>
              <p className="category-evidence text-sm text-muted mt-sm">{cat.evidence}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="score-actions">
        <button className="btn btn-primary btn-lg" onClick={onViewBlueprint}>
          View Improvement Blueprint
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx>{`
        .score-screen {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .score-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .score-screen .demo-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .score-overview {
          display: flex;
          justify-content: center;
          margin-bottom: var(--spacing-xl);
        }

        .score-circle-large {
          position: relative;
          width: 200px;
          height: 200px;
        }

        .score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .score-circle-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-value-large {
          font-size: 56px;
          font-weight: 800;
          line-height: 1;
        }

        .score-label-text {
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
          margin-top: var(--spacing-xs);
        }

        .category-scores {
          margin-bottom: var(--spacing-xl);
        }

        .scores-grid {
          display: grid;
          gap: var(--spacing-md);
        }

        .category-score-card {
          background: var(--color-gray-800);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .category-name {
          font-weight: 500;
        }

        .category-score {
          font-size: var(--font-size-lg);
          font-weight: 700;
        }

        .score-actions {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// Blueprint Screen
function BlueprintScreen({ 
  project, 
  onRegenerate,
  onViewScriptStudio,
  onViewCaption,
  onViewFullReport,
  onCopy,
  onBack
}: { 
  project: Project | null;
  onRegenerate: (section: string) => void;
  onViewScriptStudio: () => void;
  onViewCaption: () => void;
  onViewFullReport: () => void;
  onCopy: (text: string) => void;
  onBack: () => void;
}) {
  if (!project || !project.analysisResult) {
    return <div>No analysis results available</div>;
  }

  const { analysisResult } = project;

  return (
    <div className="blueprint-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Scores
      </button>

      <h2 className="mb-xl">Improvement Blueprint</h2>

      <div className="demo-notice">
        <Info size={16} />
        <span>Demo analysis — live AI scoring is not connected yet.</span>
      </div>

      <div className="blueprint-section">
        <div className="section-header">
          <h3>What's Working</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onRegenerate('strengths')}>
            <RefreshCw size={16} />
            Regenerate
          </button>
        </div>
        <div className="strengths-list">
          {analysisResult.strengths.length > 0 ? (
            analysisResult.strengths.map((strength, index) => (
              <div key={index} className="strength-item">
                <Check size={18} className="text-success" />
                <span>{strength}</span>
              </div>
            ))
          ) : (
            <p className="text-muted">Keep building your content to see strengths emerge.</p>
          )}
        </div>
      </div>

      <div className="blueprint-section">
        <div className="section-header">
          <h3>Needs Improvement</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onRegenerate('weaknesses')}>
            <RefreshCw size={16} />
            Regenerate
          </button>
        </div>
        <div className="weaknesses-list">
          {analysisResult.weaknesses.length > 0 ? (
            analysisResult.weaknesses.map((weakness, index) => (
              <div key={index} className="weakness-item">
                <AlertTriangle size={18} className="text-warning" />
                <span>{weakness}</span>
              </div>
            ))
          ) : (
            <p className="text-muted">Great job! No major weaknesses detected.</p>
          )}
        </div>
      </div>

      <div className="blueprint-section">
        <div className="section-header">
          <h3>Stronger Hook Options</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onRegenerate('hooks')}>
            <RefreshCw size={16} />
            Regenerate
          </button>
        </div>
        <div className="hooks-list">
          {analysisResult.improvedHooks.map((hook, index) => (
            <div key={index} className="hook-card">
              <p>{hook}</p>
              <button className="btn btn-ghost btn-sm" onClick={() => onCopy(hook)}>
                <Copy size={14} />
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="blueprint-section">
        <div className="section-header">
          <h3>Recommended Title</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onRegenerate('title')}>
            <RefreshCw size={16} />
            Regenerate
          </button>
        </div>
        <div className="title-card">
          <p className="title-text">{analysisResult.improvedTitle}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => onCopy(analysisResult.improvedTitle)}>
            <Copy size={14} />
            Copy
          </button>
        </div>
      </div>

      <div className="blueprint-section">
        <h3>Recommendations</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="rec-header">
              <FileCode size={20} />
              <span>Content Structure</span>
            </div>
            <p className="text-sm text-muted">{analysisResult.improvedScript.substring(0, 150)}...</p>
            <button className="btn btn-secondary btn-sm mt-md" onClick={onViewScriptStudio}>
              Open Script Studio
            </button>
          </div>

          <div className="recommendation-card">
            <div className="rec-header">
              <Edit3 size={20} />
              <span>Caption & CTA</span>
            </div>
            <p className="text-sm text-muted">{analysisResult.caption.substring(0, 150)}...</p>
            <button className="btn btn-secondary btn-sm mt-md" onClick={onViewCaption}>
              View Caption
            </button>
          </div>

          <div className="recommendation-card">
            <div className="rec-header">
              <Camera size={20} />
              <span>Visual Suggestions</span>
            </div>
            <ul className="text-sm text-muted">
              {analysisResult.visualRecommendations.slice(0, 3).map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="recommendation-card">
            <div className="rec-header">
              <Hash size={20} />
              <span>Hashtags</span>
            </div>
            <div className="hashtags-preview">
              {analysisResult.hashtags.map((tag, i) => (
                <span key={i} className="chip">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="blueprint-section">
        <h3>Platform Checklist</h3>
        <div className="checklist">
          {analysisResult.platformRecommendations.map((item, index) => (
            <label key={index} className="checklist-item">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="blueprint-actions">
        <button className="btn btn-secondary" onClick={onViewScriptStudio}>
          <FileCode size={18} />
          Script Studio
        </button>
        <button className="btn btn-secondary" onClick={onViewCaption}>
          <Edit3 size={18} />
          Caption & Publish
        </button>
        <button className="btn btn-primary" onClick={onViewFullReport}>
          <FileText size={18} />
          Full Report
        </button>
      </div>

      <style jsx>{`
        .blueprint-screen {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .blueprint-screen .demo-notice {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
          color: var(--color-bright-cyan);
          font-size: var(--font-size-sm);
        }

        .blueprint-section {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .section-header h3 {
          margin: 0;
        }

        .strengths-list, .weaknesses-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .strength-item, .weakness-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
        }

        .hooks-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .hook-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--color-gray-700);
          border-radius: var(--radius-md);
        }

        .title-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--color-gray-700);
          border-radius: var(--radius-md);
        }

        .title-text {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--color-bright-cyan);
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-md);
        }

        .recommendation-card {
          background: var(--color-gray-700);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }

        .rec-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          color: var(--color-electric-purple-light);
        }

        .hashtags-preview {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
        }

        .checklist {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
        }

        .checklist-item input {
          width: 18px;
          height: 18px;
          accent-color: var(--color-electric-purple);
        }

        .blueprint-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
}

// Script Studio Screen
function ScriptStudioScreen({ 
  project, 
  onCopy, 
  onSave, 
  onBack 
}: { 
  project: Project | null;
  onCopy: (text: string) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  const [originalScript, setOriginalScript] = useState(project?.content || '');
  const [improvedScript, setImprovedScript] = useState(project?.analysisResult?.improvedScript || '');
  const [format, setFormat] = useState<'short' | 'long'>('short');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(project?.targetPlatform || 'tiktok');
  const [tone, setTone] = useState<ContentTone>(project?.tone || 'casual');
  const [selectedSection, setSelectedSection] = useState<string>('');

  const platforms: Platform[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'youtube-shorts'];
  const tones: ContentTone[] = ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'entertaining', 'dramatic'];

  return (
    <div className="script-studio-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Blueprint
      </button>

      <div className="studio-header">
        <h2>Script Studio</h2>
        <p className="text-muted">Refine your script with AI-powered suggestions</p>
      </div>

      <div className="studio-controls">
        <div className="control-group">
          <label>Format</label>
          <div className="toggle-buttons">
            <button 
              className={`toggle-btn ${format === 'short' ? 'active' : ''}`}
              onClick={() => setFormat('short')}
            >
              Short-form
            </button>
            <button 
              className={`toggle-btn ${format === 'long' ? 'active' : ''}`}
              onClick={() => setFormat('long')}
            >
              Long-form
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Platform</label>
          <select 
            className="form-select"
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value as Platform)}
          >
            {platforms.map(p => (
              <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Tone</label>
          <select 
            className="form-select"
            value={tone}
            onChange={e => setTone(e.target.value as ContentTone)}
          >
            {tones.map(t => (
              <option key={t} value={t}>{TONE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="scripts-container">
        <div className="script-panel">
          <div className="panel-header">
            <h3>Original Script</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onCopy(originalScript)}>
              <Copy size={14} />
              Copy
            </button>
          </div>
          <textarea
            className="script-textarea"
            value={originalScript}
            onChange={e => setOriginalScript(e.target.value)}
            placeholder="Paste or type your original script here..."
          />
        </div>

        <div className="script-panel">
          <div className="panel-header">
            <h3>Improved Script</h3>
            <div className="panel-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => onCopy(improvedScript)}>
                <Copy size={14} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSection('improved')}>
                <Edit3 size={14} />
              </button>
            </div>
          </div>
          <textarea
            className="script-textarea"
            value={improvedScript}
            onChange={e => setImprovedScript(e.target.value)}
            placeholder="AI-improved script will appear here..."
          />
        </div>
      </div>

      <div className="studio-actions">
        <button className="btn btn-secondary" onClick={onSave}>
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <style jsx>{`
        .script-studio-screen {
          max-width: 1000px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .studio-header {
          margin-bottom: var(--spacing-xl);
        }

        .studio-controls {
          display: flex;
          gap: var(--spacing-lg);
          flex-wrap: wrap;
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-lg);
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
        }

        .control-group {
          flex: 1;
          min-width: 150px;
        }

        .control-group label {
          display: block;
          margin-bottom: var(--spacing-sm);
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .toggle-buttons {
          display: flex;
          gap: var(--spacing-xs);
        }

        .toggle-btn {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--color-gray-700);
          border: 1px solid var(--color-gray-600);
          border-radius: var(--radius-sm);
          color: var(--color-gray-400);
          cursor: pointer;
          font-size: var(--font-size-sm);
          transition: all var(--transition-fast);
        }

        .toggle-btn:hover {
          border-color: var(--color-gray-500);
        }

        .toggle-btn.active {
          background: var(--color-electric-purple);
          border-color: var(--color-electric-purple);
          color: var(--color-white);
        }

        .scripts-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .script-panel {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--color-gray-700);
        }

        .panel-header h3 {
          margin: 0;
          font-size: var(--font-size-base);
        }

        .panel-actions {
          display: flex;
          gap: var(--spacing-xs);
        }

        .script-textarea {
          width: 100%;
          min-height: 400px;
          padding: var(--spacing-md);
          background: transparent;
          border: none;
          color: var(--color-white);
          font-family: var(--font-family);
          font-size: var(--font-size-sm);
          resize: vertical;
        }

        .script-textarea:focus {
          outline: none;
        }

        .studio-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: center;
        }

        @media (max-width: 768px) {
          .scripts-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Caption Publishing Screen
function CaptionPublishingScreen({ 
  project, 
  onCopy, 
  onBack 
}: { 
  project: Project | null;
  onCopy: (text: string) => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(project?.analysisResult?.improvedTitle || '');
  const [caption, setCaption] = useState(project?.analysisResult?.caption || '');
  const [cta, setCta] = useState(project?.analysisResult?.callToAction || '');
  const hashtags = project?.analysisResult?.hashtags || [];

  return (
    <div className="caption-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Blueprint
      </button>

      <h2 className="mb-lg">Caption & Publishing</h2>

      <div className="caption-section">
        <label className="form-label">Improved Title</label>
        <div className="editable-field">
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <button className="btn btn-ghost" onClick={() => onCopy(title)}>
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="caption-section">
        <label className="form-label">Caption</label>
        <div className="editable-field">
          <textarea
            className="form-textarea"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            rows={6}
          />
          <button className="btn btn-ghost" onClick={() => onCopy(caption)}>
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="caption-section">
        <label className="form-label">Call to Action</label>
        <div className="editable-field">
          <textarea
            className="form-textarea cta-input"
            value={cta}
            onChange={e => setCta(e.target.value)}
            rows={3}
          />
          <button className="btn btn-ghost" onClick={() => onCopy(cta)}>
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="caption-section">
        <label className="form-label">Hashtags</label>
        <div className="hashtags-container">
          {hashtags.map((tag, index) => (
            <span key={index} className="hashtag">{tag}</span>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => onCopy(hashtags.join(' '))}>
            <Copy size={14} />
            Copy All
          </button>
        </div>
      </div>

      <div className="caption-section">
        <label className="form-label">Publishing Notes</label>
        <div className="publishing-notes">
          <div className="note-item">
            <Check size={16} className="text-success" />
            <span>Post during peak engagement hours for {project?.targetPlatform}</span>
          </div>
          <div className="note-item">
            <Check size={16} className="text-success" />
            <span>Add relevant location and tag relevant accounts</span>
          </div>
          <div className="note-item">
            <Check size={16} className="text-success" />
            <span>Engage with comments within the first hour</span>
          </div>
        </div>
      </div>

      <div className="caption-actions">
        <button className="btn btn-primary btn-lg" onClick={() => onCopy(`${title}\n\n${caption}\n\n${cta}\n\n${hashtags.join(' ')}`)}>
          <Copy size={18} />
          Copy Everything
        </button>
      </div>

      <style jsx>{`
        .caption-screen {
          max-width: 700px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .caption-section {
          margin-bottom: var(--spacing-xl);
        }

        .editable-field {
          display: flex;
          gap: var(--spacing-sm);
        }

        .editable-field .form-input,
        .editable-field .form-textarea {
          flex: 1;
        }

        .cta-input {
          min-height: 80px;
        }

        .hashtags-container {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          align-items: center;
        }

        .hashtag {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(6, 182, 212, 0.1);
          color: var(--color-bright-cyan);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
        }

        .publishing-notes {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          background: var(--color-gray-800);
          border-radius: var(--radius-md);
        }

        .note-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--font-size-sm);
        }

        .caption-actions {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// Full Report Screen
function FullReportScreen({ 
  project, 
  onExport, 
  onCopy, 
  onBack 
}: { 
  project: Project | null;
  onExport: () => void;
  onCopy: (text: string) => void;
  onBack: () => void;
}) {
  if (!project || !project.analysisResult) {
    return <div>No report available</div>;
  }

  const { analysisResult } = project;

  return (
    <div className="report-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Blueprint
      </button>

      <div className="report-header">
        <div className="report-title">
          <h2>Viral Blueprint Report</h2>
          <p className="text-muted">
            Generated on {new Date(analysisResult.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="report-actions">
          <button className="btn btn-secondary" onClick={onExport}>
            <Download size={18} />
            Download Report
          </button>
        </div>
      </div>

      <div className="expiration-banner">
        <Clock size={18} />
        <span>
          This report and generated assets will expire on{' '}
          <strong>{new Date(analysisResult.expiresAt).toLocaleDateString()}</strong>
        </span>
      </div>

      <section className="report-section">
        <h3>Original Submission</h3>
        <div className="info-card">
          <div className="info-row">
            <span className="info-label">Title:</span>
            <span>{project.title}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Platform:</span>
            <span>{PLATFORM_LABELS[project.targetPlatform]}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Goal:</span>
            <span>{GOAL_LABELS[project.goal]}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Tone:</span>
            <span>{TONE_LABELS[project.tone]}</span>
          </div>
          <div className="content-preview">
            <span className="info-label">Content:</span>
            <p>{project.content}</p>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h3>Overall Viral Score</h3>
        <div className="score-display">
          <div className="big-score">{analysisResult.overallScore}</div>
          <div className="score-rating">{getScoreLabelText(analysisResult.overallLabel)}</div>
        </div>
      </section>

      <section className="report-section">
        <h3>Category Scores</h3>
        <div className="scores-table">
          {analysisResult.categoryScores.map((cat, i) => (
            <div key={i} className="score-row">
              <span className="score-name">{cat.name}</span>
              <div className="score-bar-container">
                <div className="score-bar" style={{ width: `${cat.score}%` }}></div>
              </div>
              <span className="score-number">{cat.score}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="report-section">
        <h3>Strengths</h3>
        <ul className="bullet-list">
          {analysisResult.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="report-section">
        <h3>Areas for Improvement</h3>
        <ul className="bullet-list warning">
          {analysisResult.weaknesses.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="report-section">
        <h3>Improvement Blueprint</h3>
        <div className="info-card">
          <h4>Recommended Corrections</h4>
          <ul className="bullet-list">
            {analysisResult.recommendedCorrections.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <h4 className="mt-lg">Improved Title</h4>
          <p className="highlight-text">{analysisResult.improvedTitle}</p>

          <h4 className="mt-lg">Improved Caption</h4>
          <p>{analysisResult.caption}</p>

          <h4 className="mt-lg">Call to Action</h4>
          <p className="highlight-text">{analysisResult.callToAction}</p>

          <h4 className="mt-lg">Hashtags</h4>
          <div className="hashtags">
            {analysisResult.hashtags.map((tag, i) => (
              <span key={i} className="chip">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="report-section">
        <h3>Publishing Checklist</h3>
        <div className="checklist">
          {analysisResult.platformRecommendations.map((item, i) => (
            <label key={i} className="checklist-item">
              <input type="checkbox" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="disclaimer">
        <AlertTriangle size={18} />
        <p>
          This analysis is based on content structure and pattern recognition. 
          Actual viral performance depends on many factors including timing, 
          audience engagement, and platform algorithms. Viral Blueprint cannot 
          guarantee viral performance.
        </p>
      </div>

      <style jsx>{`
        .report-screen {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
        }

        .report-title h2 {
          margin-bottom: var(--spacing-xs);
        }

        .expiration-banner {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-warning-light);
          margin-bottom: var(--spacing-xl);
        }

        .report-section {
          margin-bottom: var(--spacing-xl);
        }

        .report-section h3 {
          margin-bottom: var(--spacing-md);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-gray-700);
        }

        .info-card {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
        }

        .info-row {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .info-label {
          color: var(--color-gray-400);
          min-width: 100px;
        }

        .content-preview {
          margin-top: var(--spacing-md);
        }

        .content-preview p {
          margin-top: var(--spacing-xs);
          white-space: pre-wrap;
        }

        .score-display {
          text-align: center;
          padding: var(--spacing-xl);
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
        }

        .big-score {
          font-size: 80px;
          font-weight: 800;
          color: var(--color-bright-cyan);
          line-height: 1;
        }

        .score-rating {
          font-size: var(--font-size-xl);
          color: var(--color-gray-400);
          margin-top: var(--spacing-sm);
        }

        .scores-table {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
        }

        .score-row {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .score-name {
          min-width: 150px;
          font-size: var(--font-size-sm);
        }

        .score-bar-container {
          flex: 1;
          height: 8px;
          background: var(--color-gray-700);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .score-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-electric-purple), var(--color-bright-cyan));
          border-radius: var(--radius-full);
        }

        .score-number {
          min-width: 40px;
          text-align: right;
          font-weight: 600;
        }

        .bullet-list {
          list-style: none;
          padding: 0;
        }

        .bullet-list li {
          padding: var(--spacing-sm) 0;
          padding-left: var(--spacing-lg);
          position: relative;
        }

        .bullet-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
        }

        .bullet-list.warning li::before {
          background: var(--color-warning);
        }

        .highlight-text {
          color: var(--color-bright-cyan);
          font-weight: 500;
        }

        .hashtags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .checklist {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) 0;
          cursor: pointer;
        }

        .checklist-item input {
          width: 18px;
          height: 18px;
          accent-color: var(--color-electric-purple);
        }

        .disclaimer {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: var(--radius-lg);
          color: var(--color-gray-400);
          font-size: var(--font-size-sm);
        }

        .disclaimer p {
          margin: 0;
        }

        @media (max-width: 768px) {
          .report-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .score-row {
            flex-wrap: wrap;
          }

          .score-bar-container {
            order: 3;
            width: 100%;
            margin-top: var(--spacing-xs);
          }
        }
      `}</style>
    </div>
  );
}

// Projects Screen
function ProjectsScreen({ 
  projects, 
  onOpenProject, 
  onDuplicate, 
  onDelete, 
  onNewAnalysis,
  onBack
}: {
  projects: Project[];
  onOpenProject: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onNewAnalysis: () => void;
  onBack: () => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <div className="projects-screen">
      <div className="projects-header">
        <button className="btn btn-ghost back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h2>Your Projects</h2>
        <button className="btn btn-primary" onClick={onNewAnalysis}>
          <Plus size={18} />
          New Analysis
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={64} className="empty-state-icon" />
          <h3>No projects yet</h3>
          <p>Start by analyzing your first piece of content</p>
          <button className="btn btn-primary mt-lg" onClick={onNewAnalysis}>
            <Sparkles size={18} />
            Create Your First Analysis
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const daysLeft = Math.ceil((new Date(project.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={project.id} className="project-card-full">
                <div className="project-header">
                  <h4>{project.title}</h4>
                  <span className="chip">{PLATFORM_LABELS[project.targetPlatform]}</span>
                </div>

                <div className="project-meta">
                  <div className="meta-item">
                    <span className="meta-label">Created</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Expires</span>
                    <span className={daysLeft <= 2 ? 'text-warning' : ''}>
                      {new Date(project.expiresAt).toLocaleDateString()}
                      {daysLeft <= 2 && ` (${daysLeft} days)`}
                    </span>
                  </div>
                </div>

                {project.analysisResult && (
                  <div className="project-score-display">
                    <div className="score-circle-small">
                      <span>{project.analysisResult.overallScore}</span>
                    </div>
                    <span className="score-label">{getScoreLabelText(project.analysisResult.overallLabel)}</span>
                  </div>
                )}

                <div className="project-status">
                  {project.isAnalyzed ? (
                    <span className="badge badge-success">Analyzed</span>
                  ) : (
                    <span className="badge badge-warning">Pending</span>
                  )}
                </div>

                <div className="project-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => onOpenProject(project.id)}>
                    <Eye size={16} />
                    View
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => onDuplicate(project.id)}>
                    <Share2 size={16} />
                    Duplicate
                  </button>
                  {deleteConfirm === project.id ? (
                    <div className="delete-confirm">
                      <span>Delete?</span>
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(project.id)}>
                        Yes
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(project.id)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .projects-screen {
          max-width: 1000px;
          margin: 0 auto;
        }

        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
        }

        .projects-header h2 {
          flex: 1;
          text-align: center;
        }

        .back-btn {
          position: absolute;
          left: var(--spacing-lg);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .project-card-full {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          border: 1px solid var(--color-gray-700);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
        }

        .project-header h4 {
          flex: 1;
          margin-right: var(--spacing-sm);
        }

        .project-meta {
          display: flex;
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-md);
          font-size: var(--font-size-sm);
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .meta-label {
          color: var(--color-gray-500);
        }

        .project-score-display {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .score-circle-small {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-electric-purple), var(--color-bright-cyan));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: var(--font-size-lg);
        }

        .score-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .project-status {
          margin-bottom: var(--spacing-md);
        }

        .project-actions {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;
        }

        .delete-confirm {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: var(--color-error);
          font-size: var(--font-size-sm);
        }

        @media (max-width: 768px) {
          .projects-header {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .back-btn {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}

// Project Details Screen
function ProjectDetailsScreen({
  project,
  onBack,
  onDelete,
  onDuplicate,
  onExport,
  onCopy,
  onViewBlueprint,
  onViewScriptStudio,
  onViewCaption,
  onViewFullReport
}: {
  project: Project | null;
  onBack: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: () => void;
  onCopy: (text: string) => void;
  onViewBlueprint: () => void;
  onViewScriptStudio: () => void;
  onViewCaption: () => void;
  onViewFullReport: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!project) {
    return <div>Project not found</div>;
  }

  const daysLeft = Math.ceil((new Date(project.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="details-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Projects
      </button>

      <div className="details-header">
        <div>
          <h2>{project.title}</h2>
          <div className="details-meta">
            <span className="chip">{PLATFORM_LABELS[project.targetPlatform]}</span>
            <span className="chip">{GOAL_LABELS[project.goal]}</span>
            {project.analysisResult && (
              <span className="chip chip-cyan">{project.analysisResult.overallScore}/100</span>
            )}
          </div>
        </div>
        <div className="details-actions">
          {project.analysisResult && (
            <>
              <button className="btn btn-secondary" onClick={onViewBlueprint}>
                <Sparkles size={18} />
                View Blueprint
              </button>
              <button className="btn btn-secondary" onClick={onViewFullReport}>
                <FileText size={18} />
                Full Report
              </button>
            </>
          )}
        </div>
      </div>

      <div className="expiration-alert">
        <Clock size={18} />
        <span>
          This project's generated assets will be deleted on{' '}
          <strong>{new Date(project.expiresAt).toLocaleDateString()}</strong>
          {daysLeft <= 2 && ` (${daysLeft} days remaining)`}
        </span>
        {project.analysisResult && (
          <button className="btn btn-sm" onClick={onExport}>
            <Download size={14} />
            Download Now
          </button>
        )}
      </div>

      <div className="details-content">
        <section className="details-section">
          <h3>Original Submission</h3>
          <div className="content-box">
            <p>{project.content}</p>
          </div>
        </section>

        {project.analysisResult && (
          <>
            <section className="details-section">
              <h3>Score Summary</h3>
              <div className="scores-summary">
                <div className="big-score">{project.analysisResult.overallScore}</div>
                <div className="scores-breakdown">
                  {project.analysisResult.categoryScores.slice(0, 5).map((cat, i) => (
                    <div key={i} className="mini-score">
                      <span>{cat.name}</span>
                      <span>{cat.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="details-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={onViewScriptStudio}>
                  <FileCode size={24} />
                  <span>Script Studio</span>
                </button>
                <button className="quick-action-btn" onClick={onViewCaption}>
                  <Edit3 size={24} />
                  <span>Caption & Publish</span>
                </button>
                <button className="quick-action-btn" onClick={() => onCopy(project.analysisResult!.improvedTitle)}>
                  <Copy size={24} />
                  <span>Copy Title</span>
                </button>
                <button className="quick-action-btn" onClick={() => onCopy(project.analysisResult!.hashtags.join(' '))}>
                  <Hash size={24} />
                  <span>Copy Hashtags</span>
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      <div className="details-footer">
        <button className="btn btn-ghost" onClick={() => onDuplicate(project.id)}>
          <Share2 size={18} />
          Duplicate Project
        </button>
        {showDeleteConfirm ? (
          <div className="delete-confirm">
            <span>Are you sure you want to delete this project?</span>
            <button className="btn btn-danger" onClick={() => {
              onDelete(project.id);
              setShowDeleteConfirm(false);
            }}>
              <Trash2 size={18} />
              Delete
            </button>
            <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost text-error" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={18} />
            Delete Project
          </button>
        )}
      </div>

      <style jsx>{`
        .details-screen {
          max-width: 800px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
          gap: var(--spacing-lg);
        }

        .details-meta {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .chip-cyan {
          background: rgba(6, 182, 212, 0.2);
          color: var(--color-bright-cyan);
        }

        .details-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .expiration-alert {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-md);
          color: var(--color-warning-light);
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
        }

        .details-content {
          margin-bottom: var(--spacing-xl);
        }

        .details-section {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .details-section h3 {
          margin-bottom: var(--spacing-md);
        }

        .content-box {
          background: var(--color-gray-700);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
        }

        .content-box p {
          white-space: pre-wrap;
        }

        .scores-summary {
          display: flex;
          gap: var(--spacing-xl);
          align-items: center;
        }

        .big-score {
          font-size: 64px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--color-electric-purple), var(--color-bright-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .scores-breakdown {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-sm);
        }

        .mini-score {
          display: flex;
          justify-content: space-between;
          padding: var(--spacing-sm);
          background: var(--color-gray-700);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
        }

        .mini-score span:first-child {
          color: var(--color-gray-400);
        }

        .mini-score span:last-child {
          font-weight: 600;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: var(--spacing-md);
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg);
          background: var(--color-gray-700);
          border: 1px solid var(--color-gray-600);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          color: var(--color-gray-300);
        }

        .quick-action-btn:hover {
          border-color: var(--color-electric-purple);
          color: var(--color-electric-purple-light);
        }

        .details-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-lg);
          border-top: 1px solid var(--color-gray-700);
        }

        .delete-confirm {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .text-error {
          color: var(--color-error);
        }

        @media (max-width: 768px) {
          .details-header {
            flex-direction: column;
          }

          .details-actions {
            width: 100%;
          }

          .scores-summary {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

// Plans Screen
function PlansScreen({ 
  remainingAnalyses, 
  onBack 
}: { 
  remainingAnalyses: number;
  onBack: () => void;
}) {
  return (
    <div className="plans-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="plans-header">
        <h2>Choose Your Plan</h2>
        <p className="text-muted">
          Select the plan that best fits your content creation needs
        </p>
      </div>

      <div className="usage-card">
        <div className="usage-info">
          <span className="usage-label">Your Current Usage</span>
          <span className="usage-value">{remainingAnalyses} of 3 analyses used</span>
        </div>
        <div className="progress-bar" style={{ maxWidth: '200px' }}>
          <div 
            className="progress-bar-fill" 
            style={{ width: `${((3 - remainingAnalyses) / 3) * 100}%` }} 
          />
        </div>
      </div>

      <div className="plans-grid">
        <div className="plan-card free">
          <div className="plan-header">
            <h3>Free Plan</h3>
            <div className="plan-price">
              <span className="price">$0</span>
              <span className="period">forever</span>
            </div>
          </div>
          <ul className="plan-features">
            <li><Check size={16} /> 3 content analyses total</li>
            <li><Check size={16} /> Basic scoring categories</li>
            <li><Check size={16} /> Improvement blueprints</li>
            <li><Check size={16} /> Script Studio access</li>
            <li><Check size={16} /> Caption generator</li>
            <li className="disabled"><X size={16} /> Unlimited analyses</li>
            <li className="disabled"><X size={16} /> Priority processing</li>
            <li className="disabled"><X size={16} /> Advanced recommendations</li>
          </ul>
          <div className="plan-current">
            <Badge>Current Plan</Badge>
          </div>
        </div>

        <div className="plan-card pro">
          <div className="plan-badge">Recommended</div>
          <div className="plan-header">
            <h3>Pro Plan</h3>
            <div className="plan-price">
              <span className="price">Price coming soon</span>
              <span className="period">per month</span>
            </div>
          </div>
          <ul className="plan-features">
            <li><Check size={16} /> Monthly analysis allowance</li>
            <li><Check size={16} /> All scoring categories</li>
            <li><Check size={16} /> Advanced improvement blueprints</li>
            <li><Check size={16} /> Script Studio access</li>
            <li><Check size={16} /> Caption generator</li>
            <li><Check size={16} /> Priority processing</li>
            <li><Check size={16} /> Advanced recommendations</li>
            <li><Check size={16} /> Export full reports</li>
          </ul>
          <button className="btn btn-primary btn-lg full-width">
            <Crown size={18} />
            Upgrade to Pro
          </button>
          <p className="checkout-note">
            Checkout integration coming soon. Price will be finalized by product owner.
          </p>
        </div>
      </div>

      <div className="plans-disclaimer">
        <AlertTriangle size={18} />
        <p>
          Payment processing is not yet active. This interface is prepared for the Pro plan 
          which will be priced once selected by the product owner. The specific price and 
          feature limits will be set before activation.
        </p>
      </div>

      <style jsx>{`
        .plans-screen {
          max-width: 900px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .plans-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .usage-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-xl);
        }

        .usage-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .usage-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .usage-value {
          font-size: var(--font-size-lg);
          font-weight: 600;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .plan-card {
          background: var(--color-gray-800);
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          border: 2px solid var(--color-gray-700);
          position: relative;
        }

        .plan-card.pro {
          border-color: var(--color-electric-purple);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%);
        }

        .plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-electric-purple);
          color: var(--color-white);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          font-weight: 600;
        }

        .plan-header {
          text-align: center;
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--color-gray-700);
        }

        .plan-header h3 {
          margin-bottom: var(--spacing-sm);
        }

        .plan-price {
          display: flex;
          flex-direction: column;
        }

        .price {
          font-size: var(--font-size-3xl);
          font-weight: 800;
        }

        .plan-card.pro .price {
          color: var(--color-electric-purple-light);
        }

        .period {
          font-size: var(--font-size-sm);
          color: var(--color-gray-400);
        }

        .plan-features {
          list-style: none;
          margin-bottom: var(--spacing-lg);
        }

        .plan-features li {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) 0;
        }

        .plan-features li :global(svg) {
          color: var(--color-success);
        }

        .plan-features li.disabled {
          color: var(--color-gray-500);
        }

        .plan-features li.disabled :global(svg) {
          color: var(--color-gray-500);
        }

        .plan-current {
          text-align: center;
        }

        .checkout-note {
          text-align: center;
          font-size: var(--font-size-sm);
          color: var(--color-gray-500);
          margin-top: var(--spacing-md);
        }

        .plans-disclaimer {
          display: flex;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-lg);
          color: var(--color-warning-light);
        }

        .plans-disclaimer p {
          margin: 0;
          font-size: var(--font-size-sm);
        }
      `}</style>
    </div>
  );
}

// Settings Screen
function SettingsScreen({
  profile,
  onUpdateProfile,
  onBack,
  onSignOut,
  onManageAccount
}: {
  profile: CreatorProfile | null;
  onUpdateProfile: (updates: Partial<CreatorProfile>) => void;
  onBack: () => void;
  onSignOut: () => void;
  onManageAccount: () => void;
}) {
  const [name, setName] = useState(profile?.name || '');
  const [niche, setNiche] = useState(profile?.niche || '');
  const [targetAudience, setTargetAudience] = useState(profile?.targetAudience || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(profile?.preferredPlatforms || []);
  const [mainGoal, setMainGoal] = useState<ContentGoal>(profile?.mainGoal || 'engagement');
  const [preferredTone, setPreferredTone] = useState<ContentTone>(profile?.preferredTone || 'casual');
  const [emailNotifications, setEmailNotifications] = useState(profile?.notificationPreferences?.email ?? true);
  const [pushNotifications, setPushNotifications] = useState(profile?.notificationPreferences?.push ?? true);

  const platforms: Platform[] = ['facebook', 'instagram', 'tiktok', 'youtube', 'youtube-shorts'];
  const goals: ContentGoal[] = ['views', 'engagement', 'followers', 'leads', 'sales'];
  const tones: ContentTone[] = ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'entertaining', 'dramatic'];

  const handleSave = () => {
    onUpdateProfile({
      name,
      niche,
      targetAudience,
      preferredPlatforms: selectedPlatforms,
      mainGoal,
      preferredTone,
      notificationPreferences: {
        email: emailNotifications,
        push: pushNotifications
      }
    });
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="settings-screen">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="settings-header-row">
        <h2>Settings</h2>
        <button className="btn btn-ghost" onClick={onManageAccount}>
          <User size={18} />
          Account Settings
        </button>
      </div>

      <div className="settings-section">
        <h3>Creator Profile</h3>
        
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Content Niche</label>
          <input
            type="text"
            className="form-input"
            value={niche}
            onChange={e => setNiche(e.target.value)}
            placeholder="e.g., Fitness, Beauty, Tech"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Target Audience</label>
          <input
            type="text"
            className="form-input"
            value={targetAudience}
            onChange={e => setTargetAudience(e.target.value)}
            placeholder="e.g., Young adults 18-25"
          />
          <AudiencePresetButtons onSelect={setTargetAudience} />
        </div>
      </div>

      <div className="settings-section">
        <h3>Preferred Platforms</h3>
        <div className="platform-toggles">
          {platforms.map(platform => (
            <label key={platform} className="platform-toggle">
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform)}
                onChange={() => togglePlatform(platform)}
              />
              <span>{PLATFORM_LABELS[platform]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Content Preferences</h3>
        
        <div className="form-group">
          <label className="form-label">Main Goal</label>
          <select
            className="form-select"
            value={mainGoal}
            onChange={e => setMainGoal(e.target.value as ContentGoal)}
          >
            {goals.map(g => (
              <option key={g} value={g}>{GOAL_LABELS[g]}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Preferred Tone</label>
          <select
            className="form-select"
            value={preferredTone}
            onChange={e => setPreferredTone(e.target.value as ContentTone)}
          >
            {tones.map(t => (
              <option key={t} value={t}>{TONE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Notifications</h3>
        
        <label className="toggle-setting">
          <span>Email Notifications</span>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={e => setEmailNotifications(e.target.checked)}
          />
        </label>

        <label className="toggle-setting">
          <span>Push Notifications</span>
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={e => setPushNotifications(e.target.checked)}
          />
        </label>
      </div>

      <div className="settings-section">
        <h3>Data & Privacy</h3>
        <p className="text-muted mb-lg">
          Your data is stored securely and used only to provide the Viral Blueprint service.
          Creative assets are automatically deleted after 7 days.
        </p>
        <div className="data-actions">
          <button className="btn btn-secondary">
            <Download size={18} />
            Export My Data
          </button>
          <button className="btn btn-danger">
            <Trash2 size={18} />
            Delete All Data
          </button>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          <Save size={18} />
          Save Changes
        </button>
        <button className="btn btn-ghost" onClick={handleSignOut}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <style jsx>{`
        .settings-screen {
          max-width: 600px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: var(--spacing-lg);
        }

        .settings-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
        }

        .settings-section {
          background: var(--color-gray-800);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .settings-section h3 {
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--color-gray-700);
        }

        .platform-toggles {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .platform-toggle {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-sm);
          cursor: pointer;
        }

        .platform-toggle input {
          width: 18px;
          height: 18px;
          accent-color: var(--color-electric-purple);
        }

        .toggle-setting {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md) 0;
          cursor: pointer;
        }

        .toggle-setting input {
          width: 44px;
          height: 24px;
          accent-color: var(--color-electric-purple);
        }

        .data-actions {
          display: flex;
          gap: var(--spacing-md);
        }

        .settings-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          align-items: center;
        }
      `}</style>
    </div>
  );
}

// Badge component
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge badge-purple">{children}</span>;
}
