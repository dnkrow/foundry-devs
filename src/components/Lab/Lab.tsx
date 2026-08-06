import { useEffect, useRef, useState } from 'react';
import { D, EASE, gsap, useAnimation } from '../../lib/motion';
import styles from './Lab.module.css';

/**
 * Banc d'essai public : neuf agents d'IA gèrent chacun un portefeuille simulé.
 *
 * Le contenu explicatif est prérendu — c'est lui qui porte le référencement.
 * Les chiffres, eux, arrivent de `/api/snapshot` après montage : le serveur
 * n'a pas de données au build, donc le rendu initial est identique côté
 * serveur et côté client, et l'hydratation reste propre.
 *
 * Ce composant ne connaît que ce que l'instantané contient. Aucune position,
 * aucun ticker, aucun raisonnement d'agent ne transite par ici — c'est
 * l'exportateur, côté bot, qui décide de ce qui existe publiquement.
 */

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
  since: string | null;
  until: string | null;
  mode: string;
  agents: Agent[];
  benchmark: { label: string; return_pct: number; curve: number[] };
};

const pct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)} %`;

/**
 * Âge de l'instantané, en clair.
 *
 * Le bot tourne sur une machine qui peut être éteinte. Une page qui aurait
 * l'air vivante en affichant des chiffres vieux de trois jours serait plus
 * trompeuse qu'une page qui admet son retard : au-delà d'une heure et demie,
 * on le dit.
 */
const freshness = (iso: string, nowMs: number) => {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;

  const minutes = Math.max(0, Math.floor((nowMs - t) / 60_000));
  const stale = minutes > 90;

  if (minutes < 1) return { label: 'à l’instant', stale };
  if (minutes < 60) return { label: `il y a ${minutes} min`, stale };

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { label: `il y a ${hours} h`, stale };

  const days = Math.floor(hours / 24);
  return { label: `il y a ${days} j`, stale };
};

const frDate = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

/** Trace une courbe normalisée dans un viewBox 0 0 100 100. */
function toPath(curve: number[], min: number, max: number): string {
  if (curve.length < 2) return '';
  const span = max - min || 1;
  return curve
    .map((v, i) => {
      const x = (i / (curve.length - 1)) * 100;
      const y = 100 - ((v - min) / span) * 100;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function Lab() {
  const root = useRef<HTMLElement | null>(null);
  const [data, setData] = useState<Snapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useAnimation(root, () => {
    gsap.from('[data-lab-line]', {
      yPercent: 132,
      duration: D.macro,
      stagger: 0.09,
      ease: EASE,
    });
    gsap.from('[data-lab-fade]', {
      yPercent: 40,
      duration: D.mid,
      stagger: 0.06,
      ease: EASE,
      scrollTrigger: { trigger: '[data-lab-body]', start: 'top 82%' },
    });
  });

  /**
   * Interrogation régulière de l'instantané.
   *
   * Pas de connexion permanente : les données ne bougent qu'au rythme des
   * cycles du bot, un flux ouvert en continu coûterait des invocations sans
   * rien apporter. Le cache CDN court fait que la plupart de ces requêtes
   * n'atteignent jamais la fonction.
   *
   * La boucle s'arrête quand l'onglet passe en arrière-plan, et rattrape
   * immédiatement au retour : inutile d'interroger une page que personne
   * ne regarde.
   */
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const load = () => {
      fetch('/api/snapshot')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((json: Snapshot) => {
          if (cancelled) return;
          setData(json);
          setFailed(false);
        })
        .catch(() => {
          // `failed` ne sert qu'à choisir le message tant qu'aucun chiffre
          // n'est arrivé : `data` n'est jamais remis à null, donc un échec
          // ponctuel n'efface pas un tableau déjà affiché.
          if (!cancelled) setFailed(true);
        });
    };

    const schedule = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(load, 30_000);
    };

    const onVisibility = () => {
      if (!document.hidden) load();
      schedule();
    };

    load();
    schedule();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Horloge de l'indicateur de fraîcheur. Dix secondes suffisent : afficher
  // « il y a 3 s » à la seconde près ferait re-rendre la page pour rien.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(tick);
  }, []);

  const all = data ? [...data.agents.map((a) => a.curve), data.benchmark.curve] : [];
  const flat = all.flat();
  const min = flat.length ? Math.min(...flat) : 0;
  const max = flat.length ? Math.max(...flat) : 0;

  /** Agents et indice classés ensemble, du meilleur au moins bon. */
  const ranked: (Partial<Agent> & { label: string; return_pct: number; bench: boolean })[] =
    data
      ? [
          ...data.agents.map((a) => ({ ...a, bench: false })),
          {
            label: data.benchmark.label,
            return_pct: data.benchmark.return_pct,
            bench: true,
          },
        ].sort((x, y) => y.return_pct - x.return_pct)
      : [];

  return (
    <section id="labo" ref={root} className={styles.section} aria-labelledby="labo-titre">
      <div className={`shell ${styles.grid}`}>
        <header className={styles.head}>
          <p className="section-label">Laboratoire</p>
          <h1 id="labo-titre" className={styles.title}>
            <span className="line-mask">
              <span data-lab-line>Neuf intelligences</span>
            </span>
            <span className="line-mask">
              <span data-lab-line>
                artificielles <em className="accent-word">s’affrontent</em>.
              </span>
            </span>
          </h1>
          <p className={styles.lead}>
            Chaque agent reçoit le même capital de départ, les mêmes données de
            marché et la même contrainte de risque. Aucun ne connaît les
            décisions des autres. Ce qui les distingue, c’est le modèle de
            langage qui raisonne derrière — et la façon dont il encaisse le
            doute.
          </p>
        </header>

        <div className={styles.body} data-lab-body>
          <div className={styles.notice} data-lab-fade>
            <p>
              <strong>Simulation.</strong> Les ordres passent sur un compte de
              démonstration, avec de l’argent fictif. Rien de ce qui est affiché
              ici n’est un conseil d’investissement, et des résultats passés ne
              présagent d’aucun résultat futur.
            </p>
          </div>

          <div className={styles.prose} data-lab-fade>
            <h2>Pourquoi nous l’avons construit</h2>
            <p>
              Un marché est un banc d’essai honnête : il ne s’intéresse pas à
              l’élégance du code, seulement à la justesse des décisions. En
              faisant tourner plusieurs modèles côte à côte sur le même flux,
              on obtient une mesure de ce que chacun sait vraiment faire quand
              l’information est incomplète et le temps compté.
            </p>
            <p>
              C’est le genre de système que nous construisons pour nos clients :
              plusieurs modèles orchestrés, une mémoire partagée, des garde-fous
              qui coupent avant la casse, et des mesures qui disent la vérité
              plutôt que de flatter. Le sujet est le trading, la mécanique est
              transposable à n’importe quelle décision automatisée.
            </p>

            <h2>Comment ça fonctionne</h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepIndex}>01</span>
                <p>
                  Les données de marché sont collectées en continu, puis
                  normalisées en un état commun à tous les agents.
                </p>
              </li>
              <li>
                <span className={styles.stepIndex}>02</span>
                <p>
                  Chaque agent raisonne sur cet état et propose une décision.
                  Une couche de contradiction met la thèse à l’épreuve avant
                  qu’elle ne devienne un ordre.
                </p>
              </li>
              <li>
                <span className={styles.stepIndex}>03</span>
                <p>
                  Un gestionnaire de risque dimensionne, plafonne, et coupe.
                  Chaque portefeuille est ensuite mesuré contre l’indice de
                  référence.
                </p>
              </li>
            </ol>
          </div>

          <div className={styles.results} data-lab-fade>
            <h2 className={styles.resultsTitle}>Résultats</h2>

            {data ? (
              <>
                {(() => {
                  const f = freshness(data.generated_at, now);
                  return f ? (
                    <p
                      className={styles.freshness}
                      data-stale={f.stale}
                      role="status"
                      aria-live="polite"
                    >
                      <span className={styles.dot} aria-hidden="true" />
                      {f.stale
                        ? `Banc d’essai en pause — dernière mise à jour ${f.label}.`
                        : `Mis à jour ${f.label}.`}
                    </p>
                  ) : null;
                })()}

                <p className={styles.period}>
                  Rendements depuis le lancement, du {frDate(data.since)} au{' '}
                  {frDate(data.until)}. Tous les portefeuilles partent du même
                  capital, ramené à une base 100 — l’indice de référence
                  compris, afin que la comparaison porte sur la même échelle.
                </p>

                <figure className={styles.chart}>
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className={styles.svg}
                    role="img"
                    aria-label={`Évolution comparée de ${data.agents.length} agents et de l’indice ${data.benchmark.label}.`}
                  >
                    {data.agents.map((a) => (
                      <path
                        key={a.label}
                        d={toPath(a.curve, min, max)}
                        className={styles.lineAgent}
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                    <path
                      d={toPath(data.benchmark.curve, min, max)}
                      className={styles.lineBench}
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <figcaption className={styles.caption}>
                    Trait vert : {data.benchmark.label}. Traits fins : les
                    agents. La courbe ne couvre que la période récente ; les
                    rendements du tableau, eux, courent depuis le lancement.
                  </figcaption>
                </figure>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <caption className="sr-only">
                      Performance de chaque agent sur la période, comparée à
                      l’indice de référence.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Agent</th>
                        <th scope="col">Rendement</th>
                        <th scope="col">Trades</th>
                        <th scope="col">Réussite</th>
                        <th scope="col">Repli max.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* L'indice est intercalé à son rang, pas relégué en bas :
                          sinon il passe pour le moins performant et l'on ne voit
                          plus quels agents lui sont inférieurs. */}
                      {ranked.map((row) =>
                        row.bench ? (
                          <tr key="benchmark" className={styles.benchRow}>
                            <th scope="row">{row.label}</th>
                            <td data-positive={row.return_pct > 0}>
                              {pct(row.return_pct)}
                            </td>
                            <td colSpan={3}>Indice de référence</td>
                          </tr>
                        ) : (
                          <tr key={row.label}>
                            <th scope="row">{row.label}</th>
                            <td data-positive={row.return_pct > 0}>
                              {pct(row.return_pct)}
                            </td>
                            <td>{row.trades}</td>
                            <td>{row.win_rate_pct?.toFixed(1)} %</td>
                            <td>{row.max_drawdown_pct?.toFixed(2)} %</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className={styles.pending} role="status" aria-live="polite">
                {failed
                  ? 'Les résultats ne sont pas accessibles pour le moment.'
                  : 'Chargement des résultats…'}
              </p>
            )}
          </div>

          <aside className={styles.cta} data-lab-fade>
            <p>
              Vous avez un problème de décision automatisée à traiter&nbsp;?
              C’est exactement ce que nous faisons.
            </p>
            <a className={styles.ctaLink} href="/#contact">
              Nous en parler
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
