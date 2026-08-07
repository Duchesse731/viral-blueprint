import {
  UploadedFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  ContentType
} from '@/types';

/**
 * File Upload Service
 * 
 * Handles file validation, processing, and preparation for AI analysis.
 * All files are stored temporarily and deleted after 7 days.
 * 
 * NOTE: This service processes files client-side. When connecting to a real
 * AI provider, files will be sent to the server-side API for processing.
 */

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Generate unique file ID
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Calculate expiration date (7 days from now)
export function calculateFileExpiration(): Date {
  return new Date(Date.now() + SEVEN_DAYS_MS);
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate file type based on content type
export function getAllowedTypesForContentType(contentType: ContentType): string[] {
  switch (contentType) {
    case 'image':
      return ALLOWED_IMAGE_TYPES;
    case 'video':
      return ALLOWED_VIDEO_TYPES;
    case 'script':
    case 'transcript':
      return ALLOWED_DOCUMENT_TYPES;
    default:
      return [];
  }
}

// Get max file size based on content type
export function getMaxFileSize(contentType: ContentType): number {
  switch (contentType) {
    case 'image':
      return MAX_IMAGE_SIZE;
    case 'video':
      return MAX_VIDEO_SIZE;
    case 'script':
    case 'transcript':
      return MAX_DOCUMENT_SIZE;
    default:
      return 0;
  }
}

// Get file type category
export function getFileType(file: File): 'image' | 'video' | 'document' | 'unknown' {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) return 'video';
  if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) return 'document';
  return 'unknown';
}

// Validate file
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File, contentType: ContentType): FileValidationResult {
  const allowedTypes = getAllowedTypesForContentType(contentType);
  const maxSize = getMaxFileSize(contentType);
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = getAllowedExtensions(contentType);
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions}`
    };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeFormatted = formatFileSize(maxSize);
    const fileSizeFormatted = formatFileSize(file.size);
    return {
      valid: false,
      error: `File too large (${fileSizeFormatted}). Maximum: ${maxSizeFormatted}`
    };
  }
  
  return { valid: true };
}

// Get allowed file extensions for display
function getAllowedExtensions(contentType: ContentType): string {
  switch (contentType) {
    case 'image':
      return 'JPG, JPEG, PNG, WebP';
    case 'video':
      return 'MP4, MOV, WebM';
    case 'script':
      return 'TXT, PDF, DOCX';
    case 'transcript':
      return 'TXT, PDF, DOCX, SRT, VTT';
    default:
      return '';
  }
}

// Read file as data URL for preview
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Read file as text
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Process uploaded file
export async function processUpload(
  file: File,
  contentType: ContentType
): Promise<UploadedFile> {
  const validation = validateFile(file, contentType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const fileType = getFileType(file);
  
  // If file type is unknown after validation, throw error
  if (fileType === 'unknown') {
    throw new Error('Unsupported file type');
  }
  
  // Generate data URL for preview (images only)
  let dataUrl: string | undefined;
  if (fileType === 'image') {
    dataUrl = await readFileAsDataUrl(file);
  }
  
  return {
    id: generateFileId(),
    name: file.name,
    type: fileType,
    mimeType: file.type,
    size: file.size,
    dataUrl,
    lastModified: file.lastModified,
    expiresAt: calculateFileExpiration()
  };
}

// Validate video URL
export function validateVideoUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: false, error: 'Please enter a video URL' };
  }
  
  try {
    const parsed = new URL(url);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    
    // Check for common video platforms
    const validDomains = [
      'youtube.com',
      'youtu.be',
      'www.youtube.com',
      'm.youtube.com',
      'instagram.com',
      'www.instagram.com',
      'vm.tiktok.com',
      'tiktok.com',
      'www.tiktok.com',
      'facebook.com',
      'www.facebook.com',
      'fb.watch',
      'vimeo.com',
      'www.vimeo.com',
      'dailymotion.com',
      'www.dailymotion.com'
    ];
    
    const isValidDomain = validDomains.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
    
    if (!isValidDomain) {
      return { 
        valid: false, 
        error: 'Please enter a valid video URL from YouTube, TikTok, Instagram, Facebook, Vimeo, or Dailymotion' 
      };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

// Format expiration date for display
export function formatExpirationDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Extract text from document (for AI processing)
export async function extractTextFromDocument(file: File): Promise<string> {
  const fileType = getFileType(file);
  
  if (fileType !== 'document') {
    throw new Error('File is not a document');
  }
  
  // For text-based files
  if (file.type === 'text/plain' || file.type === 'application/x-subrip' || file.type === 'text/vtt') {
    return readFileAsText(file);
  }
  
  // For PDF and DOCX, we'd need server-side processing
  // For now, return a placeholder message
  if (file.type === 'application/pdf') {
    return `[PDF Document: ${file.name}]\n\nPDF text extraction requires server-side processing. The file will be analyzed when connected to the AI service.`;
  }
  
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return `[Word Document: ${file.name}]\n\nDOCX text extraction requires server-side processing. The file will be analyzed when connected to the AI service.`;
  }
  
  return '';
}

// Prepare file for AI analysis (returns metadata and content hints)
export interface AIAnalysisPrep {
  contentType: 'text' | 'image' | 'video';
  fileName: string;
  fileSize: string;
  mimeType: string;
  expirationDate: string;
  requiresProcessing: boolean;
  processingNote: string;
}

export function prepareForAIAnalysis(file: UploadedFile): AIAnalysisPrep {
  let contentType: 'text' | 'image' | 'video';
  let requiresProcessing = false;
  let processingNote = '';
  
  switch (file.type) {
    case 'image':
      contentType = 'image';
      requiresProcessing = true;
      processingNote = 'Will be sent to vision-capable AI model for visual content analysis';
      break;
    case 'video':
      contentType = 'video';
      requiresProcessing = true;
      processingNote = 'Will be processed through transcription and visual-content analysis';
      break;
    default:
      contentType = 'text';
      requiresProcessing = file.mimeType !== 'text/plain';
      processingNote = requiresProcessing 
        ? 'Document text will be extracted server-side before AI analysis'
        : 'Will be sent directly to text-capable AI model';
  }
  
  return {
    contentType,
    fileName: file.name,
    fileSize: formatFileSize(file.size),
    mimeType: file.mimeType,
    expirationDate: formatExpirationDate(file.expiresAt),
    requiresProcessing,
    processingNote
  };
}
