import { 
  AnalysisInput, 
  AnalysisResult, 
  CategoryScore, 
  ScoreLabel,
  Platform,
  ContentGoal,
  UploadedFile
} from '@/types';

/**
 * Deterministic scoring service for content analysis.
 * 
 * This service provides real, explainable scoring logic based on
 * consistent criteria. The same input will always produce the same
 * analysis results when evaluated under the same criteria.
 * 
 * AI Integration Architecture:
 * 
 * 1. Text Content (topic, hook, caption, script, transcript):
 *    - Sends text directly to text-capable AI model (e.g., GPT-4, Claude)
 *    - Used for: Topic Analysis, Hook Strength, Caption Optimization
 * 
 * 2. Image Content:
 *    - Sends to vision-capable AI model (e.g., GPT-4 Vision, Claude Vision)
 *    - Analyzes: Visual composition, color usage, text overlay, emotional impact
 *    - Provides: Visual recommendations, engagement potential
 * 
 * 3. Video Content:
 *    - Step 1: Extract audio and transcribe (Whisper API or similar)
 *    - Step 2: Extract key frames for visual analysis
 *    - Step 3: Send transcription + frame analysis to text/vision AI
 *    - Analyzes: Pacing, visual hooks, retention patterns, CTA placement
 * 
 * 4. Video Link:
 *    - Fetches video metadata and thumbnail
 *    - Sends URL to AI for context analysis (where supported)
 *    - Falls back to metadata-based scoring
 * 
 * NOTE: This is currently using demonstration logic. Replace the 
 * analyzeContent function with actual AI calls when connecting to a provider.
 * All AI credentials must be kept server-side.
 */

// AI Analysis Preparation Interface
export interface AIAnalysisRequest {
  contentType: 'text' | 'image' | 'video' | 'video-link';
  textContent?: string;
  fileData?: {
    name: string;
    mimeType: string;
    size: number;
    dataUrl?: string; // Base64 for images
    requiresProcessing: boolean;
  };
  metadata: {
    platform: Platform;
    goal: ContentGoal;
    tone: string;
    targetAudience: string;
  };
}

// Prepare content for AI analysis
export function prepareForAIAnalysis(input: AnalysisInput): AIAnalysisRequest {
  const { content, contentType, targetPlatform, goal, tone, targetAudience, uploadedFile, videoLink } = input;
  
  let analysisType: 'text' | 'image' | 'video' | 'video-link';
  let textContent: string | undefined;
  let fileData: AIAnalysisRequest['fileData'] | undefined;
  
  switch (contentType) {
    case 'image':
      analysisType = 'image';
      textContent = content || ''; // Optional description
      fileData = uploadedFile ? {
        name: uploadedFile.name,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
        dataUrl: uploadedFile.dataUrl,
        requiresProcessing: false // Base64 image can be sent directly
      } : undefined;
      break;
      
    case 'video':
      analysisType = 'video';
      textContent = content || '';
      fileData = uploadedFile ? {
        name: uploadedFile.name,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
        dataUrl: uploadedFile.dataUrl,
        requiresProcessing: true // Video requires transcription + frame extraction
      } : undefined;
      break;
      
    case 'video-link':
      analysisType = 'video-link';
      textContent = videoLink || '';
      fileData = undefined;
      break;
      
    default:
      analysisType = 'text';
      textContent = content;
      fileData = undefined;
  }
  
  return {
    contentType: analysisType,
    textContent,
    fileData,
    metadata: {
      platform: targetPlatform,
      goal,
      tone: tone || 'casual',
      targetAudience: targetAudience || ''
    }
  };
}

// Server-side API call would look like this (example):
/**
 * async function callAIAnalysis(request: AIAnalysisRequest): Promise<AIResult> {
 *   const response = await fetch('/api/analyze', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       // API key handled server-side
 *     },
 *     body: JSON.stringify(request)
 *   });
 *   return response.json();
 * }
 */

// Score calculation weights for each category
const CATEGORY_WEIGHTS = {
  hookStrength: 0.15,
  emotionalImpact: 0.12,
  audienceRelevance: 0.13,
  clarity: 0.10,
  originality: 0.10,
  shareability: 0.12,
  retentionPotential: 0.10,
  callToActionStrength: 0.08,
  platformFit: 0.10
};

