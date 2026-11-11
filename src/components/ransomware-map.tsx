'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Map, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const countryCenters: Record<string, [number, number]> = {
  US: [-98, 39], CA: [-106, 57], MX: [-102, 23], BR: [-52, -10], AR: [-64, -34], CL: [-71, -30], CO: [-74, 4], PE: [-75, -10],
  GB: [-3, 55], UK: [-3, 55], IE: [-8, 53], FR: [2, 46], DE: [10, 51], NL: [5, 52], BE: [4.5, 50.5], ES: [-4, 40], PT: [-8, 39], IT: [12, 42], CH: [8, 47], AT: [14, 47.5], SE: [15, 62], NO: [8, 61], DK: [10, 56], FI: [26, 64], PL: [19, 52], CZ: [15, 49], SK: [19, 48], HU: [19, 47], RO: [25, 46], BG: [25, 42], GR: [22, 39], UA: [32, 49], RU: [100, 60], TR: [35, 39],
  IL: [35, 31], SA: [45, 24], AE: [54, 24], QA: [51, 25], KW: [47, 29], JO: [36, 31], IR: [53, 32], IQ: [44, 33], IN: [79, 22], PK: [69, 30], BD: [90, 24], JP: [138, 37], KR: [128, 36], CN: [103, 35], TW: [121, 24], HK: [114, 22], SG: [104, 1], ID: [118, -2], MY: [102, 4], TH: [101, 15], VN: [108, 16], PH: [122, 12], AU: [134, -25], NZ: [172, -41],
  ZA: [24, -29], NG: [8, 9], EG: [30, 26], KE: [38, 0], GH: [-2, 8], MA: [-7, 32], TN: [9, 34], DZ: [3, 28], ET: [40, 9], TZ: [35, -6], UG: [32, 1], RW: [30, -2], MU: [57.5, -20],
};

type MarkerClaim = { victim: string; group: string; sector: string; discovered: string | null; attackDate: string | null; sourceUrl: string | null };
type MarkerData = { country: string; count: number; claims: MarkerClaim[] };
const countryName = (code: string) => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch { return code; }
};
const formatDate = (value: string | null) => {
  if (!value) return 'Date not reported';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
};

export default function RansomwareMap({ markers, onCountrySelect }: { markers: MarkerData[]; onCountrySelect: (code: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markerHandles = useRef<Marker[]>([]);
  const popup = useRef<Popup | null>(null);
  const selectRef = useRef(onCountrySelect);
  const [error, setError] = useState(false);
  useEffect(() => { selectRef.current = onCountrySelect; }, [onCountrySelect]);

  useEffect(() => {
    if (!host.current) return;
    let instance: Map | null = null;
    try {
      maplibregl.setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString());
      instance = new maplibregl.Map({
        container: host.current,
        style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty',
        center: [0, 18],
        zoom: 0,
        minZoom: 0,
        attributionControl: {},
      });
      map.current = instance;
      instance.addControl(new maplibregl.NavigationControl(), 'top-right');
      instance.on('load', () => setError(false));
      instance.on('error', () => setError(true));
    } catch {
      setError(true);
    }
    return () => {
      markerHandles.current.forEach(marker => marker.remove());
      markerHandles.current = [];
      popup.current?.remove();
      popup.current = null;
      instance?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    markerHandles.current.forEach(marker => marker.remove());
    markerHandles.current = markers.flatMap(({ country, count, claims }) => {
      const center = countryCenters[country];
      if (!center) return [];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ransom-map-marker';
      button.textContent = String(count);
      button.setAttribute('aria-label', `${countryName(country)}: ${count} reported ransomware ${count === 1 ? 'claim' : 'claims'}. Filter list by country.`);
      button.title = `${countryName(country)} · ${count} reported ${count === 1 ? 'claim' : 'claims'}`;
      button.addEventListener('click', () => {
        selectRef.current(country);
        popup.current?.remove();
        const content = document.createElement('div');
        content.className = 'ransom-map-popup';
        const heading = document.createElement('strong');
        heading.className = 'ransom-map-popup-title';
        heading.textContent = countryName(country);
        content.append(heading);
        const summary = document.createElement('p');
        summary.className = 'ransom-map-popup-summary';
        summary.textContent = `${count} reported ${count === 1 ? 'claim' : 'claims'} in the latest feed`;
        content.append(summary);
        const list = document.createElement('ul');
        list.className = 'ransom-map-popup-list';
        claims.slice(0, 4).forEach(claim => {
          const row = document.createElement('li');
          const victim = document.createElement('strong');
          victim.textContent = claim.victim;
          const details = document.createElement('span');
          details.textContent = [claim.group, claim.sector, formatDate(claim.discovered || claim.attackDate)].filter(Boolean).join(' · ');
          row.append(victim, details);
          if (claim.sourceUrl) {
            const source = document.createElement('a');
            source.href = claim.sourceUrl;
            source.target = '_blank';
            source.rel = 'noreferrer';
            source.className = 'ransom-popup-source';
            source.textContent = 'Open source record';
            row.append(source);
          }
          list.append(row);
        });
        content.append(list);
        const note = document.createElement('small');
        note.className = 'ransom-map-popup-note';
        note.textContent = 'These are unverified group claims; locations are approximate country centres.';
        content.append(note);
        popup.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: '310px', offset: 15 })
          .setLngLat(center)
          .setDOMContent(content)
          .addTo(instance);
      });
      return [new maplibregl.Marker({ element: button, anchor: 'center' }).setLngLat(center).addTo(instance)];
    });
  }, [markers]);

  return <div className="ransom-map-frame"><div className="ransom-map-canvas" ref={host} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}/>{error && <div role="status" className="ransom-map-error">Interactive map tiles are unavailable right now. Country totals and the reported-claims list are still available below.</div>}</div>;
}
