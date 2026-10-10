import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), generate: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc }) }));
vi.mock('openai', () => ({ default: class { chat = { completions: { create: mocks.generate } }; } }));
import { POST } from './route';

const request = (token = true) => new Request('https://example.test/api/analyze', {
  method: 'POST', headers: token ? { Authorization: 'Bearer test-token' } : {},
  body: JSON.stringify({ content: 'A real test script for creators.' }),
});

describe('analysis account and credit enforcement', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'creator' } }, error: null });
    mocks.rpc.mockImplementation(async name => ({ data: name === 'consume_viral_blueprint_credit' ? true : 1, error: null }));
  });

  it('blocks unsigned requests before calling AI or credits', async () => {
    expect((await POST(request(false))).status).toBe(401);
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('blocks exhausted accounts before calling AI', async () => {
    mocks.rpc.mockResolvedValue({ data: 0, error: null });
    expect((await POST(request())).status).toBe(402);
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it('does not charge when the AI service fails', async () => {
    mocks.generate.mockRejectedValue(new Error('provider unavailable'));
    expect((await POST(request())).status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalledWith('consume_viral_blueprint_credit');
  });

  it('charges exactly once after a complete AI result', async () => {
    mocks.generate.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({
      overallScore: 75, categoryScores: Array.from({ length: 9 }, () => ({ score: 75 })), hashtags: [],
    }) } }] });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.rpc.mock.calls.filter(([name]) => name === 'consume_viral_blueprint_credit')).toHaveLength(1);
  });
});
