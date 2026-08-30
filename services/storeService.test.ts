// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { getProjects } from './storeService';

describe('seven-day project retention', () => {
  beforeEach(() => localStorage.clear());

  it('permanently removes expired records while keeping active projects', () => {
    localStorage.setItem('viral-blueprint-projects', JSON.stringify([
      { id: 'expired', expiresAt: new Date(Date.now() - 1_000).toISOString() },
      { id: 'active', expiresAt: new Date(Date.now() + 60_000).toISOString() },
    ]));

    expect(getProjects().map(project => project.id)).toEqual(['active']);
    expect(JSON.parse(localStorage.getItem('viral-blueprint-projects') || '[]'))
      .toHaveLength(1);
  });
});