// Platform-specific multipliers
const PLATFORM_MULTIPLIERS: Record<Platform, Record<string, number>> = {
  tiktok: {
    hookStrength: 1.2,
    retentionPotential: 1.3,
    shareability: 1.2,
    platformFit: 1.1
  },
  instagram: {
    hookStrength: 1.1,
    shareability: 1.2,
    platformFit: 1.1
  },
  youtube: {
    retentionPotential: 1.3,
    callToActionStrength: 1.1,
    clarity: 1.1,
    platformFit: 1.1
  },
  'youtube-shorts': {
    hookStrength: 1.2,
    retentionPotential: 1.3,
    shareability: 1.2,
    platformFit: 1.1
  },
  facebook: {
    shareability: 1.1,
    engagement: 1.1,
    platformFit: 1.0
  }
};

// Goal-specific multipliers
const GOAL_MULTIPLIERS: Record<ContentGoal, Record<string, number>> = {
  views: {
    hookStrength: 1.2,
    retentionPotential: 1.1,
    shareability: 1.1
  },
  engagement: {
    callToActionStrength: 1.3,
    emotionalImpact: 1.2
  },
  followers: {
    callToActionStrength: 1.2,
    audienceRelevance: 1.2
  },
  leads: {
    callToActionStrength: 1.3,
    clarity: 1.2
  },
  sales: {
    callToActionStrength: 1.4,
    clarity: 1.2,
    audienceRelevance: 1.1
  }
};

/**
 * Get score label based on numeric score
 */
export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 90) return 'exceptional-potential';
  if (score >= 80) return 'high-potential';
  if (score >= 60) return 'strong';
  if (score >= 40) return 'has-potential';
  return 'needs-major-improvement';
}

/**
 * Get label text for display
 */
export function getScoreLabelText(label: ScoreLabel): string {
  const labels: Record<ScoreLabel, string> = {
    'needs-major-improvement': 'Needs Major Improvement',
    'has-potential': 'Has Potential',
    'strong': 'Strong',
    'high-potential': 'High Potential',
    'exceptional-potential': 'Exceptional Potential'
  };
  return labels[label];
}

/**
 * Analyze text content for various factors
 */
