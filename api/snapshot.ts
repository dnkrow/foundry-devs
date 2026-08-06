/**
 * Instantané public du banc d'essai de trading.
 *
 * POST — réservé au bot, authentifié par `Authorization: Bearer <token>`.
 *        Le corps est *re-filtré ici* avant stockage : la liste blanche de
 *        l'exportateur Python n'est pas une garantie côté serveur. Si le bot
 *        se met un jour à pousser un champ supplémentaire, il n'est pas
 *        publié — il est ignoré. Deuxième barrière, volontairement redondante.
 *
 * GET  — sert l'instantané stocké. Public, en lecture seule, même origine :
 *        la CSP du site est en `connect-src 'self'`, la page ne peut donc pas
 *        appeler un domaine de stockage directement.
 *
 * Sans `SNAPSHOT_TOKEN` configuré, le POST répond 503 : la route ne fait
 * jamais semblant d'accepter une publication.
 */

import { list, put } from '@vercel/blob';

const BLOB_PATH = 'trading-snapshot.json';

/** Nombre maximal d'agents et de points acceptés. Borne les abus. */
const MAX_AGENTS = 20;
const MAX_POINTS = 400;

type Agent = {
  label: string;
  return_pct: number;
  trades: number;
  win_rate_pct: number;
  max_drawdown_pct: number;
  curve: number[];
};

type Snapshot = {
  generated_at: string;
  /** Dernier signe de vie du bot. Distinct de l'heure de publication. */
  data_updated_at: string | null;
  paused: boolean;
  cycle: number | null;
  capital: number;
  total_pnl: number;
  total_return_pct: number;
  alpha_pct: number;
  since: string | null;
  until: string | null;
  mode: string;
  agent_count: number;
  agents: Agent[];
  benchmark: { label: string; return_pct: number; curve: number[] };
};

const json = (body: unknown, status: number, cache?: string): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(cache ? { 'Cache-Control': cache } : {}),
    },
  });

const str = (v: unknown, max = 60): string =>
  typeof v === 'string' ? v.slice(0, max) : '';

const num = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;

const curve = (v: unknown): number[] =>
  Array.isArray(v) ? v.slice(0, MAX_POINTS).map(num) : [];

/** Reconstruit l'objet champ par champ : rien d'inconnu ne traverse. */
function sanitize(raw: unknown): Snapshot | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const rawAgents = Array.isArray(r['agents']) ? r['agents'] : [];
  const agents: Agent[] = rawAgents.slice(0, MAX_AGENTS).map((a) => {
    const o = (typeof a === 'object' && a !== null ? a : {}) as Record<string, unknown>;
    return {
      label: str(o['label']),
      return_pct: num(o['return_pct']),
      trades: Math.max(0, Math.trunc(num(o['trades']))),
      win_rate_pct: num(o['win_rate_pct']),
      max_drawdown_pct: num(o['max_drawdown_pct']),
      curve: curve(o['curve']),
    };
  });

  if (agents.length === 0) return null;

  const b = (typeof r['benchmark'] === 'object' && r['benchmark'] !== null
    ? r['benchmark']
    : {}) as Record<string, unknown>;

  const since = str(r['since'], 10);
  const until = str(r['until'], 10);

  const heartbeat = str(r['data_updated_at'], 40);
  const cycle = r['cycle'];

  return {
    generated_at: str(r['generated_at'], 40) || new Date().toISOString(),
    data_updated_at: heartbeat || null,
    paused: r['paused'] === true,
    cycle: typeof cycle === 'number' && Number.isFinite(cycle) ? Math.trunc(cycle) : null,
    capital: Math.max(0, Math.trunc(num(r['capital']))),
    total_pnl: Math.trunc(num(r['total_pnl'])),
    total_return_pct: num(r['total_return_pct']),
    alpha_pct: num(r['alpha_pct']),
    since: since || null,
    until: until || null,
    // Verrouillé : la page annonce une simulation, la donnée doit le confirmer.
    mode: str(r['mode'], 20) || 'paper',
    agent_count: agents.length,
    agents,
    benchmark: {
      label: str(b['label']) || 'Benchmark',
      return_pct: num(b['return_pct']),
      curve: curve(b['curve']),
    },
  };
}

export async function GET(): Promise<Response> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
    const blob = blobs[0];
    if (!blob) return json({ error: 'Aucun instantané publié.' }, 404);

    const upstream = await fetch(blob.url, { cache: 'no-store' });
    if (!upstream.ok) return json({ error: 'Instantané illisible.' }, 502);

    // Cache CDN court : la page interroge toutes les 30 s, l'essentiel des
    // requêtes est donc servi par le bord sans réveiller la fonction. Sans
    // ça, chaque visiteur qui laisse l'onglet ouvert coûterait une
    // invocation toutes les 30 secondes.
    return json(await upstream.json(), 200, 'public, s-maxage=15, stale-while-revalidate=300');
  } catch {
    return json({ error: 'Stockage indisponible.' }, 503);
  }
}

export async function POST(request: Request): Promise<Response> {
  const token = process.env['SNAPSHOT_TOKEN'];
  if (!token) return json({ error: 'Publication non configurée.' }, 503);

  const auth = request.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${token}`) return json({ error: 'Non autorisé.' }, 401);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'JSON invalide.' }, 400);
  }

  const snapshot = sanitize(raw);
  if (!snapshot) return json({ error: 'Instantané vide ou malformé.' }, 422);

  try {
    await put(BLOB_PATH, JSON.stringify(snapshot), {
      access: 'public',
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch {
    return json({ error: 'Écriture impossible.' }, 502);
  }

  return json({ ok: true, agents: snapshot.agent_count }, 200);
}
