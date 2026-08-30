import { describe, expect, it, vi } from 'vitest';
import { analyzeContent } from './analysisService';

describe('audience-aware analysis', () => {
  it('adds practical, non-stereotyping guidance for Gen X', async () => {
    vi.useFakeTimers();
    const pending = analyzeContent({
      content: 'A practical guide to creating better posts.',
      contentType: 'topic',
      targetPlatform: 'facebook',
      goal: 'engagement',
      tone: 'casual',
      targetAudience: 'Gen X (ages 46–61)',
    });
    await vi.runAllTimersAsync();
    const result = await pending;
    vi.useRealTimers();

    expect(result.recommendedCorrections).toContain(
      'For Gen X, lead with practical value, direct language, and culturally familiar references without stereotypes'
    );
  });
});