function analyzeText(text: string, platform: Platform, goal: ContentGoal): {
  hookScore: number;
  emotionalScore: number;
  clarityScore: number;
  originalityScore: number;
  shareabilityScore: number;
  retentionScore: number;
  ctaScore: number;
  platformFitScore: number;
  audienceScore: number;
} {
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;
  
  // Hook analysis
  const hookIndicators = [
    'how to', 'why you', 'secret', 'revealed', 'exactly', 'proven',
    'step by step', 'tutorial', 'tips', 'tricks', 'mistakes', 'warning',
    'life-changing', 'game-changing', 'must-watch', 'you need to',
    'stop', 'wait', 'imagine', 'what if', 'finally', 'breaking'
  ];
  const hookMatches = hookIndicators.filter(h => lowerText.includes(h)).length;
  const hookScore = Math.min(100, 30 + hookMatches * 15 + (wordCount > 5 ? 20 : 0));
  
  // Emotional impact analysis
  const emotionalWords = [
    'love', 'amazing', 'incredible', 'shocked', 'devastated', 'excited',
    'thrilled', 'frustrated', 'angry', 'happy', 'sad', 'funny', 'hilarious',
    'crazy', 'wild', 'unbelievable', 'awesome', 'powerful', 'inspiring',
    'motivating', 'mind-blowing', 'jaw-dropping'
  ];
  const emotionalMatches = emotionalWords.filter(e => lowerText.includes(e)).length;
  const emotionalScore = Math.min(100, 25 + emotionalMatches * 12 + (hookMatches * 5));
  
  // Clarity analysis
  const clarityIndicators = text.length > 0 && wordCount > 10 ? 70 : 50;
  const shortWords = text.split(' ').filter(w => w.length <= 6).length;
  const clarityRatio = wordCount > 0 ? (shortWords / wordCount) * 100 : 0;
  const clarityScore = Math.min(100, clarityIndicators + clarityRatio * 0.3);
  
  // Originality analysis
  const commonPhrases = [
    'in this video', 'like and subscribe', 'don\'t forget', 'stay tuned',
    'let me know', 'what do you think', 'follow me', 'check out'
  ];
  const originalityPenalty = commonPhrases.filter(p => lowerText.includes(p)).length * 5;
  const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
  const uniquenessRatio = wordCount > 0 ? (uniqueWords / wordCount) * 100 : 0;
  const originalityScore = Math.max(20, Math.min(100, 60 + uniquenessRatio * 0.3 - originalityPenalty));
  
  // Shareability analysis
  const shareIndicators = [
    'share', 'tag a friend', 'send this', 'forward', ' repost ',
    'everyone who', 'if you know someone', 'save this', 'bookmark'
  ];
  const shareMatches = shareIndicators.filter(s => lowerText.includes(s)).length;
  const shareabilityScore = Math.min(100, 40 + shareMatches * 20);
  
  // Retention analysis
  const retentionIndicators = [
    'but first', 'here\'s the thing', 'what happened next',
    'keep watching', 'stay until the end', 'the real reason',
    'at the end', 'finally reveal', 'but wait'
  ];
  const retentionMatches = retentionIndicators.filter(r => lowerText.includes(r)).length;
  const retentionScore = Math.min(100, 35 + retentionMatches * 18 + (charCount > 200 ? 15 : 0));
  
  // CTA analysis
  const ctaIndicators = [
    'subscribe', 'follow', 'like', 'comment', 'share', 'buy now',
    'click', 'link in bio', 'check out', 'visit', 'download',
    'sign up', 'join', 'get started', 'learn more', 'watch more'
  ];
  const ctaMatches = ctaIndicators.filter(c => lowerText.includes(c)).length;
  const ctaScore = Math.min(100, 25 + ctaMatches * 18);
  
  // Platform fit analysis
  const platformKeywords: Record<Platform, string[]> = {
    tiktok: ['tiktok', 'trending', 'viral', 'fyp', 'foryou', 'dance', 'challenge'],
    instagram: ['instagram', 'reels', 'follow', 'dm', 'story', 'swipe up'],
    youtube: ['youtube', 'subscribe', 'video', 'watch', 'channel', 'youtube'],
    'youtube-shorts': ['shorts', 'quick', 'minute', 'seconds', 'hack'],
    facebook: ['facebook', 'friend', 'group', 'share', 'react']
  };
  const platformMatches = platformKeywords[platform]?.filter(k => lowerText.includes(k)).length || 0;
  const platformFitScore = Math.min(100, 50 + platformMatches * 15);
  
  // Audience relevance
  const audienceIndicators = ['you', 'your', 'people', 'everyone', 'someone', 'anyone'];
  const audienceMatches = audienceIndicators.filter(a => lowerText.includes(a)).length;
  const audienceScore = Math.min(100, 40 + audienceMatches * 12);
  
  return {
    hookScore,
    emotionalScore,
    clarityScore,
    originalityScore,
    shareabilityScore,
    retentionScore,
    ctaScore,
    platformFitScore,
    audienceScore
  };
}

/**
 * Apply platform and goal multipliers to scores
 */
function applyMultipliers(
  scores: ReturnType<typeof analyzeText>,
  platform: Platform,
  goal: ContentGoal
): Record<string, number> {
  const platformMults = PLATFORM_MULTIPLIERS[platform] || {};
  const goalMults = GOAL_MULTIPLIERS[goal] || {};
  
  return {
    hookStrength: Math.min(100, scores.hookScore * (platformMults.hookStrength || 1) * (goalMults.hookStrength || 1)),
    emotionalImpact: Math.min(100, scores.emotionalScore * (goalMults.emotionalImpact || 1)),
    audienceRelevance: Math.min(100, scores.audienceScore * (goalMults.audienceRelevance || 1)),
    clarity: Math.min(100, scores.clarityScore * (platformMults.clarity || 1) * (goalMults.clarity || 1)),
    originality: Math.min(100, scores.originalityScore),
    shareability: Math.min(100, scores.shareabilityScore * (platformMults.shareability || 1) * (goalMults.shareability || 1)),
    retentionPotential: Math.min(100, scores.retentionScore * (platformMults.retentionPotential || 1) * (goalMults.retentionPotential || 1)),
    callToActionStrength: Math.min(100, scores.ctaScore * (goalMults.callToActionStrength || 1)),
    platformFit: Math.min(100, scores.platformFitScore * (platformMults.platformFit || 1))
  };
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(categoryScores: Record<string, number>): number {
  let weightedSum = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    const weight = CATEGORY_WEIGHTS[category as keyof typeof CATEGORY_WEIGHTS] || 0.1;
    weightedSum += score * weight;
  }
  
  return Math.round(weightedSum);
}

/**
 * Generate evidence and recommendations for each category
 */
