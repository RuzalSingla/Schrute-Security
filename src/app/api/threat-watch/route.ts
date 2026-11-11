import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const cisaFeedUrls = [
  'https://raw.githubusercontent.com/cisagov/kev-data/develop/known_exploited_vulnerabilities.json',
  'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
];
const catalogSchema = z.object({
  catalogVersion: z.string(),
  dateReleased: z.string(),
  count: z.number().int().nonnegative(),
  vulnerabilities: z.array(z.object({
    cveID: z.string(),
    vendorProject: z.string(),
    product: z.string(),
    vulnerabilityName: z.string(),
    dateAdded: z.string(),
    shortDescription: z.string(),
    requiredAction: z.string(),
    dueDate: z.string().optional(),
    knownRansomwareCampaignUse: z.string().optional(),
    notes: z.string().optional(),
  }).passthrough()),
}).passthrough();

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.has('refresh');
  try {
    let feedResponse: Response | undefined;
    for (const feedUrl of cisaFeedUrls) {
      try {
        const response = await fetch(feedUrl, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(12_000),
          ...(forceRefresh ? { cache: 'no-store' as const } : { next: { revalidate: 900 } }),
        });
        if (response.ok) {
          feedResponse = response;
          break;
        }
      } catch {
        // Try the other CISA-maintained delivery URL before reporting an outage.
      }
    }
    if (!feedResponse) return NextResponse.json({ error: 'CISA’s catalog is temporarily unavailable. Please try again shortly.' }, { status: 502 });

    const parsed = catalogSchema.safeParse(await feedResponse.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'CISA returned a catalog format we could not safely read.' }, { status: 502 });
    }

    const vulnerabilities = [...parsed.data.vulnerabilities].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    return NextResponse.json({
      source: {
        name: 'CISA Known Exploited Vulnerabilities Catalog',
        url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
        catalogVersion: parsed.data.catalogVersion,
        dateReleased: parsed.data.dateReleased,
        count: parsed.data.count,
        retrievedAt: new Date().toISOString(),
      },
      vulnerabilities,
      note: 'CISA KEV entries are software vulnerabilities known to have been exploited in the wild. They are not live attack events or victim locations.',
    }, { headers: { 'Cache-Control': forceRefresh ? 'no-store' : 'public, s-maxage=900, stale-while-revalidate=3600' } });
  } catch {
    return NextResponse.json({ error: 'Could not reach CISA’s catalog. Check your connection and try again.' }, { status: 502 });
  }
}
