# Viral Blueprint

A premium, responsive web application for content creators to evaluate and improve content before publishing.

![Viral Blueprint](https://via.placeholder.com/800x400?text=Viral+Blueprint)

## Features

### Core Functionality
- **Content Analysis**: Submit topics, hooks, captions, scripts, transcripts, images, videos, or video links for analysis
- **Viral Score**: Get an overall score (0-100) based on 9 category assessments
- **Improvement Blueprint**: Receive actionable recommendations for improvement
- **Script Studio**: Edit and refine scripts with AI-powered suggestions
- **Caption & Publishing**: Generate optimized captions, titles, CTAs, and hashtags

### Supported Platforms
- Facebook
- Instagram
- TikTok
- YouTube
- YouTube Shorts

### Content Goals
- Views
- Engagement
- Followers
- Leads
- Sales

### Score Categories
1. Hook Strength
2. Emotional Impact
3. Audience Relevance
4. Clarity
5. Originality
6. Shareability
7. Retention Potential
8. Call-to-Action Strength
9. Platform Fit

## Technical Architecture

### Stack
- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: CSS with CSS Variables (custom design system)
- **Icons**: Lucide React + Custom SVG icons
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Authentication and Credits**: Supabase Auth with atomic server-side credit accounting
- **Project Storage**: LocalStorage with seven-day retention

### Project Structure
```
/workspace/project
├── app/
│   ├── globals.css          # Global styles and design system
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application component
├── services/
│   ├── analysisService.ts  # Scoring and recommendation engine
│   ├── authService.ts      # Supabase authentication and credit calls
│   ├── supabaseClient.ts   # Browser client configuration
│   └── storeService.ts     # LocalStorage persistence
├── supabase/migrations/    # Versioned database schema and policies
├── types/
│   └── index.ts            # TypeScript type definitions
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

### Analysis Service Architecture
The analysis service is designed with a clean separation between the interface and the scoring engine:

1. **Text Analysis Module**: Analyzes content structure and patterns
2. **Scoring Engine**: Applies weighted calculations and platform/goal multipliers
3. **Recommendation Generator**: Produces actionable improvements
4. **Schema Output**: Returns structured results for UI rendering

**Note**: The current implementation uses demonstration logic. To connect a real AI provider, replace the `analyzeContent` function in `services/analysisService.ts` with actual AI API calls while maintaining the same input/output schema.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd /workspace/project

# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm start
```

### Environment
Copy `.env.example` to `.env.local` and set the Zenori Backend project URL and publishable key. Never use a Supabase secret or service-role key in a `NEXT_PUBLIC_` variable.

## Screens

### 1. Welcome Screen
- Product introduction and logo
- Clear disclaimer about viral performance
- Get Started and Sign In buttons
- Platform support indicators

### 2. Creator Onboarding
- 4-step wizard for profile setup
- Collects: name, niche, target audience, platforms, goals, tone
- Validates required fields

### 3. Home Dashboard
- "Ready to build your next viral post?" header
- Prominent Analyze My Content button
- Create From an Idea button
- Usage statistics and best score
- Recent projects list with expiration notices

### 4. New Analysis
- Content type selector (8 types)
- Large content input area
- Platform selector
- Goal and tone selectors
- Target audience field with default from profile

### 5. Analysis Progress
- Real-time stage indicators
- Content review, scoring, recommendations stages
- Working cancel button
- No fake timers or percentages

### 6. Viral Score
- Large circular score display (0-100)
- Score label (Needs Major Improvement to Exceptional Potential)
- 9 category breakdowns with individual scores
- Color-coded results

### 7. Improvement Blueprint
- What's working section
- Needs improvement section
- Stronger hook options
- Recommended title
- Content structure recommendations
- Visual suggestions
- Hashtags
- Platform publishing checklist
- Section-by-section regeneration

### 8. Script Studio
- Original vs improved script panels
- Format selector (short/long form)
- Platform and tone controls
- Editable content areas
- Copy and save functionality

### 9. Caption & Publishing
- Editable title, caption, CTA
- Hashtag display
- Publishing notes
- Copy Everything button

### 10. Full Report
- Complete analysis summary
- Export to Markdown
- Print-friendly format
- Expiration information

### 11. Projects
- Grid of all projects
- Platform, date, score, status
- Duplicate, delete with confirmation
- New analysis button

### 12. Project Details
- Original submission display
- Score summary
- Quick actions
- Expiration alert with download option
- Delete with confirmation

### 13. Plans
- Free plan (1 successful analysis total)
- Pro plan placeholder ($39.99-$49.99/month)
- Clear feature comparison
- Checkout placeholder

### 14. Settings
- Profile management
- Platform preferences
- Notification settings
- Data export
- Sign out

### 15. Expiration Notice
- 7-day automatic deletion
- Exact expiration dates
- Download reminders
- Clear messaging about temporary nature

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Midnight Navy | `#0a0f1c` | Main background |
| Midnight Light | `#111827` | Cards, sidebar |
| Electric Purple | `#8b5cf6` | Primary buttons, accents |
| Bright Cyan | `#06b6d4` | Scores, highlights |
| White | `#ffffff` | Primary text |
| Soft Gray | `#374151` | Secondary elements |
| Green | `#10b981` | Strong results |
| Gold | `#eab308` | Areas needing improvement |
| Red | `#ef4444` | Errors, destructive actions |

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Scale**: 12px to 48px

### Spacing
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px
- 3XL: 64px

### Border Radius
- SM: 6px
- MD: 10px
- LG: 16px
- XL: 24px
- Full: 9999px

## External Integrations Required

The following features cannot operate until external services are configured:

| Feature | Status | Requirements |
|---------|--------|--------------|
| AI Analysis | Demo Mode | Connect to OpenAI, Anthropic, or other AI provider |
| Authentication | Connected | Supabase Auth through Zenori Backend |
| Payment Processing | Placeholder | Connect Stripe or payment provider |
| Cloud Storage | LocalStorage | Connect cloud database for multi-device sync |
| Email Notifications | Client-side only | Connect email service (SendGrid, etc.) |
| File Upload | Input Only | Connect cloud storage (S3, Cloudinary, etc.) |

## Data & Privacy

- **Local Project Storage**: Project records remain in the current browser
- **7-Day Expiration**: Expired local project records are permanently removed when the app loads them
- **Server-Enforced Credits**: Free-credit balances cannot be reset from LocalStorage
- **No API Keys Exposed**: Credentials kept server-side when implemented
- **Export Available**: Users can export their data anytime

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes

- Static generation for fast initial load
- Client-side hydration for interactivity
- CSS-based animations (no heavy animation libraries)
- Optimized asset loading

## License

MIT

## Support

For questions or issues, please contact the Zenori team.
