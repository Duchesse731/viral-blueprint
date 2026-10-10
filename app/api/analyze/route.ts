import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CATEGORY_NAMES = [
  'Hook Strength', 'Emotional Impact', 'Audience Relevance', 'Clarity',
  'Originality', 'Shareability', 'Retention Potential',
  'Call-to-Action Strength', 'Platform Fit',
];

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) return NextResponse.json({ error: 'Please sign in before analyzing content.' }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('Account service is not configured.');
    const account = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: user, error: authError } = await account.auth.getUser(token);
    if (authError || !user.user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    const { data: remaining, error: creditError } = await account.rpc('get_viral_blueprint_remaining_credits');
    if (creditError) throw new Error('Unable to check analysis credits.');
    if (typeof remaining !== 'number' || remaining < 1) return NextResponse.json({ error: 'No analyses remaining.' }, { status: 402 });
    const input = await request.json();
    if (!input?.content || typeof input.content !== 'string' || input.content.trim().length < 3) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }
    if (input.content.length > 20000) {
      return NextResponse.json({ error: 'Content is too long for one analysis.' }, { status: 413 });
    }

    const client = new OpenAI();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.35,
      messages: [
        {
          role: 'system',
          content: `You are Viral Blueprint, an expert social-content strategist. Return valid JSON only. Be specific, evidence-based, practical, and honest. Do not promise virality. Evaluate the submitted content itself, not the creator. For Gen X and other demographic audiences, use culturally aware guidance without stereotypes. Use no more than five hashtags.

Return exactly this shape:
{"overallScore":0,"categoryScores":[{"name":"Hook Strength","score":0,"evidence":"","working":"","needsImprovement":""}],"strengths":[""],"weaknesses":[""],"recommendedCorrections":[""],"improvedHooks":["","",""],"improvedTitle":"","improvedScript":"","caption":"","callToAction":"","visualRecommendations":[""],"platformRecommendations":[""],"hashtags":[""],"confidenceNotes":""}

categoryScores must contain exactly these nine names in this order: ${CATEGORY_NAMES.join(', ')}. Every score is an integer from 0 to 100. overallScore must reflect the category scores.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            content: input.content,
            contentType: input.contentType,
            platform: input.targetPlatform,
            goal: input.goal,
            tone: input.tone,
            targetAudience: input.targetAudience,
          }),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error('The model returned no analysis.');
    const result = JSON.parse(text);
    if (!Array.isArray(result.categoryScores) || result.categoryScores.length !== 9) {
      throw new Error('The model returned an incomplete scorecard.');
    }

    result.overallScore = clamp(result.overallScore);
    result.categoryScores = result.categoryScores.map((item: Record<string, unknown>, index: number) => ({
      name: CATEGORY_NAMES[index],
      score: clamp(item.score),
      evidence: clean(item.evidence),
      working: clean(item.working),
      needsImprovement: clean(item.needsImprovement),
    }));
    result.hashtags = Array.isArray(result.hashtags) ? result.hashtags.slice(0, 5) : [];
    const { data: consumed, error: consumeError } = await account.rpc('consume_viral_blueprint_credit');
    if (consumeError) throw new Error('Unable to apply analysis credit.');
    if (consumed !== true) return NextResponse.json({ error: 'No analysis credit was available.' }, { status: 402 });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Viral Blueprint analysis failed', error);
    return NextResponse.json({ error: 'AI analysis is temporarily unavailable.' }, { status: 503 });
  }
}

function clamp(value: unknown) {
  const score = Math.round(Number(value));
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
