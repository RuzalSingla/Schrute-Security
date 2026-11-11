'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, CalendarClock, ExternalLink, LoaderCircle, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageTitle } from '@/components/chrome';
import RansomwareMap from '@/components/ransomware-map';
import Image from 'next/image';

type RansomwareClaim = { id: string; victim: string; group: string; country: string | null; sector: string; discovered: string | null; attackDate: string | null; sourceUrl: string | null };
type RansomwareFeed = { source: { name: string; url: string; retrievedAt: string }; stats: { totalVictims?: number; totalGroups?: number; totalAttacks?: number; countriesHit?: number; lastUpdate?: string; source?: string } | null; victims: RansomwareClaim[]; note: string };

type Vulnerability = {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate?: string;
  knownRansomwareCampaignUse?: string;
  notes?: string;
};

type Catalog = {
  source: { name: string; url: string; catalogVersion: string; dateReleased: string; count: number; retrievedAt: string };
  vulnerabilities: Vulnerability[];
  note: string;
};

function formatDate(value?: string) {
  if (!value) return 'Not listed';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: LucideIcon }) {
  return <article className="paper-card threat-metric"><div className="threat-metric-top"><span>{label}</span><Icon size={18} aria-hidden="true"/></div><strong>{value}</strong><small>{detail}</small></article>;
}