function generateCategoryDetails(
  scores: Record<string, number>,
  platform: Platform,
  goal: ContentGoal
): CategoryScore[] {
  const categories = [
    { key: 'hookStrength', name: 'Hook Strength', baseEvidence: 'Opening lines and first impressions' },
    { key: 'emotionalImpact', name: 'Emotional Impact', baseEvidence: 'Emotional resonance with audience' },
    { key: 'audienceRelevance', name: 'Audience Relevance', baseEvidence: 'Relevance to target audience' },
    { key: 'clarity', name: 'Clarity', baseEvidence: 'Message clarity and understandability' },
    { key: 'originality', name: 'Originality', baseEvidence: 'Uniqueness and freshness' },
    { key: 'shareability', name: 'Shareability', baseEvidence: 'Likelihood of being shared' },
    { key: 'retentionPotential', name: 'Retention Potential', baseEvidence: 'Ability to keep viewers engaged' },
    { key: 'callToActionStrength', name: 'Call-to-Action Strength', baseEvidence: 'Effectiveness of CTAs' },
    { key: 'platformFit', name: 'Platform Fit', baseEvidence: 'Alignment with platform norms' }
  ];
  
  return categories.map(cat => {
    const score = Math.round(scores[cat.key] || 50);
    const label = getScoreLabel(score);
    
    let working = '';
    let needsImprovement = '';
    
    if (score >= 70) {
      working = `Strong ${cat.name.toLowerCase()} detected`;
    } else if (score >= 50) {
      working = `Moderate ${cat.name.toLowerCase()}, room for improvement`;
    } else {
      needsImprovement = `${cat.name} needs significant strengthening`;
    }
    
    if (cat.key === 'hookStrength' && score < 70) {
      needsImprovement = 'Consider using attention-grabbing openers, questions, or bold statements';
    } else if (cat.key === 'emotionalImpact' && score < 70) {
      needsImprovement = 'Add emotional triggers or relatable situations';
    } else if (cat.key === 'platformFit' && score < 70) {
      needsImprovement = `Content may not align well with ${platform} best practices`;
    }
    
    return {
      name: cat.name,
      score,
      label,
      evidence: cat.baseEvidence,
      working,
      needsImprovement
    };
  });
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  scores: Record<string, number>,
  platform: Platform,
  goal: ContentGoal,
  targetAudience: string
): {
  strengths: string[];
  weaknesses: string[];
  corrections: string[];
  improvedHooks: string[];
  improvedTitle: string;
  improvedScript: string;
  caption: string;
  callToAction: string;
  visualSuggestions: string[];
  platformRecs: string[];
  hashtags: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const corrections: string[] = [];
  
  if (scores.hookStrength >= 70) {
    strengths.push('Strong hook that grabs attention immediately');
  } else {
    weaknesses.push('Hook needs to be more attention-grabbing');
    corrections.push('Start with a bold statement, question, or surprising fact');
  }
  
  if (scores.emotionalImpact >= 70) {
    strengths.push('Good emotional resonance with the audience');
  } else {
    corrections.push('Add emotional triggers: curiosity, humor, surprise, or relatability');
  }
  
  if (scores.platformFit >= 70) {
    strengths.push(`Well-aligned with ${platform} platform`);
  } else {
    corrections.push(`Optimize content structure for ${platform}'s algorithm`);
  }
  
  if (scores.audienceRelevance >= 70) {
    strengths.push('Content speaks directly to the target audience');
  } else {
    corrections.push('Use more second-person language and address audience directly');
  }

  const normalizedAudience = targetAudience.toLowerCase();
  if (normalizedAudience.includes('gen x')) {
    corrections.push('For Gen X, lead with practical value, direct language, and culturally familiar references without stereotypes');
  } else if (targetAudience.trim()) {
    corrections.push(`Make the opening example explicitly relevant to ${targetAudience.trim()}`);
  }
  
  // Generate improved hooks
  const improvedHooks = [
    `Here's Why This Will ${goal === 'engagement' ? 'Go Viral' : 'Succeed'}...`,
    `Stop Scrolling. This Is What You Need...`,
    `The Secret Nobody Tells You About...`,
    `I Tested This Strategy For 30 Days. Here's What Happened...`,
    `You Need To See This Before You Create More Content...`
  ];
  
  // Generate improved title based on platform
  const improvedTitle = `${goal === 'views' ? 'How To' : 'The Ultimate Guide To'}: Boost Your ${goal === 'engagement' ? 'Engagement' : goal === 'followers' ? 'Followers' : goal === 'leads' ? 'Leads' : goal === 'sales' ? 'Sales' : 'Views'}`;
  
  // Generate improved script structure
  const improvedScript = `INTRO (0-3 seconds):
- Hook: Start with a bold statement or question
- Introduce the topic and what viewers will learn

BODY:
- Break down the main points
- Use visual aids or demonstrations
- Include personal examples or case studies

CALL TO ACTION:
- Ask viewers to like, comment, and follow
- Direct them to save the content
- Mention subscribing or checking the link in bio

OUTRO:
- Summarize key takeaways
- Tease upcoming content
- Final reminder to engage`;
  
  // Generate caption
  const caption = `This is a sample caption generated based on your content analysis.

What you'll learn:
- Key insight #1
- Key insight #2
- Key insight #3

Save this post for later! 📌

#contentcreator #${platform} #viral #tips`;
  
  // Generate CTA
  const ctaOptions = [
    `If you found this helpful, smash that like button and follow for more! 💜`,
    `Drop a comment below with your thoughts, and follow for daily tips! 👇`,
    `Save this post, share it with a friend, and follow along for more! ⬆️`,
    `Tap the link in bio to get started, and don't forget to subscribe! 🔗`
  ];
  
  // Visual suggestions
  const visualSuggestions = [
    'Use high-contrast colors that stand out in social feeds',
    'Add text overlays on key points for silent autoplay viewers',
    'Include a face or person in the first frame for better engagement',
    'Use motion graphics or animations to maintain attention',
    platform === 'tiktok' ? 'Keep visual energy high with quick cuts' : 'Maintain consistent visual branding'
  ];
  
  // Platform recommendations
  const platformRecs = [
    `Post during peak hours for ${platform}`,
    'Use the first 3 seconds to hook viewers',
    'Add closed captions for accessibility and silent viewing',
    'Engage with comments in the first hour',
    'Cross-promote on other platforms'
  ];
  
  // Hashtags
  const hashtags = [
    `#${platform}viral`,
    `#${goal}tips`,
    '#contentcreator',
    '#socialmediatips',
    '#viralblueprint'
  ];
  
  return {
    strengths,
    weaknesses,
    corrections,
    improvedHooks,
    improvedTitle,
    improvedScript,
    caption,
    callToAction: ctaOptions[0],
    visualSuggestions,
    platformRecs,
    hashtags
  };
}

