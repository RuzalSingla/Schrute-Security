import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const apiBase = (process.env.RANSOMWHERE_API_BASE || 'https://ransomwhere.org/api').replace(/\/$/, '');
const victimSchema = z.object({
  victim: z.string().min(1),
  group: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  activity: z.string().nullable().optional(),
  discovered: z.string().nullable().optional(),
  attackdate: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  permalink: z.string().nullable().optional(),
}).passthrough();
const statsSchema = z.object({
  totalVictims: z.number().optional(),
  totalGroups: z.number().optional(),
  totalAttacks: z.number().optional(),
  countriesHit: z.number().optional(),
  lastUpdate: z.string().optional(),
  source: z.string().optional(),
}).passthrough();

async function getJson(url: string, revalidate: number, forceRefresh: boolean) {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
    ...(forceRefresh ? { cache: 'no-store' as const } : { next: { revalidate } }),
  });
  if (!response.ok) throw new Error(`Threat source returned HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.has('refresh');
  try {
    const [rawVictims, rawStats] = await Promise.all([
      getJson(`${apiBase}/victims`, 120, forceRefresh),
      getJson(`${apiBase}/stats`, 300, forceRefresh).catch(() => null),
    ]);

    const rows = Array.isArray(rawVictims) ? rawVictims :
      rawVictims && typeof rawVictims === 'object' && Array.isArray((rawVictims as { victims?: unknown }).victims) ? (rawVictims as { victims: unknown[] }).victims : null;
    if (!rows) throw new Error('The ransomware source returned an unexpected response.');

    const victims = rows.flatMap((row, index) => {
      const parsed = victimSchema.safeParse(row);
      if (!parsed.success) return [];
      const value = parsed.data;
      const safeUrl = [value.url, value.permalink].find(url => typeof url === 'string' && url.startsWith('https://')) || null;
      return [{
        id: `${value.victim}-${value.group || 'unknown'}-${value.discovered || value.attackdate || index}`,
        victim: value.victim,
        group: value.group || 'Unattributed',
        country: value.country?.trim().toUpperCase() || null,
        sector: value.sector || value.activity || 'Not specified',
        discovered: value.discovered || null,
        attackDate: value.attackdate || null,
        sourceUrl: safeUrl,
      }];
    });
    if (rows.length && !victims.length) throw new Error('The ransomware source data could not be validated.');

    const parsedStats = statsSchema.safeParse(rawStats);
    const stats = parsedStats.success ? parsedStats.data : null;
    return NextResponse.json({
      source: { name: 'Ransomwhere.org · sourced from Ransomware.live', url: 'https://ransomwhere.org/developers', retrievedAt: new Date().toISOString() },
      stats,
      victims,
      note: 'These entries are ransomware-group claims published on leak sites. They are unverified and may be incomplete, repeated, or inaccurate. Country markers show the reported victim country at approximate country-centre coordinates; they are not exact incident locations or attacker locations.',
    }, { headers: { 'Cache-Control': forceRefresh ? 'no-store' : 'public, s-maxage=120, stale-while-revalidate=600' } });
  } catch (error) {
    const message = error instanceof Error && error.message.includes('unexpected response') ? error.message : 'The ransomware activity feed is temporarily unavailable. Please try again.';
    return NextResponse.json({ error: message }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