export default function ThreatWatch() {
  const [ransomwareFeed, setRansomwareFeed] = useState<RansomwareFeed | null>(null);
  const [ransomwareLoading, setRansomwareLoading] = useState(true);
  const [ransomwareRefreshing, setRansomwareRefreshing] = useState(false);
  const [ransomwareError, setRansomwareError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [victimSearch, setVictimSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All sectors');
  const [visibleClaimCount, setVisibleClaimCount] = useState(20);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [vendor, setVendor] = useState('All vendors');
  const [ransomware, setRansomware] = useState('Any status');
  const [visibleCount, setVisibleCount] = useState(20);

  const loadRansomwareFeed = useCallback(async (fresh = false) => {
    if (fresh) setRansomwareRefreshing(true); else setRansomwareLoading(true);
    setRansomwareError('');
    try {
      const response = await fetch(fresh ? `/api/threat-watch/ransomware?refresh=${Date.now()}` : '/api/threat-watch/ransomware', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Ransomware reports could not be loaded.');
      const freshFeed = payload as RansomwareFeed;
      setRansomwareFeed(previous => ({ ...freshFeed, stats: freshFeed.stats ?? previous?.stats ?? null }));
    } catch (caught) {
      setRansomwareError(caught instanceof Error ? caught.message : 'Ransomware reports could not be loaded.');
    } finally {
      setRansomwareLoading(false);
      setRansomwareRefreshing(false);
    }
  }, []);

  const loadCatalog = useCallback(async (fresh = false) => {
    if (fresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const response = await fetch(fresh ? `/api/threat-watch?refresh=${Date.now()}` : '/api/threat-watch', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'The threat feed could not be loaded.');
      setCatalog(payload as Catalog);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The threat feed could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadCatalog(); void loadRansomwareFeed(); }, [loadCatalog, loadRansomwareFeed]);
  useEffect(() => { setVisibleClaimCount(20); }, [selectedCountry]);

  const vendors = useMemo(() => [...new Set((catalog?.vulnerabilities ?? []).map(item => item.vendorProject).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [catalog]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (catalog?.vulnerabilities ?? []).filter(item => {
      const matchesQuery = !needle || [item.cveID, item.vendorProject, item.product, item.vulnerabilityName, item.shortDescription].some(value => value?.toLowerCase().includes(needle));
      const matchesVendor = vendor === 'All vendors' || item.vendorProject === vendor;
      const ransomwareStatus = item.knownRansomwareCampaignUse?.toLowerCase() ?? 'unknown';
      const matchesRansomware = ransomware === 'Any status' || (ransomware === 'Known' ? ransomwareStatus === 'known' : ransomware === 'Unknown' ? ransomwareStatus !== 'known' : ransomwareStatus === 'no');
      return matchesQuery && matchesVendor && matchesRansomware;
    });
  }, [catalog, query, vendor, ransomware]);

  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentCount = catalog?.vulnerabilities.filter(item => new Date(`${item.dateAdded}T00:00:00`).getTime() >= recentCutoff).length ?? 0;
  const ransomwareCount = catalog?.vulnerabilities.filter(item => item.knownRansomwareCampaignUse?.toLowerCase() === 'known').length ?? 0;
  const countryCounts = useMemo(() => {
    const claimsByCountry = new Map<string, RansomwareClaim[]>();
    for (const victim of ransomwareFeed?.victims ?? []) if (victim.country) claimsByCountry.set(victim.country, [...(claimsByCountry.get(victim.country) || []), victim]);
    return [...claimsByCountry].map(([country, claims]) => ({ country, count: claims.length, claims: claims.slice(0, 4) })).sort((a, b) => b.count - a.count);
  }, [ransomwareFeed]);
  const recentGroupCount = useMemo(() => new Set((ransomwareFeed?.victims ?? []).map(item => item.group).filter(group => group && group !== 'Unattributed')).size, [ransomwareFeed]);
  const sectors = useMemo(() => [...new Set((ransomwareFeed?.victims ?? []).map(item => item.sector).filter(item => item && item !== 'Not specified'))].sort((a, b) => a.localeCompare(b)), [ransomwareFeed]);
  const visibleVictims = useMemo(() => (ransomwareFeed?.victims ?? []).filter(item => {
    const text = `${item.victim} ${item.group} ${item.sector} ${item.country || ''}`.toLowerCase();
    return (!victimSearch.trim() || text.includes(victimSearch.trim().toLowerCase())) && (!selectedCountry || item.country === selectedCountry) && (sectorFilter === 'All sectors' || item.sector === sectorFilter);
  }), [ransomwareFeed, victimSearch, selectedCountry, sectorFilter]);
  const countryLabel = (code: string) => {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch { return code; }
  };

  return <main className="section threat-watch-page"><div className="wrap">
    <div className="threat-watch-intro">
      <PageTitle kicker="01 / Observe · Open threat data" title="Global Threat Watch" description="Follow recent ransomware-group victim claims by reported country, then review CISA’s separate catalog of vulnerabilities known to be exploited in the wild. Each feed is labeled by what it can and cannot verify." />
      <aside className="threat-watch-memes" aria-label="Office security reaction images">
        <Image src="/images/threat-watch-michael-diary.png" alt="Michael asks why Dwight has a diary" width={540} height={405} />
        <Image src="/images/threat-watch-dwight-secrets.png" alt="Dwight says the diary is to keep secrets from his computer" width={540} height={405} />
      </aside>
    </div>

    <section className="ransomware-activity" aria-labelledby="ransomware-activity-title">
      <div className="threat-feed-heading"><div><div className="eyebrow">Ransomware disclosures · claims, not confirmed breaches</div><h2 id="ransomware-activity-title">Reported ransomware activity</h2><p>Recent public claims monitored from ransomware leak sites.</p></div><button type="button" className="threat-refresh" onClick={() => void loadRansomwareFeed(true)} disabled={ransomwareLoading || ransomwareRefreshing}><RefreshCw size={15} className={ransomwareRefreshing ? 'threat-spin' : ''}/>{ransomwareRefreshing ? 'Checking…' : 'Refresh activity'}</button></div>
      {ransomwareError && <div role="alert" className="threat-error"><AlertTriangle size={18}/><span>{ransomwareError}</span><button type="button" onClick={() => void loadRansomwareFeed()}>Retry</button></div>}
      {ransomwareLoading ? <div role="status" className="threat-loading paper-card"><LoaderCircle size={22} className="threat-spin"/> Loading recent ransomware claims…</div> : ransomwareFeed && <>
        <div className="threat-metrics-grid ransomware-metrics">
          <Metric label="Tracked victim claims" value={(ransomwareFeed.stats?.totalVictims ?? ransomwareFeed.victims.length).toLocaleString()} detail={ransomwareFeed.stats?.totalVictims !== undefined ? 'Source-reported cumulative total' : 'Recent feed size; cumulative total unavailable'} icon={Activity}/>
          <Metric label="Tracked groups" value={(ransomwareFeed.stats?.totalGroups ?? recentGroupCount).toLocaleString()} detail={ransomwareFeed.stats?.totalGroups !== undefined ? 'Groups in the source dataset' : 'Distinct groups in the recent feed'} icon={ShieldCheck}/>
          <Metric label="Recent claims loaded" value={ransomwareFeed.victims.length.toLocaleString()} detail="Latest entries in this feed" icon={CalendarClock}/>
          <Metric label="Countries in recent feed" value={countryCounts.length.toLocaleString()} detail="Country is missing from some claims" icon={AlertTriangle}/>
        </div>
        <div className="ransom-map-layout">
          <section className="paper-card ransom-map-panel" aria-label="Ransomware claims by reported victim country"><div className="ransom-panel-heading"><strong>Reported victim countries</strong><span>Click a marker for claim details</span></div><RansomwareMap markers={countryCounts} onCountrySelect={code => setSelectedCountry(current => current === code ? '' : code)}/><p className="ransom-map-caption">Markers sit at approximate country centres and count claims in the recent feed. They do not identify exact locations or attacker origins.</p></section>
          <section className="paper-card ransom-country-panel"><div className="ransom-panel-heading"><strong>Most represented</strong><span>Recent feed</span></div><label className="ransom-country-search"><Search size={15}/><span className="sr-only">Search countries in recent feed</span><input value={countrySearch} onChange={event => setCountrySearch(event.target.value)} placeholder="Search countries in feed…"/></label>{countryCounts.length ? countryCounts.filter(({ country }) => !countrySearch.trim() || `${countryLabel(country)} ${country}`.toLowerCase().includes(countrySearch.trim().toLowerCase())).slice(0, countrySearch.trim() ? undefined : 10).map(({ country, count }) => <button type="button" key={country} className={`ransom-country-row ${selectedCountry === country ? 'is-selected' : ''}`} onClick={() => setSelectedCountry(current => current === country ? '' : country)}><span>{countryLabel(country)} <small>{country}</small></span><b>{count}</b></button>) : <p className="threat-empty">No country-coded claims in the feed.</p>}{countryCounts.length > 0 && countrySearch.trim() && !countryCounts.some(({ country }) => `${countryLabel(country)} ${country}`.toLowerCase().includes(countrySearch.trim().toLowerCase())) && <p className="ransom-country-no-results">No matching countries in the recent feed.</p>}{selectedCountry && <button type="button" className="ransom-clear-filter" onClick={() => setSelectedCountry('')}>Clear {countryLabel(selectedCountry)} filter</button>}</section>
        </div>
        <section className="ransom-claims-section" aria-labelledby="ransom-claims-title"><div className="ransom-claims-heading"><div><div className="eyebrow">Recent source entries</div><h3 id="ransom-claims-title">Ransomware group claims</h3><p>Showing {Math.min(visibleClaimCount, visibleVictims.length)} of {visibleVictims.length} matching claims</p></div><div className="ransom-claims-filters"><label className="threat-search"><span className="sr-only">Search ransomware claims</span><Search size={16}/><input value={victimSearch} onChange={event => { setVictimSearch(event.target.value); setVisibleClaimCount(20); }} placeholder="Search victim, group, country…"/></label><label><span className="sr-only">Filter by sector</span><select value={sectorFilter} onChange={event => { setSectorFilter(event.target.value); setVisibleClaimCount(20); }}><option>All sectors</option>{sectors.map(sector => <option key={sector}>{sector}</option>)}</select></label></div></div>
          {visibleVictims.length ? <><div className="ransom-claim-list">{visibleVictims.slice(0, visibleClaimCount).map(item => <article className="paper-card ransom-claim" key={item.id}><div className="ransom-claim-date">{formatDate(item.discovered || item.attackDate || undefined)}</div><div className="ransom-claim-main"><strong>{item.victim}</strong><span>{item.group}</span></div><span className="ransom-claim-sector">{item.sector}</span><span className="ransom-claim-country">{item.country ? countryLabel(item.country) : 'Country not reported'}</span>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink size={13}/></a>}</article>)}</div>{visibleClaimCount < visibleVictims.length && <button type="button" className="threat-load-more" onClick={() => setVisibleClaimCount(count => count + 20)}>Load more claims</button>}</> : <div className="threat-empty paper-card">No claims match those filters.</div>}
        </section>
        <p className="threat-watch-footnote">{ransomwareFeed.note} Source: <a href={ransomwareFeed.source.url} target="_blank" rel="noreferrer">Ransomwhere.org <ExternalLink size={12}/></a>. Underlying victim posts are monitored by <a href="https://www.ransomware.live/" target="_blank" rel="noreferrer">Ransomware.live <ExternalLink size={12}/></a>.</p>
      </>}
    </section>

    <div className="threat-watch-source paper-card">
      <div className="threat-source-mark"><Activity size={20}/></div>
      <div className="threat-source-copy"><strong>CISA Known Exploited Vulnerabilities Catalog</strong><span>Official catalog · refreshed on request · cached for 15 minutes during normal visits</span></div>
      <a href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog" target="_blank" rel="noreferrer">Source <ExternalLink size={14}/></a>
      <button type="button" className="threat-refresh" onClick={() => void loadCatalog(true)} disabled={loading || refreshing}><RefreshCw size={15} className={refreshing ? 'threat-spin' : ''}/>{refreshing ? 'Checking…' : 'Check for updates'}</button>
    </div>

    {error && <div role="alert" className="threat-error"><AlertTriangle size={18}/><span>{error}</span><button type="button" onClick={() => void loadCatalog()}>Retry</button></div>}

    {catalog && <>
      <div className="threat-metrics-grid">
        <Metric label="Catalog entries" value={catalog.source.count.toLocaleString()} detail={`Catalog version ${catalog.source.catalogVersion}`} icon={ShieldCheck}/>
        <Metric label="Added in the last 30 days" value={recentCount.toLocaleString()} detail="Based on CISA date added" icon={CalendarClock}/>
        <Metric label="Ransomware use noted" value={ransomwareCount.toLocaleString()} detail="CISA marks use as known" icon={AlertTriangle}/>
        <Metric label="Catalog release" value={formatDate(catalog.source.dateReleased)} detail={`Retrieved ${new Date(catalog.source.retrievedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`} icon={Activity}/>
      </div>

      <section className="threat-feed-section" aria-labelledby="kev-title">
        <div className="threat-feed-heading"><div><div className="eyebrow">Exploited vulnerability feed</div><h2 id="kev-title">Known exploited vulnerabilities</h2><p>{filtered.length.toLocaleString()} matching {filtered.length === 1 ? 'entry' : 'entries'} · newest additions first</p></div><span className="threat-live-tag"><i/> CISA catalog loaded</span></div>

        <div className="threat-filters paper-card">
          <label className="threat-search"><span className="sr-only">Search vulnerabilities</span><Search size={17}/><input value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(20); }} placeholder="Search CVE, vendor, product…" /></label>
          <label><span className="sr-only">Filter by vendor</span><select value={vendor} onChange={event => { setVendor(event.target.value); setVisibleCount(20); }}><option>All vendors</option>{vendors.map(name => <option key={name}>{name}</option>)}</select></label>
          <label><span className="sr-only">Filter by ransomware use</span><select value={ransomware} onChange={event => { setRansomware(event.target.value); setVisibleCount(20); }}><option>Any status</option><option>Known</option><option>Unknown</option><option>No</option></select></label>
        </div>

        {loading ? <div className="threat-loading" role="status"><LoaderCircle size={22} className="threat-spin"/> Loading the CISA catalog…</div> : filtered.length === 0 ? <div className="threat-empty paper-card">No catalog entries match those filters. Try another vendor or search term.</div> : <div className="threat-record-list">
          {filtered.slice(0, visibleCount).map(item => <details className="threat-record paper-card" key={item.cveID}>
            <summary><span className="threat-record-date">{formatDate(item.dateAdded)}</span><span className="threat-record-main"><strong>{item.cveID}</strong><span>{item.vulnerabilityName || item.product}</span><small>{item.vendorProject} · {item.product}</small></span><span className={`threat-ransom-tag ${item.knownRansomwareCampaignUse?.toLowerCase() === 'known' ? 'is-known' : ''}`}>{item.knownRansomwareCampaignUse?.toLowerCase() === 'known' ? 'Ransomware use known' : 'Ransomware use unknown'}</span><ArrowUpRight size={17} className="threat-record-arrow"/></summary>
            <div className="threat-record-details"><p>{item.shortDescription}</p><div className="threat-action"><strong>Recommended action</strong><span>{item.requiredAction}</span></div><div className="threat-deadline"><span><b>CISA due date:</b> {formatDate(item.dueDate)}</span>{item.notes && <span><b>Notes:</b> {item.notes}</span>}</div><a href={`https://nvd.nist.gov/vuln/detail/${encodeURIComponent(item.cveID)}`} target="_blank" rel="noreferrer">View vulnerability record at NVD <ExternalLink size={13}/></a></div>
          </details>)}
          {visibleCount < filtered.length && <button type="button" className="threat-load-more" onClick={() => setVisibleCount(count => count + 20)}>Load 20 more entries</button>}
        </div>}
      </section>

      <p className="threat-watch-footnote">{catalog.note} Catalog release date: {formatDate(catalog.source.dateReleased)}. Data source: <a href={catalog.source.url} target="_blank" rel="noreferrer">CISA KEV <ExternalLink size={12}/></a>.</p>
    </>}
  </div></main>;
}
