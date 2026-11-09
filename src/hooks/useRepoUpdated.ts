import { useEffect, useState } from 'react';

type Dates = Record<string, string>;
const cacheKey = 'repo-dates';
const account = 'Samarth-Sharma21';
let pending: Promise<Dates> | null = null;

function readCache(): Dates | null {
  try { return JSON.parse(sessionStorage.getItem(cacheKey) ?? 'null') as Dates | null; } catch { return null; }
}

function load(): Promise<Dates> {
  const cached = readCache();
  if (cached) return Promise.resolve(cached);
  pending ??= fetch(`https://api.github.com/users/${account}/repos?per_page=100`)
    .then(response => response.ok ? response.json() as Promise<Array<{ name: string; pushed_at: string }>> : [])
    .then(repos => {
      const dates = Object.fromEntries(repos.map(repo => [repo.name.toLowerCase(), repo.pushed_at]));
      try { if (repos.length) sessionStorage.setItem(cacheKey, JSON.stringify(dates)); } catch { /* Private browsing can refuse storage. */ }
      return dates;
    })
    .catch(() => ({}));
  return pending;
}

const units: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600]];
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function describe(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const [unit, size] = units.find(([, length]) => Math.abs(seconds) >= length) ?? ['hour', 3600];
  return relative.format(Math.round(seconds / size), unit);
}

export default function useRepoUpdated(githubUrl: string) {
  const name = githubUrl.split('/').pop()?.toLowerCase() ?? '';
  const [iso, setIso] = useState<string | undefined>(() => readCache()?.[name]);
  useEffect(() => {
    let active = true;
    void load().then(dates => { if (active) setIso(dates[name]); });
    return () => { active = false; };
  }, [name]);
  return iso ? describe(iso) : null;
}