/**
 * Main analysis function - processes content and returns analysis results
 * 
 * NOTE: This currently uses demonstration logic. Replace with actual AI calls
 * when connecting to a real AI provider.
 */
export async function analyzeContent(input: AnalysisInput): Promise<AnalysisResult> {
  // Simulate processing time for realistic feel
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { content, targetPlatform, goal } = input;
  
  // Analyze the text content
  const baseScores = analyzeText(content, targetPlatform, goal);
  
  // Apply multipliers based on platform and goal
  const weightedScores = applyMultipliers(baseScores, targetPlatform, goal);
  
  // Calculate overall score
  const overallScore = calculateOverallScore(weightedScores);
  const overallLabel = getScoreLabel(overallScore);
  
  // Generate category details
  const categoryScores = generateCategoryDetails(weightedScores, targetPlatform, goal);
  
  // Generate recommendations
  const recommendations = generateRecommendations(weightedScores, targetPlatform, goal, input.targetAudience || '');
  
  // Calculate expiration (7 days from now)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return {
    overallScore,
    overallLabel,
    categoryScores,
    strengths: recommendations.strengths,
    weaknesses: recommendations.weaknesses,
    recommendedCorrections: recommendations.corrections,
    improvedHooks: recommendations.improvedHooks,
    improvedTitle: recommendations.improvedTitle,
    improvedScript: recommendations.improvedScript,
    caption: recommendations.caption,
    callToAction: recommendations.callToAction,
    visualRecommendations: recommendations.visualSuggestions,
    platformRecommendations: recommendations.platformRecs,
    hashtags: recommendations.hashtags,
    confidenceNotes: 'This analysis is based on content structure and pattern recognition. Actual viral performance depends on many factors including timing, audience engagement, and platform algorithms.',
    createdAt: now,
    expiresAt
  };
}

/**
 * Analysis stages for progress display
 */
export const ANALYSIS_STAGES = [
  { id: 'content-review', label: 'Reviewing content structure...' },
  { id: 'scoring', label: 'Calculating category scores...' },
  { id: 'recommendations', label: 'Generating recommendations...' }
] as const;
